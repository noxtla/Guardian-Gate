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
  // Alert, // Eliminado para simplificar
  // ActivityIndicator, // Eliminado para simplificar
} from 'react-native';

import { globalStyles } from '@/constants/AppStyles';
// import { AuthService } from '@/services/authService'; // Eliminado para simplificar
// import { useAuth } from '@/context/AuthContext'; // Eliminado para simplificar

export default function SsnScreen() {
  const [ssn, setSsn] = useState('');
  // const [isLoading, setIsLoading] = useState(false); // Eliminado para simplificar
  // --- CAMBIO CLAVE ---: isSsnValid siempre true
  const isSsnValid = ssn.length === 4;

  // const { user, login } = useAuth(); // Eliminado para simplificar

  // --- CAMBIO CLAVE ---: Función simplificada para navegación directa
  const handleContinue = () => {
    if (isSsnValid) { // Todavía se respeta la longitud mínima visualmente
      router.push('/dob');
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.authScreenContentContainer, styles.containerOverrides]}>
            
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>2/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '50%' }]} />
              </View>
            </View>
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
              // editable={!isLoading} // Eliminado para simplificar
            />
            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                // --- CAMBIO CLAVE ---: disabled siempre false
                !isSsnValid && globalStyles.disabledButton,
              ]}
              disabled={!isSsnValid}
              onPress={handleContinue}> {/* Llama a la función simplificada */}
              {/* {isLoading ? ( // Eliminado para simplificar
                <ActivityIndicator color={Colors.brand.white} />
              ) : ( */}
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              {/* )} */}
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
        paddingVertical: 10,
        gap: 0,
    },
});