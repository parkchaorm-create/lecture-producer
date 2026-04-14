# Quiz Slide (평가 슬라이드 · v1.1 · F5)

> `/produce-lecture --with-quiz` 플래그 시 slide-planner가 강 끝에 자동 추가.

## 포함 유형 (강별 1개씩)

### 유형 A · 4지선다 체크포인트
- 이번 강 핵심 1개를 4지선다로 출제
- 정답은 숨김 (클릭 시 공개)
- 해설 1~2문장 포함

### 유형 B · 실습 체크리스트
- [DEMO] 섹션이 있는 강에만
- 실습 완료 조건 3~5개 체크박스 (localStorage 저장)
- 모두 체크 시 "다음 강 해금" 시각 표시

### 유형 C · 3줄 회고
- Reflect: "이번 강에서 가장 중요했던 것은?"
- Apply: "내일 적용할 한 가지는?"
- Question: "더 알고 싶은 것은?"
- 입력 → 로컬에만 저장 (서버 전송 X)

## 오디언스별 기본 유형

| Audience | 기본 유형 |
|----------|---------|
| public-lecture | C · 3줄 회고 (현장 짝 토의 연계) |
| youtube-longform | A · 4지선다 (리텐션 확인) |
| online-course | B · 실습 체크리스트 (완강률 추적) |

`--quiz-type` 플래그로 override 가능.

## 슬라이드 구조
- 섹션 타입: `data-diagram="quiz"`
- 섹션 카운터: 전체에서 별도 번호 (예: `QUIZ 1 / N`)
- Outro 직전, BRIDGE 다음 위치

## 접근성 (A3·A4 준수)
- 4지선다는 `<fieldset>` + `<input type="radio">` + `<label>`
- 체크리스트는 `<input type="checkbox">` + 키보드 토글
- 회고는 `<textarea>` + `aria-label`

## 출력 저장
- 사용자 응답은 `localStorage` (`lecture-<slug>-quiz-<partNum>`)
- 강의 완주 시 강사가 export 버튼으로 JSON 다운로드 가능 (public-lecture용)

## 참조
- `.claude/agents/slide-planner.md` — `--with-quiz` 처리 책임
- `.claude/rules/accessibility.md` — A3·A4
- `.claude/rules/html-structure.md` — 섹션 구조 확장
