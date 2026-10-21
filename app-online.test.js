import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {createGame,reduce} from './engine.js';
import {snapshotDecision} from './online-session.js';

// Exercise the shipped controller functions, without starting a browser or PeerJS.
// Rendering and transport are observation boundaries; game rules and snapshot
// decisions remain the real implementations.
const source=readFileSync(new URL('./app.js',import.meta.url),'utf8');
function between(start,end){
  const from=source.indexOf(start),to=source.indexOf(end,from+start.length);
  assert.ok(from>=0&&to>from,`controller section exists: ${start}`);
  return source.slice(from,to);
}
const controller=[
  between('const onlineReady=','// Original vector'),
  between('function commit(','function showConfirm('),
  between('function disconnect(','function reset('),
  between('function startOnline(','function onSquare(')
].join('\n');

function playable(turn='b'){
  const game=createGame(77);
  game.phase='play';game.draftTurn=null;game.turn=turn;
  return game;
}
function harness({host=false,game=playable(),sequence=10,send=()=>true}={}){
  const sent=[],toasts=[],saved=[],timers=new Map(),elements=new Map();
  let timerId=0,request=0,renders=0;
  class FakeRoom {
    constructor(options){Object.assign(this,{live:true,handlers:{},guestToken:null},options);}
    on(event,fn){this.handlers[event]=fn;return this;}
    send(data){sent.push(structuredClone(data));return send(data);}
    destroy(){this.live=false;}
  }
  const context={
    game,mode:'online',myColor:host?'w':'b',orientation:'b',selected:12,
    targets:[{from:12,to:20}],activeSkill:'story_wall',sequence,synced:true,
    pendingMove:false,pendingActionId:null,pendingTimer:null,aiTimer:null,
    networkMessage:'',OnlineRoom:FakeRoom,createGame,reduce,snapshotDecision,
    URL,location:{href:'https://example.test/augment-chess/'},history:{replaceState(){}},
    crypto:{randomUUID:()=>`request-${++request}`,getRandomValues(array){array[0]=1234;return array;}},
    sessions:{save:value=>saved.push(structuredClone(value)),token:()=> 'guest-token',clear(){}},
    $(id){if(!elements.has(id))elements.set(id,{textContent:''});return elements.get(id);},
    render(){renders++;},toast:message=>toasts.push(message),beep(){},
    setTimeout(fn,delay){const id=++timerId;timers.set(id,{fn,delay});return id;},
    clearTimeout(id){timers.delete(id);}
  };
  context.room=new FakeRoom({host,code:'ROOM1234',token:'guest-token'});
  vm.createContext(context);vm.runInContext(controller,context,{filename:'app.js online controller'});
  return {context,sent,toasts,saved,timers,get renders(){return renders;},ready(){return vm.runInContext('onlineReady()',context);},fireTimer(id=context.pendingTimer){
    const timer=timers.get(id);assert.ok(timer,'expected timer exists');timers.delete(id);timer.fn();
  }};
}

test('guest send failure leaves the board unchanged and does not wait for an acknowledgment',()=>{
  const h=harness({send:()=>false}),c=h.context,before=JSON.stringify(c.game);
  assert.equal(c.commit({type:'move',from:12,to:28}),false);
  assert.equal(JSON.stringify(c.game),before);assert.equal(c.pendingMove,false);
  assert.equal(c.pendingActionId,null);assert.equal(c.synced,false);assert.equal(h.timers.size,0);
  assert.equal(h.sent.length,1);assert.equal(h.sent[0].type,'action');
  assert.match(c.networkMessage,/전송하지 못/);assert.equal(h.toasts.length,0);
});

test('duplicate and older snapshots preserve the current board, selection and armed ability',()=>{
  const h=harness(),c=h.context,original=c.game,targets=c.targets;
  c.acceptState(structuredClone(original),{sequence:10});
  const old=createGame(1);c.acceptState(old,{sequence:9});
  assert.equal(c.game,original);assert.equal(c.selected,12);assert.equal(c.targets,targets);
  assert.equal(c.activeSkill,'story_wall');assert.equal(c.sequence,10);assert.equal(h.renders,0);
});

test('an unrelated duplicate cannot acknowledge or unlock a pending guest action',()=>{
  const h=harness(),c=h.context;
  assert.equal(c.commit({type:'move',from:12,to:28}),true);
  const id=c.pendingActionId,timer=c.pendingTimer,renders=h.renders;
  c.acceptState(structuredClone(c.game),{sequence:10,ack:'different-request'});
  assert.equal(c.pendingMove,true);assert.equal(c.pendingActionId,id);
  assert.equal(c.pendingTimer,timer);assert.ok(h.timers.has(timer));assert.equal(h.renders,renders);
});

test('a matching acknowledgment clears pending state even when the board is unchanged',()=>{
  const h=harness(),c=h.context,original=c.game;
  c.commit({type:'move',from:12,to:28});const requestId=c.pendingActionId;
  c.acceptState(structuredClone(original),{sequence:10,ack:requestId,rejected:true});
  assert.equal(c.game,original);assert.equal(c.pendingMove,false);assert.equal(c.pendingActionId,null);
  assert.equal(c.synced,true);assert.equal(h.timers.size,0);assert.match(h.toasts.at(-1),/적용하지 못/);
});

