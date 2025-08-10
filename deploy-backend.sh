#!/bin/bash

# deploy-backend.sh
# Script para desplegar la Google Cloud Function del backend.
# Se debe ejecutar desde la raíz del proyecto.

echo "🚀 Iniciando despliegue del backend..."

# 1. Navegar al directorio del backend
echo "➡️  Cambiando al directorio 'backend'..."
cd backend

# 2. Ejecutar el comando de despliegue de gcloud
echo "☁️  Desplegando la función 'auth-handler' en Google Cloud..."
gcloud functions deploy auth-handler \
--gen2 \
--runtime nodejs20 \
--region us-central1 \
--source . \
--entry-point auth-handler \
--trigger-http \
--allow-unauthenticated \
--project gateway-r9gl0

# 3. Regresar al directorio original (opcional, pero buena práctica)
echo "⬅️  Regresando al directorio raíz del proyecto..."
cd ..

echo "✅ Despliegue finalizado."