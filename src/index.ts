import { Context, Logger, Schema } from 'koishi'
import { } from 'koishi-plugin-puppeteer'
import { nazrin } from './service'
import { pageMake } from './pageHtmlMake'

export * from './service'

export const name = 'nazrin-core'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

const logger = new Logger('Nazrin')

export function apply(ctx: Context) {
  ctx.plugin(nazrin)

  ctx.command('nazrin', '聚合搜索核心！！')
    .option('music', '<keyword:string> 歌曲名称')
    .option('video', '<keyword:string> 长视频名称')
    .option('short_video', '<keyword:string> 短视频关键词')
    .option('acg', '<keyword:string> 番剧关键词')
    .option('movie', '<keyword:string> 电影关键词')
    .action((_) => {
      const type: any = Object.keys(_.options)[0]
      let whichPlatform = ctx.nazrin[type].slice()
      let overDataList: any[] = []
      _.session?.send('搜索中...')
      const over = ctx.on('nazrin/search_over', async data => {
        const platformIndex = whichPlatform.indexOf(data[0].platform)
        if (platformIndex < 0) { logger.warn(` [${data[0].platform}] 平台未注册`); return over() }
        whichPlatform.splice(platformIndex, 1)

        if (data[0].err) { logger.warn(` [${data[0].platform}] 平台无结果`); return over() }

        overDataList = overDataList.concat(data)

        if (whichPlatform.length <= 0) {
          // 返回结果
          const page = await ctx.puppeteer.page()

          await page.setContent(pageMake(overDataList))
          let test = await page.$('.box')
          const png = await test?.screenshot({
            encoding: 'base64'
          }) || null

          await _.session?.send(`<image url="data:image/png;base64,${png}"/>`)
          _.session?.send('请输入序号来选择具体的点播目标')
          const index = await _.session?.prompt()
          if (!index) { overDataList = []; _.session?.send('输入超时。'); return over() }
          if (Number(index) <= 0 || Number(index) > overDataList.length || !/[^[0-9]+$]/.test(index)) { overDataList = []; _.session?.send('输入的文本不正确'); return over() }

          const goal: search_data = overDataList[Number(index) - 1]

          const searchType: "music" | "video" | "short_video" | "acg" | "movie" = type

          if (goal.hasOwnProperty('data')) {
            ctx.emit(`nazrin/parse_${searchType}`, ctx, goal.platform, goal.url, goal.data)
          } else {
            ctx.emit(`nazrin/parse_${searchType}`, ctx, goal.platform, goal.url)
          }
          ctx.once('nazrin/parse_over', (url, name: string = "未知作品名", author: string = "未知作者", cover: string = "未知封面图片直链", duration: number = 300, bitRate: number = 360, color: string = "66ccff") => {
            over()
            if (searchType === 'music') {
              return _.session?.send(`<audio name="${name}" url="${url}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`)
            } else {
              return _.session?.send(`<video name="${name}" url="${url}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`)
            }
          })
        } else {
          return
        }
      })
      switch (type) {
        case 'music':
          ctx.emit('nazrin/music', ctx, _.options.music)
          break;
        case 'video':
          ctx.emit('nazrin/video', ctx, _.options.video)
          break;
        case 'short_video':
          ctx.emit('nazrin/short_video', ctx, _.options.short_video)
          break;
        case 'acg':
          ctx.emit('nazrin/acg', ctx, _.options.acg)
          break;
        case 'movie':
          ctx.emit('nazrin/movie', ctx, _.options.movie)
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
  data?: any
}

declare module '@satorijs/core' {
  interface NazrinEvents {
    'nazrin/music'(ctx: Context, keyword: string): void
    'nazrin/video'(ctx: Context, keyword: string): void
    'nazrin/short_video'(ctx: Context, keyword: string): void
    'nazrin/acg'(ctx: Context, keyword: string): void
    'nazrin/movie'(ctx: Context, keyword: string): void

    'nazrin/search_over'(data: search_data[]): void

    'nazrin/parse_music'(ctx: Context, platform: string, url: string, data?: any): void
    'nazrin/parse_video'(ctx: Context, platform: string, url: string, data?: any): void
    'nazrin/parse_short_video'(ctx: Context, platform: string, url: string, data?: any): void
    'nazrin/parse_acg'(ctx: Context, platform: string, url: string, data?: any): void
    'nazrin/parse_movie'(ctx: Context, platform: string, url: string, data?: any): void

    'nazrin/parse_over'(url: string, name?: string, author?: string, cover?: string, duration?: number, bitRate?: number, color?: string): void
  }

  interface Events extends NazrinEvents { }
}

// 增加字数限制
