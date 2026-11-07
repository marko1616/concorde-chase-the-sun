/* Concorde — Solar Chase. Deterministic vector-led 2D motion study.
 * Geometry is shared. No frame-image slideshow, no generated-image sequence.
 * OM curves/camera: onetake, © Patrick, PolyForm Noncommercial 1.0.0. */
'use strict';
const W=1920,H=1080,DUR=186.97718820861678;
const C={ink:'#101b20',dark:'#081217',panel:'#263337',paper:'#e9e3d2',muted:'#91a39e',orange:'#f36c34',gold:'#dfb771',blue:'#638f9e',line:'#526263'};
const canvas=document.getElementById('film'), g=canvas.getContext('2d',{alpha:false});
const shutter=document.createElement('canvas');shutter.width=W;shutter.height=H;const sg=shutter.getContext('2d',{alpha:false});
const images={},TAU=Math.PI*2,rad=d=>d*Math.PI/180;
const clamp=OM.clamp,lerp=OM.lerp,seg=OM.seg,E=OM.ease;
const cutTimes=[0,2.31,9.23,18.46,23.08,36.92,46.15,55.38,64.62,73.85,87.69,101.54,110.77,120,131.54,143.08,156.92,166.15,175.38,184.62,DUR];
const titles=['LAST LIGHT','OGIVAL','EASTBOUND','THROUGH ONE','FOUR OLYMPUS','ABOVE THE BLUE','CLOSING THE GAP','ROUTE COUPLED','A WINDOW OF TIME','CHASE SHADOW','THE WORLD MOVES','SLOW / MOTION','NIGHT SIDE','TRIM FOR TWO','UNFOLD','CATCH THE SUN','RELATIVE STILLNESS','LET IT DRIFT','AFTERGLOW','CONCORDE'];
const offsets={plane:[2200,500,1,0],sun:[2400,350,200,0],mach:[2310,360,.65,0],alt:[2310,800,.65,0],adi:[960,1510,.8,0],hsi:[-550,770,.7,0],engines:[2450,400,.8,0],window:[960,1850,1,0],trim:[500,1550,1,0],paper:[960,2300,1,0],band:[960,1900,1,0]};
function pose(over){return Object.assign({view:0,horizon:1500,earth:0,bandOrange:0,title:[85,255,125],...structuredClone(offsets)},over)}
const P=[
pose({plane:[235,650,3.2,0],sun:[1710,160,280,0],mach:[1600,335,.62,0],title:[80,245,115]}),
pose({plane:[240,410,1.25,20],sun:[450,390,225,0],hsi:[1570,845,.48,0],view:1,title:[80,250,132]}),
pose({plane:[790,550,.9,0],sun:[395,460,230,0],hsi:[1540,815,.7,0],horizon:610,title:[80,240,122]}),
pose({plane:[1150,590,.57,0],sun:[525,554,185,0],mach:[525,554,1.65,0],title:[1130,750,72]}),
pose({plane:[50,705,.75,-7],engines:[990,350,.91,0],paper:[960,540,1,0],sun:[200,1300,180,0],view:1,title:[75,260,170]}),
pose({plane:[330,410,1.18,19],sun:[310,290,143,0],alt:[1530,760,.8,0],band:[960,480,1,0],view:1,title:[80,250,110]}),
pose({plane:[260,490,.55,12],sun:[385,350,128,0],hsi:[1070,555,1.65,0],view:1,title:[78,820,100]}),
pose({plane:[480,520,.9,0],mach:[250,420,.50,0],adi:[1570,795,.50,0],alt:[1660,420,.50,0],sun:[-400,350,150,0],view:1,title:[80,935,48]}),
pose({window:[960,540,1,0],hsi:[1560,810,.5,0],sun:[-400,400,150,0],title:[78,290,82]}),
pose({plane:[410,300,1.2,25],hsi:[360,760,.83,0],band:[960,480,1,0],sun:[270,200,100,0],view:1,title:[1400,770,135]}),
pose({plane:[620,520,1.05,0],sun:[330,400,140,0],hsi:[1640,800,.67,0],earth:1,horizon:1100,title:[76,245,125]}),
pose({plane:[240,570,1.35,0],sun:[-400,450,220,0],paper:[960,540,1,0],title:[70,410,320]}),
pose({plane:[440,450,1.1,16],sun:[1060,520,350,0],alt:[1630,310,.61,0],mach:[1630,780,.61,0],view:1,title:[80,770,145]}),
pose({plane:[220,460,1.4,0],sun:[-480,400,220,0],trim:[420,780,1,0],mach:[1640,810,.54,0],view:1,title:[80,220,126]}),
pose({plane:[190,510,1.5,0],sun:[960,475,376,0],view:1,title:[80,280,200]}),
pose({plane:[530,560,1.25,0],sun:[470,466,280,0],hsi:[1550,827,.57,0],paper:[960,540,1,0],horizon:600,view:1,title:[1010,285,172]}),
pose({adi:[1470,410,.95,0],alt:[1470,851,.58,0],sun:[-400,400,180,0],title:[83,700,240]}),
pose({plane:[640,490,.62,0],sun:[375,390,148,0],mach:[1650,340,.72,0],hsi:[1650,790,.72,0],horizon:650,title:[80,840,95]}),
pose({plane:[310,590,1.3,0],sun:[510,460,280,0],alt:[1550,825,.53,0],horizon:660,title:[80,280,151]}),
pose({plane:[800,690,.91,0],sun:[1550,350,215,0],mach:[1640,850,.48,0],title:[80,390,255]})
];
P.forEach((p,i)=>{p.sun[3]=[0,1,6,12,17,18].includes(i)?0:1;p.bandOrange=i===9?1:0;});
// Transition durations are phrased, not one global slide transition setting.
const widths=[0,1.22,2.7,1.7,2.4,2.3,2.7,3.8,7.0,1.2,2.4,1.75,2.8,3.0,.95,3.2,2.5,4.6,6.0,3.8];
const camkeys=[
{t:0,x:650,y:575,zoom:1.8},{t:.42,x:650,y:575,zoom:1.8},{t:1.55,x:960,y:540,zoom:1,curve:E.expoOut},
{t:6,x:940,y:535,zoom:1.04},{t:9.2,x:960,y:540,zoom:1},{t:15,x:930,y:540,zoom:1.06},
{t:18,x:960,y:540,zoom:1},{t:20.5,x:960,y:540,zoom:1},{t:22.1,x:710,y:505,zoom:1.22},
{t:23.7,x:1140,y:510,zoom:1.34,curve:E.expoInOut},{t:26.5,x:1330,y:520,zoom:1.32},
{t:31.6,x:1060,y:560,zoom:1.09},{t:36.5,x:960,y:540,zoom:1},
{t:40.2,x:1050,y:535,zoom:1.15},{t:43.8,x:1030,y:510,zoom:1.15},{t:46,x:960,y:540,zoom:1},
{t:51.6,x:1010,y:535,zoom:1.11},{t:54.3,x:1090,y:530,zoom:1.22},{t:56.7,x:960,y:540,zoom:1},
{t:63.4,x:960,y:540,zoom:1},{t:67.8,x:960,y:530,zoom:1.1},{t:72.4,x:960,y:525,zoom:1.17},
{t:73.842,x:960,y:540,zoom:1.17},{t:74.45,x:960,y:540,zoom:1,curve:E.expoOut},
{t:80,x:1030,y:525,zoom:1.12},{t:85.9,x:960,y:540,zoom:1},{t:93,x:1020,y:530,zoom:1.06},
{t:100.8,x:960,y:540,zoom:1},{t:103.1,x:960,y:540,zoom:1},{t:108.9,x:960,y:540,zoom:1},
{t:112.3,x:960,y:540,zoom:1},{t:119,x:960,y:540,zoom:1},{t:123,x:960,y:530,zoom:1.1},
{t:128.9,x:1000,y:510,zoom:1.9},{t:129.275,x:1000,y:510,zoom:2.18},{t:131.541,x:1000,y:510,zoom:2.18},
{t:132.7,x:960,y:540,zoom:1,curve:E.expoOut},{t:135,x:960,y:540,zoom:1},
{t:140.5,x:1000,y:530,zoom:1.08},{t:144.6,x:960,y:540,zoom:1},{t:151.6,x:940,y:530,zoom:1.04},
{t:156.7,x:960,y:540,zoom:1},{t:160,x:960,y:540,zoom:1},{t:168.465,x:960,y:540,zoom:1},
{t:175.3,x:960,y:540,zoom:1},{t:181.6,x:970,y:540,zoom:1.025},{t:184.5,x:960,y:540,zoom:1},
{t:DUR,x:960,y:540,zoom:1}
];
function indexAt(t){let i=0;while(i<19&&t>=cutTimes[i+1])i++;return i}
function restTime(t){return t>=185.65?185.65:t}

