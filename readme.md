

import { Context } from'koishi'


import { } from'koishi-plugin-nazrin-core'//添加此行

export const using = ['nazrin'] // 添加此行


export const name = 'example'


export function apply(ctx: Context) {

  const thisPlatform = 'bilibili'// 定义当前扩展的平台名称，比如bilibili
  ctx.nazrin.video.push(thisPlatform) // 将此插件添加到video视频源列表
  ctx.nazrin.short_video.push(thisPlatform) // 将此插件添加到short_video短视频源列表
  ctx.nazrin.acg.push(thisPlatform) // 将此插件添加到acg番剧源列表
  ctx.nazrin.movie.push(thisPlatform) // 将此插件添加到movie电影源列表
  ctx.nazrin.music.push(thisPlatform) // 将此插件添加到music音乐源列表

  // 根据关键词返回搜索结果
  // 如果收到音乐搜索请求
  ctx.on('nazrin/music', async (ctx, keyword) => {
  // keyword为关键词

    // findList为搜索结果，当当前平台未搜索到结果需要如下格式：
    const findList = [
      {
        err: true, // 是否错误
        platform: thisPlatform // 当前平台
      }
    ]

    // 当当前平台成功搜索到结果需要如下格式：
    const findList = [
      {
        name: '作品名字',
        author: '作者名字',
        url: '资源所在网页地址',
        platform: thisPlatform, // 当前平台
        err: false, // 是否错误,
          data: any // 任意数据
      }
    ]
    ctx.emit('nazrin/search_over', findList) // 完成后调用此条，提交搜索结果给用户
  })

  ctx.on('nazrin/parse_music', async (ctx, platform, url, data?)=>{
    if (platform !== thisPlatform) { return } // 判断是否为本平台的解析请求
    // .... 解析此链接
  
    // 调用此条提交解析结果
    ctx.emit('nazrin/parse_over',
      '资源直链',// 此项可以是url字符串数组
      '?资源名字',
      '?资源作者',
      '?资源封面',
      300 /* ?资源时长，单位s */,
      720 /* ?比特率，单位kbps */,
      '?卡片颜色')
    }) // 带?是可选项
}

/*
搜索请求：
ctx.on('nazrin/music', async (ctx:Context, keyword:string)=>{}) // 如果接受到音乐搜索请求
ctx.on('nazrin/video', async (ctx:Context, keyword:string)=>{}) // 如果接收到长视频搜索请求
ctx.on('nazrin/short_video', async (ctx:Context, keyword:string)=>{}) // 如果接收到短视频搜索请求
ctx.on('nazrin/acg', async (ctx:Context, keyword:string)=>{}) // 如果接收到番剧搜索请求
ctx.on('nazrin/movie', async (ctx:Context, keyword:string)=>{}) // 如果接收到电影搜索请求
ctx.on('nazrin/picture', async (ctx:Context, keyword:string)=>{}) // 如果接收到图片搜索请求
ctx.on('nazrin/comics', async (ctx:Context, keyword:string)=>{}) // 如果接收到漫画搜索请求

// 合集搜索请求，相比于普通的搜索请求，增加了一项episode参数，此参数代表选择此集合中的第几个
ctx.on('nazrin/episode_music', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接受到音乐合集（歌单）搜索请求
ctx.on('nazrin/episode_video', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到长视频合集（系列视频）搜索请求
ctx.on('nazrin/episode_short_video', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到短视频合集（系列视频）搜索请求
ctx.on('nazrin/episode_acg', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到番剧合集（系列视频）搜索请求
ctx.on('nazrin/episode_movie', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到电影合集（系列电影）搜索请求
ctx.on('nazrin/episode_picture', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到图片合集（图包）搜索请求
ctx.on('nazrin/episode_comics', async (ctx:Context, keyword:string, episode: number | 'all')=>{}) // 如果接收到漫画（但是指定章节）搜索请求

// 接收到请求搜索请求后，会触发keyword回调函数，keyword为关键词

解析请求：
ctx.on('nazrin/parse_music', async (ctx:Context, platform: string, url: string, data: any) =>{})
ctx.on('nazrin/parse_video', async (ctx:Context, platform: string, url: string, data: any) =>{})
ctx.on('nazrin/parse_short_video', async (ctx:Context, platform: string, url: string, data: any) =>{})
ctx.on('nazrin/parse_acg', async (ctx:Context, platform: string, url: string, data: any) =>{})
ctx.on('nazrin/parse_movie', async (ctx:Context, platform: string, url: string, data: any) =>{})

// platform是平台名称，url是需要解析的页面地址
*/
