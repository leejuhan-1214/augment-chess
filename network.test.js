import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {OnlineRoom,roomCode} from './network.js';
import {createGame,reduce,legalMoves} from './engine.js';
const peers=new Map();let counter=0;
class Channel extends EventEmitter{
  constructor(peer,metadata){super();this.peer=peer;this.metadata=metadata;this.open=false;this.sent=[];}
  send(data){assert.ok(this.open);const wire=JSON.stringify(data);assert.ok(new TextEncoder().encode(wire).byteLength<16300,'PeerJS JSON channel message limit');const copy=JSON.parse(wire);this.sent.push(copy);queueMicrotask(()=>{if(this.other.open)this.other.emit('data',copy);});}
  close(){if(!this.open)return;this.open=false;this.other.open=false;queueMicrotask(()=>{this.emit('close');this.other.emit('close');});}
}
class FakePeer extends EventEmitter{
  constructor(id){super();this.id=id||'guest-'+(++counter);this.disconnected=false;peers.set(this.id,this);queueMicrotask(()=>this.emit('open',this.id));}
  connect(id,options){const local=new Channel(id,options.metadata),remote=new Channel(this.id,options.metadata);local.other=remote;remote.other=local;queueMicrotask(()=>{const peer=peers.get(id);if(!peer){this.emit('error',{type:'peer-unavailable'});return;}peer.emit('connection',remote);queueMicrotask(()=>{local.open=true;remote.open=true;remote.emit('open');local.emit('open');});});return local;}
  reconnect(){this.disconnected=false;queueMicrotask(()=>this.emit('open',this.id));}
  destroy(){peers.delete(this.id);}
}
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));
const create=(host,code,token)=>new OnlineRoom({host,code,token,PeerClass:FakePeer});

test('chunked rooms use the v3 namespace and refuse legacy protocol metadata',async()=>{
  const host=create(true,'VERSION2'),legacy=new FakePeer('legacy-client');
  assert.equal(host.peer.id,'augmentchess-v3-VERSION2');
  assert.equal(peers.has('augmentchess-v2-VERSION2'),false);
  const conn=legacy.connect(host.peer.id,{metadata:{app:'augment-chess-v2',token:'legacy-token'}});
  let response;conn.on('data',data=>response=data);await tick();
  assert.equal(response?.type,'busy');assert.equal(host.live,false);assert.equal(host.guestToken,null);
  const guest=create(false,'VERSION2','current-token');await tick();
  assert.equal(guest.conn.metadata.app,'augment-chess-v3');assert.equal(host.live,true);assert.equal(guest.live,true);
  host.destroy();guest.destroy();legacy.destroy();conn.close();
});
test('room codes are 8 URL-safe characters and vary',()=>{const a=roomCode(),b=roomCode();assert.match(a,/^[A-Z2-9]{8}$/);assert.notEqual(a,b);});
test('real protocol over paired channels syncs draft and moves, rejecting stale moves',async()=>{
  const host=create(true,'TEST0001');let state=createGame(88),client=null;
  host.on('connected',()=>host.send({type:'state',game:state}));
  host.on('data',d=>{if(d.type==='action'){const next=reduce(state,d.action,'b');if(next)state=next;host.send({type:'state',game:state});}});
  const guest=create(false,'TEST0001','friend');guest.on('data',d=>{if(d.type==='state')client=d.game;});await tick();assert.equal(host.live,true);assert.equal(guest.live,true);assert.deepEqual(client,state);
  state=reduce(state,{type:'choose',id:state.offers.w[0],rev:state.rev},'w');host.send({type:'state',game:state});await tick();
  guest.send({type:'action',action:{type:'choose',id:client.offers.b[0],rev:client.rev}});await tick();assert.equal(state.phase,'play');assert.deepEqual(client,state);
  state=reduce(state,{type:'move',from:52,to:36,rev:state.rev},'w');host.send({type:'state',game:state});await tick();
  const action={type:'move',from:12,to:28,rev:client.rev};guest.send({type:'action',action});await tick();assert.equal(state.board[28].c,'b');assert.deepEqual(client,state);const rev=state.rev;guest.send({type:'action',action});await tick();assert.equal(state.rev,rev);
  host.destroy();guest.destroy();
});
test('room rejects a third participant and reserves the reconnect identity',async()=>{
  const host=create(true,'TEST0002'),one=create(false,'TEST0002','first');await tick();const active=host.conn;
  const two=create(false,'TEST0002','intruder');let rejected='';two.on('error',e=>rejected=e);await tick();assert.equal(host.conn,active);assert.ok(rejected.includes('진행 중'));assert.equal(host.live,true);
  one.destroy();await tick();assert.equal(host.live,false);const three=create(false,'TEST0002','new-person');three.on('error',e=>rejected=e);await tick();assert.equal(host.conn,active);
  const returning=create(false,'TEST0002','first');await tick();assert.equal(host.live,true);assert.notEqual(host.conn,active);
  for(const r of [host,two,three,returning])r.destroy();
});
test('guest reconnect preserves host game and syncs the current snapshot',async()=>{
  const host=create(true,'TEST0003');let state=createGame(22);host.on('connected',()=>host.send({type:'state',game:state}));
  const guest=create(false,'TEST0003','same-session');let snapshot;guest.on('data',d=>snapshot=d.game);await tick();guest.conn.close();await tick();assert.equal(host.live,false);state.rev=19;guest.reconnect();await tick();assert.equal(host.live,true);assert.equal(snapshot.rev,19);host.destroy();guest.destroy();
});
test('unknown rooms report an actionable error and destroyed rooms stop emitting',async()=>{
  const guest=create(false,'MISSING1');let message='';guest.on('error',m=>message=m);await tick();assert.match(message,/방을 찾을 수 없습니다/);guest.destroy();guest.emit('error','bad');assert.ok(!message.includes('bad'));
});

