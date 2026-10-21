# AUGMENT CHESS · 증강체스

[플레이하기](https://leejuhan-1214.github.io/augment-chess/?v=3.0.0)

한국어 브라우저 체스 게임. v3.0.0은 augmentchess.org의 공개 카드 목록
272종을 바탕으로 독립 구현한 카드 모드를 기본으로 사용합니다.

- RULE 27 · OPENING 42 · MIDDLE 97 · PIECE 43 · END 63
- 카드 도감: 이름/효과 검색, 분류/희귀도 필터, 개별 카드 AI 연습
- 시작 전, 10수, 20수에 카드 선택. 마지막에는 일반 등급 제외
- 킹 포획 승리, 특수 승리, 지연 효과, 복수 대상 카드, 특수 기물/지형
- 카드 대부분은 이동과 별도로 발동. 프리무브/트롤리는 턴 전체 사용
- 마법사/상인/통나무 조작 버튼, 선택 승급, 캐슬링 버튼과 킹→룩 단축 조작
- 이전 16종은 별도 연습 및 저장된 이전 대전 복원 지원

원본과 완전히 같은 판정을 보장하는 공식 포트는 아닙니다. 일부 기물의
세부 능력과 희귀한 카드 조합에는 차이가 있습니다. 원본의 코드/일러스트/
로고는 복사하지 않았으며 카드 설명은 효과를 기준으로 다시 작성했습니다.
출처와 범위: [CARD-SOURCES.md](CARD-SOURCES.md).

## 대전

AI 연습과 같은 화면 로컬 2인을 지원합니다. 온라인은 8자리 코드/링크로
친구를 초대하는 PeerJS/WebRTC 방식입니다. 양측이 연결되면 카드 선택이
자동으로 시작됩니다. 별도 대전 모드 선택은 없습니다.

**알려진 온라인 문제:** 네트워크가 다른 두 기기 사이에서 방 코드가 같아도
연결이 완료되지 않는 문제가 남아 있습니다. 이 카드 업데이트는 그 문제를
해결한 릴리스가 아닙니다. 실험 중인 HTTPS 중계 클라이언트는 활성화하지
않았습니다. 같은 탭 새로고침 시 24시간 내 저장된 대전의 복원을 시도합니다.

## 실행/검사

Node.js 20 이상. 별도 패키지 설치/빌드 없이 정적 파일로 실행합니다.

```sh
node serve.mjs
node --test engine.test.js variant-engine.test.js network.test.js ui-rules.test.js online-session.test.js app-online.test.js
```

총 91개 검사: 기존 체스/통신 회귀, 카드 전체 목록·효과 등록, 초기 지속효과,
특수능력 시나리오, 결정론적 혼합 대국 및 JSON 스냅샷 왕복을 포함합니다.
모든 카드 조합을 전수 검증한 것은 아닙니다.

## 파일

- game-engine.js: 저장된 대전의 규칙 버전에 따라 엔진 선택
- variant-engine.js / variant-core.js / variant-effects.js: 새 카드 규칙
- original-cards.js / variant-cards.js / variant-pieces.js: 카드/기물 정의
- engine.js: 기존 16장 대전 규칙, 복원 호환용
- app.js / style.css / viewport.css / abilities.css: 화면과 조작
- network.js / online-session.js: 온라인 전송 및 복원

GitHub Pages: main 브랜치 루트 정적 배포. PeerJS의 라이선스는
PEERJS-LICENSE를 참고하세요.
