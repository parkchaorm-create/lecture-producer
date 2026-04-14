# SVG Design Rules (SVG 인포그래픽 디자인 규칙)

> `svg-designer` 에이전트의 필수 참조 문서. 모든 SVG는 이 규칙을 따른다.

## 불변 0조 · CSS 애니메이션 클래스 금지 (2026-04-13 신설)

**SVG `<g>` 또는 `<text>` 등 요소에 애니메이션 클래스(`svg-stagger`·`svg-pulse`·`svg-rotate-slow` 등)를 부여하지 말 것.**

이유:
- CSS `transform` 속성은 SVG `transform` 속성을 **덮어씀**(CSS spec)
- `class="svg-pulse"` + `transform="translate(210 100)"` 조합 시 → CSS 애니메이션의 `transform: scale(...)`이 SVG 좌표를 무효화
- 결과: 요소가 viewBox 임의 위치(주로 좌상단)로 이동, 다른 요소와 겹침
- 정적 강의 자료에서는 애니메이션이 본질적이지 않음

대체:
- 시각 강조가 필요하면 `stroke-width`·`opacity`·`fill` 차이로
- 정렬 위치는 `transform="translate()"` SVG 속성으로만
- 정말 애니메이션이 필요하면 외부/내부 `<g>` 분리: `<g transform="..."><g class="svg-pulse">...</g></g>`

검증: `.claude/scripts/strip-svg-animations.mjs`로 일괄 제거 가능.

## 불변 1조 · 제네릭 SVG 생성 금지

다음 패턴은 **절대 생성 금지**:
- ❌ 거대한 물음표 `?` (font-size 90+ with pulse)
- ❌ CORE 중앙 + 왜/무엇/어떻게/결과 4원형
- ❌ META + INFO 동심원 + 4코너박스
- ❌ 의미 없는 별 모양 / 십자 / 장식 도형만 있는 SVG
- ❌ 슬라이드 내용과 무관한 패턴

## 기본 규칙

### 크기
- `viewBox="0 0 400 260"` **고정** (예외 없음)

### 색상 (design-tokens.md 참조)
- 오직 `#e2c793`, `#F7F0DF`, `#7a7666`, `#3a3730`
- 다른 색상 사용 시 실패

### 텍스트
- 최소 `font-size="11"`
- 권장: 12~18px (메인), 11px (보조 라벨)
- 한 SVG당 `<text>` 최대 8개 (초과 시 분할)

### 도형 다양성
- circle 점유율 50% 이하 (단조로움 방지)
- rect, line, path, polygon 혼합 사용

## 아키타입 9종 (A1~A9)

모든 SVG는 아래 9개 아키타입 중 하나를 기반으로 파트별 커스터마이징:

### A1 · COMPARE_DUAL — 2열 대비
- 용도: "X vs Y" 대조
- 슬롯: LEFT_LABEL, RIGHT_LABEL, VERDICT (중앙)
- 예: ChatGPT vs Claude Code, 이론 vs 실전

### A2 · TIER_PILLAR — 계단 티어
- 용도: 요금제, 레벨, 등급
- 슬롯: TIER_NAMES[3~4], TIER_VALUES, HIGHLIGHT_INDEX
- 예: Free/Pro/Max

### A3 · FLOW_CHAIN — 단계별 흐름
- 용도: 프로세스, 순차 작업
- 슬롯: STEP_LABELS[3~5], ARROW_STYLE
- 예: 발행→수집→채점→분석→개선

### A4 · TIMELINE — 시간축
- 용도: 일정, 타임라인, 진행
- 슬롯: TIME_MARKERS, EVENT_LABELS
- 예: Day 1-7 플랜, 월~일 사이클

### A5 · METRIC — 수치 강조
- 용도: 숫자, 퍼센트, 카운트
- 슬롯: BIG_NUMBER, UNIT, CONTEXT_LABEL
- 예: "80% 제거", "16개 결과물"

### A6 · CHECK_MATRIX — 체크리스트
- 용도: 검증, 요건, 완료 여부
- 슬롯: ITEMS[], STATUS[] (✓/✗)
- 예: SEO 건강검진 항목, 10개 이진 평가

### A7 · TREE_NODE — 계층/조직도
- 용도: 폴더 구조, 팀 조직, 트리
- 슬롯: ROOT, CHILDREN[]
- 예: Knowledge 폴더 구조, 6명 에이전트 팀

### A8 · GAUGE — 게이지/스코어
- 용도: 측정값, 점수, 신뢰도
- 슬롯: VALUE, MAX, THRESHOLDS
- 예: 아웃라이어 스코어, 95% 신뢰도

