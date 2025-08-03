// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Versión a prueba de balas:
// Obtenemos el blockList, asegurándonos de que sea un array.
const blockList = config.resolver.blockList ? (Array.isArray(config.resolver.blockList) ? config.resolver.blockList : [config.resolver.blockList]) : [];

config.resolver.blockList = [
  ...blockList,
  /backend\/.*/, // Ignorar el directorio del backend
];

module.exports = config;