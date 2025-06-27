// app/otc.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

// --- CAMBIO CLAVE: Función para formatear el OTC ---
const formatOtc = (text: string) => {
  // 1. Eliminar todos los caracteres que no sean dígitos
  const cleaned = text.replace(/\D/g, '');
  // 2. Limitar a 6 dígitos
  const truncated = cleaned.substring(0, 6);
  // 3. Añadir el guion si hay más de 3 dígitos
  if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  // 4. Devolver el número (parcialmente) formateado
  return truncated;
};


export default function OtcScreen() {
  const [otc, setOtc] = useState('');
  // --- CAMBIO CLAVE: La validación ahora ignora el guion ---
  const isOtcValid = otc.replace(/\D/g, '').length === 6;

  const handleOtcChange = (text: string) => {
    const formattedText = formatOtc(text);
    setOtc(formattedText);
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>1/4</Text>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: '25%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            
            <ThemedText style={styles.title}>Enter the code we sent to your phone.</ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456" // Placeholder actualizado
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              // --- CAMBIO CLAVE: Usar el nuevo manejador de cambio ---
              onChangeText={handleOtcChange}
              // --- CAMBIO CLAVE: Aumentar la longitud máxima a 7 (6 dígitos + 1 guion) ---
              maxLength={7}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                !isOtcValid && globalStyles.disabledButton,
              ]}
              disabled={!isOtcValid}
              onPress={() => router.push('/ssn')}>
              <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Didn't receive a code? Resend
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
    gap: 25,
  },
  progressContainer: {
    width: '100%',
  },
  progressText: {
    alignSelf: 'flex-end',
    color: Colors.brand.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 8,
    width: '100%',
    backgroundColor: Colors.brand.darkGray,
    borderRadius: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.brand.lightBlue,
    borderRadius: 4,
  },
  title: {
    fontSize: 22,
    color: Colors.brand.white,
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: '90%', 
  },
});