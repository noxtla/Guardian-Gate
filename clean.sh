#!/bin/bash
# --- clean.sh (para Managed Workflow) ---
set -e

echo "--- Iniciando proceso de limpieza profunda para Managed Workflow ---"

echo "--- Paso 1: Limpiando las cachés de Expo y Metro ---"
# Este comando limpia la caché de Metro Bundler.
npx expo start --clear || true # '--clear' es lo importante aquí
# Si 'expo start' inicia el servidor, ciérralo (Ctrl+C)
npx expo r -c || true # Limpia la caché de Expo CLI
echo "Cachés de Expo y Metro limpiadas."
echo ""

echo "--- Paso 2: Limpiando la caché global de Gradle (solo si quedaron residuos) ---"
# Útil si previamente estuviste en Bare Workflow.
echo "Eliminando ~/.gradle..."
rm -rf ~/.gradle || true
echo "Caché global de Gradle eliminada."
echo ""

echo "--- Paso 3: Limpiando directorios de Node ---"
echo "Eliminando node_modules y package-lock.json..."
rm -rf node_modules            # Elimina todas las dependencias de Node
rm -f package-lock.json        # Elimina el archivo de bloqueo de dependencias
echo "Directorios de Node y cachés locales eliminados."
echo ""

# No se eliminan carpetas 'android'/'ios' aquí porque para Managed Workflow, no existen de forma persistente.

echo "--- Proceso de limpieza profunda completado para Managed Workflow. ---"
echo ""