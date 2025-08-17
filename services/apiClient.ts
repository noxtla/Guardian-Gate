// services/apiClient.ts
// VERSIÓN ACTUALIZADA PARA MANEJAR PETICIONES GET Y POST DE FORMA DINÁMICA

import { API_ENDPOINTS } from '@/constants/environment';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  token?: string;
}

export const apiClient = async <T>(
  endpointKey: keyof typeof API_ENDPOINTS, 
  options?: ApiClientOptions
): Promise<T> => {
  // 1. AJUSTE EN LA LÓGICA DEL MÉTODO
  // El método por defecto ahora es 'GET'. Si se proporciona un 'body' en las opciones,
  // se asume que la intención es hacer un 'POST', a menos que se especifique otro método.
  const { method = (options?.body ? 'POST' : 'GET'), body, token } = options || {};

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Obtenemos la URL completa desde nuestra fuente de verdad (sin cambios aquí)
  const url = API_ENDPOINTS[endpointKey];

  // --- LOGGING DE LA PETICIÓN (Nuestro "Debug Patch") ---
  console.log(`\n[API Client] ➡️  Making ${method} request to [${endpointKey}]`);
  console.log(`[API Client] ➡️  Full URL: ${url}`);
  if (body) {
    console.log('[API Client] ➡️  Body:', JSON.stringify(body, null, 2));
  }
  // --- FIN LOGGING ---

  try {
    const response = await fetch(url, {
      method,
      headers,
      // 2. EL CUERPO SOLO SE AÑADE SI EL MÉTODO NO ES 'GET' Y EL CUERPO EXISTE
      // Las peticiones GET no deben tener un cuerpo.
      body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
    });

    // --- LOGGING DE LA RESPUESTA (sin cambios) ---
    const responseClone = response.clone();
    const rawTextResponse = await responseClone.text();
    console.log(`[API Client] ⬅️  Received response with status: ${response.status} from [${endpointKey}]`);
    
    console.log('[API Client] ⬅️  Raw text response:', rawTextResponse);
    // --- FIN LOGGING ---

    if (!response.ok) {
      try {
        const errorData = JSON.parse(rawTextResponse);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (e) {
        throw new Error(rawTextResponse || `Request failed with status ${response.status}`);
      }
    }

    // Si la respuesta es OK, la parseamos como JSON.
    return response.json() as Promise<T>;

  } catch (error: any) {
    console.error(`[API Client] ❌ Catched Error on [${endpointKey}]:`, error.message);
    // Lanzamos el error para que la lógica de la UI pueda manejarlo.
    throw new Error(error.message || 'An unknown network error occurred.');
  }
};