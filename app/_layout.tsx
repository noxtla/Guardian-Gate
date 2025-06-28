// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, SplashScreen } from 'expo-router'; // Añade Redirect y SplashScreen
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

// --- NUEVAS IMPORTACIONES ---
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Importa el AuthProvider y useAuth
import { useEffect } from 'react'; // Necesario para gestionar SplashScreen

// Componente para el ícono de la cámara (sin cambios, pero lo mantenemos)
const HeaderCameraIcon = () => (
  <TouchableOpacity style={{ marginRight: 15 }}>
    <IconSymbol name="camera.fill" color={Colors.brand.white} size={26} />
  </TouchableOpacity>
);

// --- COMPONENTE ROOTLAYOUT ---
// Este componente principal se encarga de la carga inicial de fuentes y la configuración del ThemeProvider.
// También es el lugar donde el AuthProvider envolverá el resto de la aplicación.
export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    // Asegúrate de que todas las fuentes que uses estén cargadas aquí
    'Lato-Bold': require('../assets/fonts/Lato-Bold.ttf'), // Ejemplo de carga de fuentes adicionales
    'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
  });

  // Si las fuentes aún no están cargadas, retorna null (o un componente de carga)
  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* ENVUELVE TU APP CON AUTHPROVIDER */}
        <AuthProvider>
          {/* RootLayoutNav es un componente separado que contendrá la lógica de navegación
              y consumirá el contexto de autenticación. */}
          <RootLayoutNav />
        </AuthProvider>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

// --- COMPONENTE ROOTLAYOUTNAV ---
// Este componente se extrae para poder usar el hook useAuth dentro del AuthProvider.
function RootLayoutNav() {
  const { isAuthenticated, isLoadingAuth, user } = useAuth(); // Accede al estado de autenticación

  // Oculta la SplashScreen una vez que el estado de autenticación se ha determinado
  useEffect(() => {
    if (!isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingAuth]);

  // Muestra un estado de carga o null mientras se verifica la autenticación.
  // Es importante no renderizar el Stack de navegación hasta que isLoadingAuth sea false
  // para evitar flashes de contenido no deseado.
  if (isLoadingAuth) {
    // Podrías renderizar un componente de carga global o simplemente null si la SplashScreen
    // ya está cubriendo la pantalla.
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.brand.darkBlue,
        },
        headerTintColor: Colors.brand.white,
        headerTitleStyle: {
          fontFamily: 'SpaceMono', // Asegúrate de que esta fuente esté cargada
          fontSize: 24,
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackTitle: ' ',
      }}>
      {isAuthenticated ? (
        // --- RUTAS AUTENTICADAS ---
        // Si el usuario está autenticado, solo puede acceder a las pestañas y otras rutas autenticadas.
        <>
          <Stack.Screen
            name="(tabs)" // Apunta a nuestro grupo de rutas de pestañas
            options={{
              headerShown: true, // Asegúrate de que el header se muestre para las tabs
              headerTitle: 'Tree Service',
              headerBackVisible: false, // No se puede volver al login una vez autenticado
              headerRight: () => <HeaderCameraIcon />,
              headerTitleStyle: {
                fontFamily: 'SpaceMono',
                fontSize: 22,
                fontWeight: 'bold',
              },
            }}
          />
          {/* Si tuvieras otras pantallas que solo pueden ser accedidas si el usuario está logueado,
              las definirías aquí fuera del grupo (tabs). Por ejemplo:
          <Stack.Screen name="settings" options={{ title: 'Settings' }} />
          */}
        </>
      ) : (
        // --- RUTAS NO AUTENTICADAS (FLUJO DE LOGIN) ---
        // Si el usuario NO está autenticado, solo puede acceder a las pantallas del flujo de login.
        <>
          <Stack.Screen name="index" options={{ title: 'Guardian Gate' }} />
          <Stack.Screen name="otc" options={{ title: 'Enter Code' }} />
          <Stack.Screen name="ssn" options={{ title: 'Enter your SSN' }} />
          <Stack.Screen name="dob" options={{ title: 'Date of Birth' }} />
          <Stack.Screen name="year" options={{ title: 'Year of Birth' }} />
          {/* El `biometric` screen ahora tiene lógica condicional para el flujo */}
          <Stack.Screen name="biometric" options={{ title: 'Biometric Verification' }} />

          {/* IMPORTANTE: Redirección para cualquier acceso no autorizado a rutas protegidas.
              Si el usuario intenta ir a /(tabs) o a cualquier ruta no autenticada sin loguearse,
              será redirigido al index (pantalla de login). */}
          <Redirect href="/" />
        </>
      )}
    </Stack>
  );
}