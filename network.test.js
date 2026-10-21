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

// Manually driven peers exercise lifecycle failures without a real signaling
// service or wall-clock sleeps. Timer mocking makes retry limits deterministic.
class ManualChannel extends EventEmitter{
  constructor(token='friend'){super();this.metadata={app:'augment-chess-v3',token};this.open=false;this.sent=[];this.closeCount=0;}
  send(data){this.sent.push(data);}
  close(){this.open=false;this.closeCount++;this.emit('close');}
  openNow(){this.open=true;this.emit('open');}
}
class ManualPeer extends EventEmitter{
  static instances=[];
  constructor(id){super();this.id=id||'manual-guest';this.disconnected=false;this.destroyed=false;this.connections=[];this.reconnectCount=0;ManualPeer.instances.push(this);}
  connect(id,options){const conn=new ManualChannel(options.metadata.token);this.connections.push(conn);return conn;}
  ready(){this.disconnected=false;this.emit('open',this.id);}
  reconnect(){if(this.destroyed)throw new Error('Peer was destroyed');this.disconnected=false;this.reconnectCount++;}
  destroy(){this.disconnected=true;this.emit('disconnected');this.destroyed=true;this.emit('close');}
}
const manual=(host,extra={})=>new OnlineRoom({host,code:'RECOVERY',token:'returning-friend',PeerClass:ManualPeer,...extra});

test('failed pending joins release the slot without reserving a guest identity',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const host=manual(true);host.peer.ready();
  const abandoned=new ManualChannel('abandoned');host.peer.emit('connection',abandoned);
  assert.equal(host.guestToken,null);
  const competing=new ManualChannel('competitor');host.peer.emit('connection',competing);competing.openNow();
  assert.deepEqual(competing.sent,[{type:'busy'}]);assert.equal(host.conn,abandoned);
  t.mock.timers.tick(20000);assert.ok(abandoned.closeCount>0);assert.equal(host.connecting,false);assert.equal(host.guestToken,null);
  const accepted=new ManualChannel('successful');host.peer.emit('connection',accepted);accepted.openNow();
  assert.equal(host.live,true);assert.equal(host.guestToken,'successful');
  abandoned.openNow();assert.equal(abandoned.open,false);assert.equal(host.conn,accepted);host.destroy();
});

test('restored hosts keep the established guest identity while accepting its reconnect',()=>{
  const host=manual(true,{guestToken:'saved-guest'});host.peer.ready();
  const stranger=new ManualChannel('stranger');host.peer.emit('connection',stranger);stranger.openNow();assert.equal(stranger.sent[0].type,'busy');
  const guest=new ManualChannel('saved-guest');host.peer.emit('connection',guest);guest.openNow();assert.equal(host.live,true);assert.equal(host.guestToken,'saved-guest');host.destroy();
});

test('a returning guest replaces its stale open channel without a busy race',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const host=manual(true);host.peer.ready();
  const stale=new ManualChannel('same-identity');host.peer.emit('connection',stale);stale.openNow();assert.equal(host.live,true);
  const replacement=new ManualChannel('same-identity');host.peer.emit('connection',replacement);assert.deepEqual(stale.sent,[{type:'replaced'}]);assert.equal(host.live,false);
  replacement.openNow();assert.equal(host.conn,replacement);assert.equal(host.live,true);assert.deepEqual(replacement.sent,[]);
  t.mock.timers.tick(300);assert.equal(stale.open,false);assert.equal(host.live,true);host.destroy();
});

test('same-identity replacement tells the previous guest to stop retrying',async()=>{
  const host=create(true,'TAKEOVER'),old=create(false,'TAKEOVER','shared-token');await tick();
  let message='';old.on('error',value=>message=value);
  const current=create(false,'TAKEOVER','shared-token');await tick();
  assert.equal(current.live,true);assert.equal(host.live,true);assert.equal(old.live,false);assert.equal(old.blocked,true);assert.equal(old.retryTimer,null);assert.match(message,/다른 탭/);
  host.send({type:'state',game:{rev:42}});let received;current.on('data',value=>received=value);await tick();assert.equal(received.game.rev,42);
  host.destroy();old.destroy();current.destroy();
});

