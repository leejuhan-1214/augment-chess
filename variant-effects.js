import {CARDS,CARD_BY_KEY,TRANSFORMS} from './variant-cards.js';
import {own,has,rule,random,pick,shuffle,grant,defer,spawn,nearSpawn,transform,remove,empty,kingAt,piece,pseudo,around,dist,row,col,value,PAWNS,MINORS,MAJORS,isRoyal} from './variant-core.js?v=3.1.0';
import {ORTHO,KING,PIECES} from './variant-pieces.js?v=3.1.0';
const enemy=c=>c==='w'?'b':'w',ROYAL=1e9;
const tagRandom=(s,c,filter,property,count=1,value=true)=>shuffle(s,own(s,c,filter)).slice(0,count).forEach(({p})=>p[property]=value);
export function bigPiece(s,c,type,at){
  const r=Math.min(6,row(at)),f=Math.min(6,col(at)),cells=[r*8+f,r*8+f+1,(r+1)*8+f,(r+1)*8+f+1];
  const p=piece(s,c,type,{group:true,home:at});for(const i of cells){if(s.board[i])remove(s,i,{force:true});s.board[i]={...p,part:i===cells[0]?0:1};}return p;
}
export function applyRule(s,key){
  if(s.rules.includes(key))return;s.rules.push(key);
  const center=[27,28,35,36];
  if(key==='black-hole')s.blackHoles=[...center];
  if(key==='highway')s.highway=Array.from({length:64},(_,i)=>i).filter(i=>[1,6].includes(col(i)));
  if(key==='high-ground')s.highGround=[26,27,28,29,34,35,36,37];
  if(key==='rule-bombs')s.bombs=shuffle(s,empty(s,i=>row(i)>=2&&row(i)<=5)).slice(0,3);
  if(key==='portal')s.portals.push(shuffle(s,empty(s,i=>row(i)>=2&&row(i)<=5)).slice(0,2));
  if(key==='football')spawn(s,'x','football',pick(s,empty(s,i=>center.includes(i))));
  if(key==='crown'){s.crown=pick(s,center);s.crownHeld={w:null,b:null};}
  if(key==='monster')spawn(s,'x','monster',pick(s,empty(s,i=>center.includes(i))));
  if(key==='capture-the-flag')s.flags={w:pick(s,Array.from({length:8},(_,i)=>56+i)),b:pick(s,Array.from({length:8},(_,i)=>i))};
  if(key==='monochrome-chess')for(const q of s.board)if(q?.t==='n')q.t='camel';
  if(key==='chess-n-pow-30')for(const {p,i} of [...own(s,'w'),...own(s,'b')])if(!isRoyal(p))transform(s,i,pick(s,Object.keys(PIECES).filter(t=>!['stone','k','merchant','core','cover','crown','football','colossus','big-rook','big-bishop'].includes(t))));
  if(key==='chess-960'||key==='chess-344200')for(const c of ['w','b']){
    const indices=own(s,c,p=>key==='chess-344200'||!PAWNS.has(p.t)).map(q=>q.i),units=indices.map(i=>s.board[i]);
    indices.forEach(i=>s.board[i]=null);const positions=shuffle(s,indices);
    for(const p of units){const choices=positions.filter(i=>!s.board[i]&&(!isRoyal(p)||row(i)===(c==='w'?7:0)));const at=pick(s,choices);if(at!==undefined){s.board[at]=p;p.home=at;}}
    s.castle[c]=[false,false];
  }
  if(key==='diagonal-chess')for(const c of ['w','b']){const units=own(s,c).map(q=>q.p);own(s,c).forEach(q=>s.board[q.i]=null);const squares=Array.from({length:64},(_,i)=>i).filter(i=>c==='w'?row(i)-col(i)>=3:col(i)-row(i)>=3);for(let i=0;i<units.length;i++){const to=squares[i]??empty(s)[0];if(to!==undefined){s.board[to]=units[i];units[i].home=to;}}s.castle[c]=[false,false];}
}
export function acquireEffect(s,key,c){
  const them=enemy(c),home=c==='w'?56:0,pawnrow=c==='w'?48:8;
  const first=type=>own(s,c,p=>p.t===type)[0]?.i;
  const randomChange=(source,dest)=>{const q=pick(s,own(s,c,p=>p.t===source));if(q)transform(s,q.i,dest);};
  if(CARD_BY_KEY[key]?.kind==='RULE'){applyRule(s,key);return;}
  const pawnChange={'pawn-conversion':'berolina','last-stand':'fanatic'}[key];if(pawnChange)for(const {i}of own(s,c,p=>PAWNS.has(p.t)))transform(s,i,pawnChange);
  if(key==='apprentice-knights')for(const f of [1,6])if(s.board[pawnrow+f]?.c===c)transform(s,pawnrow+f,'squire');
  if(key==='guard'&&s.board[pawnrow+4]?.c===c)transform(s,pawnrow+4,'guard');
  if(key==='queen-cavalry'&&s.board[pawnrow+3]?.c===c)transform(s,pawnrow+3,'n');
  if(key==='knightmate'){for(const {p,i}of own(s,c)){if(isRoyal(p))transform(s,i,'n');else if(p.t==='n')transform(s,i,'man');}}
  if(key==='elephant-escape'||key==='checker'){const n=key==='checker'?4:2,t=key==='checker'?'checker':'alfil';for(let j=0;j<n;j++)spawn(s,c,t,pick(s,empty(s,i=>c==='w'?row(i)>=4:row(i)<=3)));}
  if(key==='london-system'){const plans=c==='w'?[[51,35],[62,45],[58,37],[52,44],[49,41],[57,42],[61,52]]:[[11,27],[6,21],[2,29],[12,20],[9,17],[1,18],[5,12]];for(const[a,b]of plans)if(s.board[a]?.c===c&&!s.board[b]){s.board[b]=s.board[a];s.board[a]=null;s.board[b].moved=true;}}
  if(key==='false-start'){const units=own(s,c).sort((a,b)=>c==='w'?a.i-b.i:b.i-a.i);for(const {i,p} of units){const to=i+(c==='w'?-16:16);if(to>=0&&to<64&&!s.board[to]){s.board[to]=p;s.board[i]=null;p.moved=true;}}s.castle[c]=[false,false];}
  if(key==='herald')randomChange('r','herald');if(key==='princess')randomChange('r','princess');
  if(key==='thief'){for(const {p,i}of own(s,c,p=>p.t==='q')){transform(s,i,'thief');s.board[i].submerge=true;s.board[i].wanted=true;}}
  if(key==='wanted'){const q=pick(s,own(s,them,p=>['r','b','q'].includes(p.t)));if(q){q.p.submerge=true;q.p.wanted=true;}}
  if(key==='martyrdom'){for(const {i}of own(s,c,p=>p.t==='b'))remove(s,i,{force:true});tagRandom(s,c,p=>PAWNS.has(p.t),'blessing',64);}
  if(key==='calling-card')tagRandom(s,them,p=>!PAWNS.has(p.t)&&!isRoyal(p),'callingCard');
  if(key==='holdout'){const q=pick(s,own(s,c,p=>PAWNS.has(p.t)));if(q)defer(s,56,'transform-uid',{uid:q.p.uid,t:'q'});}
  if(key==='grudge')tagRandom(s,c,p=>!PAWNS.has(p.t),'grudge');
  if(key==='otherworld'){const q=pick(s,own(s,c,p=>PAWNS.has(p.t)));if(q){remove(s,q.i,{force:true});defer(s,28,'spawn',{c,t:'wizard',to:q.i,force:true});}}
  if(key==='queens-gambit'){const q=pick(s,own(s,c,p=>p.t==='q'));if(q){const file=col(q.i),second=pick(s,[0,1,2,3,4,5,6,7].filter(f=>Math.abs(f-file)>1));remove(s,q.i,{force:true});for(const {p,i}of own(s,c,p=>PAWNS.has(p.t)))if([file,second].includes(col(i)))p.shieldUntil=ROYAL;}}
  if(key==='dutch')for(const {p,i}of own(s,c,p=>p.t==='r'||MINORS.has(p.t)))transform(s,i,'windmill');
  if(key==='horde'){for(const {p,i}of own(s,c,p=>!isRoyal(p)))remove(s,i,{force:true});for(let r=0;r<4;r++)for(let f=0;f<8;f++)spawn(s,c,'p',(c==='w'?7-r:r)*8+f);}
  if(key==='iqp')for(const {p,i}of own(s,them,p=>PAWNS.has(p.t)))if([2,4].includes(col(i)))remove(s,i,{force:true});
  if(key==='big-rook'||key==='big-bishop'){const q=first(key==='big-rook'?'r':'b');if(q!==undefined)bigPiece(s,c,key,q);}
  if(key==='summon-colossus'){for(const {i}of own(s,c,p=>PAWNS.has(p.t)))remove(s,i,{force:true});const at=c==='w'?42:10,giant=bigPiece(s,c,'colossus',at);for(let j=0;j<2;j++)spawn(s,c,'core',pick(s,empty(s,i=>c==='w'?row(i)>=6:row(i)<=1)),{parent:giant.uid});}
  if(key==='merchant-guild'){const k=kingAt(s,c);if(k>=0){const to=k+(c==='w'?-16:16);if(s.board[to])remove(s,to,{force:true});s.board[to]=s.board[k];s.board[k]=null;transform(s,to,'merchant');s.gold[c]=20;}}
  if(key==='pawn-chain'){const pawns=own(s,them,p=>PAWNS.has(p.t));for(let i=1;i<pawns.length;i++)s.chains.push([pawns[i-1].p.uid,pawns[i].p.uid]);}
  if(key==='conversion')for(const {i}of own(s,c,p=>p.t==='n'))transform(s,i,'b');
  if(key==='white-box'){const choices=CARDS.filter(card=>card.passive&&card.key!=='white-box'&&!s.aug[c].includes(card.id));const card=pick(s,choices);if(card){s.echoes[c].push(card.id);acquireEffect(s,card.key,c);}}
  if(key==='frontline-response')tagRandom(s,c,p=>p.t==='r','ironWall',64);
  if(key==='ghost')tagRandom(s,c,p=>PAWNS.has(p.t),'ghost',64);
  if(key==='mongolian-gambit')for(const {i}of own(s,c,p=>!isRoyal(p)))transform(s,i,'n');
  if(key==='brutus')randomChange('r','brutus');
  if(key==='blue-jeans')for(const {i}of [...own(s,c,p=>MAJORS.has(p.t)),...own(s,them,p=>MAJORS.has(p.t))])remove(s,i,{force:true});
}
export function castEffect(s,key,c,picks=[],choice=null){
  const them=enemy(c),[a,b]=picks,pa=s.board[a],pb=s.board[b],me=kingAt(s,c),foe=kingAt(s,them);
  const last=s.lastEffects;s.lastEffects=[];
  const tag=(prop,v=true)=>{for(const i of picks)if(s.board[i])s.board[i][prop]=v;};
  if(TRANSFORMS[key]){if(['grappler','archbishop','chancellor','amazon','hook'].includes(key))remove(s,b,{force:true});transform(s,a,TRANSFORMS[key]);if(key==='missionary')nearSpawn(s,c,'missionary',a);if(['hedgehog'].includes(key)&&s.board[a])s.board[a].counters=2;return;}
  if(key==='windmill'){transform(s,a,'windmill');transform(s,b,'windmill');return;}
  if(key==='ordination'){remove(s,b,{force:true});transform(s,a,'cardinal');return;}
  if(key==='reformation'){for(const {i}of own(s,c,p=>p.t==='b'))transform(s,i,'monsignor');return;}
  if(key==='eagle'){for(const {i}of own(s,c,p=>p.t==='n')){transform(s,i,'eagle');nearSpawn(s,c,'eagle',i);}return;}
  const tags={'chameleon-mutation':'chameleon',submerge:'submerge',loyalist:'loyalist','basic-training':'pawnTraining',inertia:'inertia',metal:'metal',counterattack:'counter',nullification:'nullification','suicide-bomber':'bomb','trojan-horse':'trojan',stealth:'hidden',chimera:'chimera',parry:'parry',spy:'spy'};
  if(tags[key]){tag(tags[key]);return;}
  const turnBuffs=['switcheroo','disassembly','relay','taunt','horse-riding','quantum-mechanics','reposition','roller','symmetry','mistake-card','solidarity','breakthrough-order','en-passant-bang','snipe','overtake','e4','substitution'];
  if(turnBuffs.includes(key)){grant(s,['taunt','mistake-card'].includes(key)?them:c,key,['taunt','mistake-card'].includes(key)?2:1);return;}
  if(key==='royal-command'){grant(s,c,key,5);s.buffs[c][key].start=s.ply+2;return;}
  if(key==='socialism'){grant(s,them,key,2);return;}
  if(key==='armistice'){grant(s,c,key,4);return;}
  if(key==='ice-sheet'){grant(s,them,key,6);return;}
  if(key==='ice-king'){for(const {p}of [...own(s,c,isRoyal),...own(s,them,isRoyal)])p.freezeUntil=s.ply+6;return;}
  if(key==='freeze'){tagRandom(s,them,()=>true,'freezeUntil',3,s.ply+6);return;}
  if(key==='poisoned-pawn'){tagRandom(s,c,p=>PAWNS.has(p.t),'poison',3);return;}
  if(key==='evasion'||key==='royal-shield'){tagRandom(s,c,()=>true,key==='evasion'?'evasion':'blessing');return;}
  if(key==='fanatical-ritual'){const q=pick(s,own(s,them,p=>!isRoyal(p)));if(q)transform(s,q.i,'fanatic');return;}
  if(key==='vortex'){const units=own(s,them,p=>!isRoyal(p)&&!PAWNS.has(p.t)),pieces=shuffle(s,units.map(q=>q.p));units.forEach(({i},n)=>s.board[i]=pieces[n]);return;}
  if(key==='dice'){const t=pick(s,['p','n','b','r','q','k']);for(const {p}of own(s,them,p=>p.t===t))p.boundUntil=s.ply+4;s.lastEffects.push('주사위: '+t);return;}
  if(key==='cleanup'){for(const i of picks)remove(s,i,{force:true});return;}
  if(key==='panic'){defer(s,1,'panic',{uids:picks.map(i=>s.board[i].uid)});return;}
  if(key==='black-box'){const card=pick(s,CARDS.filter(q=>q.active&&!['black-box','trolley','premove','joker'].includes(q.key)));s.randomCast={key:card.key,c};return;}
  if(key==='rule-ticket'){defer(s,2,'rule',{key:choice});return;}
  if(key==='emergency-evacuation'||key==='pawn-storm'){for(const i of picks){const q=s.board[i],to=i+(c==='w'?-8:8)*(key==='pawn-storm'?1:-1);if(q&&!s.board[to]){s.board[to]=q;s.board[i]=null;q.moved=true;q.disarmedUntil=s.ply;}}return;}
  if(key==='alekhine-machine-gun'){const q=own(s,c,p=>['r','q'].includes(p.t));for(const unit of q){const line=q.filter(t=>row(t.i)===row(unit.i)||col(t.i)===col(unit.i));if(line.filter(t=>t.p.t==='r').length>=2&&line.some(t=>t.p.t==='q'))for(const t of line)t.p.shieldUntil=ROYAL;}return;}
  if(key==='file-conveyor'){s.fileConveyors.push({file:col(a),c,start:s.ply+2});return;}
  if(key==='bishop-infiltration'){grant(s,c,key,6);return;}
  if(key==='suspicious-potion'){const effect=pick(s,['blessing','evasion','chameleon','ghost','parry','counter','bound']);pa[effect]=true;return;}
  if(key==='promotion-rush'){pa.queenMoveUntil=s.ply;pa.disarmedUntil=s.ply;return;}
  if(key==='severance'){pa.shortUntil=s.ply+4;return;}
  if(key==='scarecrow'){remove(s,a,{force:true});spawn(s,c,'scarecrow',a,{shieldUntil:s.ply+5,placedAt:s.ply+6});return;}
  if(key==='twins'){pa.twin=pb.uid;pb.twin=pa.uid;return;}
  if(key==='ascension'){const saved={...pa};remove(s,a,{force:true});defer(s,6,'land',{p:saved,to:b});return;}
  if(key==='greek-gift'){remove(s,a,{force:true});defer(s,1,'greek-gift',{c});return;}
  if(key==='miracle'){const targets=pseudo(s,a).filter(m=>s.board[m.to]?.c===them);for(const move of targets){s.board[move.to].c=c;s.board[move.to].moved=true;}remove(s,a,{force:true});return;}
  if(key==='random-roulette'){transform(s,a,pick(s,Object.keys(PIECES).filter(t=>!['stone','k','merchant','cover','core','crown','colossus','big-rook','big-bishop'].includes(t))));return;}
  if(key==='feudal-contract'){pa.contract=pb.uid;return;}
  if(key==='blockade'){for(const to of around(me))spawn(s,'x','cover',to,{expires:s.ply+6});return;}
  if(key==='schrodinger-pawns'){for(const {p,i}of shuffle(s,own(s,c,p=>PAWNS.has(p.t))).slice(0,4)){const to=i+(c==='w'?8:-8);if(to>=0&&to<64&&!s.board[to]){s.board[to]={...p,quantum:true,disarmedUntil:s.ply};p.quantum=true;p.disarmedUntil=s.ply;}}return;}
  if(key==='outpost'){pa.shieldUntil=ROYAL;pa.outpost=true;return;}
  if(key==='castling'){const dr=Math.sign(row(a)-row(me)),df=Math.sign(col(a)-col(me)),kingTo=a-dr*8-df,rookTo=me+dr*8+df;const kp=s.board[me],rp=s.board[a];s.board[me]=null;s.board[a]=null;if(s.board[kingTo])remove(s,kingTo,{force:true});if(s.board[rookTo])remove(s,rookTo,{force:true});s.board[kingTo]=kp;s.board[rookTo]=rp;kp.moved=rp.moved=true;s.castle[c]=[false,false];return;}
  if(key==='insight'){const positive=['blessing','evasion','chameleon','submerge','parry','counter','ghost','shieldUntil','nullification','metal','ironWall','recurrence'],negative=['bound','boundUntil','freezeUntil','shortUntil','inertia','disarmedUntil','wanted','grudge'];for(const {p}of own(s,them))for(const tag of positive)delete p[tag];for(const {p}of own(s,c))for(const tag of negative)delete p[tag];return;}
  if(key==='premove'){defer(s,2,'premove',{c,moves:picks.reduce((list,v,i)=>(i%2===0?list.push([v,picks[i+1]]):null,list),[])});s.forceEnd=true;return;}
  if(key==='sacrifice'){remove(s,a,{force:true});pb.shieldUntil=s.ply+6;return;}
  if(key==='disarm'){pa.disarmedUntil=s.ply+1;return;}
  if(key==='seal'){defer(s,2,'bind',{uid:pa.uid});return;}
  if(key==='trolley'){const foes=own(s,them,p=>!isRoyal(p)).sort((x,y)=>value(x.p)-value(y.p));const small=foes.slice(0,Math.max(1,Math.ceil(foes.length/2))),big=foes.filter(q=>!small.includes(q));s.trolley={owner:c,player:them,tracks:[small.map(q=>q.p.uid),[...big,...own(s,c,p=>!isRoyal(p)).slice(0,2)].map(q=>q.p.uid)]};s.forceEnd=true;return;}
  if(key==='cleanup-sacrifice'){const type=pa.t;remove(s,a,{force:true});const q=pick(s,own(s,them,p=>p.t===type));if(q)remove(s,q.i,{force:true});return;}
  if(key==='hallucination'){grant(s,c,key,10);return;}
  if(key==='icbm'){defer(s,2,'icbm',{uid:pa.uid,c});return;}
  if(key==='death-squad'){for(const {i}of own(s,c,p=>PAWNS.has(p.t)))if(col(i)===col(a))transform(s,i,'fanatic');return;}
  if(key==='taboo'){defer(s,1,'taboo',{uid:pa.uid,to:b,c});return;}
  if(key==='stake'){pa.boundUntil=s.ply+8;defer(s,8,'blessing',{uid:pa.uid});return;}
  if(key==='barricade'){for(const offset of [-1,0,1]){const to=a+(choice==='vertical'?8:1)*offset;if(to>=0&&to<64&&(choice==='vertical'||row(to)===row(a)))spawn(s,'x','cover',to);}return;}
  if(key==='reverse-pawns'){for(const {p}of own(s,them,p=>PAWNS.has(p.t)))p.reverseMoves=3;return;}
  if(key==='vip'){defer(s,6,'transform-uid',{uid:pa.uid,t:'vip'});return;}
  if(key==='homecoming'||key==='exile'){const to=pa.home;s.board[to]={...pa,moved:true};s.board[a]=null;if(key==='exile')s.board[to].shieldUntil=s.ply;return;}
  if(key==='lobster'){defer(s,2,'spawn',{c,t:'lobster',to:a});return;}
  if(key==='judgment'){s.exiles.push({p:{...pa},to:a});remove(s,a,{force:true});return;}
  if(key==='witch-trial'){pa.suspectedUntil=s.ply+4;return;}
  if(key==='reversal'){remove(s,a,{force:true});grant(s,c,key);return;}
  if(key==='chain'){s.chains.push([pa.uid,pb.uid]);return;}
  if(key==='zugzwang'){grant(s,them,key,2);return;}
  if(key==='gale'){defer(s,6,'gale');return;}
  if(key==='palace'){s.palaces[them]=foe;return;}
  if(key==='desperado'){s.forced[c]=pa.uid;pa.desperado=2;return;}
  if(key==='last-resistance'){if(me>=0)s.board[me].shieldUntil=s.ply+6;return;}
  if(key==='empty-lunchbox'){pa.lunchboxUntil=s.ply+6;return;}
  if(key==='necromancy'){const q=pick(s,s.graveyard[c]);if(q){pa.revert={t:pa.t,at:s.ply+8};pa.t=q.t;pa.bornAt=s.ply;}return;}
  if(key==='othello'){grant(s,c,key);return;}
  if(key==='recurrence'){tagRandom(s,c,p=>!PAWNS.has(p.t),'recurrence');return;}
  if(key==='frenzy'){s.forced[c]=pa.uid;pa.frenzyUntil=s.ply;return;}
  if(key==='replay'){const previous=s.lastOwnMove[c];if(previous){const current=s.board.findIndex(p=>p?.uid===previous.uid);if(current>=0&&!s.board[previous.from]){s.board[previous.from]=s.board[current];s.board[current]=null;if(previous.captured&&!s.board[previous.to])s.board[previous.to]={...previous.captured};}}return;}
  if(key==='brainwash'){remove(s,a,{force:true});pb.c=c;pb.moved=true;return;}
  if(key==='charge'){pa.charge=true;return;}
  if(key==='extinction'){const type=pa.t;for(let i=0;i<64;i++)if(s.board[i]?.t===type)remove(s,i,{force:true});return;}
  if(key==='traitor'){const q=own(s,them,p=>p.moved&&!isRoyal(p)).sort((a,b)=>value(a.p)-value(b.p))[0];if(q){q.p.c=c;q.p.moved=true;}return;}
  if(key==='bribe'){pa.revert={t:pa.t,at:s.ply+6};pa.t='amazon';pa.bornAt=s.ply;return;}
  if(key==='baby-bear'){transform(s,a,'baby-bear');defer(s,14,'transform-uid',{uid:s.board[a].uid,t:'bear'});return;}
  if(key==='hypocrisy'){for(const to of picks)spawn(s,them,'p',to);return;}
  if(key==='fleeting-dream'){for(const {p}of own(s,them,p=>p.promoted)){p.t='p';delete p.promoted;}return;}
  if(key==='conscription'){for(const f of [2,3,4,5])spawn(s,c,'p',(c==='w'?48:8)+f);return;}
  if(key==='portal-gun'){defer(s,2,'portal',{squares:picks});return;}
  if(key==='black-magic'){nearSpawn(s,c,'monster',me);return;}
  if(key==='collapse'){defer(s,1,'collapse');return;}
  if(key==='vanish'){s.vanish[c]=true;return;}
  if(key==='joker'){if(choice&&s.uses[c][choice]!==undefined)s.uses[c][choice]++;return;}
  if(key==='prophecy'){s.prophecy[c]={started:s.ply,at:s.ply+6,lastViolence:s.ply};return;}
  if(key==='ultimatum'){defer(s,8,'ultimatum',{started:s.ply});return;}
  if(key==='canceling'){const p=s.board[foe],to=them==='w'?60:4;if(p){if(s.board[to]&&to!==foe)remove(s,to,{force:true});s.board[foe]=null;s.board[to]=p;p.moved=true;}return;}
  throw new Error('카드 효과 미등록: '+key);
}
