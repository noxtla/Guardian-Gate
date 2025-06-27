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
            headerBackTitle: ' ', 
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
          {/* --- CAMBIO CLAVE --- */}
          {/* Se eliminan los estilos de header específicos para 'dob' */}
          {/* para que herede los estilos por defecto del Stack, igual que 'ssn'. */}
          <Stack.Screen
            name="dob"
            options={{
              title: 'Date of Birth',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}