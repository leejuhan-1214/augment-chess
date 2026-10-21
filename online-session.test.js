import test from 'node:test';
import assert from 'node:assert/strict';
import {createSessionStore,snapshotDecision} from './online-session.js';
import {createGame,reduce} from './engine.js';
const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};};
test('a guest keeps its room identity across a new tab and migrates existing session tokens',()=>{
  const local=memory(),session=memory();session.setItem('ac-token-ROOM1234','old-guest');
  const one=createSessionStore({local,session,newId:()=> 'new'});
  assert.equal(one.token('ROOM1234'),'old-guest');
  const two=createSessionStore({local,session:memory(),newId:()=> 'different'});
  assert.equal(two.token('ROOM1234'),'old-guest');assert.equal(two.token('OTHER123'),'different');
});
test('reload restores role, guest reservation, sequence and full board; leaving clears restoration',()=>{
  const session=memory(),store=createSessionStore({local:memory(),session,now:()=>1000});
  const value={code:'ROOM1234',host:true,token:'host',guestToken:'friend',sequence:18,game:createGame(20)};
  assert.equal(store.save(value),true);assert.deepEqual(store.load('ROOM1234'),{...value,savedAt:1000});
  assert.equal(store.load('OTHER123'),null);store.clear();assert.equal(store.load(),null);
});
test('expired, corrupt and unavailable browser storage does not prevent online play',()=>{
  const session=memory();session.setItem('ac-active-v3','broken JSON');
  assert.equal(createSessionStore({session}).load(),null);
  const value={code:'ROOM1234',host:false,token:'guest',guestToken:null,sequence:1,game:createGame(1)};
  createSessionStore({session,now:()=>1}).save(value);
  assert.equal(createSessionStore({session,now:()=>86400002}).load(),null);
  const blocked={getItem(){throw Error();},setItem(){throw Error();},removeItem(){throw Error();}};
  const store=createSessionStore({local:blocked,session:blocked,newId:()=> 'ephemeral'});
  assert.equal(store.token('ROOM1234'),'ephemeral');assert.equal(store.save(value),false);assert.equal(store.load(),null);store.clear();
});
test('old and duplicate snapshots cannot roll back moves; a rematch with a higher sequence can reset revision',()=>{
  const game=createGame(4),next=reduce(game,{type:'choose',id:game.offers.w[0],rev:0},'w');
  assert.equal(snapshotDecision(next,game,12,11),'ignore');
  assert.equal(snapshotDecision(next,next,12,12),'duplicate');
  assert.equal(snapshotDecision(next,game,12,13),'accept');
  assert.equal(snapshotDecision(null,game,0,1),'accept');
  assert.equal(snapshotDecision(next,{board:[]},12,13),'ignore');
  assert.equal(snapshotDecision(next,game,12,undefined),'ignore');
});
