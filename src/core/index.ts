import { Context } from 'koishi';
import { } from 'koishi-plugin-puppeteer';
import { nazrin } from '../Service';
import { Config, usage } from '../Config';
import { Search } from '../Search';

export const name = 'nazrin-core';


export const inject = ['puppeteer'];


export function apply(ctx: Context, config: Config)
{
  ctx.plugin(nazrin);

  ctx.inject(['nazrin'], (ctx: Context) =>
  {
    ctx.command('nazrin', '聚合搜索核心！！')
      .option('music', '-m <keyword:string> 歌曲名称')
      .option('video', '-v <keyword:string> 长视频名称')
      .option('short_video', '-sv <keyword:string> 短视频关键词')
      .option('acg', '-a <keyword:string> 番剧关键词')
      .option('film', '-f <keyword:string> 电影关键词')
      .option('picture', '-p <keyword:string> 图片关键词')
      .option('comics', '-c <keyword:string> 漫画关键词')
      .option('episode', '-e <episode:string> 搜索合集')
      .usage(usage)
      .action(async (_) =>
      {
        try
        {
          if (!await ctx.puppeteer)
          {
            _.session.send('检测到你的机器没有安装chrome，如果你安装chrome了但是还是出现这个提示，请前往puppeteer插件然后手动指定安装路径');
            return;
          }
          const search = new Search(ctx, _, config);
          search.init();
        } catch (error)
        {
          ctx.logger('Nazrin').warn(error);
          _.session.send('发生了一个错误，请到控制台日志查看详细信息');
        }

      });
  });
}