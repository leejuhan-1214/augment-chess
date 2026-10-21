import {OTHER,attacked,inCheck,legalMoves,squareName} from './engine.js?v=2.0.0';

// Keep the explanatory controls and the board shortcut subject to the same rules.
export function castleStatus(s,color=s?.turn){
  const home=color==='b'?4:60;
  return [
    {side:'king',from:home,to:home+2,rook:home+3,notation:'O-O',offsets:[1,2],through:[1,2],right:0},
    {side:'queen',from:home,to:home-2,rook:home-4,notation:'O-O-O',offsets:[-1,-2,-3],through:[-1,-2],right:1}
  ].map(({offsets,through,right,...item})=>{
    const blocked=reason=>({...item,available:false,reason});
    if(!s||!['w','b'].includes(color))return blocked('대전을 시작한 뒤 캐슬링할 수 있습니다.');
    if(s.result||s.phase==='over')return blocked('종료된 대전에서는 캐슬링할 수 없습니다.');
    if(s.phase==='draft')return blocked('증강 선택을 먼저 마쳐 주세요.');
    if(s.phase!=='play')return blocked('대전을 시작한 뒤 캐슬링할 수 있습니다.');
    if(s.turn!==color)return blocked('자기 차례에만 캐슬링할 수 있습니다.');
    const king=s.board[home],rook=s.board[item.rook];
    if(king?.c!==color||king.t!=='k')return blocked('킹이 원래 시작 칸에 있어야 합니다.');
    if(king.moved)return blocked('이미 움직인 킹은 캐슬링할 수 없습니다.');
    if(rook?.c!==color||rook.t!=='r')return blocked('해당 룩이 원래 시작 칸에 있어야 합니다.');
    if(rook.moved)return blocked('이미 움직인 룩으로는 캐슬링할 수 없습니다.');
    if(!s.castle?.[color]?.[right])return blocked('킹 또는 해당 룩의 캐슬링 권리를 이미 잃었습니다.');
    if(inCheck(s,color))return blocked('체크를 받고 있을 때는 캐슬링할 수 없습니다.');
    const occupied=offsets.find(offset=>s.board[home+offset]);
    if(occupied!==undefined)return blocked(`${squareName(home+occupied)} 칸의 기물을 먼저 치워 주세요.`);
    const danger=through.find(offset=>attacked(s,home+offset,OTHER(color)));
    if(danger!==undefined)return blocked(`${squareName(home+danger)} 칸이 공격받고 있어 캐슬링할 수 없습니다.`);
    if(!legalMoves(s,color).some(m=>m.from===home&&m.to===item.to&&m.castle===item.side))return blocked('특수능력 또는 킹의 안전 조건 때문에 지금은 캐슬링할 수 없습니다.');
    return {...item,available:true,reason:'킹을 선택한 뒤 룩 또는 도착 칸을 눌러도 됩니다.'};
  });
}

export function castleFromRook(s,from,rook){
  if(!s||!Number.isInteger(from)||!Number.isInteger(rook))return null;
  const candidate=castleStatus(s).find(item=>item.available&&item.from===from&&item.rook===rook);
  return candidate?legalMoves(s).find(m=>m.from===from&&m.to===candidate.to&&m.castle===candidate.side)||null:null;
}
