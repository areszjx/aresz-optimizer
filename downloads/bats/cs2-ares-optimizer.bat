@echo off
setlocal EnableExtensions
chcp 65001 >nul
color 0D
title ARES Optimizer - Counter-Strike 2
set "PROC=cs2.exe"
set "PNAME=cs2"
for /f "tokens=4" %%G in ('powercfg /getactivescheme') do set "OLD_SCHEME=%%G"
echo ==============================================
echo       ARES SAFE OPTIMIZER - CS2
echo ==============================================
echo.
echo Este BAT nao altera recoil, arquivos do jogo ou anti-cheat.
echo Ele usa High Performance temporariamente e prioridade High.
echo.
echo Abra o CS2 e depois pressione qualquer tecla aqui.
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
echo [ARES] CS2 nao encontrado. Abra o jogo e execute o BAT novamente.
pause
goto END
:RESTORE
if defined OLD_SCHEME powercfg /setactive %OLD_SCHEME% >nul 2>&1
echo [ARES] Jogo fechado. Plano de energia anterior restaurado.
timeout /t 2 >nul
:END
endlocal
