/* v7: music-led LOCAL science thread. Quiet phrases use long C2 fades,
 * bounded spatial drift, no scan wraps, camera resets, or aircraft relocation.
 * Onset strength alone never authorizes a large movement in a quiet phrase. */
const narratives=[
 {a:12.8,b:18.2,id:'dossier',phase:'BEFORE / PREPARATION',title:'FROM PROJECT FILE TO FLIGHT',source:'LESURF / PROJECT ARCHIVE · EDITORIAL SUMMARY',box:[80,700,1070,248],fade:1.3},
 {a:40.3,b:45.8,id:'fbw',phase:'BEFORE / ENGINEERING',title:'ANALOGUE FLY-BY-WIRE',source:'ICAS 2006 §1.1 · SIMPLIFIED, NOT COMPLETE REDUNDANCY',box:[1060,110,760,248],fade:1.25},
 {a:67.2,b:74.0,id:'optics',phase:'DURING / OBSERVATION',title:'ABOVE THE CLOUDS',source:'LOS ALAMOS, 1973 · OPTICAL SCHEMATIC',box:[75,390,545,348],fade:2.4},
 {a:104.1,b:108.75,id:'spectrum',phase:'DURING / OBSERVATION',title:'READING THE CORONA',source:'LOS ALAMOS, 1973 · Fe XIV',box:[1065,90,770,305],fade:1.1},
 {a:159.6,b:167.0,id:'results',phase:'AFTER / RESULTS',title:'A LONGER OBSERVING WINDOW',source:'NATURE 246, 72–74 (1973) / NASA',box:[80,125,1025,280],fade:1.5},
 {a:178.0,b:184.35,id:'archive',phase:'AFTER / THE RECORD',title:'FLIGHT → RECORD → RESEARCH',source:'LESURF / QMC ARCHIVE · EDITORIAL SUMMARY',box:[1060,110,760,300],fade:2.0}
];
function quietPhrase(t){return (t>=55.384&&t<73.842)||(t>=168.465)||t<23.08}
function narrativeAt(t){const n=narratives.find(n=>t>=n.a&&t<=n.b);if(!n)return null;const enter=E.smoother(seg(t,n.a,n.a+n.fade)),leave=E.smoother(seg(t,n.b-n.fade,n.b));return {...n,u:t-n.a,gate:enter*(1-leave),enter,leave}}
function narrativeState(t,s){return s} // Narration never moves the main camera or aircraft.
function localReveal(n,delay,duration,fn){const a=E.smoother(seg(n.u,delay,delay+duration));g.save();g.globalAlpha*=a;fn();g.restore()}
function localTrace(points,u,color=C.gold,width=2){
 // Interpolate the terminal point: no integer-vertex popping in slow reveals.
 const q=clamp(u,0,1)*(points.length-1),j=Math.floor(q);g.beginPath();g.moveTo(...points[0]);for(let i=1;i<=j;i++)g.lineTo(...points[i]);if(j<points.length-1)g.lineTo(lerp(points[j][0],points[j+1][0],q-j),lerp(points[j][1],points[j+1][1],q-j));g.strokeStyle=color;g.lineWidth=width;g.stroke();
}
function narrativeDrift(n){return 14*(1-n.enter)-10*n.leave+6*Math.sin(n.u*.12)}
function drawNarrative(t){const n=narrativeAt(t);if(!n||n.gate<1e-8)return;const [x,y,w,h]=n.box;
 g.save();g.setTransform(1,0,0,1,0,0);g.translate(x+narrativeDrift(n),y);g.globalAlpha=n.gate;
 rect(0,0,w,h,'rgba(8,18,23,.94)',5,C.line);line(0,18,0,61,C.gold,3);
 txt(n.phase,22,30,14,C.gold);txt(n.title,22,66,n.id==='optics'?29:32,C.paper,'display');
 line(22,82,w-22,82,C.line,.7);
 if(n.id==='dossier'){
  const rows=[['06 MAR','MEET','Scientists + flight team'],['28 MAY','INTEGRATE','Airframe + instruments'],['23 JUN','REHEARSE','Checklists + tracking']];
  rows.forEach((d,j)=>{let xx=24+j*342;localReveal(n,.15+j*.2,1.1,()=>{txt(d[0]+' 1973',xx,113,17,C.gold);txt(d[1],xx,153,27,C.paper,'display');txt(d[2],xx,182,17,C.muted);if(j<2)localTrace([[xx+248,145],[xx+306,145]],E.smoother(seg(n.u,1.1+j*.7,3+j*.7)),C.gold)});});
  localReveal(n,1.9,1.2,()=>txt('FLIGHT READY / milestone, not an original approval stamp',24,214,15,C.gold));
 } else if(n.id==='fbw'){
  const labels=['PILOT','ELECTRICAL','SERVO','SURFACE'];
  labels.forEach((s,j)=>{let xx=25+j*178;localReveal(n,.25+j*.35,.9,()=>{txt(s,xx,117,19,C.paper);line(xx,160,xx+104,160,C.muted,2);const a=Math.sin((t-38.1)*2-j*.4)*9;line(xx+52,145,xx+52+a,175,C.gold,3);if(j<3)localTrace([[xx+114,160],[xx+157,160]],E.smoother(seg(n.u,.7+j*.35,1.5+j*.35)),C.gold)});});
  localReveal(n,1.6,1.2,()=>{txt('COMMAND → ACTUATION → FEEDBACK',25,201,19,C.gold);});
 } else if(n.id==='optics'){
  // The whole apparatus is present; only a slow light-path reveal develops.
  paintCorona(75,133,19,1);
  txt('CORONA',132,135,18,C.paper);line(30,196,63,196,C.muted,4);rect(64,188,22,16,C.blue,2,C.paper);line(87,196,118,196,C.muted,4);
  txt('12 cm fused-silica window',132,199,19,C.paper);line(66,252,84,234,C.paper,4);rect(310,229,80,31,null,2,C.line);txt('FILTER',323,250,14,C.muted);rect(447,228,60,33,null,2,C.gold);
  localTrace([[75,163],[75,243],[310,243],[447,243]],E.smoother(seg(n.u,.5,4.5)),C.gold,2);
  txt('TRACKING MIRROR',28,287,14,C.muted);txt('FABRY-PEROT → RECORD',280,287,15,C.muted);
  txt('One experiment, not the entire cabin',22,313,15,C.muted);
 } else if(n.id==='spectrum'){
  paintCorona(95,165,32,1);
  txt('Fe XIV / 530.3 nm',193,120,23,C.gold);line(200,235,718,235,C.muted);line(200,145,200,235,C.muted);
  const pts=[];for(let j=0;j<=160;j++){let u=j/160;pts.push([200+u*518,229-76*Math.exp(-(((u-.5)/.09)**2))])}localTrace(pts,E.smoother(seg(n.u,.35,2.5)),C.paper,2);
  const scan=200+518*E.sineInOut(seg(n.u,.6,3.3));line(scan,143,scan,235,C.orange,1); // one pass, no wrap
  txt('ILLUSTRATIVE PROFILE / NOT MEASURED DATA',193,263,15,C.orange);
 } else if(n.id==='results'){
  txt('GROUND MAX',24,119,17,C.muted);txt('7m 03.5s',24,151,26,C.paper);txt('ABOARD',24,193,17,C.gold);txt('74 MIN',24,225,30,C.paper,'display');
  const v=E.smoother(seg(n.u,.5,3.0));rect(235,118,740*423.5/4440*v,20,C.muted);rect(235,192,740*v,25,C.orange);
  localReveal(n,2.5,1.4,()=>txt('CONTACT II ~7 MIN · III ~12 MIN / separate phases',235,248,17,C.gold));
 } else if(n.id==='archive'){
  txt('1973 / FLIGHT',24,119,21,C.paper);txt('1975 / QMC RESULTS',380,119,21,C.paper);
  localTrace([[25,143],[704,143]],E.smoother(seg(n.u,.4,4.5)),C.gold,2);
  // Slow reel rotation; no incoming page, stamp, or sweeping mask.
  for(const xx of [47,107]){circle(xx,196,20,null,C.muted);for(let j=0;j<3;j++){let a=n.u*.22+j*TAU/3;circle(xx+Math.cos(a)*10,196+Math.sin(a)*10,3,C.gold)}}
  txt('Recorded → analysed → later digitised',153,196,20,C.paper);
  txt('QMC spectra: scan-rate and mirror limitations',24,241,18,C.muted);
  txt('Research continued beyond the flight.',24,268,18,C.muted);
 }
 txt(n.source,22,h-11,12,C.muted);g.restore();
}
// Discrete, measured accents. Each large move has a new scale/focus, not a
// continuous single zoom with superficial flashes. The 131.541 release stays.
const buildupHits=[{t:125.4748,z:1.25,x:975,y:520},{t:126.0535,z:1.42,x:1000,y:510},{t:126.6322,z:1.61,x:1030,y:500},{t:127.2109,z:1.80,x:1060,y:490},{t:127.7796,z:1.98,x:1080,y:475},{t:128.6476,z:2.18,x:1100,y:465}];
// Low-dominant kicks, separated from the clap-dominant backbeats by band evidence.
const kickTimes=[131.541, 132.6884, 133.8458, 135.0032, 136.1506, 137.3079, 138.4653, 139.6127, 140.7701, 141.9175, 143.0748];
const clapTimes=[132.1098, 133.2671, 134.4245, 135.5719, 136.7293, 137.8866, 139.034, 140.1914, 141.3388, 142.4961];
const unfoldHits=kickTimes.map(t=>({t}));

