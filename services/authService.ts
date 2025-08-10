// services/authService.ts

import { apiClient } from './apiClient';

// --- INTERFACES DE RESPUESTA DE LA API ---

interface CheckEmployeeIdResponse {
  status: 'success';
  userFound: boolean;
}

interface VerifyIdentityResponse {
  status: 'success';
  token: string;
  userId: string;
  isBiometricEnabled: boolean;
}

interface GetUploadUrlResponse {
  status: 'success';
  uploadUrl: string;
  s3Key: string;
}

// Interfaz para la respuesta de processFaceImage (la definimos ahora)
interface ProcessFaceImageResponse {
    status: 'success';
    message: string;
    // Podríamos añadir más datos si es necesario, como el estado de la sesión.
}


export const AuthService = {
  /**
   * Verifica si un ID de empleado existe y está activo.
   */
  checkEmployeeId: async (employeeId: string): Promise<boolean> => {
    const response = await apiClient<CheckEmployeeIdResponse>('', {
      body: { 
        action: 'check-employee-id',
        employeeId 
      },
    });
    return response.userFound;
  },

  /**
   * Verifica la identidad del usuario con su DOB y obtiene un token JWT.
   */
  verifyIdentity: async (
    employeeId: string,
    day: number,
    month: number,
    year: number
  ): Promise<{ token: string; userId: string; isBiometricEnabled: boolean }> => {
    const response = await apiClient<VerifyIdentityResponse>('', {
      body: { 
        action: 'verify-identity', 
        employeeId,
        day, 
        month, 
        year 
      },
    });
    return { 
        token: response.token, 
        userId: response.userId, 
        isBiometricEnabled: response.isBiometricEnabled 
    };
  },

  /**
   * Obtiene una URL pre-firmada de S3 para subir la imagen de perfil.
   * @param userId El ID del usuario para el cual se genera la URL.
   * @param token El JWT para autenticar la petición.
   */
  getUploadUrl: async (userId: string, token: string): Promise<{ uploadUrl: string; s3Key: string }> => {
    const response = await apiClient<GetUploadUrlResponse>('', {
      body: {
        action: 'get-upload-url',
        userId
      },
      token: token
    });
    return { uploadUrl: response.uploadUrl, s3Key: response.s3Key };
  },

  /**
   * Notifica al backend que procese una imagen que ya está en S3.
   * @param userId El ID del usuario.
   * @param s3Key La clave del objeto de la imagen en S3.
   * @param token El JWT para autenticar la petición.
   * @param isBiometricEnabled Indica al backend si debe registrar o buscar la cara.
   */
  processFaceImage: async (
    userId: string, 
    s3Key: string, 
    token: string, 
    isBiometricEnabled: boolean
  ): Promise<ProcessFaceImageResponse> => {
    console.log(`[AuthService] Llamando a processFaceImage para userId: ${userId} con isBiometricEnabled: ${isBiometricEnabled}`);
    const response = await apiClient<ProcessFaceImageResponse>('', {
      body: {
        action: 'process-face-image',
        userId,
        s3Key,
        isBiometricEnabled
      },
      token: token
    });
    return response;
  },

  // --- Funciones de manejo de sesión (a implementar con Keychain) ---

  setToken: async (token: string): Promise<void> => {
    // En el futuro: await Keychain.setGenericPassword('userToken', token);
    console.log('[AuthService] setToken: No implementado aún.');
  },

  getToken: async (): Promise<string | null> => {
    // En el futuro: const credentials = await Keychain.getGenericPassword(); return credentials ? credentials.password : null;
    console.log('[AuthService] getToken: No implementado.');
    return null;
  },

  logout: async (): Promise<void> => {
    // En el futuro: await Keychain.resetGenericPassword();
    console.log('[AuthService] logout: No implementado.');
  },
};