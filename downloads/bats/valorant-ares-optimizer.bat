@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
mode con cols=88 lines=32 >nul 2>&1
color 0D
title AresZ ^| ARES Advanced Session Optimizer - VALORANT
set "GAME=VALORANT"
set "ID=valorant"
set "PROC=VALORANT-Win64-Shipping.exe"
set "PNAME=VALORANT-Win64-Shipping"
set "ROOT=%LOCALAPPDATA%\AresZ\ARES"
set "LOGDIR=%ROOT%\Logs"
set "BACKUP=%ROOT%\%ID%-power.txt"
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
net session >nul 2>&1
if errorlevel 1 (powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" & exit /b)
:MENU
cls
call :HEADER
echo [1] Iniciar Performance Session monitorada
echo [2] Aplicar boost rapido ao processo
echo [3] Diagnostico do jogo e sistema
echo [4] Restaurar plano de energia salvo
echo [5] Abrir pasta de logs
echo [0] Sair
echo.
set /p "OP=Selecione uma opcao: "
if "%OP%"=="1" goto SESSION
if "%OP%"=="2" goto QUICK
if "%OP%"=="3" goto DIAG
if "%OP%"=="4" goto RESTORE
if "%OP%"=="5" start "" "%LOGDIR%" & goto MENU
if "%OP%"=="0" goto END
goto MENU
:HEADER
echo ================================================================================
echo   AresZ  //  ARES ADVANCED SESSION OPTIMIZER
echo   GAME PROFILE: %GAME%
echo ================================================================================
echo.
exit /b
:SAVEPOWER
for /f "tokens=4" %%G in ('powercfg /getactivescheme') do >"%BACKUP%" echo %%G
exit /b
:WAITPROC
tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul && exit /b 0
echo [ARES] %GAME% ainda nao foi detectado.
choice /c WM /n /m "[W] Aguardar automaticamente  [M] Voltar ao menu: "
if errorlevel 2 exit /b 1
for /l %%N in (1,1,90) do (tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul && exit /b 0 & timeout /t 2 /nobreak >nul)
exit /b 1
:PRIORITY
powershell -NoProfile -Command "$p=Get-Process -Name '%PNAME%' -ErrorAction SilentlyContinue; if($p){$p.PriorityClass='High'; exit 0}else{exit 1}" >nul 2>&1
exit /b
:SESSION
cls
call :HEADER
call :SAVEPOWER
powercfg /setactive SCHEME_MIN >nul 2>&1
call :WAITPROC
if errorlevel 1 goto MENU
call :PRIORITY
>>"%LOGDIR%\%ID%-session.log" echo [%date% %time%] SESSION START - High Performance + Priority High
echo [ARES] Session ativa. O processo sera monitorado e a prioridade reaplicada.
echo [ARES] Ao fechar o jogo, o plano anterior sera restaurado automaticamente.
:MONITOR
timeout /t 10 /nobreak >nul
tasklist /FI "IMAGENAME eq %PROC%" | find /I "%PROC%" >nul
if errorlevel 1 goto AUTORESTORE
call :PRIORITY
goto MONITOR
:AUTORESTORE
call :RESTORECORE
>>"%LOGDIR%\%ID%-session.log" echo [%date% %time%] SESSION END - Power plan restored
echo.
echo [ARES] Jogo encerrado. Estado de energia restaurado.
timeout /t 3 /nobreak >nul
goto MENU
:QUICK
cls
call :HEADER
call :SAVEPOWER
powercfg /setactive SCHEME_MIN >nul 2>&1
call :WAITPROC
if errorlevel 1 goto MENU
call :PRIORITY
>>"%LOGDIR%\%ID%-session.log" echo [%date% %time%] QUICK BOOST applied
echo [ARES] Boost rapido aplicado. Use a opcao 4 depois para restaurar o plano.
pause
goto MENU
:DIAG
cls
call :HEADER
echo [POWER PLAN]
powercfg /getactivescheme
echo.
echo [PROCESSO]
tasklist /FI "IMAGENAME eq %PROC%"
echo.
echo [PRIORIDADE]
powershell -NoProfile -Command "$p=Get-Process -Name '%PNAME%' -ErrorAction SilentlyContinue; if($p){'Priority: '+$p.PriorityClass+' | PID: '+$p.Id}else{'Processo nao encontrado'}"
echo.
echo [HARDWARE]
powershell -NoProfile -Command "$c=Get-CimInstance Win32_Processor|Select-Object -First 1;$g=Get-CimInstance Win32_VideoController|Select-Object -First 1;$o=Get-CimInstance Win32_OperatingSystem; 'CPU: '+$c.Name; 'GPU: '+$g.Name; 'RAM livre: '+[math]::Round($o.FreePhysicalMemory/1MB,1)+' GB'"
pause
goto MENU
:RESTORE
call :RESTORECORE
echo [ARES] Plano salvo restaurado.
pause
goto MENU
:RESTORECORE
if exist "%BACKUP%" (set /p "OLD="<"%BACKUP%" & if defined OLD powercfg /setactive !OLD! >nul 2>&1)
exit /b
:END
endlocal
