// services/apiClient.ts
import { API_ENDPOINTS } from '@/constants/environment'; // ¡CUIDADO! Un error común es importar la URL base, no los endpoints.

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  token?: string;
}

// El endpoint ahora será una clave del objeto API_ENDPOINTS
export const apiClient = async <T>(
  endpointKey: keyof typeof API_ENDPOINTS, 
  options?: ApiClientOptions
): Promise<T> => {
  const { method = 'POST', body, token } = options || {};

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Obtenemos la URL completa desde nuestra fuente de verdad
  const url = API_ENDPOINTS[endpointKey];

  // --- INICIO: LOGGING DE LA PETICIÓN (Nuestro "Debug Patch") ---
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
      body: body ? JSON.stringify(body) : undefined,
    });

    // --- INICIO: LOGGING DE LA RESPUESTA ---
    const responseClone = response.clone();
    const rawTextResponse = await responseClone.text();
    console.log(`[API Client] ⬅️  Received response with status: ${response.status} from [${endpointKey}]`);
    
    // Logueamos la respuesta cruda para ver exactamente qué nos manda el servidor
    // Esto es crucial para errores 5xx, 4xx, o respuestas que no son JSON.
    console.log('[API Client] ⬅️  Raw text response:', rawTextResponse);
    // --- FIN LOGGING ---

    if (!response.ok) {
      // Intentamos parsear como JSON por si el servidor envía un error estructurado.
      try {
        const errorData = JSON.parse(rawTextResponse);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (e) {
        // Si no es JSON, lanzamos el texto crudo.
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