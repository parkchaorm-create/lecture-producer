# Cache Structure (프롬프트 캐시 구조 규약 · v1.2 · O11)

> Anthropic 프롬프트 캐시 5분 TTL을 극대화하는 시스템 프롬프트 구조 SSOT.
> 목표: 캐시 히트율 65%+ · 실효 비용 -35%.

## 3층 블록 구조 (에이전트 필수)

모든 에이전트는 시스템 프롬프트를 아래 3층으로 조립:

### 상단 블록 · 정적 (약 1500~2500 토큰) · `cache_control: ephemeral`
- `.claude/rules/design-tokens.md` (팔레트·폰트)
- `assets/themes/<theme>/tokens.json`
- 불가침 원칙 3개 (파자마보스·일관성·신뢰도)
- Phase 0 glossary 링크
- 에이전트 고유 지시문

**특성**: 세션·강의 무관하게 거의 불변. 5분 이내 재호출 시 100% 캐시 히트.

### 중단 블록 · 세미 정적 (약 1500~3000 토큰)
- 오디언스 톤 가이드 (`branding/<audience>/*.md`)
- 브랜드 컨텍스트 요약 (`brand-context/<brand>/brand.yaml` + `profile/` 요약)
- 골드 샘플 구조 JSON
- 페르소나 P1~P4

**특성**: 강의별 고정, 파트 간 불변. 같은 강의 N강 생성 시 캐시 히트.

### 하단 블록 · 가변 (약 500~2000 토큰)
- 현재 파트의 스크립트·슬라이드 plan JSON
- 이전 파트 human-feedback 요약
- 직전 에이전트 산출물

**특성**: 파트마다 바뀜. 캐시 미스 불가피.

## 구현 (에이전트 템플릿)

### frontmatter 지시
```yaml
---
name: <agent-name>
cache_blocks:
  static:
    - .claude/rules/design-tokens.md
    - assets/themes/pajamaboss/tokens.json
    - shared/phase-0-glossary.md
  semi_static:
    - branding/{{audience}}/tone-guide.md
    - brand-context/{{brand}}/brand.yaml
  variable: []  # 런타임 주입
---
```

### 시스템 프롬프트 조립 예
```
<cache_control type="ephemeral">
<!-- 상단 정적 블록 -->
[rules/design-tokens.md 본문]
[tokens.json 요약]
[불가침 3원칙]
</cache_control>

<cache_control type="ephemeral">
<!-- 중단 세미 정적 -->
[branding/<audience>/tone-guide.md]
[brand-context/<brand>/profile/instructor.md 3줄]
</cache_control>

<!-- 하단 가변 (no cache_control) -->
파트 번호: {{partNum}}
입력 JSON: ...
```

## 세션 연속성 (T2-D)

- `/produce-lecture`가 5분 이내 연속 에이전트 호출 시 자동 `--keep-alive`
- 사용자가 5분 이상 일시정지 시 Anthropic TTL 만료 → 다음 호출은 캐시 미스
- `token-cache-advisor.mjs`가 실제 히트율 측정 후 `_postmortem.md`에 기록

## 폴백

프롬프트 캐시 미지원 환경 (일부 프록시·구버전 SDK):
- `cache_control` 태그는 단순 주석으로 무시됨
- 기능상 문제 없음 · 단순 비용만 비최적
- 경고 로그 1회 출력

## 금지

- 상단 정적 블록에 가변 콘텐츠 혼입 금지 (캐시 무효화)
- 중단 블록에 현재 파트 JSON 섞기 금지
- 같은 블록을 쪼개서 여러 번 주입 금지

## 검증

`.claude/scripts/token-cache-advisor.mjs` (v1.2 · 선택):
- 로컬 로그에서 캐시 히트율 계산
- 블록 경계 위반 자동 검출

## 참조
- [Anthropic 프롬프트 캐시 공식 문서](https://docs.claude.com/en/docs/build-with-claude/prompt-caching)
- `.claude/rules/token-optimization.md` O11
- `.claude/rules/model-allocation.md` — 모델별 캐시 단가 차이
