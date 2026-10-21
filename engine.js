// Pure game rules. The room owner runs this reducer for both players.
export const OTHER = c => c === 'w' ? 'b' : 'w';
export const NAMES = {p:'폰', n:'나이트', b:'비숍', r:'룩', q:'퀸', k:'킹'};
export const CARDS = [
  {id:'n_stride', name:'자유로운 기사', type:'KNIGHT', icon:'n', tier:'희귀', desc:'나이트가 상하좌우로 한 칸 더 이동하고 공격합니다.', short:'나이트 · 직선 1칸'},
  {id:'b_guard', name:'전장의 수도사', type:'BISHOP', icon:'b', tier:'희귀', desc:'비숍이 상하좌우 한 칸도 이동하고 공격합니다.', short:'비숍 · 직선 1칸'},
  {id:'r_edge', name:'기울어진 성벽', type:'ROOK', icon:'r', tier:'희귀', desc:'룩이 대각선 한 칸도 이동하고 공격합니다.', short:'룩 · 대각선 1칸'},
  {id:'p_fang', name:'측면의 송곳니', type:'PAWN', icon:'p', tier:'희귀', desc:'폰이 좌우 바로 옆의 적 기물도 잡을 수 있습니다.', short:'폰 · 좌우 포획'},
  {id:'p_march', name:'선봉대', type:'PAWN', icon:'p', tier:'희귀', desc:'시작 줄의 폰이 첫 이동에 최대 세 칸 전진합니다. 세 칸 이동은 앙파상 대상이 아닙니다.', short:'폰 · 첫 이동 3칸'},
  {id:'p_retreat', name:'전술적 후퇴', type:'PAWN', icon:'p', tier:'희귀', desc:'폰이 뒤로 한 칸 물러날 수 있습니다. 후퇴로는 기물을 잡지 않습니다.', short:'폰 · 후퇴 1칸'},
  {id:'k_stride', name:'왕의 도약', type:'KING', icon:'k', tier:'전설', desc:'킹이 나이트처럼 뛰어넘어 이동하고 공격합니다. 체크를 받는 곳으로는 갈 수 없습니다.', short:'킹 · 나이트 도약'},
  {id:'q_leap', name:'차원을 걷는 여왕', type:'QUEEN', icon:'q', tier:'전설', desc:'퀸이 나이트의 이동과 공격도 사용합니다. 중간 기물을 뛰어넘습니다.', short:'퀸 · 나이트 도약'},
  {id:'story_wall', name:'독자의 방벽', type:'ABILITY', icon:'b', tier:'희귀', family:'서사', active:true, uses:2, target:'보호할 아군 기물을 선택하세요. 킹은 제외됩니다.', desc:'아군 기물 하나를 상대의 다음 차례가 끝날 때까지 포획할 수 없게 합니다. 킹 제외. 한 수 소모 · 대전당 2회.', short:'보호 · 2회'},
  {id:'return_echo', name:'회귀의 잔향', type:'ABILITY', icon:'n', tier:'희귀', family:'서사', active:true, uses:1, target:'직전 이동 기물이 돌아갈 원래 칸을 선택하세요.', desc:'자신이 직전에 일반 이동한 기물을 비어 있는 출발 칸으로 되돌립니다. 포획은 복구하지 않으며 킹·승급·봉인 기물은 제외합니다. 한 수 소모 · 1회.', short:'직전 기물 회귀 · 1회'},
  {id:'star_support', name:'별의 후원', type:'ABILITY', icon:'p', tier:'희귀', family:'서사', active:true, uses:1, target:'아군 폰 시작 줄의 빈칸을 선택하세요.', desc:'자신의 폰 시작 줄 빈칸에 폰 하나를 소환합니다. 소환한 폰은 첫 이동의 두·세 칸 전진을 사용할 수 없습니다. 한 수 소모 · 1회.', short:'폰 소환 · 1회'},
  {id:'record_echo', name:'기록의 재현', type:'ABILITY', icon:'q', tier:'전설', family:'서사', active:true, uses:1, target:'상대가 가장 최근에 고른 지속형 증강을 복제합니다.', desc:'상대가 가장 최근에 선택한 지속형 증강 하나를 영구 복제합니다. 이미 보유한 효과와 발동형은 복제하지 않습니다. 한 수 소모 · 1회.', short:'지속형 복제 · 1회'},
  {id:'grave_call', name:'묘지의 부름', type:'ABILITY', icon:'b', tier:'전설', family:'듀얼', active:true, uses:1, target:'아군 진영 뒤쪽 두 줄의 빈칸에 부활시키세요.', desc:'가장 최근에 잃은 부활 가능한 기물을 자신의 뒤쪽 두 줄 빈칸에 되살립니다. 킹·퀸 제외. 첫 이동·캐슬링 권리는 복구되지 않습니다. 한 수 소모 · 1회.', short:'기물 부활 · 1회'},
  {id:'tribute_crown', name:'제물의 왕관', type:'ABILITY', icon:'q', tier:'전설', family:'듀얼', active:true, uses:1, target:'퀸으로 바꿀 아군 룩을 선택하세요. 아군 폰 하나를 희생합니다.', desc:'아군 폰 하나를 희생해 아군 룩을 퀸으로 바꿉니다. 룩과 가장 가까운 파일의 폰을 희생하며 동률은 a8→h1 순서입니다. 봉인 룩·폰 제외. 한 수 소모 · 1회.', short:'폰 제물 → 룩을 퀸으로 · 1회'},
  {id:'binding_chain', name:'봉인의 사슬', type:'ABILITY', icon:'r', tier:'희귀', family:'듀얼', active:true, uses:2, target:'다음 차례 이동을 봉인할 적 기물을 선택하세요. 킹은 제외됩니다.', desc:'적 기물 하나의 다음 차례 이동을 봉인합니다. 공격 범위는 그대로 유지되며 킹은 제외됩니다. 상대의 다음 차례 끝에 해제. 한 수 소모 · 2회.', short:'이동 봉인 · 2회'},
  {id:'counter_sigil', name:'반격의 각인', type:'ABILITY', icon:'r', tier:'희귀', family:'듀얼', active:true, uses:1, target:'반격을 새길 아군 기물을 선택하세요. 킹은 제외됩니다.', desc:'아군 기물에 공개된 반격 각인을 새깁니다. 이 기물이 잡히면 잡은 기물도 함께 제거됩니다. 양쪽 킹은 제외되며 발동까지 유지됩니다. 한 수 소모 · 1회.', short:'포획 시 동귀어진 · 1회'}
];
const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const ORTHO = [[1,0],[-1,0],[0,1],[0,-1]], DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]];
const inside = (r,c) => r>=0 && r<8 && c>=0 && c<8;
export const squareName = i => 'abcdefgh'[i%8] + (8-Math.floor(i/8));
const has = (s,c,id) => s.aug[c].includes(id)||(s.echoes?.[c]||[]).includes(id);
const activeEffect=(s,p,key)=>!!p&&Number.isInteger(p[key])&&p[key]>s.ply;
const frozen=(s,p)=>activeEffect(s,p,'boundUntil');
const protectedPiece=(s,p)=>activeEffect(s,p,'shieldUntil');
export const abilityRemaining=(s,color,id)=>Math.max(0,s?.uses?.[color]?.[id]||0);
export function effectTags(s,index){const p=s.board[index];return [protectedPiece(s,p)?'방벽':null,frozen(s,p)?'봉인':null,p?.counter?'반격':null].filter(Boolean);}
export function position() {
  const board = Array(64).fill(null), order='rnbqkbnr';
  for(let c=0;c<8;c++) {
    board[c]={c:'b',t:order[c]}; board[8+c]={c:'b',t:'p'};
    board[48+c]={c:'w',t:'p'}; board[56+c]={c:'w',t:order[c]};
  }
  return {board,turn:'w',aug:{w:[],b:[]},castle:{w:[true,true],b:[true,true]},ep:null,half:0,ply:0,uses:{w:{},b:{}},echoes:{w:[],b:[]},graveyard:{w:[],b:[]},lastOwnMove:{w:null,b:null}};
}
export function pseudo(s,from,attacks=false) {
  const p=s.board[from]; if(!p||(!attacks&&frozen(s,p)))return [];
  const r=Math.floor(from/8),c=from%8,moves=[];
  const add=(rr,cc,extra={})=>{
    if(!inside(rr,cc))return false;
    const to=rr*8+cc, target=s.board[to];
    if(attacks || !target || (target.c!==p.c && target.t!=='k'&&!protectedPiece(s,target))) moves.push({from,to,...extra});
    return !target;
  };
  const step=dirs=>dirs.forEach(([dr,dc])=>add(r+dr,c+dc));
  const slide=dirs=>dirs.forEach(([dr,dc])=>{for(let d=1;d<8;d++){if(!add(r+dr*d,c+dc*d))break;}});
  if(p.t==='p') {
    const d=p.c==='w'?-1:1, start=p.c==='w'?6:1;
    for(const dc of [-1,1]) if(inside(r+d,c+dc)) {
      const to=(r+d)*8+c+dc, t=s.board[to];
      if(attacks || (t && t.c!==p.c && t.t!=='k'&&!protectedPiece(s,t))) moves.push({from,to});
      else if(!t&&to===s.ep && s.board[r*8+c+dc]?.t==='p' && s.board[r*8+c+dc]?.c===OTHER(p.c)&&!protectedPiece(s,s.board[r*8+c+dc])) moves.push({from,to,ep:true});
    }
    if(has(s,p.c,'p_fang')) for(const dc of [-1,1]) {
      if(!inside(r,c+dc))continue;
      const to=r*8+c+dc,t=s.board[to];
      if(attacks || (t && t.c!==p.c && t.t!=='k'&&!protectedPiece(s,t)))moves.push({from,to});
    }
    if(!attacks) {
      const max=r===start&&!p.moved?(has(s,p.c,'p_march')?3:2):1;
      for(let n=1;n<=max;n++){const rr=r+d*n;if(!inside(rr,c)||s.board[rr*8+c])break;moves.push({from,to:rr*8+c,double:n===2});}
      if(has(s,p.c,'p_retreat')&&inside(r-d,c)&&!s.board[(r-d)*8+c])moves.push({from,to:(r-d)*8+c});
    }
  }
  if(p.t==='n'){step(KNIGHT);if(has(s,p.c,'n_stride'))step(ORTHO);}
  if(p.t==='b'){slide(DIAG);if(has(s,p.c,'b_guard'))step(ORTHO);}
  if(p.t==='r'){slide(ORTHO);if(has(s,p.c,'r_edge'))step(DIAG);}
  if(p.t==='q'){slide([...ORTHO,...DIAG]);if(has(s,p.c,'q_leap'))step(KNIGHT);}
  if(p.t==='k') {
    step([...ORTHO,...DIAG]); if(has(s,p.c,'k_stride'))step(KNIGHT);
    const home=p.c==='w'?60:4;
    if(!attacks&&from===home&&!p.moved&&!inCheck(s,p.c)) {
      for(const [side,rook,between,through,to] of [[0,home+3,[1,2],[1,2],home+2],[1,home-4,[-1,-2,-3],[-1,-2],home-2]]) {
        if(s.castle[p.c][side]&&s.board[rook]?.c===p.c&&s.board[rook]?.t==='r'&&!s.board[rook].moved&&!frozen(s,s.board[rook])&&between.every(x=>!s.board[home+x])&&through.every(x=>!attacked(s,home+x,OTHER(p.c))))moves.push({from,to,castle:side===0?'king':'queen'});
      }
    }
  }
  // A modified movement may overlap an ordinary one.
  return moves.filter((m,i,a)=>a.findIndex(x=>x.to===m.to)===i);
}
export function attacked(s,sq,by){return s.board.some((p,i)=>p?.c===by&&pseudo(s,i,true).some(m=>m.to===sq));}
export function inCheck(s,color){const k=s.board.findIndex(p=>p?.c===color&&p.t==='k');return k<0||attacked(s,k,OTHER(color));}
function copyPosition(s){return {...s,board:s.board.map(p=>p?{...p}:null),castle:{w:[...s.castle.w],b:[...s.castle.b]},uses:{w:{...s.uses?.w},b:{...s.uses?.b}},echoes:{w:[...(s.echoes?.w||[])],b:[...(s.echoes?.b||[])]},graveyard:{w:[...(s.graveyard?.w||[])],b:[...(s.graveyard?.b||[])]},lastOwnMove:{w:s.lastOwnMove?.w?{...s.lastOwnMove.w}:null,b:s.lastOwnMove?.b?{...s.lastOwnMove.b}:null},lastEffects:[]};}
function revokeSquare(s,i){for(const color of ['w','b']){const home=color==='w'?60:4;if(i===home+3)s.castle[color][0]=false;if(i===home-4)s.castle[color][1]=false;}}
function bury(s,p,i){if(!p||p.t==='k')return;s.graveyard[p.c].push({c:p.c,t:p.t});revokeSquare(s,i);}
function finishTurn(s,color){s.turn=OTHER(color);s.ply++;for(const p of s.board){if(!p)continue;for(const key of ['shieldUntil','boundUntil'])if(p[key]!==undefined&&p[key]<=s.ply)delete p[key];}return s;}
export function applyMove(s,m,promotion='q') {
  const n=copyPosition(s),p=n.board[m.from],captureSquare=m.ep?m.to+(p.c==='w'?8:-8):m.to,target=n.board[captureSquare];
  n.board[m.from]=null;n.board[captureSquare]=null;n.board[m.to]={...p,moved:true,moveStamp:s.ply+1};
  if(target)bury(n,target,captureSquare);
  if(m.castle){const rookFrom=m.castle==='king'?m.from+3:m.from-4,rookTo=m.castle==='king'?m.from+1:m.from-1;n.board[rookTo]={...n.board[rookFrom],moved:true};n.board[rookFrom]=null;}
  if(p.t==='k')n.castle[p.c]=[false,false];
  revokeSquare(n,m.from);revokeSquare(n,m.to);
  if(target?.counter&&p.t!=='k'){bury(n,n.board[m.to],m.to);n.board[m.to]=null;n.lastEffects.push('반격의 각인: 공격 기물도 제거');}
  const promoted=p.t==='p'&&Math.floor(m.to/8)===(p.c==='w'?0:7);
  if(promoted&&n.board[m.to])n.board[m.to].t=['q','r','b','n'].includes(promotion)?promotion:'q';
  n.lastOwnMove[p.c]=p.t!=='k'&&!promoted&&n.board[m.to]?{from:m.from,to:m.to,t:p.t,stamp:s.ply+1}:null;
  n.ep=m.double&&n.board[m.to]?(m.from+m.to)/2:null;n.half=p.t==='p'||target||m.ep?0:s.half+1;
  return finishTurn(n,p.c);
}
export function legalMoves(s,color=s.turn){
  return s.board.flatMap((p,i)=>p?.c===color?pseudo(s,i).filter(m=>!inCheck(applyMove(s,m),color)):[]);
}
function latestPassive(s,color){return [...s.aug[OTHER(color)]].reverse().find(id=>!CARDS.find(c=>c.id===id)?.active);}
function revivalIndex(s,color){const list=s.graveyard?.[color]||[];for(let i=list.length-1;i>=0;i--)if(['p','n','b','r'].includes(list[i].t))return i;return -1;}
function sacrificePawn(s,color,to){return s.board.map((p,i)=>({p,i})).filter(x=>x.p?.c===color&&x.p.t==='p'&&!frozen(s,x.p)).sort((a,b)=>Math.abs(a.i%8-to%8)-Math.abs(b.i%8-to%8)||a.i-b.i)[0]?.i;}
function abilityCandidates(s,color){
  if(color!==s.turn||s.result||(s.phase&&s.phase!=='play'))return [];
  const actions=[],add=(id,to)=>actions.push(to===undefined?{type:'ability',id}:{type:'ability',id,to});
  for(const id of s.aug[color]){
    if(!CARDS.find(c=>c.id===id)?.active||!abilityRemaining(s,color,id))continue;
    if(id==='record_echo'){const copy=latestPassive(s,color);if(copy&&!has(s,color,copy))add(id);continue;}
    if(id==='return_echo'){const last=s.lastOwnMove?.[color],p=last&&s.board[last.to];if(last&&!s.board[last.from]&&p?.c===color&&p.t===last.t&&p.t!=='k'&&p.moveStamp===last.stamp&&!frozen(s,p))add(id,last.from);continue;}
    for(let to=0;to<64;to++){
      const p=s.board[to],row=Math.floor(to/8);
      if(id==='story_wall'&&p?.c===color&&p.t!=='k'&&!protectedPiece(s,p))add(id,to);
      if(id==='counter_sigil'&&p?.c===color&&p.t!=='k'&&!p.counter)add(id,to);
      if(id==='binding_chain'&&p?.c===OTHER(color)&&p.t!=='k'&&!frozen(s,p))add(id,to);
      if(id==='star_support'&&!p&&row===(color==='w'?6:1))add(id,to);
      if(id==='grave_call'&&!p&&(color==='w'?row>=6:row<=1)&&revivalIndex(s,color)>=0)add(id,to);
      if(id==='tribute_crown'&&p?.c===color&&p.t==='r'&&!frozen(s,p)&&sacrificePawn(s,color,to)!==undefined)add(id,to);
    }
  }
  return actions;
}
function applyAbility(s,action,color=s.turn){
  const n=copyPosition(s),{id,to}=action;n.uses[color][id]--;n.ep=null;n.half=0;
  n.last=to===undefined?null:{from:to,to};
  if(id==='story_wall')n.board[to].shieldUntil=s.ply+2;
  if(id==='binding_chain')n.board[to].boundUntil=s.ply+2;
  if(id==='counter_sigil')n.board[to].counter=true;
  if(id==='return_echo'){const last=s.lastOwnMove[color];n.board[to]={...n.board[last.to],moved:true};n.board[last.to]=null;n.last={from:last.to,to};revokeSquare(n,last.to);revokeSquare(n,to);n.lastOwnMove[color]=null;}
  if(id==='star_support'){n.board[to]={c:color,t:'p',moved:true};}
  if(id==='record_echo'){const copied=latestPassive(s,color);n.echoes[color].push(copied);n.lastEffects.push('복제: '+CARDS.find(c=>c.id===copied).name);}
  if(id==='grave_call'){const i=revivalIndex(s,color),p=n.graveyard[color][i];n.board[to]={c:color,t:p.t,moved:true};n.graveyard[color].splice(i,1);revokeSquare(n,to);n.lastEffects.push(NAMES[p.t]+' 부활');}
  if(id==='tribute_crown'){const victim=sacrificePawn(s,color,to);bury(n,n.board[victim],victim);n.board[victim]=null;n.board[to]={...n.board[to],t:'q',moved:true};delete n.board[to].moveStamp;revokeSquare(n,to);n.lastEffects.push(squareName(victim)+' 폰 희생');}
  return finishTurn(n,color);
}
export function legalAbilities(s,color=s.turn){return abilityCandidates(s,color).filter(a=>!inCheck(applyAbility(s,a,color),color));}
function nextRandom(s){let x=s.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;}
function deal(s,color){const pool=CARDS.map(x=>x.id).filter(id=>!has(s,color,id));for(let i=pool.length-1;i>0;i--){const j=Math.floor(nextRandom(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3);}
export function createGame(seed=Date.now()) {
  const s={...position(),rng:(seed>>>0)||1234567,rev:0,phase:'draft',draftTurn:'w',offers:{w:[],b:[]},log:[],last:null,result:null,seen:{},drawOffer:null,rematch:[]};
  s.offers.w=deal(s,'w');s.offers.b=deal(s,'b'); return s;
}
function key(s){
  const ep=s.ep!==null&&legalMoves(s).some(m=>m.ep)?s.ep:null;
  const rewind=['w','b'].map(c=>{if(!abilityRemaining(s,c,'return_echo'))return null;const m=s.lastOwnMove?.[c],p=m&&s.board[m.to];return m&&p?.c===c&&p.t===m.t&&p.moveStamp===m.stamp?[m.from,m.to,m.t]:null;});
  return JSON.stringify([s.board.map((p,i)=>p?[p.c,p.t,p.t==='p'&&Math.floor(i/8)===(p.c==='w'?6:1)&&!!p.moved,Math.max(0,(p.shieldUntil||0)-s.ply),Math.max(0,(p.boundUntil||0)-s.ply),!!p.counter]:null),s.turn,s.castle,ep,s.aug,s.echoes,s.uses,s.graveyard,rewind]);
}
function terminal(s){
  const moves=legalMoves(s);
  if(!moves.length&&!legalAbilities(s).length)return inCheck(s,s.turn)?{winner:OTHER(s.turn),reason:'체크메이트'}:{winner:null,reason:'스테일메이트'};
  if(s.half>=100)return {winner:null,reason:'50수 규칙'};
  if((s.seen[key(s)]||0)>=3)return {winner:null,reason:'동일 포지션 3회 반복'};
  if(!s.aug.w.length&&!s.aug.b.length) {
    const nonKings=s.board.filter(p=>p&&p.t!=='k');
    if(nonKings.length===0||(nonKings.length===1&&['b','n'].includes(nonKings[0].t)))return {winner:null,reason:'기물 부족'};
  }
  return null;
}
// Reject stale/out-of-turn commands. Network clients send intentions, never board edits.
export function reduce(s,action,color){
  if(!s||!action||action.rev!==s.rev||!['w','b'].includes(color))return null;
  const n=structuredClone(s);
  if(action.type==='rematch'&&s.result){if(!n.rematch.includes(color))n.rematch.push(color);n.rev++;return n;}
  if(s.result)return null;
  if(action.type==='resign'){n.result={winner:OTHER(color),reason:'기권'};n.phase='over';n.rev++;return n;}
  if(action.type==='draw'){
    if(s.drawOffer===OTHER(color)){n.result={winner:null,reason:'합의 무승부'};n.phase='over';}
    else if(!s.drawOffer)n.drawOffer=color;else return null;
    n.rev++;return n;
  }
  if(action.type==='decline'&&s.drawOffer===OTHER(color)){n.drawOffer=null;n.rev++;return n;}
  if(s.phase==='draft'){
    if(action.type!=='choose'||s.draftTurn!==color||!s.offers[color].includes(action.id))return null;
    const card=CARDS.find(x=>x.id===action.id);n.aug[color].push(action.id);if(card.active)n.uses[color][card.id]=card.uses;n.log.push({kind:'augment',color,text:card.name});
    if(color==='w')n.draftTurn='b';
    else {n.phase='play';n.draftTurn=null;n.seen={};n.seen[key(n)]=1;n.result=terminal(n);if(n.result)n.phase='over';}
    n.rev++;return n;
  }
  if(s.phase!=='play'||s.turn!==color)return null;
  if(action.type==='ability'){
    const ability=legalAbilities(s).find(a=>a.id===action.id&&a.to===action.to);if(!ability)return null;
    Object.assign(n,applyAbility(n,ability,color));n.drawOffer=null;
    n.seen[key(n)]=(n.seen[key(n)]||0)+1;n.result=terminal(n);
    const card=CARDS.find(c=>c.id===action.id);n.log.push({kind:'ability',color,ply:n.ply,text:'✦ '+card.name+(ability.to===undefined?'':' · '+squareName(ability.to))+(n.lastEffects.length?' · '+n.lastEffects.join(' · '):'')});
    return finishAction(n);
  }
  if(action.type!=='move'||!Number.isInteger(action.from)||!Number.isInteger(action.to))return null;
  const move=legalMoves(s).find(m=>m.from===action.from&&m.to===action.to);if(!move)return null;
  const piece=s.board[move.from],capture=!!s.board[move.to]||move.ep;
  const moved=applyMove(n,move,action.promotion);Object.assign(n,moved);n.last={from:move.from,to:move.to};n.drawOffer=null;
  n.seen[key(n)]=(n.seen[key(n)]||0)+1;n.result=terminal(n);
  n.log.push({kind:'move',color,ply:n.ply,text:(move.castle?(move.castle==='king'?'O-O':'O-O-O'):`${piece.t==='p'?'':NAMES[piece.t]+' '}${squareName(move.from)}${capture?' × ':' → '}${squareName(move.to)}${piece.t==='p'&&n.board[move.to]&&n.board[move.to].t!=='p'?' = '+NAMES[n.board[move.to].t]:''}`)+(n.result?.reason==='체크메이트'?' #':inCheck(n,n.turn)?' +':'')+(n.lastEffects.length?' · '+n.lastEffects.join(' · '):'')});
  return finishAction(n);
}
function finishAction(n){
  if(n.result)n.phase='over';
  else if([12,24].includes(n.ply)){n.phase='draft';n.draftTurn='w';n.offers={w:deal(n,'w'),b:deal(n,'b')};}
  n.rev++;return n;
}
export function evaluate(s,color){
  const val={p:100,n:320,b:335,r:510,q:950,k:0};let score=0;
  s.board.forEach((p,i)=>{if(!p)return;const r=Math.floor(i/8),c=i%8,center=3.5-Math.abs(3.5-c)+3.5-Math.abs(3.5-r);const progress=p.c==='w'?6-r:r-1;let v=val[p.t]+center*(['n','b'].includes(p.t)?9:3)+(p.t==='p'?progress*7:0);if(p.t==='k')v-=center*4;if(p.counter)v+=Math.min(val[p.t]*.2,90);if(protectedPiece(s,p))v+=25;if(frozen(s,p))v-=30;score+=(p.c===color?1:-1)*v;});
  for(const c of ['w','b']){const potential=Object.entries(s.uses?.[c]||{}).reduce((sum,[id,count])=>sum+count*({star_support:40,grave_call:45,tribute_crown:80,record_echo:50,story_wall:15,binding_chain:15,counter_sigil:25,return_echo:15}[id]||0),0)+(s.echoes?.[c]?.length||0)*60;score+=(c===color?1:-1)*potential;}
  return score;
}
export function aiMove(s,level='normal'){
  const moves=legalMoves(s);if(!moves.length)return null;
  if(level==='easy')return moves.map(m=>({m,v:evaluate(applyMove(s,m),s.turn)+Math.random()*180})).sort((a,b)=>b.v-a.v)[0].m;
  const color=s.turn;
  const sorted=moves.map(m=>({m,v:evaluate(applyMove(s,m),color)+(s.board[m.to]?40:0)})).sort((a,b)=>b.v-a.v);
  let best=null,bestScore=-Infinity;
  for(const {m} of sorted){const n=applyMove(s,m),responses=legalMoves(n);let score;
    if(!responses.length)score=inCheck(n,n.turn)?100000:0;
    else {score=Infinity;for(const reply of responses){const q=applyMove(n,reply);let v=evaluate(q,color);if(inCheck(q,color))v-=20;score=Math.min(score,v);if(score<bestScore-1)break;}}
    score+=Math.random()*4;if(score>bestScore){best=m;bestScore=score;}
  }
  return best;
}
// The ordinary move API remains available; the UI uses this action API for active skills.
export function aiAction(s,level='normal'){
  const color=s.turn,actions=[...legalMoves(s).map(m=>({type:'move',...m})),...legalAbilities(s)];
  if(!actions.length)return null;
  const simulate=(state,a)=>a.type==='ability'?applyAbility(state,a):applyMove(state,a);
  if(level==='easy')return actions.map(a=>({a,v:evaluate(simulate(s,a),color)+Math.random()*120})).sort((a,b)=>b.v-a.v)[0].a;
  let best=null,bestScore=-Infinity;
  const ordered=actions.map(a=>({a,v:evaluate(simulate(s,a),color)})).sort((a,b)=>b.v-a.v);
  for(const {a} of ordered){const n=simulate(s,a),responses=[...legalMoves(n).map(m=>({type:'move',...m})),...legalAbilities(n)];let score=responses.length?Infinity:inCheck(n,n.turn)?100000:0;
    for(const reply of responses){const q=simulate(n,reply);let value=evaluate(q,color);if(inCheck(q,color))value-=20;score=Math.min(score,value);if(score<bestScore-1)break;}
    score+=Math.random()*3;if(score>bestScore){best=a;bestScore=score;}
  }
  return best;
}