function hitCurve(dt,d=.22){return E.expoOut(seg(dt,0,d))+.035*Math.exp(-Math.max(0,dt)*16)*Math.sin(Math.max(0,dt)*32)}
function applyHits(t,initial,hits){let p={...initial};for(const h of hits){if(t<h.t)break;const q=hitCurve(t-h.t);p={x:lerp(p.x,h.x,q),y:lerp(p.y,h.y,q),zoom:lerp(p.zoom,h.z,q)}}return p}
function rhythmCamera(t,base){
 if(t>=123&&t<131.541){const entry=E.smoother(seg(t,123,124));let p=applyHits(t,{x:960,y:530,zoom:1.1},buildupHits);return {...base,x:lerp(base.x,p.x,entry),y:lerp(base.y,p.y,entry),zoom:lerp(base.zoom,p.zoom,entry)}}
 if(t>=131.541&&t<132.7){const k=E.expoOut(seg(t,131.541,132.7));return {...base,x:lerp(1100,960,k),y:lerp(465,540,k),zoom:lerp(2.18,1,k)}}
 // No repeated post-release zoom steps. Musical impulse now drives objects,
 // wing/nacelle drawings and world travel; the camera remains a stable observer.
 return base;
}
function groundProjection(t){for(const c of atlasCycles){let a=c.in0-.24,b=c.out1+.30;if(t<a||t>b)continue;let top=true,cover=0;
 if(t<c.in0+.30){const u=seg(t,a,c.in0+.30);top=u>=.5;cover=u<.42?E.cubicInOut(u/.42):u>.58?1-E.cubicInOut((u-.58)/.42):1;}
 else if(t>c.out1-.24){const u=seg(t,c.out1-.24,b);top=u<.5;cover=u<.42?E.cubicInOut(u/.42):u>.58?1-E.cubicInOut((u-.58)/.42):1;}
 return {top,cover};}return null;}
