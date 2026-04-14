# Human-in-Loop (휴먼인루프 게이트 SSOT)

> 사용자 직접 지시 (2026-04-14): 첫 1강 산출 후 반드시 사람 피드백을 받고 다음 단계 진행.

## H1 · 3단계 게이트 (의무)

첫 1강에서 다음 시점마다 **사용자 승인 필수**:

| 게이트 | 시점 | 산출물 | 차단 대상 |
|--------|------|--------|-----------|
| **G1-Script** | 1강 스크립트 완성 | `script_parts/ACT1/part-01.md` | 2~N강 스크립트 작성 |
| **G2-PPT** | 1강 PPT 완성 | `ppt/01강_*.html` | 2~N강 PPT 렌더 |
| **G3-Tutorial** | 1강 튜토리얼 완성 | `tutorials/01강_*-kit.md` | 2~N강 튜토리얼 + 노션 업로드 |

## H2 · AskUserQuestion 5지선다

각 게이트에서 다음 5지선다 + 자유 텍스트 코멘트:

1. **승인** — 다음 단계 진행
2. **톤만 수정** — 같은 에이전트 재실행, 톤 가이드 강화 후 재작성
3. **구조 재설계** — 전 단계(예: slide-planner)부터 재실행
4. **재시도** — 동일 입력으로 재호출 (확률적 변동 기대)
5. **중단** — 파이프라인 종료 (산출물·중간 상태는 보존)

## H3 · 피드백 영구 저장

선택지 + 자유 텍스트를 `_design/human-feedback-<part>.md`에 누적 저장. 포맷:

```markdown
# Human Feedback — part-01

## 2026-04-14 14:32 · G1-Script
- 선택: 톤만 수정
- 코멘트: "공공기관용인데 너무 친근한 느낌. -습니다 더 강화해주세요"
- 조치: lecture-writer 재실행, voice-lock 강화

## 2026-04-14 15:10 · G1-Script (재시도)
- 선택: 승인
- 코멘트: ""
```

## H4 · 후속 강 의무 로드

2~N강 작성 시 lecture-writer/svg-designer/demo-kit-builder는 `_design/human-feedback-*.md`를 **의무 로드**. 동일 실수 차단.

## 차단 정책

- 미통과 게이트 발견 시 파이프라인 즉시 일시 정지
- 백그라운드 작업·다음 강 진입 전부 차단
- 사용자가 명시적으로 5지선다 응답해야 재개

## 우회 옵션 (위험)

`/produce-lecture --skip-hil` (개발용·v1.1) — 모든 게이트 자동 승인. 운영 환경 사용 금지. README에 강력 경고.

## 참조

- `.claude/commands/produce-lecture.md` — 게이트 적용 위치
- `.claude/rules/quality-method.md` — K1 3중 검증 한 축
- `_design/human-feedback-*.md` — 산출물
