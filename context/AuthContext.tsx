// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { router, SplashScreen } from 'expo-router';

// Interfaz para el objeto de usuario que se almacenará en el estado del contexto.
interface User {
  userId: string;
  hasBiometricsEnabled: boolean;
  name: string; // El nombre del empleado.
}

// Interfaz que define la forma del contexto que consumirán los componentes.
interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: User | null;
  login: (token: string, userId: string, hasBiometricsEnabled: boolean, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBiometricsStatus: (status: boolean) => void;
}

// Creación del contexto de React.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// El componente Provider que envolverá la aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Efecto para verificar el estado de autenticación al iniciar la app.
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    const loadAuthStatus = async () => {
      try {
        const token = await AuthService.getToken();
        if (token) {
          // En una app real, aquí se podría decodificar el token para obtener el nombre
          // y el ID, o llamar a un endpoint /me para validar y obtener datos frescos.
          // Por ahora, el estado se puebla explícitamente en el login.
        }
      } catch (error) {
        console.error('Falló la carga del estado de autenticación:', error);
      } finally {
        setIsLoadingAuth(false);
        SplashScreen.hideAsync();
      }
    };
    loadAuthStatus();
  }, []);

  // Función para manejar el inicio de sesión.
  const login = useCallback(async (token: string, userId: string, hasBiometricsEnabled: boolean, name: string) => {
    await AuthService.setToken(token); // Guarda el token en el almacenamiento seguro.
    setIsAuthenticated(true);
    setUser({ userId, hasBiometricsEnabled, name }); // Almacena los datos del usuario en el estado.
    router.replace('/(tabs)'); // Redirige a la pantalla principal.
  }, []);

  // Función para manejar el cierre de sesión.
  const logout = useCallback(async () => {
    await AuthService.logout(); // Elimina el token.
    setIsAuthenticated(false);
    setUser(null); // Limpia los datos del usuario.
    router.replace('/'); // Redirige a la pantalla de login.
  }, []);

  // Función para actualizar el estado de la biometría después del registro.
  const updateBiometricsStatus = useCallback((status: boolean) => {
      if (user) {
          setUser(prevUser => (prevUser ? { ...prevUser, hasBiometricsEnabled: status } : null));
      }
  }, [user]);

  // Provee el valor del contexto a los componentes hijos.
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, user, login, logout, updateBiometricsStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para facilitar el consumo del contexto.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};