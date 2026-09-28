@echo off
setlocal
color 0D
title ARES - Internet / Latency Baseline

net session >nul 2>&1
if %errorlevel% neq 0 (
  echo [ARES] Execute este BAT como Administrador.
  pause
  exit /b 1
)

echo ==============================================
echo       ARES INTERNET / LATENCY BASELINE
echo ==============================================
echo.
echo Este script aplica ajustes TCP conservadores e limpa o cache DNS.
echo Ele NAO desativa firewall, antivirus ou servicos do Windows.
echo.

netsh int tcp show global > "%USERPROFILE%\Desktop\ARES_Network_Before.txt"

echo [1/4] Limpando cache DNS...
ipconfig /flushdns >nul 2>&1

echo [2/4] Garantindo RSS ativado...
netsh int tcp set global rss=enabled >nul 2>&1

echo [3/4] Restaurando TCP Auto-Tuning para NORMAL...
netsh int tcp set global autotuninglevel=normal >nul 2>&1

echo [4/4] Desativando ECN para compatibilidade ampla...
netsh int tcp set global ecncapability=disabled >nul 2>&1

echo.
echo [ARES] Concluido.
echo Um snapshot das configuracoes anteriores foi salvo em:
echo %USERPROFILE%\Desktop\ARES_Network_Before.txt
echo.
echo Observacao: este BAT nao garante reducao de ping; ele apenas remove
 echo configuracoes TCP fora do padrao que podem causar inconsistencias.
pause
endlocal
