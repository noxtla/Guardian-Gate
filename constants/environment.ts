// constants/environment.ts
import Constants from 'expo-constants';

// Define una interfaz para nuestras configuraciones extra.
// '?' indica que la propiedad puede ser opcional.
interface ExtraConfig {
  N8N_WEBHOOK_BASE_URL?: string;
}

// Accede a las configuraciones 'extra' de Constants.expoConfig.
// Esto es donde las variables de entorno pueden ser inyectadas para builds de producción
// a través de app.json o app.config.ts (usando Expo Application Services - EAS).
// El '|| {}' asegura que `extraConfig` siempre sea un objeto válido,
// previniendo errores si 'extra' es undefined en alguna circunstancia.
const extraConfig: ExtraConfig = (Constants.expoConfig?.extra as ExtraConfig) || {};

// Determina la API_BASE_URL siguiendo un orden de prioridad:
// 1. process.env.N8N_WEBHOOK_BASE_URL: Para desarrollo local (leído del archivo .env por Metro bundler).
// 2. extraConfig.N8N_WEBHOOK_BASE_URL: Para builds de producción (inyectado vía EAS).
// 3. Fallback seguro: Una URL por defecto en caso de que ninguna de las anteriores esté definida.
//    Es importante que esta URL sea funcional o que se genere una advertencia clara.
export const API_BASE_URL =
  process.env.N8N_WEBHOOK_BASE_URL ||
  extraConfig.N8N_WEBHOOK_BASE_URL ||
  'https://default.n8n.cloud/webhook-test/guardianGate'; // Fallback por seguridad

// Mensaje de advertencia si la URL no está configurada explícitamente.
// Esto es útil en desarrollo para asegurar que no se use un valor por defecto no deseado.
if (!API_BASE_URL || API_BASE_URL === 'https://default.n8n.cloud/webhook-test/guardianGate') {
  console.warn(
    'API_BASE_URL no está configurada explícitamente. Se está utilizando una URL por defecto. ' +
      'Asegúrate de que N8N_WEBHOOK_BASE_URL esté definida en tu archivo .env local o en app.json para builds de producción.'
  );
}

// Imprime la URL que se está utilizando. Útil para depuración.
console.log(`Usando API Base URL: ${API_BASE_URL}`);