### A9 · METAPHOR — 은유 도해
- 용도: 위 8개에 맞지 않는 모든 비유적 시각화
- 슬롯: 자유
- 예: 오케스트라 배치도, 트럼펫, 도서관 선반

## 애니메이션 클래스 (필수 최소 1개)

CSS 클래스 기반:
- `svg-stagger` — 순차 등장 (animation-delay로 제어)
- `svg-pulse` / `svg-pulse2` — 맥박 효과
- `svg-draw` / `svg-draw-path` — 선 그리기
- `svg-check-mark` — 체크 마크 등장
- `svg-countup` — 숫자 카운트업 (data-target 속성)
- `svg-spin` — 회전
- `svg-ripple` — 파문
- `svg-progress` — 프로그레스 바
- `svg-rotate-slow` — 느린 회전
- `svg-twinkle` — 반짝임

## 고급 SVG 기법 (세련된 연출)

각 SVG에 최소 1개 적용 권장:
- `stroke-dasharray` + `stroke-dashoffset` → 선 그리기 효과
- `<animate>` → 속성 변경 애니메이션
- `<animateTransform>` → 이동/회전/스케일
- `clipPath` → 점진적 공개 효과
- `<linearGradient>` / `<radialGradient>` → 그라데이션 (승인 색상만)
- `<filter>` → 블러, 그림자 (필요 시)

## 슬라이드 유형별 SVG 방향

### META 슬라이드
- 파트 핵심 비유를 아이콘화
- 메타 정보 박스 (TIME, METAPHOR, GOAL, TOOLS) 주변 배치
- 중앙에 파트 상징 아이콘

### HOOK 슬라이드
- Before/After 비교
- VS 다이어그램 (A1 아키타입)
- 문제 → 해결 전환
- 임팩트 있는 1~2개 큰 요소

### CONCEPT 슬라이드
- 콘텐츠에 **정확히 맞는 전용 도해** (가장 중요)
- A1~A9 중 콘텐츠에 맞는 아키타입 선택
- 슬라이드의 bullet 내용을 시각화

### RECAP 슬라이드
- 핵심 요약 카드 3개 (가로 정렬)
- 완료 배지 또는 프로그레스
- 성취감 있는 마무리 비주얼

### BRIDGE 슬라이드
- 현재 파트 아이콘 → 다음 파트 아이콘
- 진행률 (ACT 내 위치)
- 화살표/전환 애니메이션

## 재사용 우선순위 (우선 검색)

1. `input/reference-ppt/`에서 유사한 SVG 찾기 (스타일 참조)
2. `assets/svg_components/index.json` 라이브러리 검색 (키워드 매칭)
3. 매칭 있으면 재사용 (슬롯만 교체)
4. 매칭 없으면 아키타입 기반 신규 생성

## 파트 경계 넘어 중복 감사 (2026-04-14 도입 · 10인 회의 P1)

`deck-outline.md` 작성 시 **인접 파트 경계**도 감사:
- part-N 마지막 CONCEPT 아키타입 = part-(N+1) 첫 CONCEPT 아키타입 **금지**
- 휴식을 사이에 두더라도 수강생 시각 기억은 이어짐
- 같은 회차 전체에서 동일 아키타입 3회 초과 사용 시 경고
- 검증: `deck-outline.md`의 아키타입 배정 컬럼을 파트 순서로 스캔 → 경계 동일성 + 회차 누적 카운트

## 고유성 검증

- 생성 후 SVG content hash (SHA-256, whitespace-normalized) 계산
- 기존 SVG와 중복 검사
- **프로젝트 내 중복률 5% 초과 시 실패**
- 실패 시 svg-designer 에이전트 재호출 (다른 아키타입 또는 슬롯 변형)

## Part-01 레퍼런스 예시

`ppt_parts/part-01.html` 또는 `input/reference-ppt/*.html`의 SVG 스타일을 따름:
- 섬세한 stroke-width (1~2px)
- 계층적 레이어 (배경 원 → 주요 도형 → 텍스트 → 강조)
- 애니메이션 조합 (svg-stagger + 개별 animation-delay)
- 테두리와 opacity로 깊이감

## 검증

- 생성 SVG → content hash → 중복 검출
- grep으로 금지 색상 검출: `#[0-9a-fA-F]{6}` 중 팔레트 외
- grep으로 font-size < 11 검출
- grep으로 viewBox 불일치 검출

## 참조
- `.claude/rules/design-tokens.md` — 색상/크기 SSOT
- `.claude/rules/style-reference.md` — 레퍼런스 PPT 추출
- `.claude/agents/svg-designer.md` — 에이전트 정의
- `assets/ARCHETYPE_CATALOG.md` — 아키타입 상세 정의
