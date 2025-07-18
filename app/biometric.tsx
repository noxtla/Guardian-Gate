// app/biometric.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import {
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator, // Re-enabled for loading state
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext'; // Re-enabled to access login
import { useState } from 'react'; // Re-enabled for loading state

export default function BiometricScreen() {
  const { login } = useAuth(); // Get the login function from our context
  const [isLoading, setIsLoading] = useState(false);

  // --- CORRECTED LOGIC ---
  // This function now updates the global auth state before navigating.
  const handleConfirm = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      // 1. Log the user in. This updates AuthContext, setting isAuthenticated = true.
      // The root layout will react to this change, replacing the login stack
      // with the authenticated stack.
      await login('dummy-manual-login-token', 'manual-user-123', true);

      // 2. Now that the stack is correct, replace the current screen.
      // This will land on the "(tabs)" screen, which is now the root.
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Failed to complete the login process:', error);
      // Optionally show an alert to the user here
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ThemedView style={globalStyles.contentContainer}>
            <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />

            <ThemedText style={{fontSize: 22, color: Colors.brand.white, textAlign: 'center', fontWeight: '600'}}>
                Final Step: Biometric Verification
            </ThemedText>

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                isLoading && globalStyles.disabledButton, // Visually disable when loading
              ]}
              onPress={handleConfirm}
              disabled={isLoading} // Functionally disable when loading
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Verify Identity</ThemedText>
              )}
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              This helps us keep your account secure.
            </ThemedText>
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
