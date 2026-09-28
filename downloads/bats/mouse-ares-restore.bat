@echo off
setlocal EnableExtensions
chcp 65001 >nul
mode con cols=82 lines=24 >nul 2>&1
color 0A
title AresZ ^| ARES Mouse Restore
set "ROOT=%LOCALAPPDATA%\AresZ\ARES"
set "BACKUP=%ROOT%\mouse-backup.reg"
:MENU
cls
echo ================================================================================
echo   AresZ  //  ARES MOUSE RESTORE
echo   Recovery Tool - Input Profile
echo ================================================================================
echo.
echo [1] Restaurar backup ARES do mouse
echo [2] Mostrar caminho do backup
echo [0] Sair
echo.
set /p "OP=Opcao: "
if "%OP%"=="1" goto RESTORE
if "%OP%"=="2" echo %BACKUP% & pause & goto MENU
if "%OP%"=="0" goto END
goto MENU
:RESTORE
cls
echo ================================================================================
echo   AresZ  //  ARES MOUSE RESTORE
echo ================================================================================
echo.
if exist "%BACKUP%" (
  reg import "%BACKUP%" >nul 2>&1
  RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1
  echo [ARES] Backup do mouse restaurado com sucesso.
) else (
  echo [ARES] Backup nao encontrado em:
  echo %BACKUP%
  echo.
  echo Nenhuma alteracao foi aplicada.
)
echo.
pause
goto MENU
:END
endlocal
