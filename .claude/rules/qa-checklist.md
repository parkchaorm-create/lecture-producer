# QA Checklist (품질 검증 체크리스트)

> `qa-validator` 에이전트가 모든 항목을 실행. 하나라도 실패하면 전체 실패.

## 섹션 A: 사전 예방 (생성 중 에이전트가 준수해야 함)

### A0. Phase 0 사전 설계 산출물 (2026-04-13 도입 · 의무)

> 도입 근거: `.claude/rules/_meetings/2026-04-13_ppt-tutorial-design-upgrade.md`
> 상세 규칙: `.claude/rules/ppt-design-pre-flight.md` · `.claude/rules/tutorial-design-pre-flight.md`

**PPT 트랙 (필수 6)**:
- [ ] `_design/reference-lock.json` 존재 + 현재 `input/reference-ppt/` 해시와 일치
- [ ] `_design/deck-outline.md` 존재 + 파트 수 일치 + 아키타입 배정 존재
- [ ] `_design/content-policy.md` 존재 + 시간/이모지/톤/숫자/외래어 5개 항목 체크
- [ ] `_design/visual-language-meeting.md` 존재 + 4인 이상 서명
- [ ] `_design/regression-briefing.md` 존재 + 최소 3건
- [ ] `_design/density-budget.json` 존재 + concept/recap/hook 키 모두 있음

**튜토리얼 트랙 (파트별 필수 5, DEMO 있는 파트만)**:
- [ ] `input/materials/ui-captures/` 필요 도구별 존재
- [ ] `_design/failure-scenarios-<part>.md` 10개 이상
- [ ] `_design/walkthrough-<part>.log` 최종 성공 표기
- [ ] `_design/tutorial-meeting-<part>.md` 4인+ 서명
- [ ] `_design/user-check-<part>.md` 3개 질문 모두 "예"

**위반 시**: [A0-FAIL] 표시 + 파이프라인 2단계 진입 차단. 사용자에게 Phase 0 실행 요청.

### A1. 구조 정규화
- [ ] `script_parts/ACT{1~4}-*/` 4개 폴더 존재
- [ ] 각 ACT 폴더에 최소 1개 `part-*.md` 파일
- [ ] `script_parts/_act_map.json` 유효
- [ ] 각 파트에 `[HOOK]`, `[CONCEPT]`, `[RECAP]`, `[BRIDGE]` 섹션 존재 (DEMO는 선택)
- [ ] 스크립트 파트 수 == slide_plan JSON 수 == PPT HTML 수

### A2. 디자인 토큰 준수
- [ ] 모든 색상이 `#e2c793`, `#F7F0DF`, `#7a7666`, `#3a3730` 또는 CSS 변수
- [ ] `viewBox="0 0 400 260"` 고정
- [ ] SVG 텍스트 `font-size >= 11`
- [ ] 폰트: Pretendard Variable

### A3. 불릿 규칙
- [ ] bullet-text 20~30자
- [ ] bullet-text 패턴: `{이모지} {키워드} · {핵심}`
- [ ] bullet-detail 1~2문장, 구어체
- [ ] bullet-detail 근거가 스크립트 원문에 존재
- [ ] section-title 15자 내외
- [ ] 마크다운 잔재 없음 (`**`, `[](` 등)

### A4. HTML 구조
- [ ] 화살표 `→` 사용 (`↓` 금지)
- [ ] `toggle-btn` 클래스 없음
- [ ] 별도 bullet-arrow JS 핸들러 없음
- [ ] tilt-card 클릭 핸들러 정상 존재
- [ ] `data-slide`, `data-diagram` 속성 정확
- [ ] section-counter 포맷 `NN / NN` 정확
- [ ] thumb-strip 전체 슬라이드 반영

### A5. SVG 고유성
- [ ] 제네릭 패턴 금지 (거대 ?, CORE+4원형, META 동심원+4코너박스)
- [ ] 프로젝트 내 SVG content hash 중복률 5% 이하
- [ ] 각 SVG에 애니메이션 클래스 최소 1개 (svg-stagger 등)

