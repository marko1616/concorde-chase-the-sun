/* Shared solar silhouette -> complete Earth -> tracking regional atlas.
 * The inherited generalized-circle boundary and affine spring are unchanged.
 * Geography itself now uses ordinary PLATE CARREE (equal angular x/y scale),
 * without complex/conformal distortion. Full Earth repeats through the mask;
 * route and NASA shadow overlays exist once, in their true geographic region.
 * SOUTH-UP / EAST LEFT. Editorial camera is NOT recorded flight telemetry. */
const atlasCycles=[
 {in0:84.2,in1:84.82,out0:100.37,out1:101.05,title:'01 / INTERCEPT',detail:'GANDO > MAURITANIA > FORT-LAMY',focus:[[-18,25.0],[-1,20.5]],zoom:[930,1460,1320]},
 {in0:109.0322,in1:109.6522,out0:120.8,out1:123.0,title:'02 / SHADOW TRACK',detail:'30 JUN 1973 / NASA GROUND-SHADOW TABLE',focus:[[-4,24],[12,19.5]],zoom:[1000,1700,1460]},
 {in0:145.4,in1:146.02,out0:156.02,out1:156.7,title:'03 / TIME GAIN',detail:'74 MIN ABOARD / GROUND MAX 7m 03.5s',focus:[[3,21.5],[21,15.5]],zoom:[1000,1550,1260]}
];
function atlasState(t){for(let i=0;i<atlasCycles.length;i++){const c=atlasCycles[i];if(t>=c.in0&&t<=c.out1){const enter=E.expoOut(seg(t,c.in0,c.in1)),leave=E.expoIn(seg(t,c.out0,c.out1));return {i,c,a:enter*(1-leave),ink:1,aperture:E.cubicOut(seg(t,c.in0,c.in0+.13))*(1-seg(t,c.out1-.13,c.out1)**3)}}}return null}
function dense(coords,close=false){const out=[],a=close?[...coords,coords[0]]:coords;for(let j=0;j<a.length-1;j++){const p=a[j],q=a[j+1],n=Math.max(1,Math.ceil(Math.hypot(q[0]-p[0],q[1]-p[1])/.6));for(let k=0;k<n;k++)out.push([lerp(p[0],q[0],k/n),lerp(p[1],q[1],k/n)])}out.push(a[a.length-1]);return out}
const atlasRows=GEO.eclipse.filter(r=>r.center[1]>-31&&r.center[1]<50),ll=p=>[p[1],p[0]];
const corridor=dense([...atlasRows.map(r=>ll(r.north)),...atlasRows.slice().reverse().map(r=>ll(r.south))],true);
const northLimit=dense(atlasRows.map(r=>ll(r.north))),southLimit=dense(atlasRows.map(r=>ll(r.south)));
const centerline=dense(atlasRows.map(r=>ll(r.center))),route=dense(GEO.route),mapGrids=[];
for(let lon=-40;lon<=60;lon+=2)mapGrids.push({major:lon%10===0,line:dense([[lon,-12],[lon,50]])});
for(let lat=-10;lat<=50;lat+=2)mapGrids.push({major:lat%10===0,line:dense([[-40,lat],[60,lat]])});
function atlasBoundary(a,cx,cy,scale){g.beginPath();if(a>=.999999){g.rect(-500,cy-scale,3000,4000);return}const den=1-a*a,center=2*a/den-a,r=scale*(1+a*a)/den,yy=cy+scale*center;if([[-20,-20],[1940,-20],[-20,1100],[1940,1100]].every(([x,y])=>Math.hypot(x-cx,y-yy)<r)){g.rect(-50,-50,2020,1180);return}g.arc(cx,yy,r,0,TAU)}
// Analytic step response. zeta .48, omega 14 rad/s; 17.9% peak overshoot.
function atlasSpring(t){if(t<=0)return 0;const z=.48,w=14,wd=w*Math.sqrt(1-z*z),e=Math.exp(-z*w*t)*(Math.cos(wd*t)+z*w/wd*Math.sin(wd*t));return 1-e*(1-E.smoother(seg(t,1.05,1.55)))}
function atlasCamera(t,p,cam){const st=atlasState(t);if(!st)return null;const{a,c}=st,m=OM.view(cam,{depth:.8}),[sx,sy,sr]=p.sun,sunx=m[0]*sx+m[2]*sy+m[4],suny=m[1]*sx+m[3]*sy+m[5],sunr=sr*Math.hypot(m[0],m[1]);
 const u=seg(t,c.in0+.85,c.out0),lon=lerp(c.focus[0][0],c.focus[1][0],u),lat=lerp(c.focus[0][1],c.focus[1][1],u),intro=atlasSpring(t-c.in0),targetScale=lerp(c.zoom[1],c.zoom[2],E.sineInOut(u)),plateScale=lerp(c.zoom[0],targetScale,intro)+(intro-1)*targetScale*.4*E.smoother(seg(t,c.in0+.05,c.in0+.16)),tx=920+plateScale*(lon-8)/24,ty=565-plateScale*(lat-15)/32,recoil=(intro-1)*a*(1-E.smoother(seg(t,c.out0,c.out1)));
 return {st,cx:lerp(sunx,tx,a)+recoil*170,cy:lerp(suny,ty,a)-recoil*45,scale:lerp(sunr,plateScale,a),lon,lat,plateScale,intro,
 map:{x:lerp(sunx,920,a)+recoil*170,y:lerp(suny,565,a)-recoil*45,px:lerp(sunr/90,plateScale/28,a),lon,lat}};
}
// Ordinary equidistant cylindrical projection. The curved outer silhouette is
// a mask, not a distortion field. Repeated whole-Earth tiles fill all of it.
function mapProject(coord,frame){const v=frame.map;return [v.x-v.px*(coord[0]-v.lon),v.y+v.px*(coord[1]-v.lat)]}
function drawRelief(frame){const v=frame.map,px=v.px,minLon=v.lon+(v.x-W)/px,maxLon=v.lon+v.x/px,minLat=v.lat-v.y/px,maxLat=v.lat+(H-v.y)/px;
 for(let band=Math.floor((minLat+90)/180);band<=Math.floor((maxLat+90)/180);band++){
  const odd=((band%2)+2)%2,base=-90+180*band;
  for(let tile=Math.floor((minLon+180+odd*180)/360);tile<=Math.floor((maxLon+180+odd*180)/360);tile++){
   const lon=-180+360*tile-odd*180,lat=odd?base:base+180;
   const [x,y]=mapProject([lon,lat],frame);g.save();g.translate(x,y);g.scale(-px*360/images.world.width,(odd?1:-1)*px*180/images.world.height);g.drawImage(images.world,0,0);g.restore();
  }
 }
 const [west,south,east,north]=GEO.raster.bbox,[x,y]=mapProject([west,north],frame);
 g.save();g.translate(x,y);g.scale(-px*(east-west)/images.region.width,-px*(north-south)/images.region.height);g.drawImage(images.region,0,0);g.restore();
}
function shadowAt(t){const lo=atlasRows.findIndex(r=>r.ut==='10:50'),hi=atlasRows.findIndex(r=>r.ut==='12:10'),phase=seg(t,84.2,156.7),rq=lerp(lo,hi,phase),j=Math.floor(rq),k=Math.min(j+1,hi),f=rq-j,A=atlasRows[j],B=atlasRows[k],num=name=>lerp(A[name],B[name],f),seconds=s=>{let m=s.match(/(\d+)m([\d.]+)s/);return +m[1]*60+(+m[2])},duration=lerp(seconds(A.centralDuration),seconds(B.centralDuration),f),clock=650*60+phase*80*60;
 return {coord:A.center.map((v,n)=>lerp(v,B.center[n],f)),width:num('widthKm'),alt:num('sunAltDeg'),duration,clock,ut:String(Math.floor(clock/3600)).padStart(2,'0')+':'+String(Math.floor(clock/60)%60).padStart(2,'0')+':'+String(Math.floor(clock%60)).padStart(2,'0')};}
