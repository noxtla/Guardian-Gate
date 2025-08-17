// services/authService.ts
// VERSIÓN COMPLETA CON LÓGICA PARA RE-AUTENTICACIÓN BIOMÉTRICA

import { apiClient } from './apiClient';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

// --- CLAVES DE ALMACENAMIENTO ---
const SESSION_TOKEN_KEY = 'user_session_token';
const BIOMETRIC_LOGIN_ID_KEY = '@biometric_login_employee_id';
const BIOMETRIC_ENABLED_KEY = '@app_biometric_enabled';


// --- INTERFACES ---
interface CheckEmployeeIdResponse { status: 'success'; userFound: boolean; }
interface VerifyIdentityResponse { status: 'success'; token: string; userId: string; isBiometricEnabled: boolean; name: string; position: string; }
interface GetUploadUrlResponse { status: 'success'; uploadUrl: string; s3Key: string; }
interface ProcessFaceImageResponse { status: 'success'; message: string; }
interface UserProfile { userId: string; name: string; isBiometricEnabled: boolean; position: string; }

// Nueva interfaz para la respuesta del login biométrico
interface BiometricLoginResponse {
    status: 'success';
    token: string;
    userId: string;
    name: string;
    position: string;
    isBiometricEnabled: boolean;
}


export const AuthService = {
  /**
   * Verifica si un ID de empleado existe y está activo.
   */
  checkEmployeeId: async (employeeId: string): Promise<boolean> => {
    const response = await apiClient<CheckEmployeeIdResponse>('AUTH', {
      body: { action: 'check-employee-id', employeeId },
    });
    return response.userFound;
  },

  /**
   * Verifica la identidad completa del usuario (ID, DoB, Device) y devuelve un token.
   */
  verifyIdentity: async (
    employeeId: string,
    day: number,
    month: number,
    year: number
  ): Promise<VerifyIdentityResponse> => {
    const deviceId = Platform.OS === 'ios' 
      ? await Application.getIosIdForVendorAsync() 
      : 'android-device-id-placeholder';
    
    if (!deviceId) {
      throw new Error("Could not get device ID.");
    }
    
    return apiClient<VerifyIdentityResponse>('AUTH', {
      body: { 
        action: 'verify-identity', 
        employeeId, 
        day, 
        month, 
        year,
        deviceId
      },
    });
  },

  /**
   * Obtiene una URL firmada para subir la imagen de perfil a S3.
   */
  getUploadUrl: async (userId: string, token: string): Promise<{ uploadUrl: string; s3Key: string }> => {
    return apiClient<GetUploadUrlResponse>('AUTH', {
      body: { action: 'get-upload-url', userId },
      token: token
    });
  },

  /**
   * Pide al backend que procese la imagen facial subida a S3.
   */
  processFaceImage: async (
    userId: string, 
    s3Key: string, 
    token: string, 
    isBiometricEnabled: boolean
  ): Promise<ProcessFaceImageResponse> => {
    return apiClient<ProcessFaceImageResponse>('AUTH', {
      body: { action: 'process-face-image', userId, s3Key, isBiometricEnabled },
      token: token
    });
  },
  
  /**
   * Obtiene los datos del perfil del usuario autenticado usando su token de sesión.
   */
  getMe: async (): Promise<UserProfile> => {
    const token = await AuthService.getToken();
    if (!token) {
        throw new Error('No authentication token found for getMe');
    }
    return apiClient<UserProfile>('AUTH', { token });
  },

  /**
   * Solicita un nuevo token usando la autenticación biométrica.
   */
  biometricLogin: async (): Promise<BiometricLoginResponse> => {
    console.log('[AuthService] Initiating biometric login...');
    
    const employeeId = await AsyncStorage.getItem(BIOMETRIC_LOGIN_ID_KEY);
    const deviceId = Platform.OS === 'ios' 
      ? await Application.getIosIdForVendorAsync() 
      : 'android-device-id-placeholder';

    if (!employeeId || !deviceId) {
      throw new Error('Missing local credentials for biometric login.');
    }

    console.log(`[AuthService] Calling 'biometric-login' action with employeeId: ${employeeId}`);
    
    return apiClient<BiometricLoginResponse>('AUTH', {
        body: {
            action: 'biometric-login',
            employeeId,
            deviceId
        }
    });
  },

  /**
   * Guarda la preferencia del usuario para usar biometría, almacenando su ID de empleado.
   */
  saveBiometricPreference: async (employeeId: string): Promise<void> => {
    try {
        await AsyncStorage.setItem(BIOMETRIC_LOGIN_ID_KEY, employeeId);
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true');
        console.log(`[AuthService] Biometric preference saved for employeeId: ${employeeId}`);
    } catch (error) {
        console.error('[AuthService] Could not save biometric preference:', error);
    }
  },

  /**
   * Comprueba si el usuario ha habilitado la biometría en la app.
   */
  getBiometricRegistrationStatus: async (): Promise<boolean> => {
    try {
        const status = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
        return status === 'true';
    } catch (error) {
        console.error('[AuthService] Could not get biometric status:', error);
        return false;
    }
  },

  /**
   * Guarda el token de la sesión actual en el almacenamiento seguro.
   */
  setToken: async (token: string): Promise<void> => {
    try {
        await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
        console.log('[AuthService] Session token saved securely.');
    } catch (error) {
        console.error('[AuthService] Could not save session token:', error);
    }
  },

  /**
   * Recupera el token de la sesión actual del almacenamiento seguro.
   */
  getToken: async (): Promise<string | null> => {
    try {
        return await SecureStore.getItemAsync(SESSION_TOKEN_KEY);
    } catch (error) {
        console.error('[AuthService] Could not retrieve session token:', error);
        return null;
    }
  },

  /**
   * Cierra la sesión del usuario, eliminando el token de sesión pero manteniendo la preferencia biométrica.
   */
  logout: async (): Promise<void> => {
    try {
        await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
        console.log('[AuthService] Session token removed. Biometric preference kept.');
    } catch (error) {
        console.error('[AuthService] Could not remove session token during logout:', error);
    }
  },
};