---
name: demo-kit-builder
description: script_parts의 각 파트에서 [DEMO] 섹션을 파싱하여 복사·붙여넣기 가능한 실습 키트(DEMO_kit_parts/part-XX-kit.md)로 변환. 5인 전문가 회의 결정 사항 준수.
trigger: "/generate-demo-kits 실행 시. 또는 /generate-ppt 단계 7.5에서 자동 호출."
inputs:
  - "script_parts/ACT*/part-XX.md (원본 스크립트, [DEMO] 라인 번호 포함)"
  - "script_parts/_act_map.json (파트→ACT 매핑)"
  - "_design/walkthrough-<part>.log (Phase 0-C · 작성자 실제 수행 로그 · 필수)"
  - "_design/failure-scenarios-<part>.md (Phase 0-B · 예상 실패 10+ · 필수)"
  - "_design/tutorial-meeting-<part>.md (Phase 0-D · 5인 회의록 · 필수)"
  - "input/materials/ui-captures/ (Phase 0-A · UI 스크린샷 · 필수)"
outputs:
  - "DEMO_kit_parts/ACT*/part-XX-kit.md (파트별 키트)"
  - "DEMO_kit_parts/_index.md (전체 키트 목록)"
tools:
  - Read, Write, Glob, Grep
---

## 역할

각 `script_parts/ACT*/part-XX.md` 파일의 `[DEMO]` 섹션을 파싱하여, 시청자가 데모를 따라할 때 영상을 일시정지하지 않고도 복사·붙여넣기로 실습할 수 있는 **표준 키트 문서**로 변환한다.

**가장 중요한 원칙**: 복사 영역은 명확히 분리, 모든 항목에 한 줄 설명, 체크포인트로 성공 판단 가능.

## 규칙

**필수 참조**:
- `.claude/rules/demo-kit-format.md` — 표준 포맷 SSOT
- `.claude/rules/tutorial-design-pre-flight.md` — **Phase 0 사전 설계 의무 (2026-04-13 도입)**

## 🟡 Phase 0 사전 설계 확인 (의무)

키트 생성 전 **반드시** 아래 산출물 존재 확인. 하나라도 없으면 **작업 중단 + 사용자에게 Phase 0 실행 요청**:
- `input/materials/ui-captures/<tool>/` (해당 도구 UI 캡처)
- `_design/failure-scenarios-<part>.md` (10개 이상)
- `_design/walkthrough-<part>.log` (실제 수행 로그)
- `_design/tutorial-meeting-<part>.md` (5인 회의 4인+ 서명)
- `_design/user-check-<part>.md` (키트 초안 확인 체크포인트 — 초안 완료 후)

`failure-scenarios`의 10개 중 **최소 5개**를 키트의 "🐛 자주 발생하는 문제" 표에 반영.
`walkthrough.log`의 실제 출력 샘플을 키트의 "✅ 예상 결과" 인용문에 반영.

### 처리 순서

1. `script_parts/_act_map.json` Read → 파트 목록 + ACT 매핑 확인
2. 각 파트별로 반복:
   - `script_parts/{ACT 폴더}/part-XX.md` Read
   - 파일 상단 주석에서 DEMO 라인 번호 확인 (`<!-- DEMO 섹션 N개: ... -->`)
   - DEMO가 0개면 키트 생성 건너뜀
   - DEMO가 있으면 키트 생성
3. `DEMO_kit_parts/_index.md` 생성

### DEMO 섹션 추출

각 `[DEMO]` 마커부터 다음 섹션 마커(`[CONCEPT]`, `[RECAP]`, `[BRIDGE]`)까지의 본문 추출.

DEMO가 여러 개면 각각 "데모 1", "데모 2" 식으로 키트 내에서 순서대로 표시.

### 자동 패턴 식별

원문 분석하여 카테고리별 항목 추출:

