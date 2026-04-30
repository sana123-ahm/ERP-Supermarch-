@echo off
REM setup-database.bat - Script d'initialisation de la base de données (Windows)

echo.
echo ======================================================
echo Reseau ERP Supermarche - Configuration Base de Donnees
echo ======================================================
echo.

REM Verifier que MySQL est installe
mysql --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Erreur: MySQL n'est pas installe ou non accessible dans PATH
    echo Veuillez installer MySQL 8.0 ou supperieur
    echo.
    pause
    exit /b 1
)

echo OK: MySQL detecte
echo.

REM Demander les identifiants
setlocal enabledelayedexpansion
set /p DB_USER="Entrez votre username MySQL (defaut: root): "
if "!DB_USER!"=="" set DB_USER=root

set /p DB_PASSWORD="Entrez votre password MySQL: "

REM Creer la base de donnees
echo.
echo Cration de la base de donnees...
mysql -u %DB_USER% -p%DB_PASSWORD% -e "CREATE DATABASE IF NOT EXISTS erp_supermarche;"

if %ERRORLEVEL% neq 0 (
    echo Erreur lors de la creation de la base de donnees
    pause
    exit /b 1
)

echo OK: Base de donnees cree

REM Importer le schema
echo.
echo Import du schema SQL...
mysql -u %DB_USER% -p%DB_PASSWORD% erp_supermarche < src\main\resources\schema.sql

if %ERRORLEVEL% neq 0 (
    echo Erreur lors de l'import du schema
    pause
    exit /b 1
)

echo OK: Schema importe avec succes

REM Afficher la configuration
echo.
echo ======================================================
echo Configuration Completee!
echo ======================================================
echo.
echo Mise a jour application.properties:
echo spring.datasource.url=jdbc:mysql://localhost:3306/erp_supermarche
echo spring.datasource.username=%DB_USER%
echo spring.datasource.password=****
echo.
echo Utilisateurs de test:
echo   Admin      : admin@supermarche.com / admin123
echo   Manager    : manager@supermarche.com / manager123
echo   Caissier   : caissier@supermarche.com / caissier123
echo   Magasinier : magasinier@supermarche.com / magasinier123
echo   RH         : rh@supermarche.com / rh123
echo.
echo Pret a demarrer le backend!
echo   Executez: mvn spring-boot:run
echo.
pause
