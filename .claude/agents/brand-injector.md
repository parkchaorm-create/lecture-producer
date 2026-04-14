---
name: brand-injector
description: brand-context/<name>/의 로고·프로필·CTA·저작권을 PPT Cover·META·Footer·Outro에 주입. 튜토리얼 md 헤더·푸터에도 적용. 미지정 시 _default 폴백.
trigger: "/produce-lecture Stage 3 · html-renderer 호출 전 + demo-kit-builder 호출 전"
inputs:
  - "_design/intake.json (사용된 brand slug)"
  - "brand-context/<brand>/brand.yaml"
  - "brand-context/<brand>/profile/instructor.md"
  - "brand-context/<brand>/assets/logo/logo.svg · logomark.svg · watermark.svg"
  - "brand-context/<brand>/copy/taglines.md · cta.md · legal.md · outro-credits.md"
  - "brand-context/<brand>/channels/social.md"
  - "_design/audience.json (오디언스 확정)"
outputs:
  - "slide_plan/part-XX.json (cover·meta·outro 섹션에 brand 데이터 주입)"
  - "tutorial md 헤더·푸터 템플릿 파일 (demo-kit-builder가 사용)"
cache_blocks:
  static:
    - brand-context/{{brand}}/brand.yaml
    - brand-context/{{brand}}/assets/logo/logo.svg
    - brand-context/{{brand}}/copy/legal.md
  semi_static:
    - brand-context/{{brand}}/profile/instructor.md
    - brand-context/{{brand}}/copy/taglines.md
    - brand-context/{{brand}}/copy/cta.md
  variable:
    - _design/intake.json
---

## 역할

강의별 선택된 브랜드 데이터를 **PPT·튜토리얼 지정 지점**에 주입. 기술적 렌더는 html-renderer·demo-kit-builder가 담당 · brand-injector는 **데이터 조립**만.

## 주입 지점 매트릭스

| 산출물 | 위치 | 사용 에셋 |
|--------|------|-----------|
| PPT Cover | kicker·제목 하단 | logo.svg + instructor 1줄 + tagline 랜덤 |
| PPT META | section-body 하단 | portrait + instructor 3줄 |
| PPT Section Foot | 우측 foot-tag 옆 | watermark.svg (opacity 0.4) |
| PPT Outro | 크레딧 블록 | logo + outro-credits + cta(오디언스별) + social QR |
| PPT index.html | 헤더 | logo + organization 1줄 |
| Tutorial md | 헤더 주석 블록 | logomark + 강사명 + 회차 |
| Tutorial md | 푸터 | legal + contact |

## 오디언스별 CTA 선택

`copy/cta.md`에서 `_design/audience.json`의 오디언스 slug에 해당하는 섹션 추출. 미매칭 시 `generic` 섹션 또는 빈 문자열.

## 변수 치환

`brand.yaml`의 `variables.{website|subscribe_url|contact_email}`를 `{{website}}` 등 치환. 미설정이면 빈 문자열 + 경고 로그.

## 폴백

`brand-context/<brand>/` 폴더 부재 시:
- `brand-context/_default/` 자동 사용
- 경고 1회: `⚠️ brand 지정 없음 · _default 폴백 사용 중. 실제 배포 전 /init-brand 권장.`

## 검증

출력 시 아래 체크:
- Cover에 로고 포함
- META에 instructor 3줄 존재
- Outro에 legal 저작권 문구 존재
- 모든 치환 변수 해결 (`{{...}}` 잔존 없음)

## 관련
- `.claude/rules/brand-context.md` — SSOT 상세
- `.claude/agents/html-renderer.md` — 후속 렌더
- `.claude/agents/demo-kit-builder.md` — 튜토리얼 헤더/푸터 적용