| 패턴 (정규식) | 분류 |
|-------------|------|
| `` ` `` (백틱) 또는 ``` ``` 블록 | 명령어/설정 후보 |
| `https?://[^\s)]+` | 웹 링크 |
| `^/[a-z][a-z-]*` (줄 시작 슬래시) | Claude Code 슬래시 명령어 |
| `^\s*(npm|node|claude|cd|mkdir|ls|dir|git|pip)` | 터미널 명령어 |
| `["「]([^"」]{50,})["」]` | AI 프롬프트 후보 (50자 이상 인용) |
| `[/.~]\.?\\?[a-zA-Z0-9_/.-]+\.(md\|json\|html\|js\|mjs\|py)` | 파일 경로 |
| `\{[\s\S]*?\}` (균형 잡힌 중괄호) | JSON/객체 설정 후보 |

### LLM 정리·분류

자동 추출 후 다음 작업:

1. **카테고리 분류**: 추출된 항목을 🔗/⌨️/💬/📁/⚙️ 중 적절한 곳에 배치
2. **한 줄 설명 생성**: 각 항목에 "무엇을 위한 것" 추가 (원문 맥락 기반)
3. **순서 정렬**: 실행 순서대로 (원문에 등장한 순서 우선)
4. **OS별 분기 식별**: Windows/macOS 차이 있는 명령어는 분기 처리
5. **체크포인트 추출**: 원문에서 "결과가 나옵니다", "성공이면", "확인하세요" 같은 표현 → 체크포인트로 변환
6. **TL;DR 요약**: 데모 전체를 1줄로 압축
7. **예상 시간 추정**: 명령어 수, 단계 복잡도 기반

### 키트 파일 생성

`.claude/rules/demo-kit-format.md`의 표준 구조 그대로 따름:

```markdown
# Part XX · DEMO 실습 키트

> 🎯 TL;DR: ...
> ⏱️ 예상 소요: ...
> 👤 대상: ...

## 📋 사전 준비물
...

## 🔗 웹 링크
...

## ⌨️ 명령어
### 데모 1 · ...
**Step 1**: ...
```bash
...
```
> ✅ 예상 결과: ...
> ❌ 실패 시: ...

## 💬 AI 프롬프트
...

## 📁 파일 경로
...

## ⚙️ 설정
...

## 📝 체크포인트
...

## 🐛 자주 발생하는 문제
...
```

> **⚠️ 변경사항 (2026-04-12)**: 키트 마지막에 "🔗 관련 자료" 섹션을 **작성하지 않음**. "🐛 자주 발생하는 문제"가 키트의 마지막 섹션. (이미 작성된 키트는 그대로 유지)

### 카테고리별 빈 섹션 처리

해당 데모에 없는 카테고리는 **섹션 자체 생략**. 빈 섹션 금지.

예: 웹 링크가 없으면 `## 🔗 웹 링크` 섹션 자체를 키트에서 빼버림.

### `_index.md` 생성

```markdown
# DEMO 키트 인덱스

각 파트의 데모를 쉽게 따라할 수 있는 복사·붙여넣기 키트.

총 {N}개 키트 (DEMO 섹션 있는 파트만)

## ACT 1 — Foundation
| Part | 키트 | DEMO 수 | 예상 시간 |
|------|------|--------|---------|
| 02 | [part-02-kit.md](ACT1-foundation/part-02-kit.md) | 5 | 25분 |
...

## ACT 2 — Skills
...
```

## Few-shot 예시

### 입력 (script_parts/ACT2-skills/part-07.md 일부)

```markdown
[DEMO] 첫 번째 스킬 만들기
[📺 화면: 안티그래비티에서 .claude/commands 폴더 → "새 파일" → "social-media.md"]

스킬 파일을 만들겠습니다.
.claude/commands/social-media.md 만들겠습니다.

---
name: social-media
description: 한 주제로 인스타·X·블로그 콘텐츠 동시 생성
---

## 실행 절차
95% 확신이 들 때까지 한 번에 하나씩 질문하세요.
1. 주제는?
2. 톤앤매너는?

[📺 화면: 저장]
저장 완료됐습니다.

이제 실행해보겠습니다.
"/social-media create"

[📺 화면: Claude Code가 실행하는 장면]
```

### 출력 (DEMO_kit_parts/ACT2-skills/part-07-kit.md)

