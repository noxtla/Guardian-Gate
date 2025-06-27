// app/ssn.tsx

import { ThemedText } from '@/components/ThemedText';
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
  View,
  Text,
} from 'react-native';

import { globalStyles } from '@/constants/AppStyles';

export default function SsnScreen() {
  const [ssn, setSsn] = useState('');
  const isSsnValid = ssn.length === 4;

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      {/* --- CAMBIO CLAVE: KeyboardAvoidingView envuelve todo el contenido --- */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* --- CAMBIO CLAVE: El View principal ahora usa flexbox para empujar el contenido --- */}
          <View style={[globalStyles.contentContainer, styles.container]}>
            
            {/* Se agrupa la parte superior para un mejor control del layout */}
            <View style={styles.topContent}>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>2/4</Text>
                <View style={styles.progressBarBackground}>
                  <View style={[styles.progressBarFill, { width: '50%' }]} />
                </View>
              </View>
              <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />
            </View>
            
            {/* Se agrupan los inputs y el botón */}
            <View style={styles.mainContent}>
              <TextInput
                style={globalStyles.textInput}
                placeholder="Last 4 of SSN"
                placeholderTextColor={Colors.brand.gray}
                keyboardType="number-pad"
                value={ssn}
                onChangeText={setSsn}
                maxLength={4}
                secureTextEntry
              />
              <TouchableOpacity
                style={[
                  globalStyles.primaryButton,
                  !isSsnValid && globalStyles.disabledButton,
                ]}
                disabled={!isSsnValid}
                onPress={() => router.push('/dob')}>
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              </TouchableOpacity>
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
    container: {
        // --- CAMBIO CLAVE: justifyContent: 'space-between' para el layout adaptable al teclado ---
        justifyContent: 'space-between',
        paddingHorizontal: 20, // Se ajusta el padding
        paddingVertical: 10,
    },
    topContent: {
      width: '100%',
      alignItems: 'center',
    },
    mainContent: {
      width: '100%',
      alignItems: 'center',
      gap: 20, // Espacio entre el input y el botón
    },
    progressContainer: {
        width: '100%',
        marginBottom: 24,
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
});