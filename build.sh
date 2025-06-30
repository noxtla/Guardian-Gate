#!/bin/bash
# --- build.sh (para Managed Workflow) ---
# Instala las dependencias y luego inicia el servidor de desarrollo Expo Go.
set -e

echo "--- Iniciando proceso de build para Managed Workflow ---"
echo ""

echo "--- Paso 1: Reinstalando dependencias de Node.js ---"
# Se asume que node_modules y package-lock.json ya fueron eliminados por clean.sh
echo "Ejecutando npm install..."
npm install
echo "Dependencias de Node.js instaladas."
echo ""

# NO hay Paso 2 para "npx expo prebuild --clean" porque estamos en Managed Workflow.
# npx expo prebuild --clean # <--- ASEGÚRATE DE QUE ESTA LÍNEA NO ESTÉ AQUÍ

echo "--- Paso 2: Iniciando el servidor de desarrollo para Expo Go ---" # Renumerado
echo "Ejecutando npx expo start..."
npx expo start # <--- COMANDO CLAVE para Expo Go

echo ""
echo "--- ¡Proceso de build completado! ---"
echo "Escanea el QR con la app Expo Go en tu dispositivo."
echo ""