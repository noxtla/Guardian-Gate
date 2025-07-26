#!/bin/bash

echo "🔍 Verificando si estás en el directorio de un proyecto Node.js..."

if [ ! -f "package.json" ]; then
  echo "🚫 No se encontró package.json en este directorio. Salida por seguridad."
  exit 1
fi

BACKUP_DIR="./to_delete_backup"

echo "🗂️ Creando carpeta de respaldo: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

move_if_exists() {
  local item="$1"
  if [ -e "$item" ]; then
    echo "📦 Moviendo $item a $BACKUP_DIR/"
    mv "$item" "$BACKUP_DIR/"
  else
    echo "ℹ️  $item no existe, se omite."
  fi
}

move_if_exists node_modules
move_if_exists .expo
move_if_exists package-lock.json
move_if_exists yarn.lock

echo "✅ Limpieza segura completada. Puedes borrar la carpeta '$BACKUP_DIR' manualmente si todo está bien."