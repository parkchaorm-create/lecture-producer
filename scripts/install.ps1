# lecture-producer · Windows 원클릭 설치 스크립트
# 사용: iwr -useb https://raw.githubusercontent.com/parkchaorm-create/lecture-producer/master/scripts/install.ps1 | iex

$ErrorActionPreference = 'Stop'

Write-Host ""
Write-Host "🎓 lecture-producer 원클릭 설치" -ForegroundColor Yellow
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray

# 1. 사전 조건 확인
Write-Host "`n[1/5] 사전 조건 확인..." -ForegroundColor Cyan
$prereq_ok = $true
try { $node = & node --version 2>$null; Write-Host "  ✓ Node.js $node" -ForegroundColor Green } catch {
  Write-Host "  ✗ Node.js 없음 · https://nodejs.org 에서 설치 필요" -ForegroundColor Red; $prereq_ok = $false
}
try { $git = & git --version 2>$null; Write-Host "  ✓ $git" -ForegroundColor Green } catch {
  Write-Host "  ✗ Git 없음 · https://git-scm.com 에서 설치 필요" -ForegroundColor Red; $prereq_ok = $false
}
try { $npm = & npm --version 2>$null; Write-Host "  ✓ npm $npm" -ForegroundColor Green } catch {
  Write-Host "  ✗ npm 없음 (Node.js와 함께 설치됨)" -ForegroundColor Red; $prereq_ok = $false
}
if (-not $prereq_ok) {
  Write-Host "`n사전 조건을 먼저 설치 후 다시 실행하세요." -ForegroundColor Yellow
  exit 1
}

# 2. 설치 위치
Write-Host "`n[2/5] 설치 위치 선택..." -ForegroundColor Cyan
$default = "$env:USERPROFILE\Documents\lecture-producer"
$dir = Read-Host "  설치 폴더 [$default]"
if ([string]::IsNullOrWhiteSpace($dir)) { $dir = $default }
if (Test-Path $dir) {
  $overwrite = Read-Host "  이미 존재 · 덮어쓸까요? (y/N)"
  if ($overwrite -ne 'y') { Write-Host "취소됨." -ForegroundColor Yellow; exit 0 }
  Remove-Item -Path $dir -Recurse -Force
}

# 3. Git clone
Write-Host "`n[3/5] 저장소 복제..." -ForegroundColor Cyan
git clone https://github.com/parkchaorm-create/lecture-producer.git "$dir" 2>&1 | Out-Host
if (-not (Test-Path "$dir\package.json")) {
  Write-Host "  ✗ 복제 실패" -ForegroundColor Red; exit 1
}

# 4. dashboard.bat 생성 (프로젝트 폴더 + 바탕화면 바로가기)
Write-Host "`n[4/5] 편의 스크립트 생성..." -ForegroundColor Cyan
$batPath = "$dir\dashboard.bat"
@"
@echo off
cd /d "%~dp0"
start "" "http://127.0.0.1:3737"
node dashboard/server.mjs
pause
"@ | Set-Content -Path $batPath -Encoding Default

# 바탕화면 바로가기 (선택)
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = "$desktop\lecture-producer Dashboard.lnk"
try {
  $ws = New-Object -ComObject WScript.Shell
  $lnk = $ws.CreateShortcut($lnkPath)
  $lnk.TargetPath = $batPath
  $lnk.WorkingDirectory = $dir
  $lnk.IconLocation = "shell32.dll,220"
  $lnk.Description = "lecture-producer Dashboard"
  $lnk.Save()
  Write-Host "  ✓ 바탕화면 바로가기 생성" -ForegroundColor Green
} catch {
  Write-Host "  · 바탕화면 바로가기 생성 실패 (무시 가능)" -ForegroundColor DarkGray
}

# 5. 완료 안내
Write-Host "`n[5/5] ✅ 설치 완료!`n" -ForegroundColor Green
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "📁 프로젝트 폴더: $dir" -ForegroundColor White
Write-Host "🚀 실행 방법 (택 1):" -ForegroundColor White
Write-Host "    A. 바탕화면의 'lecture-producer Dashboard' 더블클릭" -ForegroundColor Yellow
Write-Host "    B. 프로젝트 폴더의 dashboard.bat 더블클릭" -ForegroundColor Yellow
Write-Host "    C. 터미널에서:" -ForegroundColor Yellow
Write-Host "       cd `"$dir`"; npm run dashboard" -ForegroundColor DarkGray
Write-Host "`n🌐 접속 주소: http://127.0.0.1:3737" -ForegroundColor Cyan
Write-Host "📖 사용법: README.md 또는 dashboard/README.md 참고`n" -ForegroundColor DarkGray
