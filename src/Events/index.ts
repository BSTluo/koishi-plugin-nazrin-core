import { Context } from "koishi";
import { search_data } from "../core/interface";

export interface Events
{
    'nazrin/music'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/video'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/short_video'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/acg'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/movie'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/picture'(ctx: Context, keyword: string): Promise<void>;
    'nazrin/comics'(ctx: Context, keyword: string): Promise<void>;

    'nazrin/search_over'(data: search_data[]): void;

    'nazrin/parse_music'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_video'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_short_video'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_acg'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_movie'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_picture'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;
    'nazrin/parse_comics'(ctx: Context, platform: string, url: string, data?: any): Promise<void>;

    'nazrin/parse_over'(url: string | string[], name?: string, author?: string, cover?: string, duration?: number, bitRate?: number, color?: string): void;
}