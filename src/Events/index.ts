import { Context } from "koishi";
import { search_data } from "../Core/interface";

interface SearchEventFunction {
    (ctx: Context, keyword: string): Promise<void>;
}

interface SearchEpisodeEventFunction {
    (ctx: Context, keyword: string, episode: number | 'all'): Promise<void>;
}

interface ParseEventFunction {
    (ctx: Context, platform: string, url: string, data?): Promise<void>
}

export interface Events
{
    'nazrin/music': SearchEventFunction;
    'nazrin/video': SearchEventFunction;
    'nazrin/short_video': SearchEventFunction;
    'nazrin/acg': SearchEventFunction;
    'nazrin/movie': SearchEventFunction;
    'nazrin/picture': SearchEventFunction;
    'nazrin/comics': SearchEventFunction;

    'nazrin/episode_music': SearchEpisodeEventFunction;
    'nazrin/episode_video': SearchEpisodeEventFunction;
    'nazrin/episode_short_video': SearchEpisodeEventFunction;
    'nazrin/episode_acg': SearchEpisodeEventFunction;
    'nazrin/episode_movie': SearchEpisodeEventFunction;
    'nazrin/episode_picture': SearchEpisodeEventFunction;
    'nazrin/episode_comics': SearchEpisodeEventFunction;

    'nazrin/search_over'(data: search_data[]): void;

    'nazrin/parse_music':ParseEventFunction;
    'nazrin/parse_video':ParseEventFunction;
    'nazrin/parse_short_video':ParseEventFunction;
    'nazrin/parse_acg':ParseEventFunction;
    'nazrin/parse_movie':ParseEventFunction;
    'nazrin/parse_picture':ParseEventFunction;
    'nazrin/parse_comics':ParseEventFunction;

    'nazrin/parse_over'(url: string | string[], name?: string, author?: string, cover?: string, duration?: number, bitRate?: number, color?: string): void;
}