// app/_layout.tsx

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Platform, Dimensions } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDELINE_BASE_WIDTH = 390;

const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;

const moderateScale = (size: number, factor = 0.5): number => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(newSize);
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    'Lato-Bold': require('../assets/fonts/Lato-Bold.ttf'),
    'Lato-Regular': require('../assets/fonts/Lato-Regular.ttf'),
    'OpenSans-Regular': require('../assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('../assets/fonts/OpenSans-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

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
        headerStyle: { backgroundColor: Colors.brand.darkBlue },
        headerTintColor: Colors.brand.white,
        headerTitleStyle: {
          fontFamily: 'OpenSans-SemiBold',
          fontSize: Platform.select({ ios: 22, android: moderateScale(20, 0.4) }),
        },
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerBackTitle: ' ',
      }}>
      {isAuthenticated ? (
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: true,
            headerTitle: 'Tree Service',
            headerBackVisible: false,
            headerTitleStyle: { fontFamily: 'OpenSans-SemiBold', fontSize: 22 },
          }}
        />
      ) : (
        [
          <Stack.Screen key="index" name="index" options={{ title: 'Guardian Gate' }} />,
          <Stack.Screen key="otc" name="otc" options={{ title: 'Enter Code' }} />,
          <Stack.Screen key="ssn" name="ssn" options={{ title: 'Enter your SSN' }} />,
          <Stack.Screen key="dob" name="dob" options={{ title: 'Date of Birth' }} />,
          // --- CORRECCIÓN: Se elimina la ruta 'year' que no existe ---
          <Stack.Screen key="biometric" name="biometric" options={{ title: 'Biometric Verification' }} />,
        ]
      )}
    </Stack>
  );
}