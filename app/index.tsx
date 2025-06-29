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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import PhoneInput from '@/components/PhoneInput';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
// import { AuthService } from '@/services/authService';

export default function GuardianGateScreen() {
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
    try {
      // await AuthService.sendOtp(phoneNumber);
      console.log('Simulando envío de OTP al número:', phoneNumber);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/otc');
    } catch (error) {
      // Alert.alert('Error', 'Could not send the code. Please try again.');
      console.error(error);
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

            {/* --- ESTA ES LA LÍNEA CORREGIDA --- */}
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