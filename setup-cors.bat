@echo off
REM Script de Windows para configurar CORS en Firebase Storage

echo 🔧 Configurando CORS para Papiro Digital...

REM Verificar si gsutil está disponible
gsutil version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Google Cloud SDK no está instalado.
    echo 📥 Descarga e instala desde: https://cloud.google.com/sdk/docs/install
    echo 🔑 Luego ejecuta: gcloud auth login
    echo 📁 Y después: gcloud config set project papiro2025-d09e0
    pause
    exit /b 1
)

REM Aplicar configuración CORS
echo ⚙️ Aplicando configuración CORS...
gsutil cors set firebase-storage-cors.json gs://papiro2025-d09e0.firebasestorage.app

if %errorlevel% equ 0 (
    echo ✅ CORS configurado correctamente!
    echo 🔄 Recarga tu aplicación y prueba cargar un PDF
) else (
    echo ❌ Error al configurar CORS. Verifica:
    echo    1. Que estés logueado: gcloud auth login
    echo    2. Que tengas permisos en el proyecto
    echo    3. Que el bucket existe
)

pause