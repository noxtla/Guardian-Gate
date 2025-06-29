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
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { apiClient } from '@/services/apiClient';

export default function GuardianGateScreen() {
  console.log(">>>>>> RENDERIZANDO CÓDIGO CORRECTO EN APP/INDEX.TSX <<<<<<");

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsPhoneValid(isValid);
  }, []);

  const handleContinue = async () => {
    if (!isInputVisible) {
      setIsInputVisible(true);
      return;
    }

    if (!isPhoneValid || isLoading) return;

    setIsLoading(true);

    const cleanedNumber = phoneNumber.replace(/\D/g, '');
    if (cleanedNumber.length !== 10) {
      Alert.alert('Número Inválido', 'Por favor, introduce un número de teléfono válido de 10 dígitos.');
      setIsLoading(false);
      return;
    }
    const fullPhoneNumber = `+1${cleanedNumber}`;

    console.log(`[API CALL] Intentando validar el número: ${fullPhoneNumber}`);

    try {
      const response = await apiClient<{ isValid: boolean }>('', {
        method: 'POST',
        body: { phoneNumber: fullPhoneNumber }, 
      });

      console.log(`[API RESPONSE] Respuesta del servidor:`, response);

      if (response.isValid) {
        Alert.alert('Éxito', 'Número de teléfono validado correctamente.');
        router.push('/otc');
      } else {
        Alert.alert('Número no reconocido', 'El número de teléfono introducido no está registrado.');
      }
    } catch (error: any) {
      console.error('[API ERROR] Error al validar el número de teléfono:', error);
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