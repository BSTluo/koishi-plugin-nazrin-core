import { Schema } from "koishi";
export interface Config
{
  textOutput: boolean;
  resultOutput: boolean;
}

export const Config: Schema<Config> = Schema.object({
  textOutput: Schema.boolean().description('搜索结果以文本输出').default(false),
  resultOutput: Schema.boolean().description('解析结果以文本输出').default(false),
});

export const usage = `
  ## 你好！感谢使用此插件！
  此插件因为qq平台限制，可能无法在qq平台显示长视频
  如果在qq平台使用，请开启插件的\`文本输出\`的选项
  
  或点击<button><a href="https://iirose.com/#s=5b0fe8a3b1ff2&r=63ec36193da5d" style="color:black;">蔷薇花园https://iirose.com/</a></button>获得最佳观看体验
  
  在此平台内可以使用@+音视频直链点播视频/音频
  `;