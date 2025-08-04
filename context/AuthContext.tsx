// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import { router, SplashScreen } from 'expo-router';

// 1. Define la interfaz para el tipo de datos que se expondrán a través del contexto
interface AuthContextType {
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  user: { userId: string; hasBiometricsEnabled: boolean } | null;
  login: (token: string, userId: string, hasBiometricsEnabled: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateBiometricsStatus: (status: boolean) => void;
}

// 2. Crea el contexto con un valor inicial indefinido.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Define el componente AuthProvider que envolverá tu aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [user, setUser] = useState<{ userId: string; hasBiometricsEnabled: boolean } | null>(null);

  // Efecto para cargar el estado de autenticación al inicio de la aplicación
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();

    const loadAuthStatus = async () => {
      try {
        // En una app real, aquí se recuperaría y validaría el token.
        // Por ahora, asumimos que el usuario no está logueado al iniciar.
        const token = await AuthService.getToken();
        if (token) {
          // Si tuviéramos un endpoint /me, lo llamaríamos aquí para obtener
          // los datos del usuario y marcarlo como autenticado.
          // Por ahora, esta lógica se activa solo con un login manual.
          console.log("Token encontrado, pero la validación automática no está implementada.");
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

  // Función para iniciar sesión, llamada después de una autenticación exitosa.
  const login = useCallback(async (token: string, userId: string, hasBiometricsEnabled: boolean) => {
    // En el futuro, aquí guardaríamos el token en Keychain: await AuthService.setToken(token);
    setIsAuthenticated(true);
    setUser({ userId, hasBiometricsEnabled });
    
    // [CORRECCIÓN] Se restaura la navegación explícita.
    // Usamos router.replace para limpiar el historial de autenticación
    // y evitar que el usuario pueda volver a las pantallas de login.
    router.replace('/(tabs)');
  }, []);

  // Función para cerrar sesión.
  const logout = useCallback(async () => {
    await AuthService.logout(); // Elimina el token de Keychain
    setIsAuthenticated(false);
    setUser(null);
    router.replace('/'); // Redirige a la pantalla de login
  }, []);

  // Función para actualizar el estado de biometría en el contexto.
  const updateBiometricsStatus = useCallback((status: boolean) => {
      if (user) {
          setUser(prevUser => (prevUser ? { ...prevUser, hasBiometricsEnabled: status } : null));
      }
  }, [user]);

  // Proveedor del contexto que envuelve a los componentes hijos.
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoadingAuth, user, login, logout, updateBiometricsStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto de autenticación.
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};