# Changelog

## [1.4.0] · 2026-04-15 · 대시보드 UX 대개조 · 왕초보 친화

### 구조 재편 (6인 UX/UI 회의 결과 적용)
- **HOME** = 오로지 "새 강의 만들기" 전용 페이지 (마법사 + 실시간 실행)
- **내 강의** (구 NEW · `#/my`) = 생성된 강의 목록 + 큰 진행바 + 클릭해 자료 프리뷰
- **시스템** (`#/system`) = 그대로 유지
- 네비 라벨 전면 한글화: `✨ 새 강의 만들기` · `📚 내 강의` · `⚙ 시스템`

### 홈 · 4단계 마법사 (왕초보 1인 강사 기준)
1. 📂 **강의 자료 넣기** — 파일 드래그 드롭 + URL 추가
2. 🎨 **내 브랜드 넣기 (건너뛰기 가능)** — 로고·보이스·색상 파일 업로드 또는 기본 스타일
3. 🎨 **슬라이드 디자인 고르기** — 테마 카드 (radiogroup · 방향키)
4. 📝 **강의 기본 정보** — 강의 이름·몇 강·누구용 (쉬운 한글)
- 💰 **예상 비용 실시간 표시**
- ⚙️ 고급 옵션 접힘 상자 (배치 할인·퀴즈·노션·공개)
- 🚀 강의 만들기 시작 버튼 · 클릭하면 바로 SSE 실행
- 📊 **단계별 진행바** (📥 자료 분석 → 🧠 전문가 회의 → 📝 스크립트 → 🎨 PPT → 🛠 실습)
- ❌ 명령어 복사 버튼 제거 (왕초보 혼선)

### 내 강의 (`#/my`)
- 강의 카드: 10px gold-soft 진행바 + 📝 스크립트·🎨 PPT·🛠 튜토 카운트
- 상태 배지: ✅ 완료 / ⏳ 진행 중 / 📋 준비
- 카드 클릭 → 기존 `#/lecture/<slug>` 탭 프리뷰 (PPT iframe 포함)

### 서버 · 신규 API
- `POST /api/brand-upload?slug=<brand>` — 브랜드 에셋 업로드 · `brand.yaml` 스텁 자동 생성

### 접근성 (WCAG AA 강화)
- 모든 input ↔ label `for` 연결
- 테마 카드 `role="radio"` · `aria-checked` · 방향키 이동
- SSE 로그 pane `aria-live="polite"`
- 마법사 Step `role="group"` + `aria-labelledby`

### 문서
- `.claude/rules/_meetings/2026-04-15_dashboard-ux-v1.4.md` 6인 회의록 신설

---

## [1.3.0] · 2026-04-14 · 로컬 대시보드 (Zero-dependency)

### 추가 · 대시보드
- `dashboard/server.mjs` — Node 내장 http만 · 127.0.0.1:3737 로컬 바인딩
- `dashboard/public/` — Vanilla JS SPA · 파자마보스 테마 재활용 · 빌드 단계 0
- `dashboard/README.md` — 실행·Exec 모드·API 가이드
- `package.json` 신규 · `npm run dashboard`·`lint`·`cost` 등

### 4 페이지 · 모든 페이지 즉시 반영
- `#/` Home — 강의 카드 그리드 + 진행률 + 요약 통계
- `#/new` 신규 — 폼 + 실시간 비용 미리보기 + ▶ 실행 버튼 (SSE 로그)
- `#/lecture/<slug>` 강의 상세 — 강 카드 그리드 (스크립트·PPT·튜토 완료 상태 표시)
- `#/lecture/<slug>/part/<N>` 강별 상세 — PPT iframe + 스크립트·튜토·피드백 탭
- `#/system` 시스템 — Lint 4종·Smoke·비용·브랜드/테마 갤러리

### ▶ 실행 모드 (Exec)
- `.claude/local-config.json`의 `dashboard.allowExec: true`로 활성
- 버튼 → 서버가 `claude -p` spawn → SSE 실시간 로그 스트리밍
- 비활성 시 📋 명령어 복사 폴백
- command 화이트리스트(`claude`·`node`만) · path traversal 차단

### 토큰 비용
- 대시보드 **자체: 0원** (로컬 Node · Claude 호출 없음)
- ▶ 실행 시에만 해당 파이프라인 비용 (v1.2 --batch ~$9.87/6강)

### smoke 94/94 통과
v1.2의 87 + 대시보드 검증 7 = 94

