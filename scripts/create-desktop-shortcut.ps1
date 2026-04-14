$ErrorActionPreference = 'Stop'
$ws = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath('Desktop')
$lnkPath = Join-Path $desktop 'lecture-producer 대시보드.lnk'
$lnk = $ws.CreateShortcut($lnkPath)
$lnk.TargetPath = 'C:\Users\Admin\Documents\dev\lecture-producer\대시보드_열기.cmd'
$lnk.WorkingDirectory = 'C:\Users\Admin\Documents\dev\lecture-producer'
$lnk.IconLocation = 'C:\Windows\System32\shell32.dll,14'
$lnk.Description = 'lecture-producer 로컬 대시보드 실행'
$lnk.Save()
Write-Host "Created: $lnkPath"
