import {ORTHO,DIAG,KING,KNIGHT,PIECES,NAMES,PAWNS,MINORS,MAJORS,isRoyal,inside,row,col,dist,around,side,value} from './variant-pieces.js';
export {NAMES,PIECES,PAWNS,MINORS,MAJORS,isRoyal,around,dist,row,col,value};
export const OTHER=side,squareName=i=>'abcdefgh'[col(i)]+(8-row(i));
export const own=(s,c,predicate=()=>true)=>s.board.map((p,i)=>({p,i})).filter(({p,i})=>p?.c===c&&predicate(p,i));
export function has(s,c,key){return s.aug[c]?.includes('ac-'+key)||s.echoes[c]?.includes('ac-'+key)||((s.aug[c]?.includes('ac-clone')||s.echoes[c]?.includes('ac-clone'))&&s.passiveKeys?.includes(key)&&s.aug[side(c)]?.includes('ac-'+key));}
export const rule=(s,key)=>s.rules.includes(key);
export const random=s=>{let x=s.rng|0;x^=x<<13;x^=x>>>17;x^=x<<5;s.rng=x>>>0;return s.rng/4294967296;};
export const pick=(s,array)=>array.length?array[Math.floor(random(s)*array.length)]:undefined;
export function shuffle(s,array){const a=[...array];for(let i=a.length-1;i>0;i--){const j=Math.floor(random(s)*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export const active=(s,p,key)=>!!p&&p[key]!==undefined&&p[key]>=s.ply;
export const buff=(s,c,key)=>!!s.buffs[c]?.[key]&&s.buffs[c][key].until>=s.ply&&(s.buffs[c][key].start??0)<=s.ply;
export function grant(s,c,key,duration=1,data={}){s.buffs[c][key]={...data,start:s.ply,until:s.ply+duration-1};}
export function defer(s,plies,kind,data={}){s.events.push({at:s.ply+plies,kind,...data});}
export function piece(s,c,t,extra={}){return {c,t,uid:'v'+(++s.uid),home:null,moved:true,bornAt:s.ply,...extra};}
export const empty=(s,filter=()=>true)=>Array.from({length:64},(_,i)=>i).filter(i=>!s.board[i]&&!s.void.includes(i)&&filter(i));
export const kingAt=(s,c)=>s.board.findIndex(p=>p?.c===c&&isRoyal(p));
export function spawn(s,c,t,to,extra={}){if(to===undefined||to<0||to>63||s.board[to]||s.void.includes(to))return false;s.board[to]=piece(s,c,t,{home:to,...extra});return true;}
export function nearSpawn(s,c,t,origin,extra={}){return spawn(s,c,t,pick(s,around(origin).filter(i=>!s.board[i]&&!s.void.includes(i))),extra);}
export function transform(s,index,t){const p=s.board[index];if(!p)return false;const royal=isRoyal(p);s.board[index]={...p,t,moved:true,bornAt:s.ply,royal};return true;}
export function remove(s,index,{force=false,attacker=null}={}){
  const p=s.board[index];if(!p)return null;
  if(!force&&protectedPiece(s,p,index))return null;
  s.board[index]=null;if(['w','b'].includes(p.c)){s.graveyard[p.c].push({...p});s.lastLost[p.c]=s.ply;}
  s.lastCaptured=p.t;
  if(p.t==='core'&&!s.board.some(q=>q?.parent===p.parent&&q.t==='core'))for(let i=0;i<64;i++)if(s.board[i]?.uid===p.parent)s.board[i]=null;
  if(p.group&&!force){const parts=s.board.filter(q=>q?.uid===p.uid);if(parts.length<=2)for(let i=0;i<64;i++)if(s.board[i]?.uid===p.uid)s.board[i]=null;}
  if(p.recurrence){const to=pick(s,empty(s,i=>row(i)===(p.c==='w'?7:0)));if(to!==undefined){s.board[to]={...p,moved:true,bornAt:s.ply,recurrence:false};}}
  if(p.t==='undead')defer(s,4,'spawn-home',{c:p.c,t:p.t});
  if(p.callingCard){const victim=pick(s,own(s,p.c,q=>!isRoyal(q)));if(victim)remove(s,victim.i,{force:true});}
  if(attacker&&p.poison)attacker.boundUntil=s.ply+4;
  if(attacker&&p.grudge)attacker.forbiddenTypes=[...(attacker.forbiddenTypes||[]),p.t];
  if(attacker&&p.trojan){const at=s.board.findIndex(q=>q?.uid===attacker.uid);if(at>=0){remove(s,at,{force:true});spawn(s,p.c,'p',at);}}
  if(attacker&&p.counter){const at=s.board.findIndex(q=>q?.uid===attacker.uid);if(at>=0)remove(s,at,{force:true});}
  if(p.contract){const ally=s.board.find(q=>q?.uid===p.contract);if(ally&&attacker){const at=s.board.findIndex(q=>q?.uid===attacker.uid);if(at>=0)remove(s,at,{force:true});}}
  if(p.bomb)for(const i of around(index))remove(s,i,{force:true});
  if(attacker)for(const {p:q,i} of own(s,p.c,q=>q.t==='reaper'))if(dist(i,index)<=1){q.souls=(q.souls||0)+1;if(q.souls>=2)s.result={winner:q.c,reason:'사신의 영혼 수집'};}
  return p;
}
export function protectedPiece(s,p,index){
  if(!p)return false;
  if(p.t==='barrier')return false;
  if(['guard','monster','colossus'].includes(p.t)||p.metal||active(s,p,'shieldUntil')||active(s,p,'freezeUntil'))return true;
  if(isRoyal(p)&&own(s,p.c,q=>q.t==='barrier').length)return true;
  if(p.submerge&&!own(s,side(p.c)).some(q=>dist(q.i,index)<=1))return true;
  return false;
}
function captureAllowed(s,p,from,target,to,attacks){
  if(!target)return true;
  if(target.c===p.c&&p.t!=='dragon'&&!(p.t==='n'&&has(s,p.c,'mad-horse')))return false;
  if(target.c==='x'&&target.t==='cover')return false;
  if(protectedPiece(s,target,to))return false;
  if(p.bornAt===s.ply||active(s,p,'disarmedUntil')||buff(s,p.c,'no-capture')||buff(s,p.c,'reposition')||buff(s,p.c,'quantum-mechanics'))return false;
  if(rule(s,'armistice')||buff(s,'w','armistice')||buff(s,'b','armistice')||(rule(s,'chess-n-pow-30')&&s.ply<4))return false;
  if(rule(s,'cool-guy')&&p.lastCapture)return false;if(rule(s,'saturation')&&(p.captures||0)>=3)return false;
  if(p.t==='q'&&has(s,target.c,'geneva-convention')&&PAWNS.has(target.t))return false;
  if(isRoyal(p)&&target.t==='q'&&has(s,target.c,'overwhelm'))return false;
  if(target.nullification&&target.t===p.t)return false;
  if(target.ironWall&&(target.c==='w'?row(to)>=4:row(to)<4)&&(row(from)===row(to)||col(from)===col(to)))return false;
  if(s.highGround?.includes(to)&&!s.highGround.includes(from))return false;
  if(p.t==='jester'&&!isRoyal(target))return false;if(target.t==='jester'&&!isRoyal(p))return false;
  if(['guard','baby-bear','campfire','paladin','herald','beacon','wizard','idol','recruiter'].includes(p.t))return false;
  if(p.t==='pegasus'&&!KNIGHT.some(([r,c])=>row(from)+r===row(to)&&col(from)+c===col(to)))return false;
  if(buff(s,target.c,'initiative')&&!s.initiativeBroken&&!isRoyal(target))return false;
  if(p.desperado&&isRoyal(target))return false;
  return true;
}
export function pseudo(s,from,attacks=false,override=null,depth=0){
  const p=s.board[from];if(!p||depth>3)return [];
  if(!attacks&&(active(s,p,'freezeUntil')||active(s,p,'boundUntil')||p.bound||p.metalReady>s.ply||s.forced?.[p.c]&&s.forced[p.c]!==p.uid))return [];
  let t=override||p.form||p.t;if(buff(s,p.c,'socialism')&&!isRoyal(p))t='p';if(!override&&buff(s,p.c,'reversal')&&['r','b'].includes(t))t=t==='r'?'b':'r';
  const r=row(from),c=col(from),d=p.c==='w'?-1:1,moves=[];
  const light=(r+c)%2===1?own(s,side(p.c),q=>q.t==='paladin').flatMap(q=>[q.i,...around(q.i)]):[];
  const add=(rr,cc,extras={})=>{if(!inside(rr,cc))return false;const to=rr*8+cc,target=s.board[to];if(to===from||s.void.includes(to)||light.includes(to))return false;
    if((extras.ram||!target||target.uid===p.uid||captureAllowed(s,p,from,target,to,attacks))&&target?.uid!==p.uid)moves.push({from,to,...extras});
    return !target||target.uid===p.uid;};
  const step=(dirs,extras={})=>dirs.forEach(([dr,dc])=>add(r+dr,c+dc,extras));
  const slide=(dirs,max=7,jump=false,extras={})=>dirs.forEach(([dr,dc])=>{let jumped=false;for(let n=1;n<=max;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc))break;const to=rr*8+cc,target=s.board[to];if(target?.uid===p.uid)continue;
    if(target?.ghost&&target.c===p.c)continue;
    if(target&&jump){jumped=true;continue;}
    const open=add(rr,cc,{...extras,...(jumped?{jumped:true}:{} )});if(!open)break;}});
  const leap=dirs=>step(dirs);
  const pawn=()=>{
    const reversed=p.reverseMoves>0?-d:d,dir=reversed;
    if(t==='fanatic'){slide([[dir,0]],2);return;}
    if(t==='berolina'){
      for(const dc of [-1,1])for(let n=1;n<=(p.moved?1:2);n++){const rr=r+dir*n,cc=c+dc*n;if(!inside(rr,cc)||s.board[rr*8+cc])break;add(rr,cc);}
      if(inside(r+dir,c)&&s.board[(r+dir)*8+c])add(r+dir,c);return;
    }
    const max=p.charge?3:p.moved?1:has(s,p.c,'sprint')?3:2;
    for(let n=1;n<=max;n++){const rr=r+dir*n;if(!inside(rr,c)||s.board[rr*8+c])break;add(rr,c,{double:n===2});}
    for(const dc of [-1,1]){const rr=r+dir,cc=c+dc;if(!inside(rr,cc))continue;const to=rr*8+cc;
      if(attacks||s.board[to])add(rr,cc);else if(to===s.ep&&s.epVictim!==null&&s.board[s.epVictim]&&captureAllowed(s,p,from,s.board[s.epVictim],s.epVictim,attacks))add(rr,cc,{ep:s.epVictim});
      if(buff(s,p.c,'en-passant-bang')&&s.board[r*8+cc]&&s.board[r*8+cc].c!==p.c&&!s.board[to])add(rr,cc,{ep:r*8+cc});
    }
    if(has(s,p.c,'long-en-passant')&&s.epVictim!==null&&PAWNS.has(s.board[s.epVictim]?.t)&&row(s.epVictim)===r){const target=s.epVictim+dir*8;if(!s.board[target])add(row(target),col(target),{ep:s.epVictim});}
    if(has(s,p.c,'retreat')&&!s.board[(r-dir)*8+c])add(r-dir,c);
    if((has(s,p.c,'proficiency')&&r===(p.c==='w'?1:6))||buff(s,p.c,'breakthrough-order'))if(s.board[(r+dir)*8+c])add(r+dir,c);
    if(has(s,p.c,'leap'))for(let n=2;n<=7;n++){const rr=r+dir*n;if(!inside(rr,c))break;if(!s.board[rr*8+c]&&Array.from({length:n-1},(_,j)=>s.board[(r+dir*(j+1))*8+c]).some(q=>q&&q.c!==p.c)){add(rr,c);break;}}
    if(has(s,p.c,'vanguard')){const pawns=own(s,p.c,q=>PAWNS.has(q.t));const front=p.c==='w'?Math.min(...pawns.map(q=>row(q.i))):Math.max(...pawns.map(q=>row(q.i)));if(r===front&&pawns.filter(q=>row(q.i)===front).length===1)for(const dc of [-1,1])if(!s.board[(r+dir)*8+c+dc])add(r+dir,c+dc);}
    if(p.t==='standard-bearer'||own(s,p.c,q=>q.t==='standard-bearer').some(q=>row(q.i)===r))step([[0,1],[0,-1]]);
    const captain=own(s,p.c,q=>q.t==='knightmaster').some(q=>dist(q.i,from)<=1);if(captain){moves.length=0;step(KNIGHT);}
  };
  if(PAWNS.has(t))pawn();
  else if(t==='n'||['dragon','assassin','paladin','don-quixote'].includes(t))step(KNIGHT);
  else if(t==='b'){
    slide(DIAG);
    if(buff(s,p.c,'bishop-infiltration'))for(const [dr,dc]of DIAG)for(let n=1;n<8;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc))break;if(!s.board[rr*8+cc])add(rr,cc);}
    if(buff(s,p.c,'snipe'))for(const [dr,dc]of DIAG){let jumped=false;for(let n=1;n<8;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc))break;const q=s.board[rr*8+cc];if(!jumped){if(q){if(!PAWNS.has(q.t))break;jumped=true;}}else if(q){if(q.c!==p.c)add(rr,cc);break;}}}
  }
  else if(t==='r'){
    slide(ORTHO);
    if(buff(s,p.c,'overtake'))for(const [dr,dc]of ORTHO)for(let n=1;n<8;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc))break;const q=s.board[rr*8+cc];if(q?.c===p.c)continue;add(rr,cc);if(q)break;}
  }
  else if(['q','idol','clockwork','trickster','grappler','bear'].includes(t))slide(KING);
  else if(t==='alfil')step(DIAG.map(([r,c])=>[r*2,c*2]));
  else if(t==='camel')step(KNIGHT.map(([r,c])=>[Math.sign(r)*(Math.abs(r)===2?3:1),Math.sign(c)*(Math.abs(c)===2?3:1)]));
  else if(t==='eagle')step(KING.map(([r,c])=>[r*2,c*2]));
  else if(t==='lobster')step([[d,0],[d,-1],[d,1]]);
  else if(['knightmaster','missionary','princess'].includes(t))step(DIAG);
  else if(t==='monsignor')for(let n=1;n<=3;n++)step(DIAG.map(([r,c])=>[r*n,c*n]));
  else if(t==='killer')slide(DIAG,2);
  else if(t==='windmill')slide(p.windmillRook?ORTHO:DIAG);
  else if(t==='archbishop'){slide(DIAG);step(KNIGHT);}
  else if(t==='chancellor'){slide(ORTHO);step(KNIGHT);}
  else if(t==='amazon'){slide(KING);step(KNIGHT);}
  else if(t==='campfire'||t==='revolving-door')slide(ORTHO);
  else if(t==='slime')step(ORTHO.map(([r,c])=>[r*3,c*3]));
  else if(t==='herald'||t==='thief')for(const [dr,dc]of ORTHO)for(let n=1;n<=3;n++){const jumped=Array.from({length:n-1},(_,j)=>s.board[(r+dr*(j+1))*8+c+dc*(j+1)]).some(Boolean);const rr=r+dr*n,cc=c+dc*n;if(t==='thief'&&jumped&&s.board[rr*8+cc])continue;add(rr,cc,{jumped});}
  else if(t==='siege-ram')for(let n=1;n<=2;n++)step(ORTHO.map(([r,c])=>[r*n,c*n]),{ram:true});
  else if(t==='jester')slide(KING);
  else if(t==='reaper'){step(KING);step(DIAG.map(([r,c])=>[r*2,c*2]));}
  else if(t==='pegasus')for(let to=0;to<64;to++)add(row(to),col(to));
  else if(['hook','brutus'].includes(t)){slide(ORTHO);for(const [dr,dc] of ORTHO)for(let n=1;n<8;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc)||s.board[rr*8+cc])break;for(const [er,ec]of ORTHO.filter(([er,ec])=>er*dr+ec*dc===0)){for(let m=1;m<8;m++){const ar=rr+er*m,ac=cc+ec*m;if(!inside(ar,ac))break;if(!add(ar,ac,{bend:rr*8+cc}))break;}}}}
  else if(t==='cardinal'){for(const [dr,dc]of DIAG){let rr=r,cc=c,vr=dr,vc=dc,visited=new Set();for(let n=0;n<20;n++){let nr=rr+vr,nc=cc+vc;if(nr<0||nr>7){vr=-vr;nr=rr+vr;}if(nc<0||nc>7){vc=-vc;nc=cc+vc;}const to=nr*8+nc;if(visited.has(to)||to===from)break;visited.add(to);if(!add(nr,nc))break;rr=nr;cc=nc;}}}
  else if(t==='cannon'||t==='grasshopper'){for(const [dr,dc]of(t==='cannon'?ORTHO:KING)){let crossed=false;for(let n=1;n<8;n++){const rr=r+dr*n,cc=c+dc*n;if(!inside(rr,cc))break;const q=s.board[rr*8+cc];if(!crossed){if(q){if(t==='cannon'&&q.t==='cannon')break;crossed=true;}continue;}if(q?.t!=='cannon')add(rr,cc);if(t==='grasshopper'||q)break;}}}
  else if(t==='medium'||t==='parrot'){const mimic=t==='medium'?s.lastCaptured:s.lastMoved[p.c];if(mimic&&!['medium','parrot'].includes(mimic))moves.push(...pseudo(s,from,attacks,mimic,depth+1));else step(KING);}
  else if(['big-rook','big-bishop','colossus'].includes(t))slide(t==='big-bishop'?DIAG:ORTHO,t==='colossus'?1:7);
  else if(t==='prime-minister'){step(KING);for(const mid of around(from))if(!s.board[mid])for(const to of around(mid))add(row(to),col(to),{via:mid});}
  else if(t==='checker'||t==='king-checker'){const dirs=t==='king-checker'?DIAG:[[d,-1],[d,1]];step(dirs);for(const[dr,dc]of dirs){const mid=(r+dr)*8+c+dc;if(inside(r+2*dr,c+2*dc)&&s.board[mid]?.c===side(p.c)&&!s.board[(r+2*dr)*8+c+2*dc])add(r+2*dr,c+2*dc,{ep:mid,checkerCapture:true});}const captures=moves.filter(m=>m.checkerCapture);if(captures.length)return captures;}
  else if(!['barrier','scarecrow','transmission-tower','core','cover','log','crown'].includes(t))step(KING);
  if(!override){
    if(isRoyal(p)){if(has(s,p.c,'king-of-the-hill')&&[27,28,35,36].includes(from))moves.push(...pseudo(s,from,attacks,'amazon',depth+1));if(buff(s,p.c,'horse-riding'))moves.push(...pseudo(s,from,attacks,'n',depth+1));for(const learned of p.learned||[])moves.push(...pseudo(s,from,attacks,learned,depth+1));}
    if(!p.moved&&has(s,p.c,'locust-swarm')&&(p.t==='r'||MINORS.has(p.t)))moves.push(...pseudo(s,from,attacks,'grasshopper',depth+1));
    if(p.t==='dragon')for(const {i}of own(s,p.c))if(i!==from&&!s.board[i].group)moves.push({from,to:i,swap:true});
    if(p.t==='assassin'||isRoyal(p)&&has(s,p.c,'killer-king')){for(const m of pseudo(s,from,attacks,p.t==='assassin'?'q':'r',depth+1))if(isRoyal(s.board[m.to]))moves.push(m);}
    if(p.t==='r'&&!p.moved&&has(s,p.c,'rocket'))moves.push(...pseudo(s,from,attacks,'amazon',depth+1));
    if(p.t==='princess'&&!own(s,p.c,q=>q.t==='q').length)moves.push(...pseudo(s,from,attacks,'q',depth+1));
    if(p.t==='magic-girl'&&s.lastLost[p.c]>=s.ply-1)moves.push(...pseudo(s,from,attacks,'amazon',depth+1));
    if(p.t==='berserker'){const count=own(s,p.c).length;if(count<=9)moves.push(...pseudo(s,from,attacks,count<=5?'amazon':'r',depth+1));}
    if(p.t==='n'&&has(s,p.c,'corner-kick')&&(r<2||r>5)&&(c<2||c>5))moves.push(...pseudo(s,from,attacks,'b',depth+1));
    if(p.pawnTraining||buff(s,p.c,'royal-command'))moves.push(...pseudo(s,from,attacks,p.pawnTraining?'p':'k',depth+1));
    if(active(s,p,'queenMoveUntil'))moves.push(...pseudo(s,from,attacks,'q',depth+1).filter(m=>!s.board[m.to]));
    if(p.loyalist){const k=kingAt(s,p.c);if(k>=0)for(const to of around(k))if(!s.board[to])add(row(to),col(to));}
    if(!attacks){
      for(const {i} of own(s,p.c,q=>q.t==='transmission-tower'))for(const to of around(i))if(!s.board[to])add(row(to),col(to));
      if(buff(s,p.c,'symmetry')&&!s.board[r*8+7-c])add(r,7-c);
      const e=p.c==='w'?36:28;if(buff(s,p.c,'e4')&&!s.board[e])add(row(e),col(e));
      if(buff(s,p.c,'switcheroo')&&isRoyal(p))for(const {i}of own(s,p.c,q=>PAWNS.has(q.t)))add(row(i),col(i),{swap:true});
      if(buff(s,p.c,'relay')||buff(s,p.c,'solidarity'))for(const {p:q,i} of own(s,p.c))if(i!==from&&(buff(s,p.c,'relay')?(row(i)===r||col(i)===c):(MINORS.has(p.t)&&MINORS.has(q.t))))moves.push({from,to:i,swap:true});
      if(buff(s,p.c,'substitution'))for(const {p:q,i}of own(s,side(p.c),q=>q.t===p.t))moves.push({from,to:i,swap:true});
    }
  }
  return moves.filter((m,i,a)=>a.findIndex(q=>q.to===m.to&&q.swap===m.swap)===i).filter(m=>{
    if(rule(s,'monochrome-chess')&&(r+c)%2!==(row(m.to)+col(m.to))%2)return false;
    if((rule(s,'macho-chess')||buff(s,p.c,'taunt'))&&((row(m.to)-r)*d<0||rule(s,'macho-chess')&&row(m.to)===r&&!s.board[m.to]))return false;
    if(has(s,side(p.c),'d4')&&(m.to===(p.c==='w'?28:36))||has(s,p.c,'d4')&&isRoyal(p)&&m.to===(p.c==='w'?36:28))return false;
    const k=kingAt(s,side(p.c));if(k>=0&&has(s,side(p.c),'majesty')&&MAJORS.has(p.t)&&dist(k,m.to)<=1)return false;
    if(s.palaces?.[p.c]&&isRoyal(p)&&dist(s.palaces[p.c],m.to)>1)return false;
    if(p.inertia&&dist(from,m.to)===1)return false;if(active(s,p,'shortUntil')||p.metal)if(dist(from,m.to)>1)return false;
    if(p.t==='clockwork'&&!own(s,p.c).some(q=>q.i!==from&&dist(q.i,from)<=1))return false;
    if(PAWNS.has(p.t)&&has(s,side(p.c),'fianchetto'))for(const {i}of own(s,side(p.c),q=>q.t==='b'))if(Math.abs(row(i)-row(m.to))===Math.abs(col(i)-col(m.to))&&[1,6].includes(col(i)))return false;
    if(has(s,side(p.c),'injury')&&Math.abs(row(m.to)-r)+Math.abs(col(m.to)-c)===3){const dr=Math.sign(row(m.to)-r),dc=Math.sign(col(m.to)-c),long=Math.abs(row(m.to)-r)===2;const over=long?(r+dr)*8+c:r*8+c+dc;if(s.board[over])return false;}
    if(buff(s,p.c,'zugzwang')&&!isRoyal(p))return false;
    for(const pair of s.chains){if(pair.includes(p.uid)){const other=pair.find(id=>id!==p.uid),at=s.board.findIndex(q=>q?.uid===other);if(at>=0&&dist(at,m.to)>2)return false;}}
    if(has(s,side(p.c),'synchronization')){const enemies=own(s,side(p.c));const parity=(row(enemies[0]?.i||0)+col(enemies[0]?.i||0))%2;if(enemies.length&&enemies.every(q=>(row(q.i)+col(q.i))%2===parity)&&(row(m.to)+col(m.to))%2!==parity)return false;}
    if(p.t==='slime'&&dist(from,m.to)!==3)return false;
    if(!override&&p.forbiddenTypes?.length&&p.forbiddenTypes.some(type=>pseudo(s,from,attacks,type,depth+1).some(n=>n.to===m.to)))return false;
    return true;
  });
}
export function attacked(s,square,by){return own(s,by).some(({i})=>pseudo(s,i,true).some(m=>m.to===square));}
export function inCheck(s,color,skipInitiative=false){const k=kingAt(s,color);if(k<0)return true;return own(s,side(color)).some(({i})=>pseudo(s,i,true,skipInitiative?s.board[i].t:null).some(m=>m.to===k));}
