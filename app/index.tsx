// app/index.tsx

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
// --- CAMBIO CLAVE: Importar SafeAreaView de la librería correcta ---
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';

const { height } = Dimensions.get('window');
const isSmallDevice = height < 700;

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
    // --- Esta línea ahora es válida porque estamos usando la SafeAreaView correcta ---
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        <ThemedText style={styles.header}>Guardian Gate</ThemedText>

        <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />

        <View style={styles.inputContainer}>
          {isInputVisible ? (
            <>
              <PhoneInput
                onPhoneNumberChange={handlePhoneNumberChange}
                onValidationChange={handleValidationChange}
              />
              <TouchableOpacity
                style={[styles.button, !isPhoneValid && styles.buttonDisabled]}
                disabled={!isPhoneValid}
                onPress={() => router.push('/ssn')}>
                <ThemedText style={styles.buttonText}>Continue</ThemedText>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={styles.button}
              onPress={() => setIsInputVisible(true)}
            >
              <ThemedText style={styles.buttonText}>Enter your phone number</ThemedText>
            </TouchableOpacity>
          )}
        </View>

        <ThemedText style={styles.footerText}>
          For currently active employees only.{'\n'}Any fraudulent activity will be penalized.
        </ThemedText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.brand.darkBlue,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 30,
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.brand.white,
    marginTop: Platform.OS === 'android' ? 20 : (isSmallDevice ? 10 : 40),
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: Colors.brand.lightBlue,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonDisabled: {
    backgroundColor: Colors.brand.darkGray,
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.brand.white,
    fontSize: 18,
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: Colors.brand.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
});