### A6. 스타일 레퍼런스 준수 (2026-04-14 개정 · 공통 에셋 링크 방식)
- [ ] `<link rel="stylesheet" href="<ASSET_PREFIX>/common.css">` 포함
- [ ] `<script src="<ASSET_PREFIX>/common.js"></script>` 포함
- [ ] 인라인 `<style>...</style>` / 대용량 `<script>...</script>` 블록 없음
- [ ] `<body data-bg-mode="FLOW|WAVES|VORONOI|NETWORK|CONSTELLATION">` 속성 존재
- [ ] 배경 레이어 (bgcanvas, dot-grid, vignette) 포함
- [ ] 커스텀 커서 요소 포함
- 예외: 2026-04-14 이전 생성된 `output/<slug>/*/PPT/*.html`은 인라인 유지 허용 (소급 적용 제외)

## 섹션 B: 사후 검증 (생성 완료 후 자동 실행)

### B1. 런타임 안전성
- [ ] JS 구문 유효 (Node `--check` 통과)
- [ ] 고아 `});\n\n\n});` 패턴 없음
- [ ] 브라우저에서 까만 화면 발생 안 함 (Playwright 테스트)
- [ ] 콘솔 에러 0건

### B2. 상호작용 동작
- [ ] 불릿 클릭 시 bullet-detail 펼침 동작
- [ ] 키보드 단축키 동작 (←/→, F, T, ?)
- [ ] 썸네일 스트립 네비게이션 동작
- [ ] 도움말 오버레이 동작

### B3. SVG 렌더링 (시각 검증 · 2026-04-13 추가)
- [ ] 모든 SVG viewBox 유효
- [ ] 애니메이션 재생 확인
- [ ] 텍스트 가독성 (80% 화면 크기에서 읽힘)
- [ ] 색상 팔레트 일관성

**📸 필수: Playwright 시각 캡처 검증** (상세 방법론: `.claude/rules/visual-verification.md`)
좌표 분석(정적)만으로는 이모지 렌더링, 폰트 실제 크기, 브라우저 자동 줄바꿈, 배경 장식 침투 등을 놓칠 수 있습니다. 각 회차 QA 시 반드시 시각 캡처를 수행:

```bash
# 1. Playwright 설치 (최초 1회)
npm install --save-dev playwright
npx playwright install chromium

# 2. 대상 폴더 지정해 캡처
node .claude/scripts/capture-ppt-slides.mjs \
  --dir output/<slug>/01강_AI핵심과_자기소개/PPT \
  --out _viz_review
```

**시각 체크 항목** (각 PNG를 열어 육안 확인):
- [ ] 텍스트가 도형 경계 밖으로 삐져나감 → 좌표 수정
- [ ] 텍스트 ↔ 텍스트 겹침
- [ ] 이모지가 도형 중앙 이탈
- [ ] 화살표가 목표 도형과 연결되지 않음
- [ ] 레이아웃 비대칭·기울어짐
- [ ] 정지 상태에서 요소가 안 보임 (애니메이션 의존)
- [ ] 배경 대비 부족 (`#e2c793` 텍스트가 배경 링·도트에 묻힘)
- [ ] 자동 줄바꿈으로 단어 끊김
- [ ] 여백 부족 (≤2px)

**실패 시**: 해당 슬라이드 SVG의 좌표 조정 → svg-designer 에이전트 호출 또는 수동 Edit. 재캡처하여 확인.

**과거 발견 사례 (2026-04-13)**:
- Part 01 slide-03 (37회 운영 규모): 상단 카드가 빅넘버 `37`과 겹침 → y 좌표 하향 조정
- Part 01 slide-10 (BRIDGE): 배지가 PART 01 아이콘 위 이중 렌더링 → 배지 요소 제거, 아이콘 단독 배치
- Part 05 slide-01 (META): 좌측 배지가 배경 동심원 위에 놓여 대비 부족 → 불투명 배경 rect 추가
- Part 06 slide-03 (Stitch): 상단 경고 박스가 URL 바와 겹침 → URL 바 y 46→70 하향
- Part 06 slide-05 (Slack Upload): 체크 카드가 헤더와 밀집 → 카드 y 일괄 +12px

