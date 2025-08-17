// services/biometricService.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';

const BIOMETRIC_REGISTRATION_KEY = '@biometric_registration_status';

/**
 * Verifica si el hardware del dispositivo soporta biometría y si el usuario
 * ha registrado sus huellas o rostro en el dispositivo.
 * @returns {Promise<boolean>} - True si la biometría está configurada, false en caso contrario.
 */
const isBiometricEnrolled = async (): Promise<boolean> => {
  try {
    return await LocalAuthentication.isEnrolledAsync();
  } catch (error) {
    console.error('[BiometricService] Error checking enrollment:', error);
    return false;
  }
};

/**
 * Muestra el diálogo de autenticación biométrica (Face ID, huella, etc.).
 * @param {string} promptMessage - El mensaje que se mostrará al usuario en el diálogo.
 * @returns {Promise<boolean>} - True si la autenticación es exitosa, false si falla o es cancelada.
 */
const authenticateWithBiometrics = async (promptMessage: string = 'Confirma tu identidad'): Promise<boolean> => {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      fallbackLabel: 'Usar contraseña', // No se usará en nuestro flujo, pero es requerido.
      disableDeviceFallback: true, // Impide que el sistema pida el PIN del dispositivo.
    });
    return result.success;
  } catch (error) {
    console.error('[BiometricService] Authentication error:', error);
    Alert.alert('Error Biométrico', 'No se pudo verificar tu identidad.');
    return false;
  }
};

export const BiometricService = {
  isBiometricEnrolled,
  authenticateWithBiometrics,
};