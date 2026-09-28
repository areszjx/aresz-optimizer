@echo off
setlocal
color 0D
title ARES - Mouse / Sensibilidade Competitiva

echo ==============================================
echo       ARES MOUSE / SENS COMPETITIVA
echo ==============================================
echo.
echo Este script faz backup das configuracoes atuais do mouse e:
echo - desativa aceleracao do ponteiro do Windows
 echo - define velocidade do ponteiro em 10/20
 echo - mantem comportamento mais previsivel no desktop
 echo.

reg export "HKCU\Control Panel\Mouse" "%USERPROFILE%\Desktop\ARES_Mouse_Backup.reg" /y >nul 2>&1

reg add "HKCU\Control Panel\Mouse" /v MouseSpeed /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold1 /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseThreshold2 /t REG_SZ /d 0 /f >nul
reg add "HKCU\Control Panel\Mouse" /v MouseSensitivity /t REG_SZ /d 10 /f >nul

RUNDLL32.EXE USER32.DLL,UpdatePerUserSystemParameters >nul 2>&1

echo.
echo [ARES] Aplicado com sucesso.
echo Backup salvo em: %USERPROFILE%\Desktop\ARES_Mouse_Backup.reg
echo.
echo Em jogos com RAW INPUT, essas opcoes podem nao alterar a sensibilidade
 echo interna do jogo. O objetivo e deixar o Windows previsivel.
echo Se nao notar mudanca imediatamente, saia e entre novamente no Windows.
pause
endlocal
