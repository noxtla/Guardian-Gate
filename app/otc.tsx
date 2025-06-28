// app/otc.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet, // Todavía necesitamos StyleSheet para estilos locales si los hubiera
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles'; // Importa globalStyles
import { IconSymbol } from '@/components/ui/IconSymbol';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';

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
  const [isLoading, setIsLoading] = useState(false);
  const isOtcValid = otc.replace(/\D/g, '').length === 6;

  const { login } = useAuth();

  const handleOtcChange = (text: string) => {
    const formattedText = formatOtc(text);
    setOtc(formattedText);
  };

  const handleVerifyOtc = async () => {
    if (!isOtcValid) {
      Alert.alert('Error', 'Por favor, introduce un código OTP de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    try {
      const dummyPhoneNumber = "5551234567"; // ¡¡¡REEMPLAZA ESTO CON EL NÚMERO REAL DEL USUARIO!!!

      const { token, userId, hasBiometricsEnabled } = await AuthService.verifyOtp(dummyPhoneNumber, otc.replace(/\D/g, ''));
      
      await login(token, userId, hasBiometricsEnabled);

      if (hasBiometricsEnabled) {
        router.replace('/(tabs)');
      } else {
        router.push('/ssn');
      }

    } catch (error: any) {
      console.error('Error al verificar OTP:', error);
      Alert.alert('Error de Verificación', error.message || 'El código OTP es incorrecto o ha expirado. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* AHORA USAMOS LOS ESTILOS GLOBALES */}
          <View style={globalStyles.authScreenContentContainer}>
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '25%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            
            <ThemedText style={globalStyles.authTitle}>Enter the code we sent to your phone.</ThemedText> {/* Usa authTitle */}

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              onChangeText={handleOtcChange}
              maxLength={7}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                !isOtcValid && globalStyles.disabledButton,
              ]}
              disabled={!isOtcValid || isLoading}
              onPress={handleVerifyOtc}>
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              )}
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

// ELIMINAMOS LOS ESTILOS DUPLICADOS LOCALES
const styles = StyleSheet.create({
  // Si hubiera estilos ÚNICOS de esta pantalla, irían aquí.
  // Por ejemplo, si container tuviera un padding muy específico que no se compartiera.
  // Pero como los hemos generalizado, este objeto puede estar vacío o eliminarse si no es necesario.
});