function projectionShutter(cover,label){if(cover<=0)return;const w=1040*cover;rect(-20,-248,w,496,C.ink,0,C.line);line(-20+w,-248,-20+w,248,C.gold,2);g.save();g.beginPath();g.rect(-20,-248,w,496);g.clip();txt('PROJECTION / '+label,40,-180,15,C.gold);for(let x=30;x<1000;x+=80){line(x,-225,x,-210,C.muted);line(x,210,x,225,C.muted)}g.restore()}
function drawRhythmDetails(t){} // Retired: no corner beat counter / text popping.
const kickPoseTargets=[
 [0,0,0],[-25,-25,-5],[-55,-25,-5],[15,25,4],[-15,25,4],[-60,0,0],[-90,-12,-2],[-45,18,3],[0,10,1],[0,0,0],[0,0,0]
];
function kickIndex(t){return kickTimes.findLastIndex(h=>t>=h)}
function kickPulse(t){const j=kickIndex(t);if(j<0||t>143.5)return 0;const dt=t-kickTimes[j];return E.smoother(seg(dt,0,.045))*(1-E.smoother(seg(dt,.07,.44)))}
function kickWindow(t){return E.smoother(seg(t,131.541,131.72))*(1-E.smoother(seg(t,142.75,143.35)))}
function kickAirframeState(t,s){if(t<131.541||t>143.35)return s;let target=[0,0,0];for(let j=0;j<kickTimes.length;j++){if(t<kickTimes[j])break;const q=E.smoother(seg(t-kickTimes[j],0,.24));target=target.map((v,k)=>lerp(v,kickPoseTargets[j][k],q))}
 const p=s.p.plane,k=kickWindow(t),old=rad(p[3]),a=rad(p[3]+target[2]*k),cx=p[0]+500*p[2]*Math.cos(old),cy=p[1]+500*p[2]*Math.sin(old);
 s.p.plane=[cx+target[0]*k-500*p[2]*Math.cos(a),cy+target[1]*k-500*p[2]*Math.sin(a),p[2],p[3]+target[2]*k];return s;
}
function kickTravel(t){let v=0;for(const at of kickTimes){if(t<at)break;v+=190*E.smoother(seg(t-at,0,.46))}return v}
const wingOutline='M300 -22C435 -60 510 -83 598 -143C658 -185 708 -205 739 -208Q754 -209 763 -197L780 -24L780 24L763 197Q754 209 739 208C708 205 658 185 598 143C510 83 435 60 300 22Z';
function drawKickWorld(t,p,cam){const gate=kickWindow(t);if(gate<=0)return;const hit=kickIndex(t),pulse=kickPulse(t),age=t-kickTimes[hit];
 g.save();g.setTransform(...OM.view(cam,{depth:.65}));g.globalAlpha=gate;
 // Reference layers accelerate on kick, then coast; their phase never wraps in view.
 const travel=kickTravel(t),q=travel*.85;for(let row=0;row<7;row++){const yy=125+row*135,phase=q*(.7+row*.08),base=Math.floor(phase/1100),offset=phase-base*1100;
  for(let j=-2;j<3;j++){const x=j*1100+offset,len=150+310*pulse;g.beginPath();g.moveTo(x,yy);g.bezierCurveTo(x+len*.25,yy-24,x+len*.7,yy+22,x+len,yy);g.strokeStyle=row%2?'rgba(223,183,113,.40)':'rgba(99,143,158,.48)';g.lineWidth=1+3*pulse;g.stroke()}}
 // A pressure/flow graphic, not a solid page or rectangular screen wipe.
 if(age<.52){const k=E.smoother(seg(age,0,.5)),r=220+580*k;g.globalAlpha*=pulse*.7;for(const side of [-1,1]){g.beginPath();g.ellipse(945,520,r,r*.72,0,side<0?Math.PI*.62:-Math.PI*.38,side<0?Math.PI*1.38:Math.PI*.38);g.strokeStyle=hit<4?C.gold:C.blue;g.lineWidth=2+4*(1-k);g.stroke()}}
 g.restore();
}
function drawKickAirframe(t,p,cam){const gate=kickWindow(t);if(gate<=0)return;const j=kickIndex(t),pulse=kickPulse(t),age=t-kickTimes[j];
 g.save();g.setTransform(...OM.view(cam,{depth:0}));g.globalAlpha=gate;transform(p.plane,()=>{
  // Material/structural reveal is attached to the original rigid wing coordinates.
  if(j>=1&&j<=4){g.save();g.clip(new Path2D(wingOutline));g.globalAlpha*=pulse;const x=lerp(305,785,E.smoother(seg(age,0,.40)));const shine=g.createLinearGradient(x-100,0,x+22,0);shine.addColorStop(0,'rgba(223,183,113,0)');shine.addColorStop(.85,'rgba(243,108,52,.23)');shine.addColorStop(1,'rgba(255,246,208,.72)');g.fillStyle=shine;g.fillRect(x-100,-230,122,460);line(x,-230,x,230,C.gold,2.5);g.restore();}
  if(j>=1&&j<=3){g.save();g.globalAlpha*=pulse*.8;path('M302 -22C440 -59 519 -85 605 -146C669 -188 711 -200 741 -200M302 22C440 59 519 85 605 146C669 188 711 200 741 200',null,C.gold,3.2);g.restore();}
  // Four nacelles and four aft flow paths, not text labels as the beat effect.
  if(j>=4&&j<=9){g.save();const ys=[-92,-65,65,92];g.globalAlpha*=.22+.78*pulse;ys.forEach((y,k)=>{
   rect(610,y-13,182,26,null,2,j===4&&k%2===0?C.paper:C.gold);
   const length=(120+220*pulse)*(j===4?.6:1),spread=(k<2?-1:1)*(20+35*pulse);
   g.beginPath();g.moveTo(790,y);g.bezierCurveTo(835,y,880,y+spread*.6,790+length,y+spread);g.strokeStyle=k%2?C.orange:C.gold;g.lineWidth=2.4+2*pulse;g.stroke();
   for(let n=0;n<3;n++){const u=seg(age,n*.035,.42+n*.035),x=805+u*length;g.save();g.globalAlpha*=pulse*.7;line(x,y+spread*u,x+28,y+spread*u,C.paper,1);g.restore()}
  });g.restore();}
 });g.restore();
}
window.__narrativeMeta={episodes:narratives,buildupHits,kickTimes,clapTimes,illustrations:'editorial diagrams, not historical telemetry or facsimiles'};
