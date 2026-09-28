@echo off
setlocal
color 0A
title ARES - Restaurar Mouse

set "BK=%USERPROFILE%\Desktop\ARES_Mouse_Backup.reg"

echo ==============================================
echo            ARES RESTORE MOUSE
echo ==============================================
echo.

if exist "%BK%" (
  echo [ARES] Restaurando backup encontrado...
  reg import "%BK%" >nul 2>&1
) else (
  echo [ARES] Backup nao encontrado. Aplicando valores comuns do Windows...
  reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_SZ /d 1 /f >nul
  reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_SZ /d 6 /f >nul
  reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_SZ /d 10 /f >nul
  reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_SZ /d 10 /f >nul
)

RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1

echo.
echo [ARES] Restauracao concluida.
echo Se necessario, saia e entre novamente no Windows.
pause
endlocal
