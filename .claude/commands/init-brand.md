---
name: init-brand
description: brand-context/_template을 <my-brand>로 복사 후 AskUserQuestion 인터뷰로 필수 필드 즉시 작성. 로고 SVG 경로·강사 소개·저작권은 임시값 주입 후 사용자가 이후 수정.
argument-hint: "<brand-slug>"
disable-model-invocation: false
---

# /init-brand

신규 브랜드를 인터뷰 방식으로 빠르게 생성.

## 사용

```
/init-brand my-brand
```

## 절차
1. `brand-context/<brand-slug>/` 존재 확인 · 이미 있으면 덮어쓰기 질의
2. `brand-context/_template/` 전체 복사
3. AskUserQuestion으로 핵심 필드 6개 수집:
   - 강사 또는 조직 이름 (displayName)
   - 1줄 소개 (≤40자)
   - 웹사이트 URL
   - 대표 이메일
   - 주력 플랫폼 (youtube·instagram·linkedin·tiktok·none)
   - 라이선스 (All-Rights-Reserved·CC-BY-4.0·MIT)
4. `brand.yaml` · `profile/instructor.md` · `copy/legal.md` 자동 업데이트
5. 로고 SVG는 템플릿 그대로 유지 (사용자가 직접 교체 안내)
6. 마무리 로그: 교체해야 할 파일 목록 출력

## 안내 출력 예

```
✅ brand-context/my-brand/ 생성 완료

다음 파일은 템플릿 상태입니다 · 사용자가 직접 교체:
  ○ assets/logo/logo.svg (본인 로고로)
  ○ assets/portraits/instructor.jpg (본인 사진 추가)
  ○ profile/instructor.md 긴 소개 섹션
  ○ profile/organization.md · mission.md (필요 시)
  ○ channels/qr-codes/ (플랫폼별 QR PNG 추가 · 선택)

검증: node .claude/scripts/brand-context-lint.mjs brand-context/my-brand
```

## 참조
- `.claude/rules/brand-context.md`
- `brand-context/_template/`
- `.claude/scripts/brand-context-lint.mjs`
