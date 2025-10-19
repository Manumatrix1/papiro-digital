#!/bin/bash
# Script para configurar CORS automáticamente en Firebase Storage
# Ejecutar desde la terminal si tienes Google Cloud SDK instalado

echo "🔧 Configurando CORS para Papiro Digital..."

# Verificar si gsutil está disponible
if ! command -v gsutil &> /dev/null; then
    echo "❌ Google Cloud SDK no está instalado."
    echo "📥 Descarga e instala desde: https://cloud.google.com/sdk/docs/install"
    echo "🔑 Luego ejecuta: gcloud auth login"
    echo "📁 Y después: gcloud config set project papiro2025-d09e0"
    exit 1
fi

# Aplicar configuración CORS
echo "⚙️ Aplicando configuración CORS..."
gsutil cors set firebase-storage-cors.json gs://papiro2025-d09e0.firebasestorage.app

if [ $? -eq 0 ]; then
    echo "✅ CORS configurado correctamente!"
    echo "🔄 Recarga tu aplicación y prueba cargar un PDF"
else
    echo "❌ Error al configurar CORS. Verifica:"
    echo "   1. Que estés logueado: gcloud auth login"
    echo "   2. Que tengas permisos en el proyecto"
    echo "   3. Que el bucket existe: gs://papiro2025-d09e0.firebasestorage.app"
fi