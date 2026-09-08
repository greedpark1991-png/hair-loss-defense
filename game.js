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
 restartBtn:document.getElementById('restartBtn'),
 minoBtn:document.getElementById('minoBtn'),massageBtn:document.getElementById('massageBtn'),nutriBtn:document.getElementById('nutriBtn'),
 minoCd:document.getElementById('minoCd'),massageCd:document.getElementById('massageCd'),nutriCd:document.getElementById('nutriCd'),
 story:document.getElementById('story'),storyScene:document.getElementById('storyScene'),
 storyImage:document.getElementById('storyImage'),storyText:document.getElementById('storyText'),
 storyNext:document.getElementById('storyNext'),storySkip:document.getElementById('storySkip'),
 storyCount:document.getElementById('storyCount')
};

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
  vegf:{name:'VEGF 혈관증식',desc:'주변 타워의 공격속도를 25% 증가시키는 지원형.',cost:165}
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
 alcohol:{name:'알코올',hp:64,speed:57,reward:8,leak:1,size:13,phys:.05,spec:.00,melee:4,color:'#79b8de'},
 fried:{name:'튀김류',hp:190,speed:35,reward:14,leak:2,size:17,phys:.50,spec:.10,melee:10,color:'#d79238'},
 dht:{name:'DHT',hp:158,speed:61,reward:18,leak:2,size:15,phys:.10,spec:.45,melee:12,color:'#a54163'},
 inflame:{name:'만성염증',hp:126,speed:44,reward:16,leak:2,size:15,phys:.15,spec:.05,melee:6,color:'#df4c3f'},
 insulin:{name:'인슐린 저항성',hp:255,speed:34,reward:23,leak:3,size:19,phys:.35,spec:.25,melee:14,color:'#7c6291'},
 stress:{name:'스트레스',hp:1900,speed:23,reward:180,leak:10,size:28,phys:.25,spec:.25,melee:24,color:'#48434e'}
};

const waves=[
 [{type:'alcohol',n:10,gap:.72}],
 [{type:'alcohol',n:14,gap:.56}],
 [{type:'alcohol',n:10,gap:.48},{type:'fried',n:4,gap:.95}],
 [{type:'fried',n:7,gap:.72},{type:'alcohol',n:12,gap:.34}],
 [{type:'dht',n:5,gap:.88},{type:'alcohol',n:12,gap:.36}],
 [{type:'alcohol',n:20,gap:.27},{type:'inflame',n:5,gap:.74}],
 [{type:'fried',n:7,gap:.54},{type:'dht',n:6,gap:.62},{type:'inflame',n:4,gap:.68}],
 [{type:'insulin',n:3,gap:1.2},{type:'alcohol',n:16,gap:.28},{type:'dht',n:7,gap:.54}],
 [{type:'insulin',n:3,gap:1.12},{type:'fried',n:8,gap:.45},{type:'inflame',n:7,gap:.49},{type:'dht',n:8,gap:.46}],
 [{type:'stress',n:1,gap:1},{type:'dht',n:6,gap:.6},{type:'inflame',n:5,gap:.6},{type:'alcohol',n:12,gap:.31}]
];


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
 toast('방어전 시작! 빈 모낭을 눌러 타워를 심으세요.');
}

let game;

function reset(){
 game={
  gold:265,life:20,wave:0,inWave:false,queue:[],spawnClock:0,enemies:[],towers:[],bullets:[],zones:[],soldiers:[],
  selectedPad:null,selectedTower:null,selectedHero:false,action:null,actionTower:null,time:0,over:false,introActive:true,
  hero:{x:520,y:335,targetX:520,targetY:335,hp:160,maxHp:160,attackCd:0,level:1,xp:0,dead:false,respawn:0,
        shieldUntil:0,auraUntil:0,rebirthReady:true,skillCd:{fortify:0,hope:0,guard:0}},
  skillCd:{mino:0,massage:0,nutri:0}
 };
 pads.forEach(p=>p.tower=null);
 ui.modal.style.display='none';closePanel();syncUI();
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
 if(index<0||index>=waves.length)return '없음';
 const counts={};
 waves[index].forEach(g=>counts[g.type]=(counts[g.type]||0)+g.n);
 return Object.entries(counts).map(([k,n])=>`${enemyDefs[k].name} ×${n}`).join(' · ');
}
function earlyBonus(){return Math.min(48,18+game.enemies.length*2)}
function canEarly(){return game.inWave&&game.queue.length===0&&game.enemies.length>0&&game.wave<10}