function mixPose(a,b,k){let o={};for(const key of Object.keys(a))o[key]=Array.isArray(a[key])?a[key].map((v,j)=>lerp(v,b[key][j],k)):lerp(a[key],b[key],k);return o}
function localPose(i,t){let p=structuredClone(P[i]), u=seg(t,cutTimes[i],cutTimes[i+1]);
 if(i===0){p.plane[0]=lerp(90,235,E.cubicOut(seg(t,0,1.6)));}
 if(i===1){p.plane[3]=lerp(12,20,E.sineInOut(u));p.sun[0]-=18*u;}
 if(i===2){p.plane[0]-=40*u;p.sun[1]+=55*u;}
 if(i===3){p.mach[3]=-.6*Math.sin(u*Math.PI);}
 if(i===4){p.plane[3]=-7+3*u;}
 if(i===5){p.plane[1]-=40*E.sineInOut(u);p.band[1]-=80*u;}
 if(i===6){p.plane[0]-=45*u;p.hsi[3]=-2+2*u;}
 if(i===7){const angle=flightHeading(t)-90,rr=rad(angle);p.plane=[930-450*Math.cos(rr),520-450*Math.sin(rr),.9,angle];}
 if(i===8){p.window[2]=1+u*.045;}
 if(i===9){p.title=[1320,770,108];p.plane[1]-=30*u;p.band[0]-=140*u;}
 if(i===10){p.plane[0]-=20*u;p.earth=1;}
 if(i===12){p.sun[0]-=60*u;}
 if(i===13){p.plane[1]+=10*u;}
 if(i===14){p.plane[3]=-2*E.sineInOut(seg(t,135,142));}
 if(i===15){p.sun[1]=lerp(670,390,E.sineInOut(seg(t,144.7,154.7)));}
 if(i===17){p.plane[0]-=16*u;p.sun[0]-=13*u;}
 if(i===18){p.plane[0]-=14*u;p.sun[0]-=12*u;}
 return p;
}
function state(t){t=clamp(t,0,DUR-1e-8);let i=indexAt(t),p=localPose(i,t),blend=null;
 for(let j=1;j<20;j++){let boundary=cutTimes[j],w=widths[j],begin=boundary-w*.5,end=boundary+w*.5;
 // Do not leak the climax early: its layout and pullback begin together.
 if(j===14){begin=131.541;end=132.49;}
 if(j===9){begin=73.842;end=75.042;}
 if(j===15){begin=143.0748;end=144.6748;}
 if(j===19){begin=181.7;end=185.5;}
 if(t>=begin&&t<=end){let k=E.sineInOut(seg(t,begin,end));p=mixPose(localPose(j-1,begin),localPose(j,end),k);blend={from:j-1,to:j,k,begin,end};break;}}
 return kickAirframeState(t,narrativeState(t,{p,i,blend,cam:rhythmCamera(t,OM.camera(t,camkeys))}));
}
function energy(t,col=0){const d=AUDIO.drive.samples;let q=clamp(t*20,0,d.length-1),i=Math.floor(q),j=Math.min(i+1,d.length-1);return lerp(d[i][col],d[j][col],q-i)}
function fieldClock(t){const a=[[0,20],[23.08,55],[55.384,6],[73.842,95],[110.84,12],[129.275,0],[131.541,85],[166.152,65],[168.465,3],[DUR,3]];let s=0;for(let i=0;i<a.length-1;i++){let len=Math.min(t,a[i+1][0])-a[i][0];if(len>0)s+=len*a[i][1];if(t<a[i+1][0])break}return s}
function couplingGate(t){return E.smoother(seg(t,54.33,56.1))*(1-E.smoother(seg(t,63.0,66.37)))}
function guidanceTravel(t){return (t-55.38)*170}
function coupledTurn(t){return Math.atan(170/310*Math.cos((930-guidanceTravel(t))/310))*180/Math.PI}
function flightHeading(t){return sensors.heading(t)+couplingGate(t)*coupledTurn(t)}
function flightBank(t){const rate=(coupledTurn(t+.02)-coupledTurn(t-.02))/.04;return sensors.roll(t)+couplingGate(t)*clamp(rate*.95,-24,24)}
function machTarget(t){const knots=[[0,.92],[10,.94],[18.46,1],[23.08,1.12],[36.92,1.4],[55.38,1.6],[73.85,1.6],[87.69,1.85],[103,2],[DUR,2]];for(let i=0;i<knots.length-1;i++){if(t<=knots[i+1][0])return lerp(knots[i][1],knots[i+1][1],E.sineInOut(seg(t,knots[i][0],knots[i+1][0])))}return 2}
// Fixed-seed, band-limited sensor disturbances. No random draw on the render path.
function hashNoise(n,seed){let x=Math.imul(n^seed,0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return ((x^(x>>>16))>>>0)/4294967295*2-1}
function noise(t,period,seed){const u=t/period,n=Math.floor(u);return lerp(hashNoise(n,seed),hashNoise(n+1,seed),E.smoother(u-n))}
function sharedAir(t){return noise(t,3.1,531)}
function bakeInstrument(target,omega,zeta){const hz=240,N=Math.ceil(DUR*hz)+2,a=new Float64Array(N);let x=target(0),v=0;a[0]=x;
 for(let j=1;j<N;j++){const dt=1/hz,force=omega*omega*(target(j/hz)-x)-2*zeta*omega*v;v+=force*dt;x+=v*dt;a[j]=x}
 return t=>{const q=clamp(t*hz,0,N-1),i=Math.floor(q);return lerp(a[i],a[Math.min(i+1,N-1)],q-i)}
}
const sensors={
 alt:bakeInstrument(t=>41000+19000*E.sineInOut(seg(t,2,120))+11*sharedAir(t)+3.6*noise(t,.67,37),9,1.05),
 mach:bakeInstrument(t=>machTarget(t)+.016*sharedAir(t)+.006*noise(t,.83,93),7,.98),
 heading:bakeInstrument(t=>90+1.8*noise(t,4.3,129)+.24*sharedAir(t),5,1.12),
 roll:bakeInstrument(t=>1.4*noise(t,5.2,311)+.25*sharedAir(t),5,1.05),
 pitch:bakeInstrument(t=>3.8*noise(t,4.6,621),5,1.1),
 n2:Array.from({length:4},(_,j)=>bakeInstrument(t=>95.8+j*.14+.8*sharedAir(t)+.65*noise(t,.87+j*.09,400+j),7,1.02)),
 egt:Array.from({length:4},(_,j)=>bakeInstrument(t=>535+j*2+3.5*sharedAir(t)+4*noise(t,1.37+j*.11,810+j),3.1,1.2))};
function machAt(t){return sensors.mach(t)}
function altitude(t){return sensors.alt(t)}
function displayTime(t){return Math.floor(Math.max(0,t)*5)/5}
function altitudeText(t){return String(Math.round(altitude(displayTime(t))))}
function machText(t){return machAt(displayTime(t)).toFixed(2)}
function headingText(t){return String(Math.round(flightHeading(displayTime(t)))).padStart(3,'0')}

function line(x1,y1,x2,y2,col=C.line,width=1){g.strokeStyle=col;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke()}
function rect(x,y,w,h,col,r=0,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(col){g.fillStyle=col;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=1.5;g.stroke()}}
function circle(x,y,r,col,stroke,width=1){if(r<=0)return;g.beginPath();g.arc(x,y,r,0,TAU);if(col){g.fillStyle=col;g.fill()}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke()}}
function txt(s,x,y,size=22,col=C.paper,font='mono',align='left',contrast=false){g.save();if(contrast)g.globalCompositeOperation='difference';g.font=`${size}px ${font}`;g.fillStyle=col;g.textAlign=align;g.fillText(s,x,y);g.restore()}
function path(d,fill,stroke,width=1){let p=new Path2D(d);if(fill){g.fillStyle=fill;g.fill(p)}if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke(p)}}
function polar(a,r){return [Math.sin(rad(a))*r,-Math.cos(rad(a))*r]}
function transform(p,fn){if(p[2]<.001)return;g.save();g.translate(p[0],p[1]);g.rotate(rad(p[3]||0));g.scale(p[2],p[2]);fn();g.restore()}
function baseAsset(key,size=430){g.drawImage(images[key],-size/2,-size/2,size,size)}
function needle(a,len=151,col=C.paper,width=4){g.save();g.rotate(rad(a));path(`M${-width} 19L-2 ${-len+10}L0 ${-len}L2 ${-len+10}L${width} 19Z`,col);g.restore();circle(0,0,9,C.ink,col,2)}
function drawMach(p,t){transform(p,()=>{baseAsset('mach');let m=machAt(t);needle(-35+(m-.4)/2*280);txt(machText(t),0,50,32,C.paper,'mono','center');for(const [v,label] of [[m-.12,'FWD'],[m+.12,'AFT']]){let a=-35+(v-.4)/2*280,[x,y]=polar(a,172);g.save();g.translate(x,y);g.rotate(rad(a));path('M-7 0L7 0L0 13Z',C.orange);g.restore();txt(label,x,y+25,10,C.orange,'mono','center')}
 let [xx,yy]=polar(-35+(2.04-.4)/2*280,145);circle(xx,yy,3,C.orange);});}
