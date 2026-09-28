@echo off
setlocal EnableExtensions
chcp 65001 >nul
color 0D
title ARES Optimizer - Minecraft
for /f "tokens=4" %%G in ('powercfg /getactivescheme') do set "OLD_SCHEME=%%G"
echo ==============================================
echo     ARES SAFE OPTIMIZER - MINECRAFT
echo ==============================================
echo.
echo Abra o Minecraft e pressione qualquer tecla aqui.
echo O BAT detecta Java ou Bedrock, usa High Performance temporariamente
echo e prioridade High. Nao altera mods, saves ou arquivos do jogo.
pause >nul
set "PROC="
set "PNAME="
tasklist /FI "IMAGENAME eq javaw.exe" | find /I "javaw.exe" >nul && (set "PROC=javaw.exe" & set "PNAME=javaw")
if not defined PROC tasklist /FI "IMAGENAME eq Minecraft.Windows.exe" | find /I "Minecraft.Windows.exe" >nul && (set "PROC=Minecraft.Windows.exe" & set "PNAME=Minecraft.Windows")
if not defined PROC goto NOTFOUND
powercfg /setactive SCHEME_MIN >nul 2>&1
powershell -NoProfile -Command "$p=Get-Process -Name '%PNAME%' -ErrorAction SilentlyContinue; if($p){$p.PriorityClass='High'}" >nul 2>&1
echo [ARES] Otimizacao aplicada em %PROC%. Nao feche esta janela.
:WAIT
timeout /t 5 /nobreak >nul
tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul
if not errorlevel 1 goto WAIT
goto RESTORE
:NOTFOUND
echo [ARES] Minecraft Java/Bedrock nao encontrado. Abra o jogo e tente novamente.
pause
goto END
:RESTORE
if defined OLD_SCHEME powercfg /setactive %OLD_SCHEME% >nul 2>&1
echo [ARES] Plano anterior restaurado.
timeout /t 2 >nul
:END
endlocal
