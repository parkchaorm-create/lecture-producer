# 풀코스 강의 제작기 · lecture-producer

**input 폴더에 자료만 넣으면 → 3시간+ 한국어 풀코스 강의 스크립트 + PPT + 실습 튜토리얼이 자동 생성**되는 Claude Code 스킬팩.

> 🔴 **v1.0은 한국어 전용**. 영어·일본어는 v2.0 로드맵.
> 🎨 기본 테마: **Pajamaboss** (럭셔리 다크 골드 · 40대 시인성 최적화 · SVG 9 아키타입)

---

## 핵심 특징

- **4가지 input 모드** × **4가지 오디언스** 교차 지원
- **6인 가상 전문가 회의** (설계 + 검수) · 가변 도메인 전문가
- **웹 딥서치** 1차 출처 5건+ 자동 수집 + 할루시네이션 게이트
- **휴먼인루프 3단계 게이트** (스크립트·PPT·튜토리얼 1강 완성 후 필수 승인)
- **K1 3중 검증**: 자동(qa-checklist) + 시각(Playwright) + 인간(H1~H4)
- **테마 교체** = `tokens.json` 한 파일만 수정
- **강의별 독립 폴더** 구조 (`output/<slug>/`), 한 저장소 = N 강의
- **노션 MCP 선택적** 업로드 (토큰 없으면 graceful skip)

---

## 빠른 시작

### 1. 설치

```bash
git clone https://github.com/<your-org>/lecture-producer.git
cd lecture-producer
```

Claude Code가 자동으로 `.claude/` 스킬팩을 감지합니다.

### 2. 입력 준비

```bash
# 기획서는 필수
cp templates/lecture-brief.md input/brief/

# 입력 모드 4종 중 하나 선택
cp -r samples/mode-1-references/input/mode-1-references/* input/mode-1-references/
```

### 3. 실행 (두 가지 방법)

**방법 A · Claude Code CLI 직접**
```
/produce-lecture
```

오디언스 선택 질문에 답한 후, 3단계 휴먼인루프 게이트에서 1강 산출물을 승인하면 N강 일괄 생성.

**방법 B · 로컬 대시보드 (v1.3)**
```bash
npm run dashboard
# → http://127.0.0.1:3737
```

브라우저에서 강의 목록·진행률·비용을 한눈에. `#/new`에서 폼 채우고 ▶ 실행 버튼 · 실시간 로그. 상세는 [dashboard/README.md](dashboard/README.md).

---

## 입력 모드 4가지

| Mode | 폴더 | 언제 |
|------|------|------|
| **1** | `input/mode-1-references/` | 참고자료·URL·이미지 여러 개 + 기획서 |
| **2** | `input/mode-2-outline/` | 목차가 이미 정해진 경우 + 기획서 |
| **3** | `input/mode-3-fullscript/` | 완성된 스크립트가 있고 분할만 하고 싶은 경우 |
| **4** | `input/mode-4-framework/` | 퍼스널브랜딩 프레임워크 1개를 강의로 |

상세: [.claude/rules/input-mode-detection.md](.claude/rules/input-mode-detection.md)

## 오디언스 3종 + 커스텀

| Slug | 1강 분량 | 어조 |
|------|---------|------|
| `public-lecture` | 80~100분 | `-습니다` 통일 |
| `youtube-longform` | 8~15분 | 친근 존댓말 + 가끔 반말 |
| `online-course` | 25~40분 | 중립 `-요` |
| `<custom>` | 사용자 정의 | `branding/_template/` 복사해 추가 |

상세: [.claude/rules/audience-profiles.md](.claude/rules/audience-profiles.md)

---

## 폴더 구조

```
lecture-producer/
├── .claude/              # 스킬팩 (에이전트·커맨드·규칙·워크플로우)
├── assets/
│   ├── themes/pajamaboss/   # 기본 테마 (tokens.json · common.css/js)
│   └── svg_components/      # 재사용 SVG 라이브러리
├── branding/             # 오디언스별 톤·용어·페르소나
├── templates/            # 기획서·프레임워크 입력 템플릿
├── samples/              # 입력 유형별 reference 세트
├── docs/                 # 노션 setup 등 가이드
├── tests/                # e2e 스냅샷 (v1.1)
├── input/                # 사용자 작업 (gitignore)
└── output/               # 강의별 산출물 (gitignore)
    └── <slug>/
        ├── _meta.json
        ├── _design/
        ├── script_parts/
        ├── ppt/NN강_*.html
        └── tutorials/NN강_*-kit.md
```

---

## 핵심 불변 원칙 (50개 합의안 중 최상위 3개)

1. **파자마보스 스타일 무결성** — 골드/블랙·Pretendard·SVG 9 아키타입 1픽셀 드리프트 금지
2. **일관성** — 1강~N강 간 톤·호흡·시각 완전 동일 (voice-lock · 6인 2차 검수)
3. **신뢰도** — 1차 출처 5건+ 의무 · `[src:N]` 누락 문장 금지

v1.0의 전체 50개 합의안은 `.claude/rules/` 및 `docs/meeting-notes-summary.md`.

---

## 테마 교체

```bash
cp -r assets/themes/pajamaboss assets/themes/my-theme
# 이후 my-theme/tokens.json만 수정
```

`/produce-lecture --theme my-theme` 또는 `_design/theme.json`에 `{"theme": "my-theme"}`.

**하드코딩 금지**: `common.css`는 `var(--*)`만 참조. `.claude/scripts/theme-lint.mjs`로 검증.

상세: [assets/themes/pajamaboss/README.md](assets/themes/pajamaboss/README.md)

---

## 노션 업로드 (선택)

실습 튜토리얼을 노션에 자동 업로드. 기본은 비활성.

1. [docs/notion-setup.md](docs/notion-setup.md) 참고로 API 토큰 발급 + MCP 등록
2. `/produce-lecture --upload-notion` 실행

미설정 시 로컬 md만 생성됩니다 (에러 아님).

---

## 개발·기여

- 모델 권장: 6인 회의·웹 리서치는 **Claude Opus 4.6**, 렌더·검증은 **Sonnet/Haiku**
- 이식성 검증: `node .claude/scripts/portability-check.mjs`
- 테마 lint: `node .claude/scripts/theme-lint.mjs`
- 경로 lint: `node .claude/scripts/path-lint.mjs` (Windows MAX_PATH)

---

## 보안·프라이버시

- `input/`·`output/`은 `.gitignore` 기본 처리
- `_design/` 회의록에 PII 포함 금지 (pii-scan.mjs · v1.1)
- 가상 클라이언트·가공 도메인 사용 권장

---

## 라이선스

MIT. 자세한 내용은 [LICENSE](LICENSE).

Pretendard 폰트는 별도 OFL, 프로젝트 외 자산(레퍼런스 이미지 등)은 각 라이선스 준수.

---

## 링크

- [CLAUDE.md](CLAUDE.md) — 프로젝트 지침 (Claude Code 대상)
- [SKILL.md](SKILL.md) — Anthropic 스킬팩 메타데이터
- [MIGRATION.md](MIGRATION.md) — 버전 업그레이드 가이드
- [.claude/VERSION](.claude/VERSION) — 현재 버전
- [docs/](docs/) — 상세 가이드
