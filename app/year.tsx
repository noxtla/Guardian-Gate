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
  Alert, // NUEVO: Para feedback de usuario
  ActivityIndicator, // NUEVO: Para estado de carga
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles'; // Importa globalStyles
import { IconSymbol } from '@/components/ui/IconSymbol';
import { router } from 'expo-router';
import { AuthService } from '@/services/authService'; // NUEVO: Importa el servicio de autenticación
import { useAuth } from '@/context/AuthContext'; // NUEVO: Importa el hook useAuth


export default function YearScreen() {
  const [year, setYear] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NUEVO: Estado de carga
  const isYearValid = year.length === 4;

  const { user, login } = useAuth(); // Accede a user y login del contexto

  // NUEVA FUNCIÓN: Manejador para verificar el año de nacimiento
  const handleVerifyYear = async () => {
    if (!isYearValid) {
      Alert.alert('Error', 'Por favor, introduce un año de nacimiento válido de 4 dígitos.');
      return;
    }

    if (!user || !user.userId) {
        Alert.alert('Error', 'Información de usuario no disponible. Por favor, reintenta el login.');
        router.replace('/'); // Redirige al inicio si no hay usuario en el contexto
        return;
    }

    setIsLoading(true); // Activa el estado de carga
    try {
        // **NOTA:** Necesitas el phoneNumber, ssnLast4, dobMonth, dobDay.
        // Estos datos deberían persistir de pantallas anteriores.
        // Para este ejemplo, usaremos placeholders. AJUSTA ESTO.
        const dummyPhoneNumber = "5551234567"; // ¡¡¡REEMPLAZA!!!
        const dummySsnLast4 = "1234"; // ¡¡¡REEMPLAZA!!!
        const dummyDobMonth = 1; // ¡¡¡REEMPLAZA!!!
        const dummyDobDay = 1; // ¡¡¡REEMPLAZA!!!

        // Llama a la función verifyUserDetails de AuthService con todos los datos
        // Reutilizamos verifyUserDetails porque es el mismo endpoint para SSN/DOB/Year
        // Tu n8n debería verificar todos estos datos en el mismo webhook.
        const { token, userId: updatedUserId, hasBiometricsEnabled } = await AuthService.verifyUserDetails(
            dummyPhoneNumber,
            dummySsnLast4,
            dummyDobMonth,
            dummyDobDay,
            parseInt(year, 10) // Asegúrate de enviar el año como número
        );

        // Si la verificación es exitosa, actualiza el estado de autenticación global
        // y navega al siguiente paso (Biometric Verification).
        await login(token, updatedUserId, hasBiometricsEnabled);

        router.push('/biometric');

    } catch (error: any) {
      console.error('Error al verificar año de nacimiento:', error);
      Alert.alert('Error de Verificación', error.message || 'Los detalles no coinciden con nuestros registros. Intenta de nuevo.');
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
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
          {/* AHORA USAMOS LOS ESTILOS GLOBALES */}
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
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                !isYearValid && globalStyles.disabledButton,
              ]}
              disabled={!isYearValid || isLoading}
              onPress={handleVerifyYear} // Llama a la nueva función handleVerifyYear
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Confirm</ThemedText>
              )}
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

// ELIMINAMOS LOS ESTILOS DUPLICADOS LOCALES (si no son necesarios)
const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between', // Este estilo era específico de la versión anterior
    },
    // Si usaste authScreenContentContainer, es posible que no necesites sobrescribir nada aquí.
});