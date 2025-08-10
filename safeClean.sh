#!/bin/bash

echo "🔍 Verificando si estás en el directorio de un proyecto Node.js..."

if [ ! -f "package.json" ]; then
  echo "🚫 No se encontró package.json en este directorio. Salida por seguridad."
  exit 1
fi

# Directorio para respaldar los archivos y carpetas antes de eliminarlos.
# Se añade fecha y hora para evitar sobreescribir respaldos previos.
BACKUP_DIR="./to_delete_backup_$(date +%Y%m%d_%H%M%S)"

echo "🗂️  Creando carpeta de respaldo: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# Función para mover un archivo o directorio si existe, de forma segura.
move_if_exists() {
  local item="$1"
  if [ -e "$item" ]; then
    echo "📦 Moviendo $item a $BACKUP_DIR/"
    mv "$item" "$BACKUP_DIR/"
  else
    echo "ℹ️   $item no existe, se omite."
  fi
}

# --- Lista de elementos a mover para una reconstrucción limpia ---
move_if_exists android
move_if_exists ios
move_if_exists .expo

# También es buena idea mover los lockfiles para una reinstalación limpia
move_if_exists package-lock.json
move_if_exists yarn.lock

echo ""
echo "✅ Limpieza segura completada."
echo "   Los archivos y carpetas antiguos están en: $BACKUP_DIR"
echo "   Puedes borrar esa carpeta manualmente más tarde si todo funciona correctamente."
echo ""
echo "👉 Siguiente paso sugerido: npx expo prebuild --platform android"

