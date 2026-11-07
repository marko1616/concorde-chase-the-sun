"""Style public-domain geographic DATA, retaining its georeferencing.

Input: Natural Earth 1:50m land-cover/shaded-relief GeoTIFF + physical vectors.
No synthetic geography, no historical political-border claims. Standard library,
Pillow and NumPy; run in the tested isolated renderer environment.
"""
from pathlib import Path
import json, hashlib, zipfile
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / 'raw'
SRC = ROOT / 'source'
BBOX = [-40, -12, 60, 50]  # west, south, east, north
SIZE = (3000, 1860)

if not (RAW/'NE1_50M_SR/NE1_50M_SR.tif').is_file():
    with zipfile.ZipFile(RAW/'NE1_50M_SR.zip') as archive:
        for name in ['NE1_50M_SR/NE1_50M_SR.tif', 'NE1_50M_SR/NE1_50M_SR.tfw']:
            target=RAW/name
            target.parent.mkdir(exist_ok=True)
            target.write_bytes(archive.read(name))

def xy(p):
    return ((p[0]-BBOX[0])*30, (BBOX[3]-p[1])*30)

def polygons(name):
    for f in json.loads((RAW/(name+'.geojson')).read_text())['features']:
        g=f['geometry']
        for p in ([g['coordinates']] if g['type']=='Polygon' else g['coordinates']):
            xs=[v[0] for v in p[0]]; ys=[v[1] for v in p[0]]
            if max(xs)<BBOX[0] or min(xs)>BBOX[2] or max(ys)<BBOX[1] or min(ys)>BBOX[3]:continue
            yield p

def linear(name):
    for f in json.loads((RAW/(name+'.geojson')).read_text())['features']:
        g=f['geometry']
        for p in ([g['coordinates']] if g['type']=='LineString' else g['coordinates']):
            if any(BBOX[0]<=v[0]<=BBOX[2] and BBOX[1]<=v[1]<=BBOX[3] for v in p):
                yield p, f['properties'].get('name')

im=Image.open(RAW/'NE1_50M_SR/NE1_50M_SR.tif').convert('RGB')
assert im.size==(10800,5400)
# TFW centres are (-179.9833333,89.9833333), pixel size 1/30 degree.
im=im.crop((int((BBOX[0]+180)*30),int((90-BBOX[3])*30),int((BBOX[2]+180)*30),int((90-BBOX[1])*30)))
assert im.size==SIZE
a=np.asarray(im,dtype=np.float32)/255
lum=a@np.array([.2126,.7152,.0722],dtype=np.float32)
blur=np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(9)),dtype=np.float32)/255
# High-frequency relief is amplified, not invented; land-cover tint remains.
h=np.clip(.50+(lum-.58)*1.05+(lum-blur)*2.1,0,1)
desert=np.clip((a[:,:,0]-a[:,:,1])/.13+.35,0,1)
dark=np.array([24,43,45]);light=np.array([92,117,104])
rgb=dark+h[:,:,None]*(light-dark)
rgb+=desert[:,:,None]*np.array([13,5,-3])
styled=Image.fromarray(np.uint8(np.clip(rgb,0,255)))
mask=Image.new('L',SIZE,0); md=ImageDraw.Draw(mask)
coasts=[]
for poly in polygons('ne_50m_land'):
    md.polygon([xy(v) for v in poly[0]],fill=255)
    coasts.append(poly[0])
    for hole in poly[1:]:md.polygon([xy(v) for v in hole],fill=0)
base=Image.new('RGB',SIZE,(10,31,39));base.paste(styled,mask=mask)
d=ImageDraw.Draw(base)
for p in coasts:d.line([xy(v) for v in p],fill=(109,142,137),width=2)
river_count=0
for p,name in linear('ne_50m_rivers_lake_centerlines'):
    d.line([xy(v) for v in p],fill=(80,128,143),width=2);river_count+=1
lake_count=0
for poly in polygons('ne_50m_lakes'):
    d.polygon([xy(v) for v in poly[0]],fill=(16,49,61))
    d.line([xy(v) for v in poly[0]],fill=(84,135,148),width=2);lake_count+=1
path=SRC/'assets/africa-relief.webp'
base.save(path,quality=94,method=6)
# A complete, power-of-two Earth texture supplies EVERY point in the circular
# projection. The regional texture only replaces it where higher detail exists.
world=Image.open(RAW/'NE1_50M_SR/NE1_50M_SR.tif').convert('RGB').resize((4096,2048),Image.Resampling.LANCZOS)
wa=np.asarray(world,dtype=np.float32)/255
wl=wa@np.array([.2126,.7152,.0722],dtype=np.float32)
wb=np.asarray(world.convert('L').filter(ImageFilter.GaussianBlur(4)),dtype=np.float32)/255
wh=np.clip(.50+(wl-.58)*1.05+(wl-wb)*2.1,0,1)
wd=np.clip((wa[:,:,0]-wa[:,:,1])/.13+.35,0,1)
wrgb=np.array([24,43,45])+wh[:,:,None]*np.array([68,74,59])+wd[:,:,None]*np.array([13,5,-3])
worldstyled=Image.fromarray(np.uint8(np.clip(wrgb,0,255)))
wm=Image.new('L',world.size,0);wmd=ImageDraw.Draw(wm)
def wxy(p):return ((p[0]+180)/360*4096,(90-p[1])/180*2048)
for f in json.loads((RAW/'ne_50m_land.geojson').read_text())['features']:
    gg=f['geometry']
    for poly in ([gg['coordinates']] if gg['type']=='Polygon' else gg['coordinates']):
        wmd.polygon([wxy(v) for v in poly[0]],fill=255)
        for hole in poly[1:]:wmd.polygon([wxy(v) for v in hole],fill=0)
whole=Image.new('RGB',world.size,(10,31,39));whole.paste(worldstyled,mask=wm)
worldpath=SRC/'assets/world-relief.webp';whole.save(worldpath,quality=93,method=6)
geo=json.loads((SRC/'geography.json').read_text())
geo['raster']={'bbox':BBOX,'size':SIZE,'file':'assets/africa-relief.webp','source':'Natural Earth I 1:50m v3.2.0 / land cover and shaded relief','style':'teal/olive duotone from georeferenced raster, enhanced relief, real 50m coastlines/rivers/lakes','historicBoundary':'Physical reference basemap, not 1973 satellite imagery or a political map'}
(SRC/'geography.json').write_text(json.dumps(geo,separators=(',',':')))
report={'inputRaster':str(RAW/'NE1_50M_SR/NE1_50M_SR.tif'),'inputArchiveSHA256':hashlib.sha256((RAW/'NE1_50M_SR.zip').read_bytes()).hexdigest(),'bbox':BBOX,'size':SIZE,'riverSegments':river_count,'lakePolygons':lake_count,'landPolygons':len(coasts),'outputBytes':path.stat().st_size,'outputSHA256':hashlib.sha256(path.read_bytes()).hexdigest(),'vectors':json.loads((RAW/'vector-downloads.json').read_text())}
report['worldTexture']={'size':[4096,2048],'bytes':worldpath.stat().st_size,'sha256':hashlib.sha256(worldpath.read_bytes()).hexdigest(),'repeat':'longitude wrap; mirrored latitude across poles, with 180 degree longitude shift'}
(ROOT/'production/geography-build.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
