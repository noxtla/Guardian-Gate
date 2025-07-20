// services/authService.ts
import { apiClient } from './apiClient';

// --- INTERFACES DE RESPUESTA ---
// Definen la "forma" de los datos que esperamos de nuestro backend.

interface CheckPhoneResponse {
  status: 'success';
  userFound: boolean;
}

interface VerifyIdentityResponse {
  status: 'success';
  token: string;
  userId: string;
}

interface RegisterFaceResponse {
    status: 'success';
    message: string;
}

// --- SERVICIO DE AUTENTICACIÓN ---
// Centraliza toda la lógica de comunicación con el backend.

export const AuthService = {
  /**
   * Llama a nuestro backend para verificar si un número de teléfono
   * corresponde a un empleado activo.
   * @param phoneNumber El número de teléfono a verificar en formato E.164.
   * @returns Un booleano indicando si el usuario fue encontrado y está activo.
   */
  checkPhoneNumber: async (phoneNumber: string): Promise<boolean> => {
    const response = await apiClient<CheckPhoneResponse>('', {
      body: { 
        action: 'check-phone',
        phoneNumber 
      },
    });
    return response.userFound;
  },

  /**
   * Envía los datos de identidad completos al backend para la verificación final.
   * @param phoneNumber El número de teléfono del usuario.
   * @param day El día de nacimiento.
   * @param month El mes de nacimiento.
   * @param year El año de nacimiento.
   * @returns Un objeto con el token de sesión (JWT) y el userId.
   */
  verifyIdentity: async (
    phoneNumber: string,
    day: number,
    month: number,
    year: number
  ): Promise<{ token: string; userId: string }> => {
    const response = await apiClient<VerifyIdentityResponse>('', {
      body: { 
        action: 'verify-identity', 
        phoneNumber, 
        day, 
        month, 
        year 
      },
    });
    return { token: response.token, userId: response.userId };
  },

  /**
   * Envía el ID del usuario y su foto en formato Base64 al backend para registrarla.
   * @param userId El UUID del empleado.
   * @param imageBase64 La imagen del rostro del usuario codificada en Base64.
   * @returns Un mensaje de éxito desde el servidor.
   */
  registerFace: async (userId: string, imageBase64: string): Promise<string> => {
    const response = await apiClient<RegisterFaceResponse>('', {
      body: {
        action: 'register-face',
        userId,
        imageBase64,
      },
    });
    return response.message;
  },

  /**
   * Recupera el token de sesión almacenado.
   */
  getToken: async (): Promise<string | null> => {
    console.log('[AuthService] getToken: La persistencia de sesión no está implementada.');
    return null;
  },

  /**
   * Cierra la sesión del usuario.
   */
  logout: async (): Promise<void> => {
    console.log('[AuthService] logout: No hay sesión persistente que cerrar.');
  },
};