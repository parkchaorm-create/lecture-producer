@echo off
REM lecture-producer · Windows 대시보드 실행 (더블클릭용)
REM 프로젝트 폴더에 이 .bat이 있으면 더블클릭 한 번으로 서버+브라우저 실행

cd /d "%~dp0"
cd ..

echo.
echo 🎓 lecture-producer Dashboard
echo.

REM 브라우저 자동 오픈 (서버 시작 1초 후)
start "" /b powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:3737'"

REM 서버 실행
node dashboard/server.mjs

echo.
echo 종료되었습니다. 창을 닫으려면 아무 키나 누르세요.
pause >nul
