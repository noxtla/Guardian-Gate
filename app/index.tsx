// app/index.tsx

import React, { useState, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PhoneInput from '@/components/PhoneInput';

// --- CAMBIO CLAVE: Importar estilos globales ---
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
      <View style={globalStyles.contentContainer}>
        <IconSymbol name="shield.fill" size={150} color="#0089C4" />

        <View style={styles.inputContainer}>
          {isInputVisible ? (
            <>
              <PhoneInput
                onPhoneNumberChange={handlePhoneNumberChange}
                onValidationChange={handleValidationChange}
              />
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton, // Usar estilo global
                  !isPhoneValid && globalStyles.disabledButton, // Usar estilo global
                ]}
                disabled={!isPhoneValid}
                onPress={() => router.push('/ssn')}>
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={globalStyles.primaryButton} // Usar estilo global
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
    </SafeAreaView>
  );
}

// --- CAMBIO CLAVE: Solo estilos específicos de esta pantalla ---
const styles = StyleSheet.create({
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    gap: 20,
  },
});