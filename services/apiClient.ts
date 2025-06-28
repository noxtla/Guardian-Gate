// services/apiClient.ts
import * as Keychain from 'react-native-keychain';
import { API_BASE_URL } from '@/constants/environment';

interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: object;
  authenticated?: boolean;
  headers?: HeadersInit;
}

export const apiClient = async <T>(endpoint: string, options?: ApiClientOptions): Promise<T> => {
  const {
    method = 'POST',
    body,
    authenticated = false,
    headers: customHeaders = {},
  } = options || {};

  // --- CAMBIO CLAVE AQUÍ ---
  // Inicializamos requestHeaders como un objeto plano que luego podemos extender.
  // Esto permite que TypeScript sepa que podemos añadir propiedades con corchetes.
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    // Spread operator para fusionar customHeaders si es un objeto.
    // Si customHeaders fuera un Headers o Array<[string,string]>, necesitaríamos un manejo más complejo.
    // Pero para fines prácticos, asumimos que estamos fusionando objetos.
    ...(customHeaders as Record<string, string>),
  };

  if (authenticated) {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials && credentials.password) {
        // Ahora TypeScript sabe que requestHeaders es un Record<string, string>
        // y permite la asignación por índice.
        requestHeaders['Authorization'] = `Bearer ${credentials.password}`;
      } else {
        throw new Error('Authentication token not found. Please log in again.');
      }
    } catch (keychainError) {
      console.error('Error al recuperar el token de Keychain:', keychainError);
      throw new Error('Falló la recuperación del token de autenticación.');
    }
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders, // Aquí pasamos nuestro objeto plano de cabeceras.
    body: body ? JSON.stringify(body) : undefined,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch (parseError) {
        errorData = { message: `Error HTTP! Estado: ${response.status}` };
      }
      const errorMessage = errorData.message || `La petición falló con el estado ${response.status}`;
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (networkError: any) {
    console.error(`Error de red o llamada a la API a ${url}:`, networkError);
    throw new Error(networkError.message || 'La petición de red falló. Por favor, verifica tu conexión a internet.');
  }
};