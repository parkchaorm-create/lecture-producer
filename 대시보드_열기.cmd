@echo off
REM lecture-producer 대시보드 런처 (더블클릭 실행)
chcp 65001 >nul
cd /d "%~dp0"

echo ============================================
echo  lecture-producer Dashboard
echo  http://127.0.0.1:3737
echo  (이 창을 닫으면 서버가 종료됩니다)
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js 가 설치되어 있지 않습니다.
  echo https://nodejs.org 에서 v18+ 설치 후 다시 실행하세요.
  pause
  exit /b 1
)

REM 3초 뒤 기본 브라우저로 대시보드 열기 (PowerShell 사용 — 경로/URL 파싱 안정)
start "" /b powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://127.0.0.1:3737'"

REM 대시보드 서버 실행 (포그라운드 · Ctrl+C 또는 창 닫으면 종료)
node dashboard\server.mjs

echo.
echo 서버가 종료되었습니다.
pause
