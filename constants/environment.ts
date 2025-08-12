// constants/environment.ts

// ÚNICA FUENTE DE VERDAD PARA LAS URLS DEL BACKEND

export const API_ENDPOINTS = {
    // El endpoint para todas las acciones de autenticación y gestión de usuarios
    AUTH: 'https://auth-handler-qlpw77skya-uc.a.run.app',
    
     // URL actualizada con el despliegue exitoso
    ATTENDANCE: 'https://attendance-handler-qlpw77skya-uc.a.run.app', 
  };
  
  // Mensaje de consola para confirmar que la app está usando los endpoints correctos
  console.log(`[INFO] Usando API Endpoints:`, API_ENDPOINTS);
  
  // IMPORTANTE: Después de desplegar tu nueva función 'attendance-handler',
  // copia su URL de trigger desde la consola de Google Cloud y pégala arriba
  // reemplazando 'https://attendance-handler-xxxxxxxx-uc.a.run.app'.