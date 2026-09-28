@echo off
setlocal
color 0D
title ARES - Teclado Competitivo

echo ==============================================
echo          ARES TECLADO COMPETITIVO
echo ==============================================
echo.
echo Este script faz backup das configuracoes do teclado e aplica:
echo - menor atraso de repeticao do Windows
 echo - maior velocidade de repeticao do Windows
 echo.

reg export "HKCU\Control Panel\Keyboard" "%USERPROFILE%\Desktop\ARES_Keyboard_Backup.reg" /y >nul 2>&1

reg add "HKCU\Control Panel\Keyboard" /v KeyboardDelay /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Keyboard" /v KeyboardSpeed /t REG_SZ /d 31 /f >nul

RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1

echo.
echo [ARES] Aplicado com sucesso.
echo Backup salvo em: %USERPROFILE%\Desktop\ARES_Keyboard_Backup.reg
echo.
echo Isso altera repeticao/delay do Windows. Nao aumenta polling rate
 echo fisico do teclado nem cria macros.
echo Se nao notar mudanca imediatamente, saia e entre novamente no Windows.
pause
endlocal
