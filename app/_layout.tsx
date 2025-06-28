// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Redirect, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

// Componente para el ícono de la cámara
const HeaderCameraIcon = () => (
  <TouchableOpacity style={{ marginRight: 15 }}>
    <IconSymbol name="camera.fill" color={Colors.brand.white} size={26} />
  </TouchableOpacity>
);

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Lato-Bold': require('../assets/fonts/Lato-Bold.ttf'),
    'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootLayoutNav />
        </AuthProvider>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function RootLayoutNav() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  useEffect(() => {
    if (!isLoadingAuth) {
      SplashScreen.hideAsync();
    }
  }, [isLoadingAuth]);

  if (isLoadingAuth) {
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
          fontFamily: 'SpaceMono',
          fontSize: 24,
        },
        headerTitleAlign: 'center', // <-- ESTO CENTRA EL TÍTULO GLOBALMENTE
        headerShadowVisible: false,
        headerBackTitle: ' ',
      }}>
      {isAuthenticated ? (
        // Rutas autenticadas
        <>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: true,
              headerTitle: 'Tree Service', // <-- TÍTULO: Tree Service
              headerBackVisible: false, // <-- ESTO ELIMINA EL BOTÓN DE REGRESO
              headerRight: () => <HeaderCameraIcon />, // <-- CÁMARA A LA DERECHA
              headerTitleStyle: {
                fontFamily: 'SpaceMono',
                fontSize: 22,
                fontWeight: 'bold',
              },
            }}
          />
          {/* Add any other authenticated standalone screens here */}
        </>
      ) : (
        // Rutas no autenticadas (flujo de login)
        <>
          <Stack.Screen name="index" options={{ title: 'Guardian Gate' }} />
          <Stack.Screen name="otc" options={{ title: 'Enter Code' }} />
          <Stack.Screen name="ssn" options={{ title: 'Enter your SSN' }} />
          <Stack.Screen name="dob" options={{ title: 'Date of Birth' }} />
          <Stack.Screen name="year" options={{ title: 'Year of Birth' }} />
          <Stack.Screen name="biometric" options={{ title: 'Biometric Verification' }} />
          <Redirect href="/" />
        </>
      )}
    </Stack>
  );
}