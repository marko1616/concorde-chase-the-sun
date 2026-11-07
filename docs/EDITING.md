# 编辑与架构

## 改哪里

| 目标 | 文件 |
|---|---|
| 主时间轴、飞机、仪表、曲线日冕 | `source/film.js` |
| 六段局部插叙、kick 动作、后段编排 | `source/narrative.js` |
| 地理投影、地景与航路显示 | `source/atlas.js` |
| 飞机／仪表轮廓和最终中文标题 | `source/assets/*.svg` |
| 播放器控件、页面说明、本地音频 | `production/player-template.html` |
| 地理数据与原始音频特征 | `source/geography.json`、`source/audio-cues.json` |
| 带来源说明的节拍／分镜记录 | `source/kick-cues.json`、`source/storyboard.json` |

`storyboard.json` 和 `kick-cues.json` 是记录，不会被构建器读取。修改它们不会直接改变影片；实际时间轴和强拍逻辑在 JS 中，修改后应同步记录，避免文档漂移。`motion.js` 是带原许可的第三方运动工具，不要移除其版权头。

## 一帧怎样产生

构建器把资产、特征 JSON 和各 JS 内嵌到单个 HTML。浏览器等待字体、图像和模块就绪后，由绝对时间计算相机和对象姿态，画进 1920×1080 Canvas。

- `window.__ready`：资源就绪 Promise。
- `window.__seek(t)`：同步绘制给定秒数的一帧。
- `window.__capture(t, fps)`：按导出时间取样，返回 JPEG data URL。
- `window.__meta`：时长等元数据。
- `?export=1`：禁用交互播放循环及页面控件，避免与逐帧导出竞争。

无声播放使用单调时钟；加载音频后使用 audio.currentTime。切换速度、暂停和跳转时保持时间连续。页面选择的音频通过浏览器 Blob URL 读取，不发送网络请求、不写入源码，也不会自动传给独立视频导出器。

## 保持 v7 的视觉约束

插叙为局部内容，场景先建立再出现；不因卡片搬动飞机或重置镜头。静段缓慢连续，高能段用实体／材质／参考层动作，不只放大和计数。2:15 附近主动作跟低频 kick，不跟高频 clap；高度表的指针和轴心在数字窗前方。

修改后至少检查插叙进出、2:11–2:23、机体投影切换、针窗遮挡和最终标题。跳转 A→B→A 时 A 应一致。更换配乐要重新审查节拍，现有 cue 并不是通用 BPM 网格。

## 画面与历史事实的边界

日冕、流线、仪表动态和科学插图均是设计表达，不是物理仿真或实测数据；航迹为示意，Natural Earth 底图不是 1973 年影像。查看 SOURCES.md 对照史料。封面取自最终 MP4 的第 5609 帧（零起算），时间 186.966667 秒；再次制作影片后可以重新抽取末帧替换封面。
