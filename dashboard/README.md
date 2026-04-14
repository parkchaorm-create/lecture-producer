# lecture-producer Dashboard

로컬 웹 대시보드. lecture-producer 스킬팩 상태를 한눈에 + 버튼 클릭으로 바로 실행.

## 실행

```bash
npm run dashboard
# 또는
node dashboard/server.mjs
```

→ 브라우저에서 [http://127.0.0.1:3737](http://127.0.0.1:3737)

## 구성

- **Zero-dependency** · Node 18+ 내장 `http`만 사용
- **127.0.0.1 only** · LAN 접근 차단
- **파자마보스 테마** 재사용

## 페이지

| 경로 | 용도 |
|------|------|
| `#/` | 강의 목록 (`output/*/` 스캔) · 진행률·비용·상태 한눈에 |
| `#/new` | 신규 강의 폼 · 비용 미리보기 · ▶ 실행 버튼 |
| `#/lecture/<slug>` | 강의 상세 · 강 목록 그리드 |
| `#/lecture/<slug>/part/<N>` | 강별 상세 · PPT iframe · 스크립트·튜토리얼·피드백 탭 |
| `#/system` | Lint 4종·Smoke·비용 계산기·브랜드/테마 목록 |

## Exec 모드 (▶ 실행 버튼)

**기본: 비활성**. `.claude/local-config.json`에 추가해 활성:

```json
{
  "dashboard": {
    "allowExec": true
  }
}
```

활성 시 ▶ 실행 버튼 → 서버가 `claude -p "..."` spawn → SSE 스트리밍 로그를 로그 패널에 실시간 표시.

비활성 시 "📋 명령어 복사" 버튼 사용 (클립보드에 복사 → 터미널에서 붙여넣기).

## 토큰 비용

- 대시보드 자체: **0원** (로컬 Node만)
- ▶ 실행 버튼 클릭 시: 해당 `/produce-lecture` 1회 비용 (v1.2 --batch ~$9.87/6강)

## 보안

- `127.0.0.1`만 바인딩 · 외부 접근 불가
- Exec 모드 opt-in · 기본 비활성
- command 화이트리스트: `claude`·`node`만 허용
- path traversal 차단

## 정적 파일 서빙

- `/` → `dashboard/public/`
- `/output/` → `../output/` (강의 산출물 미리보기)
- `/assets/` → `../assets/` (테마 에셋)
- `/brand-context/` → `../brand-context/`

## API

| Method | Path | 용도 |
|--------|------|------|
| GET | `/api/config` | allowExec·version |
| GET | `/api/lectures` | 강의 목록 |
| GET | `/api/lecture/:slug` | 강의 상세 |
| GET | `/api/brands` | 브랜드 목록 |
| GET | `/api/themes` | 테마 목록 |
| GET | `/api/cost?parts=N&batch=0/1` | 비용 계산기 |
| GET | `/api/lint` | 4 lint 실행 |
| GET | `/api/smoke` | smoke 테스트 |
| POST | `/api/exec` | (Exec 모드) command spawn · SSE 응답 |

## 포트 변경

`dashboard/server.mjs` 상단 `const PORT = 3737;` 수정.
