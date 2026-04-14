# Notion MCP Setup Guide

실습 튜토리얼을 노션에 자동 업로드하려면 MCP Notion 서버를 등록해야 합니다. **선택** 기능 — 설정 안 하면 로컬 md 파일만 생성됩니다.

## 1단계 · 노션 Integration 생성

1. https://www.notion.so/my-integrations 접속
2. "New integration" 클릭
3. 이름 (예: `lecture-producer`), 워크스페이스 선택
4. Capabilities: `Read content`, `Insert content`, `Update content` 체크
5. 생성 후 **Internal Integration Secret** 복사 (예: `secret_xxxxx`)

## 2단계 · 업로드할 페이지에 권한 부여

1. 노션에서 튜토리얼이 올라갈 상위 페이지 열기
2. 우측 상단 `···` → `Add connections` → 1단계에서 만든 integration 추가
3. 페이지 ID 복사 (URL의 마지막 32자 hex · 예: `abc123...`)

## 3단계 · MCP 서버 등록

프로젝트 루트에 `.mcp.json` 생성 (`.mcp.json.example` 참고):

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": {
        "NOTION_TOKEN": "secret_xxxxx"
      }
    }
  }
}
```

또는 환경변수:
```bash
# macOS/Linux
export NOTION_TOKEN="secret_xxxxx"

# Windows PowerShell
$env:NOTION_TOKEN = "secret_xxxxx"
```

## 4단계 · 실행

```
/produce-lecture --upload-notion
```

처음 실행 시 AskUserQuestion으로 부모 페이지 ID 입력 받음. 이후 `output/<slug>/_meta.json`에 저장되어 재사용.

## 오류 대응

| 증상 | 원인 | 해결 |
|------|------|------|
| `401 Unauthorized` | 토큰 만료·잘못됨 | Integration Secret 재발급 |
| `403 Forbidden` | 페이지 권한 없음 | 2단계 connection 추가 확인 |
| `429 Rate limit` | 빠른 연속 요청 | 자동 백오프 재시도 (E3) |
| MCP 서버 미인식 | `.mcp.json` 위치 | 프로젝트 루트인지 확인 |

## 보안

- `.mcp.json`·`.env`는 `.gitignore` 기본 처리
- 공개 저장소 push 전 시크릿 스캔 권장
