@echo off
cd /d "%~dp0"
node scripts/setup.mjs
if errorlevel 1 goto fail
call npm ci --ignore-scripts
if errorlevel 1 goto fail
call npm run build
if errorlevel 1 goto fail
call npm run register
if errorlevel 1 goto fail
echo Ready. Run start.cmd / Hazir. start.cmd calistirin.
pause
exit /b 0
:fail
echo Setup stopped. Read README troubleshooting. / Kurulum durdu. README sorun giderme bolumune bakin.
pause
exit /b 1
