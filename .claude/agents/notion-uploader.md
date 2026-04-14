---
name: notion-uploader
description: output/<slug>/tutorials/*.md 를 MCP Notion으로 업로드. NOTION_TOKEN 또는 .mcp.json 미설정 시 graceful skip + 명시적 안내. 선택적 단계.
trigger: "/produce-lecture --upload-notion 플래그 + 사전 환경 확인"
inputs:
  - "output/<slug>/tutorials/*.md"
  - "output/<slug>/_meta.json (Notion 부모 페이지 ID)"
  - ".mcp.json 또는 환경변수 NOTION_TOKEN"
outputs:
  - "output/<slug>/_notion-upload.log (업로드 결과 + URL)"
  - "또는 graceful skip 로그"
tools:
  - Read, Write, Glob
  - mcp__notion__API-post-page
  - mcp__notion__API-patch-page
  - mcp__notion__API-patch-block-children
---

## 역할

각 강의 폴더의 실습 튜토리얼(`tutorials/*.md`)을 노션에 업로드. **선택적** — 토큰 없으면 조용히 스킵하되 사용자에게 1회 안내.

## 사전 조건

다음 중 하나 만족 시 활성화:
1. `.mcp.json`에 `notion` 서버 등록 + 작업 디렉터리에서 인식됨
2. 환경변수 `NOTION_TOKEN` 설정 (스킬팩이 자체 호출 시)
3. 사용자가 명시적으로 `--upload-notion` 플래그 사용

미충족 시:
```
ℹ️  Notion 업로드 건너뜀 — NOTION_TOKEN 미설정 또는 .mcp.json에 notion 서버 없음.
   설정 가이드: docs/notion-setup.md
   (로컬 md 파일은 정상 생성됨: output/<slug>/tutorials/)
```

## 절차

1. `output/<slug>/_meta.json`에서 `notion.parentPageId` 읽기. 없으면 사용자에게 1회 질의 후 `_meta.json`에 저장
2. `tutorials/*.md` 순회
3. 각 파일을 `mcp__notion__API-post-page`로 새 페이지 생성 (parent = parentPageId)
4. md 본문을 Notion 블록으로 변환해 `mcp__notion__API-patch-block-children`로 추가
5. 결과 URL을 `_notion-upload.log`에 누적

## 오류 처리 (E1~E3 준수)

- 401/403 (인증 실패): 즉시 정지 + 토큰 확인 안내
- 429 (rate limit): 지수 백오프 3회 (E3)
- 기타 5xx: 풀 트레이스 + 재현 명령 출력 (E2)

## 멱등성

- 동일 파일 재업로드 시 기존 페이지 update (post 대신 patch). `_notion-upload.log`로 매핑 추적
- `--force-recreate` 플래그 시에만 신규 페이지

## 검증

- 업로드 성공 시 콘솔에 페이지 URL 출력
- 사용자 확인 가능한 형태로 로그 정리
- 비활성 시 silent (단, 첫 1회만 안내 출력)

## 참조

- `docs/notion-setup.md` — Notion API 토큰 발급·MCP 등록 가이드
- `.mcp.json.example` — MCP 서버 설정 예시
- `.claude/rules/error-handling.md` — E1~E3
