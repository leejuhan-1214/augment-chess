import {remove,spawn} from './variant-core.js?v=3.1.0';
const other=c=>c==='w'?'b':'w';
export const goEnabled=s=>s?.go?.enabled===true;
export function enableGo(s){s.go={enabled:true,prisoners:{w:0,b:0},passes:0,koBoard:null,lastCapture:[],lastAction:null};return s;}
export function neighbours(i){const r=Math.floor(i/8),c=i%8;return [r>0?i-8:-1,r<7?i+8:-1,c>0?i-1:-1,c<7?i+1:-1].filter(n=>n>=0);}
export const boardKey=s=>s.board.map(p=>p?p.c+':'+p.t:'_').join('|');
// Stones and chess pieces of the same colour share orthogonal liberties.
// Neutral terrain and collapsed squares are walls, never liberties.
export function groupAt(s,start){
  const color=s.board[start]?.c;if(!['w','b'].includes(color))return null;
  const cells=new Set([start]),liberties=new Set(),queue=[start],voids=new Set(s.void||[]);
  for(let n=0;n<queue.length;n++)for(const to of neighbours(queue[n])){
    if(voids.has(to))continue;const p=s.board[to];
    if(!p)liberties.add(to);else if(p.c===color&&!cells.has(to)){cells.add(to);queue.push(to);}
  }
  return {color,cells:[...cells],liberties:[...liberties]};
}
export function groups(s,color=null){const visited=new Set(),result=[];for(let i=0;i<64;i++){if(visited.has(i)||!['w','b'].includes(s.board[i]?.c)||color&&s.board[i].c!==color)continue;const g=groupAt(s,i);g.cells.forEach(i=>visited.add(i));result.push(g);}return result;}
function clearDead(s,color){const dead=groups(s,color).filter(g=>!g.liberties.length).flatMap(g=>g.cells),captured=[];for(const i of dead){const p=s.board[i];if(!p||p.c!==color)continue;captured.push({at:i,c:p.c,t:p.t});remove(s,i,{force:true});}return captured;}
export function settleGo(s,actor){
  if(!goEnabled(s))return [];
  // Opponent is removed first; captures can open liberties for the mover.
  const captured=[...clearDead(s,other(actor)),...clearDead(s,actor)];
  for(const p of captured)s.go.prisoners[other(p.c)]++;
  s.go.lastCapture=[...new Set([...s.go.lastCapture,...captured.map(p=>p.at)])];
  if(captured.length){s.half=0;s.lastViolence=s.ply;s.log.push({kind:'effect',color:actor,ply:s.ply,text:'포위 포획 · '+captured.length+'칸'});}
  return captured;
}
export function stonePosition(s,to,color=s.turn){
  if(!goEnabled(s)||s.phase!=='play'||s.result||s.trolley||s.forced?.[color]||s.turnMoves||color!==s.turn||!Number.isInteger(to)||to<0||to>63||s.board[to]||(s.void||[]).includes(to))return null;
  const n=structuredClone(s);spawn(n,color,'stone',to);const captured=clearDead(n,other(color));
  const g=groupAt(n,to);if(!g?.liberties.length||boardKey(n)===s.go.koBoard)return null;
  // This is a legality probe. The authoritative reducer replays the same capture
  // once and records prisoners/effects in settleGo.
  return {captured,position:n};
}
export function legalStones(s,color=s.turn){if(!goEnabled(s)||s.phase!=='play'||s.result||s.trolley||color!==s.turn)return [];return Array.from({length:64},(_,to)=>to).filter(to=>stonePosition(s,to,color)).map(to=>({type:'stone',to}));}
export function areaScore(s){const totals={w:0,b:0},territory={w:[],b:[]},visited=new Set(),voids=new Set(s.void||[]);for(let i=0;i<64;i++){
  const p=s.board[i];if(p){if(['w','b'].includes(p.c))totals[p.c]++;continue;}if(voids.has(i)||visited.has(i))continue;
  const region=[i],borders=new Set();visited.add(i);for(let n=0;n<region.length;n++)for(const to of neighbours(region[n])){
    if(voids.has(to)){borders.add('x');continue;}const q=s.board[to];if(q)borders.add(q.c);else if(!visited.has(to)){visited.add(to);region.push(to);}
  }
  if(borders.size===1&&['w','b'].includes([...borders][0])){const c=[...borders][0];totals[c]+=region.length;territory[c].push(...region);}
}return {...totals,territory};}
export function scoreResult(s){const score=areaScore(s);return {winner:score.w===score.b?null:score.w>score.b?'w':'b',reason:'두 번 연속 패스 · 면적 계가 백 '+score.w+' : 흑 '+score.b};}