test('manual reconnect rebuilds a destroyed initial peer and ignores its stale events',()=>{
  const host=manual(true),old=host.peer;old.emit('error',{type:'network'});old.destroy();
  assert.doesNotThrow(()=>host.reconnect());assert.notEqual(host.peer,old);assert.equal(host.peer.id,'augmentchess-v3-RECOVERY');
  let ready=0;host.on('ready',()=>ready++);old.ready();assert.equal(ready,0);host.peer.ready();assert.equal(ready,1);host.destroy();
});

test('initial signaling timeout rebuilds with backoff and destroy cancels recovery',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const guest=manual(false),first=guest.peer;let message='';guest.on('error',value=>message=value);
  t.mock.timers.tick(15000);assert.equal(first.destroyed,true);assert.match(message,/응답 시간이 초과/);
  t.mock.timers.tick(999);assert.equal(guest.peer,null);t.mock.timers.tick(1);assert.ok(guest.peer);assert.notEqual(guest.peer,first);
  const second=guest.peer;guest.destroy();t.mock.timers.tick(100000);assert.equal(guest.peer,second);assert.equal(second.destroyed,true);
});

test('guest automatically retries a closed connection with the same identity',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const guest=manual(false);guest.peer.ready();const first=guest.conn;first.openNow();first.close();assert.equal(guest.live,false);
  t.mock.timers.tick(999);assert.equal(guest.conn,first);t.mock.timers.tick(1);assert.notEqual(guest.conn,first);assert.equal(guest.conn.metadata.token,'returning-friend');
  guest.conn.openNow();assert.equal(guest.live,true);assert.equal(guest.retryAttempts,0);guest.destroy();
});

test('automatic retries stop after five attempts and manual retry starts a fresh budget',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const guest=manual(false);guest.peer.ready();let message='';guest.on('error',value=>message=value);
  for(const delay of [1000,2000,4000,8000,10000]){guest.peer.emit('error',{type:'peer-unavailable'});t.mock.timers.tick(delay);}
  assert.equal(guest.peer.connections.length,6);guest.peer.emit('error',{type:'peer-unavailable'});assert.match(message,/자동 재연결을 완료하지 못/);
  t.mock.timers.tick(100000);assert.equal(guest.peer.connections.length,6);guest.reconnect();assert.equal(guest.peer.connections.length,7);guest.destroy();
});

test('ICE interruptions pause input, recover within grace, or reconnect after grace',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const guest=manual(false);guest.peer.ready();const first=guest.conn;let connected=0;guest.on('connected',()=>connected++);first.openNow();
  first.emit('iceStateChanged','disconnected');assert.equal(guest.live,false);assert.equal(guest.send({type:'sync'}),false);
  t.mock.timers.tick(3999);first.emit('iceStateChanged','connected');assert.equal(guest.live,true);assert.equal(connected,2);t.mock.timers.tick(1);assert.equal(first.open,true);
  first.emit('iceStateChanged','disconnected');t.mock.timers.tick(4000);assert.equal(first.open,false);t.mock.timers.tick(1000);assert.notEqual(guest.conn,first);
  guest.conn.openNow();assert.equal(guest.live,true);guest.destroy();
});

test('busy rejection stays visible and never loops automatic retries',t=>{
  t.mock.timers.enable({apis:['setTimeout']});
  const guest=manual(false);guest.peer.ready();guest.conn.openNow();const events=[];guest.on('disconnected',()=>events.push('disconnected')).on('error',value=>events.push(value));
  guest.conn.emit('data',{type:'busy'});t.mock.timers.tick(60000);
  assert.equal(guest.live,false);assert.equal(guest.blocked,true);assert.equal(guest.peer.connections.length,1);assert.equal(events.length,1);assert.match(events[0],/이미 진행 중/);guest.destroy();
});
