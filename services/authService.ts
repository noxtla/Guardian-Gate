// services/authService.ts
// VERSIÓN FINAL PARA EXPO GO (MANAGED WORKFLOW) - CORREGIDO

import { apiClient } from './apiClient';
import * as SecureStore from 'expo-secure-store';
import { API_ENDPOINTS } from '@/constants/environment'; // <-- PASO 1: IMPORTAR

// Clave única para guardar y recuperar el token del almacenamiento seguro del dispositivo.
const TOKEN_KEY = 'user_auth_token';

// --- INTERFACES DE RESPUESTA DE LA API ---
interface CheckEmployeeIdResponse { status: 'success'; userFound: boolean; }
interface VerifyIdentityResponse { status: 'success'; token: string; userId: string; isBiometricEnabled: boolean; }
interface GetUploadUrlResponse { status: 'success'; uploadUrl: string; s3Key: string; }
interface ProcessFaceImageResponse { status: 'success'; message: string; }

export const AuthService = {
  checkEmployeeId: async (employeeId: string): Promise<boolean> => {
    // PASO 2: USAR EL ENDPOINT CORRECTO
    const response = await apiClient<CheckEmployeeIdResponse>(API_ENDPOINTS.AUTH, {
      body: { action: 'check-employee-id', employeeId },
    });
    return response.userFound;
  },

  verifyIdentity: async (
    employeeId: string,
    day: number,
    month: number,
    year: number
  ): Promise<{ token: string; userId: string; isBiometricEnabled: boolean }> => {
    // PASO 3: USAR EL ENDPOINT CORRECTO
    const response = await apiClient<VerifyIdentityResponse>(API_ENDPOINTS.AUTH, {
      body: { action: 'verify-identity', employeeId, day, month, year },
    });
    // PASO 3.1: GUARDAR EL TOKEN
    await AuthService.setToken(response.token);
    return { 
        token: response.token, 
        userId: response.userId, 
        isBiometricEnabled: response.isBiometricEnabled 
    };
  },

  getUploadUrl: async (userId: string, token: string): Promise<{ uploadUrl: string; s3Key: string }> => {
    // PASO 4: USAR EL ENDPOINT CORRECTO
    const response = await apiClient<GetUploadUrlResponse>(API_ENDPOINTS.AUTH, {
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
    // PASO 5: USAR EL ENDPOINT CORRECTO
    const response = await apiClient<ProcessFaceImageResponse>(API_ENDPOINTS.AUTH, {
      body: { action: 'process-face-image', userId, s3Key, isBiometricEnabled },
      token: token
    });
    return response;
  },

  // --- Las funciones de manejo de sesión no cambian ---
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