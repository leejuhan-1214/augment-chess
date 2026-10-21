const PREFIX='augmentchess-v3-',PROTOCOL='augment-chess-v3';
// PeerJS's JSON transport rejects messages at 16,300 bytes. Bound each packet
// well below that limit, including JSON escaping of its string contents.
const CHUNK_CHARS=1200,MAX_MESSAGE_BYTES=2*1024*1024,MAX_BUFFER_BYTES=4*1024*1024;
const MAX_PARTS=1800,MAX_PENDING=8,MAX_RECENT=128,PACKET_TTL=30000;
const SIGNAL_TIMEOUT=15000,CONNECT_TIMEOUT=20000,ICE_GRACE=4000,RETRY_DELAYS=[1000,2000,4000,8000,10000];
const encoder=new TextEncoder();
export function roomCode(){const bytes=crypto.getRandomValues(new Uint8Array(8)),chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return Array.from(bytes,n=>chars[n%chars.length]).join('');}
// No accounts or camera/microphone permissions. Only the game travels over a data channel.
export class OnlineRoom {
  constructor({host,code,PeerClass=globalThis.Peer,token,guestToken=null}){
    this.host=host;this.code=code;this.listeners={};this.live=false;this.closed=false;this.conn=null;this.guestToken=guestToken;this.token=token||crypto.randomUUID();
    this.PeerClass=PeerClass;this.peer=null;this.signalReady=false;this.connecting=false;this.retryAttempts=0;this.retryTimer=null;this.endedConnection=null;this.blocked=false;this.retiredConnections=new Map();
    this.packetSession=crypto.randomUUID();this.packetSequence=0;this.pendingPackets=new Map();this.completedPackets=new Map();this.pendingBytes=0;
    if(!PeerClass)throw new Error('온라인 연결 라이브러리를 불러오지 못했습니다. 새로고침해 주세요.');
    this.startPeer();
  }
  startPeer(){
    if(this.closed)return;
    clearTimeout(this.signalTimer);this.signalReady=false;
    const previous=this.peer;this.peer=null;
    if(this.conn&&this.endedConnection!==this.conn)this.finishConnection(this.conn,{retry:false});
    try{previous?.destroy();}catch{}
    const peer=this.peer=new this.PeerClass(this.host?PREFIX+this.code:undefined,{debug:0,secure:true});
    const current=()=>!this.closed&&this.peer===peer;
    this.watchSignaling(peer);
    peer.on('open',()=>{if(!current())return;clearTimeout(this.signalTimer);this.signalReady=true;if(this.host){this.retryAttempts=0;clearTimeout(this.retryTimer);this.retryTimer=null;}this.emit('ready',this.code);if(!this.host)this.connect();});
    peer.on('connection',conn=>{if(!this.host||!current()){conn.close();return;}
      const token=conn.metadata?.token;
      const returning=this.guestToken&&this.guestToken===token;
      if(conn.metadata?.app!==PROTOCOL||typeof token!=='string'||token.length>80||!token||(this.guestToken&&this.guestToken!==token)||(!returning&&(this.connecting||(this.conn?.open&&this.endedConnection!==this.conn)))){
        const reject=()=>{try{conn.send({type:'busy'});}catch{}const timer=setTimeout(()=>conn.close(),300);timer.unref?.();};
        if(conn.open)reject();else conn.on('open',reject);return;
      }
      // Reserve identity only after a usable channel opens. An abandoned ICE
      // attempt must not permanently lock an otherwise empty room.
      this.bind(conn);
    });
    peer.on('disconnected',()=>{if(!current())return;this.signalReady=false;clearTimeout(this.signalTimer);this.emit('signaling');this.scheduleReconnect();});
    peer.on('close',()=>{if(!current())return;this.signalReady=false;this.scheduleReconnect();});
    peer.on('error',e=>{if(!current())return;const messages={
      'peer-unavailable':'방을 찾을 수 없습니다. 코드를 확인하고 방장이 탭을 열었는지 확인해 주세요.',
      'unavailable-id':'이미 사용 중인 방 코드입니다. 나간 뒤 새 방을 만들어 주세요.',
      'network':'연결 서버에 접속하지 못했습니다. 네트워크를 확인하고 다시 연결해 주세요.',
      'webrtc':'대전 연결에 실패했습니다. 다른 네트워크에서 다시 시도해 주세요.',
      'browser-incompatible':'이 브라우저는 온라인 대전을 지원하지 않습니다. 최신 Chrome, Edge, Safari를 사용해 주세요.'
    };
      if(e.type==='peer-unavailable'&&this.conn)this.finishConnection(this.conn,{retry:false,notify:false});
      this.emit('error',messages[e.type]||'연결 중 오류가 발생했습니다. 다시 연결해 주세요.');
      if(e.type==='browser-incompatible'||e.type==='invalid-id'){this.blocked=true;clearTimeout(this.signalTimer);clearTimeout(this.retryTimer);this.retryTimer=null;}else this.scheduleReconnect();
    });
  }
  on(name,fn){(this.listeners[name]??=[]).push(fn);return this;}
  emit(name,data){if(!this.closed)for(const fn of this.listeners[name]||[])fn(data);}
  watchSignaling(peer){
    clearTimeout(this.signalTimer);
    this.signalTimer=setTimeout(()=>{
      if(this.closed||peer!==this.peer||this.signalReady)return;
      this.emit('error','연결 서버의 응답 시간이 초과됐습니다. 자동으로 다시 연결합니다.');
      // A peer stuck before its first open cannot be recovered with reconnect().
      this.peer=null;try{peer.destroy();}catch{}this.scheduleReconnect();
    },SIGNAL_TIMEOUT);this.signalTimer.unref?.();
  }
  scheduleReconnect(){
    if(this.closed||this.blocked||this.retryTimer)return;
    if(this.retryAttempts>=RETRY_DELAYS.length){this.emit('error','자동 재연결을 완료하지 못했습니다. 방장이 탭을 열었는지 확인한 뒤 다시 연결을 눌러 주세요.');return;}
    const delay=RETRY_DELAYS[this.retryAttempts++];
    this.retryTimer=setTimeout(()=>{this.retryTimer=null;if(this.closed||this.blocked)return;this.emit('reconnecting',`자동으로 다시 연결하고 있습니다. (${this.retryAttempts}/${RETRY_DELAYS.length})`);this.recover();},delay);this.retryTimer.unref?.();
  }
  recover(){
    if(this.closed||this.blocked)return;
    if(!this.peer||this.peer.destroyed){this.startPeer();return;}
    if(this.peer.disconnected){this.signalReady=false;this.watchSignaling(this.peer);try{this.peer.reconnect();}catch{this.startPeer();}return;}
    if(!this.signalReady){this.startPeer();return;}
    if(this.host)this.emit('ready',this.code);else this.connect();
  }
  connect(){
    if(this.closed||this.host||this.blocked||this.connecting||this.live)return;
    if(!this.peer||this.peer.destroyed||this.peer.disconnected||!this.signalReady){this.scheduleReconnect();return;}
    try{const conn=this.peer.connect(PREFIX+this.code,{reliable:true,serialization:'json',metadata:{app:PROTOCOL,token:this.token}});if(!conn)throw new Error('peer-not-ready');this.bind(conn);}
    catch{this.emit('error','방장에게 연결하지 못했습니다. 자동으로 다시 연결합니다.');this.scheduleReconnect();}
  }
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
  transportError(message){if(this.conn)this.finishConnection(this.conn,{message});else this.emit('error',message);}
  retireConnection(conn){
    if(this.host&&conn.open){
      try{
        conn.send({type:'replaced'});
        const timer=setTimeout(()=>{this.retiredConnections.delete(conn);try{conn.close();}catch{}},300);timer.unref?.();this.retiredConnections.set(conn,timer);return;
      }catch{}
    }
    try{conn.close();}catch{}
  }
  finishConnection(conn,{retry=true,notify=true,message}={}){
    if(this.closed||conn!==this.conn||this.endedConnection===conn)return;
    this.endedConnection=conn;this.live=false;this.connecting=false;
    clearTimeout(this.timer);clearTimeout(this.iceTimer);this.iceTimer=null;this.clearPackets();
    try{conn.close();}catch{}
    if(notify)this.emit('disconnected');if(message)this.emit('error',message);
    if(retry&&!this.host)this.scheduleReconnect();
  }
  bind(conn){
    const previous=this.conn,wasLive=this.live;
    this.clearPackets();this.conn=conn;this.endedConnection=null;this.live=false;this.connecting=true;
    clearTimeout(this.timer);clearTimeout(this.iceTimer);this.iceTimer=null;
    if(previous&&previous!==conn)this.retireConnection(previous);
    if(wasLive)this.emit('reconnecting','같은 상대가 다시 접속했습니다. 대전 연결을 복구하고 있습니다.');
    const current=()=>!this.closed&&conn===this.conn&&this.endedConnection!==conn;
    this.timer=setTimeout(()=>{if(current()&&!this.live)this.finishConnection(conn,{message:'연결 시간이 초과됐습니다. 방 코드와 네트워크를 확인한 뒤 다시 연결해 주세요.'});},CONNECT_TIMEOUT);this.timer.unref?.();
    const opened=()=>{
      if(!current()){try{conn.close();}catch{}return;}
      clearTimeout(this.timer);clearTimeout(this.iceTimer);this.iceTimer=null;if(this.signalReady){clearTimeout(this.retryTimer);this.retryTimer=null;}
      this.connecting=false;this.live=true;this.retryAttempts=0;
      if(this.host)this.guestToken=conn.metadata.token;
      this.emit('connected');
    };
    conn.on('open',opened);
    conn.on('data',data=>{
      if(!current()||!data||typeof data!=='object')return;
      if(data.type==='busy'||data.type==='replaced'){
        this.blocked=true;clearTimeout(this.retryTimer);this.retryTimer=null;
        this.finishConnection(conn,{retry:false,notify:false,message:data.type==='replaced'?'다른 탭에서 이어서 플레이 중입니다. 이 탭으로 돌아오려면 다시 연결을 눌러 주세요.':'이미 진행 중인 방입니다. 다른 방 코드를 이용해 주세요.'});return;
      }
      if(data.type==='packet')this.receivePacket(data);
    });
    conn.on('close',()=>{if(current())this.finishConnection(conn);});
    conn.on('error',()=>{if(current())this.transportError('대전 데이터 전송이 중단됐습니다. 다시 연결하면 현재 판에서 이어집니다.');});
    conn.on('iceStateChanged',state=>{
      if(!current())return;
      if(state==='disconnected'){
        if(this.iceTimer)return;
        this.live=false;this.emit('reconnecting','네트워크가 잠시 끊겼습니다. 대전을 멈추고 연결을 복구하고 있습니다.');
        this.iceTimer=setTimeout(()=>{this.iceTimer=null;if(current())this.finishConnection(conn);},ICE_GRACE);this.iceTimer.unref?.();
      }else if(state==='connected'||state==='completed'){
        clearTimeout(this.iceTimer);this.iceTimer=null;
        if(conn.open&&!this.live)opened();
      }else if(state==='failed'||state==='closed')this.finishConnection(conn);
    });
    if(conn.open)opened();
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
  reconnect(){
    if(this.closed)return;
    this.blocked=false;this.retryAttempts=0;clearTimeout(this.retryTimer);this.retryTimer=null;
    if(this.conn&&this.endedConnection!==this.conn)this.finishConnection(this.conn,{retry:false});
    this.recover();
  }
  destroy(){
    this.closed=true;clearTimeout(this.timer);clearTimeout(this.signalTimer);clearTimeout(this.retryTimer);clearTimeout(this.iceTimer);this.clearPackets();
    try{this.conn?.close();}catch{}try{this.peer?.destroy();}catch{}
    for(const [conn,timer]of this.retiredConnections){clearTimeout(timer);try{conn.close();}catch{}}this.retiredConnections.clear();
    this.listeners={};this.live=false;this.connecting=false;
  }
}
