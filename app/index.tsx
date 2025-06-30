// app/index.tsx
import React, { useState, useCallback, useRef } from 'react';
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
import { apiClient } from '@/services/apiClient'; // Si lo usas para validación previa
// --- IMPORTACIONES DE FIREBASE PARA EXPO GO ---
import { PhoneAuthProvider } from 'firebase/auth';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha'; // Para el reCAPTCHA con Expo Go
// --- FIN IMPORTACIONES FIREBASE ---

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Referencia para el componente FirebaseRecaptchaVerifierModal
  const recaptchaVerifier = useRef(null);

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
    const fullPhoneNumber = `+1${cleanedNumber}`; // Asumiendo código de país +1 para EE.UU.

    try {
      // --- Opcional: Validación con tu backend n8n antes de enviar SMS ---
      // const validationResponse = await apiClient<{ isValid: boolean }>('', {
      //   method: 'POST',
      //   body: { action: "validate-phone-number", phoneNumber: fullPhoneNumber },
      // });
      // if (!validationResponse.isValid) {
      //   Alert.alert('Número no reconocido', 'El número de teléfono introducido no está registrado.');
      //   setIsLoading(false);
      //   return;
      // }


      // `recaptchaVerifier.current` es el objeto del componente `FirebaseRecaptchaVerifierModal`

      
      Alert.alert('Código enviado', 'Hemos enviado un código a tu número.');

      router.push({
        pathname: '/otc',
        params: { phoneNumber: fullPhoneNumber },
      });

    } catch (error: any) {
      console.error('Error al enviar el código de verificación:', error);
      Alert.alert('Error', `Ocurrió un error al enviar el código de verificación: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer} edges={['bottom']}>
      {/* Componente FirebaseRecaptchaVerifierModal (requerido para Firebase Phone Auth en Expo Go) */}
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        attemptInvisibleVerification={true} // Intenta la verificación invisible primero
      />
      
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