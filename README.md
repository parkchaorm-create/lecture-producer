# 🎓 lecture-producer

**풀코스 강의 1편을 AI로 한 번에.** 스크립트·PPT·실습 튜토리얼까지 Claude Opus 4.6이 **파자마보스 스타일**로 자동 생성하는 오픈소스 스킬팩.

> 🇰🇷 한국어 전용 · MIT · Claude Code 필요

---

## 📸 스크린샷

<!-- 실제 스크린샷을 여기에 삽입하세요. 대시보드 실행 후 캡처 권장. -->
> 캡처 추가 예정 · `npm run dashboard` → http://127.0.0.1:3737 에서 직접 확인

---

## 누구를 위한 도구인가

- **1인 강사** — 혼자 풀코스를 기획·제작해야 하는 프리랜서·자영업자
- **지식 창작자** — 유튜브·온라인 강의·공공기관 출강을 준비하는 전문가
- **교육 스튜디오** — 여러 강의를 빠르게 일정한 퀄리티로 찍어내야 하는 팀

**필요한 시간**:
- 기존: 풀코스 1편 준비 3~4주 (스크립트 + PPT + 실습)
- lecture-producer: **기획서만 있으면 반나절** (휴먼인루프 3번 검토 포함)

**비용**:
- 강의 1편(6강) 제작 약 **$9~16** (Claude API 과금, `--batch` 모드 기준 최저)
- 대시보드 운영은 **0원** (로컬 Node.js)

---

## 무엇을 만들어 주나

**입력**: 강의 기획서 1장 (+ 선택: 참고 자료 / 목차 / 완성 스크립트 / 프레임워크)

**산출물**:
1. 📝 **강별 스크립트** (한국어 · ACT 4분할 · 출처 `[src:N]` 부착)
2. 🎨 **PPT HTML** (인터랙티브 · 아코디언 토글 · SVG 9 아키타입 · 키보드 조작)
3. 🛠 **실습 튜토리얼** (복사·붙여넣기 가능한 마크다운 키트)
4. 🌐 (선택) **GitHub Pages 자동 배포**
5. 📊 **강의 목록·비용·진행률 대시보드**

---

## 🎨 5가지 공식 테마

| 테마 | 분위기 | 타겟 |
|------|--------|------|
| **Pajamaboss** | 럭셔리 다크 골드 | 공공강의·프로페셔널 |
| **Paperback** | 라이트 크림 서적풍 | 인문학·독서 모임 |
| **Neo-Tech** | 사이버 네온 블루 | 개발자 유튜브·테크 |
| **Warm Pastel** | 세이지 + 블러시 | 라이프스타일·여성 창업자 |
| **Mono Editorial** | 흑백 에디토리얼 | 학술·대학원·저널리즘 |

각 테마 썸네일은 대시보드 **➕ NEW** 페이지에서 카드로 확인.

---

## 🚀 5분 빠른 시작

### 사전 준비 (최초 1회)

