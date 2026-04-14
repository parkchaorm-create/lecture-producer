# Audience Profiles (오디언스 규격 SSOT)

> `lecture-writer` 에이전트가 오디언스 결정 후 이 파일을 읽어 톤·길이·구조를 결정. v1.0은 한국어 only.

## 지원 오디언스 매트릭스

| Slug | 표시명 | 1강 분량 | 1강 글자수 | 어조 | P6 (도메인 전문가) |
|------|--------|---------|-----------|------|-------------------|
| `public-lecture` | 공공기관 강의 | 80~100분 | 4500~5500자 | `-습니다` 통일 | 공공기관 교육운영 전문가 |
| `youtube-longform` | 유튜브 풀코스 롱폼 | 8~15분 | 800~1500자 | 친근 존댓말 + 가끔 반말 | 유튜브 리텐션·SEO 전문가 |
| `online-course` | 온라인 강의 (VOD) | 25~40분 | 2000~3000자 | 중립 `-요` | LMS·학습관리 전문가 |
| `<custom>` | 사용자 추가 | (사용자 정의) | (사용자 정의) | (사용자 정의) | (사용자 정의) |

## 페르소나 슬롯 (필수 4개)

각 오디언스 폴더의 `persona.md`에 **4개 슬롯 의무 작성**:
- P1. 나이대·생활 환경
- P2. 사전 지식
- P3. 동기·목표
- P4. 환경 제약

미작성 시 `lecture-writer`가 일반화된 페르소나로 가정 (퀄리티 -10% 예상).

## 톤 가이드 SSOT

각 오디언스 폴더의 `tone-guide.md`가 SSOT. R1~R7 규칙 의무.
- R1 어조 · R2 금지 · R3 권장 · R4 길이 · R5 용어 · R6 호흡 · R7 출처

## Glossary (금지·권장·외래어)

각 오디언스 폴더의 `glossary.md` 자동 로드. `citation-check.mjs`·`tone-lint.mjs`가 grep 검증.

## 신규 오디언스 추가 절차

1. `cp -r branding/_template branding/<new-slug>`
2. `tone-guide.md`·`glossary.md`·`persona.md` 작성
3. 본 매트릭스에 행 추가
4. `lecture-writer`는 자동으로 인식 (별도 코드 변경 불필요)

## v2.0 로드맵
- 다국어 지원 (영어·일본어 오디언스)
- 오디언스 + 도메인 교차 (공공강의 × IT 보안 등)

## 참조
- `branding/<slug>/tone-guide.md` — R1~R7 SSOT
- `branding/<slug>/glossary.md` — 금지어·권장어·외래어
- `branding/<slug>/persona.md` — P1~P4 슬롯
- `.claude/rules/voice-lock.md` — 1강 톤 잠금 규약
- `.claude/agents/lecture-writer.md` — 톤 로딩 책임
