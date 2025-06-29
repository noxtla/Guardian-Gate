// app/otc.tsx
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { PhoneAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

export default function OtcScreen() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { verificationId, phoneNumber } = useLocalSearchParams<{ verificationId: string, phoneNumber: string }>();

  const handleVerifyCode = async () => {
    if (!verificationId) {
      Alert.alert("Error", "No se encontró el ID de verificación. Por favor, vuelve a intentarlo.");
      return;
    }
    if (code.length < 6) {
      Alert.alert("Código Inválido", "Por favor, introduce el código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const credential = PhoneAuthProvider.credential(verificationId, code);
      await signInWithCredential(auth, credential);

      // ¡Éxito! El usuario ha iniciado sesión.
      Alert.alert("Éxito", `¡Autenticación completada!`);
      
      router.replace('/ssn');

    } catch (error: any) {
      console.error("Error al verificar el código:", error);
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert("Error de Verificación", "El código introducido es incorrecto.");
      } else {
        Alert.alert("Error", "Ocurrió un problema al verificar el código. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/4</Text>
              <View style={globalStyles.authProgressBarBackground}><View style={[globalStyles.authProgressBarFill, { width: '25%' }]} /></View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            <ThemedText style={globalStyles.authTitle}>
              {`Introduce el código que enviamos a ${phoneNumber}`}
            </ThemedText>
            
            <TextInput
              style={globalStyles.textInput}
              placeholder="123456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[globalStyles.primaryButton, (code.length < 6 || isLoading) && globalStyles.disabledButton]}
              disabled={code.length < 6 || isLoading}
              onPress={handleVerifyCode}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Verificar Código</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}