// services/authService.ts
// VERSIÓN FINAL PARA EXPO GO (MANAGED WORKFLOW)

import { apiClient } from './apiClient';
import * as SecureStore from 'expo-secure-store';

// Clave única para guardar y recuperar el token del almacenamiento seguro del dispositivo.
const TOKEN_KEY = 'user_auth_token';

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

interface ProcessFaceImageResponse {
    status: 'success';
    message: string;
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

  // --- INICIO: Funciones de manejo de sesión con expo-secure-store ---

  /**
   * Guarda el token de autenticación de forma segura en el dispositivo.
   * @param token El JWT a guardar.
   */
  setToken: async (token: string): Promise<void> => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      console.log('[AuthService] Token guardado de forma segura.');
    } catch (error) {
      console.error('[AuthService] No se pudo guardar el token:', error);
      // Opcional: Podrías lanzar el error para que sea manejado por quien llama a la función.
      // throw new Error("Failed to save token.");
    }
  },

  /**
   * Recupera el token de autenticación del almacenamiento seguro.
   * @returns El token como string, o null si no se encuentra.
   */
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

  /**
   * Elimina el token de autenticación del dispositivo para cerrar la sesión.
   */
  logout: async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      console.log('[AuthService] Token eliminado, sesión cerrada.');
    } catch (error) {
      console.error('[AuthService] No se pudo eliminar el token:', error);
    }
  },
  
  // --- FIN: Funciones de manejo de sesión ---
};