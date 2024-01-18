import { Argv, Context, Extend } from "koishi";
import { SearchType } from "../core/interface";

export class Search
{
  ctx: Context;
  _: Argv<never, never, string[], Extend<Extend<Extend<Extend<Extend<Extend<Extend<Extend<{}, "music", string>, "video", string>, "short_video", string>, "acg", string>, "film", string>, "picture", string>, "comics", string>, "list", boolean>>;
  constructor(ctx: Context, _)
  {
    this.ctx = ctx;
    this._ = _;
  }
  search()
  {
    const type = this.parseType();
    this._.session?.send('搜索中...');

    switch (type)
    {
      case 'music':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/music', this.ctx, this._.options.music);
        break;
      case 'video':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/video', this.ctx, this._.options.video);
        break;
      case 'short_video':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/short_video', this.ctx, this._.options.short_video);
        break;
      case 'acg':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/acg', this.ctx, this._.options.acg);
        break;
      case 'movie':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/movie', this.ctx, this._.options.film);
        break;
      case 'picture':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/picture', this.ctx, this._.options.picture);
        break;
      case 'comics':
        // 如果this._.options.episode有值，则给这个emit后面再传入一个参数，值就是这个
        this.ctx.emit('nazrin/comics', this.ctx, this._.options.comics);
        break;

      default:
        this._.session?.send('你未输入正确的nazrin指令参数！');
    }
    return type;
  }

  parseType(): SearchType | null
  {
    const keys = Object.keys(this._.options);
    let type: SearchType | undefined;
    if (keys[0] in SearchType)
    {
      type = keys[0] as SearchType;
      return type;
    } else
    {
      this._.session?.send('你未输入正确的nazrin指令参数！');
      return null;
    }

  }



}