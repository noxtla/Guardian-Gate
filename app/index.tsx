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
  // Alert, // Eliminado para simplificar
  // ActivityIndicator, // Eliminado para simplificar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
// import { AuthService } from '@/services/authService'; // Eliminado para simplificar

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  // --- CAMBIO CLAVE ---: isPhoneValid siempre true
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  const [isInputVisible, setIsInputVisible] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // Eliminado para simplificar

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
    // Para desarrollo, siempre considera válido después de un mínimo
    setIsPhoneValid(number.replace(/\D/g, '').length >= 10);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    // setIsPhoneValid(isValid); // No es necesario si se sobrescribe
  }, []);

  // --- CAMBIO CLAVE ---: Función simplificada para navegación directa
  const handleContinue = () => {
    // Si el input no está visible, lo hace visible. Si ya lo está, navega.
    if (!isInputVisible) {
      setIsInputVisible(true);
    } else {
      router.push('/otc');
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
                      // --- CAMBIO CLAVE ---: disabled siempre false (excepto si el número es muy corto)
                      !isPhoneValid && globalStyles.disabledButton,
                    ]}
                    disabled={!isPhoneValid} // Todavía respeta la longitud mínima visualmente
                    onPress={handleContinue}> {/* Llama a la función simplificada */}
                    {/* {isLoading ? ( // Eliminado para simplificar
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : ( */}
                      <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
                    {/* )} */}
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={globalStyles.primaryButton}
                  onPress={handleContinue}> {/* Llama a la función simplificada */}
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