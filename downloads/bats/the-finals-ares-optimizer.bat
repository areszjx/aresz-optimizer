@echo off
setlocal EnableExtensions
chcp 65001 >nul
color 0D
title ARES Optimizer - THE FINALS
set "PROC=Discovery.exe"
set "PNAME=Discovery"
for /f "tokens=4" %%G in ('powercfg /getactivescheme') do set "OLD_SCHEME=%%G"
echo ==============================================
echo    ARES SAFE OPTIMIZER - THE FINALS
echo ==============================================
echo.
echo Abra THE FINALS e pressione qualquer tecla aqui.
echo O BAT usa High Performance temporariamente e prioridade High.
pause >nul
tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul
if errorlevel 1 goto NOTFOUND
powercfg /setactive SCHEME_MIN >nul 2>&1
powershell -NoProfile -Command "$p=Get-Process -Name '%PNAME%' -ErrorAction SilentlyContinue; if($p){$p.PriorityClass='High'}" >nul 2>&1
echo [ARES] Otimizacao aplicada. Nao feche esta janela.
:WAIT
timeout /t 5 /nobreak >nul
tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul
if not errorlevel 1 goto WAIT
goto RESTORE
:NOTFOUND
echo [ARES] THE FINALS nao encontrado. Abra o jogo e tente novamente.
pause
goto END
:RESTORE
if defined OLD_SCHEME powercfg /setactive %OLD_SCHEME% >nul 2>&1
echo [ARES] Plano anterior restaurado.
timeout /t 2 >nul
:END
endlocal
