import { Context, Service } from "koishi";

declare module 'koishi' {
    interface Context {
        nazrin: nazrin;
    }
}

export class nazrin extends Service {
    music: string[] = [];
    video: string[] = [];
    short_video: string[] = [];
    acg: string[] = [];
    movie: string[] = [];
    comics: string[] = [];
    picture: string[] = [];
    film: string[] = [];

    constructor(ctx: Context) {
        // 这样写你就不需要手动给 ctx 赋值了
        super(ctx, 'nazrin', true);
    }
}
