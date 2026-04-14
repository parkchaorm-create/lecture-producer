# Pajamaboss Theme

`lecture-producer`의 **기본 테마**. 럭셔리 다크 골드 디자인 시스템.

## 파일 구성
- `tokens.json` — 색상·폰트·크기·애니메이션 SSOT (단일 진실 원천)
- `theme.yaml` — 메타데이터 (이름·작성자·라이선스·필수 폰트)
- `common.css` — 600+ 줄 CSS (모든 색상은 `var(--*)`만 참조)
- `common.js` — 인터랙션 (네비·tilt 3D·커서·배경 캔버스 5종)

## 핵심 토큰
| 토큰 | 값 | 용도 |
|------|----|----|
| `--black` | `#0D0D0D` | 배경 |
| `--gold` | `#e2c793` | 강조 |
| `--cream` | `#F7F0DF` | 밝은 텍스트 |
| `--text` | `#E8E0CC` | 본문 |
| `--muted` | `#7a7666` | 보조 |
| 본문 | 19px | 40대 시인성 |
| Detail | 16px | 펼친 설명 |
| SVG viewBox | `0 0 400 260` | 불변 |

## 신규 테마 만들기
1. 이 폴더를 `../<new-theme>/`로 복사
2. `tokens.json`의 `palette`·`typography`·`fontSize` 수정
3. `theme.yaml`의 `name`·`displayName`·`author`·`license` 갱신
4. `.claude/scripts/theme-lint.mjs` 실행으로 하드코딩 검출
5. `_design/theme.json`에 `{"theme": "<new-theme>"}` 또는 `--theme <new-theme>` 플래그로 활성화

## 절대 금지 (불변 0조)
SVG `<g>`·`<text>` 등에 CSS 애니메이션 클래스(`svg-pulse`·`svg-stagger` 등) 부여 금지. CSS `transform`이 SVG `transform`을 덮어써 좌표 깨짐. 정렬 강조는 `stroke-width`·`opacity`로만.

## 라이선스
MIT. Pretendard 폰트는 별도 OFL.
