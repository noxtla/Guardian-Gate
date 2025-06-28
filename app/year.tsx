// app/year.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
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
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
// import { AuthService } from '@/services/authService'; // Eliminado para simplificar
// import { useAuth } from '@/context/AuthContext'; // Eliminado para simplificar

export default function YearScreen() {
  const [year, setYear] = useState('2000'); // --- CAMBIO CLAVE ---: Valor por defecto
  // const [isLoading, setIsLoading] = useState(false); // Eliminado para simplificar
  // --- CAMBIO CLAVE ---: isYearValid siempre true
  const isYearValid = year.length === 4;

  // const { user, login } = useAuth(); // Eliminado para simplificar

  // --- CAMBIO CLAVE ---: Función simplificada para navegación directa
  const handleContinue = () => {
    if (isYearValid) { // Todavía se respeta la longitud mínima visualmente
      router.push('/biometric');
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>4/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '100%' }]} />
              </View>
            </View>

            <IconSymbol name="paperplane.fill" size={150} color={Colors.brand.lightBlue} />

            <TextInput
              style={globalStyles.textInput}
              placeholder="YYYY"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={year}
              onChangeText={setYear}
              maxLength={4}
              // editable={!isLoading} // Eliminado para simplificar
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                // --- CAMBIO CLAVE ---: disabled siempre false
                !isYearValid && globalStyles.disabledButton,
              ]}
              disabled={!isYearValid}
              onPress={handleContinue} // Llama a la función simplificada
            >
              {/* {isLoading ? ( // Eliminado para simplificar
                <ActivityIndicator color={Colors.brand.white} />
              ) : ( */}
                <ThemedText style={globalStyles.primaryButtonText}>Confirm</ThemedText>
              {/* )} */}
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Please enter your four-digit year of birth to complete verification.
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between',
    },
});