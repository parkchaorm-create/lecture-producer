---
name: lecture-producer
version: 1.0.0
description: 한국어 풀코스 강의(스크립트 + PPT + 실습 튜토리얼) 자동 생성 스킬팩. 4 input 모드 × 4 오디언스 × 파자마보스 테마. 6인 전문가 가상 회의 + 휴먼인루프 3게이트.
author: lecture-producer contributors
license: MIT
compatibleClaude: ">=4.5"
recommendedModels:
  council: claude-opus-4-6
  webResearch: claude-opus-4-6
  scriptWriting: claude-opus-4-6
  rendering: claude-sonnet-4-6
  linting: claude-haiku-4-5
entryPoints:
  - /produce-lecture
  - /analyze-framework
  - /verify-all
requires:
  - Node.js >= 18
optional:
  - Playwright (시각 검증 · v1.1 필수)
  - Notion MCP (튜토리얼 업로드 · 선택)
tags:
  - lecture
  - ppt
  - korean
  - education
  - pajamaboss
---

# lecture-producer

Claude Code에서 이 저장소를 클론만 하면 자동 감지되는 스킬팩.

## 진입점
- `/produce-lecture` — 메인 파이프라인
- `/analyze-framework` — 프레임워크 분석 전용
- 나머지 9개 커맨드는 `.claude/commands/`

## 요구 환경
- Claude Code 4.5+ (Opus 4.6 권장)
- Node.js 18+
- (선택) Playwright, Notion MCP

## 빠른 시작
[README.md](README.md) 참조.
