# 构建、播放与导出

以下均为 IDE 的运行配置说明，不要求复制执行 shell 脚本。工作目录选择仓库根目录。仅观看播放器时无需安装导出依赖。

## 1. 生成离线播放器

运行文件：`production/build_player.py`。Python 3.10+，仅标准库。

| 参数 | 默认值 | 用途 |
|---|---|---|
| `--output` | 仓库内 `build/index.html` | 自包含播放器输出位置 |
| `--audio` | 不提供 | 可选本地 MP3；提供后嵌入输出 HTML |

首次不填参数即可。输出内嵌源码、字体、SVG 与地图纹理，直接打开文件即可离线运行。每次编辑 JS、SVG、JSON 或模板后重新构建。不要编辑生成的 HTML，下一次构建会覆盖它。

优先用页面的 **Local soundtrack** 选择音频，不必重新构建。若确需内嵌 MP3，在 IDE 参数栏指定 `--audio` 及本机文件路径；含音乐的 HTML 保持在被忽略的 `build/` 中，不放进公开仓库。构建器不会沿用某个旧 HTML 的音轨。

## 2. 导出依赖

在 IDE 中创建独立 `.venv`，在该虚拟环境中按 `production/requirements-tested.txt` 安装依赖；不要向系统 Python 使用 pip。系统级 Python 包由发行版 apt 管理。该文件记录原制作环境的精确版本，不是所有平台的可移植锁文件。

- 导出器需要 Playwright、Pillow。
- 地图重建额外需要 NumPy。
- SciPy 和 FontTools 是原分析／字体处理工具链记录，普通导出不调用。
- 安装与 Playwright 对应的 Chromium，或指定现有 `CHROME_BIN`。
- 准备含 `libx264` 和 AAC 编码器的 FFmpeg；加入 PATH 或指定 `FFMPEG_BIN`。
- Linux 的 Chromium 运行库需由宿主发行版安装；仓库不捆绑系统库。

| IDE 环境变量 | 默认行为 |
|---|---|
| `CHROME_BIN` | 使用 Playwright 管理的 Chromium；设置时须为浏览器可执行文件完整路径 |
| `FFMPEG_BIN` | 从 PATH 查找 `ffmpeg`；设置时须为可执行文件路径 |
| `FONTCONFIG_FILE` | 使用系统默认；仅特殊 Linux 字体环境需要指定已有配置 |
| `BROWSER_LIB_ROOT` | 不修改动态库路径；仅隔离 Linux 兼容环境需要指定 |

不再需要原制作环境的 `CONCORDE_WORKSPACE_ROOT`。Python 侧路径操作已做便携化；本次实际测试仍为 Linux，不宣称 Windows、macOS 或 NixOS 已通过导出验证。

## 3. MP4 运行配置

运行文件：`production/export_film.py`。先生成播放器，再设置参数：

| 参数 | 推荐配置／默认值 |
|---|---|
| `--html` | `build/index.html`，必填 |
| `--output` | `renders/concorde-v7.mp4`，必填 |
| `--audio` | 可选，本地配乐文件；不填即导出无声视频 |
| `--fps` | `30` |
| `--workers` | `2`；多个 Chromium 进程，会增加内存占用 |
| `--start` / `--end` | 默认从 0 到时间轴末尾；试导出可设 `134.9` / `135.9` |
| `--chunk-frames` | `450` |
| `--crf` / `--preset` | `18` / `fast` |
| `--resume` | 可选开关，只复用输入指纹、范围与参数匹配的完整分块 |
| `--overwrite` | 可选开关，明确允许替换已有输出；默认拒绝 |

**导出音轨与页面音轨独立。** 即使 HTML 含音乐，也必须给导出器 `--audio` 才会合成 AAC。导出器截取同一时间范围的原曲，不对替换曲目自动对齐；过短音轨可能导致验收失败。

输出包括 H.264/yuv420p MP4、同名 `.render.json`、隐藏的分块目录（用于续渲）。默认全片按 `ceil(duration × fps)` 取帧，30 fps 得到 5,610 帧、187 秒；源码音频长度约 186.977 秒，最多不到一帧的尾部差异是明确取帧策略。只有编码器退出成功、完整解码与规格检查通过才算完成。

## 4. 可选：重建地图

普通播放、动画编辑和视频导出直接使用随仓库保留的地图纹理，不需要下载地图原始栅格。

如需修改地理风格：先依照 `raw/README.md` 取得且核对原始 ZIP，放进 `raw/`；运行 `production/build_geography.py`，再重新构建播放器。重建会更新两张 WebP、`source/geography.json` 和忽略的 `production/geography-build.json`。在 Git 客户端中审查纹理及数据变化。生成的 TIFF 和下载 ZIP 不提交。

## 5. 常见问题

- **点击 Play 没声音**：默认就是无声版；使用 Local soundtrack，不是播放器损坏。
- **改源码没变化**：重新运行构建器，刷新 `build/index.html`。
- **找不到 Chromium／缺少 Linux 动态库**：检查当前虚拟环境对应的 Playwright 浏览器安装，或设置 `CHROME_BIN`；宿主库由系统包管理器提供。
- **找不到 FFmpeg**：检查 PATH 或 `FFMPEG_BIN` 是否指向实际文件。
- **输出已存在**：换文件名；确需替换时在运行配置加入 `--overwrite`。
- **修改后无法续渲旧分块**：输入哈希变化会使旧分块失效，这是防止混合版本的保护。

## 6. 提交 GitHub

归档附带干净 `main` 分支和一个本地快照提交，无远端、无旧制作历史。用 Git GUI 打开解压后的目录，检查变更列表，并为你自己的 GitHub 仓库设置远端；公开发布由你执行，本次没有代为 push 或创建仓库。

`build/`、`renders/`、音视频、虚拟环境、缓存、原始栅格 ZIP 被忽略。封面、可编辑资产、源码、文档和素材许可保留在 Git 中。此仓库不需要 Git LFS；最大的已跟踪文件小于 4 MB。不要强制添加带音乐的构建结果。
