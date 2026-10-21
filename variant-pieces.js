// Independent movement definitions, based on the game's public encyclopedia.
export const ORTHO=[[1,0],[-1,0],[0,1],[0,-1]],DIAG=[[1,1],[1,-1],[-1,1],[-1,-1]],KING=[...ORTHO,...DIAG];
export const KNIGHT=[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]];
const defs=[
 ['p','폰',1,'p'],['n','나이트',3,'n'],['b','비숍',3,'b'],['r','룩',5,'r'],['q','퀸',9,'q'],['k','킹',100,'k'],
 ['fanatic','광신도',1,'p'],['berolina','베롤리나 폰',1,'p'],['alfil','알필',1,'b'],['squire','종자',1,'p'],['checker','체커',1,'p'],
 ['guard','근위병',2,'k'],['standard-bearer','기수',2,'p'],['camel','낙타',2,'n'],['lobster','랍스터',2,'p'],['missionary','선교사',2,'b'],['eagle','알리바바',2,'n'],['king-checker','킹 체커',2,'p'],['log','통나무',2,'r'],
 ['knightmaster','기사단장',3,'n'],['monsignor','몬시뇰',3,'b'],['medium','무덤',3,'b'],['killer','킬러',3,'b'],['scarecrow','허수아비',3,'p'],
 ['monster','괴물',4,'k'],['grasshopper','그래스호퍼',4,'n'],['man','만',4,'k'],['baby-bear','아기곰',4,'k'],['assassin','암살자',4,'n'],['campfire','캠프파이어',4,'r'],['paladin','팔라딘',4,'n'],['cannon','포',4,'r'],['windmill','풍차',4,'b'],
 ['siege-ram','공성추',5,'r'],['dragon','드래곤',5,'n'],['octopus','문어',5,'k'],['barrier','배리어',5,'r'],['slime','슬라임',5,'r'],['beacon','신호기',5,'r'],['parrot','앵무새',5,'r'],['pegasus','유니콘',5,'n'],['herald','전령',5,'r'],['transmission-tower','전송탑',5,'r'],['clockwork','태엽인형',5,'q'],['trickster','트릭스터',5,'r'],['revolving-door','회전문',5,'r'],
 ['magic-girl','마법소녀',6,'k'],['princess','프린세스',6,'q'],['don-quixote','돈 키호테',7,'n'],['berserker','버서커',7,'k'],['archbishop','아치비숍',7,'b'],['cardinal','추기경',7,'b'],
 ['big-rook','빅룩',8,'r'],['big-bishop','빅숍',8,'b'],['chancellor','챈슬러',8,'r'],['hedgehog','고슴도치',9,'k'],['jester','광대',9,'q'],['prime-minister','국무총리',9,'k'],['thief','도적',9,'r'],['wizard','마법사',9,'k'],['reaper','사신',9,'k'],['siren','세이렌',9,'k'],['idol','아이돌',9,'q'],['undead','언데드',9,'k'],['recruiter','징집관',9,'k'],
 ['brutus','브루투스',10,'r'],['colossus','거신병',12,'r'],['core','코어',0,'p'],['grappler','그래플러',13,'q'],['amazon','아마존',13,'q'],['hook','구행',15,'r'],['bear','곰',17,'q'],['merchant','상인',100,'k'],['vip','귀빈',1,'p'],['cover','엄폐물',0,'p'],['football','축구공',0,'p'],['crown','왕관',0,'k']
];
export const PIECES=Object.fromEntries(defs.map(([id,name,value,icon])=>[id,{id,name,value,icon}]));
export const NAMES=Object.fromEntries(defs.map(([id,name])=>[id,name]));
export const PAWNS=new Set(['p','berolina','squire','standard-bearer','fanatic','vip']);
export const MINORS=new Set(['n','b','alfil','camel','squire','monsignor','missionary','grasshopper','knightmaster','paladin','cannon']);
export const MAJORS=new Set(['q','r','killer','man','assassin','windmill','octopus','herald','revolving-door','magic-girl','princess','don-quixote','berserker','archbishop','big-rook','big-bishop','chancellor','hedgehog','jester','prime-minister','reaper','siren','undead','brutus','colossus','grappler','amazon','hook','bear']);
export const isRoyal=p=>!!p&&(p.royal||p.t==='k'||p.t==='merchant');
export const inside=(r,c)=>r>=0&&r<8&&c>=0&&c<8;
export const row=i=>Math.floor(i/8),col=i=>i%8,dist=(a,b)=>Math.max(Math.abs(row(a)-row(b)),Math.abs(col(a)-col(b)));
export const around=(i,dirs=KING)=>dirs.map(([r,c])=>[row(i)+r,col(i)+c]).filter(([r,c])=>inside(r,c)).map(([r,c])=>r*8+c);
export const side=c=>c==='w'?'b':'w';
export const value=p=>PIECES[p?.t]?.value||0;