function packets(id,value){const text=typeof value==='string'?value:JSON.stringify(value),parts=[];for(let i=0;i<text.length;i+=800)parts.push(text.slice(i,i+800));return parts.map((content,part)=>({type:'packet',id,part,total:parts.length,content}));}

test('90-ply Unicode game snapshots cross the JSON channel in bounded packets and reconnect',async()=>{
  let state=createGame(87);
  for(let count=0;count<90&&!state.result;){
    if(state.phase==='draft'){for(const color of ['w','b'])state=reduce(state,{type:'choose',id:state.offers[color][0],rev:state.rev},color);continue;}
    const choices=legalMoves(state),move=choices[(count*13)%choices.length];state=reduce(state,{type:'move',...move,rev:state.rev},state.turn);count++;
  }
  const payload={type:'state',game:state,label:'회귀✨🙂\\\n'.repeat(5000)};
  assert.ok(new TextEncoder().encode(JSON.stringify(payload)).byteLength>50000);
  const host=create(true,'BIGSTATE'),guest=create(false,'BIGSTATE','same-large-session');let received=[];guest.on('data',data=>received.push(data));await tick();
  assert.equal(host.send(payload),true);await tick();assert.deepEqual(received,[payload]);assert.equal(host.live,true);
  assert.ok(host.conn.sent.length>50);assert.ok(host.conn.sent.every(packet=>new TextEncoder().encode(JSON.stringify(packet)).byteLength<=8192));
  guest.conn.close();await tick();guest.reconnect();await tick();assert.equal(host.send(payload),true);await tick();assert.deepEqual(received,[payload,payload]);
  assert.equal(host.pendingBytes,0);assert.equal(guest.pendingBytes,0);host.destroy();guest.destroy();
});

test('duplicate, malformed, conflicting and out-of-order fragments never replay or leak incomplete data',async()=>{
  const host=create(true,'PACKETS1'),guest=create(false,'PACKETS1','fragment-test');const received=[];host.on('data',d=>received.push(d));await tick();
  const value={type:'sync',label:'증강 정보'.repeat(400)},valid=packets('valid',value);
  guest.conn.send(valid[0]);guest.conn.send(valid[0]);for(const packet of valid.slice(1))guest.conn.send(packet);await tick();assert.deepEqual(received,[value]);
  for(const packet of valid)guest.conn.send(packet);await tick();assert.equal(received.length,1);
  const reordered=packets('reordered',value);guest.conn.send(reordered[1]);for(const packet of reordered)guest.conn.send(packet);
  const conflict=packets('conflict',value);guest.conn.send(conflict[0]);guest.conn.send({...conflict[0],content:'wrong'});for(const packet of conflict.slice(1))guest.conn.send(packet);
  guest.conn.send({type:'packet',id:'invalid-count',part:0,total:100000,content:'{}'});
  guest.conn.send({type:'packet',id:'invalid-part',part:-1,total:1,content:'{}'});
  guest.conn.send({type:'packet',id:'invalid-size',part:0,total:1,content:'x'.repeat(1201)});
  guest.conn.send({type:'packet',id:'bad-json',part:0,total:1,content:'{not json}'});
  guest.conn.send({type:'packet',id:'primitive',part:0,total:1,content:'42'});
  await tick();assert.equal(received.length,1);assert.equal(host.pendingPackets.size,0);assert.equal(host.pendingBytes,0);
  host.destroy();guest.destroy();
});

test('missing packets are bounded and cleared on disconnect; old connections cannot complete new packets',async()=>{
  const host=create(true,'PACKETS2'),guest=create(false,'PACKETS2','same-session');const received=[];host.on('data',d=>received.push(d));await tick();
  const value={type:'sync',label:'대전'.repeat(1000)},incomplete=packets('incomplete',value),oldHostConn=host.conn;
  guest.conn.send(incomplete[0]);for(let i=0;i<12;i++)guest.conn.send({...incomplete[0],id:'pending-'+i});await tick();
  assert.equal(received.length,0);assert.equal(host.pendingPackets.size,8);assert.ok(host.pendingBytes<=4*1024*1024);
  guest.conn.close();await tick();assert.equal(host.pendingPackets.size,0);assert.equal(host.pendingBytes,0);
  guest.reconnect();await tick();for(const packet of incomplete.slice(1))oldHostConn.emit('data',packet);await tick();assert.equal(received.length,0);
  for(const packet of packets('fresh-connection',value))guest.conn.send(packet);await tick();assert.deepEqual(received,[value]);
  guest.conn.send({...incomplete[0],id:'destroy-pending'});await tick();assert.equal(host.pendingPackets.size,1);
  host.destroy();assert.equal(host.pendingPackets.size,0);assert.equal(host.pendingBytes,0);guest.destroy();
});

test('send failures return false, close the channel, and report a reconnect action',async()=>{
  const host=create(true,'FAILSEND'),guest=create(false,'FAILSEND','send-failure');let message='';host.on('error',m=>message=m);await tick();
  host.conn.send=()=>{throw new Error('SCTP send failed');};assert.equal(host.send({type:'sync'}),false);assert.equal(host.live,false);assert.match(message,/다시 연결/);await tick();assert.equal(guest.live,false);
  host.destroy();guest.destroy();
  const oversized=create(true,'TOOLARGE'),recipient=create(false,'TOOLARGE','oversize');await tick();assert.equal(oversized.send({type:'state',padding:'가'.repeat(750000)}),false);assert.equal(oversized.live,false);oversized.destroy();recipient.destroy();
});
