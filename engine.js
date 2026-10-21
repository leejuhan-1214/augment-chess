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
  {id:'q_leap', name:'차원을 걷는 여왕', type:'QUEEN', icon:'q', tier:'전설', desc:'퀸이 나이트의 이동과 공격도 사용합니다. 중간 기물을 뛰어넘습니다.', short:'퀸 · 나이트 도약'}
];
const KNIGHT = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const ORTHO = [[1,0],[-1,0],[0,1],[0,-1]], DIAG = [[1,1],[1,-1],[-1,1],[-1,-1]];
const inside = (r,c) => r>=0 && r<8 && c>=0 && c<8;
export const squareName = i => 'abcdefgh'[i%8] + (8-Math.floor(i/8));
const has = (s,c,id) => s.aug[c].includes(id);
export function position() {
  const board = Array(64).fill(null), order='rnbqkbnr';
  for(let c=0;c<8;c++) {
    board[c]={c:'b',t:order[c]}; board[8+c]={c:'b',t:'p'};
    board[48+c]={c:'w',t:'p'}; board[56+c]={c:'w',t:order[c]};
  }
  return {board,turn:'w',aug:{w:[],b:[]},castle:{w:[true,true],b:[true,true]},ep:null,half:0,ply:0};
}
export function pseudo(s,from,attacks=false) {
  const p=s.board[from]; if(!p)return [];
  const r=Math.floor(from/8),c=from%8,moves=[];
  const add=(rr,cc,extra={})=>{
    if(!inside(rr,cc))return false;
    const to=rr*8+cc, target=s.board[to];
    if(attacks || !target || (target.c!==p.c && target.t!=='k')) moves.push({from,to,...extra});
    return !target;
  };
  const step=dirs=>dirs.forEach(([dr,dc])=>add(r+dr,c+dc));
  const slide=dirs=>dirs.forEach(([dr,dc])=>{for(let d=1;d<8;d++){if(!add(r+dr*d,c+dc*d))break;}});
  if(p.t==='p') {
    const d=p.c==='w'?-1:1, start=p.c==='w'?6:1;
    for(const dc of [-1,1]) if(inside(r+d,c+dc)) {
      const to=(r+d)*8+c+dc, t=s.board[to];
      if(attacks || (t && t.c!==p.c && t.t!=='k')) moves.push({from,to});
      else if(to===s.ep && s.board[r*8+c+dc]?.t==='p' && s.board[r*8+c+dc]?.c===OTHER(p.c)) moves.push({from,to,ep:true});
    }
    if(has(s,p.c,'p_fang')) for(const dc of [-1,1]) {
      if(!inside(r,c+dc))continue;
      const to=r*8+c+dc,t=s.board[to];
      if(attacks || (t && t.c!==p.c && t.t!=='k'))moves.push({from,to});
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
    if(!attacks&&from===home&&!inCheck(s,p.c)) {
      for(const [side,rook,between,through,to] of [[0,home+3,[1,2],[1,2],home+2],[1,home-4,[-1,-2,-3],[-1,-2],home-2]]) {
        if(s.castle[p.c][side]&&s.board[rook]?.c===p.c&&s.board[rook]?.t==='r'&&between.every(x=>!s.board[home+x])&&through.every(x=>!attacked(s,home+x,OTHER(p.c))))moves.push({from,to,castle:side===0?'king':'queen'});
      }
    }
  }
  // A modified movement may overlap an ordinary one.
  return moves.filter((m,i,a)=>a.findIndex(x=>x.to===m.to)===i);
}
export function attacked(s,sq,by){return s.board.some((p,i)=>p?.c===by&&pseudo(s,i,true).some(m=>m.to===sq));}
export function inCheck(s,color){const k=s.board.findIndex(p=>p?.c===color&&p.t==='k');return k<0||attacked(s,k,OTHER(color));}
export function applyMove(s,m,promotion='q') {
  const n={...s,board:s.board.map(p=>p?{...p}:null),castle:{w:[...s.castle.w],b:[...s.castle.b]}};
  const p=n.board[m.from],target=n.board[m.to]; n.board[m.from]=null;n.board[m.to]={...p,moved:true};
  if(m.ep)n.board[m.to+(p.c==='w'?8:-8)]=null;
  if(m.castle){const rookFrom=m.castle==='king'?m.from+3:m.from-4,rookTo=m.castle==='king'?m.from+1:m.from-1;n.board[rookTo]=n.board[rookFrom];n.board[rookFrom]=null;}
  for(const color of ['w','b']) {
    const home=color==='w'?60:4;
    if(p.c===color&&p.t==='k')n.castle[color]=[false,false];
    if(m.from===home+3||m.to===home+3)n.castle[color][0]=false;
    if(m.from===home-4||m.to===home-4)n.castle[color][1]=false;
  }
  if(p.t==='p'&&Math.floor(m.to/8)===(p.c==='w'?0:7))n.board[m.to].t=['q','r','b','n'].includes(promotion)?promotion:'q';
  n.ep=m.double?(m.from+m.to)/2:null;n.half=p.t==='p'||target||m.ep?0:s.half+1;n.turn=OTHER(p.c);n.ply=s.ply+1;
  return n;
}
export function legalMoves(s,color=s.turn){
  return s.board.flatMap((p,i)=>p?.c===color?pseudo(s,i).filter(m=>!inCheck(applyMove(s,m),color)):[]);
}
function nextRandom(s){let x=s.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;}
function deal(s,color){const pool=CARDS.map(x=>x.id).filter(id=>!has(s,color,id));for(let i=pool.length-1;i>0;i--){const j=Math.floor(nextRandom(s)*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}return pool.slice(0,3);}
export function createGame(seed=Date.now()) {
  const s={...position(),rng:(seed>>>0)||1234567,rev:0,phase:'draft',draftTurn:'w',offers:{w:[],b:[]},log:[],last:null,result:null,seen:{},drawOffer:null,rematch:[]};
  s.offers.w=deal(s,'w');s.offers.b=deal(s,'b'); return s;
}
function key(s){const ep=s.ep!==null&&legalMoves(s).some(m=>m.ep)?s.ep:null;return JSON.stringify([s.board.map((p,i)=>p?p.c+p.t+(p.t==='p'&&Math.floor(i/8)===(p.c==='w'?6:1)&&p.moved?'m':''):''),s.turn,s.castle,ep,s.aug]);}
function terminal(s){
  const moves=legalMoves(s);
  if(!moves.length)return inCheck(s,s.turn)?{winner:OTHER(s.turn),reason:'체크메이트'}:{winner:null,reason:'스테일메이트'};
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
    n.aug[color].push(action.id); n.log.push({kind:'augment',color,text:CARDS.find(x=>x.id===action.id).name});
    if(color==='w')n.draftTurn='b';
    else {n.phase='play';n.draftTurn=null;n.seen={};n.seen[key(n)]=1;n.result=terminal(n);if(n.result)n.phase='over';}
    n.rev++;return n;
  }
  if(action.type!=='move'||s.turn!==color||!Number.isInteger(action.from)||!Number.isInteger(action.to))return null;
  const move=legalMoves(s).find(m=>m.from===action.from&&m.to===action.to);if(!move)return null;
  const piece=s.board[move.from],capture=!!s.board[move.to]||move.ep;
  const moved=applyMove(n,move,action.promotion);Object.assign(n,moved);n.last={from:move.from,to:move.to};n.drawOffer=null;
  n.seen[key(n)]=(n.seen[key(n)]||0)+1;n.result=terminal(n);
  n.log.push({kind:'move',color,ply:n.ply,text:(move.castle?(move.castle==='king'?'O-O':'O-O-O'):`${piece.t==='p'?'':NAMES[piece.t]+' '}${squareName(move.from)}${capture?' × ':' → '}${squareName(move.to)}${piece.t==='p'&&n.board[move.to].t!=='p'?' = '+NAMES[n.board[move.to].t]:''}`)+(n.result?.reason==='체크메이트'?' #':inCheck(n,n.turn)?' +':'')});
  if(n.result)n.phase='over';
  else if([12,24].includes(n.ply)){n.phase='draft';n.draftTurn='w';n.offers={w:deal(n,'w'),b:deal(n,'b')};}
  n.rev++;return n;
}
export function evaluate(s,color){
  const val={p:100,n:320,b:335,r:510,q:950,k:0};let score=0;
  s.board.forEach((p,i)=>{if(!p)return;const r=Math.floor(i/8),c=i%8,center=3.5-Math.abs(3.5-c)+3.5-Math.abs(3.5-r);const progress=p.c==='w'?6-r:r-1;let v=val[p.t]+center*(['n','b'].includes(p.t)?9:3)+(p.t==='p'?progress*7:0);if(p.t==='k')v-=center*4;score+=(p.c===color?1:-1)*v;});
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
