// Public card names and factual mechanics, independently worded. Source: https://augmentchess.org/
export const ORIGINAL_CARDS=[
  {
    "id": "ac-acceleration",
    "key": "acceleration",
    "name": "가속",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "세 번째 흑 차례부터 매 턴 두 번 행동"
  },
  {
    "id": "ac-winter-kingdom",
    "key": "winter-kingdom",
    "name": "겨울 왕국",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "3수 주기 · 양측 3기 빙결 · 지속 3수"
  },
  {
    "id": "ac-revelation",
    "key": "revelation",
    "name": "계시",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "60수에 남은 기물 점수로 승패 결정"
  },
  {
    "id": "ac-highway",
    "key": "highway",
    "name": "고속도로",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "b·g 파일에 이동을 돕는 고속도로 설치"
  },
  {
    "id": "ac-high-ground",
    "key": "high-ground",
    "name": "고지전",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙 여덟 칸에 고지대 지형 배치"
  },
  {
    "id": "ac-monster",
    "key": "monster",
    "name": "괴물",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙 괴물 소환 · 1.5수마다 무작위 이동"
  },
  {
    "id": "ac-capture-the-flag",
    "key": "capture-the-flag",
    "name": "깃발 뽑기",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 홈랭크 깃발 점령 후 한 턴 유지 시 승리"
  },
  {
    "id": "ac-monochrome-chess",
    "key": "monochrome-chess",
    "name": "단색 체스",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "같은 색 칸으로만 이동 · 나이트는 낙타로 변환"
  },
  {
    "id": "ac-diagonal-chess",
    "key": "diagonal-chess",
    "name": "대각선 체스",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "대각선 초기 배치와 승급선 적용"
  },
  {
    "id": "ac-cool-guy",
    "key": "cool-guy",
    "name": "매너",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "포획 뒤 일반 이동을 해야 다시 포획 가능"
  },
  {
    "id": "ac-platform",
    "key": "platform",
    "name": "발판",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "5수마다 추가 이동 발판 생성"
  },
  {
    "id": "ac-periodic-collapse",
    "key": "periodic-collapse",
    "name": "붕괴",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "20수 간격으로 바깥 테두리 붕괴"
  },
  {
    "id": "ac-black-hole",
    "key": "black-hole",
    "name": "블랙홀",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙 네 칸에 도착한 기물 제거"
  },
  {
    "id": "ac-macho-chess",
    "key": "macho-chess",
    "name": "상남자 모드",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "후퇴 금지 · 횡이동은 포획만 · 킹 끝랭크 도달 승리 · 앙파상 강제"
  },
  {
    "id": "ac-mistake",
    "key": "mistake",
    "name": "실수",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "포획 실패 확률 20% · 실패한 공격자 제거"
  },
  {
    "id": "ac-crown",
    "key": "crown",
    "name": "왕관",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙 왕관을 10수 연속 수비하면 승리"
  },
  {
    "id": "ac-camouflage-color",
    "key": "camouflage-color",
    "name": "위장색",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "킹 이외 기물은 자기 색 칸에서 은신"
  },
  {
    "id": "ac-recycling",
    "key": "recycling",
    "name": "재활용",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "묘지의 아군 종류로만 승급 가능"
  },
  {
    "id": "ac-chess-960",
    "key": "chess-960",
    "name": "960 체스",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "폰 이외 초기 기물 무작위 재배치"
  },
  {
    "id": "ac-chess-344200",
    "key": "chess-344200",
    "name": "체스 32432400",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "전체 초기 배치 무작위화 · 킹은 홈랭크 유지"
  },
  {
    "id": "ac-transcendence",
    "key": "transcendence",
    "name": "초월",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "직접 포획하면 폰→나이트→비숍→룩→퀸 순으로 진화"
  },
  {
    "id": "ac-football",
    "key": "football",
    "name": "축구공",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙에 이동 가능한 축구공 배치"
  },
  {
    "id": "ac-conveyor",
    "key": "conveyor",
    "name": "컨베이어",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "바깥 테두리 기물이 매 수 시계 방향으로 순환"
  },
  {
    "id": "ac-portal",
    "key": "portal",
    "name": "포탈",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "서로 통하는 포탈 두 칸 설치"
  },
  {
    "id": "ac-saturation",
    "key": "saturation",
    "name": "포화",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "세 기를 포획한 기물의 추가 포획 금지"
  },
  {
    "id": "ac-rule-bombs",
    "key": "rule-bombs",
    "name": "폭탄",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "중앙 폭탄 세 개 · 밟으면 같은 행과 열의 기물 제거"
  },
  {
    "id": "ac-chess-n-pow-30",
    "key": "chess-n-pow-30",
    "name": "혼돈의 체스",
    "kind": "RULE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "비킹 기물 무작위 변환 · 최초 2수 포획 금지"
  },
  {
    "id": "ac-apprentice-knights",
    "key": "apprentice-knights",
    "name": "견습 기사단",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "b·g 파일 폰을 종자로 전환"
  },
  {
    "id": "ac-guard",
    "key": "guard",
    "name": "근위병",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "킹 파일의 폰을 근위병으로 전환"
  },
  {
    "id": "ac-knightmate",
    "key": "knightmate",
    "name": "나이트메이트",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "킹→로얄 나이트 · 나이트→만"
  },
  {
    "id": "ac-pawn-conversion",
    "key": "pawn-conversion",
    "name": "전환",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "전군 폰의 직진·대각 이동과 포획 방식 교환"
  },
  {
    "id": "ac-last-stand",
    "key": "last-stand",
    "name": "집단 광기",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "전군 폰을 광신도로 전환"
  },
  {
    "id": "ac-elephant-escape",
    "key": "elephant-escape",
    "name": "코끼리 탈출",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "알필 두 기 추가 소환"
  },
  {
    "id": "ac-queen-cavalry",
    "key": "queen-cavalry",
    "name": "퀸의 기병대",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "퀸 앞 폰을 나이트로 전환"
  },
  {
    "id": "ac-london-system",
    "key": "london-system",
    "name": "런던 시스템",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군을 런던 시스템 전개 배치로 시작"
  },
  {
    "id": "ac-rocket",
    "key": "rocket",
    "name": "로켓",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "각 룩의 첫 이동에 아마존 행마 추가"
  },
  {
    "id": "ac-king-of-the-hill",
    "key": "king-of-the-hill",
    "name": "언덕의 왕",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "중앙 네 칸의 킹에 아마존 행마 추가"
  },
  {
    "id": "ac-checker",
    "key": "checker",
    "name": "체커",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "체커 네 기 소환"
  },
  {
    "id": "ac-thief",
    "key": "thief",
    "name": "도적",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "퀸을 잠복·수배 상태의 도적으로 전환"
  },
  {
    "id": "ac-false-start",
    "key": "false-start",
    "name": "부정출발",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군 전체를 두 칸 전진 배치"
  },
  {
    "id": "ac-vanguard",
    "key": "vanguard",
    "name": "선봉",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "단독 최선두 폰에 대각선 비포획 이동 추가"
  },
  {
    "id": "ac-wanted",
    "key": "wanted",
    "name": "수배",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "상대 원거리 기물 한 기에 잠복·수배 지정"
  },
  {
    "id": "ac-martyrdom",
    "key": "martyrdom",
    "name": "순교",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "비숍 전부를 희생하고 전군 폰에 가호"
  },
  {
    "id": "ac-calling-card",
    "key": "calling-card",
    "name": "예고장",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "지정된 상대 비폰 기물이 잡히면 추가 기물 제거"
  },
  {
    "id": "ac-geneva-convention",
    "key": "geneva-convention",
    "name": "제네바 협약",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "상대 퀸이 아군 폰을 포획하지 못함"
  },
  {
    "id": "ac-holdout",
    "key": "holdout",
    "name": "존버",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "지정된 무작위 폰이 28수 생존하면 퀸 승급"
  },
  {
    "id": "ac-sprint",
    "key": "sprint",
    "name": "질주",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "폰의 최초 전진 거리 최대 세 칸"
  },
  {
    "id": "ac-fianchetto",
    "key": "fianchetto",
    "name": "피앙케토",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군 비숍의 피앙케토 대각선에 상대 폰 진입 금지"
  },
  {
    "id": "ac-d4",
    "key": "d4",
    "name": "d4",
    "kind": "OPENING",
    "rarity": "COMMON",
    "passive": true,
    "desc": "백 d4·흑 d5에 적군과 아군 킹 진입 금지"
  },
  {
    "id": "ac-initiative",
    "key": "initiative",
    "name": "선공권",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "초기 8수 상대 포획 제한 · 포획·체크 발생 시 해제"
  },
  {
    "id": "ac-fast-growth",
    "key": "fast-growth",
    "name": "성급한 승진",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "승급선을 세 줄 앞당김 · 메이저 피스 승급 제외"
  },
  {
    "id": "ac-grudge",
    "key": "grudge",
    "name": "원한",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "무작위 아군 비폰 기물에 원한"
  },
  {
    "id": "ac-otherworld",
    "key": "otherworld",
    "name": "이세계",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "아군 폰 희생 · 14수 뒤 그 칸에 마법사 강림"
  },
  {
    "id": "ac-herald",
    "key": "herald",
    "name": "전령",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "무작위 룩을 전령으로 전환"
  },
  {
    "id": "ac-early-promotion",
    "key": "early-promotion",
    "name": "조기 진급",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "승급선을 두 줄 앞당김"
  },
  {
    "id": "ac-queens-gambit",
    "key": "queens-gambit",
    "name": "퀸즈 갬빗",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "퀸을 희생하고 해당 파일·추가 파일 폰에 지속 보호"
  },
  {
    "id": "ac-field-promotion",
    "key": "field-promotion",
    "name": "특진",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "두 기를 포획한 폰 즉시 승급"
  },
  {
    "id": "ac-princess",
    "key": "princess",
    "name": "프린세스",
    "kind": "OPENING",
    "rarity": "RARE",
    "passive": true,
    "desc": "무작위 룩을 프린세스로 전환"
  },
  {
    "id": "ac-dutch",
    "key": "dutch",
    "name": "네덜란드",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "아군 룩·마이너 기물을 풍차로 전환"
  },
  {
    "id": "ac-locust-swarm",
    "key": "locust-swarm",
    "name": "메뚜기떼",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "움직이지 않은 룩·마이너 기물에 1회 그래스호퍼 행마"
  },
  {
    "id": "ac-horde",
    "key": "horde",
    "name": "호드",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "비킹 기물을 폰 군단으로 교체"
  },
  {
    "id": "ac-big-bishop",
    "key": "big-bishop",
    "name": "BISHOP",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "2×2 크기의 빅숍으로 시작"
  },
  {
    "id": "ac-iqp",
    "key": "iqp",
    "name": "IQP",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "상대 c·e 파일 폰 제거"
  },
  {
    "id": "ac-big-rook",
    "key": "big-rook",
    "name": "ROOK",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "2×2 크기의 빅룩으로 시작"
  },
  {
    "id": "ac-iron-monarch",
    "key": "iron-monarch",
    "name": "친정",
    "kind": "OPENING",
    "rarity": "EPIC",
    "passive": true,
    "desc": "킹이 폰 계열을 포획하면 추가 행동"
  },
  {
    "id": "ac-summon-colossus",
    "key": "summon-colossus",
    "name": "메가체스트론",
    "kind": "OPENING",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "폰 전부 희생 · 거신병과 코어 두 개 소환"
  },
  {
    "id": "ac-merchant-guild",
    "key": "merchant-guild",
    "name": "상인 조합",
    "kind": "OPENING",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "킹을 두 칸 전진시켜 상인으로 전환 · 골드 매수 사용"
  },
  {
    "id": "ac-penta-check",
    "key": "penta-check",
    "name": "펜타 체크",
    "kind": "OPENING",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "상대 킹에 다섯 번 체크한 뒤 자기 턴을 맞으면 승리"
  },
  {
    "id": "ac-pawn-chain",
    "key": "pawn-chain",
    "name": "폰 체인",
    "kind": "OPENING",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "상대 폰들을 사슬로 연결"
  },
  {
    "id": "ac-chameleon-mutation",
    "key": "chameleon-mutation",
    "name": "카멜레온 변이",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 최대 세 기에 포획 대상의 종류로 변하는 능력"
  },
  {
    "id": "ac-long-en-passant",
    "key": "long-en-passant",
    "name": "롱파상",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "원거리 상대 폰에도 앙파상 적용"
  },
  {
    "id": "ac-switcheroo",
    "key": "switcheroo",
    "name": "바꿔치기",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 킹과 아군 폰의 위치 교환 허용"
  },
  {
    "id": "ac-disassembly",
    "key": "disassembly",
    "name": "분해",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 퀸 이동 시 출발 칸 룩·도착 칸 비숍으로 분해"
  },
  {
    "id": "ac-submerge",
    "key": "submerge",
    "name": "잠복",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 한 기를 잠복시킴"
  },
  {
    "id": "ac-dice",
    "key": "dice",
    "name": "주사위",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "주사위로 정한 상대 종류를 2수 봉인"
  },
  {
    "id": "ac-cleanup",
    "key": "cleanup",
    "name": "클린업",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 비킹 기물 최대 세 기 제거"
  },
  {
    "id": "ac-panic",
    "key": "panic",
    "name": "패닉",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 두 기를 다음 턴 시작에 무작위 이동"
  },
  {
    "id": "ac-black-box",
    "key": "black-box",
    "name": "검은 상자",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "무작위 발동형 카드 효과와 대상 적용"
  },
  {
    "id": "ac-relay",
    "key": "relay",
    "name": "교대",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "같은 행·열의 아군끼리 위치 교환 이동 허용"
  },
  {
    "id": "ac-rule-ticket",
    "key": "rule-ticket",
    "name": "규칙 티켓",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 규칙을 다음 자기 턴부터 적용"
  },
  {
    "id": "ac-conversion",
    "key": "conversion",
    "name": "기도",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "모든 아군 나이트를 비숍으로 전환"
  },
  {
    "id": "ac-emergency-evacuation",
    "key": "emergency-evacuation",
    "name": "긴급 피난",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 최대 세 기를 한 칸 후퇴 · 이번 턴 포획 제외"
  },
  {
    "id": "ac-taunt",
    "key": "taunt",
    "name": "도발",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대의 다음 턴 후퇴 금지"
  },
  {
    "id": "ac-ice-king",
    "key": "ice-king",
    "name": "블리자드",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "양쪽 킹에 3수 빙결"
  },
  {
    "id": "ac-ice-sheet",
    "key": "ice-sheet",
    "name": "빙판",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 원거리 기물은 3수 동안 최장 거리로만 이동"
  },
  {
    "id": "ac-proficiency",
    "key": "proficiency",
    "name": "숙련",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "승급 직전 폰에 정면 포획 허용"
  },
  {
    "id": "ac-horse-riding",
    "key": "horse-riding",
    "name": "승마",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 킹에 나이트 행마 추가"
  },
  {
    "id": "ac-alekhine-machine-gun",
    "key": "alekhine-machine-gun",
    "name": "알레킨의 머신건",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "룩·룩·퀸이 같은 선에 서면 세 기에 지속 보호"
  },
  {
    "id": "ac-quantum-mechanics",
    "key": "quantum-mechanics",
    "name": "양자 역학",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 비포획 이동의 도착 위치 중첩"
  },
  {
    "id": "ac-queen-afterimage",
    "key": "queen-afterimage",
    "name": "잔상",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "퀸으로 상대 퀸 포획 시 출발 칸에 퀸 잔상 소환"
  },
  {
    "id": "ac-reposition",
    "key": "reposition",
    "name": "재배치",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 포획 없이 같은 기물을 두 번 이동"
  },
  {
    "id": "ac-file-conveyor",
    "key": "file-conveyor",
    "name": "컨베이어",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 파일에 전진 컨베이어 설치"
  },
  {
    "id": "ac-retreat",
    "key": "retreat",
    "name": "퇴각",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군 폰에 한 칸 후퇴 추가"
  },
  {
    "id": "ac-pawn-storm",
    "key": "pawn-storm",
    "name": "폰 스톰",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 폰들을 즉시 한 칸 전진 · 이번 턴 포획 제외"
  },
  {
    "id": "ac-evasion",
    "key": "evasion",
    "name": "회피",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "무작위 아군 한 기에 회피"
  },
  {
    "id": "ac-royal-shield",
    "key": "royal-shield",
    "name": "가호",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "무작위 아군 한 기에 가호"
  },
  {
    "id": "ac-vigilance",
    "key": "vigilance",
    "name": "경계",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군이 잡히면 킹을 다음 상대 턴 종료까지 보호"
  },
  {
    "id": "ac-fanatical-ritual",
    "key": "fanatical-ritual",
    "name": "광신적 의식",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 무작위 비킹 기물을 광신도로 전환"
  },
  {
    "id": "ac-file-surge",
    "key": "file-surge",
    "name": "급수",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "나이트가 a·h 파일로 이동하면 추가 행동"
  },
  {
    "id": "ac-bishop-infiltration",
    "key": "bishop-infiltration",
    "name": "길리 슈트",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "3수 동안 비숍의 비포획 이동에 뛰어넘기 허용"
  },
  {
    "id": "ac-encouragement",
    "key": "encouragement",
    "name": "독려",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "자기 턴마다 킹 주변 아군 보호"
  },
  {
    "id": "ac-poisoned-pawn",
    "key": "poisoned-pawn",
    "name": "독이 든 폰",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "무작위 폰 최대 세 기에 독 · 포획한 적을 2수 구속"
  },
  {
    "id": "ac-backward-knight",
    "key": "backward-knight",
    "name": "뒤로 가는 나이트",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "나이트가 후퇴하며 포획하면 추가 행동"
  },
  {
    "id": "ac-roller",
    "key": "roller",
    "name": "롤러",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 룩의 이동 경로를 고속도로로 변경"
  },
  {
    "id": "ac-freeze",
    "key": "freeze",
    "name": "빙결",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 무작위 세 기를 3수 빙결"
  },
  {
    "id": "ac-vortex",
    "key": "vortex",
    "name": "소용돌이",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 비킹·비폰 기물의 위치를 섞음"
  },
  {
    "id": "ac-suspicious-potion",
    "key": "suspicious-potion",
    "name": "수상한 물약",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 기물에 무작위 상태 효과"
  },
  {
    "id": "ac-promotion-rush",
    "key": "promotion-rush",
    "name": "승진 체험",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 비폰 한 기의 이번 첫 비포획 이동에 퀸 행마 추가"
  },
  {
    "id": "ac-severance",
    "key": "severance",
    "name": "절단",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 원거리 한 기의 사거리를 2수 동안 한 칸으로 제한"
  },
  {
    "id": "ac-loyalist",
    "key": "loyalist",
    "name": "충신",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "지정된 아군에 킹 주변 빈칸으로 이동하는 능력"
  },
  {
    "id": "ac-exhaustion",
    "key": "exhaustion",
    "name": "탈진",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "상대 비킹 기물의 네 번 연속 직접 이동 금지"
  },
  {
    "id": "ac-white-box",
    "key": "white-box",
    "name": "하얀 상자",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "무작위 지속형 카드 효과 획득"
  },
  {
    "id": "ac-scarecrow",
    "key": "scarecrow",
    "name": "허수아비",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 한 기를 희생하고 3수 뒤 그 자리에 허수아비 설치"
  },
  {
    "id": "ac-twins",
    "key": "twins",
    "name": "환상의 콤비",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 두 기를 연결 · 하나가 이동하면 위치 교대"
  },
  {
    "id": "ac-corner-kick",
    "key": "corner-kick",
    "name": "코너킥",
    "kind": "MIDDLE",
    "rarity": "COMMON",
    "passive": true,
    "desc": "구석 2×2의 나이트에 비숍 행마 추가"
  },
  {
    "id": "ac-royal-command",
    "key": "royal-command",
    "name": "왕명",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "다음 자기 턴부터 2수 동안 전군에 킹 행마 추가"
  },
  {
    "id": "ac-ascension",
    "key": "ascension",
    "name": "강림",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "퀸을 올려 보내고 3수 뒤 선택한 빈칸에 착지"
  },
  {
    "id": "ac-inertia",
    "key": "inertia",
    "name": "관성",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "지정된 상대 원거리 기물의 한 칸 이동 금지"
  },
  {
    "id": "ac-mad-horse",
    "key": "mad-horse",
    "name": "광마",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "나이트의 아군 포획 허용 · 아군 포획 후 추가 행동"
  },
  {
    "id": "ac-greek-gift",
    "key": "greek-gift",
    "name": "그릭 기프트",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "비숍 희생 · 턴 종료에 상대 킹 주변 폰 제거"
  },
  {
    "id": "ac-miracle",
    "key": "miracle",
    "name": "기적",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "비숍의 포획 가능 대상을 모두 전향시키고 비숍 희생"
  },
  {
    "id": "ac-basic-training",
    "key": "basic-training",
    "name": "기초 교습",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 한 기에 폰 행마 추가"
  },
  {
    "id": "ac-symmetry",
    "key": "symmetry",
    "name": "대칭",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "이번 턴 중앙 세로선을 기준으로 대칭 이동 허용"
  },
  {
    "id": "ac-random-roulette",
    "key": "random-roulette",
    "name": "랜덤룰렛",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "선택한 메이저 기물을 무작위 종류로 변환"
  },
  {
    "id": "ac-rook-lift",
    "key": "rook-lift",
    "name": "룩 리프트",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "룩이 비포획으로 구석에 도착하면 추가 행동"
  },
  {
    "id": "ac-metal",
    "key": "metal",
    "name": "메탈",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 원거리 한 기에 금속화"
  },
  {
    "id": "ac-counterattack",
    "key": "counterattack",
    "name": "반격",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 폰 한 기에 반격"
  },
  {
    "id": "ac-feudal-contract",
    "key": "feudal-contract",
    "name": "봉건 계약",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 폰과 비폰 기물 계약 · 폰이 잡히면 계약 기물이 반격"
  },
  {
    "id": "ac-blockade",
    "key": "blockade",
    "name": "봉쇄",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "킹 주변 빈칸에 3수 유지 엄폐물 배치"
  },
  {
    "id": "ac-nullification",
    "key": "nullification",
    "name": "상쇄",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "선택한 아군에 상쇄"
  },
  {
    "id": "ac-schrodinger-pawns",
    "key": "schrodinger-pawns",
    "name": "슈뢰딩거의 폰",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "무작위 폰 네 기를 뒤 칸과 중첩 · 이번 턴 포획 제외"
  },
  {
    "id": "ac-mistake-card",
    "key": "mistake-card",
    "name": "실수",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "상대의 이번 포획에 50% 실패 확률"
  },
  {
    "id": "ac-solidarity",
    "key": "solidarity",
    "name": "연대",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "이번 턴 아군 마이너 기물끼리 위치 교환 허용"
  },
  {
    "id": "ac-suicide-bomber",
    "key": "suicide-bomber",
    "name": "자폭병",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "지정된 폰이 잡히면 주변 3×3 폭발"
  },
  {
    "id": "ac-infiltration",
    "key": "infiltration",
    "name": "잠입",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "상대 홈랭크에 홀로 침투한 기물은 잠복"
  },
  {
    "id": "ac-outpost",
    "key": "outpost",
    "name": "전초기지",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "적진의 아군 비킹 한 기를 다음 이동까지 보호"
  },
  {
    "id": "ac-assembly",
    "key": "assembly",
    "name": "조립",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "룩이 비숍을 잡거나 비숍이 룩을 잡으면 퀸으로 변환"
  },
  {
    "id": "ac-religious-victory",
    "key": "religious-victory",
    "name": "종교 승리",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "아군 비숍 수가 상대보다 셋 많으면 승리"
  },
  {
    "id": "ac-frontline-response",
    "key": "frontline-response",
    "name": "철벽",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": true,
    "desc": "전군 룩에 철벽"
  },
  {
    "id": "ac-castling",
    "key": "castling",
    "name": "캐슬링",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "같은 직선·대각선의 킹과 룩을 특수 캐슬링 · 도착 칸 포획 가능"
  },
  {
    "id": "ac-insight",
    "key": "insight",
    "name": "통찰",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "적군 이로운 효과와 아군 해로운 효과 제거"
  },
  {
    "id": "ac-trojan-horse",
    "key": "trojan-horse",
    "name": "트로이 목마",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "나이트가 잡히면 공격자 제거 후 폰 소환"
  },
  {
    "id": "ac-premove",
    "key": "premove",
    "name": "프리 무브",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "최대 세 기의 이동 예약 · 상대 다음 이동 뒤 순서대로 실행"
  },
  {
    "id": "ac-armistice",
    "key": "armistice",
    "name": "휴전",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "2수 동안 양쪽 포획 금지"
  },
  {
    "id": "ac-sacrifice",
    "key": "sacrifice",
    "name": "희생",
    "kind": "MIDDLE",
    "rarity": "RARE",
    "passive": false,
    "desc": "한 기를 희생하고 가치가 더 낮은 아군을 3수 보호"
  },
  {
    "id": "ac-breakthrough-order",
    "key": "breakthrough-order",
    "name": "돌파",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이번 턴 폰의 정면 포획 허용"
  },
  {
    "id": "ac-en-passant-bang",
    "key": "en-passant-bang",
    "name": "앙파상",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이번 턴 폰 옆의 모든 적 종류에 앙파상 허용"
  },
  {
    "id": "ac-majesty",
    "key": "majesty",
    "name": "위엄",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "적 메이저 기물의 아군 킹 인접 칸 진입 금지"
  },
  {
    "id": "ac-man",
    "key": "man",
    "name": "만",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "선택한 양측 마이너 기물을 만으로 전환"
  },
  {
    "id": "ac-disarm",
    "key": "disarm",
    "name": "무장해제",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "선택한 상대 비킹의 이번 턴 포획 금지"
  },
  {
    "id": "ac-seal",
    "key": "seal",
    "name": "봉인",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "선택한 상대 비킹에 다음 자기 턴부터 속박"
  },
  {
    "id": "ac-injury",
    "key": "injury",
    "name": "부상",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "상대 나이트 계열의 직교 방향 뛰어넘기 제한"
  },
  {
    "id": "ac-socialism",
    "key": "socialism",
    "name": "사회주의",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "상대의 다음 턴에 비킹 전군 행마를 폰으로 변경"
  },
  {
    "id": "ac-overwhelm",
    "key": "overwhelm",
    "name": "압도",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "상대 킹의 아군 퀸 포획 금지"
  },
  {
    "id": "ac-stealth",
    "key": "stealth",
    "name": "은신",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "아군 비숍 한 기를 상대 화면에서 숨김"
  },
  {
    "id": "ac-snipe",
    "key": "snipe",
    "name": "저격",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이번 턴 비숍이 폰 한 기를 넘어서 포획 가능"
  },
  {
    "id": "ac-imperial-studies",
    "key": "imperial-studies",
    "name": "제왕학",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "킹이 잡은 기물의 행마를 계속 습득"
  },
  {
    "id": "ac-overtake",
    "key": "overtake",
    "name": "추월",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이번 턴 룩이 아군 기물을 뛰어넘음"
  },
  {
    "id": "ac-chimera",
    "key": "chimera",
    "name": "키메라",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "아군 메이저 한 기에 키메라"
  },
  {
    "id": "ac-killer-king",
    "key": "killer-king",
    "name": "킬러 킹",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "상대 킹을 잡을 때 아군 킹에 룩 행마 추가"
  },
  {
    "id": "ac-parry",
    "key": "parry",
    "name": "패링",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "지정된 아군에 공격 시 40% 반격 확률"
  },
  {
    "id": "ac-e4",
    "key": "e4",
    "name": "e4",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이번 턴 아군을 백 e4·흑 e5로 이동 가능"
  },
  {
    "id": "ac-ghost",
    "key": "ghost",
    "name": "고스트",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "전군 폰에 고스트"
  },
  {
    "id": "ac-radical-charge",
    "key": "radical-charge",
    "name": "난폭한 돌진",
    "kind": "MIDDLE",
    "rarity": "EPIC",
    "passive": true,
    "desc": "나이트가 직교 방향으로 넘은 적을 자동 포획"
  },
  {
    "id": "ac-mongolian-gambit",
    "key": "mongolian-gambit",
    "name": "몽골리안 갬빗",
    "kind": "MIDDLE",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "모든 아군 비킹 기물을 나이트로 전환"
  },
  {
    "id": "ac-trolley",
    "key": "trolley",
    "name": "트롤리",
    "kind": "MIDDLE",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "상대가 다음 턴 두 선로 중 하나를 희생하도록 선택"
  },
  {
    "id": "ac-windmill",
    "key": "windmill",
    "name": "풍차",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "비숍·룩 한 기씩을 풍차로 변환"
  },
  {
    "id": "ac-jester",
    "key": "jester",
    "name": "광대",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "퀸 한 기를 광대로 변환"
  },
  {
    "id": "ac-ordination",
    "key": "ordination",
    "name": "서품",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "비숍 한 기 희생 · 다른 비숍을 추기경으로 변환"
  },
  {
    "id": "ac-constitutional-monarchy",
    "key": "constitutional-monarchy",
    "name": "입헌군주제",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "퀸 한 기를 국무총리로 변환"
  },
  {
    "id": "ac-log",
    "key": "log",
    "name": "통나무",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "폰 한 기를 통나무로 변환"
  },
  {
    "id": "ac-siege-ram",
    "key": "siege-ram",
    "name": "공성추",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "룩 한 기를 공성추로 변환"
  },
  {
    "id": "ac-knightmaster",
    "key": "knightmaster",
    "name": "기사단장",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "나이트 한 기를 기사단장으로 변환"
  },
  {
    "id": "ac-standard-bearer",
    "key": "standard-bearer",
    "name": "기수",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "폰 한 기를 기수로 변환"
  },
  {
    "id": "ac-reformation",
    "key": "reformation",
    "name": "몬시뇰",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "모든 비숍을 몬시뇰로 변환"
  },
  {
    "id": "ac-berserker",
    "key": "berserker",
    "name": "버서커",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "룩 한 기를 버서커로 변환"
  },
  {
    "id": "ac-missionary",
    "key": "missionary",
    "name": "선교사",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "비숍을 선교사로 변환하고 선교사 추가 소환"
  },
  {
    "id": "ac-siren",
    "key": "siren",
    "name": "세이렌",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "퀸 한 기를 세이렌으로 변환"
  },
  {
    "id": "ac-assassin",
    "key": "assassin",
    "name": "암살자",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "나이트 한 기를 암살자로 변환"
  },
  {
    "id": "ac-paladin",
    "key": "paladin",
    "name": "팔라딘",
    "kind": "PIECE",
    "rarity": "COMMON",
    "passive": false,
    "desc": "나이트 한 기를 팔라딘으로 변환"
  },
  {
    "id": "ac-hedgehog",
    "key": "hedgehog",
    "name": "고슴도치",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "퀸 한 기를 고슴도치로 변환"
  },
  {
    "id": "ac-grasshopper",
    "key": "grasshopper",
    "name": "그래스호퍼",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "마이너 한 기를 그래스호퍼로 변환"
  },
  {
    "id": "ac-grappler",
    "key": "grappler",
    "name": "그래플러",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "마이너 희생 · 퀸을 그래플러로 변환"
  },
  {
    "id": "ac-eastern-policy",
    "key": "eastern-policy",
    "name": "동방견문록",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "마이너 한 기를 포로 변환"
  },
  {
    "id": "ac-dragon",
    "key": "dragon",
    "name": "드래곤",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 드래곤으로 변환"
  },
  {
    "id": "ac-magic-girl",
    "key": "magic-girl",
    "name": "마법소녀",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 마법소녀로 변환"
  },
  {
    "id": "ac-medium",
    "key": "medium",
    "name": "무덤",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "마이너 한 기를 무덤으로 변환"
  },
  {
    "id": "ac-octopus",
    "key": "octopus",
    "name": "문어",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 문어로 변환"
  },
  {
    "id": "ac-barrier",
    "key": "barrier",
    "name": "배리어",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 배리어로 변환"
  },
  {
    "id": "ac-reaper",
    "key": "reaper",
    "name": "사신",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "퀸 한 기를 사신으로 변환"
  },
  {
    "id": "ac-slime",
    "key": "slime",
    "name": "슬라임",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 슬라임으로 변환"
  },
  {
    "id": "ac-eagle",
    "key": "eagle",
    "name": "알리바바",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "나이트마다 알리바바 두 기로 분열"
  },
  {
    "id": "ac-parrot",
    "key": "parrot",
    "name": "앵무새",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 앵무새로 변환"
  },
  {
    "id": "ac-transmission-tower",
    "key": "transmission-tower",
    "name": "전송탑",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 전송탑으로 변환"
  },
  {
    "id": "ac-killer",
    "key": "killer",
    "name": "킬러",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "비숍 한 기를 킬러로 변환"
  },
  {
    "id": "ac-revolving-door",
    "key": "revolving-door",
    "name": "회전문",
    "kind": "PIECE",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 회전문으로 변환"
  },
  {
    "id": "ac-don-quixote",
    "key": "don-quixote",
    "name": "돈 키호테",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "룩 한 기를 돈 키호테로 변환"
  },
  {
    "id": "ac-beacon",
    "key": "beacon",
    "name": "신호기",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "룩 한 기를 신호기로 변환"
  },
  {
    "id": "ac-idol",
    "key": "idol",
    "name": "아이돌",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "퀸 한 기를 아이돌로 변환"
  },
  {
    "id": "ac-archbishop",
    "key": "archbishop",
    "name": "아치비숍",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "나이트 희생 · 비숍을 아치비숍으로 합체"
  },
  {
    "id": "ac-undead",
    "key": "undead",
    "name": "언데드",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "퀸 한 기를 언데드로 변환"
  },
  {
    "id": "ac-chancellor",
    "key": "chancellor",
    "name": "챈슬러",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "나이트 희생 · 룩을 챈슬러로 합체"
  },
  {
    "id": "ac-campfire",
    "key": "campfire",
    "name": "캠프파이어",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "마이너 한 기를 캠프파이어로 변환"
  },
  {
    "id": "ac-clockwork",
    "key": "clockwork",
    "name": "태엽인형",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "마이너 한 기를 태엽인형으로 변환"
  },
  {
    "id": "ac-trickster",
    "key": "trickster",
    "name": "트릭스터",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "룩 한 기를 트릭스터로 변환"
  },
  {
    "id": "ac-local-conscription",
    "key": "local-conscription",
    "name": "현지군 징병",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "퀸 한 기를 징집관으로 변환"
  },
  {
    "id": "ac-amazon",
    "key": "amazon",
    "name": "아마존",
    "kind": "PIECE",
    "rarity": "EPIC",
    "passive": false,
    "desc": "나이트 희생 · 퀸을 아마존으로 합체"
  },
  {
    "id": "ac-hook",
    "key": "hook",
    "name": "구행",
    "kind": "PIECE",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "룩 희생 · 퀸을 구행으로 합체"
  },
  {
    "id": "ac-wizard",
    "key": "wizard",
    "name": "마법사",
    "kind": "PIECE",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "퀸 한 기를 마법사로 변환 · 마나와 마법 사용"
  },
  {
    "id": "ac-cleanup-sacrifice",
    "key": "cleanup-sacrifice",
    "name": "강제 교환",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 한 기 희생 · 같은 종류의 무작위 적 한 기 제거"
  },
  {
    "id": "ac-hallucination",
    "key": "hallucination",
    "name": "환각",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "5수 동안 상대 화면에 아군 전부를 퀸으로 표시"
  },
  {
    "id": "ac-icbm",
    "key": "icbm",
    "name": "ICBM",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "퀸 지정 · 다음 자기 턴 상대 퀸에 돌진해 3×3 폭발"
  },
  {
    "id": "ac-death-squad",
    "key": "death-squad",
    "name": "결사대",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 파일의 아군 폰을 광신도로 변환"
  },
  {
    "id": "ac-taboo",
    "key": "taboo",
    "name": "뒤틀린 소환",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "퀸 희생 · 출발점과 선택한 칸에 괴물 소환"
  },
  {
    "id": "ac-stake",
    "key": "stake",
    "name": "말뚝",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "지정한 아군을 4수 고정한 뒤 가호 부여"
  },
  {
    "id": "ac-mutation",
    "key": "mutation",
    "name": "변이",
    "kind": "END",
    "rarity": "COMMON",
    "passive": true,
    "desc": "끝랭크의 폰을 괴물 두 기로 승급"
  },
  {
    "id": "ac-barricade",
    "key": "barricade",
    "name": "엄폐물 설치",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택 칸을 중심으로 가로·세로 세 칸 엄폐물 설치"
  },
  {
    "id": "ac-reverse-pawns",
    "key": "reverse-pawns",
    "name": "폰 방향 반전",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 폰의 다음 세 번 이동 방향 반전"
  },
  {
    "id": "ac-vip",
    "key": "vip",
    "name": "귀빈",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 양측 폰이 3수 생존하면 귀빈으로 변환"
  },
  {
    "id": "ac-homecoming",
    "key": "homecoming",
    "name": "귀환",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "아군 비킹 기물을 빈 시작 칸으로 복귀"
  },
  {
    "id": "ac-lobster",
    "key": "lobster",
    "name": "랍스터",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "선택한 빈칸에 1수 뒤 랍스터 소환"
  },
  {
    "id": "ac-judgment",
    "key": "judgment",
    "name": "레드카드",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "최다 포획 비킹 한 기를 다음 드래프트까지 추방"
  },
  {
    "id": "ac-racing-king",
    "key": "racing-king",
    "name": "레이싱 킹",
    "kind": "END",
    "rarity": "COMMON",
    "passive": true,
    "desc": "아군 킹의 상대 끝랭크 도달 시 승리"
  },
  {
    "id": "ac-witch-trial",
    "key": "witch-trial",
    "name": "마녀재판",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 비킹 한 기를 지목해 마녀재판"
  },
  {
    "id": "ac-reversal",
    "key": "reversal",
    "name": "반전",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "마이너 희생 · 이번 턴 룩과 비숍 행마 교환"
  },
  {
    "id": "ac-chain",
    "key": "chain",
    "name": "사슬",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "두 칸 안의 적 두 기가 서로 멀어지지 못하게 연결"
  },
  {
    "id": "ac-spy",
    "key": "spy",
    "name": "스파이",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대 폰 최대 두 기 지정 · 승급 시 아군으로 전향"
  },
  {
    "id": "ac-underpromotion",
    "key": "underpromotion",
    "name": "언더프로모션",
    "kind": "END",
    "rarity": "COMMON",
    "passive": true,
    "desc": "폰이 마이너로 승급하면 추가 이동"
  },
  {
    "id": "ac-final-weapon",
    "key": "final-weapon",
    "name": "최종병기",
    "kind": "END",
    "rarity": "COMMON",
    "passive": true,
    "desc": "승급선은 끝랭크로 고정 · 아마존 승급 허용"
  },
  {
    "id": "ac-zugzwang",
    "key": "zugzwang",
    "name": "추크츠방",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "상대의 다음 이동을 킹으로 강제"
  },
  {
    "id": "ac-substitution",
    "key": "substitution",
    "name": "치환",
    "kind": "END",
    "rarity": "COMMON",
    "passive": false,
    "desc": "이번 턴 같은 종류의 적과 위치 교환 허용"
  },
  {
    "id": "ac-exile",
    "key": "exile",
    "name": "유배",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "상대 한 기를 빈 시작점으로 복귀시켜 잠시 보호"
  },
  {
    "id": "ac-gale",
    "key": "gale",
    "name": "강풍",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "3수 뒤 서로 떨어진 메이저 기물 제거"
  },
  {
    "id": "ac-resolve",
    "key": "resolve",
    "name": "결의",
    "kind": "END",
    "rarity": "RARE",
    "passive": true,
    "desc": "폰을 잃은 턴의 첫 폰 이동에 추가 행동"
  },
  {
    "id": "ac-palace",
    "key": "palace",
    "name": "궁성",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "적 킹을 현재 위치의 3×3 궁성 안에 가둠"
  },
  {
    "id": "ac-coronation",
    "key": "coronation",
    "name": "대관식",
    "kind": "END",
    "rarity": "RARE",
    "passive": true,
    "desc": "퀸 승급 기물을 다음 자기 턴까지 보호"
  },
  {
    "id": "ac-bina-mate",
    "key": "bina-mate",
    "name": "더블 체크",
    "kind": "END",
    "rarity": "RARE",
    "passive": true,
    "desc": "두 기 이상으로 상대 킹을 동시에 공격하면 승리"
  },
  {
    "id": "ac-desperado",
    "key": "desperado",
    "name": "데스페라도",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 한 기 두 번 이동 뒤 제거 · 적 킹 포획 제외"
  },
  {
    "id": "ac-synchronization",
    "key": "synchronization",
    "name": "동기화",
    "kind": "END",
    "rarity": "RARE",
    "passive": true,
    "desc": "전군이 같은 색 칸에 있으면 반대색 칸에 적 진입 금지"
  },
  {
    "id": "ac-last-resistance",
    "key": "last-resistance",
    "name": "마지막 저항",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "아군 킹에 3수 보호"
  },
  {
    "id": "ac-brutus",
    "key": "brutus",
    "name": "브루투스",
    "kind": "END",
    "rarity": "RARE",
    "passive": true,
    "desc": "무작위 룩을 브루투스로 변환"
  },
  {
    "id": "ac-empty-lunchbox",
    "key": "empty-lunchbox",
    "name": "빈 찬합",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "지정한 적이 3수 안에 자기 킹에 인접하지 못하면 제거"
  },
  {
    "id": "ac-necromancy",
    "key": "necromancy",
    "name": "빙의",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "폰 한 기가 묘지의 아군으로 4수 변신"
  },
  {
    "id": "ac-othello",
    "key": "othello",
    "name": "오델로",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "턴 종료에 양끝 아군 사이의 연속 적 기물을 전향"
  },
  {
    "id": "ac-pegasus",
    "key": "pegasus",
    "name": "유니콘",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "룩 한 기를 유니콘으로 변환"
  },
  {
    "id": "ac-recurrence",
    "key": "recurrence",
    "name": "회귀",
    "kind": "END",
    "rarity": "RARE",
    "passive": false,
    "desc": "무작위 아군 비폰 기물에 회귀"
  },
  {
    "id": "ac-frenzy",
    "key": "frenzy",
    "name": "광란",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "지정된 폰은 이번 턴 포획할 때마다 추가 행동"
  },
  {
    "id": "ac-replay",
    "key": "replay",
    "name": "리플레이",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "마지막 아군 기물 이동을 되돌림"
  },
  {
    "id": "ac-brainwash",
    "key": "brainwash",
    "name": "마인드 컨트롤",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "아군 희생 · 그보다 가치가 낮은 적 한 기 전향"
  },
  {
    "id": "ac-charge",
    "key": "charge",
    "name": "마지막 질주",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "폰 한 기 이번 턴 최대 세 칸 질주 · 승급 실패 시 제거"
  },
  {
    "id": "ac-extinction",
    "key": "extinction",
    "name": "멸종",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "마이너 한 기와 같은 종류의 양측 기물 전부 제거"
  },
  {
    "id": "ac-moving",
    "key": "moving",
    "name": "무빙",
    "kind": "END",
    "rarity": "EPIC",
    "passive": true,
    "desc": "같은 기물을 다섯 번 연속 직접 움직이면 회피"
  },
  {
    "id": "ac-traitor",
    "key": "traitor",
    "name": "변절자",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "이동한 적 중 최소 가치 한 기 전향"
  },
  {
    "id": "ac-bribe",
    "key": "bribe",
    "name": "삼일천하",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "나이트를 3수 동안 아마존으로 변환"
  },
  {
    "id": "ac-baby-bear",
    "key": "baby-bear",
    "name": "아기곰",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "퀸 희생 · 아기곰 소환 · 7수 생존하면 곰"
  },
  {
    "id": "ac-gomoku",
    "key": "gomoku",
    "name": "오목",
    "kind": "END",
    "rarity": "EPIC",
    "passive": true,
    "desc": "아군 기물 다섯 기가 세로로 연속하면 승리"
  },
  {
    "id": "ac-hypocrisy",
    "key": "hypocrisy",
    "name": "위선",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "선택한 빈칸 네 곳에 상대 폰 소환"
  },
  {
    "id": "ac-fleeting-dream",
    "key": "fleeting-dream",
    "name": "일장춘몽",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "상대 승급 기물을 전부 폰으로 되돌림"
  },
  {
    "id": "ac-conscription",
    "key": "conscription",
    "name": "징집",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "아군 폰 시작 줄 c·d·e·f의 빈칸에 폰 충원"
  },
  {
    "id": "ac-portal-gun",
    "key": "portal-gun",
    "name": "포탈 건",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "두 칸 지정 · 다음 자기 턴에 포탈 개통"
  },
  {
    "id": "ac-black-magic",
    "key": "black-magic",
    "name": "흑마법",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "아군 킹 옆 빈칸에 아군 괴물 소환"
  },
  {
    "id": "ac-hope",
    "key": "hope",
    "name": "희망",
    "kind": "END",
    "rarity": "EPIC",
    "passive": true,
    "desc": "자기 턴 시작에 킹 포함 아군 두 기 이하라면 승리"
  },
  {
    "id": "ac-leap",
    "key": "leap",
    "name": "도약",
    "kind": "END",
    "rarity": "EPIC",
    "passive": true,
    "desc": "폰에 적을 뛰어넘는 비포획 전진 추가"
  },
  {
    "id": "ac-collapse",
    "key": "collapse",
    "name": "붕괴",
    "kind": "END",
    "rarity": "EPIC",
    "passive": false,
    "desc": "다음 턴 바깥 테두리 붕괴 · 끝에서 두 번째 줄이 승급선"
  },
  {
    "id": "ac-vanish",
    "key": "vanish",
    "name": "소멸",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "자기 턴마다 무작위 아군 한 기 소멸"
  },
  {
    "id": "ac-joker",
    "key": "joker",
    "name": "조커",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "사용한 발동형 카드 한 장 재충전"
  },
  {
    "id": "ac-prophecy",
    "key": "prophecy",
    "name": "종전",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "3수 연속 포획·체크가 없으면 승리"
  },
  {
    "id": "ac-ultimatum",
    "key": "ultimatum",
    "name": "최후 통첩",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "4수 뒤 그동안 움직이지 않은 비킹 기물 제거"
  },
  {
    "id": "ac-clone",
    "key": "clone",
    "name": "복제",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "상대의 현재·미래 지속형 효과 모두 복제"
  },
  {
    "id": "ac-blue-jeans",
    "key": "blue-jeans",
    "name": "청바지",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "양측 메이저 기물 전부 추방"
  },
  {
    "id": "ac-canceling",
    "key": "canceling",
    "name": "캔슬링",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": false,
    "desc": "캐슬링한 상대 킹을 원래 시작점으로 강제 복귀"
  },
  {
    "id": "ac-highlander",
    "key": "highlander",
    "name": "하이랜더",
    "kind": "END",
    "rarity": "LEGEND",
    "passive": true,
    "desc": "아군이 네 종류 이상이고 종류가 하나도 중복되지 않으면 승리"
  }
];
