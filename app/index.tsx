// app/index.tsx

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  // --- CAMBIO CLAVE: Importar componentes para manejar el teclado ---
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const handlePhoneNumberChange = useCallback((number: string) => {
    setPhoneNumber(number);
  }, []);

  const handleValidationChange = useCallback((isValid: boolean) => {
    setIsPhoneValid(isValid);
  }, []);

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer} edges={['bottom']}>
      {/* --- CAMBIO CLAVE: Envolver todo en KeyboardAvoidingView --- */}
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
                    disabled={!isPhoneValid}
                    onPress={() => router.push('/ssn')}>
                    <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
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
    // Usar 'space-between' para empujar el footer hacia abajo.
    justifyContent: 'space-between',
    paddingBottom: 20, // Un poco de espacio extra en la parte inferior.
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    gap: 20,
  },
});