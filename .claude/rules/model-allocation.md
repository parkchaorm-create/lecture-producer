# Model Allocation (모델 분배 SSOT · v1.2 · O12)

> 에이전트별 권장 모델은 `.claude/models.json` 하드 SSOT. 이 규칙은 **분배 원칙과 override 방법**만 설명.

## 원칙

1. **창의·회의·장문 → Opus 4.6** + Extended thinking
2. **구조·템플릿·정형 → Sonnet 4.6**
3. **lint·grep·MCP 호출 → Haiku 4.5**
4. **오디언스·모드별 override** 가능 (공공강의 lecture-writer는 Opus 고정 등)

## 근거 (비용 매트릭스)

| 모델 | Input/M | Output/M | 배수 |
|------|---------|----------|------|
| Opus 4.6 | $15 | $75 | 1.0x |
| Sonnet 4.6 | $3 | $15 | 0.2x |
| Haiku 4.5 | $1 | $5 | 0.067x |

Haiku 승격 가능한 작업을 Opus로 돌리면 **15배 손해**. 반대로 창의 작업을 Haiku로 돌리면 재작성 루프로 오히려 비싸짐.

## override 방법

### 프로젝트 레벨
`.claude/local-config.json`:
```json
{
  "modelsOverride": {
    "lecture-writer": "opus",
    "qa-validator": "sonnet"
  }
}
```

### 강의별 (Stage 1 intake)
```json
{
  "slug": "my-course",
  "modelsOverride": {
    "svg-designer": "opus"
  }
}
```

### frontmatter 고정 금지
에이전트 `.claude/agents/*.md` frontmatter에 `model:` 필드는 **비움**. 사용자 권한 override를 항상 존중.

## 검증

`.claude/scripts/model-budget-check.mjs` (v1.2 · 선택) — 실행 전 예상 비용 표시 시 현재 모델 매핑 반영.

## 참조
- `.claude/models.json` — 하드 SSOT
- `.claude/rules/token-optimization.md` — 전체 최적화 컨텍스트
- `.claude/scripts/cost-estimator.mjs` — 실측 비용
