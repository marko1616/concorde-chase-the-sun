# 可选地图重建输入

普通播放／导出不需要下载本文件，已保留 v7 使用的地图纹理。

如需重建地图，在浏览器下载 [Natural Earth I 1:50m v3.2.0](https://naciscdn.org/naturalearth/50m/raster/NE1_50M_SR.zip)，保留原文件名 `NE1_50M_SR.zip` 并放入此目录。使用文件校验工具核对 SHA-256；哈希不同先核实来源与版本，不直接覆盖重建。

- 字节数：40889620
- SHA-256：`ae930744c0cf3d10e73c292726b74c81a40490a75829f8299dec9069e5d0e934`
- 所需 ZIP 成员：`NE1_50M_SR/NE1_50M_SR.tif`、`NE1_50M_SR/NE1_50M_SR.tfw`

矢量原件已保留在此目录，字节数与校验和见 `vector-downloads.json`。构建器会解出 TIFF/TFW，下载 ZIP 和解压目录均被 Git 忽略。地图来源为 Natural Earth public domain；本仓库纹理为自定义配色衍生品，不是历史影像。
