// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

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
            // --- CAMBIO CLAVE: Esta es la propiedad corregida que no da error ---
            headerBackTitle: ' ', // Oculta el título de regreso de forma compatible
          }}>
          <Stack.Screen
            name="index"
            options={{
              title: 'Guardian Gate',
            }}
          />
          <Stack.Screen
            name="ssn"
            options={{
              title: 'Enter your SSN',
            }}
          />
          <Stack.Screen
            name="dob"
            options={{
              title: 'Date of Birth',
              headerStyle: {
                backgroundColor: Colors.brand.white,
              },
              headerTintColor: Colors.brand.darkBlue,
              headerTitleStyle: {
                color: Colors.brand.darkBlue,
                fontWeight: 'bold',
                fontSize: 22,
              },
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}