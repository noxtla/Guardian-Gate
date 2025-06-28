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
  Alert, // NUEVO: Para feedback de usuario
  ActivityIndicator, // NUEVO: Para estado de carga
} from 'react-native';

import { globalStyles } from '@/constants/AppStyles'; // Importa globalStyles
import { AuthService } from '@/services/authService'; // NUEVO: Importa el servicio de autenticación
import { useAuth } from '@/context/AuthContext'; // NUEVO: Importa el hook useAuth

export default function SsnScreen() {
  const [ssn, setSsn] = useState('');
  const [isLoading, setIsLoading] = useState(false); // NUEVO: Estado de carga
  const isSsnValid = ssn.length === 4;

  const { user, login } = useAuth(); // Accede a user y login del contexto

  // NUEVA FUNCIÓN: Manejador para verificar el SSN
  const handleVerifySsn = async () => {
    if (!isSsnValid) {
      Alert.alert('Error', 'Por favor, introduce los últimos 4 dígitos válidos del SSN.');
      return;
    }

    if (!user || !user.userId) {
        Alert.alert('Error', 'Información de usuario no disponible. Por favor, reintenta el login.');
        router.replace('/'); // Redirige al inicio si no hay usuario en el contexto
        return;
    }

    setIsLoading(true); // Activa el estado de carga
    try {
        // **NOTA:** Necesitas el phoneNumber y userId. El userId debería venir del contexto.
        // El phoneNumber también debería persistir del paso anterior.
        // Para este ejemplo, usaremos un phoneNumber de ejemplo. AJUSTA ESTO.
        const dummyPhoneNumber = "5551234567"; // ¡¡¡REEMPLAZA ESTO CON EL NÚMERO REAL DEL USUARIO!!!

        // Llama a la función verifyUserDetails de AuthService
        const { token, userId: updatedUserId, hasBiometricsEnabled } = await AuthService.verifyUserDetails(
            dummyPhoneNumber, // El número de teléfono actual
            ssn,
            0, // Mes: 0 (placeholder, tu n8n debería ignorarlo o validarlo si es necesario)
            0, // Día: 0 (placeholder)
            0  // Año: 0 (placeholder)
        );

        // Si la verificación es exitosa, actualiza el estado de autenticación global
        // y navega al siguiente paso.
        // Se puede re-llamar a `login` para asegurar que el token y los datos de usuario
        // del contexto estén actualizados, especialmente si el backend devuelve un nuevo token aquí.
        await login(token, updatedUserId, hasBiometricsEnabled);

        router.push('/dob');

    } catch (error: any) {
      console.error('Error al verificar SSN:', error);
      Alert.alert('Error de Verificación', error.message || 'Los detalles no coinciden con nuestros registros. Intenta de nuevo.');
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          {/* AHORA USAMOS LOS ESTILOS GLOBALES */}
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
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                !isSsnValid && globalStyles.disabledButton,
              ]}
              disabled={!isSsnValid || isLoading}
              onPress={handleVerifySsn}> {/* Llama a la nueva función handleVerifySsn */}
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              )}
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

// Mantenemos un objeto StyleSheet local para cualquier estilo que sobrescriba
// o sea muy específico de esta pantalla y no se comparta.
const styles = StyleSheet.create({
    containerOverrides: {
        // En ssn.tsx, el globalStyles.contentContainer ya era justifyContent: 'space-between'
        // pero authScreenContentContainer tiene 'gap'.
        // Si necesitas ajustar la distribución vertical específicamente aquí, puedes añadir:
        justifyContent: 'space-between',
        paddingVertical: 10, // Asegura que el padding vertical sea el deseado
        gap: 0, // Anula el gap de authScreenContentContainer si no quieres espacio extra en el medio
    },
});