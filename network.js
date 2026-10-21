const PREFIX='augmentchess-v3-',PROTOCOL='augment-chess-v3';
// PeerJS's JSON transport rejects messages at 16,300 bytes. Bound each packet
// well below that limit, including JSON escaping of its string contents.
const CHUNK_CHARS=1200,MAX_MESSAGE_BYTES=2*1024*1024,MAX_BUFFER_BYTES=4*1024*1024;
const MAX_PARTS=1800,MAX_PENDING=8,MAX_RECENT=128,PACKET_TTL=30000;
const encoder=new TextEncoder();
export function roomCode(){const bytes=crypto.getRandomValues(new Uint8Array(8)),chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(bytes,n=>chars[n%chars.length]).join('');}
// No accounts or camera/microphone permissions. Only the game travels over a data channel.
export class OnlineRoom {
  constructor({host,code,PeerClass=globalThis.Peer,token}){
    this.host=host;this.code=code;this.listeners={};this.live=false;this.closed=false;this.conn=null;this.guestToken=null;this.token=token||crypto.randomUUID();
    this.packetSession=crypto.randomUUID();this.packetSequence=0;this.pendingPackets=new Map();this.completedPackets=new Map();this.pendingBytes=0;
    if(!PeerClass)throw new Error('온라인 연결 라이브러리를 불러오지 못했습니다. 새로고침해 주세요.');
    this.peer=new PeerClass(host?PREFIX+code:undefined,{debug:0,secure:true});
    this.peer.on('open',()=>{if(this.closed)return;this.emit('ready',code);if(!host)this.connect();});
    this.peer.on('connection',conn=>{if(!host||this.closed){conn.close();return;}
      const token=conn.metadata?.token;
      if(conn.metadata?.app!==PROTOCOL||typeof token!=='string'||token.length>80||!token||(this.guestToken&&this.guestToken!==token)||(this.conn?.open)){
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
  connect(){if(this.closed||this.host)return;if(this.conn?.open)return;this.bind(this.peer.connect(PREFIX+this.code,{reliable:true,serialization:'json',metadata:{app:PROTOCOL,token:this.token}}));}
  clearPackets(){for(const packet of this.pendingPackets.values())clearTimeout(packet.timer);this.pendingPackets.clear();this.completedPackets.clear();this.pendingBytes=0;}
  rememberPacket(id){const now=Date.now();for(const [key,expires] of this.completedPackets)if(expires<=now)this.completedPackets.delete(key);this.completedPackets.set(id,now+PACKET_TTL);while(this.completedPackets.size>MAX_RECENT)this.completedPackets.delete(this.completedPackets.keys().next().value);}
  dropPacket(id,remember=false){const packet=this.pendingPackets.get(id);if(packet){clearTimeout(packet.timer);this.pendingBytes-=packet.bytes;this.pendingPackets.delete(id);}if(remember)this.rememberPacket(id);}
  receivePacket(data){
    const {id,part,total,content}=data,validId=typeof id==='string'&&/^[a-zA-Z0-9-]{1,80}$/.test(id);
    if(!validId)return;
    if(!Number.isInteger(part)||!Number.isInteger(total)||total<1||total>MAX_PARTS||part<0||part>=total||typeof content!=='string'||!content.length||content.length>CHUNK_CHARS){this.dropPacket(id,true);return;}
    const completed=this.completedPackets.get(id);if(completed>Date.now())return;if(completed)this.completedPackets.delete(id);
    let packet=this.pendingPackets.get(id);
    if(!packet){
      if(part!==0||this.pendingPackets.size>=MAX_PENDING){this.rememberPacket(id);return;}
      packet={total,next:0,parts:[],bytes:0,timer:null};
      packet.timer=setTimeout(()=>{if(this.pendingPackets.get(id)===packet)this.dropPacket(id,true);},PACKET_TTL);packet.timer.unref?.();
      this.pendingPackets.set(id,packet);
    }
    if(total!==packet.total){this.dropPacket(id,true);return;}
    // Reliable data channels preserve order. Identical duplicates are harmless;
    // missing, conflicting, or out-of-order fragments never become game data.
    if(part<packet.next){if(packet.parts[part]!==content)this.dropPacket(id,true);return;}
    if(part!==packet.next){this.dropPacket(id,true);return;}
    const bytes=encoder.encode(content).byteLength;
    if(packet.bytes+bytes>MAX_MESSAGE_BYTES||this.pendingBytes+bytes>MAX_BUFFER_BYTES){this.dropPacket(id,true);return;}
    packet.parts.push(content);packet.next++;packet.bytes+=bytes;this.pendingBytes+=bytes;
    if(packet.next!==total)return;
    const text=packet.parts.join('');this.dropPacket(id,true);
    try{const value=JSON.parse(text);if(value&&typeof value==='object'&&!Array.isArray(value)&&typeof value.type==='string'&&value.type!=='packet')this.emit('data',value);}catch{}
  }
  transportError(message){this.live=false;this.clearPackets();try{this.conn?.close();}catch{}this.emit('error',message);}
  bind(conn){this.clearPackets();this.conn=conn;this.live=false;clearTimeout(this.timer);this.timer=setTimeout(()=>{if(!this.live)this.emit('error','연결 시간이 초과됐습니다. 방 코드와 네트워크를 확인한 뒤 다시 연결해 주세요.');},20000);
    conn.on('open',()=>{if(this.closed||conn!==this.conn)return;clearTimeout(this.timer);this.live=true;this.emit('connected');});
    conn.on('data',data=>{if(this.closed||conn!==this.conn||!data||typeof data!=='object')return;if(data.type==='busy'){this.live=false;this.clearPackets();this.emit('error','이미 진행 중인 방입니다. 다른 방 코드를 이용해 주세요.');return;}if(data.type==='packet')this.receivePacket(data);});
    conn.on('close',()=>{if(this.closed||conn!==this.conn)return;this.live=false;this.clearPackets();this.emit('disconnected');});
    conn.on('error',()=>{if(!this.closed&&conn===this.conn)this.transportError('대전 데이터 전송이 중단됐습니다. 다시 연결하면 현재 판에서 이어집니다.');});
  }
  send(data){
    const conn=this.conn;if(this.closed||!conn?.open||!this.live)return false;
    try{
      const text=JSON.stringify(data);if(typeof text!=='string'||encoder.encode(text).byteLength>MAX_MESSAGE_BYTES)throw new Error('message-size');
      const chunks=[];for(let start=0;start<text.length;){let end=Math.min(start+CHUNK_CHARS,text.length);const code=text.charCodeAt(end-1);if(end<text.length&&code>=0xd800&&code<=0xdbff)end--;chunks.push(text.slice(start,end));start=end;}
      if(!chunks.length||chunks.length>MAX_PARTS)throw new Error('message-size');
      const id=this.packetSession+'-'+(++this.packetSequence);
      for(let part=0;part<chunks.length;part++){
        if(conn!==this.conn||!conn.open||!this.live)return false;
        conn.send({type:'packet',id,part,total:chunks.length,content:chunks[part]});
      }
      return this.live&&conn.open;
    }catch{this.transportError('대전 데이터를 전송하지 못했습니다. 다시 연결한 뒤 계속해 주세요.');return false;}
  }
  reconnect(){if(this.closed)return;if(this.peer.disconnected)this.peer.reconnect();else if(!this.host){this.conn?.close();this.connect();}else this.emit('ready',this.code);}
  destroy(){this.closed=true;clearTimeout(this.timer);this.clearPackets();this.conn?.close();this.peer?.destroy();this.listeners={};this.live=false;}
}
