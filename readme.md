# koishi-plugin-nazrin-core

[![npm](https://img.shields.io/npm/v/koishi-plugin-nazrin-core?style=flat-square)](https://www.npmjs.com/package/koishi-plugin-nazrin-core)

媒体聚合搜索核心！！

# 快速入门

附属插件必须包含：

1. 搜索资源，输入关键词后，给出关键词的搜索结果
2. 解析资源直链

```javascript


import { Context } from'koishi'


import { } from'koishi-plugin-nazrin-core'//添加此行

export const using = ['nazrin'] // 添加此行


export const name = 'example'


export function apply(ctx: Context) {

  const thisPlatform = 'bilibili'// 定义当前扩展的平台名称，比如bilibili
  ctx.nazrin.video.push(thisPlatform) // 将此平台添加到video视频源列表
  ctx.nazrin.short_video.push(thisPlatform) // 将此平台添加到short_video短视频源列表
  ctx.nazrin.acg.push(thisPlatform) // 将此平台添加到acg番剧源列表
  ctx.nazrin.movie.push(thisPlatform) // 将此平台添加到movie电影源列表
  ctx.nazrin.music.push(thisPlatform) // 将此平台添加到music音乐源列表

  // 根据关键词返回搜索结果
  // 如果收到音乐搜索请求
  ctx.on('nazrin/music', (ctx, keyword) => {
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
        author: '作品名字',
        url: '资源所在网页地址',
        platform: thisPlatform, // 当前平台
        err: false, // 是否错误,
	data: {} // 任意数据
      }
    ]
    ctx.emit('nazrin/search_over', findList) // 完成后调用此条，提交搜索结果给用户
  })

  ctx.on('nazrin/parse_music', (ctx, platform, url, data?)=>{
    if (platform !== thisPlatform) { return } // 判断是否为本平台的解析请求
    // .... 解析此链接
  
    // 调用此条提交解析结果
    ctx.emit('nazrin/parse_over',
      '资源直链',
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
ctx.on('nazrin/music', keyword=>{}) // 如果接受到音乐搜索请求
ctx.on('nazrin/video', keyword=>{}) // 如果接收到长视频搜索请求
ctx.on('nazrin/short_video', keyword=>{}) // 如果接收到短视频搜索请求
ctx.on('nazrin/acg', keyword=>{}) // 如果接收到番剧搜索请求
ctx.on('nazrin/movie', keyword=>{}) // 如果接收到movie搜索请求

// 接收到请求搜索请求后，会触发keyword回调函数，keyword为关键词



解析请求：
ctx.on('nazrin/parse_music', (platform, url)=>{})
ctx.on('nazrin/parse_video', (platform, url)=>{})
ctx.on('nazrin/parse_short_video', (platform, url)=>{})
ctx.on('nazrin/parse_acg', (platform, url)=>{})
ctx.on('nazrin/parse_movie', (platform, url)=>{})

// platform是平台名称，url是需要解析的页面地址
*/

```