function syncUI(){
 ui.gold.textContent=Math.floor(game.gold);ui.life.textContent=game.life;ui.wave.textContent=`${game.wave}/10`;
 if(game.over){ui.waveBtn.disabled=true}
 else if(canEarly()){ui.waveBtn.disabled=false;ui.waveBtn.textContent=`⚡ 조기 호출 +${earlyBonus()}`}
 else if(game.inWave){ui.waveBtn.disabled=true;ui.waveBtn.textContent='적 등장 중...'}
 else if(game.wave<10){ui.waveBtn.disabled=false;ui.waveBtn.textContent='▶ 다음 웨이브'}
 else{ui.waveBtn.disabled=true;ui.waveBtn.textContent='최종전'}
 const next=game.wave<10?game.wave+1:null;
 ui.preview.innerHTML=next?
  `<b>다음 웨이브 ${next}</b><br>${waveSummary(next-1)}<br><span style="color:#d8b8bf">물리 방어 높은 적 → 모유두 세포 · 특수 저항 높은 DHT → 머리카락/케라틴</span>`:
  `<b>최종 웨이브 진행 중</b><br>모낭줄기세포를 끝까지 지켜라.`;
}

function toast(msg){
 ui.toast.textContent=msg;ui.toast.style.opacity=1;clearTimeout(toast.t);
 toast.t=setTimeout(()=>ui.toast.style.opacity=0,2200);
}
function closePanel(){ui.panel.style.display='none';if(game){game.selectedPad=null}}

function startWave(){
 if(game.over||game.wave>=10)return;
 const early=canEarly();
 if(game.inWave&&!early)return;
 if(early){const b=earlyBonus();game.gold+=b;toast(`탈모 인자를 조기 호출! 영양분 +${b}`)}
 game.wave++;game.inWave=true;game.spawnClock=0;game.hero.rebirthReady=true;
 let q=[],t=.28;
 for(const g of waves[game.wave-1]){
  for(let i=0;i<g.n;i++){q.push({at:t,type:g.type,wave:game.wave});t+=g.gap}
  t+=.55;
 }
 game.queue=q;
 if(!early)toast(game.wave===10?'최종 웨이브! 스트레스가 온다.':`웨이브 ${game.wave} 시작`);
 syncUI();
}

function spawnEnemy(type,waveId){
 const d=enemyDefs[type];
 game.enemies.push({
  type,waveId,progress:0,x:path[0].x,y:path[0].y,hp:d.hp,maxHp:d.hp,speed:d.speed,reward:d.reward,leak:d.leak,size:d.size,
  phys:d.phys,spec:d.spec,melee:d.melee,color:d.color,slow:0,slowFactor:1,stun:0,blockId:null,flash:0,
  bossCd:type==='stress'?3.8:0,dead:false
 });
}

function towerStats(t){
 const d=towerDefs[t.type];
 let s={damage:d.damage*(1+(t.level-1)*.36),range:d.range*(1+(t.level-1)*.06),rate:d.rate,splash:48,pierce:0,chain:0,stunChance:0,
        soldiers:3,soldierHp:62+17*(t.level-1),soldierDmg:8+3*(t.level-1)};
 if(t.branch){
  if(t.type==='fuzz'&&t.branch==='long'){s.damage*=1.45;s.range*=1.48;s.rate*=.93;s.pierce=1}
  if(t.type==='fuzz'&&t.branch==='thick'){s.damage*=2.35;s.range*=.90;s.rate*=1.24}
  if(t.type==='papilla'&&t.branch==='igf'){s.damage*=1.82;s.chain=.52}
  if(t.type==='papilla'&&t.branch==='vegf'){s.damage*=1.12}
  if(t.type==='keratin'&&t.branch==='dense'){s.damage*=1.72;s.splash=70}
  if(t.type==='keratin'&&t.branch==='elastic'){s.damage*=1.28;s.splash=54;s.stunChance=.32}
  if(t.type==='matrix'&&t.branch==='assault'){s.soldiers=4;s.soldierHp*=1.28;s.soldierDmg*=1.62}
  if(t.type==='matrix'&&t.branch==='guard'){s.soldiers=3;s.soldierHp*=2.18;s.soldierDmg*=1.10}
 }
 return s;
}

