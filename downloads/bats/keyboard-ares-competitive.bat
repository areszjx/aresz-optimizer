@echo off
setlocal EnableExtensions EnableDelayedExpansion
chcp 65001 >nul
mode con cols=88 lines=32 >nul 2>&1
color 0D
title AresZ ^| ARES Keyboard Optimizer
set "ROOT=%LOCALAPPDATA%\AresZ\ARES"
set "BACKUP=%ROOT%\keyboard-backup.reg"
if not exist "%ROOT%" mkdir "%ROOT%" >nul 2>&1
:MENU
cls
call :HEADER
echo [1] Aplicar perfil competitivo
echo [2] Aplicar perfil balanceado
echo [3] Mostrar configuracoes atuais
echo [4] Restaurar backup original
echo [5] Abrir pasta ARES
echo [0] Sair
echo.
set /p "OP=Selecione uma opcao: "
if "%OP%"=="1" goto COMP
if "%OP%"=="2" goto BAL
if "%OP%"=="3" goto SHOW
if "%OP%"=="4" goto RESTORE
if "%OP%"=="5" start "" "%ROOT%" & goto MENU
if "%OP%"=="0" goto END
goto MENU
:HEADER
echo ================================================================================
echo   AresZ  //  ARES KEYBOARD OPTIMIZER
echo   PROFILE: Repeat Rate + Delay Manager
 echo ================================================================================
echo.
exit /b
:BACKUP
if not exist "%BACKUP%" reg export "HKCU\Control Panel\Keyboard" "%BACKUP%" /y >nul 2>&1
exit /b
:COMP
cls
call :HEADER
call :BACKUP
reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_SZ /d 31 /f >nul
RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1
echo [ARES] Perfil competitivo aplicado.
echo  - KeyboardDelay: 0
 echo  - KeyboardSpeed: 31
echo  - Backup original preservado em %BACKUP%
echo.
echo Isso ajusta repeticao do Windows; nao altera polling rate fisico e nao cria macros.
pause
goto MENU
:BAL
cls
call :HEADER
call :BACKUP
reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_SZ /d 1 /f >nul
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_SZ /d 31 /f >nul
RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1
echo [ARES] Perfil balanceado aplicado.
pause
goto MENU
:SHOW
cls
call :HEADER
reg query "HKCU\Control Panel\Keyboard" /v KeyboardDelay 2>nul
reg query "HKCU\Control Panel\Keyboard" /v KeyboardSpeed 2>nul
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
