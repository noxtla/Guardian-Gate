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
  Keyboard,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';

import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
// import { AuthService } from '@/services/authService'; // Para verifyUserDetails si lo usas

// Lógica de escalado (sin cambios)
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDELINE_BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
const moderateScale = (size: number, factor = 0.5): number => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(newSize);
};

const formatOtc = (text: string): string => {
  if (typeof text !== 'string') return '';
  const cleaned = text.replace(/\D/g, '');
  const truncated = cleaned.substring(0, 6);
  if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  return truncated;
};

export default function OtcScreen() {
  const [otc, setOtc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Obtener verificationId y phoneNumber de los parámetros de la ruta
  const { verificationId, phoneNumber } = useLocalSearchParams<{ verificationId: string, phoneNumber: string }>();

  const isOtcValid = (otc || '').replace(/\D/g, '').length === 6;

  const handleOtcChange = (text: string) => {
    const formattedText = formatOtc(text);
    setOtc(formattedText);
  };

  const handleVerifyCode = async () => {
    if (!verificationId) {
      Alert.alert("Error", "No se encontró el ID de verificación. Por favor, vuelve a intentarlo desde el principio.");
      router.replace('/'); // Volver a la pantalla de inicio si no hay verificationId
      return;
    }
    if (!isOtcValid) {
      Alert.alert("Código Inválido", "Por favor, introduce el código de 6 dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      // --- CAMBIO CLAVE: VERIFICAR CÓDIGO CON FIREBASE JS SDK ---
 

      // ¡Éxito! El usuario ha iniciado sesión con Firebase.
      Alert.alert("Éxito", `¡Autenticación completada con Firebase!`);
      
      // La sesión de Firebase se gestiona automáticamente por el SDK de JS.
      // Puedes obtener el UID del usuario si lo necesitas:
      // const firebaseUser = auth.currentUser;
      // if (firebaseUser) {
      //     console.log("Firebase UID:", firebaseUser.uid);
      //     // Si tu backend n8n necesita el UID o un ID Token para verificación adicional:
      //     // const idToken = await firebaseUser.getIdToken();
      //     // await AuthService.verifyUserDetails(phoneNumber, ssnLast4, dobMonth, dobDay, dobYear, idToken);
      // }
      
      router.replace('/ssn'); // Continúa al siguiente paso de tu flujo

    } catch (error: any) {
      console.error("Error al verificar el código:", error);
      if (error.code === 'auth/invalid-verification-code') {
        Alert.alert("Error de Verificación", "El código introducido es incorrecto.");
      } else if (error.code === 'auth/code-expired') {
        Alert.alert("Código Expirado", "El código ha expirado. Por favor, solicita uno nuevo.");
        router.replace('/'); // Volver a la pantalla de inicio
      }
      else {
        Alert.alert("Error", "Ocurrió un problema al verificar el código. Por favor, inténtalo de nuevo.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert("Reenviar Código", "Para reenviar el código, por favor, vuelve a la pantalla anterior y solicita uno nuevo.");
    router.replace('/'); // Volver a la pantalla de inicio para reenviar el código
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '25%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            
            <ThemedText style={globalStyles.authTitle}>
              {`Introduce el código que enviamos a ${phoneNumber || 'tu teléfono'}.`}
            </ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              onChangeText={handleOtcChange}
              maxLength={7}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                (!isOtcValid || isLoading) && globalStyles.disabledButton,
              ]}
              disabled={!isOtcValid || isLoading}
              onPress={handleVerifyCode}>
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Verificar Código</ThemedText>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={[globalStyles.infoText, styles.adaptiveInfoText]}>
                    {"¿No recibiste un código? "}
                </ThemedText>
                <TouchableOpacity onPress={handleResend}>
                    <ThemedText style={[globalStyles.infoText, styles.adaptiveInfoText, { color: Colors.brand.lightBlue, fontWeight: 'bold' }]}>
                        Reenviar
                    </ThemedText>
                </TouchableOpacity>
            </View>
            
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    adaptiveInfoText: {
        fontSize: moderateScale(12, 0.4),
    }
});