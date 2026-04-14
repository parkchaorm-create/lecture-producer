---
name: add-svg-component
description: 우수한 SVG를 재사용 가능한 컴포넌트로 assets/svg_components/에 저장. 키워드/메타데이터 포함.
---

# /add-svg-component — SVG 재사용 컴포넌트 추가

특정 PPT에서 잘 만들어진 SVG를 발견하면 라이브러리로 추출해 다른 프로젝트/파트에서 재사용 가능하게 저장.

## 사용법

```
/add-svg-component <name> [--source=<file>] [--slide=<N>]
/add-svg-component trumpet-audit --source=ppt_parts/part-10.html --slide=4
/add-svg-component orchestra-layout  # 인터랙티브 선택
```

## 절차

1. `--source`가 없으면 목록 표시 후 선택 대기
2. `--slide`가 없으면 해당 파일의 모든 SVG 미리보기 후 선택
3. SVG 블록 추출 (`<svg>...</svg>`)
4. 메타데이터 수집 (사용자에게 질문):
   - 용도 (`use_case`)
   - 키워드 (`keywords`, 쉼표 구분)
   - 아키타입 (A1~A9)
5. `assets/svg_components/<name>.svg` 저장
6. `assets/svg_components/index.json` 업데이트

## 불변 0조 (2026-04-13 도입 · 저장 전 필수 검증)

다음이 포함된 SVG는 **라이브러리 저장 금지**:
- `class="svg-pulse"`, `svg-stagger`, `svg-rotate-slow`, `svg-ripple`, `svg-twinkle` 등 CSS 애니메이션 클래스
- 이유: CSS transform이 SVG transform 속성을 덮어써 요소 위치 깨짐

저장 전 저장 대상 SVG에서 애니메이션 클래스를 제거한 **정적 SVG**만 등록한다.

상세: `.claude/rules/svg-design.md`

## 저장 형식

### `assets/svg_components/trumpet-audit.svg`
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!-- name: trumpet-audit -->
<!-- use_case: SEO 건강검진 체크리스트 표시 -->
<!-- archetype: A6 -->
<!-- keywords: seo, geo, audit, trumpet, health-check -->
<svg viewBox="0 0 400 260" class="infographic">
  ...
</svg>
```

### `assets/svg_components/index.json`
```json
{
  "components": [
    {
      "name": "trumpet-audit",
      "file": "trumpet-audit.svg",
      "keywords": ["seo", "geo", "audit", "trumpet", "health-check"],
      "archetype": "A6",
      "use_case": "SEO 건강검진 체크리스트 표시",
      "parts_used": ["10"],
      "created_at": "2026-04-12"
    }
  ]
}
```

## 플래그

| 플래그 | 의미 |
|--------|------|
| `--source=<file>` | SVG를 추출할 HTML 파일 |
| `--slide=<N>` | 해당 파일의 N번째 슬라이드 |
| `--from-library=<name>` | 기존 컴포넌트를 리네임/업데이트 |

## 활용

`svg-designer` 에이전트가 이 라이브러리를 먼저 검색:
1. 슬라이드 bullets의 키워드 추출
2. `index.json`의 keywords와 매칭
3. 매칭 시 해당 컴포넌트 불러와서 재사용 (슬롯만 교체)
4. 매칭 없으면 아키타입 기반 신규 생성

## 팀 공유

이 라이브러리는 `.claude/` 와 별개로 `assets/svg_components/`에 저장되므로:
- git으로 버전 관리 가능
- 팀 내 공유 가능
- 다른 프로젝트에 복사 가능

## 참조

- `.claude/agents/svg-designer.md` — 라이브러리 활용
- `.claude/rules/svg-design.md` — SVG 규칙
- `assets/ARCHETYPE_CATALOG.md` — 아키타입 정의
