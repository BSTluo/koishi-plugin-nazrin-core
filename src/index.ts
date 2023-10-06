import { Context, Logger, Schema } from 'koishi'

export const name = 'nazrin-core'

export interface Config { }

export const Config: Schema<Config> = Schema.object({})

declare module 'koishi' {
  interface Context {
    nazrin: nazrin
  }
}

export interface nazrin {
  music: string[]
  video: string[]
  short_video: string[]
  acg: string[]
  movie: string[]
}

export function apply(ctx: Context) {
  if (!('nazrin' in ctx)) { Context.service('nazrin') }
  ctx.nazrin = {
    music: [],
    video: [],
    short_video: [],
    acg: [],
    movie: []
  }

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

      ctx.on('nazrin/search_over', data => {
        const platformIndex = whichPlatform.indexOf(data[0].platform)
        if (platformIndex < 0) { return 'error' }
        whichPlatform.splice(platformIndex, 1)

        if (data[0].err) { return }

        overDataList.concat(data)

        if (whichPlatform.length <= 0) {
          _.session.send('okkk')
          whichPlatform = ctx.nazrin[type]
        }
        return
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


declare module '@satorijs/core' {
  interface search_data {
    name?: string
    author?: string
    avatar?: string
    url?: string
    platform?: string,
    err?: boolean
  }

  interface NazrinEvents {
    'nazrin/music'(keyword: string): void
    'nazrin/video'(keyword: string): void
    'nazrin/short_video'(keyword: string): void
    'nazrin/acg'(keyword: string): void
    'nazrin/movie'(keyword: string): void
    'nazrin/search_over'(data: search_data[]): void
  }

  interface Events extends NazrinEvents { }
}

