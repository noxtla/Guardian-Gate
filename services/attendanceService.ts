// services/attendanceService.ts
import { apiClient } from './apiClient';
import { AuthService } from './authService'; // Importamos AuthService para obtener el token

// --- INTERFACES DE RESPUESTA DE LA API (Deben coincidir con el backend) ---
export interface AttendanceStatusResponse {
  serverTimeUTC: string;
  isWindowOpen: boolean;
  windowEndTimeUTC: string;
  geofence: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface CheckInResponse {
  status: 'success' | 'error';
  message: string;
  checkedInAt: string; // La hora UTC en que el servidor registró el check-in
}

// --- SERVICIO REAL QUE USA API CLIENT ---
const getStatus = async (): Promise<AttendanceStatusResponse> => {
  console.log('[AttendanceService] Obteniendo estado de asistencia del backend...');
  const token = await AuthService.getToken();
  if (!token) {
    throw new Error('No se puede obtener el estado de asistencia sin autenticación.');
  }

  // Usamos la clave 'ATTENDANCE' y pasamos el token
  return apiClient<AttendanceStatusResponse>('ATTENDANCE', {
    body: { action: 'get-attendance-status' },
    token,
  });
};

const postCheckIn = async (latitude: number, longitude: number): Promise<CheckInResponse> => {
  console.log(`[AttendanceService] Enviando check-in al backend para coords: ${latitude}, ${longitude}`);
  const token = await AuthService.getToken();
  if (!token) {
    throw new Error('No se puede realizar el check-in sin autenticación.');
  }

  // Usamos la clave 'ATTENDANCE', pasamos los datos y el token
  return apiClient<CheckInResponse>('ATTENDANCE', {
    body: {
      action: 'post-check-in',
      latitude,
      longitude,
    },
    token,
  });
};

export const AttendanceService = {
  getStatus,
  postCheckIn,
};