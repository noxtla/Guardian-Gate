// services/apiClient.ts
import { API_BASE_URL } from '@/constants/environment';

// Opciones para configurar nuestra llamada a la API
interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object; // El cuerpo de la petición, que se convertirá a JSON
}

/**
 * Cliente de API centralizado para realizar peticiones a nuestro backend.
 * Encapsula la URL base, las cabeceras y el manejo de errores.
 *
 * @template T El tipo de datos esperado en la respuesta JSON.
 * @param endpoint El path específico (en nuestro caso, será una cadena vacía '' ya que la GCF no tiene sub-rutas).
 * @param options Opciones de la petición como el método y el cuerpo.
 * @returns Una promesa que resuelve con los datos de la respuesta.
 */
export const apiClient = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
  const { method = 'POST', body } = options || {};

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // En el futuro, aquí añadiremos la API Key para la seguridad de la GCF
    // 'x-api-key': 'NUESTRA_API_KEY_DE_GCP',
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    // Si la respuesta del servidor no es exitosa (ej. error 500)
    if (!response.ok) {
      // Intentamos leer el error que nos envía el backend para dar un mejor mensaje
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    // Si todo fue bien, devolvemos los datos JSON
    return response.json() as Promise<T>;

  } catch (error: any) {
    console.error('API Client Error:', error);
    // Re-lanzamos el error para que la pantalla que llamó pueda manejarlo (ej. mostrar un Alert)
    throw new Error(error.message || 'An unknown network error occurred.');
  }
};