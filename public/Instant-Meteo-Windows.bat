@echo off
chcp 65001 >nul
title Instant Météo - Installation Bureau Windows (Firefox, Edge, Chrome)
color 0B

echo ===============================================================================
echo                INSTANT METEO - APPLICATION BUREAU WINDOWS
echo                Support Universel : Firefox, Edge, Chrome & Navigateur par defaut
echo ===============================================================================
echo.
echo Configuration du raccourci Bureau avec le logo officiel nuage...
echo.

set "APP_URL=https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app"
set "ICON_URL=%APP_URL%/Instant-Meteo.ico"
set "APP_DIR=%LOCALAPPDATA%\InstantMeteo"
set "ICON_FILE=%APP_DIR%\Instant-Meteo.ico"

:: 1. Création du répertoire local
if not exist "%APP_DIR%" mkdir "%APP_DIR%" >nul 2>&1

:: 2. Téléchargement du logo officiel nuage haute résolution (.ico)
echo [1/3] Telechargement du logo officiel nuage (.ico)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%ICON_URL%', '%ICON_FILE%')" >nul 2>&1

:: 3. Création du raccourci Bureau Windows
echo [2/3] Creation du raccourci sur votre Bureau Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut((Join-Path $desktop 'Instant Meteo.lnk')); $ff = @(\"${env:ProgramFiles}\Mozilla Firefox\firefox.exe\", \"${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe\", \"$env:LOCALAPPDATA\Mozilla Firefox\firefox.exe\") | Where-Object { Test-Path $_ } | Select-Object -First 1; if (Get-Command msedge.exe -ErrorAction SilentlyContinue) { $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=%APP_URL% --window-size=1280,840' } elseif (Get-Command chrome.exe -ErrorAction SilentlyContinue) { $s.TargetPath = 'chrome.exe'; $s.Arguments = '--app=%APP_URL% --window-size=1280,840' } elseif ($ff) { $s.TargetPath = $ff; $s.Arguments = '-new-window \"%APP_URL%\"' } else { $s.TargetPath = '%APP_URL%' }; $s.Description = 'Instant Meteo - Previsions, Radars & Alertes Haute Precision'; if (Test-Path '%ICON_FILE%') { $s.IconLocation = '%ICON_FILE%,0' }; $s.Save()" >nul 2>&1

echo  [OK] Raccourci 'Instant Meteo' cree sur votre Bureau avec l'icone nuage !
echo.

:: 4. Lancement
echo [3/3] Lancement de l'application...
start "" msedge.exe --app="%APP_URL%" --window-size=1280,840 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    start "" chrome.exe --app="%APP_URL%" --window-size=1280,840 >nul 2>&1
)
if %ERRORLEVEL% NEQ 0 (
    start "" firefox.exe -new-window "%APP_URL%" >nul 2>&1
)
if %ERRORLEVEL% NEQ 0 (
    start "" "%APP_URL%"
)

echo.
echo Termine avec succes !
timeout /t 4 >nul
exit
