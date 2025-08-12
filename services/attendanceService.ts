// services/attendanceService.ts

// ... (la interfaz AttendanceStatusResponse y la función getStatus no cambian)
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
  
  // Interfaz para la respuesta del check-in
  export interface CheckInResponse {
    status: 'success' | 'error';
    message: string;
    checkedInAt: string; // La hora UTC en que el servidor registró el check-in
  }
  
  // --- SIMULACIÓN DE API ---
  const fetchAttendanceStatus = (): Promise<AttendanceStatusResponse> => {
    // ... (sin cambios aquí)
    console.log('[API Simulada] Obteniendo estado de asistencia...');
    
    return new Promise(resolve => {
      setTimeout(() => {
        const isWindowOpen = true; 
        
        const response: AttendanceStatusResponse = {
          serverTimeUTC: new Date().toISOString(),
          isWindowOpen: isWindowOpen,
          windowEndTimeUTC: isWindowOpen 
            ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
            : new Date().toISOString(),
          geofence: {
            latitude: 34.0522,
            longitude: -118.2437,
            radius: 150,
          },
        };
        resolve(response);
      }, 1000);
    });
  };
  
  // NUEVA FUNCIÓN para registrar el check-in
  const postCheckIn = (latitude: number, longitude: number): Promise<CheckInResponse> => {
    console.log(`[API Simulada] Enviando check-in para coords: ${latitude}, ${longitude}`);
    
    return new Promise(resolve => {
      setTimeout(() => {
        const response: CheckInResponse = {
          status: 'success',
          message: 'Attendance recorded successfully.',
          checkedInAt: new Date().toISOString(),
        };
        console.log('[API Simulada] Respuesta de Check-in:', response);
        resolve(response);
      }, 800); // Simulamos un retardo de red más corto para el POST
    });
  };
  
  export const AttendanceService = {
    getStatus: fetchAttendanceStatus,
    postCheckIn: postCheckIn, // Exportamos la nueva función
  };