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
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import PhoneInput from '@/components/PhoneInput'; // Asegúrate de que este componente acepte 10 dígitos
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { apiClient } from '@/services/apiClient';

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // El usuario solo escribe el número, ej: "5551234567"
  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    // La validación del componente PhoneInput ahora solo necesita verificar
    // que sean 10 dígitos numéricos.
    setIsPhoneValid(isValid);
  }, []);

  // --- LÓGICA DE LA API ACTUALIZADA ---
  const handleContinue = async () => {
    if (!isInputVisible) {
      setIsInputVisible(true);
      return;
    }

    if (!isPhoneValid || isLoading) return;

    setIsLoading(true);

    // --- CAMBIO CLAVE: Normalización del número de teléfono ---
    // 1. Limpiamos cualquier caracter no numérico (paréntesis, guiones, etc.).
    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    
    // 2. Verificamos si tiene 10 dígitos (estándar de EE.UU. sin código de país).
    if (cleanedNumber.length !== 10) {
      Alert.alert('Número Inválido', 'Por favor, introduce un número de teléfono válido de 10 dígitos.');
      setIsLoading(false);
      return;
    }

    // 3. Creamos el número en formato E.164 añadiendo el prefijo de EE.UU.
    const fullPhoneNumber = `+1${cleanedNumber}`;
    // --------------------------------------------------------

    try {
      const response = await apiClient<{ isValid: boolean }>('', {
        method: 'POST',
        // Enviamos el número ya formateado al backend
        body: { phoneNumber: fullPhoneNumber }, 
      });

      if (response.isValid) {
        Alert.alert('Éxito', 'Número de teléfono validado correctamente.');
        router.push('/otc');
      } else {
        Alert.alert('Número no reconocido', 'El número de teléfono introducido no está registrado.');
      }
    } catch (error: any) {
      console.error('Error al validar el número de teléfono:', error);
      Alert.alert('Error', `No se pudo verificar el número. Por favor, inténtalo de nuevo.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.contentContainer, styles.containerPadding]}>
            <FontAwesome6 name="user-shield" size={150} color={Colors.brand.lightBlue} />

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
                      (!isPhoneValid || isLoading) && globalStyles.disabledButton,
                    ]}
                    disabled={!isPhoneValid || isLoading}
                    onPress={handleContinue}>
                    {isLoading ? (
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : (
                      <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={globalStyles.primaryButton}
                  onPress={handleContinue}>
                  <ThemedText style={globalStyles.primaryButtonText}>
                    Enter your phone number
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <ThemedText style={globalStyles.infoText}>
              {'For currently active employees only.\nAny fraudulent activity will be penalized.'}
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