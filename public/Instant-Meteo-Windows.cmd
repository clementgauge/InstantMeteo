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

set "APP_URL=https://instantmeteo.instantmeteofr.workers.dev"
set "ICON_URL=%APP_URL%/Instant-Meteo.ico"
set "APP_DIR=%LOCALAPPDATA%\InstantMeteo"
set "ICON_FILE=%APP_DIR%\Instant-Meteo.ico"

:: 1. Création du répertoire local de stockage de l'icône
if not exist "%APP_DIR%" mkdir "%APP_DIR%" >nul 2>&1

:: 2. Téléchargement du logo officiel nuage haute résolution (.ico)
echo [1/3] Telechargement du logo officiel nuage haute definition (.ico)...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $wc = New-Object Net.WebClient; try { $wc.DownloadFile('%ICON_URL%', '%ICON_FILE%') } catch { try { $wc.DownloadFile('%APP_URL%/favicon.ico', '%ICON_FILE%') } catch {} }" >nul 2>&1

if exist "%ICON_FILE%" (
    echo  [OK] Logo nuage enregistre dans : %ICON_FILE%
) else (
    echo  [Info] Utilisation de l'icone systeme standard.
)

:: 3. Création du raccourci directement sur le Bureau (compatible Desktop, Bureau francais, OneDrive)
echo.
echo [2/3] Creation automatique du raccourci avec icone sur votre Bureau Windows...
powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktops = @([Environment]::GetFolderPath('Desktop'), \"$env:USERPROFILE\Desktop\", \"$env:USERPROFILE\Bureau\", \"$env:OneDrive\Desktop\", \"$env:OneDrive\Bureau\", \"$env:USERPROFILE\OneDrive\Bureau\", \"$env:USERPROFILE\OneDrive\Desktop\") | Where-Object { $_ -and (Test-Path $_) } | Select-Object -Unique; $ff = @(\"${env:ProgramFiles}\Mozilla Firefox\firefox.exe\", \"${env:ProgramFiles(x86)}\Mozilla Firefox\firefox.exe\", \"$env:LOCALAPPDATA\Mozilla Firefox\firefox.exe\") | Where-Object { Test-Path $_ } | Select-Object -First 1; foreach ($desk in $desktops) { $lnk = Join-Path $desk 'Instant Meteo.lnk'; $s = $ws.CreateShortcut($lnk); if (Get-Command msedge.exe -ErrorAction SilentlyContinue) { $s.TargetPath = 'msedge.exe'; $s.Arguments = '--app=%APP_URL% --window-size=1280,840' } elseif (Get-Command chrome.exe -ErrorAction SilentlyContinue) { $s.TargetPath = 'chrome.exe'; $s.Arguments = '--app=%APP_URL% --window-size=1280,840' } elseif ($ff) { $s.TargetPath = $ff; $s.Arguments = '-new-window \"%APP_URL%\"' } else { $s.TargetPath = '%APP_URL%' }; $s.Description = 'Instant Meteo - Previsions, Radars & Alertes Haute Precision'; if (Test-Path '%ICON_FILE%') { $s.IconLocation = '%ICON_FILE%,0' }; $s.Save() }" >nul 2>&1

echo  [OK] Raccourci 'Instant Meteo' cree sur votre Bureau avec l'icone nuage !
echo.

:: 4. Lancement immédiat de l'application
echo [3/3] Lancement de l'application Instant Meteo...

:: Essai lancement en mode application fenêtrée si disponible, ou Firefox
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
echo ===============================================================================
echo  Succes ! L'icone nuage d'Instant Meteo est sur votre Bureau.
echo  Vous pouvez fermer cette fenetre.
echo ===============================================================================
timeout /t 4 >nul
exit
