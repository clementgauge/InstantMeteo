@echo off
chcp 65001 >nul
title Instant Météo - Installation Bureau pour Mozilla Firefox
color 0E

echo ===============================================================================
echo             INSTANT METEO - INSTALLATEUR BUREAU MOZILLA FIREFOX
echo ===============================================================================
echo.
echo Configuration du raccourci Bureau Firefox avec le logo officiel nuage...
echo.

set "APP_URL=https://ais-pre-fzmulrc57tiqz44s4owlss-510191462762.europe-west2.run.app"
set "ICON_URL=%APP_URL%/Instant-Meteo.ico"
set "APP_DIR=%LOCALAPPDATA%\InstantMeteo"
set "ICON_FILE=%APP_DIR%\Instant-Meteo.ico"

:: 1. Création du répertoire local
if not exist "%APP_DIR%" mkdir "%APP_DIR%" >nul 2>&1

:: 2. Téléchargement du logo officiel nuage (.ico)
echo [1/3] Telechargement du logo officiel nuage (.ico)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object Net.WebClient).DownloadFile('%ICON_URL%', '%ICON_FILE%')" >nul 2>&1

:: 3. Création du raccourci Bureau dédié à Firefox avec l'icône nuage
echo [2/3] Creation du raccourci Firefox sur votre Bureau Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$desktop = [Environment]::GetFolderPath('Desktop'); $ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut((Join-Path $desktop 'Instant Meteo (Firefox).lnk')); $ff = @(\"${env:ProgramFiles}\Mozilla Firefox\firefox.exe\", \"${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe\", \"$env:LOCALAPPDATA\Mozilla Firefox\firefox.exe\") | Where-Object { Test-Path $_ } | Select-Object -First 1; if ($ff) { $s.TargetPath = $ff; $s.Arguments = '-new-window \"%APP_URL%\"' } else { $s.TargetPath = '%APP_URL%' }; $s.Description = 'Instant Meteo - Previsions, Radars & Alertes (Firefox)'; if (Test-Path '%ICON_FILE%') { $s.IconLocation = '%ICON_FILE%,0' }; $s.Save()" >nul 2>&1

echo  [OK] Raccourci Firefox 'Instant Meteo' cree sur votre Bureau avec le logo nuage !
echo.

:: 4. Lancement dans Firefox
echo [3/3] Ouverture d'Instant Meteo dans Mozilla Firefox...
start "" firefox.exe -new-window "%APP_URL%" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    start "" "%APP_URL%"
)

echo.
echo Termine ! Le raccourci avec le nuage est pret sur votre Bureau.
timeout /t 4 >nul
exit
