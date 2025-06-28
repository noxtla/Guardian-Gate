// services/apiClient.ts
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL } from '@/constants/environment'; // Importa nuestra URL base

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object;
  authenticated?: boolean; // Indica si la petición DEBERÍA ser autenticada (usando JWT)
  headers?: HeadersInit;   // Permite añadir cabeceras personalizadas
}

/**
 * Función cliente de API centralizada para realizar peticiones HTTP.
 * Encapsula la construcción de URLs, la configuración de cabeceras, la adición de JWTs (si aplica),
 * y un manejo básico de errores.
 *
 * @template T El tipo esperado de la respuesta JSON del servidor.
 * @param endpoint El path específico del recurso API (ej. '/send-otp', que ahora será una cadena vacía si la base URL ya es el webhook completo).
 * @param options Opciones de la petición: método, cuerpo, si requiere autenticación, cabeceras adicionales.
 * @returns Una promesa que resuelve con los datos JSON de la respuesta.
 * @throws Error si la petición falla (red, HTTP).
 */
export const apiClient = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
  const {
    method = 'POST', // Método HTTP por defecto
    body,
    authenticated = false, // Por defecto, la petición no requiere autenticación
    headers: customHeaders = {}, // Cabeceras personalizadas proporcionadas
  } = options || {}; // Si no se proporcionan opciones, usa un objeto vacío

  // Inicializa las cabeceras de la petición.
  // Se tipa como Record<string, string> para permitir la adición de propiedades por índice.
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json', // Cabecera por defecto para JSON
    ...(customHeaders as Record<string, string>), // Fusiona las cabeceras personalizadas
  };

  // --- LÓGICA DE AUTENTICACIÓN JWT (temporalmente menos estricta) ---
  if (authenticated) {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        // Si se encuentra el token, se añade la cabecera de Autorización.
        requestHeaders['Authorization'] = `Bearer ${credentials.password}`;
      } else {
        // Advertencia si la petición requiere autenticación pero no se encuentra el token.
        // La petición continuará sin el token.
        console.warn('Advertencia: Petición autenticada solicitada pero no se encontró token en Keychain.');
      }
    } catch (keychainError) {
      // Log de error si falla la recuperación del token de Keychain.
      // La petición continuará sin el token.
      console.error('Error al recuperar el token de Keychain (ignorado por ahora):', keychainError);
    }
  }
  // --- FIN LÓGICA DE AUTENTICACIÓN ---

  // Construye la URL completa del endpoint.
  // API_BASE_URL ya debe contener la URL completa del webhook de n8n (ej. ".../guardianGate").
  // Si 'endpoint' es una cadena vacía (''), la URL será simplemente API_BASE_URL.
  const url = `${API_BASE_URL}${endpoint}`;

  // Configura las opciones para la función fetch.
  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined, // Convierte el cuerpo a JSON string si existe
  };

  try {
    // Realiza la llamada HTTP.
    const response = await fetch(url, fetchOptions);

    // Manejo de respuestas no exitosas (códigos de estado HTTP que no son 2xx).
    if (!response.ok) {
      let errorData: any = {};
      try {
        // Intenta parsear el cuerpo de la respuesta como JSON para obtener mensajes de error detallados.
        errorData = await response.json();
      } catch (parseError) {
        // Si el cuerpo no es JSON, usa un mensaje de error HTTP genérico.
        errorData = { message: `Error HTTP! Estado: ${response.status}` };
      }
      // Construye un mensaje de error combinando el del servidor o uno genérico.
      const errorMessage = errorData.message || `La petición falló con el estado ${response.status}`;
      throw new Error(errorMessage); // Lanza un error para ser capturado en la capa de servicio o UI.
    }

    // Si la respuesta es exitosa, parsea y devuelve el cuerpo JSON.
    return response.json();
  } catch (networkError: any) {
    // Captura errores de red (ej. sin conexión a internet) o errores lanzados desde el bloque 'try'.
    console.error(`Error de red o llamada a la API a ${url}:`, networkError);
    // Relanza un error con un mensaje más informativo.
    throw new Error(networkError.message || 'La petición de red falló. Por favor, verifica tu conexión a internet.');
  }
};