// Continuous counter wheels share the same damped shaft as the needle.
function rollingAltitude(value,x,y,size,col,font,align){const val=Math.max(0,value),whole=Math.floor(val),frac=val-whole,step=size*.61;g.save();g.beginPath();g.rect(x-step*2.55,y-size*.87,step*5.1,size*1.13);g.clip();
 for(let j=0;j<5;j++){const pow=10**(4-j),digit=Math.floor(whole/pow)%10,turn=j===4?frac:((whole%pow===pow-1)?frac:0),xx=x+(j-2)*step;txt(String(digit),xx,y-turn*size*1.12,size,col,font,'center');txt(String((digit+1)%10),xx,y+(1-turn)*size*1.12,size,col,font,'center')}g.restore()}
function drawAlt(p,t){transform(p,()=>{baseAsset('alt');let a=altitude(t);rect(-84,32,168,46,C.ink,1,C.line);rollingAltitude(a,0,68,34,C.paper,'mono','center');needle((a%1000)/1000*360,150);});}
function drawHSI(p,t){transform(p,()=>{baseAsset('bezel');g.save();g.rotate(rad(-flightHeading(t)));g.drawImage(images.compass,-180,-180,360,360);g.restore();path('M0 -106L-10 -85H-3V87H3V-85H10Z',C.orange);line(-61,0,61,0,C.muted,2);for(let x of [-60,-30,30,60])circle(x,0,3,C.paper);path('M0 -27V30M-27 5H27M-12 24H12',null,C.paper,4);rect(-63,-204,126,30,C.ink,0,C.line);txt(headingText(t)+' TRUE',0,-182,16,C.paper,'mono','center');txt('INS / TRK',0,106,15,C.muted,'mono','center')});}
function drawADI(p,t){transform(p,()=>{baseAsset('bezel');g.save();g.beginPath();g.arc(0,0,150,0,TAU);g.clip();g.rotate(rad(-flightBank(t)));let py=sensors.pitch(t);rect(-220,-220,440,220+py,C.blue);rect(-220,py,440,220,C.panel);line(-220,py,220,py,C.paper,3);for(let v of [-30,-20,-10,10,20,30]){let y=v*3+py;line(-40,y,40,y,C.paper,2);txt(Math.abs(v),65,y+5,14)}g.restore();for(let a=-60;a<=60;a+=5){let [x,y]=polar(a,161),[xx,yy]=polar(a,a%30===0?145:153);line(x,y,xx,yy,C.paper,a%30===0?3:1)}path('M-117 7H-38L-22 23H22L38 7H117',null,C.gold,8);line(0,-10,0,15,C.gold,4);circle(0,0,5,C.gold);path('M-11 -153L0 -137L11 -153Z',C.paper);txt('ATT',0,139,19,C.paper,'mono','center');for(let y of [-90,-45,0,45,90])circle(166,y,3,C.paper);});}
function drawEngine(x,y,lab,val,unit,max){g.save();g.translate(x,y);baseAsset('dial',220);for(let j=0;j<=6;j++){let [xx,yy]=polar(-135+j*45,54);txt(Math.round(j*max/6),xx,yy+4,9,C.paper,'mono','center')}txt(lab,0,-14,18,C.paper,'mono','center');txt(Math.round(val),0,30,21,C.paper,'mono','center');txt(unit,0,51,10,C.muted,'mono','center');needle(-135+val/max*270,62,C.gold,1.8);g.restore()}
function drawEngines(p,t){transform(p,()=>{for(let j=0;j<4;j++){let x=j*233;txt('OLYMPUS / '+String(j+1).padStart(2,'0'),x,-35,17,C.muted,'mono','center');let v=sensors.n2[j](t);drawEngine(x,85,'N2',v,'%',110);drawEngine(x,325,'EGT',sensors.egt[j](t),'DEG C',800)}})}
function planeAsset(view){if(view===2)g.drawImage(images.dorsal,-5,-230,1010,460);else if(view===1)g.drawImage(images.ventral,-5,-230,1010,460);else g.drawImage(images.profile,-5,-140,1010,190)}
function drawPlane(p,view,blend,t){transform(p,()=>{
 const roof=groundProjection(t);if(roof){planeAsset(roof.top?2:Math.round(view));projectionShutter(roof.cover,roof.top?'DORSAL / GROUND':'SKY VIEW');return;}
 if(blend && P[blend.from].view!==P[blend.to].view){
  const k=blend.k,old=P[blend.from].view,next=P[blend.to].view;
  // A physical inspection shutter fully conceals the old drawing before selecting
  // the next projection. At no frame are half profile and half ventral combined.
  planeAsset(k<.5?old:next);
  const cover=k<.45?E.cubicInOut(k/.45):k>.55?1-E.cubicInOut((k-.55)/.45):1;
  if(cover>0){let w=1040*cover;rect(-20,-248,w,496,C.ink,0,C.line);line(-20+w,-248,-20+w,248,C.gold,2);
   g.save();g.beginPath();g.rect(-20,-248,w,496);g.clip();for(let x=30;x<1000;x+=80){line(x,-233,x,-215,C.muted,1);line(x,215,x,233,C.muted,1)}
   txt('PROJECTION / '+((k<.5?old:next)===0?'PORT':'VENTRAL'),40,-185,14,C.gold);line(30,0,980,0,C.line,.7);g.restore();}
 }else planeAsset(Math.round(view));});}

