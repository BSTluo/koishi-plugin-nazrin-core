import { Context, Logger, Schema } from 'koishi'
import { } from 'koishi-plugin-puppeteer'
import { nazrin } from './service'

export * from './service'

export const name = 'nazrin-core'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

export const using = ['nazrin']

const logger = new Logger('IIROSE-BOT')

export function apply(ctx: Context) {
  ctx.plugin(nazrin)

  ctx.command('nazrin')
    .option('music', '<keyword:string> 歌曲名称')
    .option('video', '<keyword:string> 长视频名称')
    .option('short_video', '<keyword:string> 短视频关键词')
    .option('acg', '<keyword:string> 番剧关键词')
    .option('movie', '<keyword:string> 电影关键词')
    .action((_) => {
      const type = Object.keys(_.options)[0]

      let whichPlatform = ctx.nazrin[type]
      let overDataList = []

      ctx.on('nazrin/search_over', async data => {
        const platformIndex = whichPlatform.indexOf(data[0].platform)
        if (platformIndex < 0) { return logger.warn(` [${data[0].platform}] 平台未注册`) }
        whichPlatform.splice(platformIndex, 1)

        if (data[0].err) { return logger.warn(` [${data[0].platform}] 平台无结果`) }

        overDataList.concat(data)

        if (whichPlatform.length <= 0) {
          // 返回结果
          const page = await ctx.puppeteer.page()
          await page.setContent('<h1>111222</h1>')
          const png = await page.screenshot({
            encoding: 'base64',
            fullPage: true
          })
          whichPlatform = ctx.nazrin[type]

          _.session.send(`<image url="data:image/png;base64,${png}"/>`)
          _.session.send('请输入序号来选择具体的点播目标')
          const index = await _.session.prompt()
          if (!index) { overDataList = []; return _.session.send('输入超时。') }
          const goal: search_data = overDataList[Number(index) - 1]
          ctx.emit('nazrin/parse', goal.platform, goal.url)
          ctx.once('nazrin/parse_over', (url, name: string = "未知作品名", author: string = "未知作者", cover: string = "未知封面图片直链", duration: number = 300, bitRate: number = 360, color: string = "66ccff") => {
            if (type === 'music') { return _.session.send(`<audio url="${url}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`) }
            return _.session.send(`<video url="${url}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`)
          })
        } else {
          return
        }
      })

      switch (type) {
        case 'music':
          ctx.emit('nazrin/music', _.options.music)
          break;
        case 'video':
          ctx.emit('nazrin/video', _.options.video)
          break;
        case 'short_video':
          ctx.emit('nazrin/short_video', _.options.short_video)
          break;
        case 'acg':
          ctx.emit('nazrin/acg', _.options.acg)
          break;
        case 'movie':
          ctx.emit('nazrin/movie', _.options.movie)
          break;
        default:
          return '暂无此类型的聚合搜索方式'
      }
    })
}

export interface search_data {
  name?: string
  author?: string
  cover?: string
  url?: string
  platform?: string
  err?: boolean
}

declare module '@satorijs/core' {
  interface NazrinEvents {
    'nazrin/music'(keyword: string): void
    'nazrin/video'(keyword: string): void
    'nazrin/short_video'(keyword: string): void
    'nazrin/acg'(keyword: string): void
    'nazrin/movie'(keyword: string): void
    'nazrin/search_over'(data: search_data[]): void
    'nazrin/parse'(platform: string, url: string): void
    'nazrin/parse_over'(url: string, name?: string, author?: string, cover?: string, duration?: number, bitRate?: number, color?: string): void
  }

  interface Events extends NazrinEvents { }
}
