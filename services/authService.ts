// services/authService.ts
import * as Keychain from 'react-native-keychain';
import { apiClient } from './apiClient';

/**
 * Servicio encargado de todas las operaciones relacionadas con la autenticación
 * y la comunicación con los webhooks de n8n.
 */
export const AuthService = {
  /**
   * Envía una petición al webhook de n8n para iniciar el proceso de OTP.
   * @param phoneNumber El número de teléfono al que enviar el OTP.
   * @returns Una promesa que se resuelve cuando la operación es exitosa (void porque no devuelve datos importantes).
   * @throws Error si la petición falla.
   */

  /**
   * ESTA FUNCIÓN NO LA ESTAMOS USANDO AHORA, pero la dejaremos limpia.
   * La validación del número la hacemos directamente en app/index.tsx.
   * La dejaremos preparada para cuando la necesitemos de verdad (enviar SMS).
   */
  
  sendOtp: async (phoneNumber: string): Promise<void> => {
    // La dejamos vacía por ahora, o la hacemos lanzar un error para saber si se llama por accidente.
    console.warn("AuthService.sendOtp fue llamada, pero la lógica de validación está en app/index.tsx");
    // No hace nada.
  },

  /**
   * Verifica el OTP enviado por el usuario con el webhook de n8n.
   * Si la verificación es exitosa, el backend debería devolver un token JWT.
   * @param phoneNumber El número de teléfono del usuario.
   * @param otpCode El código OTP ingresado por el usuario.
   * @returns Una promesa que resuelve con el token JWT, userId y el estado de biometría.
   * @throws Error si la verificación falla o si el token no es devuelto.
   */
  verifyOtp: async (phoneNumber: string, otpCode: string): Promise<{ token: string; userId: string; hasBiometricsEnabled: boolean }> => {
    // Esperamos que el webhook de n8n devuelva un objeto con 'token', 'userId' y 'hasBiometricsEnabled'.
    const response = await apiClient<{ token: string; userId: string; hasBiometricsEnabled: boolean }>('', {
      method: 'POST',
      body: { action: "verify-otp", phoneNumber, otpCode },
      authenticated: false, // Esta petición tampoco requiere JWT (aún estamos en el flujo de login inicial)
    });

    const { token, userId, hasBiometricsEnabled } = response;
    // --- CAMBIO CLAVE: Temporarily disabling JWT storage ---
    // if (token) {
    //   await Keychain.setGenericPassword('auth_token', token);
    // } else {
    //   throw new Error('Token de autenticación no recibido.');
    // }
    return { token, userId, hasBiometricsEnabled };
  },

  /**
   * Envía los detalles del usuario (últimos 4 del SSN, mes, día y año de nacimiento)
   * al webhook de n8n para verificación.
   * @param phoneNumber El número de teléfono del usuario.
   * @param ssnLast4 Los últimos 4 dígitos del SSN.
   * @param dobMonth El mes de nacimiento.
   * @param dobDay El día de nacimiento.
   * @param dobYear El año de nacimiento.
   * @returns Una promesa que resuelve con el token JWT (posiblemente actualizado), userId y estado de biometría.
   * @throws Error si los detalles no coinciden o si la verificación falla.
   */
  verifyUserDetails: async (phoneNumber: string, ssnLast4: string, dobMonth: number, dobDay: number, dobYear: number): Promise<{ token: string; userId: string; hasBiometricsEnabled: boolean }> => {
    const response = await apiClient<{ token: string; userId: string; hasBiometricsEnabled: boolean }>('', {
      method: 'POST',
      body: { action: "verify-user-details", phoneNumber, ssnLast4, dobMonth, dobDay, dobYear },
      authenticated: false, // Todavía no estamos usando el token recién adquirido para autenticar esta llamada
    });

    const { token, userId, hasBiometricsEnabled } = response;
    // --- CAMBIO CLAVE: Temporarily disabling JWT storage ---
    // if (token) {
    //     await Keychain.setGenericPassword('auth_token', token);
    // }
    return { token, userId, hasBiometricsEnabled };
  },

  /**
   * Registra el estado de verificación biométrica del usuario con el webhook de n8n.
   * Esta es una petición AUTENTICADA, por lo que apiClient adjuntará el JWT.
   * @param userId El ID del usuario que se va a actualizar (obtenido del flujo de login).
   * @returns Una promesa que se resuelve cuando la operación es exitosa.
   * @throws Error si el registro falla.
   */
  registerBiometric: async (userId: string): Promise<void> => {
    await apiClient('', {
        method: 'POST',
        body: { action: "register-biometric", userId, biometricType: "faceid", status: "enabled" },
        authenticated: false, // <-- CAMBIO CLAVE: Desactivamos la autenticación por JWT por ahora.
    });
  },

  /**
   * Recupera el token JWT almacenado de forma segura en Keychain.
   * @returns El token JWT como string o null si no se encuentra.
   */
  getToken: async (): Promise<string | null> => {
    // --- CAMBIO CLAVE: Siempre devolverá null si no guardamos tokens ---
    return null; // Temporalmente deshabilitado
    // try {
    //     const credentials = await Keychain.getGenericPassword();
    //     return credentials ? credentials.password : null;
    // } catch (error) {
    //     console.error('Error al obtener el token de Keychain:', error);
    //     return null;
    // }
  },

  /**
   * Elimina el token JWT almacenado de Keychain, cerrando la sesión del usuario.
   * @returns Una promesa que se resuelve cuando la operación es exitosa.
   */
  logout: async (): Promise<void> => {
    // --- CAMBIO CLAVE: No hará nada si no hay token guardado ---
    // try {
    //     await Keychain.resetGenericPassword();
    // } catch (error) {
    //     console.error('Error al restablecer el token en Keychain:', error);
    // }
  }
};