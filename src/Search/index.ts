import { Argv, Context, Events, Extend, Logger, Session } from "koishi";
import { SearchType, search_data } from "../Core/interface";
import { Config } from "../Config";
import { MakeImage } from "../MakeImage";

export class Search
{
  private ctx: Context;
  private _: Argv<never, never, string[], Extend<Extend<Extend<Extend<Extend<Extend<Extend<Extend<object, "music", string>, "video", string>, "short_video", string>, "acg", string>, "film", string>, "picture", string>, "comics", string>, "episode", string>>;
  private session: Session<never, never, Context>;
  private config: Config;
  logger = new Logger('Nazrin');


  init()
  {
    const type = this.processSearchType();
    if (!type) return;
    this.searchOver(type);
  }

  constructor(ctx: Context, _, config: Config)
  {
    this.ctx = ctx;
    this._ = _;
    this.session = this._.session;
    this.config = config;
  }

  /**
   * 处理不同的search方式
   * @returns 
   */
  private processSearchType()
  {
    const type = this.parseType();
    if (this._.options.hasOwnProperty('episode'))
    {
      let parseEpisode: number | 'all';

      if (this._.options.episode == '') parseEpisode = 'all';
      else if (!isNaN(Number(this._.options.episode))) parseEpisode = parseInt(this._.options.episode);
      this.ctx.emit(`nazrin/${type}`, this.ctx, this._.options.music, parseEpisode);
    } else
    {
      this.ctx.emit(`nazrin/${type}`, this.ctx, this._.options.music);
    }
    return type;
  }

  /**
   * 解析type
   * @returns 
   */
  private parseType(): SearchType | null
  {
    const keys = Object.keys(this._.options);
    let type: SearchType | undefined;
    if (keys[0] in SearchType)
    {
      type = keys[0] as SearchType;
      return type;
    } else if (keys[0] === 'episode')
    {
      this.session?.send('你输入了一个合集搜索指令，但是没有指定搜索类型！');
      return null;
    } else
    {
      this._.session?.send('你未输入正确的nazrin指令参数！');
      return null;
    }

  }

  /**
   * 选择媒体
   * @param overDataList 
   * @returns 
   */
  private async displayList(startIndex: number, overDataList: search_data[]): Promise<search_data[]>
  {
    const itemsPerPage: number = 10;
    const nowList = overDataList.slice(startIndex, startIndex + itemsPerPage);

    if (this.config.textOutput)
    {
      // 文字显示
      const resultText = nowList.map((item: search_data, i) =>
        `${startIndex + i + 1}. ${item.platform} —— ${item.author}\n${item.name}\n`
      ).join('');

      await this.session.send(resultText);
    } else
    {
      const makeImage = new MakeImage(this.ctx);
      const img = await makeImage.makeImage(nowList);
      await this.session.send(img);
    }

    return nowList;
  }

  private async displayPageInfo(startIndex: number, overDataList: search_data[]): Promise<void>
  {
    const itemsPerPage: number = 10;
    const currentPage = Math.floor(startIndex / itemsPerPage) + 1;
    const totalPages = Math.ceil(overDataList.length / itemsPerPage);

    this.session.send(`<p>请输入序号来选择具体的点播目标</p> <br> <p>或输入"下一页"与"上一页"进行翻页</p> <br> <p>当前页面为: ${currentPage}/${totalPages}</p>`);
  }

  private async handleUserInput(index: string, startIndex: number, overDataList: search_data[], nowList: search_data[]): Promise<number>
  {
    if (!index)
    {
      overDataList = [];
      this.session?.send('输入超时。');
      return -1;
    }

    if (index === "下一页" && startIndex + nowList.length >= overDataList.length)
    {
      this.session.send('无下一页了！');
      return -1;
    } else if (index === "上一页" && startIndex - nowList.length < 0)
    {
      this.session.send('无上一页了！');
      return -1;
    }

    // 只有在有下一页的情况下才进行数字和范围检查
    if (index !== "下一页" && index !== "上一页" && (!/^[0-9]+$/.test(index) || Number(index) <= 0 || Number(index) > nowList.length))
    {
      overDataList = [];
      this.session?.send('输入的文本不正确');
      return -1;
    } else
    {
      // 在这里执行 startIndex 的更新
      startIndex = (index === "上一页") ? startIndex - nowList.length : (index === "下一页") ? startIndex + nowList.length : startIndex;
    }

    return startIndex;
  }

  private async selectList(overDataList: search_data[]): Promise<number>
  {
    let index: string;
    let startIndex: number = 0;

    while (startIndex < overDataList.length)
    {
      const nowList = await this.displayList(startIndex, overDataList);
      await this.displayPageInfo(startIndex, overDataList);

      index = await this.session?.prompt();
      index = index?.trim(); // 在这里进行 trim

      startIndex = await this.handleUserInput(index, startIndex, overDataList, nowList);

      if (/^[0-9]+$/.test(index))
      {
        break;
      }
    }

    return Number(index) + startIndex;
  }





  private searchOver(type: SearchType)
  {
    this._.session?.send('搜索中...');
    const whichPlatform = this.ctx.nazrin[type].slice();
    let overDataList: search_data[] = [];
    const over = this.ctx.on('nazrin/search_over', async (data) =>
    {
      const platformIndex = whichPlatform.indexOf(data[0].platform);

      if (platformIndex < 0)
      {
        this.logger.warn(` [${data[0].platform}] 平台未注册`);
        return over();
      }

      whichPlatform.splice(platformIndex, 1);

      if (data[0].err)
      {
        this.logger.warn(` [${data[0].platform}] 平台无结果`);
        return over();
      }

      overDataList = overDataList.concat(data);

      for (const item of overDataList)
      {
        if (item.name === null || item.name === undefined || item.author === null || item.author === undefined)
        {
          return ` [${data[0].platform}] 平台搜索结果含有null`;
        }
      }

      if (whichPlatform.length > 0)
      {
        return;
      }
      const index = await this.selectList(overDataList);

      if (index == -1)
      {
        return over();
      }

      this.session?.send('好哦！正在搜索对应的资源！可能会有点慢...');

      const goal: search_data = overDataList[Number(index) - 1];
      const searchType: SearchType = type;

      const emitEvent = `nazrin/parse_${searchType}`;
      this.ctx.emit(emitEvent as keyof Events<Context>, this.ctx, goal.platform, goal.url, goal.data);

      this.ctx.once('nazrin/parse_over', (url, name = "未知作品名", author = "未知作者", cover = "未知封面图片直链", duration = 300, bitRate = 360, color = "66ccff") =>
      {
        over();

        const urlList = Array.isArray(url) ? url : [url];

        urlList.forEach(v =>
        {
          const mediaTag =
            searchType === 'music'
              ? `<audio name="${name}" url="${v}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`
              : (searchType === 'video' || searchType === 'short_video' || searchType === 'acg' || searchType === 'movie')
                ? `<video name="${name}" url="${v}" author="${author}" cover="${cover}" duration="${duration}" bitRate="${bitRate}" color="${color}"/>`
                : (searchType === 'picture' || searchType === 'comics')
                  ? `<img src="${v}"/>`
                  : '';

          this.session?.send(mediaTag);
        });
      });
    });
  }


}