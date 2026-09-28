@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
mode con cols=92 lines=34 >nul 2>&1
color 0D
title AresZ ^| ARES Network Optimizer
set "ROOT=%LOCALAPPDATA%\AresZ\ARES"
set "LOGDIR=%ROOT%\Logs"
set "REPORT=%USERPROFILE%\Desktop\ARES_Network_Report.txt"
if not exist "%LOGDIR%" mkdir "%LOGDIR%" >nul 2>&1
net session >nul 2>&1
if errorlevel 1 (powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs" & exit /b)
:MENU
cls
call :HEADER
echo [1] Aplicar Gaming Network Baseline
echo [2] Diagnostico de rede completo
echo [3] Limpar cache DNS
echo [4] Reparar Winsock/IP ^(use apenas se houver problema^)
echo [5] Exportar relatorio para o Desktop
echo [6] Abrir pasta de logs
echo [0] Sair
echo.
set /p "OP=Selecione uma opcao: "
if "%OP%"=="1" goto BASELINE
if "%OP%"=="2" goto DIAG
if "%OP%"=="3" goto DNS
if "%OP%"=="4" goto REPAIR
if "%OP%"=="5" goto REPORT
if "%OP%"=="6" start "" "%LOGDIR%" & goto MENU
if "%OP%"=="0" goto END
goto MENU
:HEADER
echo ====================================================================================
echo   AresZ  //  ARES NETWORK OPTIMIZER
echo   PROFILE: Gaming Baseline + Diagnostics + Repair Tools
echo ====================================================================================
echo.
exit /b
:BASELINE
cls
call :HEADER
netsh int tcp show global > "%LOGDIR%\network-before.txt"
echo [1/5] Limpando cache DNS...
ipconfig /flushdns >nul 2>&1
echo [2/5] Garantindo Receive Side Scaling...
netsh int tcp set global rss=enabled >nul 2>&1
echo [3/5] Auto-Tuning em NORMAL...
netsh int tcp set global autotuninglevel=normal >nul 2>&1
echo [4/5] ECN desativado para compatibilidade ampla...
netsh int tcp set global ecncapability=disabled >nul 2>&1
echo [5/5] Registrando estado final...
netsh int tcp show global > "%LOGDIR%\network-after.txt"
>>"%LOGDIR%\network-session.log" echo [%date% %time%] Gaming Network Baseline applied
echo.
echo [ARES] Baseline aplicado. Isso nao promete ping menor; o objetivo e remover
 echo estados TCP fora do padrao e manter uma base consistente para jogos.
pause
goto MENU
:DIAG
cls
call :HEADER
echo [INTERFACES / IP]
ipconfig | findstr /I "IPv4 Gateway DNS"
echo.
echo [TCP GLOBAL]
netsh int tcp show global
echo.
echo [LATENCIA EXTERNA - 1.1.1.1]
ping -n 6 1.1.1.1
echo.
echo [ADAPTADORES ATIVOS]
powershell -NoProfile -Command "Get-NetAdapter | Where-Object Status -eq 'Up' | Format-Table -Auto Name,InterfaceDescription,LinkSpeed"
pause
goto MENU
:DNS
cls
call :HEADER
ipconfig /flushdns
echo.
echo [ARES] Cache DNS limpo.
>>"%LOGDIR%\network-session.log" echo [%date% %time%] DNS cache flushed
pause
goto MENU
:REPAIR
cls
call :HEADER
echo Este modo e de REPARO, nao de boost. Ele redefine Winsock e a pilha IP.
echo Pode exigir reinicializacao e remover configuracoes de rede personalizadas.
echo.
choice /c SN /n /m "Deseja continuar? [S/N]: "
if errorlevel 2 goto MENU
netsh winsock reset
netsh int ip reset "%LOGDIR%\ip-reset.log"
>>"%LOGDIR%\network-session.log" echo [%date% %time%] Winsock/IP repair executed
echo.
echo [ARES] Reparo concluido. Reinicie o Windows antes de testar a conexao.
pause
goto MENU
:REPORT
cls
call :HEADER
>"%REPORT%" echo AresZ - ARES Network Report
>>"%REPORT%" echo Gerado em %date% %time%
>>"%REPORT%" echo.
>>"%REPORT%" ipconfig /all
>>"%REPORT%" echo.
>>"%REPORT%" netsh int tcp show global
>>"%REPORT%" echo.
>>"%REPORT%" powershell -NoProfile -Command "Get-NetAdapter | Where-Object Status -eq 'Up' | Format-Table -Auto Name,InterfaceDescription,LinkSpeed"
echo [ARES] Relatorio salvo em: %REPORT%
pause
goto MENU
:END
endlocal
