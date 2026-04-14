# .claude/ Skill Pack

이 폴더가 `lecture-producer` 스킬팩의 본체. 다른 프로젝트에 `.claude/` 통째로 복사하면 동일 기능 사용 가능 (단, `assets/themes/pajamaboss/` + `branding/` + `templates/`도 함께 복사 필요).

## 구성

```
.claude/
├── README.md              # 이 파일
├── VERSION                # 1.0.0
├── settings.local.json    # 권한 기본값
├── agents/                # 10개 에이전트
├── commands/              # 9개 슬래시 명령
├── rules/                 # 20개 규칙 (SSOT)
├── workflows/             # 2개 워크플로우
├── prompts/               # 전문가 회의 프롬프트 템플릿
└── scripts/               # Node.js 유틸
```

## 에이전트 권장 모델

frontmatter는 모델 필드를 **비워둠** (사용자 기본 모델 존중). 아래는 권장만:

| 에이전트 | 권장 | 이유 |
|---------|------|------|
| expert-council | Opus 4.6 | 6인 역할극 + 장문 회의록 |
| lecture-writer | Opus 4.6 | 장문 한국어 + 출처 검증 |
| script-splitter | Sonnet | 분할 로직 단순 |
| slide-planner | Sonnet | JSON 구조 |
| bullet-writer | Sonnet | 정형 텍스트 |
| svg-designer | Opus 4.6 | 9 아키타입 창의 |
| html-renderer | Sonnet | 템플릿 조립 |
| demo-kit-builder | Sonnet | 패턴 추출 |
| notion-uploader | Haiku | MCP 호출만 |
| qa-validator | Sonnet | 체크리스트 |

## 규칙 위계

최우선 (불가침): `portability.md` · `design-tokens.md` · `human-in-loop.md` · `quality-method.md`

상세 규약: `audience-profiles.md` · `bullet-writing.md` · `svg-design.md` · `html-structure.md` · `demo-kit-format.md` · `web-research-protocol.md` · `error-handling.md` · `token-optimization.md` · `voice-lock.md` · `script-splitter-budget.md` · `input-mode-detection.md`

Phase 0 사전 설계: `ppt-design-pre-flight.md` · `tutorial-design-pre-flight.md`

검증: `qa-checklist.md` · `visual-verification.md`

스타일 참조: `style-reference.md`

## 이식성 체크

신규 프로젝트에 복사 후:
```bash
node .claude/scripts/portability-check.mjs
```

0건이어야 통과.
