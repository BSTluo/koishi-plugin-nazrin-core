export interface search_data
{
  name?: string;
  author?: string;
  cover?: string;
  url?: string;
  platform?: string;
  err?: boolean;
  data?;
}

export const SearchType = {
  music: "music",
  video: "video",
  short_video: "short_video",
  acg: "acg",
  movie: "movie",
  picture: "picture",
  comics: "comics",
} as const;

export type SearchType = typeof SearchType[keyof typeof SearchType];