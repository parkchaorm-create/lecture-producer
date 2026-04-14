# Portability Rules (이식성 규칙)

> 이 스킬 팩은 어떤 프로젝트에 복사해도 동작해야 한다. 모든 에이전트/스킬은 이 규칙을 준수한다.

## 원칙 1: 절대 경로 금지

### 금지
- `C:\Users\Admin\Desktop\claudecode_masterclass_ppt\...`
- `/home/user/my-project/...`
- `ppt_parts/part-01.html` (이전 프로젝트 전용 파일 직접 참조)

### 권장
- 프로젝트 루트 기준 상대 경로: `./input/reference-ppt/*.html`
- 환경 변수: `${PROJECT_ROOT}` (Bash 명령 실행 시)
- 발견 기반: `ls input/reference-ppt/ | head -1`

## 원칙 2: 레퍼런스는 입력으로만 공급

### 에이전트는 항상 `input/reference-ppt/`에서 레퍼런스 PPT를 읽는다
- ❌ `ppt_parts/part-01.html` 하드코딩 참조 금지
- ✅ `input/reference-ppt/*.html` 중 첫 번째 파일 사용

### `ppt_parts/`는 출력 전용
- 새 작업 시작 시 비어 있음
- 에이전트는 `ppt_parts/`에서 참고 자료를 읽지 않음 (출력만)

## 원칙 3: 프로젝트 특화 콘텐츠 분리

### `.claude/` 내부에 포함 가능
- ✅ 에이전트 정의 (역할, 규칙)
- ✅ 슬래시 명령어 (진입점)
- ✅ 공통 규칙 (design-tokens, bullet-writing 등)
- ✅ 템플릿 스켈레톤 (placeholder만)

### `.claude/` 내부에 포함 금지
- ❌ 특정 강의의 스크립트 내용
- ❌ 특정 PPT의 완성된 HTML
- ❌ 특정 사용자의 개인 정보
- ❌ API 키, 비밀번호

## 원칙 4: 의존성 최소화

### 허용
- Claude Code 내장 도구 (Read, Write, Edit, Bash, Grep, Glob)
- Node.js v18+ 내장 모듈 (`fs`, `path`, `readline`, `crypto`, `child_process`)
- Git (자동 커밋용)

### 금지 (설치 부담 때문)
- npm 외부 패키지 (없이도 구현 가능한 것들)
- Python (Node.js로 대체)
- 유료 API (Anthropic API는 Claude Code 내 자동, 별도 키 필요 X)

### 조건부 허용
- Playwright (E2E 테스트용, 설치 가이드 별도 명시)

## 원칙 5: 에러 메시지 명확성

사용자가 처음 설치했을 때 발생 가능한 모든 실패 상황에 대해 **무엇을 해야 하는지** 명확히 안내:

```
❌ Error: reference-ppt folder is empty.

This skill requires at least one HTML file in input/reference-ppt/
to extract the visual style from.

Please add a sample PPT HTML file:
    input/reference-ppt/sample.html

Then run /generate-ppt again.
```

## 원칙 6: 빈 상태 지원

새로 설치된 프로젝트에서:
- `input/` 비어 있음 → 에이전트는 스키마 안내 후 중단
- `script_parts/` 비어 있음 → 정상 (워크플로우가 채움)
- `slide_plan/` 비어 있음 → 정상
- `ppt_parts/` 비어 있음 → 정상

**절대 금지**: 비어 있는 폴더를 발견했다고 해서 다른 프로젝트에서 콘텐츠를 복사하려는 시도

## 원칙 7: 설정 분리

### 글로벌 (스킬 팩 기본값)
- `rules/*.md`에 정의
- 모든 프로젝트에 동일 적용

### 프로젝트 로컬 (있으면 적용)
- `.claude/local-config.json` (gitignore 처리)
- 예: 색상 토큰 오버라이드, 파트 수 상한 등

### 우선순위: 프로젝트 로컬 > 글로벌 기본값

## 원칙 8: Git 친화적

### 포함 (커밋 가능)
- `.claude/` 전체 (README 포함)
- `CLAUDE.md`
- `SLIDE_AUTHORING_GUIDE.md`

### `.gitignore` 대상
```
# 출력 디렉토리
ppt_parts/
slide_plan/
script_parts/

# 사용자 입력 (민감 자료일 수 있음)
input/

# 로컬 설정
.claude/local-config.json
```

### 예외
- `input/reference-ppt/`에 공유용 샘플이 있다면 커밋 가능

## 원칙 9: 버전 호환

- 스킬 팩 버전 명시: `.claude/VERSION` 파일
- 주요 변경 시 CHANGELOG 업데이트
- 기존 프로젝트의 `input/reference-ppt/`는 하위 호환 유지

## 원칙 10: 팀 배포 시 체크리스트

팀원에게 전달하기 전 확인:
- [ ] `.claude/` 디렉토리 전체가 깔끔하게 정리됨
- [ ] `README.md`의 설치 안내가 정확함
- [ ] 하드코딩된 경로 없음 (grep으로 확인)
- [ ] 개인 정보/API 키 없음
- [ ] 샘플 레퍼런스 PPT 1개 포함 (또는 링크 제공)
- [ ] CHANGELOG 업데이트

## 검증

### 자동
```bash
# 하드코딩 경로 검출
grep -rE 'C:\\\\Users|/home/|/Users/' .claude/

# 절대 경로 참조 검출
grep -rE '^/[a-z]+/' .claude/*.md

# 개인정보 검출
grep -riE 'api[_ ]?key|password|secret' .claude/
```

### 수동
- 빈 프로젝트에 `.claude/` 복사 → `/generate-ppt` 실행 → 동작 확인

## 참조
- `.claude/README.md` — 설치/사용 가이드
- `.claude/rules/style-reference.md` — 입력 폴더 규약
