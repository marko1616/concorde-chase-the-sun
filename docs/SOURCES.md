> 归档说明：下文保留 v7 制作时的历史记录。旧 ZIP、MP4、production 检查报告和旧版对照不随本 Git 仓库重复分发；本仓库的当前构建方式、素材范围与实际验收分别见 BUILD.md、ASSETS.md、VALIDATION.md。文中的相对路径以原 v7 交付根目录为基准。

# 参考与署名

核对日期：2026-11-07。

1. [Airbus / Our origins](https://www.airbus.com/en/about-us/our-history/our-origins)：现实腹视照片，校核机翼与双发动机舱，不作为成片素材。
2. [Museum of Flight / Concorde](https://www.museumofflight.org/exhibits-and-events/aircraft/concorde)：ogival delta、尺寸与机型背景。
3. [Heritage Concorde / Pilots Instruments](https://www.heritageconcorde.com/pilots-instruments)：实机 ADI 照片、Mach 和 HSI 原理图。
4. [Heritage Concorde / Flight Deck Overview](https://www.heritageconcorde.com/concorde-flight-deck-overview)：量产／原型仪表差异、Mach 表 CG 游标功能。
5. [Heritage Concorde / Fuel Transfer](https://www.heritageconcorde.com/fuel-transfer)：9、10 向 11、5、7 转移的简化关系。设计图不是完整油路。
6. [正投影线图 / Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Aerospatiale_BAC_Concorde_by_bagera3005.png)：bagera3005 / DeviantArt；Covi / Commons；[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)。本项目机体轮廓参考并改绘该图，修改线条、简化细节、重组图层并采用自定义涂装。不是实机照片。
7. [G-BOAC 飞行照片转载页](https://aeromugs.com/blogs/news/the-supersonic-dream-a-journey-through-the-age-of-concorde)：只用于视觉校核，不当作技术一手来源或摄影许可来源。
8. [onetake](https://github.com/feitangyuan/onetake)：研究其镜头衔接与节奏方法；项目许可 PolyForm Noncommercial 1.0.0；本版直接使用 motion.js 镜头／缓动工具，保留 source/ONETAKE-LICENSE；固定提交 abb6d17279cdc749e27e99aa534a062d8fd01ced。字体按各自 OFL 许可使用。

本版不包含参考照片；旧版 references.html 中的缩小研究对照图仅用于设计研究。各图片权利归原权利人，不将其列为可自由用于成片的资产。机体线图改绘部分保留以上 CC BY 3.0 署名；字体许可见 assets/。这是设计资产的来源记录，不代表 NASA、Airbus、British Airways 或博物馆认可该作品。

9. [Xbox Wire / NASA-punk 原始美术采访](https://news.xbox.com/en-us/2022/02/17/exclusive-signed-starfield-art-giveaway/)：现实技术延展、可理解的功能与材料语言，而非不明用途的霓虹装饰。

## v3 动画制作补充

- 曲目由用户提供：Jonah Marais, Castle. — SLOW MOTION (CASTLE. Remix)。没有因此取得音乐公开发行或商业使用授权；本包供本次私人设计审阅。
- 本版延续 v2 改绘机体与仪表结构，新增共享对象、动态指针、绝对时间相机、遮挡投影切换与音频同步播放器。
- 未采用 imagegen 图像序列；不包含未授权下载的第三方 Concorde 照片作为影片画面。

## v4 新增来源（2026-11-07核对）

- NASA / Fred Espenak：[1973-06-30 WGS84全食路径表](https://eclipse.gsfc.nasa.gov/SEhistory/SEpath/SE1973Jun30Tpath.html)、[地图与最大食参数](https://eclipse.gsfc.nasa.gov/SEhistory/SEplot/SE1973Jun30T.pdf)。署名：Eclipse Predictions by Fred Espenak, NASA’s GSFC。全表103条UT记录；交付区域数据92条；绘制再裁取可视区域。2分钟采样的折线插值不是星历级动画。
- IAC：[机上科学家John Beckman的访谈](https://www.iac.es/es/blog/vialactea/2014/08/la-utilidad-de-lo-inutil-el-vuelo-del-eclipse)。Gando出发、同方向追月影、74分钟全食。
- Pierre Léna亲历：[30 juin 1973, le vol éclipse de Concorde 001](https://www.concordereference.fr/wp-content/uploads/2021/02/1973-06-30-Revue-45-30-juin-1973-le-vol-eclipse-de-Concorde-001-par-Pierre-Lena.pdf)。截获区域、目的地；未提供可直接采用的完整精确航迹。
- 1973年技术报告：[Liebenberg / Hoffman](https://digital.library.unt.edu/ark:/67531/metadc1020385/m1/3/ocr/)。用于核对任务性质与74分钟观测，未把有来源分歧的着陆时刻写进动画。
- [Natural Earth 110m land](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)：区域裁剪海岸线；[public-domain条款](https://www.naturalearthdata.com/about/terms-of-use/)。原始输入SHA256在production/land-source.sha256。
- Jeremy Orloff / MIT课程来源：[Fractional Linear Transformations](https://math.libretexts.org/Bookshelves/Analysis/Complex_Variables_with_Applications_(Orloff)/11:_Conformal_Transformations/11.07:_Fractional_Linear_Transformations)。核对圆／直线的分式线性映射性质；没有复制教材图像。
- FAA：[AMT Airframe Handbook Vol. 2](https://www.faa.gov/sites/faa.gov/files/2022-06/amt_airframe_hb_vol_2.pdf)。机械模拟高度表机构背景；本片未取得具体Concorde仪表的阻尼标定，不把通用响应模型写成原厂参数。

## v5 新增／复核（2026-11-07）

- [Natural Earth I 1:50m](https://www.naturalearthdata.com/downloads/50m-raster-data/50m-natural-earth-1/)：v3.2.0 地表覆盖与阴影地形栅格。实际下载：[NE1_50M_SR.zip](https://naciscdn.org/naturalearth/50m/raster/NE1_50M_SR.zip)。SHA256、地理像素变换及衍生纹理指纹见 production/geography-build.json。
- [Natural Earth 50m land](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_land.geojson)、[rivers](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_rivers_lake_centerlines.geojson)、[lakes](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_lakes.geojson)：输入字节与哈希随包保留。地名用作地域定位，不绘制当前国界。公开领域条款沿用上文 Natural Earth 官方 terms-of-use。
- [Eclipse Flight of Concorde 001 / IAC](https://www.iac.es/en/science-and-technology/publications/eclipse-flight-concorde-001)：1973 年科学报告摘要，Mach 2.05、74 分钟全食以及延长第二／第三接触约 7／12 分钟。字幕为转述，没有复制原文段落。
- [NASA 1973 日食路径表](https://eclipse.gsfc.nasa.gov/SEhistory/SEpath/SE1973Jun30Tpath.html)：继续使用 v4 已核对的全食边界和 UTC 表；v5 新增显示当地中央线处地面全食时长、食带宽度和太阳高度。字幕标明表格插值／时间压缩。
- [Heritage Concorde / Pilots Instruments / 15. Altimeter](https://www.heritageconcorde.com/pilots-instruments)：复核真实 counter-pointer 布局与轴心／数字窗关系。原始照片只供研究，不随源码或影片分发；本片下移的窗口仍属设计简化。
- [1973 项目同期文件扫描目录](https://jcgl.orpheusweb.co.uk/history/EclipseDocs/EclipseDocuments.html)：查找历史录音／操作记录的研究入口，未将其中的科学数据磁带误认作 ATC 录音；本版没有加入无法核实的 ATC 音频。

v4 中的分式线性变换教学资料不再作为 v5 内部地图投影说明。v5 只保留广义圆外轮廓；纹理、河流、航路和食带均用常规等距经纬投影。

## v6 新增与复核（2026-11-07）

- [J. C. G. Lesurf / 当事人的任务文件档案](https://jcgl.orpheusweb.co.uk/history/EclipseDocs/EclipseDocuments.html)：1973-03-06 实验人员会议、05-28 运行日程、06-23 试飞资料，以及 QMC 实验结果、扫描速度／镜面非线性限制和数据磁带数字化。成片只做简短转述与原创版式，未复制扫描页。FLIGHT READY 是编辑性动画，不是历史批准文件。
- [Airbus 作者 Traverse / Lacaze / Souyris，ICAS 2006 §1.1](https://icas.org/icas_archive/ICAS2006/PAPERS/050.PDF)：Concorde 采用模拟电传飞控。配套的液压伺服背景另参见 [NASA 航空贡献史，Case 10，印刷页643](https://www.nasa.gov/wp-content/uploads/2015/01/601288main_NASAsContributionsToAeronauticsVolume1-ebook.pdf)。动画是简化信号链，不是完整系统图或原型机具体接线。
- [Liebenberg / Hoffman 1973 技术报告，第2页](https://digital.library.unt.edu/ark:/67531/metadc1020385/m1/2/ocr/)：Los Alamos 光学系统的12厘米熔融石英朝上观测窗及跟踪镜；[第3页](https://digital.library.unt.edu/ark:/67531/metadc1020385/m1/3/ocr/)：滤光、Fabry–Perot 与录像链。Fe XIV 530.3nm 发射线的动画曲线为示意，未声称是该报告测量数据。OSTI 入口取件失败，已改用 UNT 同一报告的一手扫描OCR。
- [1973年 Nature 任务报告／IAC](https://www.iac.es/en/science-and-technology/publications/eclipse-flight-concorde-001)：74分钟全食、延长的第二／第三接触及16.2–17.7km高度；并与已核对 NASA 路径表的地面最大7分03.5秒作长度比例比较。
- 俯视图延续原有 CC BY 3.0 正投影线图的改绘基础；未新增照片资产。保留共同外轮廓，去掉腹部进气道，重绘上方风挡和垂尾脊线。其比例仍为设计化 Concorde，不宣称是 F-WTSS 001 的精密测绘。

v5 段落中的“读数窗最后绘制”仅记录上一版；v6 已按用户更正恢复物理遮挡次序：表盘／读数窗／字轮 → 指针／轴心。
