# Script Splitter Budget (분량 Budget 표)

> script-splitter / lecture-writer가 목차 자동 분할 시 참조. 오디언스별 1강 분량 SSOT.

## 분량 표 (C2')

| Audience | 1강 시간 | 1강 글자수 | 권장 강 수 (3시간 총량) |
|----------|---------|-----------|------------------------|
| `public-lecture` | 80~100분 | 4500~5500자 | 2~3강 |
| `youtube-longform` | 8~15분 | 800~1500자 | 12~20강 |
| `online-course` | 25~40분 | 2000~3000자 | 5~8강 |
| `<custom>` | 사용자 정의 | 사용자 정의 | 자동 계산 |

## 변환 규칙

- **1분 = 약 300자** (한국어 낭독 평균)
- 오차 허용: ±10%
- 1강 = 1파일 (`script_parts/ACT{1-4}/part-XX.md`)

## ACT 분할 (4분할 원칙 유지)

| ACT | 목적 | 파트 수 권장 |
|-----|------|---------------|
| ACT1 Foundation | 배경·환경·전제 | 총 파트 수의 20% |
| ACT2 Skills | 개별 스킬·도구 | 30~40% |
| ACT3 Integration | 통합·오케스트레이션 | 20~30% |
| ACT4 Optimization | 심화·수익화·결론 | 15~20% |

각 ACT는 최소 1개 파트. 파트 번호는 ACT 경계와 무관하게 01부터 순차.

## Mode 1 자동 목차 설계 알고리즘

1. 사용자 기획서에서 "총 시간" 추출 (기본 3시간)
2. 오디언스별 1강 분량으로 나눔
3. ACT 4분할 비율 적용
4. 각 파트의 제목·키워드·예상 시간 제안
5. 사용자 확인 후 확정

예: `online-course` 3시간 → 180분 ÷ 30분 = 6강 → ACT1(1강)·ACT2(2강)·ACT3(2강)·ACT4(1강)

## Mode 3 (완성 스크립트) 분할 규칙

- 제공된 원고의 단원·섹션 경계 우선
- 경계 없으면 오디언스별 budget으로 자동 분할
- 각 강은 완결성 유지 (중간 분할 금지 — 다음 단원 경계까지 연장)

## 검증

- `output/<slug>/_postmortem.md`에 실제 분량 vs budget 비교 기록
- ±30% 초과 시 `qa-validator` A3 실패

## 참조

- `.claude/rules/audience-profiles.md` — 오디언스 매트릭스
- `.claude/agents/script-splitter.md` — 분할 실행
- `.claude/agents/lecture-writer.md` — 작성 실행
