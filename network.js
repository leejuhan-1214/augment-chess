const PREFIX='augmentchess-v1-';
export function roomCode(){const bytes=crypto.getRandomValues(new Uint8Array(8)),chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(bytes,n=>chars[n%chars.length]).join('');}
// No accounts or camera/microphone permissions. Only the game travels over a data channel.
export class OnlineRoom {
  constructor({host,code,PeerClass=globalThis.Peer,token}){
    this.host=host;this.code=code;this.listeners={};this.live=false;this.closed=false;this.conn=null;this.guestToken=null;this.token=token||crypto.randomUUID();
    if(!PeerClass)throw new Error('온라인 연결 라이브러리를 불러오지 못했습니다. 새로고침해 주세요.');
    this.peer=new PeerClass(host?PREFIX+code:undefined,{debug:0,secure:true});
    this.peer.on('open',()=>{if(this.closed)return;this.emit('ready',code);if(!host)this.connect();});
    this.peer.on('connection',conn=>{if(!host||this.closed){conn.close();return;}
      const token=conn.metadata?.token;
      if(conn.metadata?.app!=='augment-chess-v1'||typeof token!=='string'||token.length>80||!token||(this.guestToken&&this.guestToken!==token)||(this.conn?.open)){
        conn.on('open',()=>{conn.send({type:'busy'});setTimeout(()=>conn.close(),300);});return;
      }
      this.guestToken=token;this.bind(conn);
    });
    this.peer.on('disconnected',()=>{if(!this.closed){this.emit('signaling');try{this.peer.reconnect();}catch{this.emit('error','중계 서버 연결이 끊겼습니다. 다시 연결해 주세요.');}}});
    this.peer.on('error',e=>{if(this.closed)return;const messages={
      'peer-unavailable':'방을 찾을 수 없습니다. 코드를 확인하고 방장이 탭을 열었는지 확인해 주세요.',
      'unavailable-id':'이미 사용 중인 방 코드입니다. 나간 뒤 새 방을 만들어 주세요.',
      'network':'연결 서버에 접속하지 못했습니다. 네트워크를 확인하고 다시 연결해 주세요.',
      'webrtc':'대전 연결에 실패했습니다. 다른 네트워크에서 다시 시도해 주세요.',
      'browser-incompatible':'이 브라우저는 온라인 대전을 지원하지 않습니다. 최신 Chrome, Edge, Safari를 사용해 주세요.'
    };this.emit('error',messages[e.type]||'연결 중 오류가 발생했습니다. 다시 연결해 주세요.');});
  }
  on(name,fn){(this.listeners[name]??=[]).push(fn);return this;}
  emit(name,data){if(!this.closed)for(const fn of this.listeners[name]||[])fn(data);}
  connect(){if(this.closed||this.host)return;if(this.conn?.open)return;this.bind(this.peer.connect(PREFIX+this.code,{reliable:true,serialization:'json',metadata:{app:'augment-chess-v1',token:this.token}}));}
  bind(conn){this.conn=conn;clearTimeout(this.timer);this.timer=setTimeout(()=>{if(!this.live)this.emit('error','연결 시간이 초과됐습니다. 방 코드와 네트워크를 확인한 뒤 다시 연결해 주세요.');},20000);
    conn.on('open',()=>{if(this.closed)return;clearTimeout(this.timer);this.live=true;this.emit('connected');});
    conn.on('data',data=>{if(this.closed||conn!==this.conn||!data||typeof data!=='object')return;if(data.type==='busy'){this.live=false;this.emit('error','이미 진행 중인 방입니다. 다른 방 코드를 이용해 주세요.');return;}this.emit('data',data);});
    conn.on('close',()=>{if(this.closed||conn!==this.conn)return;this.live=false;this.emit('disconnected');});
    conn.on('error',()=>{if(!this.closed&&conn===this.conn){this.live=false;this.emit('error','상대와의 연결이 끊겼습니다. 다시 연결해 주세요.');}});
  }
  send(data){if(this.conn?.open&&this.live){this.conn.send(data);return true;}return false;}
  reconnect(){if(this.closed)return;if(this.peer.disconnected)this.peer.reconnect();else if(!this.host){this.conn?.close();this.connect();}else this.emit('ready',this.code);}
  destroy(){this.closed=true;clearTimeout(this.timer);this.conn?.close();this.peer?.destroy();this.listeners={};this.live=false;}
}
