@echo off
cd /d "%~dp0"
echo ===================================================
echo   [NEONSPIN] 로컬 개발 서버를 실행하고 있습니다...
echo   브라우저 창이 자동으로 열리지 않으면 아래 주소로 접속하세요:
echo   http://localhost:5173
echo ===================================================
timeout /t 2 /nobreak >nul
start http://localhost:5173
npm run dev
pause
