@echo off
REM ============================================================
REM  INOUS.AI - installation et lancement automatiques (Windows)
REM  Double-clique ce fichier, ou lance-le depuis un terminal :
REM     setup_windows.bat
REM ============================================================

cd /d "%~dp0"

echo.
echo [1/5] Verification de Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR : Python n'est pas installe ou pas dans le PATH.
    echo Installe-le depuis https://www.python.org/downloads/ puis relance ce script.
    pause
    exit /b 1
)

echo.
echo [2/5] Creation de l'environnement virtuel (venv)...
if not exist venv (
    python -m venv venv
) else (
    echo    -> venv existe deja, on le reutilise.
)

echo.
echo [3/5] Activation de venv et installation des dependances...
call venv\Scripts\activate.bat
pip install --upgrade pip >nul
pip install -r requirements.txt
if errorlevel 1 (
    echo ERREUR pendant l'installation des dependances. Verifie ta connexion internet.
    pause
    exit /b 1
)

echo.
echo [4/5] Verification du fichier .env...
if not exist .env (
    copy .env.example .env >nul
    echo    -> .env cree a partir de .env.example.
) else (
    echo    -> .env existe deja, on ne le touche pas.
)

findstr /C:"colle_ta_cle_ici" .env >nul
if not errorlevel 1 (
    echo.
    echo ============================================================
    echo  ATTENTION : ta cle API OpenAI n'est pas encore configuree.
    echo  Ouvre le fichier .env avec le Bloc-notes et remplace
    echo  "colle_ta_cle_ici" par ta vraie cle (elle commence par "sk-").
    echo ============================================================
    echo.
    notepad .env
)

echo.
echo [5/5] Lancement du serveur...
echo    -> Ouvre ensuite http://127.0.0.1:8000 dans ton navigateur.
echo    -> Pour arreter le serveur : Ctrl+C dans cette fenetre.
echo.
uvicorn main:app --reload

pause