function atlasLabel(label,x,y,size=16,color=C.paper){g.save();g.font=`${size}px mono`;const w=g.measureText(label).width;g.fillStyle='rgba(8,25,31,.78)';g.fillRect(x-5,y-size,w+10,size+7);txt(label,x,y,size,color);g.restore()}
function durationText(seconds){const d=Math.round(seconds*10)/10;return String(Math.floor(d/60)).padStart(2,'0')+':'+(d%60).toFixed(1).padStart(4,'0')}
function popup(t,start,end,x,y,w,h,paint){if(t<start||t>end)return;const quiet=quietPhrase((start+end)/2),fade=quiet?Math.min(1.0,(end-start)*.42):.4,entry=E.smoother(seg(t,start,start+fade)),exit=E.smoother(seg(t,end-fade,end)),reveal=entry*(1-exit);g.save();g.globalAlpha*=reveal;g.translate((1-entry)*(quiet?-6:-22)+exit*(quiet?6:22),0);rect(x,y,w,h,'#0b2028',2,C.line);rect(x,y,4,h,C.orange);paint(x+22,y+30);g.restore()}
function drawAtlasInformation(t,st,shadow,project){const{c,i}=st,open=c.in0+.65,close=c.out0+.12;
 popup(t,c.in0+.3,c.out1-.1,60,78,1300,66,(x,y)=>{txt(c.title,x,y-6,18,C.gold);txt(c.detail,x+400,y-6,13,C.paper);line(x,y+15,x+30,y+15,C.orange,2);txt('TOTALITY PATH',x+43,y+20,12,C.paper);g.setLineDash([9,6]);line(x+220,y+15,x+250,y+15,C.gold,2);g.setLineDash([]);txt('FLIGHT ROUTE: SCHEMATIC',x+263,y+20,12,C.paper);txt('SHADOW '+shadow.ut+' UT / TIME-COMPRESSED',x+635,y+20,12,C.orange)});
 popup(t,c.in0+.38,c.out1-.12,1390,78,470,66,(x,y)=>{txt('SOUTH-UP / EAST TO LEFT',x,y-6,16,C.paper);txt('NATURAL EARTH / NASA GSFC',x,y+20,12,C.muted);line(x+405,y-6,x+405,y+17,C.gold,2);path(`M${x+399} ${y+10}L${x+405} ${y+19}L${x+411} ${y+10}`,null,C.gold,2);txt('N',x+380,y+17,12,C.gold)});
 if(i===0){const cards=[['DEPARTURE / CANARY ISLANDS','GANDO / CONCORDE 001','30 JUN 1973 / EASTBOUND ECLIPSE FLIGHT'],['INTERCEPT / MAURITANIA','FLY WITH THE LUNAR SHADOW','DASHED LINE: ROUTE SCHEMATIC, NOT A RECORDED FLIGHT TRACK'],['OBSERVING FLIGHT / NORTH AFRICA','74 MINUTES IN TOTALITY','GANDO > MAURITANIA > FORT-LAMY / HISTORICAL WAYPOINTS']],cardOpen=87.95,span=(close-cardOpen)/3;
 cards.forEach((card,k)=>popup(t,cardOpen+k*span,cardOpen+(k+1)*span-.08,65,765,1000,130,(x,y)=>{txt(card[0],x,y,16,C.gold);txt(card[1],x,y+41,27,C.paper);txt(card[2],x,y+76,13,C.muted)}));}
 if(i===1)popup(t,c.in0+1.8,close,65,180,705,177,(x,y)=>{txt('GROUND SHADOW / NASA TABLE',x,y,16,C.gold);[['LOCAL TOTALITY',durationText(shadow.duration)],['PATH WIDTH',shadow.width.toFixed(1)+' KM'],['SUN ALTITUDE',shadow.alt.toFixed(1)+' DEG']].forEach(([label,value],k)=>{txt(label,x+k*222,y+35,13,C.muted);txt(value,x+k*222,y+73,26,C.paper)});txt('CENTRE '+shadow.coord[0].toFixed(2)+' N / '+Math.abs(shadow.coord[1]).toFixed(2)+(shadow.coord[1]<0?' W':' E')+' | '+shadow.ut+' UT',x,y+111,12,C.orange);txt('LOCAL GROUND DURATION, NOT AN AIRCRAFT COUNTDOWN',x,y+133,11,C.muted)});
 if(i===2){popup(t,open,close,65,755,1060,208,(x,y)=>{txt('TIME INSIDE TOTALITY',x,y,18,C.gold);txt('AIRBORNE',x,y+36,13,C.muted);txt('74:00',x,y+70,32,C.paper);rect(x+200,y+52,790,10,C.orange);txt('GROUND MAX',x,y+105,13,C.muted);txt('07:03.5',x,y+139,29,C.paper);rect(x+200,y+123,790*423.5/4440,10,C.blue);txt('10.48x DURATION / COMPARISON, NOT A TELEMETRY CLOCK',x,y+165,13,C.muted)});
 popup(t,open+3.25,close,65,654,660,78,(x,y)=>{txt('EXTENDED CONTACTS / II: 7 MIN / III: 12 MIN',x,y,16,C.gold);txt('1973 OBSERVING-FLIGHT REPORT',x,y+25,12,C.muted)});}
 const tapeY=1000;g.save();g.beginPath();g.rect(70,tapeY-18,1220,36);g.clip();line(70,tapeY,1290,tapeY,C.muted,.7);for(let lon=-40;lon<=60;lon++){let[x]=project([lon,20]);line(x,tapeY,x,tapeY-(lon%5===0?13:6),C.muted,1);if(lon%5===0)txt(Math.abs(lon)+(lon<0?'W':'E'),x+5,tapeY+17,12,C.muted)}g.restore();
}
const mapPlaces=[[-15.5,28,'GANDO',1],[15,12,'FORT-LAMY',1],[-11,19,'MAURITANIA',0],[-4,17,'MALI',0],[8.2,17,'NIGER',0],[18.8,15,'CHAD',0],[-6,31,'ATLAS MOUNTAINS',0],[5.7,23.3,'AHAGGAR',0],[17.6,21.2,'TIBESTI',0],[8.5,18.5,'AIR MASSIF',0],[13.9,13,'LAKE CHAD',2],[4,15,'SAHEL',0],[-18,33,'NORTH ATLANTIC',0],[2,28,'SAHARA',3],[30,18,'NILE',2],[22,27,'LIBYAN DESERT',0],[-16.3,16,'SENEGAL RIVER',2],[0,13,'NIGER RIVER',2]];
function drawAtlas(t,p,cam){const frame=atlasCamera(t,p,cam);if(!frame)return;const{st,cx,cy,scale}=frame,{a,aperture}=st;if(aperture<=0)return;const project=coord=>mapProject(coord,frame),pos=(lon,lat)=>project([lon,lat]);
 function stroke(points,color,width,fill,close=false){g.beginPath();points.forEach((z,j)=>{const[x,y]=project(z);j?g.lineTo(x,y):g.moveTo(x,y)});if(close)g.closePath();if(fill){g.fillStyle=fill;g.fill()}if(color){g.strokeStyle=color;g.lineWidth=width;g.stroke()}}
 g.save();g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;atlasBoundary(a,cx,cy,scale*aperture);g.clip();drawRelief(frame);g.fillStyle="rgba(4,20,25,.25)";g.fillRect(0,0,W,H);
 for(const grid of mapGrids)stroke(grid.line,grid.major?'rgba(163,186,169,.26)':'rgba(143,170,161,.12)',grid.major?.9:.55);
 stroke(corridor,null,0,'rgba(236,108,48,.15)',true);stroke(northLimit,'#e38548',1.5);stroke(southLimit,'#e38548',1.5);g.save();g.setLineDash([3,10]);stroke(centerline,'#e89156',1.2);g.setLineDash([11,7]);stroke(route,C.gold,2.4);g.restore();
 const shadow=shadowAt(t),[hx,hy]=pos(shadow.coord[1],shadow.coord[0]);circle(hx,hy,9,null,C.orange,2);circle(hx,hy,17,null,C.gold,.7);line(hx-23,hy,hx+23,hy,C.orange,1.3);line(hx,hy-23,hx,hy+23,C.orange,1.3);
 if(a>.75){const claimed=[];for(const[lon,lat,name,type]of mapPlaces){let[x,y]=pos(lon,lat);const size=type===3?29:type===1?17:14;if(x<60||x>1750||y<175||y>740)continue;if(claimed.some(([xx,yy,ww])=>Math.abs(y-yy)<32&&x<xx+ww&&x+name.length*size*.62>xx))continue;claimed.push([x,y,name.length*size*.62]);if(type===1){circle(x,y,5,C.paper);circle(x,y,12,null,C.paper,1);line(x+8,y-8,x+24,y-25,C.paper,.8);atlasLabel(name,x+27,y-26,size)}else atlasLabel(name,x,y,size,type===2?'#9ec3cb':type===3?'#e0c598':'#b2c4b7')}
 if(hx>80&&hx<1690&&hy>180&&hy<685){line(hx+16,hy-16,hx+65,hy-58,C.orange,1);atlasLabel('GROUND SHADOW',hx+70,hy-60,13,C.gold);atlasLabel(shadow.ut+' UT',hx+70,hy-39,13,C.paper)}}
 drawAtlasInformation(t,st,shadow,project);g.restore();g.save();g.setTransform(1,0,0,1,0,0);atlasBoundary(a,cx,cy,scale*aperture);g.strokeStyle=C.gold;g.lineWidth=1.7;g.stroke();g.restore();
}
window.__atlas={cycles:atlasCycles,project:mapProject,state:atlasState,spring:atlasSpring,camera:atlasCamera,shadow:shadowAt};

function atlasMotion(a,b){const pose=t=>{let s=state(restTime(t));return atlasCamera(t,s.p,s.cam)};const A=pose(a),B=pose(b);if(!A&&!B)return 0;if(!A||!B)return 80;return Math.hypot(A.cx-B.cx,A.cy-B.cy)+3*Math.abs(A.scale-B.scale)+3000*Math.abs(A.st.a-B.st.a)+300*Math.abs(A.st.aperture-B.st.aperture);}

window.__resolveAtlasModule();