function eclipseOffset(t){if(t<72)return 2.09;if(t<90)return lerp(2.09,0,E.sineInOut(seg(t,72,90)));if(t<158)return .018*noise(t,8,919);return lerp(0,-2.09,E.sineInOut(seg(t,158,181)))}
// Isolate the eclipse group before opacity blending: fading its two disks
// separately would leak orange photosphere during an otherwise total eclipse.
// Curved coronal filaments: a cached, deterministic vector drawing inspired
// by the user's morphology reference, not an observed 1973 image or simulation.
const coronaArt=document.createElement('canvas');coronaArt.width=coronaArt.height=1536;
(function(){const c=coronaArt.getContext('2d'),O=768,R=270;
 const polar=(a,r)=>[O+Math.cos(a)*r*R,O+Math.sin(a)*r*R];
 let halo=c.createRadialGradient(O,O,R*.98,O,O,R*2.75);
 halo.addColorStop(0,'rgba(238,239,226,.7)');halo.addColorStop(.10,'rgba(220,231,222,.17)');halo.addColorStop(.4,'rgba(170,192,189,.055)');halo.addColorStop(1,'rgba(170,192,189,0)');
 c.fillStyle=halo;c.fillRect(0,0,1536,1536);
 for(let j=0;j<1100;j++){
  const a=j*TAU/1100,n=hashNoise(j,2783),band=(.5+.5*Math.cos(2*a+.5))**3;
  const length=1.27+1.17*band+.26*(.5+.5*hashNoise(j,881)),bend=.48*Math.sin(2*a+.5)+.18*Math.sin(5*a)+n*.035;
  const start=polar(a,1.003),end=polar(a+bend,length),c1=polar(a-.12*Math.sin(3*a),1.18),c2=polar(a+bend*.82,length*.87);
  let ink=c.createLinearGradient(...start,...end);ink.addColorStop(0,'rgba(246,245,232,.50)');ink.addColorStop(.25,`rgba(222,235,229,${.10+.15*(n+1)/2})`);ink.addColorStop(.8,'rgba(202,221,219,.045)');ink.addColorStop(1,'rgba(202,221,219,0)');
  c.strokeStyle=ink;c.lineWidth=.45+(.5+.5*hashNoise(j,131))*1.1;c.beginPath();c.moveTo(...start);c.bezierCurveTo(...c1,...c2,...end);c.stroke();
 }
 // Closed arch families near selected limb regions make folded, curved loops.
 for(const [a,spread,height] of [[2.65,.22,.62],[.42,.18,.48],[4.55,.13,.5],[1.22,.15,.33]])for(let j=0;j<72;j++){
  const f=j/71,delta=spread*(.7+.3*f),r=1+height*(.6+.4*f),p=polar(a-delta,1.003),q=polar(a+delta,1.003);
  c.strokeStyle=`rgba(232,239,225,${.06+.11*(1-f)})`;c.lineWidth=.7;
  c.beginPath();c.moveTo(...p);c.bezierCurveTo(...polar(a-delta*.85,r),...polar(a+delta*.7,r+.12),...q);c.stroke();
 }
})();
function paintCorona(x,y,r,alpha=1,occluder=true){g.save();g.globalAlpha*=alpha;g.drawImage(coronaArt,x-r*768/270,y-r*768/270,r*1536/270,r*1536/270);if(occluder)circle(x,y,r,C.dark);g.restore()}

