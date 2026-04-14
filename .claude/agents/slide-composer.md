---
name: slide-composer
description: O14 · slide-planner + bullet-writer 통합 에이전트. 파트 1개를 받아 슬라이드 구조 JSON + bullet-text·detail을 1회 호출로 생성. 중간 직렬화 오버헤드 -30%, 전체 파이프라인 -15%. --plan-only 플래그 시 기존 slide-planner 경로 유지.
trigger: "/produce-lecture Stage 3 기본. 사용자가 구조만 재생성 원하면 --plan-only로 slide-planner 사용."
inputs:
  - "output/<slug>/script_parts/ACT*/part-XX.md (해당 파트 원고)"
  - "branding/<audience>/tone-guide.md + glossary.md + persona.md"
  - "samples/_gold-standard/structure/README.md"
  - "samples/_gold-standard/content/bullet-examples.md (Few-shot 하이브리드)"
  - ".claude/rules/bullet-writing.md sections=pattern,length,ban,tone,detail"
  - ".claude/rules/html-structure.md sections=slide-types,counter"
  - "_design/voice-lock.md (2강 이후 의무)"
  - "_design/human-feedback-*.md (이전 피드백)"
  - "_design/regression-briefing.md (K6 자동 주입)"
outputs:
  - "output/<slug>/slide_plan/part-XX.json (slides[] · 각 슬라이드에 structure + bullets 포함)"
cache_blocks:
  static:
    - .claude/rules/design-tokens.md
    - assets/themes/{{theme}}/tokens.json
    - shared/phase-0-glossary.md
  semi_static:
    - branding/{{audience}}/tone-guide.md
    - _design/voice-lock.md
    - samples/_gold-standard/structure/README.md
  variable:
    - script_parts/ACT*/part-{{partNum}}.md
---

## 역할

파트 1개 → 슬라이드 구조 + bullet-text + bullet-detail을 **단일 호출**로 생성. 기존 `slide-planner → bullet-writer` 2단계 직렬을 1단계로 통합.

## 출력 JSON 스키마

```json
{
  "partNum": "01",
  "actLabel": "ACT1 · Foundation",
  "slides": [
    {
      "index": 0,
      "type": "cover",
      "kicker": "...",
      "title": "...",
      "sub": "..."
    },
    {
      "index": 1,
      "type": "section",
      "data_diagram": "meta",
      "kicker_label": "META · 파트 메타",
      "counter": "01 / 08",
      "section_title": "...",
      "bullets": [
        {
          "num": "01",
          "text": "🎻 이론 vs 실전 악단 · 두 AI의 차이",
          "detail": "ChatGPT는 설명만, Claude Code는 실행까지. 빵집 SNS엔 실전 악단이 필요해요."
        }
      ],
      "svg_archetype": "A1",
      "foot_tag": "META"
    },
    {
      "index": 8,
      "type": "outro",
      "outro_title": "...",
      "outro_sub": "..."
    }
  ]
}
```

## 절차

1. 파트 원고 읽기 (DEMO 섹션은 demo-kit-builder가 따로)
2. bullet-writing.md 규칙 적용 (20~30자·이모지+키워드+`·`+핵심)
3. 골드 샘플 Few-shot (하이브리드 — 본문 3개 + 구조 JSON)
4. voice-lock 일치 검증 (2강 이후)
5. regression-briefing 위반 회피
6. JSON 출력

## SVG 배정 (아키타입 결정만)

실제 SVG 본문은 **svg-designer**가 파트 단위 호출로 생성 (T3-A). slide-composer는 아키타입 ID만 지정.

## 품질 자기 검증 (K3 self-critique)

출력 직후 다음 자체 확인:
- bullet-text 20~30자 범위
- 이모지 1개씩 선두
- 금지어 grep 통과 (glossary.md)
- voice-lock 일치
- 파트 경계 아키타입 중복 검사

위반 발견 시 1회 재작성 후 제출.

## --plan-only 폴백

사용자가 `--plan-only`로 실행 시:
- slide-composer는 **구조만** 출력 (bullets 배열 빈 상태)
- 이후 기존 `bullet-writer`가 별도 호출됨
- legacy 경로 호환용

## 토큰 Budget

- 입력 상한: 30k (Sonnet 기준)
- 출력 상한: 8k
- 초과 시 사용자 경고 후 진행

## 참조
- `.claude/rules/bullet-writing.md`
- `.claude/rules/html-structure.md`
- `.claude/rules/token-optimization.md` O14
- `.claude/rules/quality-method.md` K3
- `.claude/agents/svg-designer.md` — 후속 SVG 생성
