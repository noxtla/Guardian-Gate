// context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthService } from '@/services/authService'; // Importamos nuestro servicio de autenticación
import { router, SplashScreen } from 'expo-router'; // Importamos router y SplashScreen de expo-router

// 1. Define la interfaz para el tipo de datos que se expondrán a través del contexto
interface AuthContextType {
  isAuthenticated: boolean; // Indica si el usuario está autenticado
  isLoadingAuth: boolean;   // Indica si el estado de autenticación aún se está cargando (ej. al inicio de la app)
  user: { userId: string; hasBiometricsEnabled: boolean } | null; // Datos básicos del usuario
  login: (token: string, userId: string, hasBiometricsEnabled: boolean) => Promise<void>; // Función para iniciar sesión
  logout: () => Promise<void>; // Función para cerrar sesión
  updateBiometricsStatus: (status: boolean) => void; // Función para actualizar el estado de biometría
}

// 2. Crea el contexto con un valor inicial indefinido.
// El 'undefined' inicial es un patrón común para asegurar que useAuth se use dentro del proveedor.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 3. Define el componente AuthProvider que envolverá tu aplicación.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Se establece en true para la carga inicial
  const [user, setUser] = useState<{ userId: string; hasBiometricsEnabled: boolean } | null>(null);

  // Efecto para cargar el estado de autenticación al inicio de la aplicación
  useEffect(() => {
    // Evita que la SplashScreen se oculte antes de que el estado de autenticación se determine
    SplashScreen.preventAutoHideAsync();

    const loadAuthStatus = async () => {
      try {
        const token = await AuthService.getToken(); // Intenta obtener el token del Keychain
        if (token) {
          // Si hay un token, el usuario está potencialmente autenticado.
          // En una app real, aquí harías una llamada a tu backend (ej. /me o /profile)
          // para validar el token y obtener los datos del usuario.
          // Por ahora, simulamos unos datos de usuario básicos.
          // Para este ejemplo, asumiremos que si hay un token, el usuario está autenticado.
          // Y que los datos de 'userId' y 'hasBiometricsEnabled' se pueden decodificar del JWT
          // o se recuperan de un almacenamiento persistente no sensible (ej. AsyncStorage para userId).
          // Para simplificar, asumiremos que el `userId` y `hasBiometricsEnabled`
          // provienen de la respuesta de `verifyOtp` o `verifyUserDetails`
          // y serán pasados a `login`. Aquí, al recargar la app, necesitamos un mecanismo
          // para recuperar esos datos junto con el token.
          // **NOTA:** Aquí es donde necesitarías una llamada API a un endpoint /me
          // que valide el token y te devuelva los datos del usuario.
          // Por simplicidad, estableceremos valores por defecto para userId y hasBiometricsEnabled
          // o los recuperaremos de AsyncStorage si los guardamos allí (no sensible).
          // Ya que en los pasos anteriores no guardamos userId en Keychain,
          // lo simularemos o lo leeremos de la primera vez que se loguea.
          // Si userId y hasBiometricsEnabled se guardan con Keychain junto al token,
          // se haría así:
          // const userDetails = await Keychain.getGenericPassword({ service: 'user_details' });
          // if (userDetails && userDetails.password) {
          //    const { userId, hasBiometricsEnabled } = JSON.parse(userDetails.password);
          //    setUser({ userId, hasBiometricsEnabled });
          // } else {
          //    // Fallback si no hay detalles específicos guardados
          //    setUser({ userId: 'unknown-user', hasBiometricsEnabled: false });
          // }

          // Para este ejemplo, asumiremos que si hay un token, el usuario está autenticado,
          // pero el userId y hasBiometricsEnabled se inicializarán con valores genéricos
          // o requerirán una llamada /me. Para evitar complejidades innecesarias en el AuthContext,
          // simplemente marcaremos como autenticado.
          setIsAuthenticated(true);
          // Si hasBiometricsEnabled necesita ser persistente al recargar la app,
          // deberías guardarlo en un lugar como AsyncStorage (NO Keychain para no-sensible)
          // o pedir al backend que lo envíe de nuevo con una llamada /me
          setUser({ userId: 'placeholder-user-id', hasBiometricsEnabled: false }); // **Mejorar esto en un sistema real**
        }
      } catch (error) {
        console.error('Falló la carga del estado de autenticación:', error);
      } finally {
        setIsLoadingAuth(false); // La carga ha terminado
        SplashScreen.hideAsync(); // Ahora es seguro ocultar la SplashScreen
      }
    };
    loadAuthStatus();
  }, []);

  // Función para iniciar sesión, llamada después de una autenticación exitosa.
  const login = useCallback(async (token: string, userId: string, hasBiometricsEnabled: boolean) => {
    // AuthService.setToken es un alias para Keychain.setGenericPassword('auth_token', token)
    // El token ya se guarda en verifyOtp/verifyUserDetails dentro de AuthService.
    // Solo necesitamos actualizar el estado del contexto.
    setIsAuthenticated(true);
    setUser({ userId, hasBiometricsEnabled });
    // router.replace('/(tabs)'); // La navegación se manejará en _layout.tsx
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