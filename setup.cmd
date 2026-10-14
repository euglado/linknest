@echo off
cd /d "%~dp0"
call npm.cmd ci --ignore-scripts
if errorlevel 1 goto fail
call npm.cmd run build
if errorlevel 1 goto fail
call npm.cmd run setup
if errorlevel 1 goto fail
call npm.cmd run register
if errorlevel 1 goto fail
echo Ready. Run start.cmd to keep the bot online.
pause
exit /b 0
:fail
echo Setup stopped. See README troubleshooting.
pause
exit /b 1