test('a newer acknowledged state applies once and a repeated packet does not rerender',()=>{
  const h=harness(),c=h.context;
  c.commit({type:'move',from:12,to:28});const requestId=c.pendingActionId;
  const next=reduce(c.game,{type:'move',from:12,to:28,rev:c.game.rev},'b');assert.ok(next);
  c.acceptState(next,{sequence:11,ack:requestId});
  assert.equal(c.game,next);assert.equal(c.sequence,11);assert.equal(c.pendingMove,false);
  assert.equal(h.timers.size,0);assert.equal(h.saved.length,1);
  c.selected=52;c.activeSkill='binding_chain';const renders=h.renders;
  c.acceptState(structuredClone(next),{sequence:11,ack:requestId});
  assert.equal(h.renders,renders);assert.equal(c.selected,52);assert.equal(c.activeSkill,'binding_chain');
});

test('slow guest action requests a correlated sync and stays locked until the reply',()=>{
  const h=harness(),c=h.context;
  c.commit({type:'move',from:12,to:28});const requestId=c.pendingActionId;
  assert.equal(h.timers.get(c.pendingTimer).delay,5000);h.fireTimer();
  assert.equal(c.synced,false);assert.equal(c.pendingMove,true);
  assert.equal(h.sent.at(-1).type,'sync');assert.equal(h.sent.at(-1).requestId,requestId);
  assert.equal(h.timers.get(c.pendingTimer).delay,10000);
  c.acceptState(structuredClone(c.game),{sequence:10,ack:requestId});
  assert.equal(c.pendingMove,false);assert.equal(c.synced,true);assert.equal(h.timers.size,0);
});

test('failed sync transmission does not report a successful retry or keep a pending timer',()=>{
  const h=harness({send:data=>data.type!=='sync'}),c=h.context;
  c.commit({type:'move',from:12,to:28});h.fireTimer();
  assert.equal(c.pendingMove,false);assert.equal(c.pendingActionId,null);assert.equal(c.synced,false);
  assert.equal(h.timers.size,0);assert.match(c.networkMessage,/전송이 중단/);assert.equal(h.toasts.length,0);
});

test('initial guest synchronization cannot unlock play until a valid snapshot arrives',()=>{
  const h=harness({game:null,sequence:0}),c=h.context;c.synced=false;
  c.waitForState();assert.equal(h.ready(),false);h.fireTimer();
  assert.equal(h.sent.at(-1).type,'sync');assert.equal(h.ready(),false);
  c.acceptState(createGame(2),{sequence:1});
  assert.equal(h.ready(),true);assert.equal(c.sequence,1);assert.equal(h.timers.size,0);
});

test('rematch snapshot with a higher room sequence may reset revision, but the previous game cannot return',()=>{
  const ended=playable();ended.rev=44;ended.phase='over';ended.result={winner:null,reason:'합의 무승부'};
  const h=harness({game:ended,sequence:80}),c=h.context,next=createGame(22);
  c.acceptState(next,{sequence:81});assert.equal(c.game,next);assert.equal(c.game.rev,0);assert.equal(c.sequence,81);
  c.selected=52;const renders=h.renders;
  c.acceptState(ended,{sequence:80});
  assert.equal(c.game,next);assert.equal(c.selected,52);assert.equal(h.renders,renders);
});

function startHost(h,game=playable(),sequence=10){
  h.context.startOnline(true,'ROOM1234',{game,sequence,token:'host-token',guestToken:'guest-token'});
  assert.equal(typeof h.context.room.handlers.data,'function');
  return h.context.room.handlers.data;
}

test('actual host data handler emits exactly one acknowledged snapshot for a successful guest action',()=>{
  const h=harness({host:true}),c=h.context,onData=startHost(h);
  onData({type:'action',requestId:'guest-move',action:{type:'move',from:12,to:28,rev:0}});
  assert.equal(c.game.rev,1);assert.equal(c.sequence,11);assert.equal(h.sent.length,1);
  assert.equal(h.sent[0].type,'state');assert.equal(h.sent[0].sequence,11);
  assert.equal(h.sent[0].ack,'guest-move');assert.equal(h.sent[0].rejected,false);
  assert.equal(h.sent[0].game.board[28].c,'b');assert.equal(h.sent[0].game.board[12],null);
});

test('actual host data handler rejects a stale action with one correlated unchanged snapshot',()=>{
  const h=harness({host:true}),c=h.context,onData=startHost(h),before=JSON.stringify(c.game);
  onData({type:'action',requestId:'stale-move',action:{type:'move',from:12,to:28,rev:-1}});
  assert.equal(JSON.stringify(c.game),before);assert.equal(c.sequence,10);assert.equal(h.sent.length,1);
  assert.equal(h.sent[0].ack,'stale-move');assert.equal(h.sent[0].rejected,true);assert.equal(h.toasts.length,0);
});

test('host rematch sends its new revision-zero game once with a higher persistent room sequence',()=>{
  const ended=playable();ended.rev=44;ended.phase='over';ended.result={winner:null,reason:'합의 무승부'};ended.rematch=['w'];
  const h=harness({host:true}),c=h.context,onData=startHost(h,ended,80);
  onData({type:'action',requestId:'rematch',action:{type:'rematch',rev:44}});
  assert.equal(c.sequence,81);assert.equal(c.game.rev,0);assert.equal(c.game.phase,'draft');
  assert.equal(h.sent.length,1);assert.equal(h.sent[0].sequence,81);assert.equal(h.sent[0].game.rev,0);
  assert.equal(h.sent[0].ack,'rematch');assert.equal(h.sent[0].rejected,false);
});
