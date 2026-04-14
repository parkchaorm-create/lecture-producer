# Web Research Protocol (웹 딥서치 규약)

> 신뢰도 확보 + 할루시네이션 예방. lecture-writer·expert-council이 의무 준수.

## 1차 출처 정의

- **공식 문서**: 제품 공식 사이트·공식 블로그·공식 GitHub
- **학술·보고서**: 논문·정부 보고서·공인 기관 통계
- **저명 매체**: 크로스 체크 가능한 3대 이상 매체가 보도한 사실

**2차 출처 (주의)**: 개인 블로그·SNS·위키(편집 가능). 1차 출처로 크로스 체크 가능할 때만 사용.

## 최소 수집량

주제당 **최소 5건** 1차 출처. 미달 시 lecture-writer 작업 시작 금지.

## WebSearch 프롬프트 템플릿

```
Query: "<주제> official documentation 2026"
Filters: 최근 12개월 우선, 공식 도메인 우선
```

## 캐싱

- 결과를 `output/<slug>/_design/web-cache-<topic>.md`에 저장
- TTL 30일 또는 사용자 수동 무효화 (`rm web-cache-*.md`)
- 동일 주제 재크롤링 차단

## 출처 ID 부여

각 출처에 `[src:1]`, `[src:2]`, ...:
```markdown
# web-cache-claude-code-pricing.md

## [src:1] · Anthropic 공식 가격 페이지
- URL: https://claude.com/pricing
- 조회: 2026-04-14
- 핵심: Pro $20/월, Max $100/월

## [src:2] · Anthropic 공식 블로그
- URL: ...
```

## 할루시네이션 검출 (E6)

- 모든 사실 주장에 `[src:N]` 부착 의무
- `citation-check.mjs`가 누락 시 적색 실패
- N이 web-cache에 없으면 무효 처리

## 최신성 검증

1년 이상 된 버전·가격·API 정보는 자동 경고. 사용자에게 "최신 확인 필요" 질의.

## 윤리·저작권

- 인용은 짧게 (한 출처당 3문장 이내)
- 이미지·로고는 출처 명시 + 교육용 공정이용 범위
- 저작권 표시 필수 자료는 강의 슬라이드 풋터에 표기

## 참조

- `.claude/rules/error-handling.md` — E6 출처 역추적
- `.claude/rules/quality-method.md` — K5 실측 우선
- `_design/citation-index.md` — 파트별 출처 인덱스
