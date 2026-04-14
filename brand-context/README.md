# brand-context/ · 제공자 브랜드 아이덴티티

> "누가 말하는가" — 강사·조직·채널의 아이덴티티 (로고·프로필·CTA·저작권).
>
> 수강생 톤인 `branding/<audience>/`와 **독립**. 시각 테마인 `assets/themes/`와도 독립.
> 3개 조합: "파자마보스 테마 + 공공강의 톤 + 우리회사 브랜드"처럼 자유.

## 구성

```
brand-context/
├── README.md            # 이 파일
├── _template/           # 신규 브랜드 생성 시 복사 원본
├── _default/            # 폴백 중립 브랜드 (공백 시 자동 사용)
└── <my-brand>/          # 사용자 인스턴스 (여러 개 가능)
```

## 빠른 시작

```bash
cp -r brand-context/_template brand-context/my-brand
# brand.yaml 수정 · profile/instructor.md 작성 · assets/logo/logo.svg 교체
```

또는 `/init-brand <my-brand>` 스킬 사용 시 인터뷰 질의로 자동 생성.

## 실행 시

`/produce-lecture --brand my-brand` 또는 `_design/intake.json`의 `brand` 필드.

미지정 시 `_default` 자동 · 에러 아님.

## 파일 목록 (_template 기준)

| 파일 | 필수 | 용도 |
|------|------|------|
| `brand.yaml` | ✅ | SSOT 메타 |
| `profile/instructor.md` | ✅ | 강사 1줄·3줄·긴소개 |
| `profile/organization.md` | 선택 | 조직 정보 |
| `profile/mission.md` | 선택 | 미션·비전·톤 근원 |
| `assets/logo/logo.svg` | ✅ | 메인 로고 (불가침 1원칙 SVG) |
| `assets/logo/logomark.svg` | 선택 | 아이콘·워터마크 |
| `assets/logo/logo-dark.png` | 선택 | 다크 배경용 래스터 폴백 |
| `assets/portraits/instructor.jpg` | 선택 | 강사 프로필 사진 |
| `assets/watermark.svg` | 선택 | 슬라이드 우하단 작은 로고 |
| `copy/taglines.md` | 선택 | Cover 슬로건 3~5개 |
| `copy/cta.md` | 선택 | 오디언스별 CTA |
| `copy/legal.md` | ✅ | 저작권·면책 |
| `copy/outro-credits.md` | 선택 | Outro 크레딧 |
| `channels/social.md` | 선택 | SNS URL |
| `channels/contact.md` | 선택 | 연락처 |
| `channels/qr-codes/*.png` | 선택 | Outro 삽입 QR |
| `tokens.json` | 선택 | 테마 악센트 override |

## 검증

`node .claude/scripts/brand-context-lint.mjs brand-context/<name>` — 필수 파일·SVG 규격·저작권 표기 검사.

## 참조
- `.claude/rules/brand-context.md` — SSOT 상세 규약
- `.claude/agents/brand-injector.md` — PPT 적용 에이전트
- `.claude/commands/init-brand.md` — 인터뷰 생성 커맨드
