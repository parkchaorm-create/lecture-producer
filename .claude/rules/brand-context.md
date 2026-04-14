# Brand Context (제공자 브랜드 SSOT · v1.2)

> "누가 말하는가" — 강사·조직·채널 아이덴티티. `branding/<audience>/`(수강생 톤)·`assets/themes/`(시각 테마)와 **독립 교체** 가능.

## 3계층 독립성

| 영역 | 폴더 | 질문 |
|------|------|------|
| 오디언스 톤 | `branding/<audience>/` | "어떻게 말할까?" |
| **제공자 브랜드** | `brand-context/<brand>/` | "누가 말하는가?" |
| 시각 테마 | `assets/themes/<theme>/` | "어떤 무대에서?" |

조합 자유. 어느 하나를 바꿔도 나머지 영향 없음.

## 필수·선택 파일

| 파일 | 필수 | 용도 |
|------|------|------|
| `brand.yaml` | ✅ | SSOT 메타 (name·type·license·변수) |
| `profile/instructor.md` | ✅ | 1줄·3줄·긴 소개 3버전 |
| `assets/logo/logo.svg` | ✅ | 메인 로고 (SVG 필수 · 불가침 1원칙) |
| `copy/legal.md` | ✅ | 저작권·면책 (법적 보호) |
| `profile/organization.md` | ⚪ | 조직 정보 |
| `profile/mission.md` | ⚪ | 미션·가치 (톤 근원) |
| `assets/logo/logomark.svg` | ⚪ | 아이콘 (footer) |
| `assets/watermark.svg` | ⚪ | 슬라이드 우하단 |
| `assets/portraits/instructor.jpg` | ⚪ | 강사 사진 |
| `copy/taglines.md` | ⚪ | Cover 슬로건 |
| `copy/cta.md` | ⚪ | 오디언스별 CTA |
| `copy/outro-credits.md` | ⚪ | Outro 템플릿 |
| `channels/social.md` | ⚪ | SNS URL |
| `channels/contact.md` | ⚪ | 연락처 |
| `channels/qr-codes/*.png` | ⚪ | Outro QR |
| `tokens.json` | ⚪ | 테마 악센트 override |

## 로고 규격 (불가침 1원칙)

- 메인 로고는 **SVG 필수**. PNG만 있으면 경고 (래스터 폴백 용도만)
- `viewBox` 명시 의무
- 투명 배경 (배경 rect 금지 · 카드 배경에 얹히므로)
- `<title>` + `<desc>` 의무 (접근성 A1)
- `<metadata>` 블록에 저작권 `<dc:rights>` 권장

## 치환 변수

`brand.yaml`의 `variables:` 필드:
- `{{website}}` · `{{subscribe_url}}` · `{{contact_email}}` 등
- `copy/*.md` 안에서 자유 사용
- `brand-injector`가 런타임 치환

## 오디언스와의 연결

`brand.yaml`이 특정 오디언스에 편향될 수 없음. 대신:
- `copy/cta.md`는 오디언스별 섹션(`## public-lecture`·`## youtube-longform` 등)
- `profile/mission.md`는 `tone-guide.md` R2(금지어)와 **상충 금지**

## 검증 (brand-context-lint)

- [ ] 필수 파일 존재 (brand.yaml·instructor.md·logo.svg·legal.md)
- [ ] `brand.yaml`의 `name`·`displayName`·`license` 비어있지 않음
- [ ] 로고 SVG에 `viewBox`·`<title>` 존재
- [ ] `legal.md`에 저작권 표기 존재
- [ ] 치환 변수 사용 시 `brand.yaml`에 정의됨
- [ ] `mission.md`(있을 시) 금지어 충돌 없음

위반 시 `brand-context-lint.mjs`가 실패 코드 반환.

## PPT 적용 지점 (brand-injector 책임)

| 위치 | 에셋 |
|------|------|
| Cover | logo + instructor 1줄 + tagline 랜덤 |
| META | portrait + instructor 3줄 |
| Section Foot | watermark |
| Outro | logo + outro-credits + cta + social QR |
| index.html | logo + organization 1줄 |
| Tutorial md 헤더 | logomark + 강사명 |
| Tutorial md 푸터 | legal + contact |

## 폴백

`brand-context/<brand>/` 부재 시 `_default/` 자동. 경고 1회만 출력 · 에러 아님.

## qa-checklist A12 (v1.2)

- [ ] Cover에 로고 표시됨
- [ ] META에 강사 소개 3줄 존재
- [ ] Outro에 저작권 표기 존재
- [ ] 치환 변수 `{{...}}` 잔존 없음
- [ ] `brand-context-lint` 통과

## 참조
- `.claude/agents/brand-injector.md` · `.claude/commands/init-brand.md`
- `.claude/scripts/brand-context-lint.mjs`
- `brand-context/_template/` · `_default/`
