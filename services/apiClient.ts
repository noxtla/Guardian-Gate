// services/apiClient.ts
import { API_BASE_URL } from '@/constants/environment';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  token?: string;
}

export const apiClient = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
  const { method = 'POST', body, token } = options || {};

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // --- LOGGING DE LA PETICIÓN ---
  console.log(`[API Client] -> Making ${method} request to ${API_BASE_URL}${endpoint}`);
  if (body) {
    console.log('[API Client] -> Body:', JSON.stringify(body, null, 2));
  }
  // --- FIN LOGGING ---

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // --- LOGGING DE LA RESPUESTA ---
    // Clonamos la respuesta para poder leerla como texto sin consumirla
    const responseClone = response.clone();
    const rawTextResponse = await responseClone.text();
    console.log(`[API Client] <- Received response with status: ${response.status}`);
    console.log('[API Client] <- Raw text response:', rawTextResponse);
    // --- FIN LOGGING ---

    if (!response.ok) {
      // Intentamos parsear como JSON, si falla, usamos el texto crudo.
      try {
        const errorData = JSON.parse(rawTextResponse);
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      } catch (e) {
        throw new Error(rawTextResponse || `Request failed with status ${response.status}`);
      }
    }

    // Ahora usamos la respuesta original para el parseo final.
    return response.json() as Promise<T>;

  } catch (error: any) {
    console.error('[API Client] Catched Error:', error.message);
    throw new Error(error.message || 'An unknown network error occurred.');
  }
};