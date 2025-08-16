// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { router, SplashScreen } from 'expo-router';

// 1. AÑADIR 'position' A LA INTERFAZ DEL USUARIO
interface User {
  userId: string;
  hasBiometricsEnabled: boolean;
  name: string;
  position: string; // El rol del empleado, ej. "Trimmer"
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: User | null;
  // 2. AÑADIR 'position' A LA FIRMA DE LA FUNCIÓN 'login'
  login: (token: string, userId: string, hasBiometricsEnabled: boolean, name: string, position: string) => Promise<void>;
  logout: () => Promise<void>;
  updateBiometricsStatus: (status: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);

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

  // 3. ACTUALIZAR LA IMPLEMENTACIÓN DE 'login' PARA ACEPTAR Y GUARDAR 'position'
  const login = useCallback(async (token: string, userId: string, hasBiometricsEnabled: boolean, name: string, position: string) => {
    await AuthService.setToken(token); // Guarda el token en el almacenamiento seguro.
    setIsAuthenticated(true);
    setUser({ userId, hasBiometricsEnabled, name, position }); // Almacena todos los datos del usuario en el estado.
    router.replace('/(tabs)'); // Redirige a la pantalla principal.
  }, []);

  const logout = useCallback(async () => {
    await AuthService.logout(); // Elimina el token.
    setIsAuthenticated(false);
    setUser(null); // Limpia los datos del usuario.
    router.replace('/'); // Redirige a la pantalla de login.
  }, []);

  const updateBiometricsStatus = useCallback((status: boolean) => {
      if (user) {
          setUser(prevUser => (prevUser ? { ...prevUser, hasBiometricsEnabled: status } : null));
      }
  }, [user]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, user, login, logout, updateBiometricsStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};