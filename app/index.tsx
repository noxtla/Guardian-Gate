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
import { useAuth } from '@/context/AuthContext'; // Import useAuth

export default function GuardianGateScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For phone number 'Continue' button
  const [isLoadingFaceId, setIsLoadingFaceId] = useState(false); // For FaceId button

  const { login } = useAuth(); // Destructure login from useAuth

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
      console.log('Simulating sending OTP to:', phoneNumber);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/otc');
    } catch (error) {
      // Alert.alert('Error', 'Could not send the code. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    console.log('Attempting FaceId login...');
    setIsLoadingFaceId(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay
      await login('dummy-faceid-token', 'faceid-user-123', true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during FaceId login:', error);
    } finally {
      setIsLoadingFaceId(false);
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
                <>
                  <TouchableOpacity
                    style={globalStyles.primaryButton}
                    onPress={handleContinue}>
                    <ThemedText style={globalStyles.primaryButtonText}>
                      Enter your phone number
                    </ThemedText>
                  </TouchableOpacity>

                  {/* Button for FaceId login */}
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
