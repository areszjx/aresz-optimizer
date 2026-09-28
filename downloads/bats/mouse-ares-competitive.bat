@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
mode con cols=88 lines=32 >nul 2>&1
color 0D
title AresZ ^| ARES Mouse and Sens Optimizer
set "ROOT=%LOCALAPPDATA%\AresZ\ARES"
set "BACKUP=%ROOT%\mouse-backup.reg"
if not exist "%ROOT%" mkdir "%ROOT%" >nul 2>&1
:MENU
cls
call :HEADER
echo [1] Aplicar perfil competitivo do Windows
echo [2] Calcular eDPI
echo [3] Mostrar configuracoes atuais do mouse
echo [4] Restaurar backup original
echo [5] Abrir pasta ARES
echo [0] Sair
echo.
set /p "OP=Selecione uma opcao: "
if "%OP%"=="1" goto APPLY
if "%OP%"=="2" goto EDPI
if "%OP%"=="3" goto SHOW
if "%OP%"=="4" goto RESTORE
if "%OP%"=="5" start "" "%ROOT%" & goto MENU
if "%OP%"=="0" goto END
goto MENU
:HEADER
echo ================================================================================
echo   AresZ  //  ARES MOUSE AND SENS OPTIMIZER
echo   PROFILE: Competitive Input Baseline
 echo ================================================================================
echo.
exit /b
:BACKUP
if not exist "%BACKUP%" reg export "HKCU\Control Panel\Mouse" "%BACKUP%" /y >nul 2>&1
exit /b
:APPLY
cls
call :HEADER
call :BACKUP
reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_SZ /d 10 /f >nul
RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1
echo [ARES] Perfil aplicado:
echo  - Aceleracao do ponteiro do Windows desativada
echo  - Velocidade base do ponteiro: 10/20
echo  - Backup original preservado em %BACKUP%
echo.
echo Jogos com Raw Input podem ignorar parte dessas configuracoes, o que e normal.
pause
goto MENU
:EDPI
cls
call :HEADER
set /p "DPI=Digite seu DPI: "
set /p "SENS=Digite a sensibilidade do jogo: "
powershell -NoProfile -Command "$dpi=[double]'%DPI%';$sens=[double]'%SENS%';Write-Host ('eDPI = ' + [math]::Round($dpi*$sens,2))"
echo.
echo Use o eDPI para comparar sensibilidades entre setups do mesmo jogo.
pause
goto MENU
:SHOW
cls
call :HEADER
for %%V in (MouseSpeed MouseThreshold1 MouseThreshold2 MouseSensitivity) do reg query "HKCU\Control Panel\Mouse" /v %%V 2>nul
echo.
pause
goto MENU
:RESTORE
cls
call :HEADER
if exist "%BACKUP%" (
  reg import "%BACKUP%" >nul 2>&1
  RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1
  echo [ARES] Backup original restaurado.
) else (
  echo [ARES] Nenhum backup ARES foi encontrado.
)
pause
goto MENU
:END
endlocal