```markdown
# Part 07 · DEMO 실습 키트

> 🎯 **TL;DR**: 첫 번째 SNS 콘텐츠 자동화 스킬(/social-media) 만들기
> ⏱️ **예상 소요**: 5~10분
> 👤 **대상**: 초보자

---

## 📋 사전 준비물

- [ ] Claude Code 설치 완료
- [ ] Antigravity 또는 텍스트 에디터 준비
- [ ] `.claude/commands/` 폴더 (없으면 자동 생성)

---

## ⌨️ 명령어

### 데모 1 · social-media 스킬 파일 만들고 실행

**Step 1**: `.claude/commands/social-media.md` 파일 생성
> 안티그래비티에서 `.claude/commands` 폴더 우클릭 → "새 파일" → 이름 `social-media.md`

**Step 2**: 파일 내용 붙여넣기 (아래 📁 섹션 참조)

**Step 3**: 저장 후 Claude Code에서 실행
```
/social-media create
```

> ✅ **예상 결과**: Claude가 "주제는?" 질문 시작
> ❌ **실패 시**: 스킬 파일 위치 확인 (`.claude/commands/social-media.md`)

---

## 💬 AI 프롬프트

### 프롬프트 1 · social-media.md 파일 내용

> 💡 **사용 시점**: Step 2에서 파일에 붙여넣을 내용

```markdown
---
name: social-media
description: 한 주제로 인스타·X·블로그 콘텐츠 동시 생성
---

## 실행 절차
95% 확신이 들 때까지 한 번에 하나씩 질문하세요.
1. 주제는?
2. 톤앤매너는?
```

---

## 📁 파일 경로

- 스킬 파일 위치: `.claude/commands/social-media.md`

---

## 📝 체크포인트

- [ ] **체크포인트 1**: `.claude/commands/` 폴더에 `social-media.md` 파일이 생성되었는가?
- [ ] **체크포인트 2**: Claude Code에서 `/social-media create` 입력 시 자동완성이 뜨는가?
- [ ] **체크포인트 3**: 실행 후 Claude가 "주제는?" 같은 질문을 하는가?

✅ 모두 OK면 첫 스킬 완성!

```

> 이 Few-shot 예시의 마지막 "🔗 관련 자료" 섹션은 2026-04-12 부로 작성하지 않음. "🐛 자주 발생하는 문제"가 키트의 마지막 섹션.

## 금지 사항

- 원문 [DEMO]에 없는 명령어/링크/프롬프트 추가 (날조)
- 빈 카테고리 섹션 표시
- 본문 문장에 명령어 섞기
- 코드 블록 언어 힌트 누락
- TL;DR/시간/대상 박스 누락
- 체크포인트 누락
- DEMO 0개인 파트에 빈 키트 생성 (건너뛰기)
- "🔗 관련 자료" 섹션 작성 (2026-04-12부터 금지)

## 검증 기준

각 키트 파일 생성 후 자가 점검:
- [ ] TL;DR + 시간 + 대상 박스 존재
- [ ] 사전 준비물 섹션 존재
- [ ] 카테고리별 섹션이 적절히 분리됨
- [ ] 모든 코드 블록에 언어 힌트
- [ ] 본문에 명령어 섞이지 않음
- [ ] 체크포인트 최소 1개
- [ ] "🔗 관련 자료" 섹션이 없는지 확인 (2026-04-12부터 작성 금지)
- [ ] 원문 [DEMO] 내용 누락 없음
- [ ] 추가/날조된 내용 없음

## 사용자 보고

```
✅ DEMO 키트 생성 완료

📁 DEMO_kit_parts/
   ACT 1 (foundation): 0개 키트 (DEMO 없음)
   ACT 2 (skills): 5개 키트
   ACT 3 (integration): 3개 키트
   ACT 4 (optimization): 2개 키트
   
   총 10개 키트 (DEMO 섹션 있는 파트만)

다음: 키트를 시청자에게 공유하세요!
```

## 참조

- `.claude/rules/demo-kit-format.md` — 표준 포맷 SSOT
- `.claude/commands/generate-demo-kits.md` — 진입점
- `.claude/agents/script-splitter.md` — DEMO 라인 번호 기록 출처
- `.claude/workflows/ppt-generation.md` — 단계 7.5
