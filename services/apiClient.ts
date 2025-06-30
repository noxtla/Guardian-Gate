// services/apiClient.ts
// Ya no importamos 'react-native-keychain'
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
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json', // Cabecera por defecto para JSON
    ...(customHeaders as Record<string, string>), // Fusiona las cabeceras personalizadas
  };

  // --- LÓGICA DE AUTENTICACIÓN JWT ---
  // En Managed Workflow, si necesitas enviar un JWT (ej. Firebase ID Token) a tu backend,
  // lo obtendrías de `firebase/auth` y lo pasarías en `customHeaders`.
  // `react-native-keychain` NO se usa aquí.
  // Ejemplo (si `authenticated` fuera true y tuvieras un token):
  // if (authenticated && customHeaders['Authorization']) { // Asume que el token ya viene en customHeaders
  //   // No hacemos nada, el token ya está adjunto.
  // } else if (authenticated) {
  //   // Si necesitas un token de Firebase aquí, lo obtendrías del usuario actual.
  //   // const user = auth.currentUser;
  //   // if (user) {
  //   //   const idToken = await user.getIdToken();
  //   //   requestHeaders['Authorization'] = `Bearer ${idToken}`;
  //   // } else {
  //   //   console.warn('Advertencia: Petición autenticada solicitada pero usuario de Firebase no autenticado.');
  //   // }
  // }
  // --- FIN LÓGICA DE AUTENTICACIÓN ---

  // Construye la URL completa del endpoint.
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
      const errorMessage = errorData.message || `La petición falló con el estado ${response.status}`;
      throw new Error(errorMessage); // Lanza un error para ser capturado en la capa de servicio o UI.
    }

    // Si la respuesta es exitosa, parsear y devolver el cuerpo JSON.
    return response.json();
  } catch (networkError: any) {
    // Captura errores de red (ej. sin conexión a internet) o errores lanzados desde el bloque 'try'.
    console.error(`Error de red o llamada a la API a ${url}:`, networkError);
    // Relanza un error con un mensaje más informativo.
    throw new Error(networkError.message || 'La petición de red falló. Por favor, verifica tu conexión a internet.');
  }
};