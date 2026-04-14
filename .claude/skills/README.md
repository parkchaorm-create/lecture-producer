# .claude/skills/ — 공식 Skill 표준

> Anthropic [Agent Skills](https://agentskills.io) 표준. 각 skill은 디렉토리 + `SKILL.md`.
> `.claude/commands/*.md`와 **병행 제공**. 두 형식 모두 `/name`으로 호출 가능. 같은 이름이면 skill 우선.

## 포함 Skills (v1.1)

| Slug | 디렉토리 | 용도 |
|------|----------|------|
| `produce-lecture` | `.claude/skills/produce-lecture/` | 메인 파이프라인 (3 Stage) |
| `analyze-framework` | `.claude/skills/analyze-framework/` | Mode 4 프레임워크 분석 |
| `verify-all` | `.claude/skills/verify-all/` | 현 산출물 검증만 |
| `estimate-cost` | `.claude/skills/estimate-cost/` | 사전 비용 표시 |

나머지 커맨드(`regenerate-part`·`regenerate-kit`·`split-script`·`generate-demo-kits`·`add-svg-component`)는 `.claude/commands/`에 유지. 필요 시 SKILL.md로 승격 가능.

## 왜 두 형식 병행?

- `.claude/commands/*.md`: 단일 파일 · 빠른 수정 · 레거시 호환
- `.claude/skills/<name>/`: 디렉토리 · 지원 파일·스크립트 번들 가능 · 공식 표준

동일 이름 충돌 시 skill이 우선. 사용자는 `/name`만 신경쓰면 됨.

## Skill 만들기 (커스텀)

```bash
mkdir -p .claude/skills/my-skill
cat > .claude/skills/my-skill/SKILL.md <<'EOF'
---
name: my-skill
description: 언제 자동 호출될지 명확히 기술
---

지침 본문…
EOF
```

## Frontmatter 핵심 필드

| 필드 | 용도 |
|------|------|
| `name` | `/slug` 네이밍 |
| `description` | 자동 호출 판단 근거 (Claude가 읽음) |
| `argument-hint` | `$ARGUMENTS` 힌트 |
| `disable-model-invocation` | `true` 시 사용자 수동 호출만 |
| `allowed-tools` | 이 skill 활성 시 자동 허용 도구 |
| `context: fork` | 격리 subagent 컨텍스트 실행 |
| `agent` | forked subagent 유형 (Explore·Plan 등) |

## 참조
- [Anthropic Agent Skills 공식](https://agentskills.io)
- 이 repo: `.claude/commands/` (레거시 병행)
