# PPT Design Pre-Flight (PPT 사전 설계 체크리스트)

> **도입 근거**: `.claude/rules/_meetings/2026-04-13_ppt-tutorial-design-upgrade.md` 5인 회의 합의안.
> **원칙**: PPT 슬라이드 덱 생성 파이프라인은 **Phase 0 (사전 설계)**를 통과하지 않으면 Phase 1 (생성)로 진입할 수 없다.

## 왜 필요한가

1강 PPT 작성 시 반복된 실패:
- SVG 깨짐 (CSS transform override)
- 시간 표기 잔존 (정책 변경 미반영)
- 이전 버전 SVG 요소 잔재
- 레퍼런스 스타일 드리프트

근본 원인: **사전 설계 단계 부재**. 생성에 곧바로 돌입하여 정책·시각 언어·아키타입 분포를 합의 없이 에이전트가 즉흥 결정.

## Phase 0 · 의무 사전 단계 (6개)

모든 산출물은 `_design/` 폴더에 저장된다.

### Phase 0-A · 레퍼런스 Lock (필수)
- 실행: `input/reference-ppt/*.html` 파일별 SHA-256 해시 계산
- 산출물: `_design/reference-lock.json`
- 포맷:
```json
{
  "locked_at": "2026-04-13T10:00:00Z",
  "references": [
    { "path": "input/reference-ppt/sample.html", "sha256": "abc...", "size": 123456 }
  ]
}
```
- 위반 시: 파이프라인 중단, 사용자에게 "레퍼런스 변경 감지 — 재잠금 필요" 메시지

### Phase 0-B · Deck Outline Review (필수)
- 실행: 전체 파트 슬라이드 구조를 표로 작성
- 산출물: `_design/deck-outline.md`
- 필수 컬럼: part_id | ACT | 예상 시간(분) | section 순서 | 아키타입 배정(A1~A9) | 비고
- 검증: 같은 아키타입이 연속 3슬라이드 초과로 반복되면 경고
- **파트 경계 감사 (2026-04-14 추가 · 10인 회의 P1)**:
  - [ ] part-N 마지막 CONCEPT 아키타입 ≠ part-(N+1) 첫 CONCEPT 아키타입
  - [ ] 같은 회차 전체에서 동일 아키타입 사용 횟수 ≤ 3회
  - 상세: `.claude/rules/svg-design.md` · "파트 경계 넘어 중복 감사" 섹션

### Phase 0-C · Content Policy Sheet (필수)
- 실행: 콘텐츠 표기 정책을 1페이지 체크리스트로 확정
- 산출물: `_design/content-policy.md`
- 필수 항목:
  - [ ] 시간 표기 포함 여부 (예: "30분 · 제목" vs "제목")
  - [ ] 이모지 사용 범위 (bullet-text만? title도?)
  - [ ] 톤 (`-요` vs `-니다`)
  - [ ] 숫자 표기 (아라비아 vs 한글)
  - [ ] 외래어 표기 (Claude Code? 클로드 코드?)
- 변경 시: 영향받는 모든 파트 재생성 트리거

### Phase 0-D · Visual Language Meeting (필수 · 가상 5인 회의)
- 참석자:
  - P1 시각 디자인
  - P2 교육 UX
  - P3 프론트엔드
  - P4 교재 설계
  - P5 QA
- 의제:
  1. 파트 메타포 확정 (오케스트라? 레스토랑? 등)
  2. 색상 강조 포인트 (어디에 `--gold` 집중?)
  3. SVG 복잡도 등급 (simple/medium/complex) 파트별 배정
  4. 금지 조합 재확인 (`<g transform class="svg-pulse">` 등)
- 산출물: `_design/visual-language-meeting.md`
- 형식: 회의록 (참석자 발언 + 합의안 + 서명)

### Phase 0-E · 회귀 사례 브리핑 (필수)
- 실행: `.claude/rules/visual-verification.md` 하단 **최근 사례 N개**(기본 5개) 발췌
- 산출물: `_design/regression-briefing.md`
- 용도: svg-designer / html-renderer 에이전트 시스템 프롬프트에 주입하여 같은 실수 반복 차단

### Phase 0-F · Information Density Budget (필수)
- 실행: 슬라이드 타입별 **숫자 상한** 고정
- 산출물: `_design/density-budget.json`
- 예시:
```json
{
  "concept": { "max_bullets": 4, "max_svg_texts": 8 },
  "recap":   { "max_bullets": 3, "max_svg_texts": 6 },
  "hook":    { "max_bullets": 3, "max_svg_texts": 5 }
}
```
- 검증: bullet-writer / svg-designer가 상한 초과 시 실패 처리

## 회의실 5인 구성 (공통)

| 역할 | 책임 |
|------|------|
| P1 시각 디자인 | 타이포그래피·레이아웃·색상 |
| P2 교육 UX | 인지부하·시선 흐름·학습 효율 |
| P3 프론트엔드 | CSS·SVG 렌더링·접근성·브라우저 호환 |
| P4 교재 설계 | 정보 위계·일관성·표기 규정 |
| P5 QA | 자동 검증·회귀 방지·체크리스트 강제 |

최소 4인 합의 필요. 3인 이하 합의 시 의제 재논의.

## 검증 체크리스트 (자동)

파이프라인 2단계 진입 전 아래를 모두 만족해야 함:

- [ ] `_design/reference-lock.json` 존재 + 현재 레퍼런스 해시 일치
- [ ] `_design/deck-outline.md` 존재 + 파트 수 일치
- [ ] `_design/content-policy.md` 존재 + 필수 5개 항목 체크됨
- [ ] `_design/visual-language-meeting.md` 존재 + 4인 이상 서명
- [ ] `_design/regression-briefing.md` 존재 + 최소 3건 포함
- [ ] `_design/density-budget.json` 존재 + concept/recap/hook 키 모두 있음

하나라도 빠지면 `qa-validator`가 **A0 실패**로 표시 → 전체 재작업.

## 위반 시 재작업 표시

QA 리포트에 다음 형식 기록:
```
[A0-FAIL] Phase 0 산출물 누락 · 파트 XX
  · 누락: _design/visual-language-meeting.md
  · 복구: Phase 0-D 회의 실시 후 재제출
```

## 참조

- `.claude/rules/_meetings/2026-04-13_ppt-tutorial-design-upgrade.md` — 도입 회의록
- `.claude/rules/visual-verification.md` — 회귀 사례집 소스
- `.claude/rules/qa-checklist.md` — A0 섹션
- `.claude/workflows/ppt-generation.md` — Phase 0 통합 지점
- `.claude/agents/svg-designer.md` — Phase 0 입력 소비
- `.claude/agents/html-renderer.md` — Phase 0 입력 소비