### v1.2 → v1.3 Upgrade
```bash
git pull origin master
npm run smoke       # 94/94 확인
npm run dashboard   # → http://127.0.0.1:3737
```
기존 CLI·output/·brand-context/ 모두 그대로 동작. 대시보드는 opt-in.

---

## [1.2.0] · 2026-04-14 · 토큰 최적화 -50% + 브랜드 컨텍스트 체계

### 추가 · 토큰 최적화 (O8~O15 · 3인 전문가 토론 합의)
- **O8** 규칙 XML 섹션화 — bullet-writing·svg-design·html-structure 인덱스 태그로 선택 로드 가능
- **O9** Few-shot 하이브리드 — 처음 3건 본문 + 이후 구조 JSON (`templates/fewshot-structured.json`)
- **O10** Phase 0 glossary 공유 — `shared/phase-0-glossary.md` 1곳에 통합
- **O11** 프롬프트 캐시 구조 강제 — `.claude/rules/cache-structure.md` SSOT + 에이전트 frontmatter `cache_blocks:`
- **O12** 모델 분배 활성화 — `.claude/models.json` + `rules/model-allocation.md` (qa-validator Haiku·lecture-writer Opus 등)
- **O13** 배치 API 도입 — `.claude/scripts/batch-orchestrator.mjs` + `--batch` 플래그 · 2~N강 50% 단가
- **O14** 호출 통합 — `.claude/agents/slide-composer.md` (slide-planner + bullet-writer 통합) + `--plan-only` legacy
- **O15** Extended thinking 선별 적용 — expert-council·lecture-writer·svg-designer frontmatter 활성

### 추가 · 브랜드 컨텍스트 체계 (사용자 지적 반영)
- `brand-context/_template/` — 신규 브랜드 복사 원본 (brand.yaml·profile·assets/logo·copy·channels·tokens)
- `brand-context/_default/` — 공백 시 자동 폴백 중립 브랜드
- `.claude/agents/brand-injector.md` — PPT Cover·META·Foot·Outro + 튜토리얼 md 헤더/푸터 주입
- `.claude/commands/init-brand.md` — `/init-brand <slug>` 인터뷰 생성
- `.claude/rules/brand-context.md` — 3계층 독립성 SSOT (오디언스 × 브랜드 × 테마)
- `.claude/scripts/brand-context-lint.mjs` — 필수 파일·SVG 규격·저작권·치환 변수 검증
- qa-checklist A12 · 브랜드 적용 정합성

### 추가 · 파이프라인 개선
- `expert-council` 2차 회의 **diff-only 모드** (T3-C) — 1차 대비 -53% 입력
- `qa-validator` **증분 검증 모드** (T3-D) — 이전 파트 캐시 재사용
- `svg-designer` **파트 단위 일괄** (T3-A) — 슬라이드 9회 → 파트당 1회
- `produce-lecture` 플래그 확장 — `--batch`·`--plan-only`·`--brand`·`--deploy`

### 추가 · GitHub Pages 자동 배포
- `.claude/scripts/deploy-ppt.mjs` — 3가지 target 모드 (worktree · separate · local)
- `.claude/skills/deploy-ppt/SKILL.md` — `/deploy-ppt <slug>` 진입점
- **자동 상대경로 rewrite** — `../../../assets/...` → `./assets/themes/pajamaboss/...` 평탄화 (배포 구조 불일치 해결)
- `.nojekyll` 자동 삽입 · 루트 `index.html`에 강의 목록 자동 생성 (worktree 모드)

### 실측 효과 (`cost-estimator.mjs 6`)
- v1.0 추정: $25 · v1.1 실측: $19.93 · **v1.2 (no batch): $15.69** · **v1.2 --batch: $9.87**
- v1.1 대비 -21% (일반) · **-50% (배치 모드)**

### 규칙·문서 갱신
- `rules/quality-method.md` — K5 실측 우선·K6 회귀 주입 디테일 완성
- `rules/qa-checklist.md` — A10 통과율·A11 접근성·A12 브랜드 섹션 추가
- `rules/bullet-writing.md`·`svg-design.md`·`html-structure.md` — XML 섹션 인덱스

### 테스트
- `tests/e2e/smoke.mjs` — 58+ 항목 (v1.1 53 + v1.2 신규 검증)
- v1.2 brand-context-lint·cost-estimator --batch 자동 실행

