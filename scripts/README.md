# scripts/

원클릭 설치·실행 스크립트.

## 설치 (신규 사용자)

### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.ps1 | iex
```

### macOS / Linux
```bash
curl -fsSL https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.sh | bash
```

설치 스크립트가 수행하는 작업:
1. Node.js · Git 설치 여부 확인
2. 사용자 지정 폴더에 저장소 clone
3. 더블클릭 실행 스크립트 생성 (`dashboard.bat` 또는 `dashboard.sh`)
4. (Windows) 바탕화면 바로가기 생성

## 실행 (설치 후)

### Windows
- 바탕화면의 **lecture-producer Dashboard** 더블클릭
- 또는 프로젝트 폴더의 `dashboard.bat` 더블클릭
- 또는 터미널에서 `npm run dashboard`

### macOS / Linux
- `./dashboard.sh` (프로젝트 폴더에서)
- 또는 `npm run dashboard`

## 보안

- 설치 스크립트는 **오픈소스 공개**. 실행 전 코드 검토 권장
- 모든 작업은 사용자가 지정한 폴더에 국한
- 시스템 파일·레지스트리 변경 없음
- API 키·토큰 요구하지 않음 (Claude Code는 별도 인증)

## 문제 해결

### "실행 정책" 오류 (Windows PowerShell)
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

### `chmod +x` 필요 (macOS/Linux)
수동 설치 시:
```bash
chmod +x dashboard.sh
```

### 방화벽이 Node 차단
최초 실행 시 방화벽 대화창에 "허용" 선택. 로컬(`127.0.0.1`) 전용이라 외부 노출 없음.