1. **Node.js 18+** 설치 → [nodejs.org](https://nodejs.org)
2. **Git** 설치 → [git-scm.com](https://git-scm.com)
3. **Claude Code** 설치 + 로그인 → [claude.com/claude-code](https://claude.com/claude-code)
   - ⚠️ Claude Pro/Max 유료 플랜 필요

### ⚡ 원클릭 설치

#### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.ps1 | iex
```

#### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.sh | bash
```

### 수동 설치 (위가 안 되면)

```bash
git clone https://github.com/parkchaorm-create/lecture-producer
cd lecture-producer
npm run dashboard
```

브라우저에서 **http://127.0.0.1:3737** 접속.

### 💡 Windows 더블클릭 실행

설치 완료 시 프로젝트 폴더에 **`dashboard.bat`** 생성됨. 더블클릭 한 번으로:
- 서버 자동 실행
- 브라우저 자동 오픈

바탕화면 바로가기로 끌어놓으면 **아이콘 더블클릭 → 끝**.

---

## 첫 강의 만들기

1. **대시보드 접속** → `http://127.0.0.1:3737`
2. 상단 **NEW** 클릭
3. 폼 채우기:
   - 강의 식별자 (영문)
   - 오디언스 선택 (공공강의·유튜브·온라인)
   - 테마 카드 선택 (5종 중)
   - 브랜드 선택 (본인 브랜드 없으면 `_default`)
4. **예상 비용** 자동 계산 · 확인
5. **▶ 실행** 클릭 → SSE 실시간 로그
6. 첫 1강 완성 후 **휴먼인루프 3게이트** 승인
   - G1 스크립트 → G2 PPT → G3 실습 튜토리얼
7. 승인 시 2~N강 자동 일괄 생성

---

## 4가지 입력 모드

어떤 상태에서 시작하든 맞는 모드가 있습니다:

| Mode | 입력 상태 | 활용 예 |
|------|----------|---------|
| **1 · 참고자료** | 참고 URL·이미지·메모 많음 | "자료는 모았는데 정리 안 됨" |
| **2 · 목차** | 강별 제목·주제는 정해짐 | "목차는 잡았어, 본문만 필요" |
| **3 · 완성 스크립트** | 이미 다 썼음 · 분할만 | "원고는 있어, PPT만 만들어줘" |
| **4 · 프레임워크** | 방법론 1개 | "이 프레임워크를 강의로" |

---

## 휴먼인루프 3게이트 · 왜 중요한가

AI가 자동 생성한다고 1~N강 전부 덮어놓고 만들지 않습니다. **첫 1강만 만든 뒤 사용자가 확인하고 승인해야** 나머지 강으로 진행:

| 게이트 | 시점 | 선택지 |
|--------|------|--------|
| G1 스크립트 | 1강 원고 완성 후 | 승인 / 톤 수정 / 구조 재설계 / 재시도 / 중단 |
| G2 PPT | 1강 PPT 완성 후 | 동일 |
| G3 튜토리얼 | 1강 실습 완성 후 | 동일 |

덕분에 **최악의 경우에도 1강 치 비용**(약 $2)만 소모하고 조정 가능.

---

## 🔌 옵션 기능

- **`--batch`**: 2~N강을 Anthropic Message Batches로 묶어 **50% 단가 할인** ($9.87/6강)
- **`--deploy`**: 완성 후 **GitHub Pages 자동 배포** (상대경로 자동 rewrite)
- **`--upload-notion`**: 실습 튜토리얼을 Notion 페이지로 업로드
- **`--with-quiz`**: 강 끝에 퀴즈·체크리스트 슬라이드 자동 추가 (v1.1)

---

## 자주 막히는 곳

<details>
<summary><b>Q. 서버는 떴는데 브라우저에서 빈 화면이 보여요</b></summary>

- `Ctrl+Shift+R`로 강제 새로고침
- 주소를 정확히 `http://127.0.0.1:3737` (`https` 아님)
- 브라우저 개발자 도구(F12) → Console 탭에서 오류 확인
</details>

<details>
<summary><b>Q. ▶ 실행 버튼을 눌러도 반응이 없어요</b></summary>

기본값은 **안전상 비활성**. `.claude/local-config.json`에 추가:
```json
{ "dashboard": { "allowExec": true } }
```
Claude Code CLI가 설치되어 있어야 버튼 클릭이 실제 실행으로 연결됩니다.
</details>

<details>
<summary><b>Q. 포트 3737이 이미 쓰이고 있다고 해요</b></summary>

`dashboard/server.mjs` 상단 `const PORT = 3737;`을 다른 값(예: 8080)으로 수정.
</details>

<details>
<summary><b>Q. 비용이 걱정됩니다</b></summary>

- 대시보드 **접속·조회만**: 무료
- 강의 **실제 생성**: 6강 기준 $9~16 (배치 모드 최저)
- `⚙️ SYSTEM` 페이지 비용 계산기에서 사전 추정 가능
- 1강만 만들어 보고 멈춰도 괜찮음 (휴먼인루프 게이트 "중단" 선택)
</details>

<details>
<summary><b>Q. 한국어 외 언어 지원?</b></summary>

v1.4 기준 **한국어만**. v1.5에서 영어·일본어 추가 예정.
</details>

<details>
<summary><b>Q. Node·Git 설치 중 막혀요</b></summary>

- Windows: 공식 사이트에서 installer 다운로드 후 "다음" 연속 클릭 (기본값 OK)
- macOS: Homebrew로 `brew install node git`
- Linux: 배포판 패키지 매니저 (`apt install nodejs git` 등)

설치 확인: 터미널에서 `node --version` · `git --version` 입력해 버전이 나오면 성공.
</details>

---

## 📖 더 알아보기

- **[dashboard/README.md](dashboard/README.md)** — 대시보드 상세 API·보안
- **[CHANGELOG.md](CHANGELOG.md)** — 버전별 변경 이력
- **[CLAUDE.md](CLAUDE.md)** — 내부 작동 원리·에이전트 구조
- **[samples/mode-1-references/](samples/mode-1-references/)** — 가공 빵집 도메인 샘플 세트
- **[assets/themes/](assets/themes/)** — 5개 테마 `tokens.json`

---

## 기여

- **커뮤니티 테마** 기여 환영 (v1.6 예정)
- 버그 리포트: [Issues](https://github.com/parkchaorm-create/lecture-producer/issues)

---

## 라이선스

**MIT**. 상업적 사용 가능. 생성된 강의 콘텐츠의 저작권은 **사용자 본인**.

Pretendard 폰트는 [OFL 1.1](https://github.com/orioncactus/pretendard/blob/main/LICENSE).

---

<p align="center">
  <b>🌙 혼자서도 충분한 강의 제작 루틴</b><br>
  Made with Claude Opus 4.6
</p>
