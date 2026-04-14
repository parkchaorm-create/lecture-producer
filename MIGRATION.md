# Migration Guide

## v1.0 (첫 릴리스)
- 기준 버전. 이전 버전 없음.
- `.claude/VERSION = 1.0.0`

## 업그레이드 원칙 (v1.0 → v1.1·v2.0)

1. **`local-config.json` 보존**: 사용자가 `.claude/local-config.json` 또는 `output/`·`input/`에 만든 변경분은 업그레이드 중 절대 덮어쓰지 않음
2. **테마 보존**: `assets/themes/<custom>/` 사용자 추가 테마는 그대로 유지
3. **branding 보존**: `branding/<custom>/` 사용자 추가 오디언스 유지
4. **규칙 파일**: `.claude/rules/*.md`는 pull 시 덮어씀 (사용자 수정은 `local-config.json`으로 오버라이드)

## 업그레이드 절차

```bash
# 1. 변경사항 백업
cp -r output/ output.backup/
cp -r branding/ branding.backup/
cp -r assets/themes/ themes.backup/

# 2. pull
git pull origin main

# 3. 커스텀 파일 비교·복원
diff -r branding.backup/ branding/
# 필요 시 수동 머지

# 4. 호환성 검증
node .claude/scripts/portability-check.mjs
node .claude/scripts/theme-lint.mjs
```

## v1.2 (2026-04-14 릴리스)

### 추가 (모두 opt-in · 기존 output/·brand-context/ 호환)
- 토큰 최적화 8종 (O8~O15): XML 섹션화·Few-shot 하이브리드·Phase 0 glossary·프롬프트 캐시 구조·모델 분배·배치 API·slide-composer 통합·Extended thinking
- 브랜드 컨텍스트 체계: `brand-context/_template` · `_default` · `/init-brand` · `brand-injector` · `brand-context-lint`
- GitHub Pages 자동 배포: `/deploy-ppt` + `produce-lecture --deploy` (상대경로 자동 rewrite 포함)
- 증분 검증 모드 (qa-validator) · diff-only 2차 회의 (expert-council)

### v1.1 → v1.2 업그레이드
```bash
git pull origin master
node tests/e2e/smoke.mjs                        # 통과 확인
node .claude/scripts/cost-estimator.mjs 6 --batch  # 실측 $9.87 확인
```
- 기존 `output/<slug>/`·`_design/` 그대로 동작
- `brand-context/` 미설정 시 `_default` 자동
- 신규 플래그는 opt-in · 기본 경로 그대로 사용 가능
- `slide-composer`가 기본, 기존 2에이전트 경로 원하면 `--plan-only`

### 실측 효과
- 일반: v1.1 $19.93 → v1.2 **$15.69** (-21%)
- 배치: v1.2 --batch **$9.87** (v1.1 대비 -50%)

---

## v1.1 (2026-04-14 릴리스)

### 추가된 것 (모두 opt-in · 기존 output/ 호환)
- 검증 스크립트: `cost-estimator` · `citation-check` · `similarity-check` · `diff-capture`
- 자동화: `backup.mjs` · `regression-briefing.mjs`
- 규칙: `accessibility.md` · `quiz-slide.md` · qa-checklist A10·A11
- 콘텐츠 골드: `samples/_gold-standard/content/`
- 공식 Skill 표준: `.claude/skills/*/SKILL.md` (`commands/`와 병행)
- CI: `.github/workflows/ci.yml` + `tests/e2e/smoke.mjs`

### v1.0 → v1.1 업그레이드
```bash
git pull origin main
node tests/e2e/smoke.mjs   # 통과 확인
```
- 기존 `output/<slug>/` 그대로 유지 · 호환
- 신규 파트 생성 시 자동으로 v1.1 검증 적용
- 강제 전환 없음 — 이전 파트 재검증 원하면 `/verify-all`

## v2.0 예상 변경 (로드맵)

- 다국어 (영어·일본어) 오디언스 추가
- 팀 협업 시나리오 (git LFS · 바이너리 관리)
- GitHub Actions 자동 빌드
- LMS 연동
- 라이트모드 테마 변형

### v1.x → v2.0 영향
- `_meta.json` 스키마에 `locale` 필드 추가 (기본값 `ko-KR`로 하위호환)
- 기존 한국어 강의는 변경 없이 동작
