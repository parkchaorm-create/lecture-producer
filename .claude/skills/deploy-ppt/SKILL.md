---
name: deploy-ppt
description: 완성된 강의(output/<slug>/ppt/)를 GitHub Pages로 자동 배포. worktree 모드(현 repo gh-pages 브랜치)·separate 모드(별도 public repo)·local 모드(배포 패키지만 생성).
argument-hint: "<slug> [--target worktree|separate:<owner>/<repo>|local]"
disable-model-invocation: false
allowed-tools: Bash
---

# /deploy-ppt

강의 1편을 GitHub Pages로 publish.

## 사용

```
/deploy-ppt ai-bakery-course
/deploy-ppt ai-bakery-course --target separate:myname/ai-bakery-course
/deploy-ppt ai-bakery-course --target local
```

## 모드

### worktree (기본 · 현 repo에 gh-pages 브랜치)
- 현 `lecture-producer` repo 내부에서 gh-pages 브랜치 worktree 생성·push
- 여러 강의를 한 사이트에 모아 배포 · `output/<slug>/` 경로로 각 강의 구분
- 루트 `index.html`에 강의 목록 자동 생성
- GitHub Pages Settings에서 gh-pages 브랜치 활성화 1회 필요

### separate:`<owner>/<repo>`
- 강의 1편 = 독립 public repo
- `gh` CLI로 repo 자동 생성 + main 브랜치 publish
- 고유 도메인 사용 가능 (예: `myname.github.io/ai-bakery-course/`)

### local
- 배포 없이 `_deploy/<slug>/` 패키지만 생성
- 수동 업로드·다른 호스팅 (Netlify·Cloudflare Pages 등)용

## 자동 포함
- PPT HTML 파일
- `assets/themes/pajamaboss/` 공통 에셋 (상대경로 유지)
- `_meta.json`
- `.nojekyll` (GitHub Pages의 Jekyll 처리 건너뛰기)

## 실행

!`node .claude/scripts/deploy-ppt.mjs $ARGUMENTS`

## 출력
- 배포 URL (콘솔)
- `_deploy/<slug>/` 배포 패키지 (worktree·separate 모드에서도 보존)

## 참조
- `.claude/scripts/deploy-ppt.mjs`
- `.claude/commands/produce-lecture.md` (Stage 3 마지막에 자동 호출 옵션)
