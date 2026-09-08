(() => {
'use strict';
const C=document.getElementById('game'),ctx=C.getContext('2d');
ctx.imageSmoothingEnabled=false;
const W=C.width,H=C.height;
const ui={
 gold:document.getElementById('gold'),life:document.getElementById('life'),wave:document.getElementById('wave'),
 waveBtn:document.getElementById('waveBtn'),preview:document.getElementById('preview'),
 panel:document.getElementById('panel'),panelTitle:document.getElementById('panelTitle'),
 panelDesc:document.getElementById('panelDesc'),panelBody:document.getElementById('panelBody'),
 toast:document.getElementById('toast'),modal:document.getElementById('modal'),
 modalTitle:document.getElementById('modalTitle'),modalText:document.getElementById('modalText'),
 modalImage:document.getElementById('modalImage'),modalCaption:document.getElementById('modalCaption'),
 restartBtn:document.getElementById('restartBtn'),
 minoBtn:document.getElementById('minoBtn'),massageBtn:document.getElementById('massageBtn'),nutriBtn:document.getElementById('nutriBtn'),
 minoCd:document.getElementById('minoCd'),massageCd:document.getElementById('massageCd'),nutriCd:document.getElementById('nutriCd'),
 story:document.getElementById('story'),storyScene:document.getElementById('storyScene'),
 storyImage:document.getElementById('storyImage'),storyText:document.getElementById('storyText'),
 storyNext:document.getElementById('storyNext'),storySkip:document.getElementById('storySkip'),
 storyCount:document.getElementById('storyCount'),
 augmentOverlay:document.getElementById('augmentOverlay'),augmentCards:document.getElementById('augmentCards'),
 augmentCount:document.getElementById('augmentCount'),augmentList:document.getElementById('augmentList'),
 eventBanner:document.getElementById('eventBanner'),eventBannerTitle:document.getElementById('eventBannerTitle'),eventBannerText:document.getElementById('eventBannerText'),
 audioSettings:document.getElementById('audioSettings'),audioToggle:document.getElementById('audioToggle'),
 audioMenu:document.getElementById('audioMenu'),bgmVolume:document.getElementById('bgmVolume'),
 sfxVolume:document.getElementById('sfxVolume'),bgmValue:document.getElementById('bgmValue'),
 sfxValue:document.getElementById('sfxValue'),muteBtn:document.getElementById('muteBtn')

};

// ---------- Audio ----------
const audioState={
 bgmVolume:.35,
 sfxVolume:.55,
 muted:false,
 ctx:null,
 lastHitAt:0
};
const bgm=new Audio('./assets/audio/The_Vigilant_Path.mp3');
bgm.loop=true;
bgm.preload='auto';

function loadAudioSettings(){
 try{
  const saved=JSON.parse(localStorage.getItem('hairDefenseAudio')||'{}');
  if(Number.isFinite(saved.bgmVolume))audioState.bgmVolume=Math.max(0,Math.min(1,saved.bgmVolume));
  if(Number.isFinite(saved.sfxVolume))audioState.sfxVolume=Math.max(0,Math.min(1,saved.sfxVolume));
  audioState.muted=!!saved.muted;
 }catch(e){}
 ui.bgmVolume.value=Math.round(audioState.bgmVolume*100);
 ui.sfxVolume.value=Math.round(audioState.sfxVolume*100);
 syncAudioUI();
}
function saveAudioSettings(){
 try{
  localStorage.setItem('hairDefenseAudio',JSON.stringify({
   bgmVolume:audioState.bgmVolume,sfxVolume:audioState.sfxVolume,muted:audioState.muted
  }));
 }catch(e){}
}
function syncAudioUI(){
 bgm.volume=audioState.muted?0:audioState.bgmVolume;
 ui.bgmValue.textContent=Math.round(audioState.bgmVolume*100);
 ui.sfxValue.textContent=Math.round(audioState.sfxVolume*100);
 ui.muteBtn.textContent=audioState.muted?'🔇 음소거 해제':'🔊 음소거';
 ui.audioToggle.textContent=audioState.muted?'🔇 사운드':'🔊 사운드';
}
function ensureAudioContext(){
 if(!audioState.ctx){
  const AC=window.AudioContext||window.webkitAudioContext;
  if(AC)audioState.ctx=new AC();
 }
 if(audioState.ctx&&audioState.ctx.state==='suspended')audioState.ctx.resume().catch(()=>{});
 return audioState.ctx;
}
function startBgm(){
 syncAudioUI();
 bgm.currentTime=0;
 bgm.play().catch(()=>{});
}
function stopBgm(){
 bgm.pause();
 bgm.currentTime=0;
}
function tone(freq,duration=.07,type='square',gain=.12,delay=0,slideTo=null){
 if(audioState.muted||audioState.sfxVolume<=0)return;
 const ac=ensureAudioContext(); if(!ac)return;
 const now=ac.currentTime+delay;
 const osc=ac.createOscillator(),g=ac.createGain();
 osc.type=type;osc.frequency.setValueAtTime(freq,now);
 if(slideTo)osc.frequency.exponentialRampToValueAtTime(Math.max(20,slideTo),now+duration);
 const vol=gain*audioState.sfxVolume;
 g.gain.setValueAtTime(.0001,now);
 g.gain.exponentialRampToValueAtTime(Math.max(.0002,vol),now+.008);
 g.gain.exponentialRampToValueAtTime(.0001,now+duration);
 osc.connect(g);g.connect(ac.destination);osc.start(now);osc.stop(now+duration+.02);
}
function noiseBurst(duration=.06,gain=.07,delay=0){
 if(audioState.muted||audioState.sfxVolume<=0)return;
 const ac=ensureAudioContext(); if(!ac)return;
 const len=Math.max(1,Math.floor(ac.sampleRate*duration));
 const buffer=ac.createBuffer(1,len,ac.sampleRate),arr=buffer.getChannelData(0);
 for(let i=0;i<len;i++)arr[i]=(Math.random()*2-1)*(1-i/len);
 const src=ac.createBufferSource(),g=ac.createGain();
 src.buffer=buffer;g.gain.value=gain*audioState.sfxVolume;
 src.connect(g);g.connect(ac.destination);src.start(ac.currentTime+delay);
}
function playSfx(name){
 if(audioState.muted)return;
 if(name==='build'){
  tone(150,.09,'square',.12,0,220);tone(310,.08,'triangle',.09,.06,430);
 }else if(name==='upgrade'){
  tone(260,.07,'square',.08);tone(390,.07,'square',.08,.07);tone(560,.11,'triangle',.10,.14);
 }else if(name==='hit'){
  const now=performance.now(); if(now-audioState.lastHitAt<42)return; audioState.lastHitAt=now;
  noiseBurst(.035,.045);tone(105,.035,'square',.045,0,78);
 }else if(name==='death'){
  tone(210,.08,'sawtooth',.07,0,115);tone(95,.11,'square',.065,.055,58);
 }else if(name==='wave'){
  tone(220,.09,'square',.08);tone(330,.10,'square',.08,.08);tone(440,.12,'triangle',.08,.16);
 }else if(name==='heroMove'){
  tone(280,.045,'triangle',.035,0,350);
 }else if(name==='lose'){
  tone(190,.22,'sawtooth',.11,0,72);tone(85,.34,'square',.08,.12,45);
 }else if(name==='win'){
  tone(330,.10,'triangle',.08);tone(440,.10,'triangle',.08,.10);tone(660,.18,'triangle',.10,.20);
 }
}
loadAudioSettings();

const path=[
{x:-30,y:145},{x:120,y:145},{x:120,y:275},{x:285,y:275},{x:285,y:128},
{x:470,y:128},{x:470,y:370},{x:650,y:370},{x:650,y:205},{x:820,y:205},{x:820,y:325},{x:960,y:325}
];
const pads=[
{x:75,y:230},{x:182,y:205},{x:216,y:355},{x:352,y:205},{x:385,y:425},
{x:540,y:255},{x:585,y:435},{x:716,y:285},{x:735,y:126},{x:865,y:250}
];

const towerDefs={
 fuzz:{name:'솜털',icon:'〽',cost:65,range:108,rate:.36,damage:10,kind:'physical',
 desc:'가늘지만 빠르게 쏘는 기본 모발. 특수 저항이 높은 DHT 처리에 유용.'},
 papilla:{name:'모유두 세포',icon:'✦',cost:105,range:126,rate:1.02,damage:44,kind:'special',
 desc:'강한 성장 신호를 발사하는 특수 공격. 물리 방어가 높은 튀김류에 강함.'},
 keratin:{name:'케라틴 단백질',icon:'◆',cost:125,range:132,rate:1.52,damage:32,kind:'physical',
 desc:'두꺼운 케라틴 덩어리로 범위 물리 피해. 몰려오는 적을 정리.'},
 matrix:{name:'모모세포',icon:'♟',cost:115,range:112,rate:2.4,damage:0,kind:'physical',
 desc:'머리카락 병사를 길 위에 배치. 집결지를 직접 지정해 적을 붙잡는다.'}
};

const branches={
 fuzz:{
  long:{name:'장모',desc:'머리카락이나 수염처럼 굵고 길게 성장하는 털. 긴 사거리와 관통 공격에 특화.',cost:110},
  thick:{name:'단모',desc:'굵지만 1~2cm 정도 이상 길어지지 않는 짧은 털. 사거리는 짧지만 한 발이 매우 강력.',cost:110}
 },
 papilla:{
  igf:{name:'IGF-1 성장신호',desc:'강한 특수 피해 + 주변 적에게 연쇄 성장 충격.',cost:165},
  vegf:{name:'VEGF 혈관증식',desc:'주변 타워의 공격속도를 30% 증가시키는 지원형.',cost:165}
 },
 keratin:{
  dense:{name:'고밀도 케라틴',desc:'폭발 피해와 범위가 크게 증가.',cost:185},
  elastic:{name:'탄성 케라틴',desc:'폭발에 맞은 적을 확률적으로 기절시킴.',cost:185}
 },
 matrix:{
  assault:{name:'성장기 돌격모',desc:'병사 4명. 공격력이 높아 적극적으로 적을 제거.',cost:170},
  guard:{name:'모낭 수비대',desc:'병사 3명. 체력이 매우 높아 강력한 길막 담당.',cost:170}
 }
};

const enemyDefs={
 alcohol:{name:'알코올',hp:64,speed:57,reward:8,leak:1,size:13,phys:.05,spec:.00,melee:4,color:'#79b8de',threat:1},
 fried:{name:'튀김류',hp:190,speed:35,reward:14,leak:2,size:17,phys:.50,spec:.10,melee:10,color:'#d79238',threat:3},
 dht:{name:'DHT',hp:158,speed:61,reward:18,leak:2,size:15,phys:.10,spec:.45,melee:12,color:'#a54163',threat:3.2},
 inflame:{name:'만성염증',hp:126,speed:44,reward:16,leak:2,size:15,phys:.15,spec:.05,melee:6,color:'#df4c3f',threat:2.6},
 insulin:{name:'인슐린 저항성',hp:255,speed:34,reward:23,leak:3,size:19,phys:.35,spec:.25,melee:14,color:'#7c6291',threat:4.5},
 sleep:{name:'수면 부족',hp:145,speed:46,reward:18,leak:2,size:15,phys:.10,spec:.18,melee:7,color:'#536d9a',threat:3.1},
 sebum:{name:'피지 과다',hp:300,speed:31,reward:26,leak:3,size:20,phys:.28,spec:.22,melee:15,color:'#b88e43',shield:105,threat:4.8},
 smoking:{name:'흡연',hp:112,speed:70,reward:17,leak:2,size:14,phys:.08,spec:.08,melee:8,color:'#68736d',threat:2.8},
 stress:{name:'스트레스',hp:1900,speed:23,reward:180,leak:10,size:28,phys:.25,spec:.25,melee:24,color:'#48434e',threat:22,boss:true},
 genetic:{name:'유전적 민감성',shortName:'유전',hp:4800,speed:17,reward:450,leak:20,size:34,phys:.28,spec:.28,melee:30,color:'#63305f',threat:48,boss:true}
};

const AUGMENT_WAVES=[2,5,8,11,14];
const MILESTONE_WAVES=new Set([...AUGMENT_WAVES,10,15]);

function mulberry32(seed){
 let a=seed>>>0;
 return function(){
  a|=0;a=a+0x6D2B79F5|0;
  let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t;
  return ((t^t>>>14)>>>0)/4294967296;
 };
}
function randInt(rng,min,max){return Math.floor(rng()*(max-min+1))+min}
function pickOne(rng,arr){return arr[Math.floor(rng()*arr.length)]}

const WaveGenerator={
 specs:[
  {ranges:{alcohol:[10,10]},budget:[10,10],order:['alcohol'],gap:.72,mutation:.00},
  {ranges:{alcohol:[13,15]},budget:[13,15],order:['alcohol'],gap:.56,mutation:.00},
  {ranges:{alcohol:[9,11],fried:[4,4]},budget:[21,24],order:['alcohol','fried','alcohol'],gap:.58,mutation:.00},
  {ranges:{fried:[6,7],alcohol:[10,13]},budget:[28,34],order:['fried','alcohol','fried','alcohol'],gap:.49,mutation:.00},
  {ranges:{dht:[5,6],alcohol:[11,13],fried:[0,2]},budget:[28,36],order:['alcohol','dht','alcohol','fried','dht'],gap:.47,mutation:.05},
  {ranges:{inflame:[5,6],alcohol:[18,21],fried:[0,2]},budget:[31,41],order:['alcohol','inflame','alcohol','fried','inflame'],gap:.39,mutation:.06},
  {ranges:{fried:[6,8],dht:[5,6],inflame:[4,5],alcohol:[4,7]},budget:[49,61],order:['fried','dht','alcohol','inflame','fried','dht'],gap:.43,mutation:.08},
  {ranges:{insulin:[3,3],alcohol:[13,16],dht:[6,7],inflame:[0,2]},budget:[47,57],order:['insulin','alcohol','dht','alcohol','insulin','dht','inflame'],gap:.40,mutation:.10},
  {ranges:{insulin:[3,4],fried:[7,9],inflame:[6,7],dht:[7,8],alcohol:[2,5]},budget:[72,86],order:['fried','dht','insulin','inflame','fried','dht','alcohol','insulin'],gap:.38,mutation:.12},
  {ranges:{stress:[1,1],dht:[5,6],inflame:[4,5],alcohol:[10,12]},budget:[58,65],order:['alcohol','dht','stress','inflame','alcohol','dht'],gap:.42,mutation:.11},
  {ranges:{sleep:[5,6],alcohol:[9,12],dht:[4,5],fried:[2,3]},budget:[47,57],order:['sleep','alcohol','dht','sleep','fried','alcohol'],gap:.39,mutation:.14},
  {ranges:{smoking:[7,9],sleep:[3,4],alcohol:[13,17],inflame:[4,5],dht:[2,4]},budget:[61,76],order:['smoking','alcohol','sleep','inflame','smoking','dht','alcohol'],gap:.31,mutation:.18},
  {ranges:{sebum:[4,5],insulin:[3,4],fried:[6,8],smoking:[4,6],sleep:[1,2]},budget:[70,84],order:['fried','sebum','smoking','insulin','fried','sebum','sleep','smoking'],gap:.36,mutation:.18},
  {ranges:{dht:[8,10],inflame:[7,8],insulin:[3,4],sleep:[4,5],smoking:[6,8],sebum:[3,4],fried:[2,4]},budget:[105,122],order:['dht','sleep','smoking','inflame','sebum','insulin','dht','fried','smoking','inflame'],gap:.31,mutation:.22},
  {ranges:{genetic:[1,1],sebum:[2,3],insulin:[2,3],smoking:[4,5],dht:[4,5]},budget:[90,103],order:['smoking','sebum','dht','genetic','insulin','smoking','dht'],gap:.40,mutation:.20}
 ],
 threat(counts){
  return Object.entries(counts).reduce((sum,[type,n])=>sum+(enemyDefs[type]?.threat||1)*n,0);
 },
 generateCampaign(seed){
  const rng=mulberry32(seed);
  return this.specs.map((spec,index)=>this.generateWave(index+1,spec,rng));
 },
 generateWave(wave,spec,rng){
  const counts={},mins={},maxs={};
  for(const [type,range] of Object.entries(spec.ranges)){
   mins[type]=range[0];maxs[type]=range[1];counts[type]=randInt(rng,range[0],range[1]);
  }
  let guard=0;
  while(this.threat(counts)<spec.budget[0]&&guard++<100){
   const candidates=Object.keys(counts).filter(t=>counts[t]<maxs[t]);
   if(!candidates.length)break;
   counts[pickOne(rng,candidates)]++;
  }
  guard=0;
  while(this.threat(counts)>spec.budget[1]&&guard++<100){
   const candidates=Object.keys(counts).filter(t=>counts[t]>mins[t]);
   if(!candidates.length)break;
   counts[pickOne(rng,candidates)]--;
  }
  const remaining={...counts};
  const groups=[];
  const occurrences={};
  spec.order.forEach(t=>occurrences[t]=(occurrences[t]||0)+1);
  for(const type of spec.order){
   if(!remaining[type]){occurrences[type]--;continue}
   const slots=Math.max(1,occurrences[type]);
   const n=Math.max(1,Math.ceil(remaining[type]/slots));
   remaining[type]-=n;occurrences[type]--;
   const gap=Math.max(.22,spec.gap*(.90+rng()*.20));
   groups.push({type,n,gap:Number(gap.toFixed(3))});
  }
  for(const [type,n] of Object.entries(remaining))if(n>0)groups.push({type,n,gap:spec.gap});
  return {wave,counts,groups,threat:Number(this.threat(counts).toFixed(1)),mutationChance:spec.mutation};
 }
};

const MutationSystem={
 defs:[
  {id:'berserk',name:'광폭',icon:'광',color:'#ff6a5e',desc:'이동속도 +28%, 최대 HP -10%.',apply:e=>{e.speed*=1.28;e.maxHp*=.90;e.hp=e.maxHp}},
  {id:'bulky',name:'비대',icon:'대',color:'#f0a35c',desc:'HP +45%, 이동속도 -18%.',apply:e=>{e.maxHp*=1.45;e.hp=e.maxHp;e.speed*=.82;e.size*=1.15}},
  {id:'regen',name:'재생',icon:'재',color:'#69d88a',desc:'2.5초 동안 피해를 받지 않으면 체력을 회복.',apply:e=>{e.regen=true}},
  {id:'sensitive',name:'과민성',icon:'과',color:'#f06b9d',desc:'죽을 때 주변 적들의 이동속도를 잠시 증가.',apply:e=>{e.deathHaste=true}},
  {id:'split',name:'분열',icon:'분',color:'#d9c05c',desc:'죽으면 약한 소형 알코올 2마리로 분열.',apply:e=>{e.splitOnDeath=true}},
  {id:'stubborn',name:'완고함',icon:'완',color:'#e9e2c4',desc:'첫 번째 기절 또는 슬로우를 무효화.',apply:e=>{e.ccBlockReady=true}},
  {id:'shield',name:'피지 보호막',icon:'막',color:'#d2ac54',desc:'최대 HP의 32%만큼 보호막을 획득.',apply:e=>{e.shield=(e.shield||0)+e.maxHp*.32;e.maxShield=e.shield}},
  {id:'physres',name:'물리 내성',icon:'물',color:'#b98354',desc:'물리 저항 +18%.',apply:e=>{e.phys=Math.min(.75,e.phys+.18)}},
  {id:'specres',name:'특수 내성',icon:'특',color:'#9c7bd4',desc:'특수 저항 +18%.',apply:e=>{e.spec=Math.min(.75,e.spec+.18)}}
 ],
 assign(e,waveId,opts={}){
  if(opts.noMutation||enemyDefs[e.type]?.boss||waveId<5)return;
  const plan=game.wavePlans?.[waveId-1];
  const chance=plan?.mutationChance||0;
  if(game.mutationRng()>chance)return;
  const def=pickOne(game.mutationRng,this.defs);
  e.mutation={id:def.id,name:def.name,icon:def.icon,color:def.color,desc:def.desc};
  def.apply(e);
 },
 get(id){return this.defs.find(d=>d.id===id)}
};

function createAugmentMods(){
 return{
  fuzzDamage:1,fuzzRange:1,fuzzRate:1,
  papillaDamage:1,papillaRange:1,papillaRate:1,
  keratinDamage:1,keratinRange:1,keratinRate:1,keratinSplash:1,
  matrixHp:1,matrixDamage:1,matrixExtraSoldiers:0,matrixRespawn:1,
  allTowerDamage:1,allTowerRate:1,
  nutritionMult:1,enemyHpMult:1,sellRate:.65,buildCostMult:1,
  heroXpMult:1,heroAuraMult:1,heroAuraRadius:1
 };
}

const AugmentManager={
 rarityWeight:{common:5,rare:3,epic:1.4},
 rarityLabel:{common:'일반',rare:'희귀',epic:'특급'},
 definitions:[
  {id:'fuzz_chain',name:'연속 성장',icon:'〽',rarity:'common',category:'솜털',description:'같은 적을 연속 공격할 때마다 피해 +8%. 최대 5중첩.',condition:()=>true,apply:()=>{}},
  {id:'fuzz_split',name:'분열모',icon:'⑂',rarity:'rare',category:'솜털',description:'솜털 공격이 20% 확률로 주변 다른 적에게 55% 추가 피해.',condition:()=>true,apply:()=>{}},
  {id:'fuzz_hyper',name:'초고속 성장',icon:'≫',rarity:'rare',category:'솜털',description:'솜털 공격속도 +38%. 대신 사거리 -16%.',condition:()=>true,apply:m=>{m.fuzzRate*=.72;m.fuzzRange*=.84}},
  {id:'fuzz_dhtproof',name:'DHT 적응모',icon:'D',rarity:'rare',category:'솜털',description:'솜털이 받는 DHT 약화 효과를 절반 가까이 감소.',condition:()=>true,apply:()=>{}},
  {id:'fuzz_fifthcrit',name:'다섯 번째 한 올',icon:'Ⅴ',rarity:'epic',category:'솜털',description:'솜털의 매 5번째 공격이 2배 피해.',condition:()=>true,apply:()=>{}},

  {id:'papilla_rampage',name:'성장 신호 폭주',icon:'✦',rarity:'rare',category:'모유두',description:'모유두가 적을 처치하면 다음 공격 피해 +80%.',condition:()=>true,apply:()=>{}},
  {id:'papilla_overgrowth',name:'과잉 성장',icon:'▲',rarity:'rare',category:'모유두',description:'모유두 공격력 +45%. 대신 공격속도 -18%.',condition:()=>true,apply:m=>{m.papillaDamage*=1.45;m.papillaRate*=1.18}},
  {id:'papilla_bloodflow',name:'혈류 촉진',icon:'♥',rarity:'rare',category:'모유두',description:'공격 적중 시 18% 확률로 주변 타워 하나의 공속을 3초간 +35%.',condition:()=>true,apply:()=>{}},
  {id:'papilla_expose',name:'수용체 과민화',icon:'◎',rarity:'epic',category:'모유두',description:'적중한 적의 특수 저항을 4초간 12% 감소.',condition:()=>true,apply:()=>{}},
  {id:'papilla_vein',name:'혈관 확장',icon:'Y',rarity:'common',category:'모유두',description:'모유두 사거리 +10%. VEGF의 공속 오라가 더 넓고 강해짐.',condition:()=>true,apply:m=>{m.papillaRange*=1.10}},

  {id:'keratin_center',name:'중심 폭발',icon:'◆',rarity:'common',category:'케라틴',description:'폭발 중심 대상에게 추가 45% 피해.',condition:()=>true,apply:()=>{}},
  {id:'keratin_protein',name:'단백질 과다',icon:'◉',rarity:'rare',category:'케라틴',description:'폭발 범위 +35%. 대신 공격속도 -15%.',condition:()=>true,apply:m=>{m.keratinSplash*=1.35;m.keratinRate*=1.15}},
  {id:'keratin_chain',name:'연쇄 충격',icon:'ϟ',rarity:'rare',category:'케라틴',description:'케라틴 폭발의 기절 확률 +15%.',condition:()=>true,apply:()=>{}},
  {id:'keratin_shrapnel',name:'케라틴 파편',icon:'✣',rarity:'epic',category:'케라틴',description:'폭발 시 25% 확률로 근처 적에게 작은 2차 폭발.',condition:()=>true,apply:()=>{}},
  {id:'keratin_pressure',name:'고압 압축',icon:'▣',rarity:'common',category:'케라틴',description:'HP가 60% 이상 남은 적에게 피해 +25%.',condition:()=>true,apply:()=>{}},

  {id:'matrix_sacrifice',name:'희생의 한 올',icon:'†',rarity:'rare',category:'모모세포',description:'병사가 죽으면 주변 적에게 피해를 주고 0.7초 기절.',condition:()=>true,apply:()=>{}},
  {id:'matrix_mass',name:'대량 증식',icon:'♟+',rarity:'epic',category:'모모세포',description:'병사 수 +1. 대신 병사 개별 체력 -22%.',condition:()=>true,apply:m=>{m.matrixExtraSoldiers+=1;m.matrixHp*=.78}},
  {id:'matrix_camaraderie',name:'전우애',icon:'♟♟',rarity:'rare',category:'모모세포',description:'여러 병사가 같은 적을 공격할수록 병사 피해 증가. 최대 +60%.',condition:()=>true,apply:()=>{}},
  {id:'matrix_regrowth',name:'고속 재생산',icon:'↻',rarity:'common',category:'모모세포',description:'죽은 병사의 재생성 대기시간 -35%.',condition:()=>true,apply:m=>{m.matrixRespawn*=.65}},
  {id:'matrix_guardroot',name:'수호 모근',icon:'▰',rarity:'rare',category:'모모세포',description:'병사가 보스에게 받는 피해 -25%, DHT에게 받는 피해 -10%.',condition:()=>true,apply:()=>{}},

  {id:'hero_finisher',name:'막타 전문가',icon:'★',rarity:'common',category:'영웅',description:'영웅이 직접 막타를 치면 영양분 +3.',condition:()=>true,apply:()=>{}},
  {id:'hero_indomitable',name:'불굴의 한 올',icon:'!',rarity:'rare',category:'영웅',description:'영웅 HP가 40% 이하일 때 공격력과 공격속도 +45%.',condition:()=>true,apply:()=>{}},
  {id:'hero_commander',name:'두피 지휘관',icon:'♛',rarity:'epic',category:'영웅',description:'한 올의 희망 오라 범위 +20%, 공속 강화 효과가 더 강해짐.',condition:()=>true,apply:m=>{m.heroAuraMult*=1.18;m.heroAuraRadius*=1.20}},
  {id:'hero_learning',name:'전투 학습',icon:'XP',rarity:'common',category:'영웅',description:'영웅 경험치 획득량 +35%.',condition:()=>true,apply:m=>{m.heroXpMult*=1.35}},
  {id:'hero_laststand',name:'악착같은 모근',icon:'1',rarity:'epic',category:'영웅',description:'웨이브마다 1회, 치명상을 HP 1로 버티고 주변 적을 잠깐 기절.',condition:()=>true,apply:()=>{}},

  {id:'global_nutrition',name:'영양 과잉',icon:'🌱',rarity:'rare',category:'범용',description:'적 처치 영양분 +20%. 대신 이후 등장하는 적 HP +10%.',condition:()=>true,apply:m=>{m.nutritionMult*=1.20;m.enemyHpMult*=1.10}},
  {id:'global_growth',name:'급성 성장기',icon:'↯',rarity:'rare',category:'범용',description:'모든 타워 공격속도 +15%. 대신 판매 회수율이 50%로 감소.',condition:()=>true,apply:m=>{m.allTowerRate*=.87;m.sellRate=.50}},
  {id:'global_allin',name:'한 올 몰빵',icon:'♠',rarity:'epic',category:'범용',description:'현재 가장 비싼 타워 공격력/공속 +40%. 다른 타워는 -8%.',condition:()=>true,apply:()=>{}},
  {id:'global_firstresponse',name:'초기 대응',icon:'8s',rarity:'common',category:'범용',description:'각 웨이브 시작 후 8초간 모든 타워 공격속도 +25%.',condition:()=>true,apply:()=>{}},
  {id:'global_recycle',name:'모낭 재활용',icon:'♻',rarity:'rare',category:'범용',description:'타워 판매 회수율 85%. 대신 이후 건설/업그레이드 비용 +8%.',condition:()=>true,apply:m=>{m.sellRate=.85;m.buildCostMult*=1.08}}
 ],
 get(id){return this.definitions.find(a=>a.id===id)},
 has(id){return !!game?.acquiredAugments?.includes(id)},
 getChoices(count=3){
  const eligible=this.definitions.filter(a=>(a.stackable||!game.acquiredAugments.includes(a.id))&&(a.condition?.()??true));
  const pool=[...eligible],result=[];
  while(result.length<count&&pool.length){
   const total=pool.reduce((s,a)=>s+(this.rarityWeight[a.rarity]||1),0);
   let r=game.augmentRng()*total,index=0;
   for(;index<pool.length;index++){
    r-=this.rarityWeight[pool[index].rarity]||1;
    if(r<=0)break;
   }
   result.push(pool.splice(Math.min(index,pool.length-1),1)[0]);
  }
  return result;
 },
 offer(){
  if(game.over||game.augmentSelecting)return;
  const choices=this.getChoices(3);if(!choices.length)return;
  game.paused=true;game.augmentSelecting=true;syncUI();
  ui.augmentCards.innerHTML=choices.map(a=>`<button class="augmentCard ${a.rarity}" data-augment="${a.id}"><span class="augRarity">${this.rarityLabel[a.rarity]}</span><div class="augIcon">${a.icon}</div><div class="augName">${a.name}</div><div class="augDesc">${a.description}</div><div class="augTarget">적용: ${a.category}</div></button>`).join('');
  ui.augmentOverlay.classList.add('show');
  ui.augmentCards.querySelectorAll('[data-augment]').forEach(btn=>btn.onclick=()=>this.choose(btn.dataset.augment));
 },
 choose(id){
  const a=this.get(id);if(!a||(!a.stackable&&game.acquiredAugments.includes(id)))return;
  game.acquiredAugments.push(id);a.apply?.(game.augMods);
  if(id==='matrix_mass'){for(const soldier of game.soldiers){soldier.maxHp*=.78;soldier.hp=Math.min(soldier.hp,soldier.maxHp)}}
  game.stats.augments.push(id);
  ui.augmentOverlay.classList.remove('show');game.augmentSelecting=false;game.paused=false;
  playSfx('upgrade');toast(`증강 획득: ${a.name}`);updateAugmentTracker();syncUI();
 }
};



const storySlides=[
 {image:'./assets/intro/intro1.jpg', text:'2030년, 91년생 이상연.. 그는 첫 여자친구 이후.. 아직도 여자친구를 못 사귄 채 허송세월을 보내고 있다.. 그렇게 처자는 이상연..'},
 {image:'./assets/intro/intro2.png', text:'그는 모르고 있었다..'},
 {image:'./assets/intro/intro3.jpg', text:'그가 자는 동안에도 계속에서 그의 머리 안에서는 혈투가 벌어지고 있다는 사실...!'},
 {image:'./assets/intro/intro4.jpg', text:''}
];
let storyIndex=0;
let storyTypingTimer=null;
let storyAutoTimer=null;
let storyFullText='';
let storyPos=0;
let storyTypingDone=false;
let endingTimer=null;
let eventTimer=null;

function clearStoryTimers(){
 if(storyTypingTimer){clearInterval(storyTypingTimer);storyTypingTimer=null}
 if(storyAutoTimer){clearTimeout(storyAutoTimer);storyAutoTimer=null}
}

function escapeStoryText(value){
 return value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function drawStoryText(){
 const visible=escapeStoryText(storyFullText.slice(0,storyPos));
 ui.storyText.innerHTML=visible + (!storyTypingDone && storyFullText ? '<span id="storyCaret"></span>' : '');
}

function finishStoryTyping(){
 if(storyTypingDone)return;
 if(storyTypingTimer){clearInterval(storyTypingTimer);storyTypingTimer=null}
 storyPos=storyFullText.length;
 storyTypingDone=true;
 drawStoryText();
}

function beginStoryTyping(text){
 clearStoryTimers();
 storyFullText=text||'';
 storyPos=0;
 storyTypingDone=storyFullText.length===0;
 drawStoryText();

 if(storyTypingDone){
   if(storyIndex===storySlides.length-1){
     storyAutoTimer=setTimeout(endStory,1700);
   }
   return;
 }

 storyTypingTimer=setInterval(()=>{
   storyPos++;
   if(storyPos>=storyFullText.length){
     storyPos=storyFullText.length;
     storyTypingDone=true;
     clearInterval(storyTypingTimer);
     storyTypingTimer=null;
   }
   drawStoryText();
 },38);
}

function showStory(index=0){
 storyIndex=index;
 game.introActive=true;
 ui.story.style.display='flex';
 updateStory();
}

function updateStory(){
 const slide=storySlides[storyIndex];
 ui.storyCount.textContent=`${storyIndex+1} / ${storySlides.length}`;
 ui.storyImage.src=slide.image;
 ui.storyImage.alt=`오프닝 ${storyIndex+1}`;
 ui.storyNext.textContent=storyIndex===storySlides.length-1?'방어 시작 ▶':'다음 ▶';
 beginStoryTyping(slide.text);
}

function nextStory(){
 if(!storyTypingDone){
   finishStoryTyping();
   return;
 }
 clearStoryTimers();
 if(storyIndex<storySlides.length-1){
   storyIndex++;
   updateStory();
 }else{
   endStory();
 }
}

function endStory(){
 clearStoryTimers();
 ui.story.style.display='none';
 game.introActive=false;
 ensureAudioContext();
 startBgm();
 toast('방어전 시작! 빈 모낭을 눌러 타워를 심으세요.');
}

function hasAugment(id){return AugmentManager.has(id)}
function updateAugmentTracker(){
 const ids=game?.acquiredAugments||[];
 ui.augmentCount.textContent=ids.length;
 ui.augmentList.textContent=ids.length?ids.map(id=>AugmentManager.get(id)?.name||id).join(' · '):'없음';
}
function showEventBanner(title,body,duration=2200,pauseGame=true,onDone=null){
 if(eventTimer){clearTimeout(eventTimer);eventTimer=null}
 ui.eventBannerTitle.textContent=title;
 ui.eventBannerText.textContent=body;
 ui.eventBanner.classList.add('show');
 if(pauseGame)game.paused=true;
 eventTimer=setTimeout(()=>{
  ui.eventBanner.classList.remove('show');
  eventTimer=null;
  if(pauseGame&&!game.over&&!game.augmentSelecting)game.paused=false;
  if(onDone)onDone();
 },duration);
}
function grantGold(amount,reason=''){
 const n=Math.max(0,Math.floor(amount));
 game.gold+=n;
 if(game.stats)game.stats.nutritionEarned+=n;
 return n;
}
function towerInvested(t){
 if(Number.isFinite(t.invested))return t.invested;
 const d=towerDefs[t.type];if(!d)return 0;
 let spent=Math.round(d.cost*game.augMods.buildCostMult);
 if(t.level>=2)spent+=Math.round(d.cost*.9*game.augMods.buildCostMult);
 if(t.level>=3)spent+=Math.round(d.cost*1.15*game.augMods.buildCostMult);
 if(t.branch)spent+=Math.round(branches[t.type][t.branch].cost*game.augMods.buildCostMult);
 return spent;
}
function isAllInTower(t){
 if(!hasAugment('global_allin')||!game.towers.length)return false;
 let best=game.towers[0],bestCost=towerInvested(best);
 for(const x of game.towers){const c=towerInvested(x);if(c>bestCost){best=x;bestCost=c}}
 return best===t;
}
function applySlow(e,duration,factor){
 if(!e||e.dead)return false;
 if(e.ccBlockReady){e.ccBlockReady=false;toast(`${enemyDefs[e.type].name}: 완고함으로 슬로우 무효`);return false}
 e.slow=Math.max(e.slow||0,duration);e.slowFactor=Math.min(e.slowFactor||1,factor);return true;
}
function applyStun(e,duration){
 if(!e||e.dead)return false;
 if(e.ccBlockReady){e.ccBlockReady=false;toast(`${enemyDefs[e.type].name}: 완고함으로 기절 무효`);return false}
 e.stun=Math.max(e.stun||0,duration);return true;
}


let game;

function reset(){
 clearStoryTimers();
 stopBgm();
 if(endingTimer){clearTimeout(endingTimer);endingTimer=null}
 if(eventTimer){clearTimeout(eventTimer);eventTimer=null}
 const runSeed=(Date.now()^Math.floor(Math.random()*0xffffffff))>>>0;
 game={
  gold:265,life:20,wave:0,inWave:false,queue:[],spawnClock:0,enemies:[],towers:[],bullets:[],zones:[],soldiers:[],
  selectedPad:null,selectedTower:null,selectedHero:false,action:null,actionTower:null,time:0,over:false,introActive:true,paused:false,
  dragSelecting:false,dragStart:null,dragEnd:null,suppressNextClick:false,hoverEnemy:null,hoverX:0,hoverY:0,
  runSeed,wavePlans:[],currentWavePlan:null,mutationRng:mulberry32(runSeed^0x51f15e),augmentRng:mulberry32(runSeed^0xa7719),
  acquiredAugments:[],augMods:createAugmentMods(),augmentSelecting:false,
  earlyStreak:0,firstResponseUntil:0,towerSerial:0,enemySerial:0,
  hero:{x:520,y:335,targetX:520,targetY:335,hp:160,maxHp:160,attackCd:0,level:1,xp:0,dead:false,respawn:0,
        shieldUntil:0,auraUntil:0,rebirthReady:true,augmentLastStandReady:true,skillCd:{fortify:0,hope:0,guard:0}},
  skillCd:{mino:0,massage:0,nutri:0},
  stats:{towerBuilt:0,evolutions:0,heroKills:0,earlyCalls:0,maxEarlyStreak:0,nutritionEarned:0,totalKills:0,augments:[],towerRecords:{}}
 };
 game.wavePlans=WaveGenerator.generateCampaign(runSeed);
 pads.forEach(p=>p.tower=null);
 ui.modal.style.display='none';ui.augmentOverlay.classList.remove('show');ui.eventBanner.classList.remove('show');
 ui.restartBtn.textContent='처음으로 돌아가기';
 closePanel();updateAugmentTracker();syncUI();
 setTimeout(()=>showStory(0),0);
}
reset();

const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;

let totalPath=0;
for(let i=0;i<path.length-1;i++) totalPath+=dist(path[i],path[i+1]);

function pathPos(progress){
 let remain=progress;
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],len=dist(a,b);
  if(remain<=len){const t=remain/len;return{x:lerp(a.x,b.x,t),y:lerp(a.y,b.y,t),seg:i}}
  remain-=len;
 }
 return{x:path[path.length-1].x,y:path[path.length-1].y,seg:path.length-2};
}
function nearestProgress(x,y){
 let best={d:1e9,p:0,x:0,y:0},acc=0;
 for(let i=0;i<path.length-1;i++){
  const a=path[i],b=path[i+1],vx=b.x-a.x,vy=b.y-a.y,l2=vx*vx+vy*vy;
  const t=clamp(((x-a.x)*vx+(y-a.y)*vy)/l2,0,1),px=a.x+vx*t,py=a.y+vy*t,d=Math.hypot(x-px,y-py);
  if(d<best.d)best={d,p:acc+Math.sqrt(l2)*t,x:px,y:py};
  acc+=Math.sqrt(l2);
 }
 return best;
}

function waveSummary(index){
 const plan=game.wavePlans?.[index];if(!plan)return '없음';
 return Object.entries(plan.counts).filter(([,n])=>n>0).map(([k,n])=>`${enemyDefs[k].name} ×${n}`).join(' · ');
}
function earlyBonus(){return Math.min(78,18+game.enemies.length*2+game.earlyStreak*6)}
function canEarly(){
 return game.inWave&&!game.paused&&game.queue.length===0&&game.enemies.length>0&&game.wave<15&&!MILESTONE_WAVES.has(game.wave);
}

function syncUI(){
 if(!game)return;
 ui.gold.textContent=Math.floor(game.gold);ui.life.textContent=game.life;ui.wave.textContent=`${game.wave}/15`;
 if(game.over||game.paused||game.augmentSelecting){ui.waveBtn.disabled=true}
 else if(canEarly()){ui.waveBtn.disabled=false;ui.waveBtn.textContent=`⚡ 조기 호출 +${earlyBonus()}${game.earlyStreak?` · 연속 ${game.earlyStreak+1}`:''}`}
 else if(game.inWave){ui.waveBtn.disabled=true;ui.waveBtn.textContent='적 등장 중...'}
 else if(game.wave<15){ui.waveBtn.disabled=false;ui.waveBtn.textContent='▶ 다음 웨이브'}
 else{ui.waveBtn.disabled=true;ui.waveBtn.textContent='최종전'}
 const next=game.wave<15?game.wave+1:null;
 if(next){
  const plan=game.wavePlans[next-1];
  const mutation=plan?.mutationChance?` · 변이 확률 ${Math.round(plan.mutationChance*100)}%`:'';
  ui.preview.innerHTML=`<b>다음 웨이브 ${next}</b><br>${waveSummary(next-1)}<br><span style="color:#d8b8bf">위협도 ${plan?.threat??'-'}${mutation}</span><br><span style="color:#bca8ae">물리 방어 높은 적 → 모유두 · 특수 저항 높은 적 → 모발/케라틴</span>`;
 }else ui.preview.innerHTML=`<b>최종 웨이브 진행 중</b><br>유전적 민감성을 막아라.`;
}

function toast(msg){
 ui.toast.textContent=msg;ui.toast.style.opacity=1;clearTimeout(toast.t);
 toast.t=setTimeout(()=>ui.toast.style.opacity=0,2200);
}
function closePanel(){ui.panel.style.display='none';if(game){game.selectedPad=null}}

function startWave(){
 if(game.over||game.paused||game.augmentSelecting||game.wave>=15)return;
 const early=canEarly();
 if(game.inWave&&!early)return;
 if(early){
  const b=earlyBonus();grantGold(b,'early');game.earlyStreak++;game.stats.earlyCalls++;game.stats.maxEarlyStreak=Math.max(game.stats.maxEarlyStreak,game.earlyStreak);
  toast(`탈모 인자 조기 호출! 영양분 +${b} · 연속 ${game.earlyStreak}`);
 }
 game.wave++;game.inWave=true;playSfx('wave');game.spawnClock=0;game.hero.rebirthReady=true;game.hero.augmentLastStandReady=true;
 if(hasAugment('global_firstresponse'))game.firstResponseUntil=game.time+8;
 const plan=game.wavePlans[game.wave-1];game.currentWavePlan=plan;
 let q=[],t=.24;
 for(const g of plan.groups){
  for(let i=0;i<g.n;i++){q.push({at:t,type:g.type,wave:game.wave});t+=g.gap}
  t+=game.wave>=11?.34:.48;
 }
 game.queue=q;
 if(!early){
  if(game.wave===10)showEventBanner('중간보스 출현','스트레스가 두피 전체를 과로 상태로 만들려 한다.',1500,true);
  else if(game.wave===15)showEventBanner('결국... 올 것이 왔다.','최종보스 「유전적 민감성」. 모든 수단을 총동원하라.',1900,true);
  else toast(`웨이브 ${game.wave} 시작`);
 }
 syncUI();
}

function spawnEnemy(type,waveId,opts={}){
 const d=enemyDefs[type];if(!d)return null;
 const hpMult=(opts.hpMult||1)*(game.augMods?.enemyHpMult||1);
 const baseHp=d.hp*hpMult;
 const e={
  id:`e${++game.enemySerial}`,type,waveId,progress:opts.progress??0,x:path[0].x,y:path[0].y,hp:baseHp,maxHp:baseHp,speed:d.speed*(opts.speedMult||1),
  reward:opts.reward??d.reward,leak:opts.leak??d.leak,size:d.size*(opts.sizeMult||1),phys:d.phys,spec:d.spec,melee:d.melee,color:d.color,
  slow:0,slowFactor:1,stun:0,blockId:null,flash:0,dead:false,shield:(d.shield||0)*hpMult,maxShield:(d.shield||0)*hpMult,
  lastDamagedAt:game.time,tempSpeedUntil:0,tempSpeedMult:1,mutation:null,ccBlockReady:false,
  bossCd:type==='stress'?3.8:0,bossPhase:type==='genetic'?1:0,summonCd:type==='genetic'?5.5:0,zoneCd:type==='genetic'?8:0,dormancyCd:type==='genetic'?6:0
 };
 if(e.progress>0){const pos=pathPos(e.progress);e.x=pos.x;e.y=pos.y}
 MutationSystem.assign(e,waveId,opts);
 if(e.shield&&!e.maxShield)e.maxShield=e.shield;
 game.enemies.push(e);return e;
}
function spawnEnemyAtProgress(type,progress,waveId,opts={}){
 return spawnEnemy(type,waveId,{...opts,progress:clamp(progress,0,totalPath-25)});
}

function towerStats(t){
 const d=towerDefs[t.type];
 const levelTable={
  fuzz:{1:{damage:1,range:1,rate:1},2:{damage:1.34,range:1.06,rate:.94},3:{damage:1.76,range:1.12,rate:.88}},
  papilla:{1:{damage:1,range:1,rate:1},2:{damage:1.31,range:1.07,rate:.96},3:{damage:1.70,range:1.14,rate:.91}},
  keratin:{1:{damage:1,range:1,rate:1,splash:52},2:{damage:1.32,range:1.05,rate:.95,splash:57},3:{damage:1.72,range:1.10,rate:.90,splash:63}},
  matrix:{1:{hp:1,damage:1,range:1},2:{hp:1.34,damage:1.28,range:1.06},3:{hp:1.78,damage:1.62,range:1.12}}
 };
 const lv=levelTable[t.type][Math.max(1,Math.min(3,t.level))],m=game?.augMods||createAugmentMods();
 let s={damage:d.damage*(lv.damage||1),range:d.range*(lv.range||1),rate:d.rate*(lv.rate||1),splash:lv.splash||52,pierce:0,chain:0,stunChance:0,soldiers:3,soldierHp:66*(lv.hp||1),soldierDmg:9*(lv.damage||1)};
 if(t.branch){
  if(t.type==='fuzz'&&t.branch==='long'){s.damage*=1.58;s.range*=1.58;s.rate*=.88;s.pierce=1}
  if(t.type==='fuzz'&&t.branch==='thick'){s.damage*=2.60;s.range*=.94;s.rate*=1.08}
  if(t.type==='papilla'&&t.branch==='igf'){s.damage*=2.02;s.chain=.62}
  if(t.type==='papilla'&&t.branch==='vegf'){s.damage*=1.22;s.range*=1.06}
  if(t.type==='keratin'&&t.branch==='dense'){s.damage*=1.90;s.splash=80}
  if(t.type==='keratin'&&t.branch==='elastic'){s.damage*=1.43;s.splash=62;s.stunChance=.40}
  if(t.type==='matrix'&&t.branch==='assault'){s.soldiers=4;s.soldierHp*=1.38;s.soldierDmg*=1.82}
  if(t.type==='matrix'&&t.branch==='guard'){s.soldiers=3;s.soldierHp*=2.48;s.soldierDmg*=1.24}
 }
 if(t.type==='fuzz'){s.damage*=m.fuzzDamage*m.allTowerDamage;s.range*=m.fuzzRange;s.rate*=m.fuzzRate*m.allTowerRate}
 if(t.type==='papilla'){s.damage*=m.papillaDamage*m.allTowerDamage;s.range*=m.papillaRange;s.rate*=m.papillaRate*m.allTowerRate}
 if(t.type==='keratin'){s.damage*=m.keratinDamage*m.allTowerDamage;s.range*=m.keratinRange;s.rate*=m.keratinRate*m.allTowerRate;s.splash*=m.keratinSplash;if(hasAugment('keratin_chain'))s.stunChance+=.15}
 if(t.type==='matrix'){s.range*=1;s.soldierHp*=m.matrixHp;s.soldierDmg*=m.matrixDamage*m.allTowerDamage;s.soldiers+=m.matrixExtraSoldiers}
 return s;
}

function buildTower(type){
 if(game.selectedPad==null)return;
 const pad=pads[game.selectedPad],d=towerDefs[type];if(pad.tower)return;
 const cost=Math.round(d.cost*game.augMods.buildCostMult);
 if(game.gold<cost){toast('영양분이 부족합니다.');return}
 game.gold-=cost;playSfx('build');
 const np=nearestProgress(pad.x,pad.y);
 const t={id:`t${++game.towerSerial}`,type,x:pad.x,y:pad.y,level:1,branch:null,cooldown:Math.random()*.3,buffUntil:0,nutriUntil:0,silencedUntil:0,flowBuffUntil:0,
          rallyP:np.p,initialized:false,nextRespawn:0,invested:cost,lastTargetId:null,sameTargetStacks:0,shotCount:0,empoweredShots:0};
 game.towers.push(t);pad.tower=t;game.stats.towerBuilt++;
 game.stats.towerRecords[t.id]={label:d.name,damage:0,kills:0};
 openTowerPanel(t);syncUI();
}
function upgradeTower(t){
 if(t.level>=3){toast('최종 진화 두 갈래 중 하나를 선택하세요.');return}
 const d=towerDefs[t.type],cost=Math.round(d.cost*(t.level===1?.9:1.15)*game.augMods.buildCostMult);
 if(game.gold<cost){toast('영양분이 부족합니다.');return}
 game.gold-=cost;t.invested=(t.invested||0)+cost;t.level++;playSfx('upgrade');toast(`${d.name} Lv.${t.level} 성장!`);openTowerPanel(t);syncUI();
}
function evolveTower(t,key){
 if(t.level<3||t.branch)return;
 const b=branches[t.type][key],cost=Math.round(b.cost*game.augMods.buildCostMult);
 if(game.gold<cost){toast('영양분이 부족합니다.');return}
 game.gold-=cost;t.invested=(t.invested||0)+cost;t.branch=key;t.initialized=false;playSfx('upgrade');game.stats.evolutions++;
 if(game.stats.towerRecords[t.id])game.stats.towerRecords[t.id].label=b.name;
 toast(`${b.name}으로 최종 진화!`);openTowerPanel(t);syncUI();
}
function sellTower(t){
 const spent=towerInvested(t);const back=Math.floor(spent*game.augMods.sellRate);game.gold+=back;
 game.soldiers=game.soldiers.filter(s=>s.parent!==t);
 const p=pads.find(p=>p.tower===t);if(p)p.tower=null;
 game.towers=game.towers.filter(x=>x!==t);game.selectedTower=null;closePanel();syncUI();toast(`모낭 회수 +${back}`);
}

function openBuildPanel(idx){
 game.selectedPad=idx;game.selectedTower=null;game.selectedHero=false;
 ui.panel.style.display='block';ui.panelTitle.textContent='빈 모낭에 성장 요소 심기';
 ui.panelDesc.innerHTML='<span class="badge phys">물리</span>와 <span class="badge spec">특수</span> 상성을 보고 섞어 심는 것이 중요합니다.';
 ui.panelBody.innerHTML='<div class="grid">'+Object.entries(towerDefs).map(([k,d])=>`
 <button class="towerBtn" data-build="${k}">
 <b>${d.icon} ${d.name} · ${Math.round(d.cost*game.augMods.buildCostMult)}</b><small>${d.desc}</small></button>`).join('')+'</div>';
 ui.panelBody.querySelectorAll('[data-build]').forEach(b=>b.onclick=()=>buildTower(b.dataset.build));
}
function openTowerPanel(t){
 game.selectedTower=t;game.selectedPad=null;game.selectedHero=false;
 const d=towerDefs[t.type],s=towerStats(t),kind=d.kind==='special'?'특수':'물리';
 ui.panel.style.display='block';
 ui.panelTitle.textContent=`${d.icon} ${t.branch?branches[t.type][t.branch].name:d.name} · ${t.branch?'최종':`Lv.${t.level}`}`;
 ui.panelDesc.innerHTML=`<span class="badge ${d.kind==='special'?'spec':'phys'}">${kind}</span> ${d.desc}`;
 let html=`<p>공격력 ${t.type==='matrix'?Math.round(s.soldierDmg)+' / 병사':Math.round(s.damage)} · 사거리 ${Math.round(s.range)}</p>`;
 if(t.level<3&&!t.branch){
  const preview={...t,level:t.level+1},ns=towerStats(preview);
  html+=`<p style="color:#f0d79d">다음 성장 → 공격 ${t.type==='matrix'?Math.round(ns.soldierDmg):Math.round(ns.damage)} · 사거리 ${Math.round(ns.range)}${t.type==='matrix'?` · 병사 HP ${Math.round(ns.soldierHp)}`:''}</p>`;
  const c=Math.round(d.cost*(t.level===1?.9:1.15)*game.augMods.buildCostMult);
  html+=`<div class="grid"><button id="upgradeBtn">⬆ 성장 ${c}</button><button id="sellBtn">↩ 회수</button></div>`;
 }else if(t.level===3&&!t.branch){
  const opts=Object.entries(branches[t.type]);
  html+=`<p><b>최종 진화 선택</b> — 이후 되돌릴 수 없음</p><div class="grid">`+
  opts.map(([k,b])=>`<button class="towerBtn branchBtn" data-evolve="${k}"><b>${b.name} · ${Math.round(b.cost*game.augMods.buildCostMult)}</b><small>${b.desc}</small></button>`).join('')+
  `</div><button id="sellBtn" style="width:100%;margin-top:6px">↩ 회수</button>`;
 }else{
  html+=`<p>${branches[t.type][t.branch].desc}</p><button id="sellBtn" style="width:100%">↩ 회수</button>`;
 }
 if(t.type==='matrix')html+=`<button id="rallyBtn" style="width:100%;margin-top:6px;background:#28585c">📍 병사 집결지 지정</button>`;
 ui.panelBody.innerHTML=html;
 const up=document.getElementById('upgradeBtn');if(up)up.onclick=()=>upgradeTower(t);
 ui.panelBody.querySelectorAll('[data-evolve]').forEach(b=>b.onclick=()=>evolveTower(t,b.dataset.evolve));
 const sell=document.getElementById('sellBtn');if(sell)sell.onclick=()=>sellTower(t);
 const rally=document.getElementById('rallyBtn');if(rally)rally.onclick=()=>{game.action='rally';game.actionTower=t;toast('모모세포 주변의 길을 클릭해 집결지를 지정하세요.');};
}

function heroSkillInfo(){
 return[
  {key:'fortify',lv:2,name:'악착같이 버티기',desc:'즉시 HP 72 회복 + 5.5초간 피해 70% 감소',cd:18},
  {key:'hope',lv:4,name:'한 올의 희망',desc:'9초간 영웅 주변 타워 공격속도 +35%',cd:28},
  {key:'guard',lv:6,name:'두피 사수',desc:'주변 적에게 특수 피해 48 + 2.7초 기절',cd:34}
 ];
}
function openHeroPanel(){
 game.selectedHero=true;game.selectedTower=null;game.selectedPad=null;
 const h=game.hero;ui.panel.style.display='block';ui.panelTitle.textContent='〽 이상연의 마지막 머리카락';
 ui.panelDesc.textContent='영웅을 선택한 뒤 바닥을 클릭하면 이동. 가까운 적을 자동 공격한다.';
 let html=`<p>Lv.${h.level} · HP ${Math.ceil(h.hp)}/${h.maxHp} · XP ${Math.floor(h.xp)}</p><div class="grid">`;
 for(const s of heroSkillInfo()){
  const locked=h.level<s.lv,cd=h.skillCd[s.key];
  html+=`<button class="towerBtn" data-hero="${s.key}" ${locked||cd>0?'disabled':''}><b>${s.name}${locked?` · Lv.${s.lv}`:cd>0?` · ${cd.toFixed(1)}초`:''}</b><small>${s.desc}</small></button>`;
 }
 html+=`</div><p>${h.level>=8?'🌱 휴지기 거부 활성: 웨이브당 1회 빠른 재생':'Lv.8 패시브: 휴지기 거부'}</p>`;
 ui.panelBody.innerHTML=html;
 ui.panelBody.querySelectorAll('[data-hero]').forEach(b=>b.onclick=()=>useHeroSkill(b.dataset.hero));
}
function useHeroSkill(key){
 const h=game.hero,info=heroSkillInfo().find(s=>s.key===key);
 if(!info||h.level<info.lv||h.skillCd[key]>0||h.dead)return;
 h.skillCd[key]=info.cd;
 if(key==='fortify'){h.hp=Math.min(h.maxHp,h.hp+72);h.shieldUntil=game.time+5.5;toast('악착같이 버티기! 모근을 꽉 붙잡았다.')}
 if(key==='hope'){h.auraUntil=game.time+9;toast('한 올의 희망! 주변 타워 공속 상승')}
 if(key==='guard'){
  for(const e of game.enemies)if(!e.dead&&dist(h,e)<112){damageEnemy(e,48,'special','hero');applyStun(e,2.7)}
  game.zones.push({x:h.x,y:h.y,r:112,life:.45,max:.45,type:'hero'});toast('두피 사수! 주변 탈모 인자 기절');
 }
 openHeroPanel();
}

function gainHeroXp(extra=0){
 const h=game.hero;if(h.level>=10)return;
 h.xp+=(3+extra)*game.augMods.heroXpMult;
 let need=24+h.level*12;
 while(h.xp>=need&&h.level<10){
  h.xp-=need;h.level++;h.maxHp+=18;h.hp=h.maxHp;toast(`마지막 머리카락 Lv.${h.level}! 영웅 능력이 성장했습니다.`);need=24+h.level*12;
 }
}

function damageEnemy(e,amount,kind,source){
 if(!e||e.dead||!Number.isFinite(amount))return 0;
 let resist=kind==='special'?e.spec:e.phys;
 if(kind==='special'&&e.specialExposeUntil>game.time)resist=Math.max(0,resist-.12);
 let mult=Math.max(.05,1-resist);
 for(const i of game.enemies)if(i!==e&&!i.dead&&i.type==='insulin'&&dist(i,e)<92){mult*=.84;break}
 let incoming=Math.max(0,amount*mult),dealt=0;
 if(e.shield>0){const absorbed=Math.min(e.shield,incoming);e.shield-=absorbed;incoming-=absorbed;dealt+=absorbed}
 if(incoming>0){const before=e.hp;e.hp-=incoming;dealt+=Math.min(before,incoming)}
 e.lastDamagedAt=game.time;e.flash=.08;playSfx('hit');
 if(source&&typeof source==='object'&&source.id&&game.stats.towerRecords[source.id])game.stats.towerRecords[source.id].damage+=dealt;
 if(e.hp<=0)killEnemy(e,source);
 return dealt;
}
function killEnemy(e,source){
 if(!e||e.dead)return;e.dead=true;playSfx('death');game.stats.totalKills++;
 const reward=Math.round(e.reward*game.augMods.nutritionMult);grantGold(reward,'kill');
 if(source==='hero'){
  game.stats.heroKills++;gainHeroXp(8);
  if(hasAugment('hero_finisher'))grantGold(3,'hero-finisher');
 }else{
  gainHeroXp(0);
  if(source&&source.id&&game.stats.towerRecords[source.id]){
   game.stats.towerRecords[source.id].kills++;
   if(source.type==='papilla'&&hasAugment('papilla_rampage'))source.empoweredShots=Math.max(1,source.empoweredShots||0);
  }
 }
 if(e.type==='inflame')game.zones.push({x:e.x,y:e.y,r:72,life:7,max:7,type:'inflame'});
 if(e.deathHaste){
  for(const x of game.enemies)if(x!==e&&!x.dead&&dist(x,e)<90){x.tempSpeedUntil=Math.max(x.tempSpeedUntil,game.time+3);x.tempSpeedMult=Math.max(x.tempSpeedMult||1,1.20)}
  game.zones.push({x:e.x,y:e.y,r:90,life:.45,max:.45,type:'haste'});
 }
 if(e.splitOnDeath){
  spawnEnemyAtProgress('alcohol',e.progress-8,e.waveId,{hpMult:.45,sizeMult:.72,reward:2,noMutation:true,leak:1,speedMult:1.15});
  spawnEnemyAtProgress('alcohol',e.progress-22,e.waveId,{hpMult:.45,sizeMult:.72,reward:2,noMutation:true,leak:1,speedMult:1.15});
 }
}

function towerSpeedFactor(t){
 let f=1;
 for(const e of game.enemies){
  if(e.dead||e.type!=='dht'||dist(e,t)>=115||!(t.type==='fuzz'||t.type==='matrix'))continue;
  const smokeBoost=game.enemies.some(x=>!x.dead&&x.type==='smoking'&&dist(x,e)<90);
  let debuff=smokeBoost?.62:.72;
  if(t.type==='fuzz'&&hasAugment('fuzz_dhtproof'))debuff=smokeBoost?.80:.87;
  f*=debuff;
 }
 for(const z of game.zones)if(z.type==='inflame'&&dist(z,t)<z.r)f*=.68;
 if(game.time<t.buffUntil)f*=1.65;
 if(game.time<t.nutriUntil)f*=1.24;
 if(game.time<(t.flowBuffUntil||0))f*=1.35;
 for(const v of game.towers){
  if(v===t||v.type!=='papilla'||v.branch!=='vegf')continue;
  const r=hasAugment('papilla_vein')?145:124,boost=hasAugment('papilla_vein')?1.42:1.30;
  if(dist(v,t)<r)f*=boost;
 }
 const h=game.hero;
 if(!h.dead&&game.time<h.auraUntil&&dist(h,t)<142*game.augMods.heroAuraRadius)f*=1.35*game.augMods.heroAuraMult;
 if(game.time<game.firstResponseUntil)f*=1.25;
 if(hasAugment('global_allin'))f*=isAllInTower(t)?1.40:.92;
 const minInterval=.075,rate=towerStats(t).rate;
 return Math.min(f,Math.max(1,rate/minInterval));
}
function towerDamageFactor(t){
 let f=1;if(game.time<t.nutriUntil)f*=1.55;
 for(const e of game.enemies){
  if(e.dead||e.type!=='dht'||dist(e,t)>=115||!(t.type==='fuzz'||t.type==='matrix'))continue;
  const smokeBoost=game.enemies.some(x=>!x.dead&&x.type==='smoking'&&dist(x,e)<90);
  let debuff=smokeBoost?.62:.72;
  if(t.type==='fuzz'&&hasAugment('fuzz_dhtproof'))debuff=smokeBoost?.80:.87;
  f*=debuff;
 }
 for(const e of game.enemies)if(!e.dead&&e.type==='sleep'&&dist(e,t)<120){f*=.82;break}
 if(hasAugment('global_allin'))f*=isAllInTower(t)?1.40:.92;
 return f;
}
function towerRangeFactor(t){
 let f=1;
 for(const z of game.zones)if(z.type==='geneticFog'&&dist(z,t)<z.r)f*=.66;
 return Math.max(.48,f);
}
function findTarget(t,range){
 let best=null;
 for(const e of game.enemies)if(!e.dead&&dist(t,e)<=range&&(!best||e.progress>best.progress))best=e;
 return best;
}

function soldierCountAlive(t){return game.soldiers.filter(s=>s.parent===t&&!s.dead).length}
function getSoldierHome(t,slot,count){
 const pp=pathPos(clamp(t.rallyP+(slot-(count-1)/2)*15,0,totalPath-10));
 return{x:pp.x,y:pp.y+(slot%2?7:-7)};
}
function spawnSoldier(t,slot){
 const st=towerStats(t),home=getSoldierHome(t,slot,st.soldiers);
 game.soldiers.push({parent:t,slot,x:home.x,y:home.y,homeX:home.x,homeY:home.y,hp:st.soldierHp,maxHp:st.soldierHp,attackCd:.15,dead:false,id:Math.random()});
}
function ensureSoldiers(t){
 if(t.type!=='matrix')return;
 const st=towerStats(t),respawn=4.2*game.augMods.matrixRespawn;
 const alive=game.soldiers.filter(s=>s.parent===t&&!s.dead);
 if(!t.initialized){for(let i=0;i<st.soldiers;i++)spawnSoldier(t,i);t.initialized=true;t.nextRespawn=game.time+Math.max(1.8,4*game.augMods.matrixRespawn);return}
 if(alive.length<st.soldiers&&game.time>=t.nextRespawn){
  const used=new Set(alive.map(s=>s.slot));let slot=0;while(used.has(slot))slot++;spawnSoldier(t,slot);t.nextRespawn=game.time+Math.max(1.6,respawn);
 }
 for(const s of alive){const h=getSoldierHome(t,s.slot,st.soldiers);s.homeX=h.x;s.homeY=h.y}
}

function updateTowers(dt){
 for(const t of game.towers){
  ensureSoldiers(t);if(game.time<t.silencedUntil)continue;
  const d=towerDefs[t.type],s=towerStats(t);t.cooldown-=dt*towerSpeedFactor(t);if(t.type==='matrix')continue;
  if(t.cooldown<=0){
   const e=findTarget(t,s.range*towerRangeFactor(t));
   if(e){
    let damage=s.damage*towerDamageFactor(t);t.shotCount=(t.shotCount||0)+1;
    if(t.type==='fuzz'&&hasAugment('fuzz_chain')){
     if(t.lastTargetId===e.id)t.sameTargetStacks=Math.min(5,(t.sameTargetStacks||0)+1);else{t.lastTargetId=e.id;t.sameTargetStacks=0}
     damage*=1+.08*t.sameTargetStacks;
    }
    if(t.type==='fuzz'&&hasAugment('fuzz_fifthcrit')&&t.shotCount%5===0)damage*=2;
    if(t.type==='papilla'&&(t.empoweredShots||0)>0){damage*=1.8;t.empoweredShots--}
    if(t.type==='keratin'&&hasAugment('keratin_pressure')&&e.hp/e.maxHp>=.60)damage*=1.25;
    game.bullets.push({x:t.x,y:t.y,target:e,source:t,speed:t.type==='fuzz'?390:305,damage,kind:d.kind,
      splash:t.type==='keratin'?s.splash:0,pierce:s.pierce,chain:s.chain,stunChance:s.stunChance});
    t.cooldown=s.rate;
   }
  }
 }
}
function updateBullets(dt){
 for(const b of game.bullets){
  if(b.dead)continue;const e=b.target;if(!e||e.dead){b.dead=true;continue}
  const dx=e.x-b.x,dy=e.y-b.y,l=Math.hypot(dx,dy);
  if(l<8){
   const source=b.source;
   if(b.splash){
    for(const x of game.enemies)if(!x.dead&&Math.hypot(x.x-e.x,x.y-e.y)<b.splash){damageEnemy(x,b.damage,'physical',source);if(b.stunChance&&Math.random()<b.stunChance)applyStun(x,1.15)}
    if(source?.type==='keratin'&&hasAugment('keratin_center')&&!e.dead)damageEnemy(e,b.damage*.45,'physical',source);
    if(source?.type==='keratin'&&hasAugment('keratin_shrapnel')&&Math.random()<.25){
     const other=game.enemies.find(x=>!x.dead&&x!==e&&dist(x,e)<120);if(other){for(const x of game.enemies)if(!x.dead&&dist(x,other)<36)damageEnemy(x,b.damage*.45,'physical',source);game.zones.push({x:other.x,y:other.y,r:36,life:.18,max:.18,type:'boom'})}
    }
    game.zones.push({x:e.x,y:e.y,r:b.splash,life:.22,max:.22,type:'boom'});
   }else{
    damageEnemy(e,b.damage,b.kind,source);
    if(source?.type==='papilla'&&hasAugment('papilla_expose'))e.specialExposeUntil=game.time+4;
    if(source?.type==='papilla'&&hasAugment('papilla_bloodflow')&&Math.random()<.18){
     const allies=game.towers.filter(t=>t!==source&&dist(t,source)<135);if(allies.length)pickOne(Math.random,allies).flowBuffUntil=game.time+3;
    }
    if(source?.type==='fuzz'&&hasAugment('fuzz_split')&&Math.random()<.20){const other=game.enemies.find(x=>!x.dead&&x!==e&&dist(x,e)<85);if(other)damageEnemy(other,b.damage*.55,b.kind,source)}
    if(b.chain){const other=game.enemies.find(x=>!x.dead&&x!==e&&dist(x,e)<65);if(other)damageEnemy(other,b.damage*b.chain,'special',source)}
    if(b.pierce){const other=game.enemies.find(x=>!x.dead&&x!==e&&Math.abs(x.progress-e.progress)<70);if(other)damageEnemy(other,b.damage*.72,b.kind,source)}
   }
   b.dead=true;
  }else{b.x+=dx/l*b.speed*dt;b.y+=dy/l*b.speed*dt}
 }
 game.bullets=game.bullets.filter(b=>!b.dead);
}

function updateSoldiers(dt){
 for(const s of game.soldiers){
  if(s.dead)continue;s.attackCd-=dt;const st=towerStats(s.parent);let target=null;
  for(const e of game.enemies){if(e.dead)continue;if(Math.hypot(e.x-s.x,e.y-s.y)<27&&Math.hypot(e.x-s.homeX,e.y-s.homeY)<48){target=e;break}}
  if(target){
   target.blockId=s.id;
   if(s.attackCd<=0){
    let dmg=st.soldierDmg;
    if(hasAugment('matrix_camaraderie')){const friends=game.soldiers.filter(x=>!x.dead&&x.parent===s.parent&&Math.hypot(x.x-target.x,x.y-target.y)<30).length;dmg*=1+Math.min(.60,Math.max(0,friends-1)*.20)}
    damageEnemy(target,dmg,'physical',s.parent);s.attackCd=.70;
   }
   let incoming=target.melee*dt;
   if(hasAugment('matrix_guardroot')){if(enemyDefs[target.type]?.boss)incoming*=.75;else if(target.type==='dht')incoming*=.90}
   s.hp-=incoming;
   if(s.hp<=0){
    s.dead=true;s.parent.nextRespawn=Math.max(s.parent.nextRespawn,game.time+Math.max(1.6,4.2*game.augMods.matrixRespawn));if(target.blockId===s.id)target.blockId=null;
    if(hasAugment('matrix_sacrifice')){for(const e of game.enemies)if(!e.dead&&Math.hypot(e.x-s.x,e.y-s.y)<48){damageEnemy(e,32,'physical',s.parent);applyStun(e,.7)}game.zones.push({x:s.x,y:s.y,r:48,life:.25,max:.25,type:'boom'})}
   }
  }else{const dx=s.homeX-s.x,dy=s.homeY-s.y,l=Math.hypot(dx,dy);if(l>2){s.x+=dx/l*68*dt;s.y+=dy/l*68*dt}}
 }
 game.soldiers=game.soldiers.filter(s=>!s.dead);
}

function updateHero(dt){
 const h=game.hero;for(const k in h.skillCd)h.skillCd[k]=Math.max(0,h.skillCd[k]-dt);
 if(h.dead){h.respawn-=dt;if(h.respawn<=0){h.dead=false;h.hp=h.maxHp;h.x=520;h.y=335;h.targetX=h.x;h.targetY=h.y;toast('마지막 머리카락 재성장!')}return}
 const dx=h.targetX-h.x,dy=h.targetY-h.y,l=Math.hypot(dx,dy);if(l>3){h.x+=dx/l*112*dt;h.y+=dy/l*112*dt}
 h.attackCd-=dt;let target=null;for(const e of game.enemies)if(!e.dead&&dist(h,e)<50){target=e;break}
 const desperate=hasAugment('hero_indomitable')&&h.hp/h.maxHp<=.40;
 if(target&&h.attackCd<=0){damageEnemy(target,(18+(h.level-1)*4)*(desperate?1.45:1),'special','hero');h.attackCd=.54/(desperate?1.45:1)}
 if(target){
  let dmg=target.melee*.45*dt;if(game.time<h.shieldUntil)dmg*=.3;h.hp-=dmg;
  if(h.hp<=0){
   if(hasAugment('hero_laststand')&&h.augmentLastStandReady){h.augmentLastStandReady=false;h.hp=1;h.shieldUntil=game.time+2;for(const e of game.enemies)if(!e.dead&&dist(h,e)<80)applyStun(e,1.2);toast('악착같은 모근! 치명상을 버텼다.');return}
   h.hp=0;h.dead=true;if(h.level>=8&&h.rebirthReady){h.rebirthReady=false;h.respawn=1.5;toast('휴지기 거부! 1.5초 후 즉시 재성장')}else{h.respawn=8;toast('마지막 머리카락 탈락... 8초 후 재성장')}
  }
 }
}

function updateGeneticBoss(e,dt){
 const ratio=e.hp/e.maxHp;
 const nextPhase=ratio>.70?1:ratio>.35?2:3;
 if(nextPhase!==e.bossPhase){
  e.bossPhase=nextPhase;
  if(nextPhase===2){e.zoneCd=1.2;showEventBanner('유전 2페이즈','두피 환경 자체가 무너지기 시작한다. 보랏빛 영역 안에서는 타워 사거리가 크게 감소한다.',1500,false)}
  if(nextPhase===3){e.dormancyCd=1.0;showEventBanner('유전 3페이즈 · 광폭','유전이 폭주한다! 이동속도가 상승하고 타워를 강제로 휴지기에 빠뜨린다.',1700,false)}
 }
 if(e.bossPhase===1){
  e.summonCd-=dt;
  if(e.summonCd<=0){
   e.summonCd=6.3;spawnEnemyAtProgress('dht',e.progress-70,e.waveId,{noMutation:true,hpMult:.82,reward:9});
   if(Math.random()<.55)spawnEnemyAtProgress('alcohol',e.progress-105,e.waveId,{noMutation:true,hpMult:.75,reward:3,speedMult:1.08});
   toast('유전: DHT 신호 증폭!');
  }
 }
 if(e.bossPhase===2){
  e.zoneCd-=dt;
  if(e.zoneCd<=0){
   e.zoneCd=6.8;
   const targets=game.towers.filter(t=>game.time>=t.silencedUntil);const target=targets.length?pickOne(Math.random,targets):pathPos(clamp(e.progress+80,0,totalPath));
   game.zones.push({x:target.x,y:target.y,r:92,life:7.5,max:7.5,type:'geneticFog'});toast('유전: 두피 민감 영역 생성! 타워 사거리 감소');
  }
 }
 if(e.bossPhase===3){
  e.dormancyCd-=dt;
  if(e.dormancyCd<=0){
   e.dormancyCd=5.2;
   const victims=[...game.towers].filter(t=>game.time>=t.silencedUntil).sort(()=>Math.random()-.5).slice(0,Math.min(2,game.towers.length));
   victims.forEach(t=>t.silencedUntil=game.time+4.2);if(victims.length)toast('유전: 휴지기 강제 진입! 타워가 잠시 멈춘다.');
  }
 }
}

function updateEnemies(dt){
 for(const e of game.enemies){
  if(e.dead)continue;if(e.flash>0)e.flash-=dt;
  if(e.regen&&game.time-e.lastDamagedAt>2.5&&e.hp<e.maxHp)e.hp=Math.min(e.maxHp,e.hp+e.maxHp*.025*dt);
  if(e.type==='genetic')updateGeneticBoss(e,dt);
  if(e.stun>0){e.stun-=dt;continue}
  if(e.slow>0)e.slow-=dt;else e.slowFactor=1;
  let blocked=false;
  if(e.blockId!=null){const soldier=game.soldiers.find(s=>s.id===e.blockId&&!s.dead);if(soldier&&Math.hypot(soldier.x-e.x,soldier.y-e.y)<35)blocked=true;else e.blockId=null}
  let aura=1;
  if(game.enemies.some(i=>i!==e&&!i.dead&&i.type==='insulin'&&dist(i,e)<92))aura*=1.15;
  if(game.enemies.some(i=>i!==e&&!i.dead&&i.type==='smoking'&&dist(i,e)<88))aura*=e.type==='dht'?1.18:1.10;
  if(game.time<e.tempSpeedUntil)aura*=e.tempSpeedMult||1;
  const bossRamp=e.type==='genetic'&&e.bossPhase===3?1.55:1;
  if(!blocked){e.progress+=e.speed*e.slowFactor*aura*bossRamp*dt;const p=pathPos(e.progress);e.x=p.x;e.y=p.y}
  if(e.type==='stress'){
   e.bossCd-=dt;if(e.bossCd<=0){e.bossCd=5.0;const victims=game.towers.filter(t=>dist(t,e)<190).sort((a,b)=>dist(a,e)-dist(b,e)).slice(0,2);victims.forEach(t=>t.silencedUntil=game.time+3.2);if(victims.length)toast('스트레스의 과로! 가까운 모낭 2개가 잠시 기능 정지')}
  }
  if(e.progress>=totalPath){
   e.dead=true;game.life-=e.leak;toast(`${enemyDefs[e.type].name} 침투! 모낭 -${e.leak}`);if(game.life<=0){game.life=0;lose()}syncUI();
  }
 }
 game.enemies=game.enemies.filter(e=>!e.dead&&e.hp>0);
}

function updateZones(dt){for(const z of game.zones)z.life-=dt;game.zones=game.zones.filter(z=>z.life>0)}
function finishCurrentWave(){
 if(!game.inWave)return;
 game.inWave=false;
 const bonus=28+game.wave*3;grantGold(bonus,'wave');toast(`웨이브 ${game.wave} 정리 완료! 영양분 +${bonus}`);
 game.earlyStreak=0;
 if(game.wave===15){win();return}
 if(game.wave===10){
  showEventBanner('스트레스 격퇴!','휴... 끝난 줄 알았는데, 모낭 깊은 곳에서 더 끔찍한 신호가 감지된다. 아직 끝난 게 아니었다...',2700,true,()=>{syncUI()});
  return;
 }
 if(AUGMENT_WAVES.includes(game.wave)){AugmentManager.offer();return}
 syncUI();
}

function updateSpawns(dt){
 if(!game.inWave)return;game.spawnClock+=dt;
 while(game.queue.length&&game.spawnClock>=game.queue[0].at){const q=game.queue.shift();spawnEnemy(q.type,q.wave)}
 if(game.queue.length===0&&game.enemies.length===0)finishCurrentWave();else syncUI();
}

function useGlobal(skill){
 if(game.over||game.paused||game.augmentSelecting||game.skillCd[skill]>0)return;
 game.action=skill;game.actionTower=null;game.selectedHero=false;game.selectedTower=null;closePanel();
 toast(skill==='massage'?'두피 마사지할 위치를 클릭하세요.':'강화할 모낭 타워를 클릭하세요.');
}
function applyAction(x,y){
 if(!game.action)return false;const a=game.action;
 if(a==='rally'){
  const t=game.actionTower,np=nearestProgress(x,y);if(!t||t.type!=='matrix'){game.action=null;return true}
  if(np.d>28||Math.hypot(np.x-t.x,np.y-t.y)>towerStats(t).range+30){toast('모모세포의 집결 범위 안쪽 길을 클릭하세요.');return true}
  t.rallyP=np.p;game.action=null;game.actionTower=null;toast('병사 집결지 이동!');openTowerPanel(t);return true;
 }
 if(a==='massage'){
  game.skillCd.massage=24;game.zones.push({x,y,r:100,life:6.5,max:6.5,type:'massage'});
  for(const e of game.enemies)if(Math.hypot(e.x-x,e.y-y)<100)applySlow(e,6.5,.52);
  game.action=null;toast('두피 마사지! 이동속도 감소');return true;
 }
 const t=game.towers.find(t=>Math.hypot(t.x-x,t.y-y)<27);if(!t){toast('모낭 타워를 클릭하세요.');return true}
 if(a==='mino'){t.buffUntil=game.time+11;game.skillCd.mino=35;toast('미녹시딜! 11초간 공격속도 크게 증가')}
 if(a==='nutri'){t.nutriUntil=game.time+13;game.skillCd.nutri=42;toast('영양 공급! 13초간 공격력 크게 증가')}
 game.action=null;return true;
}
function updateGlobalSkills(dt){
 for(const k in game.skillCd)game.skillCd[k]=Math.max(0,game.skillCd[k]-dt);
 [['mino',ui.minoCd,ui.minoBtn],['massage',ui.massageCd,ui.massageBtn],['nutri',ui.nutriCd,ui.nutriBtn]].forEach(([k,el,b])=>{
  const c=game.skillCd[k];el.textContent=c>0?`${c.toFixed(1)}초`:'사용 가능';b.disabled=c>0||game.over;
 });
}

function showEnding(type){
 if(endingTimer){clearTimeout(endingTimer);endingTimer=null}
 game.over=true;game.inWave=false;game.introActive=true;game.paused=false;stopBgm();ui.augmentOverlay.classList.remove('show');ui.eventBanner.classList.remove('show');
 ui.restartBtn.textContent='처음으로 돌아가기';
 const records=Object.values(game.stats.towerRecords||{});
 const topDamage=records.sort((a,b)=>b.damage-a.damage)[0];
 const topKills=[...records].sort((a,b)=>b.kills-a.kills)[0];
 const lifeRatio=game.life/20;const grade=lifeRatio>=.8&&game.hero.level>=8?'S':lifeRatio>=.6?'A':lifeRatio>=.3?'B':'C';
 if(type==='lose'){
  playSfx('lose');ui.modalImage.src='./assets/ending/lose.png';ui.modalImage.alt='게임 오버 엔딩';ui.modalTitle.textContent='GAME OVER';ui.modalCaption.textContent='아 시발!';
  ui.modalText.innerHTML=`모낭줄기세포가 무너졌다...<br><b>Wave ${game.wave} · 영웅 Lv.${game.hero.level} · 처치 ${game.stats.totalKills}</b><br><br>잠시 후 처음 시작 장면으로 돌아갑니다.`;
 }else{
  playSfx('win');ui.modalImage.src='./assets/ending/win.png';ui.modalImage.alt='클리어 엔딩';ui.modalTitle.textContent=`ALL CLEAR · ${grade}`;ui.modalCaption.textContent='아 먼가 오늘 나... 잘 생겼다? 훗';
  const augNames=game.acquiredAugments.map(id=>AugmentManager.get(id)?.name).filter(Boolean).join(', ')||'없음';
  ui.modalText.innerHTML=`<b>남은 모낭 ${game.life}/20 · 영웅 Lv.${game.hero.level} · 총 처치 ${game.stats.totalKills}</b><br>`+
   `타워 건설 ${game.stats.towerBuilt} · 최종 진화 ${game.stats.evolutions} · 조기 호출 ${game.stats.earlyCalls} · 최고 연속 ${game.stats.maxEarlyStreak}<br>`+
   `영웅 막타 ${game.stats.heroKills} · 획득 영양분 ${game.stats.nutritionEarned}<br>`+
   `최고 피해 타워 ${topDamage?`${topDamage.label} (${Math.round(topDamage.damage)})`:'없음'} · 최다 처치 타워 ${topKills?`${topKills.label} (${topKills.kills})`:'없음'}<br>`+
   `<span style="color:#d9b7c7">증강: ${augNames}</span><br><br>잠시 후 처음 시작 장면으로 돌아갑니다.`;
 }
 ui.modal.style.display='flex';syncUI();endingTimer=setTimeout(()=>reset(),type==='win'?10000:4800);
}
function lose(){
 if(game.over)return;
 showEnding('lose');
}
function win(){
 if(game.over)return;
 showEnding('win');
}

function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}
function text(s,x,y,size=12,align='center',c='#fff'){ctx.font=`bold ${size}px monospace`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle=c;ctx.fillText(s,Math.round(x),Math.round(y))}

