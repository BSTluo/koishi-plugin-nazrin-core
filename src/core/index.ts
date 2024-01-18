import { Context, Logger, Session } from 'koishi';
import { } from 'koishi-plugin-puppeteer';
import { nazrin } from '../service';
import { pageMake } from '../pageHtmlMake';
import { search_data, SearchType } from './interface';
import { Config, usage } from '../config';

export const name = 'nazrin-core';


export const inject = ['puppeteer'];

const logger = new Logger('Nazrin');

export function apply(ctx: Context, config: Config)
{
  ctx.plugin(nazrin);

  const selectList = async (overDataList: search_data[], session: Session<never, never, Context>) =>
  {
    let index = '';
    let i: number;
    for (i = 0; i < overDataList.length;)
    {
      const nowList = overDataList.slice(i, ((i + 10) > overDataList.length) ? overDataList.length : i + 10);

      if (config.textOutput)
      {
        // 文字显示
        let resultText = '';
        nowList.forEach((item: search_data, index) =>
        {
          resultText = resultText + `${index + 1}. ${item.platform} —— ${item.author}\n${item.name}` + '\n';
        });

        await session.send(resultText);
      } else
      {
        // 图片列表显示
        const page = await ctx.puppeteer.page();
        await page.setContent(pageMake(nowList));
        let test = await page.$('.box');
        const png = await test?.screenshot({
          encoding: 'base64'
        }) || null;
        await page.close();
        await session.send(`<img src="data:image/png;base64,${png}"/>`);
      }

      session.send('<p>请输入序号来选择具体的点播目标</p> <br> <p>或输入"下一页"与"上一页"进行翻页</p>');
      index = await session?.prompt();

      if (!index) { overDataList = []; session?.send('输入超时。'); return -1; }

      if (index == "上一页")
      {
        if (i - 10 < 0)
        {
          session.send('无上一页了！');
          return -1;
        } else
        {
          i = i - 10;
        }

      } else if (index == "下一页")
      {
        if (i + 10 > overDataList.length)
        {
          session.send('无下一页了！');
          return -1;
        } else
        {
          i = i + 10;
        }
      } else if (Number(index) <= 0 || Number(index) > nowList.length || !/^[0-9]+$/.test(index))
      {
        overDataList = [];
        session?.send('输入的文本不正确');
        return -1;
      } else
      {
        break;
      }

    }

    return Number(index) + i;
  };


  ctx.inject(['nazrin'], (ctx: Context) =>
  {
    ctx.command('nazrin', '聚合搜索核心！！')
      .option('music', '-m <keyword:text> 歌曲名称')
      .option('video', '-v <keyword:text> 长视频名称')
      .option('short_video', '-sv <keyword:text> 短视频关键词')
      .option('acg', '-a <keyword:text> 番剧关键词')
      .option('film', '-f <keyword:text> 电影关键词')
      .option('picture', '-p <keyword:text> 图片关键词')
      .option('comics', '-c <keyword:text> 漫画关键词')
      .option('list', '-l 搜索合集')
      .usage(usage)
      .action(async (_) =>
      {
        const over = ctx.on('nazrin/search_over', async data =>
        {
          const platformIndex = whichPlatform.indexOf(data[0].platform);
          if (platformIndex < 0) { logger.warn(` [${data[0].platform}] 平台未注册`); return over(); }
          whichPlatform.splice(platformIndex, 1);

          if (data[0].err) { logger.warn(` [${data[0].platform}] 平台无结果`); return over(); }

          overDataList = overDataList.concat(data);
          for (let item of overDataList)
          {
            if (item.name === null || item.name === undefined) { return ` [${data[0].platform}] 平台搜索结果含有null`; }
            if (item.author === null || item.author === undefined) { return ` [${data[0].platform}] 平台搜索结果含有null`; }
          }

          if (whichPlatform.length <= 0)
          {
            // 返回结果

            const index = await selectList(overDataList, _.session);
            if (index == -1) { return over(); }

            _.session?.send('好哦！正在搜索对应的资源！可能会有点慢...');

            const goal: search_data = overDataList[Number(index) - 1];

            const searchType: SearchType = type;

            if (goal.hasOwnProperty('data'))
            {
              ctx.emit(`nazrin/parse_${searchType}`, ctx, goal.platform, goal.url, goal.data);
            } else
            {
              ctx.emit(`nazrin/parse_${searchType}`, ctx, goal.platform, goal.url);
            }

            ctx.once('nazrin/parse_over', (url, name: string = "未知作品名", author: string = "未知作者", cover: string = "未知封面图片直链", duration: number = 300, bitRate: number = 360, color: string = "66ccff") =>
            {
              over();
              let urlList = [];
              if (!Array.isArray(url))
              {
                urlList = [url];
              } else
              {
                urlList = url;
              }

              urlList.forEach(v =>
              {
                if (searchType === 'music')
                {
                  return _.session?.send(`<audio name="${name}" url="${v}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`);
                } else if (searchType === 'video' || searchType === 'short_video' || searchType === 'acg' || searchType === 'movie')
                {
                  return _.session?.send(`<video name="${name}" url="${v}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`);
                } else if (searchType === 'picture' || searchType === 'comics')
                {
                  return _.session?.send(`<img src="${v}"/>`);
                }
              });

            });
          } else
          {
            return;
          }
        });
        if (!await ctx.puppeteer)
        {
          _.session.send('检测到你的机器没有安装chrome，如果你安装chrome了但是还是出现这个提示，请前往puppeteer插件然后手动指定安装路径');
          return;
        }
        const keys = Object.keys(_.options);
        let type: SearchType | undefined;
        if (keys[0] in SearchType)
        {
          type = keys[0] as SearchType;
        } else
        {
          _.session?.send('你未输入正确的nazrin指令参数！');
          return;
        }
        
        let whichPlatform = ctx.nazrin[type].slice();
        let overDataList: search_data[] = [];
        _.session?.send('搜索中...');
        switch (type)
        {
          case 'music':
            ctx.emit('nazrin/music', ctx, _.options.music);
            break;
          case 'video':
            ctx.emit('nazrin/video', ctx, _.options.video);
            break;
          case 'short_video':
            ctx.emit('nazrin/short_video', ctx, _.options.short_video);
            break;
          case 'acg':
            ctx.emit('nazrin/acg', ctx, _.options.acg);
            break;
          case 'movie':
            ctx.emit('nazrin/movie', ctx, _.options.film);
            break;
          case 'picture':
            ctx.emit('nazrin/picture', ctx, _.options.picture);
            break;
          case 'comics':
            ctx.emit('nazrin/comics', ctx, _.options.comics);
            break;

          default:
            return '暂无此类型的聚合搜索方式';
        }
      });
  });
}