const solarLayer=document.createElement('canvas');solarLayer.width=solarLayer.height=1024;
const solarContext=solarLayer.getContext('2d');let solarTime=NaN;
function paintSolarDisk(x,y,r,t){
 if(solarTime!==t){const c=solarContext,R=400,O=512;c.clearRect(0,0,1024,1024);const d=eclipseOffset(t),total=1-E.smooth(clamp((Math.abs(d)-.035)/.18));
  function disk(xx,yy,rr,fill,stroke,width=1){c.beginPath();c.arc(xx,yy,rr,0,TAU);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=width;c.stroke()}}
  disk(O,O,R,C.orange);c.save();c.beginPath();c.arc(O,O,R+.5,0,TAU);c.clip();disk(O+d*R,O+R*.015,R*1.078,C.dark);c.restore();solarTime=t;
 }
 const total=1-E.smooth(clamp((Math.abs(eclipseOffset(t))-.035)/.18));
 if(total>0)paintCorona(x,y,r,total,false);
 g.drawImage(solarLayer,x-r*1.28,y-r*1.28,r*2.56,r*2.56);
}

function drawSun(p,t,i){let[x,y,r]=p;g.save();paintSolarDisk(x,y,r,t);g.globalAlpha*=E.smooth(clamp((Math.abs(eclipseOffset(t))-.035)/.18));circle(x,y,r+15,null,C.muted,.6);for(let j=0;j<12;j++){let a=j*30+4,[xx,yy]=polar(a,r+23),[u,v]=polar(a,r+30);line(x+xx,y+yy,x+u,y+v,C.muted,1)}g.restore()}

