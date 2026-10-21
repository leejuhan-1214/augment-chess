export function boardWelcome(mode,color){
  if(mode==='online')return {title:'친구와 대전 연결 중',description:color==='w'?'연결되면 백의 증강 선택부터 자동으로 시작합니다.':'방장과 연결되면 증강 선택이 자동으로 시작됩니다.'};
  return {title:'판을 바꿀 준비가 됐나요?',description:'대전 모드를 선택해 시작하세요'};
}
