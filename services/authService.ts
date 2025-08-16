// services/authService.ts
// INICIO DEL ARCHIVO COMPLETO Y VERIFICADO

import { apiClient } from './apiClient';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'user_auth_token';

// --- INTERFACES DE RESPUESTA DE LA API ---
interface CheckEmployeeIdResponse { status: 'success'; userFound: boolean; }

// La interfaz ya es correcta, define lo que la API devuelve.
interface VerifyIdentityResponse { 
  status: 'success'; 
  token: string; 
  userId: string; 
  isBiometricEnabled: boolean;
  name: string;
  position: string;
}

interface GetUploadUrlResponse { status: 'success'; uploadUrl: string; s3Key: string; }
interface ProcessFaceImageResponse { status: 'success'; message: string; }

export const AuthService = {
  checkEmployeeId: async (employeeId: string): Promise<boolean> => {
    const response = await apiClient<CheckEmployeeIdResponse>('AUTH', {
      body: { action: 'check-employee-id', employeeId },
    });
    return response.userFound;
  },

  verifyIdentity: async (
    employeeId: string,
    day: number,
    month: number,
    year: number
  // ***** LA CORRECCIÓN CLAVE ESTÁ AQUÍ *****
  // 1. AÑADIR 'position' AL TIPO DE RETORNO DE LA PROMESA
  ): Promise<{ token: string; userId: string; isBiometricEnabled: boolean; name: string; position: string }> => {
    const response = await apiClient<VerifyIdentityResponse>('AUTH', {
      body: { action: 'verify-identity', employeeId, day, month, year },
    });
    
    // 2. AHORA EL OBJETO DEVUELTO COINCIDE CON LA FIRMA DE LA FUNCIÓN
    return { 
        token: response.token, 
        userId: response.userId, 
        isBiometricEnabled: response.isBiometricEnabled,
        name: response.name,
        position: response.position
    };
  },

  getUploadUrl: async (userId: string, token: string): Promise<{ uploadUrl: string; s3Key: string }> => {
    const response = await apiClient<GetUploadUrlResponse>('AUTH', {
      body: { action: 'get-upload-url', userId },
      token: token
    });
    return { uploadUrl: response.uploadUrl, s3Key: response.s3Key };
  },

  processFaceImage: async (
    userId: string, 
    s3Key: string, 
    token: string, 
    isBiometricEnabled: boolean
  ): Promise<ProcessFaceImageResponse> => {
    const response = await apiClient<ProcessFaceImageResponse>('AUTH', {
      body: { action: 'process-face-image', userId, s3Key, isBiometricEnabled },
      token: token
    });
    return response;
  },
  
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('[AuthService] Token guardado de forma segura.');
    } catch (error) {
      console.error('[AuthService] No se pudo guardar el token:', error);
    }
  },

  getToken: async (): Promise<string | null> => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      if (token) {
        console.log('[AuthService] Token recuperado de forma segura.');
      } else {
        console.log('[AuthService] No se encontró ningún token en el almacenamiento.');
      }
      return token;
    } catch (error) {
      console.error('[AuthService] No se pudo recuperar el token:', error);
      return null;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('[AuthService] Token eliminado, sesión cerrada.');
    } catch (error) {
      console.error('[AuthService] No se pudo eliminar el token:', error);
    }
  },
};

// FIN DEL ARCHIVO COMPLETO Y VERIFICADO