### Upgrade
- v1.1 → v1.2 무중단. 기존 `output/`·`_design/` 호환. 새 기능 전부 opt-in.
- 브랜드 컨텍스트는 `--brand` 미지정 시 `_default` 자동 폴백 · 에러 아님

---

## [1.1.0] · 2026-04-14 · 퀄리티 자동 보증

### 추가 · 검증 스크립트 4개
- `cost-estimator.mjs` — 파트 수 기반 단계별 예상 토큰·비용 표시 (B4)
- `citation-check.mjs` — 사실 주장 `[src:N]` 부착 자동 검증 (E6)
- `similarity-check.mjs` — 골드 샘플 대비 유사도 점수 (K2)
- `diff-capture.mjs` — Playwright 기반 expected vs actual 시각 diff HTML (E4)

### 추가 · 자동화 스크립트
- `backup.mjs` — create/list/rollback 3개 명령, `_backup/<ts>/` 자동 (B5)
- `regression-briefing.mjs` — visual-verification + 이전 _postmortem에서 HIGH 사례 추출 주입 (K6)

### 추가 · 규칙
- `accessibility.md` — SVG title·desc·WCAG AA·키보드·ARIA·prefers-reduced-motion·OS forced-color 대응 (F3)
- `quiz-slide.md` — `--with-quiz` 플래그 시 강 끝 평가 슬라이드 3유형 (F5)
- qa-checklist A10(통과율) · A11(접근성) 섹션 신설

### 추가 · 콘텐츠 골드
- `samples/_gold-standard/content/README.md` + `bullet-examples.md` (가공 빵집 도메인 15 예시)

### 추가 · 공식 Skill 표준 이전
- `.claude/skills/produce-lecture/SKILL.md`
- `.claude/skills/analyze-framework/SKILL.md`
- `.claude/skills/verify-all/SKILL.md`
- `.claude/skills/estimate-cost/SKILL.md`
- 기존 `.claude/commands/*.md`는 레거시 병행 유지

### 추가 · 테스트·CI
- `tests/e2e/smoke.mjs` — 53개 회귀 테스트 (lint + 파일 존재 + tokens 유효 + 레퍼런스 슬림 + cost-estimator)
- `.github/workflows/ci.yml` — PR마다 3 lint + smoke 자동 실행

### 강화 · 기존 규칙
- `quality-method.md` K5 실측 우선 (추정 표현 금지어) + K6 회귀 주입 디테일
- tokens.json `font-fallback-stack` 명시 (C1')

### Upgrade
- v1.0 → v1.1 무중단. 기존 `output/`·`_design/` 호환. 새 기능은 전부 opt-in.

### 릴리스 검증
- Smoke 53/53 ✅ · portability ✅ · theme-lint ✅ · path-lint ✅

---

## [1.0.0] · 2026-04-14 · 첫 릴리스

### 추가
- 4가지 input 모드 (참고자료·목차·완성 스크립트·프레임워크) × 3가지 오디언스 + 커스텀
- 파자마보스 테마 (`assets/themes/pajamaboss/`) · tokens.json SSOT
- 6인 전문가 가상 회의 (`expert-council` · 고정 5 + 가변 도메인 1)
- 휴먼인루프 3단계 게이트 (H1~H4) · AskUserQuestion 5지선다
- K1 3중 검증 (자동·시각·인간)
- E1~E3 오류 처리 표준
- 토큰 단계별 Budget (회의 60k · 스크립트 40k · 렌더 25k · 검증 15k)
- voice-lock 톤 잠금 · 2~N강 의무 일관성
- 웹 딥서치 규약 · 1차 출처 5건+ · `[src:N]` 출처 ID
- 강의별 독립 폴더 (`output/<slug>/`)
- Notion MCP 선택적 업로드 (graceful skip)
- 샘플 1세트 · `samples/mode-1-references/` (가상 빵집 도메인)
- 구조 골드 · `samples/_gold-standard/structure/`

### 이식 출처
aiMarketer 프로젝트의 `.claude/` 규칙·에이전트·공통 에셋을 범용화하여 이식. 공공강의 특화 자산은 `branding/public-lecture/`로 압축 보존.

### 알려진 제한
- 한국어 전용 (v2.0에서 다국어)
- 콘텐츠 골드 1세트만 (도메인 적응은 런타임 회의로 보정)
- Playwright 시각 검증 수동 (v1.1에서 자동)
- 팀 협업 시나리오 미지원 (v2.0)