function drawGrid(t,cam){g.save();g.setTransform(...OM.view(cam,{depth:1.4}));let shift=fieldClock(t)*.13%100;g.globalAlpha=.26;for(let x=-300;x<2300;x+=100)line(x+shift,-300,x+shift,1400,'#53635f',.7);for(let y=-300;y<1400;y+=100)line(-400,y,2400,y,'#53635f',.7);g.globalAlpha=1;for(let x=120;x<1900;x+=350){line(x-5+shift,950,x+5+shift,950,C.line,1);line(x+shift,945,x+shift,955,C.line,1)}g.restore()}
function drawHorizon(y,t,earth){if(y>1400)return;g.save();rect(-300,y,2600,1800,C.ink);line(-300,y,2200,y,C.gold,2);line(-300,y+7,2200,y+7,C.line,.8);let phase=fieldClock(t)%45;for(let j=0;j<15;j++){let yy=y+10+j*30+phase*.2;path(`M-300 ${yy+18}Q960 ${yy} 2200 ${yy+18}`,null,C.line,.75)}if(earth>.001){g.save();g.beginPath();g.rect(-500,1130-900*earth,3000,1100*earth);g.clip();for(let r of [350,440,530,620,710])circle(1100,1130,r,null,C.line,1);for(let j=-3;j<=3;j++)path(`M${1100+j*210} 1130Q${1100+j*70+Math.sin(t*.1)*15} 430 1100 420`,null,C.line,1);g.restore()}g.restore()}
function drawBand(p,t,k){transform(p,()=>{let col=`rgb(${Math.round(lerp(99,243,k))},${Math.round(lerp(143,108,k))},${Math.round(lerp(158,52,k))})`;path('M-1400 400L1000 -480V-100L-1400 780Z',col);let shift=fieldClock(t)%52;g.globalAlpha=.45;for(let j=0;j<45;j++)line(-1300+j*52+shift,620,200+j*52+shift,-340,C.line,.9);g.globalAlpha=1;});}
function drawWindow(p,t){transform(p,()=>{rect(-285,-410,570,820,'#344346',225,C.line);rect(-257,-385,514,770,C.dark,205,C.muted);g.save();g.beginPath();g.roundRect(-230,-357,460,714,180);g.clip();rect(-270,-400,540,800,C.blue);let u=seg(t,64.62,73.85);paintSolarDisk(-50-8*u,-100+12*u,144,t);for(let j=0;j<10;j++)line(-300,10+j*23,300,10+j*23,C.muted,.6);line(-300,10,300,10,C.gold,2);g.save();g.translate(-910,365);g.scale(1.4,1.4);g.drawImage(images['wing-only'],-5,-230,1010,460);g.restore();g.restore();for(let y of [-280,0,280]){circle(-274,y,4,null,C.line);circle(274,y,4,null,C.line)} });}
function drawTrim(p,t){transform(p,()=>{const xs=[0,220,660,910],labs=['09','10','11','05 / 07'];for(let j=0;j<4;j++){let x=xs[j];rect(x,0,160,130,C.dark,5,C.line);txt('TANK',x+15,31,15,C.muted);txt(labs[j],x+80,81,32,C.paper,'mono','center');let fill=j<2?lerp(130,45,seg(t,120,131.5)):lerp(45,130,seg(t,120,131.5));rect(x+15,100,fill,12,C.orange)}path('M160 65H185V-25H440V65M380 65H660M535 65V146H990V130',null,C.gold,3);path('M628 57L644 65L628 73Z',C.gold);let phase=(t*48)%260;for(let j=0;j<3;j++)circle(400+(phase+j*80)%220,65,3,C.paper);txt('TRIM TRANSFER / RELATION',0,200,17,C.muted);});}
function drawReadout(x,y,t){for(const [j,label,val,unit]of [[0,'MACH',machText(t),'M'],[1,'ALTITUDE',altitudeText(t),'FT'],[2,'TRACK',headingText(t),'TRUE']]){let yy=y+j*111;txt(label,x,yy,17,C.muted);txt(val,x,yy+54,54,C.paper,'display');txt(unit,x+205,yy+52,17,C.muted);line(x,yy+73,x+270,yy+73,C.line)}}
function ruler(x,y,w,t){line(x,y,x+w,y,C.muted,1);g.save();g.beginPath();g.rect(x,y-22,w,23);g.clip();let shift=fieldClock(t)*.6%10;for(let j=-1;j<=w/10+1;j++)line(x+j*10+shift,y,x+j*10+shift,y-(j%5===0?14:6),C.muted,1);g.restore()}
function drawTitle(i,t,p){let [x,y,size]=p.title;if(i===10)x+=115;let holds=[2,5,6,4,13,2.5,3.3,8,2.4,9,4.5,9,5,4,10,10,8,9,8,8];let start=i===19?183.4:i===4?34.0:cutTimes[i]+(i===0?.85:.35),end=i===19?DUR+5:Math.min(cutTimes[i+1]-.4,cutTimes[i]+holds[i]);const quiet=quietPhrase(cutTimes[i]+.5);let enter=quiet?E.smoother(seg(t,start,start+1.8)):E.cubicOut(seg(t,start,start+.85)),exit=quiet?E.smoother(seg(t,end-1.7,end)):1-E.cubicOut(1-seg(t,end-.7,end));let dx=quiet?(1-enter)*-8-exit*8:(1-enter)*-180-exit*210;g.save();g.beginPath();g.rect(x-4,-500,quiet?1800:1800*Math.min(enter,1-exit),2200);g.clip();if(quiet)g.globalAlpha=enter*(1-exit);g.translate(dx,0);g.globalCompositeOperation='difference';
 let s=titles[i];const split={4:['FOUR','OLYMPUS'],5:['ABOVE','THE BLUE'],6:['CLOSING','THE GAP'],8:['A WINDOW','OF TIME'],9:['CHASE','SHADOW'],10:['THE WORLD','MOVES'],12:['NIGHT','SIDE'],15:['CATCH','THE SUN'],17:['LET IT','DRIFT']};
 if(i===11){txt('SLOW',x,y,size,C.paper,'display');txt('MOTION',x,y+435,405,C.paper,'display');}
 else if(i===16){txt(machText(t),x,y,size,C.paper,'display');txt('MACH',90,750,45,C.orange);txt('RELATIVE',90,820,91,C.paper,'display');txt('STILLNESS',90,917,91,C.paper,'display');}
 else if(i===14){txt('UN',x,y,size,C.paper,'display');txt('FOLD',1400,945,150,C.paper,'display');}
 else if(split[i]){txt(split[i][0],x,y,size,C.paper,'display');txt(split[i][1],x,y+size*1.02,i===4?146:size,C.paper,'display');}
 else txt(s,x,y,size,C.paper,'display');g.restore();
 if(i===19){let a=E.smoother(seg(t,183.4,185.5));g.save();g.beginPath();g.rect(80,460,1400,520);g.clip();g.globalAlpha*=a;g.drawImage(images['final-zh'],80,475,370,210);txt('SLOW MOTION',85,842,70,C.paper,'display');txt('JONAH MARAIS / CASTLE. REMIX',85,900,21,C.muted);line(85,943,85+1285*a,943,C.orange,3);g.restore();}
}
function annotations(i,p,t){g.save();let reveal=Math.min(E.cubicOut(seg(t,cutTimes[i]+.1,cutTimes[i]+1.15)),1-E.cubicInOut(seg(t,cutTimes[i+1]-.85,cutTimes[i+1]-.05)));g.beginPath();const quiet=quietPhrase(cutTimes[i]+.5);g.rect(-300,-300,quiet?2600:2600*reveal,1700);g.clip();if(quiet)g.globalAlpha=E.smoother(seg(t,cutTimes[i]+.1,cutTimes[i]+1.8))*(1-E.smoother(seg(t,cutTimes[i+1]-1.5,cutTimes[i+1])));
 if([1,6,8].includes(i))drawReadout(i===8?1450:1540,230,t);
 if(i===3){txt(machText(t),1130,330,230,C.paper,'display');txt('MACH / TRANSONIC',1140,390,21,C.muted);ruler(1140,835,540,t)}
 if(i===4){if(t>=34){txt('593 / TURBOJET',83,590,22,C.paper,'mono','left',true);}txt('N2 / HIGH-PRESSURE ROTOR',820,900,18,C.paper,'mono','left',true);txt('EGT / EXHAUST GAS TEMPERATURE',820,935,18,C.paper,'mono','left',true)}
 if(i===0){txt('SKIN / SPECULAR LINE',82,815,18,C.muted);line(82,834,1120,834,C.orange,3);ruler(80,755,1270,t)}
 if([1,5,9,14].includes(i)){ruler(80,940,1110,t)}
 if(i===7){let labs=['MACH','ALT / FT','HDG / TRUE','AIRFRAME','NOSE / VISOR','GEAR'],vals=[machText(t),altitudeText(t),headingText(t),'CONCORDE','UP / UP','RETRACTED'];for(let j=0;j<6;j++){let x=75+j*300;txt(labs[j],x,990,14,C.muted);txt(vals[j],x,1022,23)}}
 if(i===8){txt('CABIN / PORT',85,820,18,C.muted);ruler(80,855,470,t)}
 if(i===10){txt('EARTH-FIXED GRID / AIRCRAFT-LOCKED CAMERA',78,922,18,C.muted);ruler(80,960,1200,t)}
 if(i===11){rect(60,491,1800,119,C.ink);txt('MACH '+machText(t),82,572,26,C.orange)}
 if(i===14){txt('OGIVAL DELTA',1450,220,18,C.muted);txt('25.56 M / SPAN',1450,255,18,C.muted);ruler(1370,305,460,t);txt('MACH '+machText(t)+' / ALT '+altitudeText(t)+' FT',80,925,19,C.muted)}
 if([2,15,18].includes(i)&&!(atlasState(t)?.a>.5)){txt('SKY / POETIC VIEW',1640,150,15,C.muted);txt('PORT OBSERVATION',1640,180,13,C.muted);txt('NOSE / VISOR UP',1640,205,13,C.muted)}
 g.restore();}

