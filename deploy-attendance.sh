#!/bin/bash

# deploy-attendance.sh
# Script para desplegar la Google Cloud Function de Asistencia.
# Se debe ejecutar desde la raíz del proyecto.

echo "🚀 Iniciando despliegue del handler de Asistencia..."

# 1. Navegar al directorio del backend
echo "➡️  Cambiando al directorio 'backend'..."
cd backend

# 2. Ejecutar el comando de despliegue de gcloud
echo "☁️  Desplegando la función 'attendance-handler' en Google Cloud..."
gcloud functions deploy attendance-handler \
--gen2 \
--runtime nodejs20 \
--region us-central1 \
--source . \
--entry-point attendance-handler \
--trigger-http \
--allow-unauthenticated \
--project gateway-r9gl0

# 3. Regresar al directorio original (opcional, pero buena práctica)
echo "⬅️  Regresando al directorio raíz del proyecto..."
cd ..

echo "✅ Despliegue de 'attendance-handler' finalizado."