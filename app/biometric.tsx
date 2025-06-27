// app/biometric.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import {
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function BiometricScreen() {

  const handleConfirm = () => {
    Alert.alert(
      "Registration Complete",
      "Your identity has been successfully verified.",
      [{ text: "OK" }]
    );
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
              style={globalStyles.primaryButton}
              onPress={handleConfirm}
            >
              <ThemedText style={globalStyles.primaryButtonText}>Verify Identity</ThemedText>
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