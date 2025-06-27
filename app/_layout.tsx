// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native'; // <-- AÑADE ESTA LÍNEA

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol'; // <-- AÑADE ESTA LÍNEA

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
  });

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
            headerTitleAlign: 'center',
            headerShadowVisible: false,
            headerBackTitle: ' ',
          }}>
          <Stack.Screen name="index" options={{ title: 'Guardian Gate' }} />
          <Stack.Screen name="otc" options={{ title: 'Enter Code' }} />
          <Stack.Screen name="ssn" options={{ title: 'Enter your SSN' }} />
          <Stack.Screen name="dob" options={{ title: 'Date of Birth' }} />
          <Stack.Screen name="year" options={{ title: 'Year of Birth' }} />
          <Stack.Screen name="biometric" options={{ title: 'Biometric Verification' }} />
          
          {/* --- ESTA ES LA CONFIGURACIÓN CLAVE --- */}
          <Stack.Screen
            name="(tabs)" // Apunta a nuestro grupo de rutas de pestañas
            options={{
              headerShown: true,
              headerTitle: 'Tree Service',
              headerBackVisible: false, // No se puede volver al login
              headerRight: () => <HeaderCameraIcon />,
              headerTitleStyle: {
                fontFamily: 'SpaceMono',
                fontSize: 22,
                fontWeight: 'bold',
              },
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}