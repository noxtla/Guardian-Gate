// app/index.tsx

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,        // NUEVO: Para mostrar alertas al usuario
  ActivityIndicator, // NUEVO: Para mostrar un spinner de carga
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { AuthService } from '@/services/authService'; // NUEVO: Importa el servicio de autenticación

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // NUEVO: Estado de carga

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsPhoneValid(isValid);
  }, []);

  // NUEVA FUNCIÓN: Manejador para enviar el número de teléfono y solicitar OTP
  const handleSendOtp = async () => {
    if (!isPhoneValid) {
      Alert.alert('Error', 'Por favor, introduce un número de teléfono válido.');
      return;
    }

    setIsLoading(true); // Activa el estado de carga
    try {
      // Llama a la función sendOtp de AuthService
      await AuthService.sendOtp(phoneNumber);
      // Si es exitoso, navega a la pantalla de OTC
      router.push('/otc');
    } catch (error: any) {
      // Muestra una alerta si hay un error
      console.error('Error al enviar OTP:', error);
      Alert.alert('Error de Autenticación', error.message || 'No se pudo enviar el código OTP. Intenta de nuevo.');
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.contentContainer, styles.containerPadding]}>
            <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />

            <View style={styles.inputContainer}>
              {isInputVisible ? (
                <>
                  <PhoneInput
                    onPhoneNumberChange={handlePhoneNumberChange}
                    onValidationChange={handleValidationChange}
                  />
                  <TouchableOpacity
                    style={[
                      globalStyles.primaryButton,
                      !isPhoneValid && globalStyles.disabledButton,
                    ]}
                    disabled={!isPhoneValid || isLoading} // Deshabilita el botón también durante la carga
                    onPress={handleSendOtp}> {/* Llama a la nueva función handleSendOtp */}
                    {isLoading ? ( // Muestra un spinner si está cargando
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : (
                      <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={globalStyles.primaryButton}
                  onPress={() => setIsInputVisible(true)}>
                  <ThemedText style={globalStyles.primaryButtonText}>
                    Enter your phone number
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <ThemedText style={globalStyles.infoText}>
              For currently active employees only.{'\n'}Any fraudulent activity will be
              penalized.
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  containerPadding: {
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    gap: 20,
  },
});