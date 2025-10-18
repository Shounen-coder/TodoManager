@echo off
setlocal enabledelayedexpansion

rem === Clean folder structure generator ===
set OUTPUT=project-structure.txt
echo TodoManager/ > "%OUTPUT%"

for /f "tokens=*" %%a in ('dir /b /s /a-d ^| findstr /V /I "node_modules\\. \.git\\ android\\ ios\\ dist\\ build\\ coverage\\ .expo\\"') do (
  set "line=%%~a"
  rem Remove full path up to current directory
  set "line=!line:%CD%\=!"
  rem Convert backslashes to forward slashes
  set "line=!line:\=/!"
  echo ├── !line!>> "%OUTPUT%"
)

echo.
echo Done! Opening clean folder tree...
notepad "%OUTPUT%"
