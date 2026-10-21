import {CARDS,NAMES,OTHER,position,createGame,reduce,legalMoves,inCheck,aiMove,squareName} from './engine.js';
import {OnlineRoom,roomCode} from './network.js';
const $=id=>document.getElementById(id),side=c=>c==='w'?'백':'흑';
const SYMBOLS={w:{k:'♔',q:'♕',r:'♖',b:'♗',n:'♘',p:'♙'},b:{k:'♚',q:'♛',r:'♜',b:'♝',n:'♞',p:'♟'}};
let game=null,mode='lobby',myColor='w',orientation='w',selected=null,targets=[],room=null,aiTimer=null,toastTimer=null,pendingTimer=null,confirmAction=null,soundOn=false,audio=null,networkMessage='',busy=false,aiLevel='normal',pendingMove=false;
// Original vector silhouettes keep pieces crisp on phones and high density screens.
const PATHS={
  p:'M23 9a7 7 0 1 1 0 14a7 7 0 1 1 0-14ZM21 23c-3 4-2 9-6 14h16c-4-5-3-10-6-14ZM13 38h20v5H13Z',
  r:'M11 10h6v6h4v-6h5v6h4v-6h6v13l-5 4 2 11H14l2-11-5-4ZM12 39h23v4H12Z M16 25h15',
  n:'M13 38c0-9 4-12 9-18l-7 4-5-4 9-11 2-5 5 4c10 4 12 17 8 30ZM12 39h24v4H12Z M21 14h1',
  b:'M23 5c-7 7-12 11-9 18 2 5 7 5 7 9l-7 6h19l-7-6c0-4 5-4 7-9 3-7-2-11-10-18ZM21 14l6 8M13 39h21v4H13Z',
  q:'M10 16l6 6 7-9 7 9 7-6-5 20H15ZM13 38h21v5H13Z M7 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0 M20 9a3 3 0 1 0 6 0 3 3 0 1 0-6 0 M34 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',
  k:'M23 4v11M18 9h10M14 18c-3-7-10-1-4 6l7 10h13l7-10c6-7-1-13-4-6-2-8-8-8-10-1-2-7-7-7-9 1ZM15 35h17v5H15ZM13 40h21v4H13Z'
};
function pieceSVG(p){const fill=p.c==='w'?'#f4f0da':'#253b3c',stroke=p.c==='w'?'#4a5b4c':'#a4b8a4';return `<svg viewBox="0 0 46 48" aria-hidden="true"><path d="${PATHS[p.t]}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4500);}
function beep(capture=false){if(!soundOn)return;try{audio??=new (window.AudioContext||window.webkitAudioContext)();audio.resume();const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.type='sine';osc.frequency.setValueAtTime(capture?330:510,audio.currentTime);osc.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.09);gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.13);osc.start();osc.stop(audio.currentTime+.14);}catch{}}
function colorNow(){return game?.phase==='draft'?game.draftTurn:game?.turn;}
function canAct(color=colorNow()){return game&&!game.result&&(!['online'].includes(mode)||room?.live)&&((mode==='local')||color===myColor)&&!busy&&!pendingMove;}
function closeDraft(){if($('draft-dialog').open)$('draft-dialog').close();}
function renderBoard(){const s=game||position(),checkColor=game&&inCheck(s,s.turn)?s.turn:null,frag=document.createDocumentFragment();
  const order=Array.from({length:64},(_,i)=>orientation==='w'?i:63-i);
  for(let j=0;j<64;j++){const i=order[j],r=Math.floor(i/8),c=i%8,p=s.board[i],button=document.createElement('button');button.className='sq'+((r+c)%2?' dark':'');button.dataset.square=String(i);button.title=squareName(i)+(p?' '+side(p.c)+' '+NAMES[p.t]:'');button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',String(selected===i));
    if(game?.last&&(game.last.from===i||game.last.to===i))button.classList.add('last');if(selected===i)button.classList.add('selected');if(p?.t==='k'&&p.c===checkColor)button.classList.add('check');if(targets.some(m=>m.to===i))button.classList.add(p?'capture-hint':'hint');
    if(p)button.innerHTML=pieceSVG(p);if(j%8===0){const label=document.createElement('span');label.className='coord';label.textContent=String(8-r);button.append(label);}if(j>=56){const label=document.createElement('span');label.className='coord file-coord';label.textContent='abcdefgh'[c];button.append(label);}frag.append(button);
  }$('board').replaceChildren(frag);$('board-watermark').hidden=!!game;
}
function renderAugments(){const color=mode==='local'?colorNow()||'w':myColor,ids=game?.aug[color]||[];$('augment-count').textContent=ids.length+' / 3';
  if(!ids.length){$('my-augments').innerHTML='<div class="empty-aug"><span>✧</span><p>가능성은 아직 열려 있어요.<small>대전을 시작하고 첫 증강을 선택하세요.</small></p></div>';return;}
  const frag=document.createDocumentFragment();for(const id of ids){const card=CARDS.find(c=>c.id===id),el=document.createElement('div');el.className='aug-item';el.title=side(color)+': '+card.desc;el.innerHTML=`<span>${SYMBOLS.w[card.icon]}</span><div><strong>${card.name}</strong><small>${card.short}</small></div>`;frag.append(el);}$('my-augments').replaceChildren(frag);
}
function renderHistory(){if(!game?.log.length){$('history').innerHTML='<div class="empty-history">아직 움직임이 없습니다.<br><span>첫 수로 이야기를 시작하세요.</span></div>';return;}
  const frag=document.createDocumentFragment();let row=null;for(const item of game.log){
    if(item.kind==='augment'){const el=document.createElement('div');el.className='history-event';el.textContent='✦ '+side(item.color)+' · '+item.text;frag.append(el);row=null;}
    else if(item.color==='w'){row=document.createElement('div');row.className='history-move';const n=document.createElement('span');n.textContent=Math.ceil(item.ply/2)+'.';const w=document.createElement('span');w.textContent=item.text;const b=document.createElement('span');row.append(n,w,b);frag.append(row);}
    else {if(!row){row=document.createElement('div');row.className='history-move';row.innerHTML='<span></span><span></span><span></span>';frag.append(row);}row.lastElementChild.textContent=item.text;row=null;}
  }$('history').replaceChildren(frag);$('history').scrollTop=$('history').scrollHeight;
}
function renderDraft(){const dialog=$('draft-dialog');if(game?.phase!=='draft'||!canAct(game.draftTurn)){closeDraft();return;}
  const stage=game.aug[game.draftTurn].length;$('draft-stage').textContent='0'+(stage+1)+' / 03';$('draft-title').textContent=(mode==='local'?side(game.draftTurn)+' · ':'')+['당신의 첫 번째 변수.','전략에 날개를 더하세요.','마지막 한 조각을 완성하세요.'][stage];
  $('draft-desc').textContent='하나를 선택하세요. 효과는 즉시 적용되며 이번 대전 내내 유지됩니다.';
  const frag=document.createDocumentFragment();for(const id of game.offers[game.draftTurn]){const card=CARDS.find(c=>c.id===id),button=document.createElement('button');button.className='draft-card'+(card.tier==='전설'?' legendary':'');button.dataset.card=id;button.innerHTML=`<span class="card-top"><span>${card.tier} 증강</span><span>✦</span></span><span class="card-piece">${SYMBOLS.w[card.icon]}</span><span class="sr-only">${card.type}</span><h3>${card.name}</h3><p>${card.desc}</p><span class="card-select">이 증강 선택하기 <span>↗</span></span>`;frag.append(button);}$('draft-cards').replaceChildren(frag);if(!dialog.open)dialog.showModal();
}
function renderPlayers(){const bottom=orientation,top=OTHER(bottom);for(const [where,color] of [['my',bottom],['opponent',top]]){
  const name=mode==='ai'?(color==='w'?'당신':'연습 상대 · AI'):mode==='local'?(side(color)+' 플레이어'):mode==='online'?(color===myColor?'당신':'친구'):(where==='my'?'당신':'도전자');
  $(where+'-name').textContent=name;$(where+'-tag').textContent=color==='w'?'WHITE':'BLACK';const avatar=$(where+'-avatar');avatar.className='player-avatar '+(color==='w'?'light-avatar':'dark-avatar');avatar.textContent=SYMBOLS[color].k;
  const aug=game?.aug[color]||[];$(where+'-sub').textContent=aug.length?aug.map(id=>CARDS.find(c=>c.id===id).name).join(' · '):game?(color==='w'?'백 · 먼저 움직입니다':'흑 · 기회를 기다립니다'):(where==='my'?'가능성을 움직이세요':'당신의 한 수를 기다립니다');
  if(game){const counts={p:8,r:2,n:2,b:2,q:1};const remaining=game.board.filter(p=>p?.c===OTHER(color));$(where+'-captured').textContent=Object.entries(counts).map(([t,n])=>SYMBOLS[OTHER(color)][t].repeat(Math.max(0,n-remaining.filter(p=>p.t===t).length))).join('');}else $(where+'-captured').textContent='';
}}
function render(){renderBoard();renderPlayers();renderAugments();renderHistory();$('mode-badge').textContent=({lobby:'LOBBY',ai:'VS AI',local:'LOCAL',online:'ONLINE'})[mode];$('round-count').textContent=game?'ROUND '+String(Math.floor(game.ply/2)+1).padStart(2,'0'):'ROUND —';
  document.querySelectorAll('.timeline-item').forEach((el,i)=>el.classList.toggle('active',!!game&&(game.aug.w.length>i||game.aug.b.length>i)));
  $('lobby').hidden=mode==='online'||!!game;$('room-panel').hidden=mode!=='online';$('game-actions').hidden=!game||!!game.result||(mode==='online'&&!room?.live);$('draw-answer').hidden=!game?.drawOffer||game.drawOffer===myColor||mode==='local';$('draw').disabled=!!game?.drawOffer; $('rematch').hidden=!game?.result;$('rematch-status').hidden=!game?.result||mode!=='online'||!game?.rematch.length;
  if(game?.result){$('status-icon').textContent=game.result.winner?'♛':'½';$('status-title').textContent=game.result.winner?(mode==='local'?side(game.result.winner)+' 승리!':game.result.winner===myColor?'멋진 승리입니다.':'다음 수를 준비해요.'):'무승부';$('status-desc').textContent=game.result.reason;$('rematch-status').textContent=game.rematch.includes(myColor)?'친구의 재대결 수락을 기다립니다.':'친구가 재대결을 신청했습니다.';$('rematch').disabled=mode==='online'&&(!room?.live||game.rematch.includes(myColor));}
  else if(mode==='online'&&!room?.live){$('status-icon').textContent='↔';$('status-title').textContent=game?'연결이 잠시 멈췄어요.':'친구를 초대하세요.';$('status-desc').textContent=game?'다시 연결하면 이 포지션에서 계속합니다.':'방 코드나 초대 링크를 공유하면 대전이 시작됩니다.';}
  else if(game){$('status-icon').textContent=game.phase==='draft'?'✦':inCheck(game,game.turn)?'!':SYMBOLS[game.turn].k;$('status-title').textContent=game.phase==='draft'?(canAct(game.draftTurn)?'증강을 선택하세요.':side(game.draftTurn)+'의 증강 선택 중'):inCheck(game,game.turn)?side(game.turn)+' 킹이 체크입니다.':side(game.turn)+'의 차례입니다.';$('status-desc').textContent=game.phase==='draft'?'세 가지 가능성 중 하나가 새로운 전략이 됩니다.':mode==='ai'&&game.turn==='b'?'AI가 다음 수를 생각하고 있습니다.':canAct()?'기물을 선택하면 이동할 수 있는 칸이 표시됩니다.':'상대의 한 수를 기다려 주세요.';}
  else{$('status-icon').textContent='✦';$('status-title').textContent='전략에 변수를 더하다.';$('status-desc').textContent='기물의 능력을 바꾸는 증강을 골라 나만의 플레이를 만들어보세요.';}
  $('board-note').innerHTML='<i></i>';const note=document.createTextNode(!game?'READY WHEN YOU ARE':game.result?'MATCH COMPLETE':mode==='online'&&!room?.live?'CONNECTION PAUSED':game.phase==='draft'?'CHOOSE YOUR AUGMENT':side(game.turn)+'의 차례 · '+(mode==='online'?'ONLINE MATCH':'AUGMENT CHESS'));$('board-note').append(note);
  if(mode==='online'){$('room-heading').textContent=room?.live?'친구와 대전 중':game?'다시 연결을 기다리는 중':'친구를 기다리는 중';$('connection-status').textContent=networkMessage;$('connection-dot').style.background=room?.live?'#a6bf94':'#d6ba80';$('reconnect').hidden=!!room?.live||!room;}
  renderDraft();scheduleAI();
}
function scheduleAI(){clearTimeout(aiTimer);if(mode!=='ai'||!game||game.result||colorNow()!=='b')return;const rev=game.rev;aiTimer=setTimeout(()=>{if(mode!=='ai'||!game||game.rev!==rev)return;if(game.phase==='draft'){
    const ranked=['q_leap','n_stride','b_guard','r_edge','k_stride','p_fang','p_march','p_retreat'];const id=[...game.offers.b].sort((a,b)=>ranked.indexOf(a)-ranked.indexOf(b))[0];commit({type:'choose',id},'b');
  }else{const move=aiMove(game,aiLevel);if(move)commit({type:'move',from:move.from,to:move.to,promotion:'q'},'b');}},game.phase==='draft'?900:550);}
function commit(action,color=myColor){if(!game||!action)return;action={rev:game.rev,...action};if(mode==='online'&&!room?.live){toast('상대와 다시 연결한 뒤 계속할 수 있습니다.');return;}
  if(mode==='online'&&!room.host){if(pendingMove)return;pendingMove=true;room.send({type:'action',action});selected=null;targets=[];render();clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>{if(pendingMove){pendingMove=false;room?.send({type:'sync'});toast('동기화를 다시 요청했습니다.');render();}},4000);return;}
  const next=reduce(game,action,color);if(!next)return;const wasMove=action.type==='move';game=next;selected=null;targets=[];if(wasMove)beep();if(mode==='online'){if(game.rematch.length===2){game=createGame(crypto.getRandomValues(new Uint32Array(1))[0]);toast('새 대전이 시작됐습니다.');}room.send({type:'state',game});}render();
}
function acceptState(next){if(!next||!Array.isArray(next.board)||next.board.length!==64||!Number.isInteger(next.rev)||!['draft','play','over'].includes(next.phase))return;const moved=game&&next.ply!==game.ply;game=next;clearTimeout(pendingTimer);pendingMove=false;selected=null;targets=[];if(moved)beep();render();}
function showConfirm(title,desc,fn){closeDraft();$('confirm-title').textContent=title;$('confirm-desc').textContent=desc;confirmAction=fn;$('confirm-dialog').showModal();}
function disconnect(){room?.destroy();room=null;clearTimeout(pendingTimer);pendingMove=false;networkMessage='';clearTimeout(aiTimer);}
function reset(){disconnect();game=null;mode='lobby';selected=null;targets=[];orientation='w';myColor='w';closeDraft();const url=new URL(location.href);url.hash='';history.replaceState(null,'',url);render();}
function practice(nextMode){disconnect();mode=nextMode;myColor='w';orientation='w';game=createGame(crypto.getRandomValues(new Uint32Array(1))[0]);selected=null;targets=[];render();}
function startOnline(host,code){disconnect();mode='online';game=null;myColor=host?'w':'b';orientation=myColor;selected=null;targets=[];networkMessage='온라인 연결 서버에 접속하고 있습니다.';$('room-code').textContent=code;
  const url=new URL(location.href);url.hash='room='+code;history.replaceState(null,'',url);render();
  let token;try{token=sessionStorage.getItem('ac-token-'+code)||crypto.randomUUID();sessionStorage.setItem('ac-token-'+code,token);}catch{token=crypto.randomUUID();}
  try{room=new OnlineRoom({host,code,token});}catch(e){networkMessage=e.message;toast(networkMessage);render();return;}
  room.on('ready',()=>{networkMessage=host?'방이 열렸습니다. 초대 링크를 친구에게 보내주세요.':'방장에게 연결하고 있습니다.';render();})
    .on('connected',()=>{networkMessage='연결 완료 · 모든 이동이 실시간으로 동기화됩니다.';pendingMove=false;if(host){if(!game)game=createGame(crypto.getRandomValues(new Uint32Array(1))[0]);room.send({type:'state',game});}else room.send({type:'sync'});render();toast('친구와 연결됐습니다.');})
    .on('data',data=>{if(data.type==='action'&&host){commit(data.action,'b');room.send({type:'state',game});}else if(data.type==='sync'&&host)room.send({type:'state',game});else if(data.type==='state'&&!host)acceptState(data.game);})
    .on('disconnected',()=>{pendingMove=false;networkMessage='상대와 연결이 끊겼습니다. 같은 방 코드로 다시 연결하면 이어집니다.';render();toast('연결이 끊겨 대전을 일시 정지했습니다.');})
    .on('signaling',()=>{networkMessage=room.live?'대전 연결 유지 중 · 중계 서버에 재접속합니다.':'중계 서버에 다시 연결하고 있습니다.';render();})
    .on('error',message=>{pendingMove=false;networkMessage=message;render();toast(message);});
}
function onSquare(i){if(!game||game.phase!=='play'||!canAct())return;const p=game.board[i],m=targets.find(x=>x.to===i);if(m){const moving=game.board[m.from];if(moving.t==='p'&&Math.floor(m.to/8)===(moving.c==='w'?0:7)){showPromotion(m);return;}commit({type:'move',from:m.from,to:m.to},mode==='local'?game.turn:myColor);return;}
  if(p?.c===game.turn){selected=selected===i?null:i;targets=selected===null?[]:legalMoves(game).filter(m=>m.from===i);renderBoard();}else{selected=null;targets=[];renderBoard();}
}
function showPromotion(m){$('info-title').textContent='폰을 승급하세요';$('info-content').replaceChildren();for(const t of ['q','r','b','n']){const btn=document.createElement('button');btn.className='button secondary';btn.style.marginTop='10px';btn.textContent=SYMBOLS[game.turn][t]+' '+NAMES[t];btn.onclick=()=>{$('info-dialog').close();commit({type:'move',from:m.from,to:m.to,promotion:t},mode==='local'?game.turn:myColor);};$('info-content').append(btn);}$('info-dialog').showModal();}
function guide(){closeDraft();$('info-title').textContent='체스에, 가능성을 더하다.';$('info-content').innerHTML=`<h3>01 / 친구와 같은 체스판으로</h3><p>온라인 방을 만들고 초대 링크나 8자리 코드를 친구에게 보내세요. 방장은 백, 친구는 흑입니다. 양쪽이 연결되면 증강 선택부터 시작합니다. 계정은 필요하지 않습니다.</p><h3>02 / 세 번의 선택, 다른 전략</h3><p>대전 시작 전, 6라운드 종료 후, 12라운드 종료 후에 각각 증강 하나를 고릅니다. 백 다음 흑 순서로 선택하며 총 세 가지 효과가 중첩됩니다. 선택 즉시 적용되며 상대의 증강은 플레이어 이름 아래와 기록에서 확인할 수 있습니다. 증강으로 새 체크가 생길 수도 있습니다.</p><h3>03 / 기본은 체스</h3><p>기물을 클릭하고 표시된 칸을 클릭해 이동합니다. 체크메이트로 승리하며, 캐슬링·앙파상·선택 승급을 지원합니다. 증강의 추가 공격 범위도 체크에 반영됩니다. 50수 규칙, 동일 포지션 3회 반복, 스테일메이트를 판정합니다. 증강이 없는 기본 포지션에서는 기물 부족도 판정합니다.</p><h3>알아두세요</h3><ul><li>온라인 대전은 방 코드로 초대한 친구와 하는 1:1 대전입니다. 자동 매칭과 랭킹은 없습니다.</li><li>대전 중에는 두 사람 모두 탭을 유지하세요. 잠시 끊기면 다시 연결할 수 있지만 방장 탭을 새로고침하거나 닫으면 대전이 사라집니다.</li><li>PeerJS 공용 중계 서버를 통해 연결합니다. 게임 데이터는 WebRTC로 전달되며, 일부 회사·학교·모바일 네트워크에서는 연결되지 않을 수 있습니다.</li><li>폰의 세 칸 전진은 앙파상 대상이 아닙니다. 뒤로 물러나 시작 줄에 돌아와도 첫 이동 혜택은 다시 생기지 않습니다.</li><li>AI 연습과 로컬 2인 대전은 인터넷 연결 없이도 게임 규칙이 동작합니다.</li></ul><p><a href="https://peerjs.com/client/getting-started" target="_blank" rel="noopener">PeerJS 연결 방식 ↗</a></p>`;$('info-dialog').showModal();}
function allCards(){closeDraft();$('info-title').textContent='여덟 가지 새로운 가능성.';const frag=document.createDocumentFragment();for(const card of CARDS){const el=document.createElement('article');el.className='info-card';el.innerHTML=`<h3>${SYMBOLS.w[card.icon]} ${card.name} <small>· ${card.tier}</small></h3><p>${card.desc}</p>`;frag.append(el);}$('info-content').replaceChildren(frag);$('info-dialog').showModal();}
$('board').addEventListener('click',e=>{const sq=e.target.closest('[data-square]');if(sq)onSquare(Number(sq.dataset.square));});
$('draft-cards').addEventListener('click',e=>{const el=e.target.closest('[data-card]');if(el&&canAct())commit({type:'choose',id:el.dataset.card},mode==='local'?game.draftTurn:myColor);});
$('draft-dialog').addEventListener('cancel',e=>e.preventDefault());
$('create-room').onclick=()=>startOnline(true,roomCode());
$('join-form').onsubmit=e=>{e.preventDefault();const code=$('room-input').value.trim().toUpperCase();if(!/^[A-Z0-9]{8}$/.test(code)){toast('8자리 영문·숫자 방 코드를 입력해 주세요.');return;}startOnline(false,code);};
$('play-ai').onclick=()=>practice('ai');$('play-local').onclick=()=>practice('local');
$('flip').onclick=()=>{orientation=OTHER(orientation);renderBoard();renderPlayers();};
$('sound').onclick=()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'♪':'♫';$('sound').setAttribute('aria-label',soundOn?'소리 끄기':'소리 켜기');$('sound').title=soundOn?'소리 끄기':'소리 켜기';toast(soundOn?'이동 소리를 켰습니다.':'이동 소리를 껐습니다.');if(soundOn)beep();};
$('new-game').onclick=()=>{if(!game&&!room){toast('대전 모드를 선택해 주세요.');return;}showConfirm('로비로 돌아갈까요?','현재 대전이 종료됩니다. 온라인 방을 나가면 상대와 연결이 끊깁니다.',reset);};
$('leave-room').onclick=()=>showConfirm('방을 나갈까요?','상대와 연결이 끊기며 이 기기의 대전 기록이 사라집니다.',reset);
$('reconnect').onclick=()=>{if(!room){const code=$('room-code').textContent;startOnline(myColor==='w',code);return;}networkMessage='다시 연결하고 있습니다.';room.reconnect();render();};
async function copy(text){try{await navigator.clipboard.writeText(text);toast('복사했습니다. 친구에게 보내주세요.');}catch{$('info-title').textContent='초대 정보';$('info-content').textContent=text;$('info-dialog').showModal();}}
$('copy-link').onclick=()=>copy(new URL('./',location.href).href+'#room='+$('room-code').textContent);$('copy-code').onclick=()=>copy($('room-code').textContent);
$('resign').onclick=()=>showConfirm('이번 대전을 기권할까요?','상대의 승리로 대전이 종료됩니다.',()=>commit({type:'resign'},mode==='local'?game.turn:myColor));
$('draw').onclick=()=>{if(mode==='ai'){toast('AI 대전에서는 기권 또는 새 게임을 이용해 주세요.');return;}if(mode==='local')showConfirm('무승부에 동의하나요?','두 플레이어가 동의하면 대전을 무승부로 끝냅니다.',()=>{commit({type:'draw'},'w');commit({type:'draw'},'b');});else commit({type:'draw'});};
$('accept-draw').onclick=()=>commit({type:'draw'});$('decline-draw').onclick=()=>commit({type:'decline'});
$('rematch').onclick=()=>{if(mode==='online')commit({type:'rematch'});else practice(mode);};
$('confirm-cancel').onclick=()=>{$('confirm-dialog').close();confirmAction=null;renderDraft();};$('confirm-ok').onclick=()=>{$('confirm-dialog').close();const fn=confirmAction;confirmAction=null;fn?.();};$('confirm-dialog').addEventListener('cancel',()=>{confirmAction=null;setTimeout(renderDraft,0);});
$('howto').onclick=guide;$('all-cards').onclick=allCards;$('close-info').onclick=()=>{$('info-dialog').close();renderDraft();};$('info-dialog').addEventListener('cancel',()=>setTimeout(renderDraft,0));
window.addEventListener('beforeunload',e=>{if(mode==='online'&&room?.live&&!game?.result){e.preventDefault();e.returnValue='';}});
render();
const invite=new URLSearchParams(location.hash.slice(1)).get('room');if(invite&&/^[a-z0-9]{8}$/i.test(invite)){$('room-input').value=invite.toUpperCase();toast('초대된 방 코드가 입력됐습니다. 화살표를 눌러 참여하세요.');}
