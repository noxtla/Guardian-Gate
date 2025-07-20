// services/authService.ts
import { apiClient } from './apiClient';

// Definimos la forma de la respuesta que esperamos de nuestra GCF
interface CheckPhoneResponse {
  status: 'success';
  userFound: boolean;
}

export const AuthService = {
  /**
   * Llama a nuestro backend para verificar si un número de teléfono
   * corresponde a un empleado activo.
   * @param phoneNumber El número de teléfono a verificar.
   * @returns Un booleano que indica si el usuario fue encontrado y está activo.
   */
  checkPhoneNumber: async (phoneNumber: string): Promise<boolean> => {
    // Usamos nuestro apiClient para llamar al endpoint
    const response = await apiClient<CheckPhoneResponse>('', { // endpoint es ''
      body: {
        action: 'check-phone',
        phoneNumber,
      },
    });
    
    return response.userFound;
  },

  // En el futuro, aquí añadiremos más funciones como:
  // sendOtp: async (phoneNumber) => { ... }
  // verifyOtp: async (phoneNumber, code) => { ... }
};