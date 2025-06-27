// app/ssn.tsx

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
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
} from 'react-native';

// --- CAMBIO CLAVE: Importar estilos globales ---
import { globalStyles } from '@/constants/AppStyles';

export default function SsnScreen() {
  const [ssn, setSsn] = useState('');

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ThemedView style={globalStyles.contentContainer}>
            <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />

            <TextInput
              style={globalStyles.textInput} // Usar estilo global
              placeholder="SSN"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={ssn}
              onChangeText={setSsn}
              maxLength={9}
            />

            <TouchableOpacity
              style={globalStyles.primaryButton} // Usar estilo global
              onPress={() => router.push('/dob')}>
              <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              For currently active employees only.{'\n'}Any fraudulent activity will be
              penalized.
            </ThemedText>
          </ThemedView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
// Ya no se necesita un StyleSheet local para esta pantalla