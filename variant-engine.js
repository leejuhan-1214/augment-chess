import * as V from './variant-core.js?v=3.1.0';
import {goEnabled,enableGo,groupAt,groups,settleGo,legalStones,stonePosition,boardKey,areaScore,scoreResult} from './go-rules.js?v=3.1.0';
import {CARDS,CARD_BY_KEY,SPECS} from './variant-cards.js';
import {acquireEffect,castEffect,applyRule} from './variant-effects.js?v=3.1.0';
import {ORTHO,DIAG,KING,KNIGHT,inside,PIECES,PAWNS,MINORS,MAJORS,isRoyal,around,row,col,dist,value,side} from './variant-pieces.js?v=3.1.0';
import {position as initialPosition} from './engine.js?v=2.0.0';
export {CARDS};
export const NAMES=V.NAMES,OTHER=side,squareName=V.squareName,inCheck=V.inCheck,attacked=V.attacked;
const ranged=p=>['r','b','q','windmill','cardinal','archbishop','chancellor','jester','idol','clockwork','revolving-door','amazon','hook','brutus','grappler','bear','big-rook','big-bishop'].includes(p?.t);
export function position(){
  const base=initialPosition();const s={...base,variant:'ac272',uid:0,rng:1234567,rev:0,phase:'play',offers:{w:[],b:[]},draftTurn:null,
    aug:{w:[],b:[]},echoes:{w:[],b:[]},uses:{w:{},b:{}},readyAt:{w:{},b:{}},log:[],last:null,drawOffer:null,rematch:[],result:null,
    rules:[],buffs:{w:{},b:{}},events:[],void:[],highway:[],highGround:[],blackHoles:[],bombs:[],portals:[],fileConveyors:[],chains:[],palaces:{},flags:null,flagHeld:{w:null,b:null},crownHeld:{w:null,b:null},
    lastLost:{w:-99,b:-99},lastMoved:{w:null,b:null},lastUnit:{w:null,b:null},streak:{w:0,b:0},checks:{w:0,b:0},gold:{w:0,b:0},castled:{w:false,b:false},forced:{w:null,b:null},extraMoves:{w:0,b:0},vanish:{w:false,b:false},prophecy:{},exiles:[],lastEffects:[],seen:{},epVictim:null,passiveKeys:CARDS.filter(c=>c.passive).map(c=>c.key)};
  s.board=base.board.map((p,i)=>p?{...p,uid:'v'+(++s.uid),home:i,bornAt:-1,captures:0}:null);return s;
}
function deal(s,color){
  const stage=s.aug[color].length;
  const pool=CARDS.filter(card=>!s.aug[color].includes(card.id)&&(stage===0?card.kind!=='END':card.kind!=='OPENING'&&card.kind!=='RULE')&&(stage<2||card.rarity!=='COMMON'));
  const bag=[];for(const card of pool)for(let n=0;n<({COMMON:6,RARE:4,EPIC:2,LEGEND:1}[card.rarity]||1);n++)bag.push(card.id);
  return [...new Set(V.shuffle(s,bag))].slice(0,3);
}
export function createGame(seed=Date.now(),hybrid=false){const s=position();if(hybrid)enableGo(s);s.rng=(seed>>>0)||1234567;s.phase='draft';s.draftTurn='w';s.offers={w:deal(s,'w'),b:deal(s,'b')};return s;}
export {legalStones,groupAt,groups,areaScore};
export const abilityRemaining=(s,c,id)=>Math.max(0,s.uses?.[c]?.[id]||0);
export function effectTags(s,index){const p=s.board[index];if(!p)return [];return [V.protectedPiece(s,p,index)?'보호':null,V.active(s,p,'freezeUntil')?'빙결':null,V.active(s,p,'boundUntil')||p.bound?'속박':null,p.blessing?'가호':null,p.evasion?'회피':null,p.chameleon?'변이':null,p.submerge?'잠복':null,p.hidden?'은신':null,p.counter?'반격':null,p.metal?'금속':null,p.quantum?'중첩':null,p.recurrence?'회귀':null].filter(Boolean);}
function eligible(s,color,picks,kind,i){
  const p=s.board[i],a=s.board[picks[0]],own=p?.c===color,other=p?.c===side(color);if(picks.includes(i))return false;
  if(p?.t==='stone'&&!['anySquare','file'].includes(kind))return false;
  switch(kind){
    case 'anySquare':return !s.void.includes(i);
    case 'file':return row(i)===(color==='w'?7:0);
    case 'empty':return !p&&!s.void.includes(i);
    case 'own':return own;
    case 'any':return !!p&&p.c!=='x';
    case 'ownNonroyal':return own&&!isRoyal(p);
    case 'ownNonpawn':return own&&!PAWNS.has(p.t);
    case 'enemy':return other;
    case 'enemyNonroyal':return other&&!isRoyal(p);
    case 'pawn':return own&&PAWNS.has(p.t);
    case 'enemyPawn':return other&&PAWNS.has(p.t);
    case 'anyPawn':return p&&PAWNS.has(p.t);
    case 'bishop':return own&&p.t==='b';case 'rook':return own&&p.t==='r';case 'queen':return own&&p.t==='q';case 'knight':return own&&p.t==='n';
    case 'minor':return own&&MINORS.has(p.t);case 'anyMinor':return !!p&&MINORS.has(p.t);case 'ownMajor':return own&&MAJORS.has(p.t);case 'anyMajor':return !!p&&MAJORS.has(p.t);
    case 'ownRanged':return own&&ranged(p);case 'enemyRanged':return other&&ranged(p);
    case 'lowerOwn':return own&&a&&value(p)<value(a);
    case 'lowerEnemy':return other&&a&&!isRoyal(p)&&value(p)<value(a);
    case 'nearEnemy':return other&&dist(picks[0],i)<=2;
    case 'ownHome':return own&&!isRoyal(p)&&p.home!==null&&!s.board[p.home];
    case 'enemyHome':return other&&p.home!==null&&!s.board[p.home];
    case 'frontOwn':return own&&!isRoyal(p)&&(color==='w'?row(i)<4:row(i)>3);
    case 'exchangeOwn':return own&&!isRoyal(p)&&V.own(s,side(color),q=>q.t===p.t).length>0;
    case 'mostCaptures':return p&&!isRoyal(p)&&p.c!=='x'&&(p.captures||0)===Math.max(...s.board.filter(q=>q&&!isRoyal(q)&&q.c!=='x').map(q=>q.captures||0));
    case 'pawnForward':{const to=i+(color==='w'?-8:8);return own&&PAWNS.has(p.t)&&to>=0&&to<64&&!s.board[to]&&!s.void.includes(to);}
    case 'retreatable':{const to=i+(color==='w'?8:-8);return own&&to>=0&&to<64&&!s.board[to]&&!s.void.includes(to);}
    case 'castleRook':{const k=V.kingAt(s,color);return own&&p.t==='r'&&k>=0&&dist(k,i)>=3&&(row(k)===row(i)||col(k)===col(i)||Math.abs(row(k)-row(i))===Math.abs(col(k)-col(i)));}
    case 'moveDestination':{const from=picks.at(-1);return V.pseudo(s,from).some(m=>m.to===i);}
    default:return false;
  }
}
export function abilityChoices(s,id,color=s.turn){const key=id.replace(/^ac-/,''),spec=SPECS[key]||{targets:[]};if(spec.choices==='rules')return CARDS.filter(c=>c.kind==='RULE'&&!s.rules.includes(c.key)).map(c=>({value:c.key,label:c.name}));if(spec.choices==='usedCards')return CARDS.filter(c=>c.active&&c.key!=='joker'&&s.aug[color].includes(c.id)&&!s.uses[color][c.id]).map(c=>({value:c.id,label:c.name}));return (spec.choices||[]).map(value=>({value,label:value==='horizontal'?'가로':value==='vertical'?'세로':value}));}
export function abilityCanFinish(s,id,picks=[],color=s.turn){const spec=SPECS[id.replace(/^ac-/,'')]||{targets:[]};return picks.length>=(spec.min??spec.targets.length)&&picks.length<=spec.targets.length&&(!spec.even||picks.length%2===0);}
function validSelection(s,key,c,picks,choice){const spec=SPECS[key]||{targets:[]};if(!Array.isArray(picks)||picks.length>spec.targets.length||picks.length<(spec.min??spec.targets.length)||spec.even&&picks.length%2)return false;for(let j=0;j<picks.length;j++)if(!Number.isInteger(picks[j])||picks[j]<0||picks[j]>63||!eligible(s,c,picks.slice(0,j),spec.targets[j],picks[j]))return false;const choices=abilityChoices(s,'ac-'+key,c);if(spec.choices&&!choices.some(q=>q.value===choice))return false;return true;}
export function legalAbilities(s,color=s.turn,selection=null){
  if(s.result||s.phase!=='play'||color!==s.turn||s.trolley)return [];
  const result=[];
  for(const id of s.aug[color]){const card=CARDS.find(c=>c.id===id);if(!card?.active||!abilityRemaining(s,color,id)||(s.readyAt[color][id]||0)>s.ply||selection?.id&&selection.id!==id)continue;
    if(card.key==='canceling'&&!s.castled[side(color)]||card.key==='replay'&&!s.lastOwnMove[color]||card.key==='necromancy'&&!s.graveyard[color].length)continue;
    const spec=SPECS[card.key]||{targets:[]},picks=selection?.picks||[];
    if(!spec.targets.length){const options=abilityChoices(s,id,color);if(spec.choices&&!options.length)continue;for(const option of options.length?options:[{value:null}])result.push({type:'ability',id,picks:[],choice:option.value});continue;}
    if(selection){const kind=spec.targets[picks.length];if(kind)for(let to=0;to<64;to++)if(eligible(s,color,picks,kind,to)){const selected=[...picks,to];result.push({type:'ability',id,to,picks:selected,pending:selected.length<spec.targets.length});}}
    else{const chosen=[];for(const kind of spec.targets){const at=Array.from({length:64},(_,i)=>i).find(i=>eligible(s,color,chosen,kind,i));if(at===undefined)break;chosen.push(at);if(chosen.length>=(spec.min??spec.targets.length)&&(!spec.even||chosen.length%2===0))break;}const choice=abilityChoices(s,id,color)[0]?.value??null;if(validSelection(s,card.key,color,chosen,choice))result.push({type:'ability',id,to:chosen[0],picks:chosen,choice});}
  }
  return result;
}
export function legalMoves(s,color=s.turn){
  if(s.trolley)return [];
  let moves=V.own(s,color).flatMap(({p,i})=>V.pseudo(s,i));
  const k=V.kingAt(s,color),home=color==='w'?60:4;
  if(k===home&&s.board[k].t==='k'&&!s.board[k].moved&&!inCheck(s,color))for(const[which,rfrom,through,between,to]of [[0,home+3,[1,2],[1,2],home+2],[1,home-4,[-1,-2],[-1,-2,-3],home-2]]){
    const rook=s.board[rfrom];if(s.castle[color]?.[which]&&rook?.c===color&&rook.t==='r'&&!rook.moved&&!rook.bound&&!V.active(s,rook,'boundUntil')&&!between.some(d=>s.board[home+d])&&!through.some(d=>attacked(s,home+d,side(color))))moves.push({from:k,to,castle:which===0?'king':'queen'});
  }
  // Shared road and portal movement remains subject to occupied/removed squares.
  for(const {p,i}of V.own(s,color)){
    if(V.active(s,p,'boundUntil')||V.active(s,p,'freezeUntil')||p.bound)continue;
    if(s.highway.includes(i))for(const to of s.highway)if(!s.board[to]&&!s.void.includes(to))moves.push({from:i,to,road:true});
    for(const pair of s.portals){for(const[entry,exit]of[pair,[...pair].reverse()])if((i===entry||moves.some(m=>m.from===i&&m.to===entry))&&!s.board[exit]&&!s.void.includes(exit))moves.push({from:i,to:exit,portal:entry});}
  }
  if(V.rule(s,'macho-chess')&&moves.some(m=>m.ep!==undefined))moves=moves.filter(m=>m.ep!==undefined);
  const forced=moves.filter(m=>s.board[m.to]?.t==='scarecrow'&&s.board[m.to].placedAt<=s.ply);if(forced.length)moves=forced;
  if(V.has(s,side(color),'exhaustion')&&s.streak[color]>=3)moves=moves.filter(m=>s.board[m.from]?.uid!==s.lastUnit[color]||isRoyal(s.board[m.from]));
  if(V.buff(s,color,'ice-sheet'))moves=moves.filter(m=>!ranged(s.board[m.from])||!moves.some(n=>n.from===m.from&&Math.sign(row(n.to)-row(n.from))===Math.sign(row(m.to)-row(m.from))&&Math.sign(col(n.to)-col(n.from))===Math.sign(col(m.to)-col(m.from))&&dist(n.from,n.to)>dist(m.from,m.to)));
  return moves.filter(m=>{const p=s.board[m.from];if(!p.group)return true;const cells=s.board.map((q,i)=>q?.uid===p.uid?i:-1).filter(i=>i>=0),dr=row(m.to)-row(m.from),dc=col(m.to)-col(m.from);return cells.every(i=>{const r=row(i)+dr,c=col(i)+dc,q=s.board[r*8+c];return inside(r,c)&&!s.void.includes(r*8+c)&&(!q||q.uid===p.uid||q.c!==color&&!V.protectedPiece(s,q,r*8+c));});}).filter((m,i,a)=>a.findIndex(q=>q.from===m.from&&q.to===m.to)===i);
}
function note(s,color,text){s.log.push({kind:'effect',color,ply:s.ply,text});}
function collapse(s){const n=s.collapsedLayers||0;const cells=Array.from({length:64},(_,i)=>i).filter(i=>row(i)===n||row(i)===7-n||col(i)===n||col(i)===7-n);for(const i of cells){if(s.board[i])V.remove(s,i,{force:true});if(!s.void.includes(i))s.void.push(i);}s.collapsedLayers=n+1;s.promotionInset=n+1;}
function executeEvents(s){
  const due=s.events.filter(e=>e.at<=s.ply);s.events=s.events.filter(e=>e.at>s.ply);
  for(const e of due){const at=e.uid?s.board.findIndex(p=>p?.uid===e.uid):-1;
    if(e.kind==='transform-uid'&&at>=0)V.transform(s,at,e.t);
    else if(e.kind==='spawn-home')V.spawn(s,e.c,e.t,V.pick(s,V.empty(s,i=>row(i)===(e.c==='w'?7:0))));
    else if(e.kind==='spawn'){if(e.force&&s.board[e.to])V.remove(s,e.to,{force:true});V.spawn(s,e.c,e.t,e.to,e.extra||{});}
    else if(e.kind==='land'){if(s.board[e.to])V.remove(s,e.to,{force:true});if(!s.void.includes(e.to))s.board[e.to]={...e.p,moved:true,bornAt:s.ply};}
    else if(e.kind==='rule')applyRule(s,e.key);
    else if(e.kind==='portal')s.portals.push(e.squares);
    else if(e.kind==='bind'&&at>=0)s.board[at].bound=true;
    else if(e.kind==='blessing'&&at>=0)s.board[at].blessing=true;
    else if(e.kind==='collapse')collapse(s);
    else if(e.kind==='greek-gift'){const k=V.kingAt(s,side(e.c));if(k>=0)for(const i of around(k))if(s.board[i]?.c===side(e.c)&&PAWNS.has(s.board[i].t))V.remove(s,i,{force:true});}
    else if(e.kind==='gale'){const victims=s.board.map((p,i)=>({p,i})).filter(q=>q.p&&MAJORS.has(q.p.t)&&!s.board.some((p,i)=>p&&i!==q.i&&MAJORS.has(p.t)&&dist(i,q.i)<=1));for(const {i}of victims)V.remove(s,i,{force:true});}
    else if(e.kind==='ultimatum'){for(let i=0;i<64;i++)if(s.board[i]&&!isRoyal(s.board[i])&&(s.board[i].lastMovedAt??-1)<e.started)V.remove(s,i,{force:true});}
    else if(e.kind==='taboo'&&at>=0){V.remove(s,at,{force:true});V.spawn(s,e.c,'monster',at);V.spawn(s,e.c,'monster',e.to);}
    else if(e.kind==='icbm'&&at>=0){const target=V.pick(s,V.own(s,side(e.c),p=>p.t==='q'));if(target){V.remove(s,at,{force:true});for(const i of [target.i,...around(target.i)])V.remove(s,i,{force:true});}}
    else if(e.kind==='panic'){for(const uid of e.uids){const from=s.board.findIndex(p=>p?.uid===uid),m=from>=0?V.pick(s,V.pseudo(s,from)):null;if(m)movePiece(s,m,'q',false);}}
    else if(e.kind==='premove')for(const [from,to]of e.moves){const m=legalMoves(s,e.c).find(m=>m.from===from&&m.to===to);if(m){movePiece(s,m,'q',false);if(s.board[to])s.board[to].disarmedUntil=s.ply;}}
  }
}
function finishTurn(s,color){
  s.turn=side(color);s.ply++;s.ep=null;s.epVictim=null;
  for(let i=0;i<64;i++){const p=s.board[i];if(!p)continue;if(p.expires!==undefined&&p.expires<=s.ply){V.remove(s,i,{force:true});continue;}if(p.revert&&p.revert.at<=s.ply){p.t=p.revert.t;delete p.revert;}if(p.suspectedUntil!==undefined&&p.suspectedUntil<=s.ply){V.remove(s,i,{force:true});continue;}if(p.lunchboxUntil!==undefined){const k=V.kingAt(s,p.c);if(k>=0&&dist(k,i)<=1)delete p.lunchboxUntil;else if(p.lunchboxUntil<=s.ply)V.remove(s,i,{force:true});}}
  executeEvents(s);
  for(const {p,i}of V.own(s,color)){
    if(p.t==='octopus'&&!V.own(s,side(color)).some(q=>dist(i,q.i)<=1))p.submerge=true;
    if(p.wanted&&V.own(s,side(color)).some(q=>dist(i,q.i)<=1)){delete p.submerge;V.remove(s,i,{force:true});}
    if(p.t==='revolving-door'&&row(i)>0&&row(i)<7&&col(i)>0&&col(i)<7){const cells=around(i,[[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]]),units=cells.map(i=>s.board[i]);cells.forEach((to,j)=>s.board[to]=units[(j+7)%8]);}
    if(p.t==='killer'){const k=V.kingAt(s,side(color));if(k>=0&&V.pseudo(s,i).some(m=>m.to===k))V.remove(s,k,{force:true});}
    if(p.t==='beacon'){const neighbours=around(i).filter(to=>s.board[to]);if(!p.activatedAt&&neighbours.length>=6){for(const to of neighbours)if(!isRoyal(s.board[to]))V.remove(s,to,{force:true});p.activatedAt=s.ply;}if(p.activatedAt&&s.ply-p.activatedAt>=6)s.result={winner:color,reason:'신호기 점화'};}
    if(p.t==='siren'){p.charmed??={};for(const {p:q,i:to}of V.own(s,side(color))){if(dist(i,to)<=1){p.charmed[q.uid]=(p.charmed[q.uid]||0)+1;if(p.charmed[q.uid]>=2){q.c=color;delete p.charmed[q.uid];}}else delete p.charmed[q.uid];}}
  }
  if(V.buff(s,color,'othello'))for(const {i}of V.own(s,color))for(const[dr,dc]of KING){let rr=row(i)+dr,cc=col(i)+dc,line=[];while(inside(rr,cc)){const to=rr*8+cc,q=s.board[to];if(q?.c===side(color))line.push(to);else{if(q?.c===color)for(const to of line)s.board[to].c=color;break;}rr+=dr;cc+=dc;}}
  if(V.rule(s,'conveyor')){const edge=[...Array.from({length:8},(_,i)=>i),...Array.from({length:7},(_,i)=>(i+1)*8+7),...Array.from({length:7},(_,i)=>62-i),...Array.from({length:6},(_,i)=>(6-i)*8)];const units=edge.map(i=>s.board[i]);edge.forEach((to,j)=>s.board[to]=units[(j+edge.length-1)%edge.length]);}
  for(const belt of s.fileConveyors)if(belt.start<=s.ply){const cells=Array.from({length:8},(_,i)=>i*8+belt.file).sort((a,b)=>belt.c==='w'?a-b:b-a);for(const from of cells){const to=from+(belt.c==='w'?-8:8);if(s.board[from]&&to>=0&&to<64&&!s.board[to]){s.board[to]=s.board[from];s.board[from]=null;}}}
  if(V.rule(s,'winter-kingdom')&&s.ply%6===0)for(const c of ['w','b'])for(const {p}of V.shuffle(s,V.own(s,c)).slice(0,3))p.freezeUntil=s.ply+6;
  if(V.rule(s,'platform')&&s.ply%10===0)s.platform=V.pick(s,V.empty(s));
  if(V.rule(s,'periodic-collapse')&&s.ply%40===0)collapse(s);
  if(s.ply%3===0)for(const {p,i}of s.board.map((p,i)=>({p,i})).filter(q=>q.p?.t==='monster')){const to=V.pick(s,around(i));if(to!==undefined){if(s.board[to])V.remove(s,to,{force:true});s.board[to]=p;s.board[i]=null;}}
  const next=s.turn;s.gold[next]+=2;
  for(const {p,i}of V.own(s,next)){
    if(['don-quixote','baby-bear'].includes(p.t)){const options=p.t==='baby-bear'?V.empty(s):V.pseudo(s,i).map(m=>m.to);const to=V.pick(s,options);if(to!==undefined){if(s.board[to])V.remove(s,to,{force:true});s.board[to]=p;s.board[i]=null;}}
    if(p.t==='brutus'){const k=V.kingAt(s,next);if(k>=0&&k!==i&&V.pseudo({...s,board:s.board.map(q=>q?.uid===s.board[k].uid?{...q,c:side(next)}:q)},i).some(m=>m.to===k))V.remove(s,k,{force:true});}
    if(p.t==='wizard')p.mana=Math.min(10,(p.mana||0)+1);
    if(p.t==='campfire')for(const to of around(i,ORTHO))if(s.board[to]?.c===next&&!isRoyal(s.board[to]))s.board[to].shieldUntil=s.ply+1;
  }
  if(V.has(s,next,'encouragement')){const k=V.kingAt(s,next);if(k>=0)for(const to of around(k))if(s.board[to]?.c===next)s.board[to].shieldUntil=s.ply+1;}
  if(s.vanish[next]){const q=V.pick(s,V.own(s,next));if(q)V.remove(s,q.i,{force:true});}
  if(V.has(s,next,'penta-check')&&s.checks[next]>=5)s.result={winner:next,reason:'펜타 체크'};
  if(V.has(s,next,'hope')&&V.own(s,next).length<=2)s.result={winner:next,reason:'희망'};
  for(const c of ['w','b'])if(s.prophecy[c]){if(inCheck(s,'w')||inCheck(s,'b')||s.lastViolence>=s.prophecy[c].started)delete s.prophecy[c];else if(s.ply>=s.prophecy[c].at)s.result={winner:c,reason:'종전'};}
  return s;
}

