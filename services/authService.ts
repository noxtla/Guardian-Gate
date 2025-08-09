// services/authService.ts
import { apiClient } from './apiClient';

interface CheckEmployeeIdResponse {
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

export const AuthService = {
  /**
   * CAMBIO: Acepta un string pero se envía al backend, que lo validará como número.
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
   * CAMBIO: Acepta employeeId como string.
   */
  verifyIdentity: async (
    employeeId: string,
    day: number,
    month: number,
    year: number
  ): Promise<{ token: string; userId: string }> => {
    const response = await apiClient<VerifyIdentityResponse>('', {
      body: { 
        action: 'verify-identity', 
        employeeId,
        day, 
        month, 
        year 
      },
    });
    return { token: response.token, userId: response.userId };
  },

  // SIN CAMBIOS
  registerFace: async (userId: string, imageBase64: string): Promise<string> => {
    const response = await apiClient<RegisterFaceResponse>('', {
      body: { action: 'register-face', userId, imageBase64 },
    });
    return response.message;
  },
  getToken: async (): Promise<string | null> => {
    console.log('[AuthService] getToken: No implementado.');
    return null;
  },
  logout: async (): Promise<void> => {
    console.log('[AuthService] logout: No implementado.');
  },
};