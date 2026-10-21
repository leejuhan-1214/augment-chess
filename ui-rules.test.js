import {test} from 'node:test';
import assert from 'node:assert/strict';
import {position,legalMoves,applyMove} from './engine.js';
import {castleStatus,castleFromRook} from './ui-rules.js';

const sq=s=>(8-Number(s[1]))*8+'abcdefgh'.indexOf(s[0]);
const start=()=>({...position(),phase:'play',result:null});
function move(s,from,to){
  const m=legalMoves(s).find(m=>m.from===sq(from)&&m.to===sq(to));
  assert.ok(m,`${from}–${to} must be legal`);
  return applyMove(s,m);
}
function opening(sequence,aug=[]){
  let s=start();s.aug={w:[...aug],b:[...aug]};
  for(const [from,to] of sequence)s=move(s,from,to);
  return s;
}
const kingOpening=[['e2','e4'],['e7','e5'],['g1','f3'],['b8','c6'],['f1','c4'],['f8','c5']];
const queenOpening=[['d2','d4'],['d7','d5'],['b1','c3'],['b8','c6'],['c1','f4'],['c8','f5'],['d1','d2'],['d8','d7']];
const status=(s,side,color=s.turn)=>castleStatus(s,color).find(item=>item.side===side);
function clear(){const s=start();s.board=Array(64).fill(null);s.board[sq('e1')]={c:'w',t:'k'};s.board[sq('a1')]={c:'w',t:'r'};s.board[sq('h1')]={c:'w',t:'r'};s.board[sq('e8')]={c:'b',t:'k'};return s;}

test('castling controls and rook shortcuts work for both colors from real openings',()=>{
  for(const aug of [[],['k_stride','q_leap','r_edge']]){
    let s=opening(kingOpening,aug);
    assert.equal(status(s,'king').available,true);
    assert.equal(status(s,'king','b').available,false);
    assert.deepEqual(castleFromRook(s,sq('e1'),sq('h1')),legalMoves(s).find(m=>m.castle==='king'));
    s=move(s,'e1','g1');s=move(s,'g8','f6');s=move(s,'d2','d3');
    assert.equal(status(s,'king').available,true);
    assert.equal(castleFromRook(s,sq('e8'),sq('h8')).to,sq('g8'));
    s=move(s,'e8','g8');assert.equal(s.board[sq('f8')].t,'r');
    s=opening(queenOpening,aug);
    assert.equal(status(s,'queen').available,true);
    assert.equal(castleFromRook(s,sq('e1'),sq('a1')).to,sq('c1'));
    s=move(s,'e1','c1');assert.equal(status(s,'queen').available,true);
    assert.equal(castleFromRook(s,sq('e8'),sq('a8')).to,sq('c8'));
    s=move(s,'e8','c8');assert.equal(s.board[sq('d8')].t,'r');
  }
});

test('moving a rook or king away and back permanently blocks the corresponding castle',()=>{
  let s=opening(kingOpening);
  for(const pair of [['h1','f1'],['a7','a6'],['f1','h1'],['a6','a5']])s=move(s,...pair);
  assert.equal(status(s,'king').available,false);assert.match(status(s,'king').reason,/움직인 룩|권리/);
  assert.equal(castleFromRook(s,sq('e1'),sq('h1')),null);
  s=opening(kingOpening);
  for(const pair of [['e1','f1'],['a7','a6'],['f1','e1'],['a6','a5']])s=move(s,...pair);
  assert.ok(castleStatus(s).every(item=>!item.available));assert.match(status(s,'king').reason,/움직인 킹|권리/);
});

test('castling explains occupied paths, check, attacked transit and augmented attacks',()=>{
  assert.match(status(start(),'king').reason,/f1 칸/);
  let s=clear();s.board[sq('e8')]=null;s.board[sq('a8')]={c:'b',t:'k'};s.board[sq('e7')]={c:'b',t:'r'};
  assert.match(status(s,'king').reason,/체크/);
  s=clear();s.board[sq('f8')]={c:'b',t:'r'};assert.match(status(s,'king').reason,/f1 칸이 공격/);
  s=clear();s.board[sq('g8')]={c:'b',t:'r'};assert.match(status(s,'king').reason,/g1 칸이 공격/);
  s=clear();s.board[sq('f2')]={c:'b',t:'n'};
  assert.equal(status(s,'king').available,true);
  s.aug.b=['n_stride'];assert.match(status(s,'king').reason,/f1 칸이 공격/);
  assert.equal(castleFromRook(s,sq('e1'),sq('h1')),null);
});

test('castling controls reject non-play phases, wrong turns and forged shortcuts',()=>{
  const s=clear();assert.equal(castleStatus(null).length,2);
  assert.match(status({...s,phase:'draft'},'king').reason,/증강 선택/);
  assert.match(status({...s,phase:'over',result:{winner:'w'}},'king').reason,/종료/);
  assert.match(status({...s,turn:'b'},'king','w').reason,/차례/);
  assert.equal(castleFromRook(s,sq('h1'),sq('e1')),null);
  assert.equal(castleFromRook(s,sq('e1'),sq('b1')),null);
  assert.equal(castleFromRook(s,'60',63),null);
  s.board[sq('h1')].moved=true;assert.match(status(s,'king').reason,/움직인 룩/);
  s.board[sq('e1')].moved=true;assert.match(status(s,'queen').reason,/움직인 킹/);
});
