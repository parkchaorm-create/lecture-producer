# DEMO Kit Format (SSOT · 키트 표준 포맷)

> 모든 DEMO 키트 파일(`DEMO_kit_parts/ACT*/part-XX-kit.md`)은 이 포맷을 따른다. 5인 전문가 회의 결론 반영.

## 사전 필수: Tutorial Phase 0 (2026-04-13 도입)

키트 작성 전 `.claude/rules/tutorial-design-pre-flight.md`의 5개 산출물이 존재해야 함:
- `input/materials/ui-captures/` · `_design/failure-scenarios-<part>.md` · `_design/walkthrough-<part>.log`
- `_design/tutorial-meeting-<part>.md` · `_design/user-check-<part>.md`

`failure-scenarios`의 10개 중 **최소 5개**를 키트 "🐛 자주 발생하는 문제"에 반영. `walkthrough.log`의 실제 출력을 "✅ 예상 결과"에 반영.

## 키트 파일 위치

```
DEMO_kit_parts/
├── _index.md                      ← ACT별 키트 목록 (자동 생성)
├── ACT1-foundation/
│   └── part-XX-kit.md
├── ACT2-skills/
├── ACT3-integration/
└── ACT4-optimization/
```

> 스크립트와 동일한 4 ACT 구조 유지

## 파일명 규칙
- `part-{XX}-kit.md` (예: `part-02-kit.md`, `part-15-kit.md`)
- 02자리 패딩

## 표준 키트 구조

```markdown
# Part XX · DEMO 실습 키트

> 🎯 **TL;DR**: [이 데모에서 만들/배울 것 한 줄]
> ⏱️ **예상 소요**: [N분]
> 👤 **대상**: [초보자 / 중급자 / 고급자]

---

## 📋 사전 준비물

[OS 무관 공통]
- [ ] Node.js v18+
- [ ] Claude Code 설치

[Windows 전용]
- [ ] PowerShell 7.0+

[macOS 전용]
- [ ] Homebrew

[필요 시]
- [ ] API 키: [서비스명] — 발급 링크 참조 (아래 🔗 섹션)

---

## 🔗 웹 링크

### 1. [링크 제목] — [무엇을 위한 것]
```
https://example.com/page
```

### 2. [링크 제목]
```
https://...
```

---

## ⌨️ 명령어

### 데모 1 · [무엇을 하는지]

**Step 1**: [작업 설명]
```bash
cd marketing
```

**Step 2**: [작업 설명]
```bash
claude
```

**Step 3** (Windows): [작업 설명]
```powershell
mkdir my-project
```

**Step 3** (macOS/Linux): [작업 설명]
```bash
mkdir my-project
```

> ✅ **예상 결과**: `my-project` 폴더가 생성됨
> ❌ **실패 시**: 권한 에러 → 관리자 권한으로 재실행

### 데모 2 · [무엇을 하는지]
...

---

## 💬 AI 프롬프트

### 프롬프트 1 · [무엇을 위한 것]

```
[복사할 프롬프트 전문]
한 글자도 수정하지 말고 그대로 복사하세요.
```

> 💡 **사용 시점**: Claude Code에서 첫 명령으로 실행
> 📌 **변경 가능 부분**: `[YOUR_KEYWORD]` 부분만 본인 키워드로 교체

### 프롬프트 2 · ...

---

## 📁 파일 경로 / 폴더 구조

### 만들어야 할 폴더 구조
```
marketing/
├── .claude/
│   ├── commands/
│   │   └── social-media.md
│   └── settings.local.json
└── output/
```

### 주요 파일 경로
- 명령어 파일: `.claude/commands/{이름}.md`
- 설정 파일: `.claude/settings.local.json`
- 출력: `output/`

---

## ⚙️ 설정 / 환경 변수

### 파일 1: `.claude/settings.local.json`

```json
{
  "permissions": {
    "allow": [
      "Bash(npm install:*)"
    ]
  }
}
```

### 환경 변수 (선택)

```bash
# Windows (PowerShell)
$env:API_KEY = "your-key-here"

# macOS/Linux
export API_KEY="your-key-here"
```

---

## 📝 체크포인트

데모를 따라하다 막히면 여기서 확인:

- [ ] **체크포인트 1**: [터미널에 ~ 메시지가 나오는가?]
- [ ] **체크포인트 2**: [폴더에 ~ 파일이 생성되었는가?]
- [ ] **체크포인트 3**: [최종 결과물 ~ 가 출력되었는가?]

✅ 모두 OK면 데모 성공!
❌ 하나라도 안 되면 아래 "🐛 자주 발생하는 문제" 참고

---

## 🐛 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|------|------|------|
| `command not found: claude` | Claude Code 미설치 | 사전 준비물 1번 확인 |
| `permission denied` | 권한 부족 | `sudo` 추가 (Mac) / 관리자 권한 (Win) |
| 명령어가 이상한 응답 | 잘못 복사 | 위 박스에서 다시 복사 |
```

> **⚠️ 변경사항 (2026-04-12)**: 이전 표준 포맷의 마지막 "🔗 관련 자료" 섹션은 **더 이상 작성하지 않습니다**. 새로 생성하는 키트는 "🐛 자주 발생하는 문제" 섹션에서 끝나야 함. (이미 작성된 키트는 그대로 유지)

---

## 작성 규칙 (필수)

