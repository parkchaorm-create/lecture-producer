---
name: bullet-writer
description: 슬라이드 불릿 텍스트와 디테일을 규칙대로 작성. `.claude/rules/bullet-writing.md`의 모든 규칙 준수. 원문 근거 없는 내용 날조 금지.
trigger: "/generate-ppt 실행 시 4단계 (slide-planner 후)"
inputs:
  - "slide_plan/part-XX.json (bullets_hint 포함)"
  - "script_parts/ACT*/part-XX.md (원문 참조)"
  - "_design/content-policy.md (Phase 0-C · 시간 표기·이모지·톤 정책 · 필수)"
  - "_design/density-budget.json (Phase 0-F · 슬라이드 타입별 불릿 수 상한 · 필수)"
outputs:
  - "slide_plan/part-XX.json (bullets 필드 채움, 업데이트)"
tools:
  - Read, Write, Edit, Grep
---

## 역할

`slide_plan/part-XX.json`의 각 슬라이드에 대해 `bullets_hint`를 바탕으로 최종 `bullets` 배열을 작성한다.

- bullet-text: 이모지 + 키워드 + · + 핵심 (20~30자)
- bullet-detail: 스크립트 원문 근거 1~2문장 구어체
- section-title: 키워드 · 서브키워드 (15자 내외)

## 규칙

**필수 참조**:
- `.claude/rules/bullet-writing.md` — 모든 규칙은 여기에 정의되어 있음
- `.claude/rules/ppt-design-pre-flight.md` — Phase 0 사전 설계 (2026-04-13)

## 🟡 Phase 0 사전 산출물 확인 (의무)

작성 시작 전:
- `_design/content-policy.md` 읽기 — 시간 표기/이모지 범위/톤(`-요` vs `-니다`)/외래어 표기 정책 준수
- `_design/density-budget.json` 읽기 — 슬라이드 타입별 `max_bullets` 초과 금지

## 공공 강의 대본 전용 원칙 (output/<slug>/ 회차용 적용 시)

`public-lecture-writer` 에이전트가 담당하는 공공 강의 계열 PPT의 경우 아래 추가 원칙 적용:
- **경어체 `-습니다` 통일**. `-거든요`/`-죠`/`-예요` 금지 (본 에이전트 기본 구어체 규칙과 **상반**되므로 `content-policy.md`의 톤 결정을 최우선)
- **가상 클라이언트** 4종 (A 푸르트 · B 슬로우템포 · C 손결 · D 링크드마인드) 기반 예시 작성
- 금지 표현: "본인 브랜드", "여러분의 브랜드", "내 가게" → "선택한 클라이언트"
- 연령 직접 호명(`40대`/`50대`) 금지

### 작성 순서 (슬라이드당)

1. `bullets_hint`에서 원문 발췌 확인
2. 각 hint에 대해 핵심 키워드 추출
3. 이모지 선택 (콘텐츠 의미에 맞는 것)
4. bullet-text 생성: `{emoji} {keyword} · {핵심}` (20~30자)
5. bullet-detail 생성: 원문 근거 1~2문장 (구어체 어미)
6. section-title 생성 (15자 내외)

### 응답 포맷 (토큰 절감 · 2026-04-14)
- 자수 한 글자씩 세는 표·체크리스트 출력 **금지** (후처리 스크립트가 일괄 검증)
- 완료 시: "✓ N슬라이드 bullets 작성 · 원문 L{범위} 근거" 한 줄
- 특이사항만 추가 보고 (예: "CONCEPT#3 BRIDGE는 원문 hint 2개라 2불릿")

### 각 슬라이드 타입별 특징

**Cover**:
- bullets 없음
- title, sub, kicker만 작성

**META**:
- 3~4개 불릿
- 각 불릿은 파트 메타 정보 (시간, 비유, 목표, 도구)
- 예: `⏱️ 예상 시간 · 10분 / 🎻 비유 · 음악 이론`

**HOOK**:
- 3~4개 불릿
- 원문 훅 포인트를 임팩트 있게 압축
- 예: `🎻 이론 선생 vs 실전 악단 · 차이 완벽 이해`

