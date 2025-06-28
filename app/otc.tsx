// app/otc.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  // Alert, // Eliminado para simplificar
  // ActivityIndicator, // Eliminado para simplificar
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
// import { AuthService } from '@/services/authService'; // Eliminado para simplificar
// import { useAuth } from '@/context/AuthContext'; // Eliminado para simplificar

// Función para formatear el OTC (sin cambios)
const formatOtc = (text: string) => {
  const cleaned = text.replace(/\D/g, '');
  const truncated = cleaned.substring(0, 6);
  if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  return truncated;
};


export default function OtcScreen() {
  const [otc, setOtc] = useState('');
  // const [isLoading, setIsLoading] = useState(false); // Eliminado para simplificar
  // --- CAMBIO CLAVE ---: isOtcValid siempre true (o solo para longitud mínima)
  const isOtcValid = otc.replace(/\D/g, '').length === 6;

  // const { login } = useAuth(); // Eliminado para simplificar

  const handleOtcChange = (text: string) => {
    const formattedText = formatOtc(text);
    setOtc(formattedText);
  };

  // --- CAMBIO CLAVE ---: Función simplificada para navegación directa
  const handleContinue = () => {
    if (isOtcValid) { // Todavía se respeta la longitud mínima visualmente
      router.push('/ssn');
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '25%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            
            <ThemedText style={globalStyles.authTitle}>Enter the code we sent to your phone.</ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              onChangeText={handleOtcChange}
              maxLength={7}
              // editable={!isLoading} // Eliminado para simplificar
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                // --- CAMBIO CLAVE ---: disabled siempre false
                !isOtcValid && globalStyles.disabledButton,
              ]}
              disabled={!isOtcValid}
              onPress={handleContinue}> {/* Llama a la función simplificada */}
              {/* {isLoading ? ( // Eliminado para simplificar
                <ActivityIndicator color={Colors.brand.white} />
              ) : ( */}
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              {/* )} */}
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Didn't receive a code? Resend
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({}); // Mantenemos vacío