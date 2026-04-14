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

## v1.1 예상 변경 (로드맵)

- Playwright 시각 검증 워크플로우 자동 통합
- `samples/_gold-standard/content/` 추가 (콘텐츠 골드)
- `cost-estimator.mjs` · `diff-capture.mjs` · `citation-check.mjs` 활성화
- 접근성 (WCAG AA) qa-checklist 확장
- 평가 슬라이드 (`--with-quiz`) 자동 추가

### v1.0 → v1.1 영향
- 기존 output/ 그대로 호환
- 새 기능은 opt-in (플래그 필요)

## v2.0 예상 변경 (로드맵)

- 다국어 (영어·일본어) 오디언스 추가
- 팀 협업 시나리오 (git LFS · 바이너리 관리)
- GitHub Actions 자동 빌드
- LMS 연동
- 라이트모드 테마 변형

### v1.x → v2.0 영향
- `_meta.json` 스키마에 `locale` 필드 추가 (기본값 `ko-KR`로 하위호환)
- 기존 한국어 강의는 변경 없이 동작
