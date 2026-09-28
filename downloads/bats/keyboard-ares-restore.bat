@echo off
setlocal
color 0A
title ARES - Restaurar Teclado

set "BK=%USERPROFILE%\Desktop\ARES_Keyboard_Backup.reg"

echo ==============================================
echo          ARES RESTORE TECLADO
echo ==============================================
echo.

if exist "%BK%" (
  echo [ARES] Restaurando backup encontrado...
  reg import "%BK%" >nul 2>&1
) else (
  echo [ARES] Backup nao encontrado. Aplicando valores comuns do Windows...
  reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_SZ /d 1 /f >nul
  reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_SZ /d 31 /f >nul
)

RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1

echo.
echo [ARES] Restauracao concluida.
echo Se necessario, saia e entre novamente no Windows.
pause
endlocal
