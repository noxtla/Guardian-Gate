#!/bin/bash

# --- clean_and_build.sh ---
# Realiza una limpieza profunda del proyecto de Android y luego inicia la compilación.
# Detiene la ejecución si cualquier comando falla (set -e).
set -e

echo "--- Paso 1: Limpieza de la caché de Gradle ---"
# Elimina la caché global de Gradle para asegurar una limpieza máxima.
echo "Eliminando ~/.gradle..."
rm -rf ~/.gradle
echo "Caché global de Gradle eliminada."
echo ""

echo "--- Paso 2: Limpieza del proyecto de Android ---"
# Entra en el directorio de Android.
cd android

# Ejecuta la tarea de limpieza de Gradle.
echo "Ejecutando ./gradlew clean..."
./gradlew clean

# Detiene cualquier proceso de Gradle en segundo plano.
echo "Ejecutando ./gradlew --stop..."
./gradlew --stop
echo "Proyecto de Android limpiado."
echo ""

echo "--- Paso 3: Volviendo al directorio raíz ---"
# Vuelve a la raíz del proyecto para ejecutar comandos de Expo.
cd ..
echo "Ubicación actual: \$(pwd)"
echo ""

echo "--- Paso 4: Reinstalando dependencias de Node (opcional pero recomendado) ---"
# Elimina la carpeta node_modules y la reinstala para evitar inconsistencias.
# echo "Eliminando node_modules y reinstalando dependencias con npm install..."
# rm -rf node_modules
# npm install
# echo "Dependencias reinstaladas."
# echo ""
# Nota: He comentado esta parte para que sea más rápido. Descoméntala si sigues teniendo problemas.

echo "--- Paso 5: Iniciando la compilación de la aplicación para Android ---"
npx expo run:android

echo ""
echo "--- ¡Proceso completado! ---"
