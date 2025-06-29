// app/ssn.tsx (El código permanece igual que en el mensaje anterior, no necesita más cambios)

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
  // Alert, // Eliminado para simplificar
  // ActivityIndicator, // Eliminado para simplificar
} from 'react-native';

import { globalStyles } from '@/constants/AppStyles';

export default function SsnScreen() {
  const [ssn, setSsn] = useState('');
  const isSsnValid = ssn.length === 4;

  const handleContinue = () => {
    if (isSsnValid) {
      router.push('/dob');
    }
  };

  const IOS_HEADER_HEIGHT = 64;

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? IOS_HEADER_HEIGHT : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.authScreenContentContainer, styles.containerOverrides]}>
            
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>2/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '50%' }]} />
              </View>
            </View>
            {/* Icono de seguridad */}
            <IconSymbol name="shield.fill" size={150} color={Colors.brand.lightBlue} />
            
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
              onPress={handleContinue}>
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
            </TouchableOpacity>

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
    containerOverrides: {
        justifyContent: 'space-between',
        paddingTop: 10,
        paddingBottom: 40, // Espacio para el botón
        gap: 0,
    },
});