function nearField(t,i){if(![1,2,5,6,9,10,12,14,15,16,17,18].includes(i))return;
 const boost=E.smoother(seg(t,156.8,157.65))*(1-E.smoother(seg(t,166.15,168.465))),phase=fieldClock(t)*5;g.save();g.globalAlpha=lerp(.48,.95,boost);
 for(let row=0;row<3;row++){let y=[320,705,875][row],speed=[.8,1,1.35][row],q=phase*speed,base=Math.floor(q/600),offset=q%600;
  for(let j=-1;j<5;j++){let x=j*600+offset;line(x,y,x+230,y,C.line,lerp(1,4,boost));line(x+230,y-7,x+230,y+7,C.muted,lerp(1,2,boost));if(row===2)txt('DATUM '+String((base-j+1000)%1000).padStart(3,'0'),x,y+23,12,C.muted);}}
 g.restore();}

function drawCoupling(t){if(t<54.33||t>66.37)return;const gate=couplingGate(t),travel=guidanceTravel(t),baseline=Math.sin((930-travel)/310),yy=x=>520+170*(Math.sin((x-travel)/310)-baseline);
 g.save();g.beginPath();g.rect(-50,80,2020,960);g.clip();g.globalAlpha=gate;
 g.beginPath();for(let x=-100;x<=2100;x+=12)x===-100?g.moveTo(x,yy(x)):g.lineTo(x,yy(x));g.strokeStyle='rgba(223,183,113,.09)';g.lineWidth=64;g.stroke();g.strokeStyle=C.gold;g.lineWidth=2;g.stroke();
 for(let j=-3;j<13;j++){const x=j*230+((travel%230)+230)%230,y=yy(x);circle(x,y,5,C.ink,C.gold,1.5);line(x,y-17,x,y+17,C.muted,.7);if(j%2===0)txt('ROUTE / '+String(((j-Math.floor(travel/230)+100)%100)).padStart(2,'0'),x+12,y-24,12,C.muted)}
 const bearing=flightHeading(t),bank=flightBank(t);line(930,240,930,300,C.orange,1.5);path('M923 290L930 303L937 290',null,C.orange,2);txt('COURSE '+bearing.toFixed(1)+' TRUE / BANK '+bank.toFixed(1)+' DEG',690,265,16,C.gold);
 const cards=[
 [55.65,58.05,'AUTOPILOT / ROUTE COUPLED','INS GUIDANCE > COURSE CAPTURE','FLIGHT DIRECTOR > BANK COMMAND > HEADING RESPONSE'],
 [58.15,60.65,'MISSION ROUTE / 30 JUN 1973','GANDO > MAURITANIA > FORT-LAMY','INTERCEPT THE LUNAR SHADOW OVER NORTH AFRICA'],
 [60.75,63.45,'ECLIPSE INTERCEPT / OBSERVING FLIGHT','74 MINUTES INSIDE TOTALITY','HISTORICAL FLIGHT: MACH 2.05 / 1973 SCIENTIFIC REPORT']];
 cards.forEach(([a,b,label,main,note])=>popup(t,a,b,70,110,1220,127,(x,y)=>{txt(label,x,y,18,C.gold);txt(main,x,y+40,29,C.paper);txt(note,x,y+75,13,C.muted)}));
 line(80,850,1260,850,C.line,1);txt('GUIDANCE DEMONSTRATION / NOT RECORDED FLIGHT TELEMETRY',80,880,14,C.muted);g.restore();
}
function foreground(t){const pulses=[[23.05,1.05,1],[36.88,.72,-1],[74.05,.7,1],[87.65,.85,1]];for(const[a,d,dir]of pulses){if(t<a||t>a+d)continue;let u=E.expoInOut(seg(t,a,a+d)),x=dir>0?lerp(-650,2400,u):lerp(2400,-650,u);g.save();g.translate(x,0);g.rotate(-.1);rect(-70,-250,210,1580,C.panel);line(125,-200,125,1350,C.gold,4);for(let y=-100;y<1300;y+=50)line(125,y,95,y,C.muted,2);txt('FRAME / EAST',-35,930,18,C.muted);g.restore();}}
function draw(t){const actual=clamp(t,0,DUR),ft=restTime(actual),{p,i,blend,cam}=state(ft);g.setTransform(1,0,0,1,0,0);g.globalAlpha=1;g.globalCompositeOperation='source-over';g.fillStyle=C.ink;g.fillRect(0,0,W,H);
 // Physical ivory instrument plate moves into the continuous world; no whole-scene dissolve.
 g.save();g.setTransform(...OM.view(cam,{depth:.5}));transform(p.paper,()=>rect(-1250,-750,2500,1500,C.paper));g.restore();drawGrid(ft,cam);
 g.save();g.setTransform(...OM.view(cam,{depth:.8}));drawSun(p.sun,ft,i);g.restore();
 g.save();g.setTransform(...OM.view(cam,{depth:.25}));drawBand(p.band,ft,p.bandOrange);drawHorizon(p.horizon,ft,p.earth);nearField(ft,i);g.restore();
 drawAtlas(ft,p,cam);drawKickWorld(ft,p,cam);
 g.save();g.setTransform(...OM.view(cam,{depth:0}));
 // Typography participates as spatial material; the airframe passes in front of it.
 drawCoupling(ft);drawTitle(i,ft,p);if(i<19&&ft>=183.4)drawTitle(19,ft,p);annotations(i,p,ft);drawPlane(p.plane,p.view,blend,ft);drawTrim(p.trim,ft);drawWindow(p.window,ft);drawEngines(p.engines,ft);drawHSI(p.hsi,ft);drawADI(p.adi,ft);drawAlt(p.alt,ft);drawMach(p.mach,ft);
 g.restore();
 drawKickAirframe(ft,p,cam);
 drawNarrative(ft);
 drawRhythmDetails(ft);
 // Fine foreground scale provides near-depth motion without shaking the aircraft.
 g.save();g.setTransform(...OM.view(cam,{depth:-.22}));g.globalAlpha=.75;for(let j=0;j<15;j++){let y=95+j*63;line(1878,y,1892+(j%3===0?8:0),y,C.muted,1)}g.globalAlpha=1;g.restore();foreground(ft);
 if([1,5,9,14].includes(i)){let r=Math.min(E.cubicOut(seg(ft,cutTimes[i]+.1,cutTimes[i]+1.15)),1-E.cubicInOut(seg(ft,cutTimes[i+1]-.85,cutTimes[i+1]-.05)));g.save();g.beginPath();g.rect(80,965,1150*r,35);g.clip();txt('62.1 M LENGTH / 25.56 M SPAN / FOUR OLYMPUS 593',80,985,16,C.muted);g.restore();}
 // A compact common datum is a persistent, not scene-replacing, information layer.
 txt('CONCORDE / SOLAR CHASE',42,43,19,C.paper,'mono','left',true);txt(headingText(ft)+' TRUE / DESIGN',1878,43,19,C.paper,'mono','right',true);line(42,63,1878,63,C.line,.6);
 const led=.45+.4*energy(ft,3);g.globalAlpha=led;rect(42,1036,6,6,C.orange);g.globalAlpha=1;txt('FLIGHT STUDY / '+String(i+1).padStart(2,'0'),60,1045,15,C.paper,'mono','left',true);
}
window.__seek=function(t){draw(t);window.__lastTime=t;return true};
window.__motion=function(a,b){const A=state(restTime(a)),B=state(restTime(b));let travel=0;for(let k of Object.keys(offsets)){let p=A.p[k],q=B.p[k];travel=Math.max(travel,Math.hypot(p[0]-q[0],p[1]-q[1])+Math.abs(p[2]-q[2])*1200+Math.abs(p[3]-q[3])*8)}return Math.max(travel,OM.screenTravel(A.cam,B.cam,state((a+b)/2).cam))+Math.abs(b-a)*100+atlasMotion(a,b);};
window.__capture=function(t,fps=30){const shutterSeconds=.5/fps,travel=window.__motion(Math.max(0,t-shutterSeconds/2),Math.min(DUR,t+shutterSeconds/2)),n=Math.min(16,Math.max(2,Math.ceil(travel/4)));
 // Temporal supersampling, explicitly sRGB preview accumulation (not linear-light).
 sg.globalAlpha=1;for(let k=0;k<n;k++){draw(clamp(t+shutterSeconds*((k+.5)/n-.5),0,DUR));sg.globalAlpha=1/(k+1);sg.drawImage(canvas,0,0);}sg.globalAlpha=1;return shutter.toDataURL('image/jpeg',.94);
};
window.__meta={dur:DUR,width:W,height:H,fps:30,title:'Concorde — Solar Chase',render:'native shared SVG components + Canvas 2D; OM camera and easing',shutter:'180 degrees, adaptive 2–16 actual temporal samples, sRGB preview accumulation',timing:'waveform/spectral measured; not listening-certified',nearStill:[[129.3,131.541]],rests:[[185.65,DUR]],cuts:[],actors:Object.keys(offsets)};
window.__instruments=t=>({alt:altitude(t),mach:machAt(t),heading:flightHeading(t),bank:flightBank(t),altDisplay:altitudeText(t),machDisplay:machText(t),headingDisplay:headingText(t),n2:sensors.n2.map(f=>f(t)),egt:sensors.egt.map(f=>f(t))});
window.__track=function(t){let s=state(t);return {plane:s.p.plane,sun:s.p.sun,mach:s.p.mach,camera:s.cam,scene:s.i}};
window.__atlasModuleReady=new Promise(resolve=>{window.__resolveAtlasModule=resolve});
window.__ready=(async()=>{await window.__atlasModuleReady;await Promise.all(Object.entries(ART.raster).map(async([key,data])=>{let img=new Image();img.src='data:image/webp;base64,'+data;await img.decode();images[key]=img}));await Promise.all(Object.entries(ART.svg).map(async([key,svg])=>{let img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();images[key]=img}));await Promise.all(Object.entries(ART.fonts).map(async([name,data])=>{let f=new FontFace(name,`url(data:font/woff;base64,${data})`);await f.load();document.fonts.add(f)}));await document.fonts.ready;draw(0);document.body.dataset.ready='true';return true})();
