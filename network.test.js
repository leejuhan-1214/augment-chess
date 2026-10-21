import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {OnlineRoom,roomCode} from './network.js';
import {createGame,reduce} from './engine.js';
const peers=new Map();let counter=0;
class Channel extends EventEmitter{
  constructor(peer,metadata){super();this.peer=peer;this.metadata=metadata;this.open=false;}
  send(data){assert.ok(this.open);queueMicrotask(()=>{if(this.other.open)this.other.emit('data',structuredClone(data));});}
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