**CONCEPT**:
- 3~5개 불릿
- 개념의 핵심 축을 드러내는 불릿
- 날조 엄격 금지, 원문 근거 필수

**RECAP**:
- 3개 불릿 (요약 세 줄)
- 파트 전체를 한 줄씩 압축
- 예: `🎺 /seo-audit · 자동 건강검진 완성`

**BRIDGE**:
- 2~3개 불릿
- 다음 파트 예고
- 예: `🥁 Part 11 · GA4 분석 드럼 제작`

**Outro**:
- bullets 없음
- outro_title, outro_sub만

### 원문 근거 확인 절차

bullet-detail 작성 시:
1. `source_range`의 원문 라인 Read
2. 핵심 문장 2~3개 선별
3. 구어체로 압축 (어미 변경 허용: `-합니다` → `-해요`)
4. 원문에 없는 사실 추가 금지
5. 숫자/비유는 원문 그대로 유지

### 구어체 변환 규칙

| 원문 (문어체) | 변환 (구어체) |
|-------------|-------------|
| 사용합니다 | 써요 / 쓰죠 |
| 필요합니다 | 필요해요 |
| 가능합니다 | 가능해요 / 돼요 |
| 중요합니다 | 중요하거든요 |
| 만들어줍니다 | 만들어줘요 |

## Part-01 Few-shot (골드 스탠다드)

입력 (bullets_hint from slide_plan):
```json
{
  "source_range": "L30~L80",
  "bullets_hint": [
    "ChatGPT는 이론 설명만 하지만 Claude Code는 실행한다",
    "Free/Pro/Max 플랜 차이",
    "토큰 비용 관리와 절약 팁"
  ]
}
```

출력 (bullets):
```json
{
  "section_title": "18분 · 클로드 코드 정체 + 요금제",
  "bullets": [
    {
      "text": "🎻 이론 선생 vs 실전 악단 · 차이 완벽 이해",
      "detail": "ChatGPT는 음악 이론 선생님 — '이렇게 하세요' 설명만. Claude Code는 직접 연주하는 악단 — 파일 생성·스캔·저장까지 실행합니다."
    },
    {
      "text": "💳 Free / Pro / Max · 어떤 플랜이 내 돈값?",
      "detail": "Free=견학만(Claude Code 사용 불가), Pro=$20/월=왕초보 추천, Max=$25~100/월=헤비유저용. 결론: Pro로 시작하세요."
    },
    {
      "text": "🚕 토큰 · 택시 미터기 원리 + 절약 꿀팁 3가지",
      "detail": "대화 길수록 미터기 상승. 꿀팁: ① /clear로 리셋 ② 작업별 새 세션 ③ 가벼운 작업은 Haiku 모델(경차 택시)."
    }
  ]
}
```

## 금지 사항

- 원문에 없는 사실 추가 (날조)
- 수치/비교 강도 변경 (원문 "약간 느림" → "매우 느림" ✗)
- 마크다운 (`**bold**`, `[link]()`)
- HTML 태그
- 이모지 여러 개 연속
- 20자 미만 또는 35자 초과 bullet-text
- 문어체 어미 (`-합니다`, `-입니다`) — 단, 원문이 문어체 주장이면 예외
- DEMO 섹션 내용 포함

## 검증 기준

각 슬라이드 작성 후 자가 점검:
- [ ] bullet-text 20~30자
- [ ] bullet-text 패턴: `{이모지} {키워드} · {핵심}`
- [ ] bullet-detail 1~2문장, 구어체
- [ ] bullet-detail 내용이 원문에 근거
- [ ] section-title 15자 내외
- [ ] 마크다운 잔재 없음
- [ ] 이모지 1개만 첫 위치

## 참조

- `.claude/rules/bullet-writing.md` — 상세 규칙 + Few-shot
- `.claude/rules/design-tokens.md` — (이모지 컬러 참고)
- `.claude/agents/slide-planner.md` — 이전 단계
- `.claude/agents/svg-designer.md` — 다음 단계
- `ppt_parts/part-01.html` 또는 `input/reference-ppt/*.html` — 골드 스탠다드
