import {CARDS,PIECES} from './game-engine.js?v=3.1.0';
const ACTIVE='ac-active-v3',DAY=24*60*60*1000;
const ids=new Set(CARDS.map(c=>c.id));
const validToken=t=>typeof t==='string'&&t.length>0&&t.length<=80;
const validCode=c=>typeof c==='string'&&/^[A-Z0-9]{8}$/.test(c);
const read=(storage,key)=>{try{return storage?.getItem(key);}catch{return null;}};
const write=(storage,key,value)=>{try{storage?.setItem(key,value);return !!storage;}catch{return false;}};
const validGo=g=>g===undefined||(g?.enabled===true&&Number.isInteger(g.passes)&&g.passes>=0&&g.passes<=2&&['w','b'].every(c=>Number.isSafeInteger(g.prisoners?.[c])&&g.prisoners[c]>=0)&&(g.koBoard===null||typeof g.koBoard==='string'&&g.koBoard.length<=5000)&&Array.isArray(g.lastCapture)&&g.lastCapture.every(i=>Number.isInteger(i)&&i>=0&&i<64));
export function validSnapshot(s){
  return !!s&&validGo(s.go)&&Array.isArray(s.board)&&s.board.length===64&&s.board.every(p=>p===null||(p&&['w','b',...(s.variant==='ac272'?['x']:[])].includes(p.c)&&(p.t!=='stone'||s.go?.enabled===true)&&(s.variant==='ac272'?Object.hasOwn(PIECES,p.t):'pnbrqk'.includes(p.t)&&p.t.length===1)))&&
    Number.isInteger(s.rev)&&s.rev>=0&&Number.isInteger(s.ply)&&s.ply>=0&&['draft','play','over'].includes(s.phase)&&['w','b'].includes(s.turn)&&
    Array.isArray(s.log)&&Array.isArray(s.rematch)&&['w','b'].every(c=>Array.isArray(s.aug?.[c])&&s.aug[c].every(id=>ids.has(id))&&Array.isArray(s.offers?.[c])&&s.offers[c].every(id=>ids.has(id))&&Array.isArray(s.castle?.[c]));
}
// A room sequence survives rematches, where the chess revision returns to zero.
export function snapshotDecision(current,next,currentSequence,sequence){
  if(!validSnapshot(next))return 'ignore';
  if(!current)return 'accept';
  if(Number.isSafeInteger(sequence)&&sequence>=0){
    if(sequence<currentSequence)return 'ignore';
    if(sequence===currentSequence)return 'duplicate';
    return 'accept';
  }
  // Compatibility with the previous v3 client, which only sent chess revisions.
  if(current.result&&next.rev===0&&next.phase==='draft')return 'accept';
  return next.rev<current.rev?'ignore':next.rev===current.rev?'duplicate':'accept';
}
export function createSessionStore({local,session,now=Date.now,newId=()=>crypto.randomUUID()}){
  return {
    token(code){
      const key='ac-token-'+code;let token;
      try{const cached=JSON.parse(read(local,key));if(cached?.expires>now()&&validToken(cached.token))token=cached.token;}catch{}
      if(!token){const old=read(session,key);token=validToken(old)?old:newId();}
      write(local,key,JSON.stringify({token,expires:now()+DAY}));write(session,key,token);return token;
    },
    save(value){return write(session,ACTIVE,JSON.stringify({...value,savedAt:now()}));},
    load(code){
      try{const s=JSON.parse(read(session,ACTIVE));
        if(!s||!validCode(s.code)||(code&&code!==s.code)||typeof s.host!=='boolean'||!validToken(s.token)||!Number.isSafeInteger(s.sequence)||s.sequence<0||!Number.isFinite(s.savedAt)||now()-s.savedAt>DAY||s.savedAt>now()+60000||(s.game!==null&&!validSnapshot(s.game))||(s.guestToken!==null&&!validToken(s.guestToken)))return null;
        return s;
      }catch{return null;}
    },
    clear(){try{session?.removeItem(ACTIVE);}catch{}}
  };
}
