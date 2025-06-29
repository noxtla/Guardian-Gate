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
  // Alert, // Eliminado para simplificar
  // ActivityIndicator, // Eliminado para simplificar
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
// import * as LocalAuthentication from 'expo-local-authentication'; // Eliminado para simplificar
// import { AuthService } from '@/services/authService'; // Eliminado para simplificar
// import { useAuth } from '@/context/AuthContext'; // Eliminado para simplificar
// import { useState } from 'react'; // Eliminado para simplificar

export default function BiometricScreen() {
  // const { user, updateBiometricsStatus } = useAuth(); // Eliminado para simplificar
  // const [isLoading, setIsLoading] = useState(false); // Eliminado para simplificar

  // --- CAMBIO CLAVE ---: Función simplificada para navegación directa a tabs
  const handleConfirm = () => {
    router.replace('/(tabs)'); // Directamente a las tabs
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
              onPress={handleConfirm} // Llama a la función simplificada
              // disabled={isLoading} // Eliminado para simplificar
            >
              {/* {isLoading ? ( // Eliminado para simplificar
                <ActivityIndicator color={Colors.brand.white} />
              ) : ( */}
                <ThemedText style={globalStyles.primaryButtonText}>Verify Identity</ThemedText>
              {/* )} */}
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