function buildTower(type){
 if(game.selectedPad==null)return;
 const pad=pads[game.selectedPad],d=towerDefs[type];
 if(pad.tower)return;
 if(game.gold<d.cost){toast('영양분이 부족합니다.');return}
 game.gold-=d.cost;
 const np=nearestProgress(pad.x,pad.y);
 const t={type,x:pad.x,y:pad.y,level:1,branch:null,cooldown:Math.random()*.3,buffUntil:0,nutriUntil:0,silencedUntil:0,
          rallyP:np.p,initialized:false,nextRespawn:0};
 game.towers.push(t);pad.tower=t;openTowerPanel(t);syncUI();
}
function upgradeTower(t){
 if(t.level>=3){toast('최종 진화 두 갈래 중 하나를 선택하세요.');return}
 const d=towerDefs[t.type],cost=Math.round(d.cost*(t.level===1?.9:1.15));
 if(game.gold<cost){toast('영양분이 부족합니다.');return}
 game.gold-=cost;t.level++;toast(`${d.name} Lv.${t.level} 성장!`);openTowerPanel(t);syncUI();
}
function evolveTower(t,key){
 if(t.level<3||t.branch)return;
 const b=branches[t.type][key];
 if(game.gold<b.cost){toast('영양분이 부족합니다.');return}
 game.gold-=b.cost;t.branch=key;t.initialized=false;
 toast(`${b.name}으로 최종 진화!`);openTowerPanel(t);syncUI();
}
function sellTower(t){
 const d=towerDefs[t.type];let spent=d.cost;
 if(t.level>=2)spent+=Math.round(d.cost*.9);
 if(t.level>=3)spent+=Math.round(d.cost*1.15);
 if(t.branch)spent+=branches[t.type][t.branch].cost;
 const back=Math.floor(spent*.65);game.gold+=back;
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
 <b>${d.icon} ${d.name} · ${d.cost}</b><small>${d.desc}</small></button>`).join('')+'</div>';
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
  const c=Math.round(d.cost*(t.level===1?.9:1.15));
  html+=`<div class="grid"><button id="upgradeBtn">⬆ 성장 ${c}</button><button id="sellBtn">↩ 회수</button></div>`;
 }else if(t.level===3&&!t.branch){
  const opts=Object.entries(branches[t.type]);
  html+=`<p><b>최종 진화 선택</b> — 이후 되돌릴 수 없음</p><div class="grid">`+
  opts.map(([k,b])=>`<button class="towerBtn branchBtn" data-evolve="${k}"><b>${b.name} · ${b.cost}</b><small>${b.desc}</small></button>`).join('')+
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
 const h=game.hero;
 return[
  {key:'fortify',lv:2,name:'악착같이 버티기',desc:'즉시 회복 + 5초간 피해 70% 감소',cd:18},
  {key:'hope',lv:4,name:'한 올의 희망',desc:'8초간 영웅 주변 타워 공격속도 +30%',cd:28},
  {key:'guard',lv:6,name:'두피 사수',desc:'주변 적에게 피해 + 2.5초 기절',cd:34}
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
 if(key==='fortify'){h.hp=Math.min(h.maxHp,h.hp+60);h.shieldUntil=game.time+5;toast('악착같이 버티기! 모근을 꽉 붙잡았다.')}
 if(key==='hope'){h.auraUntil=game.time+8;toast('한 올의 희망! 주변 타워 공속 상승')}
 if(key==='guard'){
  for(const e of game.enemies)if(!e.dead&&dist(h,e)<105){damageEnemy(e,42,'special','hero');e.stun=Math.max(e.stun,2.5)}
  game.zones.push({x:h.x,y:h.y,r:105,life:.45,max:.45,type:'hero'});
  toast('두피 사수! 주변 탈모 인자 기절');
 }
 openHeroPanel();
}

function gainHeroXp(extra=0){
 const h=game.hero;if(h.level>=10)return;
 h.xp+=3+extra;
 let need=24+h.level*12;
 while(h.xp>=need&&h.level<10){
  h.xp-=need;h.level++;h.maxHp+=15;h.hp=h.maxHp;toast(`마지막 머리카락 Lv.${h.level}! 영웅 능력이 성장했습니다.`);
  need=24+h.level*12;
 }
}

function damageEnemy(e,amount,kind,source){
 if(e.dead)return;
 const resist=kind==='special'?e.spec:e.phys;
 let mult=1-resist;
 for(const i of game.enemies)if(i!==e&&!i.dead&&i.type==='insulin'&&dist(i,e)<92){mult*=.84;break}
 e.hp-=amount*mult;e.flash=.08;
 if(e.hp<=0)killEnemy(e,source);
}
function killEnemy(e,source){
 if(e.dead)return;e.dead=true;game.gold+=e.reward;gainHeroXp(source==='hero'?8:0);
 if(e.type==='inflame')game.zones.push({x:e.x,y:e.y,r:72,life:7,max:7,type:'inflame'});
}

function towerSpeedFactor(t){
 let f=1;
 for(const e of game.enemies)if(!e.dead&&e.type==='dht'&&dist(e,t)<115&&(t.type==='fuzz'||t.type==='matrix'))f*=.72;
 for(const z of game.zones)if(z.type==='inflame'&&dist(z,t)<z.r)f*=.68;
 if(game.time<t.buffUntil)f*=1.55;
 if(game.time<t.nutriUntil)f*=1.20;
 for(const v of game.towers)if(v!==t&&v.type==='papilla'&&v.branch==='vegf'&&dist(v,t)<120)f*=1.25;
 const h=game.hero;if(!h.dead&&game.time<h.auraUntil&&dist(h,t)<135)f*=1.30;
 return f;
}
function towerDamageFactor(t){
 let f=1;if(game.time<t.nutriUntil)f*=1.45;
 for(const e of game.enemies)if(!e.dead&&e.type==='dht'&&dist(e,t)<115&&(t.type==='fuzz'||t.type==='matrix'))f*=.72;
 return f;
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
 const st=towerStats(t);
 const alive=game.soldiers.filter(s=>s.parent===t&&!s.dead);
 if(!t.initialized){
  for(let i=0;i<st.soldiers;i++)spawnSoldier(t,i);
  t.initialized=true;t.nextRespawn=game.time+4;return;
 }
 if(alive.length<st.soldiers&&game.time>=t.nextRespawn){
  const used=new Set(alive.map(s=>s.slot));let slot=0;while(used.has(slot))slot++;
  spawnSoldier(t,slot);t.nextRespawn=game.time+4.2;
 }
 for(const s of alive){
  const h=getSoldierHome(t,s.slot,st.soldiers);s.homeX=h.x;s.homeY=h.y;
 }
}

function updateTowers(dt){
 for(const t of game.towers){
  ensureSoldiers(t);
  if(game.time<t.silencedUntil)continue;
  const d=towerDefs[t.type],s=towerStats(t);
  t.cooldown-=dt*towerSpeedFactor(t);
  if(t.type==='matrix')continue;
  if(t.cooldown<=0){
   const e=findTarget(t,s.range);
   if(e){
    game.bullets.push({x:t.x,y:t.y,target:e,speed:t.type==='fuzz'?390:305,damage:s.damage*towerDamageFactor(t),kind:d.kind,
      splash:t.type==='keratin'?s.splash:0,pierce:s.pierce,chain:s.chain,stunChance:s.stunChance});
    t.cooldown=s.rate;
   }
  }
 }
}
function updateBullets(dt){
 for(const b of game.bullets){
  if(b.dead)continue;
  const e=b.target;
  if(!e||e.dead){b.dead=true;continue}
  const dx=e.x-b.x,dy=e.y-b.y,l=Math.hypot(dx,dy);
  if(l<8){
   if(b.splash){
    for(const x of game.enemies)if(!x.dead&&Math.hypot(x.x-e.x,x.y-e.y)<b.splash){
      damageEnemy(x,b.damage,'physical');
      if(b.stunChance&&Math.random()<b.stunChance)x.stun=Math.max(x.stun,1.15);
    }
    game.zones.push({x:e.x,y:e.y,r:b.splash,life:.22,max:.22,type:'boom'});
   }else{
    damageEnemy(e,b.damage,b.kind);
    if(b.chain){
     const other=game.enemies.find(x=>!x.dead&&x!==e&&dist(x,e)<65);
     if(other)damageEnemy(other,b.damage*b.chain,'special');
    }
    if(b.pierce){
     const other=game.enemies.find(x=>!x.dead&&x!==e&&Math.abs(x.progress-e.progress)<70);
     if(other)damageEnemy(other,b.damage*.72,b.kind);
    }
   }
   b.dead=true;
  }else{b.x+=dx/l*b.speed*dt;b.y+=dy/l*b.speed*dt}
 }
 game.bullets=game.bullets.filter(b=>!b.dead);
}

function updateSoldiers(dt){
 for(const s of game.soldiers){
  if(s.dead)continue;
  s.attackCd-=dt;
  const st=towerStats(s.parent);
  let target=null;
  for(const e of game.enemies){
   if(e.dead)continue;
   if(Math.hypot(e.x-s.x,e.y-s.y)<27&&Math.hypot(e.x-s.homeX,e.y-s.homeY)<48){target=e;break}
  }
  if(target){
   target.blockId=s.id;
   if(s.attackCd<=0){damageEnemy(target,st.soldierDmg,'physical');s.attackCd=.70}
   s.hp-=target.melee*dt;
   if(s.hp<=0){s.dead=true;s.parent.nextRespawn=Math.max(s.parent.nextRespawn,game.time+4.2);if(target.blockId===s.id)target.blockId=null}
  }else{
   const dx=s.homeX-s.x,dy=s.homeY-s.y,l=Math.hypot(dx,dy);
   if(l>2){s.x+=dx/l*68*dt;s.y+=dy/l*68*dt}
  }
 }
 game.soldiers=game.soldiers.filter(s=>!s.dead);
}

function updateHero(dt){
 const h=game.hero;
 for(const k in h.skillCd)h.skillCd[k]=Math.max(0,h.skillCd[k]-dt);
 if(h.dead){
  h.respawn-=dt;if(h.respawn<=0){h.dead=false;h.hp=h.maxHp;h.x=520;h.y=335;h.targetX=h.x;h.targetY=h.y;toast('마지막 머리카락 재성장!')}
  return;
 }
 const dx=h.targetX-h.x,dy=h.targetY-h.y,l=Math.hypot(dx,dy);
 if(l>3){h.x+=dx/l*112*dt;h.y+=dy/l*112*dt}
 h.attackCd-=dt;
 let target=null;
 for(const e of game.enemies)if(!e.dead&&dist(h,e)<50){target=e;break}
 if(target&&h.attackCd<=0){damageEnemy(target,18+(h.level-1)*4,'special','hero');h.attackCd=.54}
 if(target){
  let dmg=target.melee*.45*dt;if(game.time<h.shieldUntil)dmg*=.3;
  h.hp-=dmg;
  if(h.hp<=0){
   h.hp=0;h.dead=true;
   if(h.level>=8&&h.rebirthReady){h.rebirthReady=false;h.respawn=1.5;toast('휴지기 거부! 1.5초 후 즉시 재성장')}
   else{h.respawn=8;toast('마지막 머리카락 탈락... 8초 후 재성장')}
  }
 }
}

function updateEnemies(dt){
 for(const e of game.enemies){
  if(e.dead)continue;if(e.flash>0)e.flash-=dt;
  if(e.stun>0){e.stun-=dt;continue}
  if(e.slow>0)e.slow-=dt;else e.slowFactor=1;
  let blocked=false;
  if(e.blockId!=null){
   const s=game.soldiers.find(s=>s.id===e.blockId&&!s.dead);
   if(s&&Math.hypot(s.x-e.x,s.y-e.y)<35)blocked=true;else e.blockId=null;
  }
  let aura=1;
  for(const i of game.enemies)if(i!==e&&!i.dead&&i.type==='insulin'&&dist(i,e)<92){aura=1.15;break}
  if(!blocked){e.progress+=e.speed*e.slowFactor*aura*dt;const p=pathPos(e.progress);e.x=p.x;e.y=p.y}
  if(e.type==='stress'){
   e.bossCd-=dt;if(e.bossCd<=0){
    e.bossCd=5.0;
    const victims=game.towers.filter(t=>dist(t,e)<190).sort((a,b)=>dist(a,e)-dist(b,e)).slice(0,2);
    victims.forEach(t=>t.silencedUntil=game.time+3.2);
    if(victims.length)toast('스트레스의 과로! 가까운 모낭 2개가 잠시 기능 정지');
   }
  }
  if(e.progress>=totalPath){
   e.dead=true;game.life-=e.leak;toast(`${enemyDefs[e.type].name} 침투! 모낭 -${e.leak}`);
   if(game.life<=0){game.life=0;lose()}syncUI();
  }
 }
 game.enemies=game.enemies.filter(e=>!e.dead&&e.hp>0);
}

function updateZones(dt){for(const z of game.zones)z.life-=dt;game.zones=game.zones.filter(z=>z.life>0)}
function updateSpawns(dt){
 if(!game.inWave)return;
 game.spawnClock+=dt;
 while(game.queue.length&&game.spawnClock>=game.queue[0].at){const q=game.queue.shift();spawnEnemy(q.type,q.wave)}
 if(game.queue.length===0&&game.enemies.length===0){
  if(game.wave>=10)win();
  else{game.inWave=false;game.gold+=28+game.wave*3;toast(`웨이브 정리 완료! 영양분 +${28+game.wave*3}`);syncUI()}
 }else syncUI();
}

function useGlobal(skill){
 if(game.over||game.skillCd[skill]>0)return;
 game.action=skill;game.actionTower=null;game.selectedHero=false;game.selectedTower=null;closePanel();
 toast(skill==='massage'?'두피 마사지할 위치를 클릭하세요.':'강화할 모낭 타워를 클릭하세요.');
}
function applyAction(x,y){
 if(!game.action)return false;
 const a=game.action;
 if(a==='rally'){
  const t=game.actionTower,np=nearestProgress(x,y);
  if(!t||t.type!=='matrix'){game.action=null;return true}
  if(np.d>28||Math.hypot(np.x-t.x,np.y-t.y)>towerStats(t).range+30){toast('모모세포의 집결 범위 안쪽 길을 클릭하세요.');return true}
  t.rallyP=np.p;game.action=null;game.actionTower=null;toast('병사 집결지 이동!');openTowerPanel(t);return true;
 }
 if(a==='massage'){
  game.skillCd.massage=24;game.zones.push({x,y,r:96,life:6,max:6,type:'massage'});
  for(const e of game.enemies)if(Math.hypot(e.x-x,e.y-y)<96){e.slow=6;e.slowFactor=.56}
  game.action=null;toast('두피 마사지! 이동속도 감소');return true;
 }
 const t=game.towers.find(t=>Math.hypot(t.x-x,t.y-y)<27);
 if(!t){toast('모낭 타워를 클릭하세요.');return true}
 if(a==='mino'){t.buffUntil=game.time+10;game.skillCd.mino=35;toast('미녹시딜! 10초간 공격속도 크게 증가')}
 if(a==='nutri'){t.nutriUntil=game.time+12;game.skillCd.nutri=42;toast('영양 공급! 12초간 공격력 크게 증가')}
 game.action=null;return true;
}
function updateGlobalSkills(dt){
 for(const k in game.skillCd)game.skillCd[k]=Math.max(0,game.skillCd[k]-dt);
 [['mino',ui.minoCd,ui.minoBtn],['massage',ui.massageCd,ui.massageBtn],['nutri',ui.nutriCd,ui.nutriBtn]].forEach(([k,el,b])=>{
  const c=game.skillCd[k];el.textContent=c>0?`${c.toFixed(1)}초`:'사용 가능';b.disabled=c>0||game.over;
 });
}

function lose(){
 game.over=true;game.inWave=false;ui.modalTitle.textContent='🧑‍🦲 모낭줄기세포 사멸';
 ui.modalText.innerHTML='탈모 인자가 모낭줄기세포까지 도달했습니다.<br><br><b>이상연의 마지막 한 올을 지키지 못했습니다.</b>';
 ui.modal.style.display='flex';syncUI();
}
function win(){
 if(game.over)return;game.over=true;ui.modalTitle.textContent='🌱 모낭 사수 성공!';
 ui.modalText.innerHTML='DHT와 스트레스의 공세를 버티고 모낭줄기세포를 지켰습니다.<br><br><b>이상연의 한 올은 아직 굵게 살아 있습니다.</b>';
 ui.modal.style.display='flex';syncUI();
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
 if(e.type==='stress'){
  rect(-24,-23,48,46,'#2e2930');rect(-18,-18,36,34,e.color);rect(-12,-14,7,7,'#ff6969');rect(5,-14,7,7,'#ff6969');text('STRESS',0,3,7);
 }else if(e.type==='alcohol'){
  rect(-8,-12,16,22,e.color);rect(-4,-17,8,6,'#d7eff8');rect(-5,-7,10,8,'#eefaff');text('酒',0,-3,7,'center','#315875');
 }else if(e.type==='fried'){
  rect(-14,-11,28,22,e.color);rect(-9,-16,18,7,'#f1bc5d');rect(-5,-5,5,5,'#6b351e');rect(4,-5,5,5,'#6b351e');
 }else if(e.type==='dht'){
  rect(-12,-12,24,24,e.color);rect(-15,-17,7,8,'#54283b');rect(8,-17,7,8,'#54283b');text('DHT',0,1,7);
 }else if(e.type==='inflame'){
  rect(-10,-10,20,20,e.color);rect(-4,-16,8,7,'#ff9b50');rect(-14,-3,7,9,'#ff7c49');rect(8,-5,7,10,'#ffbc4f');
 }else{
  rect(-16,-15,32,30,e.color);rect(-9,-7,6,6,'#e7c9ff');rect(3,-7,6,6,'#e7c9ff');text('IR',0,5,8);
 }
 ctx.restore();
 const w=e.type==='stress'?58:32;rect(e.x-w/2,e.y-e.size-13,w,4,'#512e35');rect(e.x-w/2,e.y-e.size-13,w*clamp(e.hp/e.maxHp,0,1),4,'#88d26a');
 if(e.stun>0)text('✦',e.x+e.size,e.y-e.size,10,'center','#fff0a5');else if(e.slow>0)text('❄',e.x+e.size,e.y-e.size,10);
}
function drawSoldier(s){
 rect(s.x-4,s.y-13,8,19,'#e9e5df');rect(s.x-2,s.y-25,4,13,'#292326');rect(s.x-6,s.y-14,12,5,'#5ea9a2');
 rect(s.x-8,s.y-28,16,2,'#512f36');rect(s.x-8,s.y-28,16*clamp(s.hp/s.maxHp,0,1),2,'#7ed58a');
}
function drawHero(){
 const h=game.hero;if(h.dead){text(`재성장 ${Math.ceil(h.respawn)}`,520,312,10);return}
 if(game.selectedHero){ctx.strokeStyle='#fff18a';ctx.lineWidth=2;ctx.beginPath();ctx.arc(h.x,h.y,20,0,Math.PI*2);ctx.stroke()}
 // 마지막 한 올: 큰 한 가닥
 rect(h.x-6,h.y-5,12,13,'#c59284');rect(h.x-3,h.y-31,6,27,'#171719');rect(h.x-8,h.y-18,5,6,'#241e20');
 text('한 올',h.x,h.y+18,8);rect(h.x-17,h.y-37,34,3,'#512f35');rect(h.x-17,h.y-37,34*clamp(h.hp/h.maxHp,0,1),3,'#83da82');
 if(game.time<h.auraUntil){ctx.globalAlpha=.1;ctx.fillStyle='#fff3a0';ctx.beginPath();ctx.arc(h.x,h.y,135,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
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
  ctx.globalAlpha=z.type==='boom'||z.type==='hero'?.32:.16;
  ctx.fillStyle=z.type==='inflame'?'#f04433':z.type==='massage'?'#74d5e6':z.type==='hero'?'#fff29a':'#ffd45c';
  ctx.beginPath();ctx.arc(z.x,z.y,z.r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }
}
function drawAuras(){
 for(const e of game.enemies){
  if(e.type==='dht'){ctx.globalAlpha=.07;ctx.fillStyle='#e52f72';ctx.beginPath();ctx.arc(e.x,e.y,115,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
  if(e.type==='insulin'){ctx.globalAlpha=.07;ctx.fillStyle='#c692ef';ctx.beginPath();ctx.arc(e.x,e.y,92,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1}
 }
 for(const t of game.towers)if(t.type==='papilla'&&t.branch==='vegf'){
  ctx.globalAlpha=.06;ctx.fillStyle='#74e0bd';ctx.beginPath();ctx.arc(t.x,t.y,120,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 }
}

function draw(){
 drawScalp();drawPath();drawZones();drawPads();drawAuras();
 game.towers.forEach(drawHairTower);game.soldiers.forEach(drawSoldier);game.enemies.forEach(drawEnemy);drawHero();drawBullets();
 if(game.action)text(game.action==='rally'?'집결시킬 길을 클릭':'대상을 클릭',W/2,510,12,'center','#fff2a6');
}

let last=performance.now();
function loop(now){
 const dt=Math.min(.033,(now-last)/1000);last=now;
 if(!game.over&&!game.introActive){
  game.time+=dt;updateGlobalSkills(dt);updateSpawns(dt);updateTowers(dt);updateBullets(dt);updateSoldiers(dt);updateHero(dt);updateEnemies(dt);updateZones(dt);
 }
 draw();requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function canvasPoint(ev){const r=C.getBoundingClientRect();return{x:(ev.clientX-r.left)*W/r.width,y:(ev.clientY-r.top)*H/r.height}}
C.addEventListener('click',ev=>{
 if(game.over||game.introActive)return;const p=canvasPoint(ev);
 if(applyAction(p.x,p.y))return;
 const h=game.hero;
 if(!h.dead&&Math.hypot(p.x-h.x,p.y-h.y)<24){openHeroPanel();return}
 if(game.selectedHero){h.targetX=clamp(p.x,20,W-20);h.targetY=clamp(p.y,78,H-24);game.selectedHero=false;closePanel();toast('마지막 머리카락 이동');return}
 const t=game.towers.find(t=>Math.hypot(p.x-t.x,p.y-t.y)<27);if(t){openTowerPanel(t);return}
 const pi=pads.findIndex(pd=>!pd.tower&&Math.hypot(p.x-pd.x,p.y-pd.y)<25);if(pi>=0){openBuildPanel(pi);return}
 closePanel();game.selectedTower=null;
});

ui.waveBtn.onclick=startWave;
ui.minoBtn.onclick=()=>useGlobal('mino');ui.massageBtn.onclick=()=>useGlobal('massage');ui.nutriBtn.onclick=()=>useGlobal('nutri');
ui.restartBtn.onclick=reset;
ui.storyNext.addEventListener('click',e=>{e.stopPropagation();nextStory()});
ui.storySkip.addEventListener('click',e=>{e.stopPropagation();endStory()});
ui.storyScene.addEventListener('click',nextStory);
window.addEventListener('keydown',e=>{
 if(game.introActive&&(e.code==='Space'||e.code==='Enter')){e.preventDefault();nextStory();return}
 if(game.introActive&&e.key==='Escape'){e.preventDefault();endStory();return}
 if(e.code==='Space'){e.preventDefault();startWave()}
 if(e.key==='Escape'){game.action=null;game.actionTower=null;game.selectedHero=false;game.selectedTower=null;closePanel();toast('선택 취소')}
});
})();