export function promotionOptions(s,color=s.turn){
  let options=V.has(s,color,'final-weapon')?['q','r','b','n','amazon']:V.has(s,color,'fast-growth')?['n','b']:['q','r','b','n'];
  if(V.rule(s,'recycling'))options=[...new Set(s.graveyard[color].map(p=>p.t))].filter(t=>!isRoyal({t})&&!PAWNS.has(t)&&!['core','cover'].includes(t));
  return options;
}
export function needsPromotion(s,m){const p=s.board[m.from];if(!p||!PAWNS.has(p.t))return false;const inset=V.has(s,p.c,'final-weapon')?0:Math.max(s.promotionInset||0,V.has(s,p.c,'fast-growth')?3:V.has(s,p.c,'early-promotion')?2:0);return (p.c==='w'?row(m.to)<=inset:row(m.to)>=7-inset)||V.rule(s,'diagonal-chess')&&(p.c==='w'?col(m.to)-row(m.to)>=3:row(m.to)-col(m.to)>=3)||V.has(s,p.c,'field-promotion')&&(p.captures||0)+(s.board[m.to]?1:0)>=2;}
function promote(s,to,requested){const p=s.board[to];if(!p)return;const options=promotionOptions(s,p.c);if(!options.length)return;const t=options.includes(requested)?requested:options[0];V.transform(s,to,t);const q=s.board[to];q.promoted=true;if(V.has(s,p.c,'coronation')&&t==='q')q.shieldUntil=s.ply+2;if(V.has(s,p.c,'underpromotion')&&MINORS.has(t))s.extraMoves[p.c]++;if(V.has(s,p.c,'mutation')){q.t='monster';V.nearSpawn(s,p.c,'monster',to);}}
function movePiece(s,m,promotion='q',hooks=true){
  const p=s.board[m.from];if(!p)return {extra:false,captured:null};const c=p.c,foe=side(c),oldType=p.t,wasPawn=PAWNS.has(oldType),target=s.board[m.ep??m.to];let captured=null,blocked=false;
  const promoteNow=needsPromotion(s,m),nearIdol=V.own(s,c,q=>q.t==='idol').some(q=>q.i!==m.from&&dist(q.i,m.from)<=1);
  if(target&&!m.swap){
    if(target.blessing){delete target.blessing;blocked=true;}
    else if(target.evasion){const to=V.pick(s,around(m.to).filter(i=>!s.board[i]&&!s.void.includes(i)));delete target.evasion;if(to!==undefined){s.board[to]=target;s.board[m.to]=null;}}
    else if(['hedgehog','bear'].includes(target.t)&&(target.counters??2)>0){target.counters=(target.counters??2)-1;target.boundUntil=s.ply+1;V.remove(s,m.from,{force:true});blocked=true;}
    else if(target.parry&&V.random(s)<.4){V.remove(s,m.from,{force:true});blocked=true;}
    if(!blocked&&(V.rule(s,'mistake')||V.buff(s,c,'mistake-card'))&&V.random(s)<(V.buff(s,c,'mistake-card')?0.5:0.2)){V.remove(s,m.from,{force:true});blocked=true;}
    if(!blocked&&target.quantum&&s.board.some((q,i)=>i!==m.to&&q?.uid===target.uid)){s.board[m.to]=null;for(const q of s.board)if(q?.uid===target.uid)delete q.quantum;}
    if(!blocked&&oldType==='missionary'){target.c=c;target.bornAt=s.ply;return {extra:false,captured:null};}
    if(!blocked&&p.t==='grappler'&&dist(m.from,m.to)>1){const dr=Math.sign(row(m.to)-row(m.from)),dc=Math.sign(col(m.to)-col(m.from)),to=m.from+dr*8+dc;if(!s.board[to]){s.board[to]=target;s.board[m.to]=null;target.bound=true;p.bound=true;}return {extra:false,captured:null};}
    if(!blocked&&s.board[m.ep??m.to]){captured={...target};V.remove(s,m.ep??m.to,{force:!!m.ram,attacker:p});if(!s.board[m.from])return {extra:false,captured};}
  }
  if(blocked)return {extra:false,captured:null};
  if(m.swap){s.board[m.from]=s.board[m.to];s.board[m.to]=p;}else{
    if(p.group){const cells=s.board.map((q,i)=>q?.uid===p.uid?i:-1).filter(i=>i>=0),delta=m.to-m.from,parts=cells.map(i=>[i+delta,s.board[i]]);for(const i of cells)s.board[i]=null;for(const[to,q]of parts){if(s.board[to])V.remove(s,to,{force:true,attacker:p});s.board[to]=q;}}
    else {s.board[m.from]=null;if(!s.board[m.to]||s.board[m.to]?.uid===p.uid)s.board[m.to]=p;}
  }
  if(m.castle){const from=m.castle==='king'?m.from+3:m.from-4,to=m.castle==='king'?m.to-1:m.to+1;s.board[to]=s.board[from];s.board[from]=null;if(s.board[to])s.board[to].moved=true;s.castled[c]=true;}
  p.moved=true;p.lastMovedAt=s.ply;p.lastCapture=!!captured;p.captures=(p.captures||0)+(captured?1:0);if(p.reverseMoves)p.reverseMoves--;if(p.metal)p.metalReady=s.ply+8;if(p.outpost){delete p.outpost;delete p.shieldUntil;}delete p.hidden;delete p.submerge;
  if(isRoyal(p))s.castle[c]=[false,false];for(const [at,right]of [[c==='w'?63:7,0],[c==='w'?56:0,1]])if(m.from===at)s.castle[c][right]=false;
  s.half=wasPawn||captured?0:s.half+1;
  s.lastOwnMove[c]={uid:p.uid,from:m.from,to:m.to,captured};s.lastMoved[c]=oldType;s.streak[c]=s.lastUnit[c]===p.uid?s.streak[c]+1:1;s.lastUnit[c]=p.uid;
  if(!hooks)return {captured,extra:false};
  let extra=false;
  if(m.ram){const dr=Math.sign(row(m.to)-row(m.from)),dc=Math.sign(col(m.to)-col(m.from));for(let n=1;n<dist(m.from,m.to);n++){const to=m.from+(dr*8+dc)*n;if(s.board[to])V.remove(s,to,{force:true,attacker:p});}}
  if(captured){s.lastViolence=s.ply;s.initiativeBroken=true;if(p.chameleon&&!isRoyal(captured))V.transform(s,m.to,captured.t);if(p.suspectedUntil){delete p.suspectedUntil;p.blessing=true;}
    if(isRoyal(p)&&V.has(s,c,'imperial-studies'))p.learned=[...new Set([...(p.learned||[]),captured.t])];
    if(V.has(s,c,'assembly')&&([oldType,captured.t].sort().join('')==='br'))V.transform(s,m.to,'q');
    if(oldType==='q'&&captured.t==='q'&&V.has(s,c,'queen-afterimage'))V.spawn(s,c,'q',m.from,{expires:s.ply+2});
    if(V.rule(s,'transcendence')){const line=['p','n','b','r','q'],j=line.indexOf(oldType);if(j>=0&&j<4)V.transform(s,m.to,line[j+1]);}
    if(V.has(s,foe,'vigilance')){const k=V.kingAt(s,foe);if(k>=0)s.board[k].shieldUntil=s.ply+2;}
    if(isRoyal(p)&&PAWNS.has(captured.t)&&V.has(s,c,'iron-monarch')||oldType==='n'&&V.has(s,c,'backward-knight')&&(row(m.to)-row(m.from))*(c==='w'?1:-1)>0||captured.c===c&&oldType==='n'&&V.has(s,c,'mad-horse'))extra=true;
    if(p.twin){const twin=s.board.find(q=>q?.uid===p.twin);if(twin)twin.captures=(twin.captures||0)+1;}
  }
  if(oldType==='n'&&V.has(s,c,'file-surge')&&[0,7].includes(col(m.to))||oldType==='r'&&!captured&&V.has(s,c,'rook-lift')&&[0,7].includes(row(m.to))&&[0,7].includes(col(m.to)))extra=true;
  if(wasPawn&&V.has(s,c,'resolve')&&s.lastLost[c]>=s.ply-1&&!s.resolveUsed?.[c]){extra=true;s.resolveUsed??={};s.resolveUsed[c]=true;}
  if(nearIdol&&!s.idolUsed){extra=true;s.idolUsed=true;p.boundUntil=s.ply;}
  if(s.platform===m.to){extra=true;s.platform=null;}
  if(oldType==='n'&&V.has(s,c,'radical-charge')){const dr=Math.sign(row(m.to)-row(m.from)),dc=Math.sign(col(m.to)-col(m.from)),at=Math.abs(row(m.to)-row(m.from))===2?m.from+dr*8:m.from+dc;if(s.board[at]?.c===foe)V.remove(s,at,{force:true,attacker:p});}
  for(const {p:q}of V.own(s,c))if(q.uid!==p.uid&&q.bound)delete q.bound;
  if(p.chimera)V.transform(s,m.to,V.pick(s,[...MAJORS].filter(t=>!t.startsWith('big-')&&t!=='colossus')));
  if(oldType==='windmill')p.windmillRook=!p.windmillRook;
  if(oldType==='thief'&&m.jumped)extra=true;
  if(oldType==='squire'&&captured)V.transform(s,m.to,'n');
  if(m.checkerCapture&&s.board[m.to]&&V.pseudo(s,m.to).some(m=>m.checkerCapture)){extra=true;s.forced[c]=p.uid;}
  if(oldType==='trickster')p.form=V.pick(s,Object.keys(PIECES).filter(t=>!['stone','trickster','colossus','big-rook','big-bishop','cover','core'].includes(t)));
  if(oldType==='slime')V.spawn(s,c,'slime',m.from);
  if(oldType==='missionary'&&row(m.to)===(c==='w'?0:7))for(const {p:q}of V.own(s,c,q=>q.t==='missionary'))q.t='b';
  if(oldType==='recruiter')V.spawn(s,c,'p',m.from);
  if(oldType==='checker'&&row(m.to)===(c==='w'?0:7))V.transform(s,m.to,'king-checker');
  if(oldType==='prime-minister'&&m.via!==undefined&&s.board[m.to])s.board[m.to].shieldUntil=s.ply+1;
  if(V.buff(s,c,'disassembly')&&oldType==='q'){V.transform(s,m.to,'b');V.spawn(s,c,'r',m.from);}
  if(V.buff(s,c,'quantum-mechanics')&&!s.board[m.from]){s.board[m.from]={...s.board[m.to],quantum:true};if(s.board[m.to])s.board[m.to].quantum=true;}
  if(V.buff(s,c,'reposition')){if(!s.buffs[c].reposition.uid){s.buffs[c].reposition.uid=p.uid;s.forced[c]=p.uid;extra=true;}else delete s.buffs[c].reposition;}
  if(V.buff(s,c,'roller')&&oldType==='r'){const dr=Math.sign(row(m.to)-row(m.from)),dc=Math.sign(col(m.to)-col(m.from));if(dr===0||dc===0)for(let r=row(m.from),f=col(m.from);inside(r,f);r+=dr,f+=dc){const at=r*8+f;if(!s.highway.includes(at))s.highway.push(at);if(at===m.to)break;}}
  if(V.has(s,c,'moving')&&s.streak[c]>=5)p.evasion=true;
  if(V.has(s,c,'infiltration')&&row(m.to)===(c==='w'?0:7)&&V.own(s,c).filter(q=>row(q.i)===row(m.to)).length===1)p.submerge=true;
  if(p.quantum)for(let i=0;i<64;i++)if(i!==m.to&&s.board[i]?.uid===p.uid)s.board[i]=null;
  if(promoteNow&&s.board[m.to]&&PAWNS.has(s.board[m.to].t))promote(s,m.to,promotion);
  if(p.spy&&s.board[m.to]?.promoted){s.board[m.to].c=foe;delete s.board[m.to].spy;}
  if(p.charge&&s.board[m.to]){if(!s.board[m.to].promoted)V.remove(s,m.to,{force:true});else delete s.board[m.to].charge;}
  if(p.twin){const at=s.board.findIndex(q=>q?.uid===p.twin);if(at>=0&&!s.board[m.from]){s.board[m.from]=s.board[at];s.board[at]=null;}}
  if(s.blackHoles.includes(m.to))V.remove(s,m.to,{force:true});
  if(s.bombs.includes(m.to)){s.bombs=s.bombs.filter(i=>i!==m.to);for(let i=0;i<64;i++)if(row(i)===row(m.to)||col(i)===col(m.to))V.remove(s,i,{force:true});}
  if(p.desperado){p.desperado--;if(p.desperado>0)extra=true;else{const at=s.board.findIndex(q=>q?.uid===p.uid);if(at>=0)V.remove(s,at,{force:true});}}
  if(p.frenzyUntil>=s.ply)extra=true;
  if(p.frenzyUntil>=s.ply&&!captured)extra=false;
  return {captured,extra};
}
function stateKey(s){return JSON.stringify([s.board.map(p=>p?[p.c,p.t,!!p.moved,!!p.blessing,!!p.evasion,p.boundUntil>=s.ply,p.freezeUntil>=s.ply]:null),s.turn,s.castle,s.ep,s.aug,s.uses,s.rules]);}
function terminal(s){
  if(goEnabled(s))for(const c of ['w','b'])if(V.kingAt(s,c)<0)return {winner:side(c),reason:'킹 포획 · 포위 포함'};
  if(s.result)return s.result;
  for(const c of ['w','b'])if(V.kingAt(s,c)<0)return {winner:side(c),reason:'킹 포획'};
  for(const c of ['w','b']){const units=V.own(s,c),foe=side(c),k=V.kingAt(s,c);
    if((V.has(s,c,'racing-king')||V.rule(s,'macho-chess'))&&row(k)===(c==='w'?0:7))return {winner:c,reason:'킹의 끝랭크 도달'};
    if(units.some(q=>q.p.t==='herald'&&dist(q.i,V.kingAt(s,foe))<=1))return {winner:c,reason:'전령 도착'};
    if(V.has(s,c,'religious-victory')&&V.own(s,c,p=>p.t==='b').length-V.own(s,foe,p=>p.t==='b').length>=3)return {winner:c,reason:'종교 승리'};
    if(V.has(s,c,'bina-mate')&&V.own(s,c).filter(q=>V.pseudo(s,q.i,true).some(m=>m.to===V.kingAt(s,foe))).length>=2)return {winner:c,reason:'비나 메이트'};
    if(V.has(s,c,'highlander')&&units.length>=4&&new Set(units.map(q=>q.p.t)).size===units.length)return {winner:c,reason:'하이랜더'};
    if(V.has(s,c,'gomoku'))for(let i=0;i<32;i++)if(Array.from({length:5},(_,j)=>s.board[i+j*8]?.c===c).every(Boolean))return {winner:c,reason:'오목'};
    if(s.flags){const at=s.flags[foe];if(s.board[at]?.c===c){if(s.flagHeld[c]===null)s.flagHeld[c]=s.ply;if(s.ply-s.flagHeld[c]>=2)return {winner:c,reason:'깃발 점령'};}else s.flagHeld[c]=null;}
    if(s.crown!==undefined){if(s.board[s.crown]?.c===c){s.crownHeld[c]??=s.ply;if(s.ply-s.crownHeld[c]>=20)return {winner:c,reason:'왕관 수비'};}else s.crownHeld[c]=null;}
  }
  if(V.rule(s,'revelation')&&s.ply>=120){const totals=['w','b'].map(c=>V.own(s,c,p=>!isRoyal(p)).reduce((v,q)=>v+value(q.p),0));return {winner:totals[0]===totals[1]?null:totals[0]>totals[1]?'w':'b',reason:'계시 · 기물 점수'};}
  if(s.half>=100)return {winner:null,reason:'50수 규칙'};
  if((s.seen[stateKey(s)]||0)>=3)return {winner:null,reason:'동일 포지션 3회 반복'};
  if(!goEnabled(s)&&!s.trolley&&!legalMoves(s).length&&!legalAbilities(s).length&&!legalPowers(s).length)return {winner:side(s.turn),reason:'이동 가능한 기물 없음'};
  return null;
}
function conclude(s,previousPly,color){if(goEnabled(s))settleGo(s,color);s.result=terminal(s);if(s.result)s.phase='over';else if(s.ply!==previousPly&&[20,40].includes(s.ply)&&s.aug.w.length<3){s.phase='draft';s.draftTurn='w';s.offers={w:deal(s,'w'),b:deal(s,'b')};}s.rev++;return s;}
function endMove(s,c,extra=false){if(s.extraMoves[c]>0){s.extraMoves[c]--;extra=true;}if(V.rule(s,'acceleration')&&s.ply>=5&&!s.accelerated){extra=true;s.accelerated=true;}else if(!extra)s.accelerated=false;if(!extra){s.forced[c]=null;s.idolUsed=false;s.resolveUsed={};s.turnMoves=0;s.turnCards=0;finishTurn(s,c);}else s.turnMoves=(s.turnMoves||0)+1;}
// Special piece powers are explicit, validated intentions, like board moves.
export function legalPowers(s,color=s.turn){
  if(s.phase!=='play'||s.result||s.turn!==color||s.trolley)return [];
  const actions=[];
  for(const {p,i}of V.own(s,color)){
    if(V.active(s,p,'boundUntil')||V.active(s,p,'freezeUntil')||p.bound)continue;
    if(p.t==='wizard'){
      if(p.mana>=2)for(const {i:to}of V.own(s,color))actions.push({type:'power',from:i,to,spell:'shield',label:'보호 · 마나 2'});
      if(p.mana>=4)for(const {i:to}of V.own(s,side(color),q=>!isRoyal(q)))actions.push({type:'power',from:i,to,spell:'meteor',label:'메테오 · 마나 4'});
    }
    if(p.t==='merchant')for(const {p:q,i:to}of V.own(s,side(color),q=>!isRoyal(q)))if(s.gold[color]>=value(q)*5)actions.push({type:'power',from:i,to,spell:'buy',label:'매수 · '+value(q)*5+' 골드'});
    if(p.t==='log')for(const [dr,dc]of KING)if(inside(row(i)+dr,col(i)+dc))actions.push({type:'power',from:i,to:i+dr*8+dc,spell:'direction',label:'자동 이동 방향 변경'});
  }
  return actions;
}
function reduceAction(s,action,color){
  if(!s||!action||action.rev!==s.rev||!['w','b'].includes(color))return null;
  const n=structuredClone(s),before=s.ply;if(goEnabled(n))n.go.lastCapture=[];
  if(action.type==='rematch'&&s.result){if(!n.rematch.includes(color))n.rematch.push(color);n.rev++;return n;}
  if(s.result)return null;
  if(action.type==='resign'){n.result={winner:side(color),reason:'기권'};n.phase='over';n.rev++;return n;}
  if(action.type==='draw'){if(s.drawOffer===side(color)){n.result={winner:null,reason:'합의 무승부'};n.phase='over';}else if(!s.drawOffer)n.drawOffer=color;else return null;n.rev++;return n;}
  if(action.type==='decline'&&s.drawOffer===side(color)){n.drawOffer=null;n.rev++;return n;}
  if(s.phase==='draft'){
    if(action.type!=='choose'||s.draftTurn!==color||!s.offers[color].includes(action.id))return null;
    const card=CARDS.find(c=>c.id===action.id);n.aug[color].push(card.id);if(card.active){n.uses[color][card.id]=1;n.readyAt[color][card.id]=s.ply+(s.ply?2:0);}else acquireEffect(n,card.key,color);
    if(color==='w')for(const exile of n.exiles){const to=!n.board[exile.to]&&!n.void.includes(exile.to)?exile.to:V.pick(n,V.empty(n));if(to!==undefined)n.board[to]={...exile.p,bornAt:n.ply};}if(color==='w')n.exiles=[];
    if(card.passive&&V.has(n,side(color),'clone'))acquireEffect(n,card.key,side(color));
    if(card.key==='clone')for(const id of n.aug[side(color)]){const other=CARDS.find(c=>c.id===id);if(other?.passive&&other.key!=='clone')acquireEffect(n,other.key,color);}
    if(card.key==='initiative')V.grant(n,color,'initiative',Math.max(0,16-n.ply));
    n.log.push({kind:'augment',color,ply:n.ply,text:card.name});if(color==='w')n.draftTurn='b';else{n.phase='play';n.draftTurn=null;n.seen={};n.seen[stateKey(n)]=1;n.result=terminal(n);if(n.result)n.phase='over';}n.rev++;return n;
  }
  if(s.phase!=='play')return null;
  if(s.trolley){if(action.type!=='track'||color!==s.trolley.player||![0,1].includes(action.track))return null;for(const uid of s.trolley.tracks[action.track]){const i=n.board.findIndex(p=>p?.uid===uid);if(i>=0)V.remove(n,i,{force:true});}delete n.trolley;note(n,color,'트롤리 선로 '+(action.track+1)+' 선택');return conclude(n,before,color);}
  if(s.turn!==color)return null;
  n.drawOffer=null;
  if(action.type==='stone'){
    if(!stonePosition(s,action.to,color))return null;
    V.spawn(n,color,'stone',action.to);n.half=0;n.last={from:action.to,to:action.to};n.log.push({kind:'move',color,ply:n.ply+1,text:'● 착수 '+squareName(action.to)});
    settleGo(n,color);endMove(n,color);return conclude(n,before,color);
  }
  if(action.type==='pass'&&goEnabled(s)){
    if(s.forced[color]||s.turnMoves||s.turnCards)return null;
    n.go.passes++;n.last=null;n.log.push({kind:'move',color,ply:n.ply+1,text:'패스'+(n.go.passes===1?' · 상대도 패스하면 계가':' · 계가')});n.accelerated=false;n.turnMoves=0;n.turnCards=0;finishTurn(n,color);
    if(n.go.passes>=2){settleGo(n,color);n.result=terminal(n)||scoreResult(n);n.phase='over';n.rev++;return n;}
    return conclude(n,before,color);
  }
  if(action.type==='ability'){
    const card=CARDS.find(c=>c.id===action.id);if(!card?.active||!s.aug[color].includes(card.id)||!abilityRemaining(s,color,card.id)||(s.readyAt[color][card.id]||0)>s.ply)return null;
    if(['premove','trolley'].includes(card.key)&&(s.turnMoves||s.turnCards))return null;
    const picks=action.picks??(Number.isInteger(action.to)?[action.to]:[]);if(!validSelection(s,card.key,color,picks,action.choice))return null;
    if(!legalAbilities(s,color).some(a=>a.id===card.id))return null;
    castEffect(n,card.key,color,picks,action.choice);n.uses[color][card.id]--;n.turnCards=(n.turnCards||0)+1;
    if(n.randomCast){const temp=n.randomCast;delete n.randomCast;const original=n.aug[color];n.aug[color]=[...original,'ac-'+temp.key];n.uses[color]['ac-'+temp.key]=1;const randomAbility=legalAbilities(n,color).find(a=>a.id==='ac-'+temp.key);if(randomAbility)castEffect(n,temp.key,color,randomAbility.picks,randomAbility.choice);n.aug[color]=original;delete n.uses[color]['ac-'+temp.key];}
    n.log.push({kind:'ability',color,ply:n.ply,text:card.name+(picks.length?' · '+picks.map(squareName).join(', '):'')});if(n.forceEnd){delete n.forceEnd;endMove(n,color);}return conclude(n,before,color);
  }
  if(action.type==='power'){
    const power=legalPowers(s,color).find(p=>p.from===action.from&&p.to===action.to&&p.spell===action.spell);if(!power)return null;const p=n.board[power.from];if(power.spell==='shield'){p.mana-=2;n.board[power.to].shieldUntil=n.ply+2;}if(power.spell==='meteor'){p.mana-=4;for(const to of [power.to,...around(power.to)])V.remove(n,to,{force:true});}if(power.spell==='buy'){n.gold[color]-=value(n.board[power.to])*5;n.board[power.to].c=color;n.board[power.to].bornAt=n.ply;}if(power.spell==='direction')p.direction=[Math.sign(row(power.to)-row(power.from)),Math.sign(col(power.to)-col(power.from))];note(n,color,power.label);endMove(n,color);return conclude(n,before,color);
  }
  if(action.type!=='move')return null;const m=legalMoves(s).find(m=>m.from===action.from&&m.to===action.to);if(!m)return null;
  const p=n.board[m.from],uid=p.uid,wasPawn=PAWNS.has(p.t),out=movePiece(n,m,action.promotion);n.last={from:m.from,to:m.to};
  n.log.push({kind:'move',color,ply:n.ply+1,text:(m.castle?m.castle==='king'?'O-O':'O-O-O':NAMES[p.t]+' '+squareName(m.from)+(out.captured?' × ':' → ')+squareName(m.to))});
  if(inCheck(n,side(color))){n.checks[color]++;n.initiativeBroken=true;}
  for(const {p:q,i}of V.own(n,color,q=>q.t==='log')){const [dr,dc]=q.direction||[color==='w'?-1:1,0],rr=row(i)+dr,cc=col(i)+dc;if(inside(rr,cc)&&!n.void.includes(rr*8+cc)){const to=rr*8+cc;if(n.board[to])V.remove(n,to,{force:true});n.board[i]=null;n.board[to]=q;}}
  const ep=wasPawn&&Math.abs(m.to-m.from)===16?[Math.floor((m.to+m.from)/2),m.to]:null;endMove(n,color,out.extra);if(ep&&n.turn!==color&&n.board[m.to]?.uid===uid)[n.ep,n.epVictim]=ep;
  n.seen[stateKey(n)]=(n.seen[stateKey(n)]||0)+1;return conclude(n,before,color);
}
export function reduce(s,action,color){
  const n=reduceAction(s,action,color);if(!n||!goEnabled(s))return n;
  const boardAction=['move','stone','ability','power','track'].includes(action.type),changed=boardKey(n)!==boardKey(s);
  if(boardAction&&changed&&boardKey(n)===s.go.koBoard)return null;
  if(boardAction)n.go.passes=0;
  if(n.ply!==s.ply){n.go.koBoard=boardKey(s);n.go.lastAction=action.type;}
  return n;
}
export function evaluate(s,color){if(s.result)return s.result.winner===color?100000:s.result.winner?-100000:0;return s.board.reduce((sum,p,i)=>sum+(p?(p.c===color?1:p.c===side(color)?-1:0)*(value(p)*100+(!isRoyal(p)?(7-Math.abs(3.5-row(i))-Math.abs(3.5-col(i)))*3:0)):0),0);}
export function aiAction(s,level='normal'){
  if(s.trolley)return {type:'track',track:s.trolley.tracks[0].length<s.trolley.tracks[1].length?0:1};
  const actions=[...legalMoves(s).map(m=>({type:'move',...m})),...legalAbilities(s),...legalPowers(s),...legalStones(s),...(goEnabled(s)?[{type:'pass'}]:[])];let best=null,score=-Infinity;
  for(const a of actions){const n=reduce(s,{...a,rev:s.rev},s.turn);if(!n)continue;let v=evaluate(n,s.turn)+(a.type==='ability'?2:0)+Math.random()*(level==='easy'?120:5);if(goEnabled(s)){const enemy=side(s.turn),danger=groups(n,s.turn).filter(g=>g.liberties.length===1).reduce((v,g)=>v+g.cells.reduce((v,i)=>v+(isRoyal(n.board[i])?30000:value(n.board[i])*70),0),0),pressure=groups(n,enemy).filter(g=>g.liberties.length===1).reduce((v,g)=>v+g.cells.length*15,0);v+=(n.go.prisoners[s.turn]-n.go.prisoners[enemy])*18-danger+pressure;if(a.type==='stone')v+=5;if(a.type==='pass')v-=25;}if(v>score){score=v;best=a;}}return best;
}
