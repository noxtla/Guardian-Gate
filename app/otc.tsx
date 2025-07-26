// app/otc.tsx
import React, { useState } from 'react';
import {
  Alert,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

const SIMULATED_OTP = '555555';
const MAX_ATTEMPTS = 3;

export default function OtcScreen() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [otc, setOtc] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // Para simular re-envío

  const formatOtc = (text: string) => text.replace(/\D/g, '').substring(0, 6).replace(/(\d{3})(?=\d)/, '$1-');
  const enteredOtp = otc.replace(/-/g, '');
  const isOtcValid = enteredOtp.length === 6;

  const handleContinue = () => {
    if (!isOtcValid) return;

    if (enteredOtp === SIMULATED_OTP) {
      router.push({ pathname: '/dob', params: { phone } });
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        Alert.alert('Error', 'Demasiados intentos incorrectos. Por favor, inténtelo más tarde.');
        // Aquí se podría implementar la lógica de bloqueo de 15 min.
      } else {
        Alert.alert('Código Incorrecto', `Por favor, inténtelo de nuevo. Le quedan ${MAX_ATTEMPTS - newAttempts} intentos.`);
      }
    }
  };

  const handleResend = () => {
    setIsLoading(true);
    // Simular una pequeña espera
    setTimeout(() => {
      Alert.alert('Código Reenviado', 'Se ha reenviado un nuevo código (sigue siendo 555-555).');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/3</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '33%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            <ThemedText style={globalStyles.authTitle}>
              Ingrese el código que enviamos a su teléfono.
            </ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              onChangeText={(text) => setOtc(formatOtc(text))}
              maxLength={7}
            />

            <TouchableOpacity
              style={[globalStyles.primaryButton, !isOtcValid && globalStyles.disabledButton]}
              disabled={!isOtcValid}
              onPress={handleContinue}>
              <ThemedText style={globalStyles.primaryButtonText}>Continuar</ThemedText>
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={globalStyles.infoText}>¿No recibió un código? </ThemedText>
                <TouchableOpacity onPress={handleResend} disabled={isLoading}>
                    <ThemedText style={[globalStyles.infoText, { color: Colors.brand.lightBlue, fontWeight: 'bold' }]}>
                        {isLoading ? <ActivityIndicator size="small" color={Colors.brand.lightBlue} /> : 'Reenviar'}
                    </ThemedText>
                </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}