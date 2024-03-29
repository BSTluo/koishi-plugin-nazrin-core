import { Context } from "koishi";
import { search_data } from "../Core/interface";

export class MakeImage
{
    ctx: Context;
    constructor(ctx: Context)
    {
        this.ctx = ctx;
    }
    
    async makeImage(nowList: search_data[])
    {
        const img = await this.ctx.puppeteer.render(this.pageMake(nowList), async (page, next) =>
        {
            const need = await page.$('.box');
            const b = await next(need);
            return b;
        });
        return img;
    }

    /**
     * 生成HTML页面
     * @param list 
     * @returns 
     */
    private pageMake(list: search_data[])
    {
        const header = `
            <div class="box">
                <div class="title">Nazrin-search</div>
                <div class="grid">
                    <div class="category">编号</div>
                    <div class="category">名称</div>
                    <div class="category">作者</div>
                    <div class="category">平台</div>
        `;

        const items = list.map((item, index: number) => `
            <div class="content">${index + 1}</div>
            <div class="content">${(item.name.length <= 15) ? item.name : item.name.substr(0, 10) + "..."}</div>
            <div class="content">${(item.author.length <= 15) ? item.author : item.author.substr(0, 10) + "..."}</div>
            <div class="content">${item.platform}</div>
        `).join('');

        const footer = `
                </div>
            </div>
            <style>
                .box {
                    border: #37474f 2px solid;
                    color: #37474f;
                    background: #f3f3f3;
                    display: inline-block;
                    padding: 8px 12px 12px 12px;
                }
                .title {
                    color: #CE9178;
                    width: 100%;
                    font-size: 16px;
                    font-weight: bold;
                    text-align: center;
                }
                .grid {
                    display: grid;
                    grid-template-rows: auto 1fr 1fr 1fr;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                    margin: 12px 0;
                    white-space: nowrap;
                }
                .category {
                    font-weight: bold;
                    text-align: center;
                }
                .content {
                    text-align: center;
                }
            </style>
        `;

        return header + items + footer;
    }

}