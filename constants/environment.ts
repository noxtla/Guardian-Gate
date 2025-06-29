// constants/environment.ts
import Constants from 'expo-constants';

// --- INICIO: SOLUCIÓN TEMPORAL DE HARDCODEO PARA DESARROLLO ---
// ESTO DEBE SER ELIMINADO Y REEMPLAZADO POR LA LÓGICA DE .ENV/EAS ANTES DE PRODUCCIÓN.
export const API_BASE_URL = 'https://noxtla.app.n8n.cloud/webhook-test/guardianGate';
// --- FIN: SOLUCIÓN TEMPORAL DE HARDCODEO PARA DESARROLLO ---


// --- El resto del código ahora está inactivo para API_BASE_URL, pero lo mantendremos comentado ---
// interface ExtraConfig {
//   N8N_BASE_WEBHOOK_URL_TEST?: string;
//   N8N_BASE_WEBHOOK_URL_PROD?: string;
//   N8N_GUARDIAN_GATE_WEBHOOK_NAME?: string;
// }

// const extraConfig: ExtraConfig = (Constants.expoConfig?.extra as ExtraConfig) || {};

// const n8nBaseUrl =
//   process.env.N8N_BASE_WEBHOOK_URL_TEST ||
//   extraConfig.N8N_BASE_WEBHOOK_URL_PROD ||
//   'https://default.n8n.cloud/webhook-test/';

// const n8nWebhookName =
//   process.env.N8N_GUARDIAN_GATE_WEBHOOK_NAME ||
//   extraConfig.N8N_GUARDIAN_GATE_WEBHOOK_NAME ||
//   'defaultWebhookName';

// Comenta o elimina la línea original de exportación de API_BASE_URL
// export const API_BASE_URL = `${n8nBaseUrl.replace(/\/+$/, '')}/${n8nWebhookName}`;


// Mantén este console.log para verificar que la URL hardcodeada está siendo utilizada.
console.log(`Usando API Base URL: ${API_BASE_URL}`);

// El warning también se puede comentar temporalmente, ya no es relevante con el hardcodeo.
/*
if (!API_BASE_URL || n8nBaseUrl === 'https://default.n8n.cloud/webhook-test/' || n8nWebhookName === 'defaultWebhookName') {
  console.warn(
    'API_BASE_URL no está configurada explícitamente. Se está utilizando una URL por defecto. ' +
      'Asegúrate de que N8N_BASE_WEBHOOK_URL_TEST y N8N_GUARDIAN_GATE_WEBHOOK_NAME estén definidos en tu archivo .env local o en app.json para builds de producción.'
  );
}
*/