### B4. 파일 정합성
- [ ] 모든 파트 HTML 생성됨
- [ ] `index.html` 썸네일 업데이트됨
- [ ] `_act_map.json` 참조 유효
- [ ] 깨진 링크 없음 (각 파트의 이전/다음 링크)

## 섹션 C: 과거 버그 사례 (절대 재발 금지)

### C1. BULLET TOGGLE JS 제거 시 고아 `});` 잔류
- **증상**: 화면이 까맣게 나옴 (JS 구문 에러로 전체 스크립트 중단)
- **원인**: 별도 `.bullet-arrow` forEach 블록 제거 시 닫는 `});`만 남음
- **검증 방법**: `grep -Pzo '(?s)\}\);\s*\n\s*\n\s*\n\s*\}\);' file.html`
- **예방**: 별도 bullet-arrow 핸들러를 **애초에 추가하지 않음**

### C2. 85% SVG가 5개 패턴 반복
- **증상**: 시각적 단조로움, 내용 전달 실패
- **원인**: 아키타입 없이 제네릭 템플릿 복사
- **검증 방법**: SVG content hash 계산 → 중복률 측정
- **예방**: 아키타입 기반 + 내용 맞춤 + 고유성 hash 검증

### C3. Part-01 텍스트 수정 시 기준 무너짐
- **증상**: 레퍼런스로서 가치 상실
- **원인**: 기준 파일에 에이전트 생성물 덮어씀
- **예방**: Part-01은 SVG 인포그래픽만 수정 허용, bullet/텍스트/구조 불변

### C4. 카운터 불일치
- **증상**: "05 / 07" 인데 실제 섹션 6개
- **원인**: 슬라이드 추가/제거 시 카운터 재계산 누락
- **검증 방법**: 섹션 수 카운트 vs 마지막 카운터 NN 비교
- **예방**: 카운터 자동 계산 로직 사용

### C5. DEMO 섹션 PPT에 포함
- **증상**: 불필요한 시연 내용이 PPT에 나옴
- **원인**: DEMO 라인 번호 기록 누락
- **예방**: script-splitter가 DEMO 라인 반드시 기록, slide-planner가 제외

### C6. 화살표 `↓` 잔존
- **증상**: 스타일 비일관성
- **원인**: 구버전 스크립트 잔재
- **검증 방법**: `grep -c 'bullet-arrow">↓' ppt_parts/*.html` → 0이어야 함

## 섹션 D: 실패 시 복구 경로

### D1. 구조 정규화 실패
→ `script-splitter` 에이전트 재실행 (다른 파티셔닝 전략 사용)

### D2. 불릿 규칙 위반
→ `bullet-writer` 에이전트 해당 파트만 재실행

### D3. SVG 중복
→ `svg-designer` 에이전트가 다른 아키타입/슬롯 조합으로 재생성

### D4. HTML 런타임 에러
→ `html-renderer` 에이전트 재실행, 템플릿 강제 reset

### D5. 스타일 레퍼런스 불일치
→ `input/reference-ppt/` 재확인, style-reference 규칙 재적용

## 실행 방법

### 전체 검증
```bash
# 사전 + 사후 + 과거 버그 모두 체크
grep -rc 'bullet-arrow">↓' ppt_parts/                # 0이어야 함
grep -rc 'toggle-btn' ppt_parts/                     # 0
grep -rc "querySelectorAll('\.bullet-arrow')" ppt_parts/  # 0
# SVG 해시 중복 검출 (별도 스크립트)
# Playwright 렌더 테스트
```

### 에이전트 자가 검증
각 에이전트는 작업 완료 후 관련 항목을 자가 점검한 뒤 상위 에이전트에게 보고.

## 참조
- `.claude/agents/qa-validator.md` — 검증 에이전트 정의
- `.claude/rules/design-tokens.md` — 디자인 토큰
- `.claude/rules/bullet-writing.md` — 불릿 규칙
- `.claude/rules/svg-design.md` — SVG 규칙
- `.claude/rules/html-structure.md` — HTML 규칙
