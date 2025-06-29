// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  // Este es un layout muy simple. Si funciona, podemos
  // re-introducir la lógica de AuthProvider y los estilos después.
  return (
    <SafeAreaProvider>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Guardian Gate' }} />
        <Stack.Screen name="otc" options={{ title: 'Enter Code' }} />
        <Stack.Screen name="ssn" options={{ title: 'Enter your SSN' }} />
        <Stack.Screen name="dob" options={{ title: 'Date of Birth' }} />
        <Stack.Screen name="year" options={{ title: 'Year of Birth' }} />
        <Stack.Screen name="biometric" options={{ title: 'Biometric Verification' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}