function drawScalp(){
 // 실제 머리 위를 내려다보는 느낌: 검은 모발 사이로 드러난 두피
 rect(0,0,W,H,'#171416');

 // 머리 덩어리
 ctx.fillStyle='#2b2628';
 ctx.beginPath();ctx.ellipse(W/2,H/2+10,525,330,0,0,Math.PI*2);ctx.fill();

 // 모발의 방향감 - 가르마에서 바깥쪽으로 눕는 짧은 픽셀 스트랜드
 ctx.lineCap='round';
 for(let y=78;y<H;y+=13){
  for(let x=8;x<W;x+=13){
   const n=(x*19+y*23)%97;
   // 중앙 가르마/길과 너무 가까운 곳은 머리카락을 덜 그림
   const np=nearestProgress(x,y);
   if(np.d<34+(n%8))continue;
   const side=x<W/2?-1:1;
   const len=9+(n%9);
   const lean=side*(5+(n%6));
   ctx.strokeStyle=n%3===0?'#4d4141':n%3===1?'#352e30':'#211d1f';
   ctx.lineWidth=n%5===0?2:1;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+lean,y-len);ctx.stroke();
  }
 }

 // 드문드문 보이는 모공
 for(let y=95;y<H;y+=31){
  for(let x=20;x<W;x+=37){
   const np=nearestProgress(x,y);
   if(np.d<52){
    const n=(x*7+y*11)%17;
    rect(x+(n%5),y+(n%4),2,2,'#9a5c60');
   }
  }
 }

 // 맵 바깥 가장자리 음영
 const g=ctx.createRadialGradient(W/2,H/2,180,W/2,H/2,570);
 g.addColorStop(0,'#0000');g.addColorStop(1,'#000a');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);

 text('이상연의 정수리',18,102,11,'left','#d7b8b9');
}

