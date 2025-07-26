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
  Alert, // <-- IMPORTANTE: Necesitamos Alert para los errores
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { AuthService } from '@/services/authService'; // <-- IMPORTANTE: Descomentar o añadir esta línea
import { useAuth } from '@/context/AuthContext'; 

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingFaceId, setIsLoadingFaceId] = useState(false); 

  const { login } = useAuth(); 

  const handlePhoneNumberChange = useCallback((number: string) => {
    // Asumimos que el PhoneInput devuelve el número en formato internacional E.164
    setPhoneNumber(number);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsPhoneValid(isValid);
  }, []);

  // --- LÓGICA MODIFICADA ---
  const handleContinue = async () => {
    // Primer click: solo muestra el campo de texto.
    if (!isInputVisible) {
      setIsInputVisible(true);
      return;
    }

    // Segundo click (con el campo visible): inicia la verificación.
    if (!isPhoneValid || isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);
    
    try {
      // 1. LLAMADA AL BACKEND REAL
      const userFound = await AuthService.checkPhoneNumber(phoneNumber);

      // 2. MANEJO DE LA RESPUESTA
      if (userFound) {
        // El usuario existe y está activo. Ahora podemos proceder.
        // En un futuro, aquí llamaríamos a AuthService.sendOtp(phoneNumber)
        console.log('User found. Simulating sending OTP to:', phoneNumber);
        // Por ahora, navegamos a la pantalla de OTC como lo tenías.
        // Pasamos el número como parámetro para usarlo en la siguiente pantalla.
        router.push({ pathname: '/otc', params: { phone: phoneNumber } });
      } else {
        // El usuario no existe o no está activo. Mostramos un error claro.
        Alert.alert(
          'Acceso Denegado',
          'El número de teléfono no está registrado o no se encuentra activo. Por favor, contacte a un administrador.'
        );
      }
    } catch (error: any) {
      // Si la llamada al backend falla (red, error 500), mostramos el error.
      Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    // Esta lógica de Face ID se mantiene igual por ahora.
    console.log('Attempting FaceId login...');
    setIsLoadingFaceId(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login('dummy-faceid-token', 'faceid-user-123', true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during FaceId login:', error);
    } finally {
      setIsLoadingFaceId(false);
    }
  };

  // El resto de tu componente (el return) es perfecto y no necesita cambios.
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
                <>
                  <TouchableOpacity
                    style={globalStyles.primaryButton}
                    onPress={handleContinue}>
                    <ThemedText style={globalStyles.primaryButtonText}>
                      Enter your phone number
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      globalStyles.primaryButton,
                      isLoadingFaceId && globalStyles.disabledButton,
                    ]}
                    disabled={isLoadingFaceId}
                    onPress={handleFaceIdLogin}
                  >
                    {isLoadingFaceId ? (
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : (
                      <ThemedText style={globalStyles.primaryButtonText}>
                        Enter with FaceId
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </>
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