### R1. 헤더 박스 (TL;DR + 시간 + 대상)
- **필수**: 모든 키트 파일 첫 부분
- TL;DR은 1줄, 30자 이내
- 시간은 분 단위, 범위 가능 (예: "5~10분")
- 대상은 "초보자/중급자/고급자" 중 하나

### R2. 사전 준비물 (체크리스트)
- **필수**: TL;DR 박스 다음에 위치
- 체크박스 형식 (`- [ ]`)
- OS별 분기 필요 시 명시
- API 키 필요 시 발급 링크 명시

### R3. 카테고리별 섹션 (이모지로 구분)
- 필수: 🔗, ⌨️, 💬, 📁, ⚙️, 📝, 🐛
- 해당 데모에 없는 카테고리는 섹션 자체 생략 (빈 섹션 금지)
- 순서 고정 (위 표준 구조 따름)

### R4. 복사 박스 (단일 복사 영역 분리)
- **필수**: 모든 명령어/링크/프롬프트는 코드 블록(```) 내부에만 위치
- 본문 문장에 명령어 섞어 쓰기 **금지**
- 코드 블록에 언어 힌트 (```bash, ```json, ```javascript 등)

### R5. 단계 명시 (순서 명확히)
- 명령어가 여러 개면 **Step 1, 2, 3** 형식
- 또는 ① ② ③ 사용 가능
- 각 Step 위에 한 줄 설명

### R6. OS별 분기
- 필요 시 명령어 블록을 OS별로 분리
- Windows / macOS / Linux 라벨 필수
- 동일 명령이면 분기 안 함

### R7. 예상 결과 + 실패 시 처리
- 각 데모 또는 주요 명령어 그룹 다음에 `> ✅ 예상 결과` + `> ❌ 실패 시`
- 인용 블록(`>`) 사용

### R8. 체크포인트
- 데모당 최소 1개, 권장 3개
- 측정 가능한 기준 (메시지 출력, 파일 생성 등)

### R9. 자주 발생하는 문제
- 표 형식 (증상 / 원인 / 해결)
- 데모에 없으면 생략 가능

### R10. 관련 자료 링크 (작성 금지 · 2026-04-12 변경)
- ❌ 신규 키트에는 "🔗 관련 자료" 섹션을 작성하지 않음
- 키트는 "🐛 자주 발생하는 문제" 섹션에서 종료
- 이미 작성된 키트는 그대로 유지 (소급 수정 X)

---

## 작성 금지 사항

- ❌ 본문 문장에 명령어 섞기 (예: "그다음 npm install을 입력하세요")
- ❌ 빈 카테고리 섹션 (해당 없으면 섹션 자체 생략)
- ❌ 코드 블록 없이 명령어 표기
- ❌ 언어 힌트 없는 코드 블록
- ❌ 원본 [DEMO]에 없는 내용 추가 (날조 금지)
- ❌ 추측성 "아마도", "...일 것 같습니다"

---

## TL;DR 작성 가이드

### 좋은 예
- ✅ "Antigravity 설치 → Claude Code 첫 실행"
- ✅ "/social-media 스킬 만들기 (5분)"
- ✅ "GA4 데이터 한국어로 자동 분석"

### 나쁜 예
- ❌ "Claude Code를 설치하고 실행하는 방법" (너무 길고 모호)
- ❌ "데모 진행" (정보 없음)
- ❌ "Part 02 시연" (단순 메타 정보)

---

## 체크포인트 작성 가이드

### 좋은 예
- ✅ "터미널에 `Welcome to Claude Code` 메시지가 나오는가?"
- ✅ "`.claude/commands/social-media.md` 파일이 생성되었는가?"
- ✅ "사이트 분석 결과에 빨간색/노란색/초록색이 표시되는가?"

### 나쁜 예
- ❌ "잘 됐는가?" (측정 불가)
- ❌ "데모를 잘 따라했는가?" (모호)
- ❌ "이해했는가?" (체크포인트 아님)

---

## 자동 추출 가능한 패턴

`demo-kit-builder` 에이전트가 원본 [DEMO] 섹션에서 자동 식별:

| 패턴 | 분류 |
|------|------|
| ` ```...``` ` 코드 블록 | 명령어/설정 후보 |
| `https?://...` | 웹 링크 |
| `/명령어` 또는 `/skill-name` | Claude Code 슬래시 명령어 |
| `npm`, `node`, `claude`로 시작하는 줄 | 터미널 명령어 |
| `cd`, `mkdir`, `ls`, `dir`로 시작 | 디렉토리 명령어 |
| `"` 또는 `「` 안의 긴 자연어 (50자+) | AI 프롬프트 후보 |
| `/path/...`, `.\path\...`, `~/...` | 파일 경로 |
| `{...}` 형태의 JSON 블록 | 설정 |

추출 후 LLM이 분류·정리·맥락 추가.

---

## 검증

### 자동 (스크립트로 가능)
- 모든 코드 블록에 언어 힌트 있는지
- TL;DR/시간/대상 박스 존재
- 체크포인트 최소 1개
- "🔗 관련 자료" 섹션이 없는지 확인 (2026-04-12부터 작성 금지)

### 수동 (사용자 검토)
- 카테고리 분류 정확성
- 명령어 순서 자연스러움
- 한 줄 설명 명확성

---

## 참조

- `.claude/agents/demo-kit-builder.md` — 키트 생성 에이전트
- `.claude/commands/generate-demo-kits.md` — 메인 슬래시 명령어
- `.claude/rules/portability.md` — 이식성 원칙
- `script_parts/_act_map.json` — 파트→ACT 매핑