function drawPath(){
 ctx.lineCap='round';ctx.lineJoin='round';
 ctx.strokeStyle='#5a4143';ctx.lineWidth=64;ctx.beginPath();ctx.moveTo(path[0].x,path[0].y);for(let i=1;i<path.length;i++)ctx.lineTo(path[i].x,path[i].y);ctx.stroke();
 ctx.strokeStyle='#cf8784';ctx.lineWidth=50;ctx.stroke();
 ctx.strokeStyle='#e2a29b';ctx.lineWidth=39;ctx.stroke();
 ctx.setLineDash([8,11]);ctx.strokeStyle='#f1bab0';ctx.lineWidth=2;ctx.stroke();ctx.setLineDash([]);
 text('드러난 두피 · 탈모 인자 침투로',62,122,9,'center','#ffe4de');
 drawStemCellCore();
}
function drawStemCellCore(){
 const x=922,y=325;
 // 큰 모낭 단면
 rect(x-20,y-32,40,44,'#8d4752');rect(x-15,y-27,30,35,'#e8a6a3');
 ctx.fillStyle='#6b3544';ctx.beginPath();ctx.arc(x,y+12,20,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#f0c3ba';ctx.beginPath();ctx.arc(x,y+12,12,0,Math.PI*2);ctx.fill();
 rect(x-4,y-50,8,24,'#2d2528');
 text('모낭줄기세포',922,368,9,'center','#fff0e8');
}
function drawEmptyFollicle(p,sel){
 ctx.fillStyle=sel?'#f1c96f':'#94545d';ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#5a343b';ctx.beginPath();ctx.arc(p.x,p.y,14,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#d98d8d';ctx.beginPath();ctx.arc(p.x,p.y+4,8,0,Math.PI*2);ctx.fill();
 text('+',p.x,p.y-2,16,'center','#fff2dd');
}
function drawPads(){pads.forEach((p,i)=>{if(!p.tower)drawEmptyFollicle(p,game.selectedPad===i)})}

function drawHairTower(t){
 const s=towerStats(t),sel=game.selectedTower===t;
 if(sel){ctx.globalAlpha=.10;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(t.x,t.y,s.range,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 // 모낭 뿌리
 ctx.fillStyle='#824851';ctx.beginPath();ctx.arc(t.x,t.y+8,15,0,Math.PI*2);ctx.fill();
 ctx.fillStyle='#e9a2a0';ctx.beginPath();ctx.arc(t.x,t.y+8,10,0,Math.PI*2);ctx.fill();
 const branch=t.branch;
 if(t.type==='fuzz'){
  const thick=branch==='thick'?7:t.level===3?5:t.level===2?4:2;
  const h=branch==='long'?48:t.level===3?34:t.level===2?29:23;
  rect(t.x-Math.floor(thick/2),t.y-h,thick,h+7,branch==='thick'?'#1e1b1d':'#393034');
  if(branch==='long'){rect(t.x+5,t.y-h+7,2,h-6,'#49373d')}
 }else if(t.type==='papilla'){
  // 모유두를 감싸는 굵은 모발 + 신호
  rect(t.x-3,t.y-37,6,44,'#2e272a');
  rect(t.x-11,t.y+3,22,10,branch==='igf'?'#a6569f':branch==='vegf'?'#5f9f91':'#8c5a92');
  rect(t.x-7,t.y+7,14,5,'#e1a2d5');
  if(branch==='vegf'){rect(t.x-17,t.y-3,6,3,'#74c4a9');rect(t.x+11,t.y-3,6,3,'#74c4a9')}
 }else if(t.type==='keratin'){
  const c=branch==='dense'?'#211d1f':'#342b2f';
  rect(t.x-8,t.y-35,5,42,c);rect(t.x-1,t.y-41,6,48,c);rect(t.x+7,t.y-31,5,38,c);
  rect(t.x-11,t.y-3,25,5,branch==='elastic'?'#e6c15b':'#b1873f');
 }else{
  rect(t.x-10,t.y-28,4,35,'#33282c');rect(t.x-2,t.y-38,5,45,'#2a2225');rect(t.x+7,t.y-31,4,38,'#3c2e33');
  if(branch==='assault'){rect(t.x+13,t.y-26,4,33,'#2b2225')}
  rect(t.x-13,t.y+3,26,7,'#5aa7a0');
 }
 text(t.branch?'★':`Lv${t.level}`,t.x,t.y+27,8,'center',t.branch?'#ffe177':'#fff');
 if(game.time<t.silencedUntil)text('과로',t.x+22,t.y-24,8,'center','#5d3d6e');
 if(game.time<t.buffUntil){ctx.strokeStyle='#7bd1ff';ctx.lineWidth=2;ctx.strokeRect(t.x-21,t.y-45,42,60)}
 if(game.time<t.nutriUntil){ctx.strokeStyle='#ffe06b';ctx.lineWidth=2;ctx.strokeRect(t.x-24,t.y-48,48,64)}
 if(t.type==='matrix'&&game.action==='rally'&&game.actionTower===t){
  const rp=pathPos(t.rallyP);ctx.strokeStyle='#a5fff7';ctx.lineWidth=2;ctx.beginPath();ctx.arc(rp.x,rp.y,12,0,Math.PI*2);ctx.stroke()
 }
}

function drawEnemy(e){
 ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));if(e.flash>0)ctx.globalAlpha=.45;
 if(e.mutation){ctx.strokeStyle=e.mutation.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,e.size+6,0,Math.PI*2);ctx.stroke()}
 if(e.type==='genetic'){
  rect(-30,-28,60,55,'#38213b');rect(-23,-22,46,43,e.color);rect(-15,-13,9,9,'#ff6a92');rect(6,-13,9,9,'#ff6a92');text('유전',0,6,12);text(`P${e.bossPhase}`,0,20,8,'center','#ffd27d');
 }else if(e.type==='stress'){
  rect(-24,-23,48,46,'#2e2930');rect(-18,-18,36,34,e.color);rect(-12,-14,7,7,'#ff6969');rect(5,-14,7,7,'#ff6969');text('STRESS',0,3,7);
 }else if(e.type==='alcohol'){
  rect(-8,-12,16,22,e.color);rect(-4,-17,8,6,'#d7eff8');rect(-5,-7,10,8,'#eefaff');text('酒',0,-3,7,'center','#315875');
 }else if(e.type==='fried'){
  rect(-14,-11,28,22,e.color);rect(-9,-16,18,7,'#f1bc5d');rect(-5,-5,5,5,'#6b351e');rect(4,-5,5,5,'#6b351e');
 }else if(e.type==='dht'){
  rect(-12,-12,24,24,e.color);rect(-15,-17,7,8,'#54283b');rect(8,-17,7,8,'#54283b');text('DHT',0,1,7);
 }else if(e.type==='inflame'){
  rect(-10,-10,20,20,e.color);rect(-4,-16,8,7,'#ff9b50');rect(-14,-3,7,9,'#ff7c49');rect(8,-5,7,10,'#ffbc4f');
 }else if(e.type==='sleep'){
  rect(-12,-12,24,24,e.color);rect(-8,-7,6,4,'#bbc9ed');rect(3,-7,6,4,'#bbc9ed');text('Zz',0,5,8,'center','#e3e9ff');
 }else if(e.type==='sebum'){
  rect(-16,-14,32,28,e.color);rect(-11,-9,22,18,'#d7b765');text('피지',0,2,7,'center','#5a4524');
 }else if(e.type==='smoking'){
  rect(-12,-12,24,24,e.color);rect(-8,3,17,5,'#ddd1c5');rect(7,3,5,5,'#f07a58');text('연',0,-4,8,'center','#e7e7e7');
 }else{
  rect(-16,-15,32,30,e.color);rect(-9,-7,6,6,'#e7c9ff');rect(3,-7,6,6,'#e7c9ff');text('IR',0,5,8);
 }
 ctx.restore();
 const boss=enemyDefs[e.type]?.boss,w=boss?68:32;
 rect(e.x-w/2,e.y-e.size-13,w,4,'#512e35');rect(e.x-w/2,e.y-e.size-13,w*clamp(e.hp/e.maxHp,0,1),4,'#88d26a');
 if(e.maxShield>0){rect(e.x-w/2,e.y-e.size-19,w,3,'#3d4650');rect(e.x-w/2,e.y-e.size-19,w*clamp(e.shield/e.maxShield,0,1),3,'#70c8e8')}
 if(e.mutation)text(e.mutation.icon,e.x-e.size-7,e.y-e.size-7,8,'center',e.mutation.color);
 if(e.stun>0)text('✦',e.x+e.size,e.y-e.size,10,'center','#fff0a5');else if(e.slow>0)text('❄',e.x+e.size,e.y-e.size,10);
}
function drawSoldier(s){
 rect(s.x-4,s.y-13,8,19,'#e9e5df');rect(s.x-2,s.y-25,4,13,'#292326');rect(s.x-6,s.y-14,12,5,'#5ea9a2');
 rect(s.x-8,s.y-28,16,2,'#512f36');rect(s.x-8,s.y-28,16*clamp(s.hp/s.maxHp,0,1),2,'#7ed58a');
}
function drawHero(){
 const h=game.hero;if(h.dead){text(`재성장 ${Math.ceil(h.respawn)}`,520,312,10);return}
 if(game.selectedHero){ctx.strokeStyle='#fff18a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x,h.y,20,0,Math.PI*2);ctx.stroke()}
 rect(h.x-6,h.y-5,12,13,'#c59284');rect(h.x-3,h.y-31,6,27,'#171719');rect(h.x-8,h.y-18,5,6,'#241e20');
 text('한 올',h.x,h.y+18,8);rect(h.x-17,h.y-37,34,3,'#512f35');rect(h.x-17,h.y-37,34*clamp(h.hp/h.maxHp,0,1),3,'#83da82');
 if(game.time<h.auraUntil){ctx.globalAlpha=.1;ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(h.x,h.y,142*game.augMods.heroAuraRadius,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
}
function drawBullets(){
 for(const b of game.bullets){
  if(b.kind==='special')rect(b.x-3,b.y-3,6,6,'#efa0e8');
  else if(b.splash)rect(b.x-4,b.y-4,8,8,'#e7c45d');
  else rect(b.x-2,b.y-2,4,4,'#f7efe5');
 }
}
function drawZones(){
 for(const z of game.zones){
  ctx.globalAlpha=z.type==='boom'||z.type==='hero'||z.type==='haste'?.32:.16;
  ctx.fillStyle=z.type==='inflame'?'#f04433':z.type==='massage'?'#74d5e6':z.type==='hero'?'#fff29a':z.type==='geneticFog'?'#7e3e91':z.type==='haste'?'#ff6c9e':'#ffd45c';
  ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }
}
function drawAuras(){
 for(const e of game.enemies){
  if(e.type==='dht'){ctx.globalAlpha=.07;ctx.fillStyle='#e52f72';ctx.beginPath();ctx.arc(e.x,e.y,115,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  if(e.type==='insulin'){ctx.globalAlpha=.07;ctx.fillStyle='#c692ef';ctx.beginPath();ctx.arc(e.x,e.y,92,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  if(e.type==='sleep'){ctx.globalAlpha=.055;ctx.fillStyle='#6f8dd0';ctx.beginPath();ctx.arc(e.x,e.y,120,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  if(e.type==='smoking'){ctx.globalAlpha=.045;ctx.fillStyle='#aab0aa';ctx.beginPath();ctx.arc(e.x,e.y,88,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 }
 for(const t of game.towers)if(t.type==='papilla'&&t.branch==='vegf'){
  const r=hasAugment('papilla_vein')?145:124;ctx.globalAlpha=.06;ctx.fillStyle='#74e0bd';ctx.beginPath();ctx.arc(t.x,t.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }
}

function drawEnemyTooltip(){
 const e=game.hoverEnemy;if(!e||e.dead)return;
 const def=enemyDefs[e.type],x=clamp(game.hoverX+16,8,W-238),y=clamp(game.hoverY+16,82,H-105),w=230,h=e.mutation?92:72;
 ctx.globalAlpha=.94;rect(x,y,w,h,'#1a1116');ctx.globalAlpha=1;ctx.strokeStyle='#8d5964';ctx.strokeRect(x,y,w,h);
 text(def.name,x+9,y+14,11,'left','#ffe4c7');text(`HP ${Math.ceil(e.hp)}/${Math.ceil(e.maxHp)}${e.shield>0?` · 보호막 ${Math.ceil(e.shield)}`:''}`,x+9,y+32,9,'left','#dfcbd1');
 text(`물리저항 ${Math.round(e.phys*100)}% · 특수저항 ${Math.round(e.spec*100)}%`,x+9,y+48,9,'left','#cbb4bd');
 if(e.mutation){text(`변이: ${e.mutation.name}`,x+9,y+65,9,'left',e.mutation.color);text(e.mutation.desc,x+9,y+80,8,'left','#d8c3ca')}
}

function draw(){
 drawScalp();drawPath();drawZones();drawPads();drawAuras();
 game.towers.forEach(drawHairTower);game.soldiers.forEach(drawSoldier);game.enemies.forEach(drawEnemy);drawHero();drawBullets();
 if(game.action)text(game.action==='rally'?'집결시킬 길을 클릭':'대상을 클릭',W/2,510,12,'center','#fff2a6');
 if(game.dragSelecting&&game.dragStart&&game.dragEnd){const x=Math.min(game.dragStart.x,game.dragEnd.x),y=Math.min(game.dragStart.y,game.dragEnd.y),w=Math.abs(game.dragEnd.x-game.dragStart.x),h=Math.abs(game.dragEnd.y-game.dragStart.y);ctx.fillStyle='#7fe9a322';ctx.fillRect(x,y,w,h);ctx.strokeStyle='#8ff0ab';ctx.lineWidth=1.5;ctx.strokeRect(x,y,w,h)}
 drawEnemyTooltip();
}

let last=performance.now();
function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;
 if(!game.over&&!game.introActive&&!game.paused&&!game.augmentSelecting){game.time+=dt;updateGlobalSkills(dt);updateSpawns(dt);updateTowers(dt);updateBullets(dt);updateSoldiers(dt);updateHero(dt);updateEnemies(dt);updateZones(dt)}
 draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function canvasPoint(ev){
 const r=C.getBoundingClientRect();
 return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height};
}

C.addEventListener('contextmenu',e=>e.preventDefault());

C.addEventListener('mousedown',ev=>{
 if(game.over||game.introActive||game.paused||game.augmentSelecting)return;
 ensureAudioContext();
 const p=canvasPoint(ev);

 if(ev.button===2){
  ev.preventDefault();
  if(game.selectedHero&&!game.hero.dead){
   game.hero.targetX=clamp(p.x,20,W-20);
   game.hero.targetY=clamp(p.y,78,H-24);
   playSfx('heroMove');
   toast('마지막 머리카락 이동');
  }
  return;
 }

 if(ev.button===0){
  game.dragSelecting=true;
  game.dragStart=p;
  game.dragEnd=p;
  game.suppressNextClick=false;
 }
});

C.addEventListener('mousemove',ev=>{
 const p=canvasPoint(ev);game.hoverX=p.x;game.hoverY=p.y;
 if(game.dragSelecting&&game.dragStart){game.dragEnd=p;if(Math.hypot(p.x-game.dragStart.x,p.y-game.dragStart.y)>7)game.suppressNextClick=true;game.hoverEnemy=null;return}
 game.hoverEnemy=game.enemies.filter(e=>!e.dead&&Math.hypot(e.x-p.x,e.y-p.y)<e.size+8).sort((a,b)=>dist(a,p)-dist(b,p))[0]||null;
});

window.addEventListener('mouseup',ev=>{
 if(ev.button!==0||!game.dragSelecting)return;
 const end=canvasPoint(ev);
 game.dragEnd=end;

 if(game.suppressNextClick){
  const x1=Math.min(game.dragStart.x,end.x),x2=Math.max(game.dragStart.x,end.x);
  const y1=Math.min(game.dragStart.y,end.y),y2=Math.max(game.dragStart.y,end.y);
  const h=game.hero;
  const inside=!h.dead&&h.x>=x1&&h.x<=x2&&h.y>=y1&&h.y<=y2;
  game.selectedHero=inside;
  game.selectedTower=null;game.selectedPad=null;
  if(inside){openHeroPanel();toast('마지막 머리카락 선택')}
  else closePanel();
 }
 game.dragSelecting=false;game.dragStart=null;game.dragEnd=null;
});

C.addEventListener('click',ev=>{
 if(game.over||game.introActive||game.paused||game.augmentSelecting)return;
 if(game.suppressNextClick){game.suppressNextClick=false;return}
 const p=canvasPoint(ev);
 if(applyAction(p.x,p.y))return;

 const h=game.hero;
 if(!h.dead&&Math.hypot(p.x-h.x,p.y-h.y)<24){
  openHeroPanel();return;
 }

 const t=game.towers.find(t=>Math.hypot(p.x-t.x,p.y-t.y)<27);
 if(t){openTowerPanel(t);return}

 const pi=pads.findIndex(pd=>!pd.tower&&Math.hypot(p.x-pd.x,p.y-pd.y)<25);
 if(pi>=0){openBuildPanel(pi);return}

 // RTS식: 빈 바닥 좌클릭은 선택 해제, 이동은 우클릭만.
 game.selectedHero=false;game.selectedTower=null;closePanel();
});

ui.waveBtn.onclick=startWave;
ui.minoBtn.onclick=()=>useGlobal('mino');ui.massageBtn.onclick=()=>useGlobal('massage');ui.nutriBtn.onclick=()=>useGlobal('nutri');
ui.audioToggle.onclick=(e)=>{
 e.stopPropagation();ensureAudioContext();ui.audioMenu.classList.toggle('open');
};
ui.bgmVolume.oninput=()=>{
 audioState.bgmVolume=Number(ui.bgmVolume.value)/100;syncAudioUI();saveAudioSettings();
};
ui.sfxVolume.oninput=()=>{
 audioState.sfxVolume=Number(ui.sfxVolume.value)/100;syncAudioUI();saveAudioSettings();playSfx('hit');
};
ui.muteBtn.onclick=()=>{
 audioState.muted=!audioState.muted;syncAudioUI();saveAudioSettings();
};
ui.restartBtn.onclick=reset;
ui.storyNext.addEventListener('click',e=>{e.stopPropagation();ensureAudioContext();nextStory()});
ui.storySkip.addEventListener('click',e=>{e.stopPropagation();ensureAudioContext();endStory()});
ui.storyScene.addEventListener('click',()=>{ensureAudioContext();nextStory()});
window.addEventListener('keydown',e=>{
 if(game.introActive&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();nextStory();return}
 if(game.introActive&&e.key==='Escape'){e.preventDefault();endStory();return}
 if(e.code==='Space'){e.preventDefault();startWave()}
 if(e.key==='Escape'){game.action=null;game.actionTower=null;game.selectedHero=false;game.selectedTower=null;closePanel();toast('선택 취소')}
});
})();
