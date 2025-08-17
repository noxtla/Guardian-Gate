// app/index.tsx
// VERSIÓN FINAL CON LÓGICA BIOMÉTRICA COMPLETA Y LLAMADA AL ENDPOINT /me

import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { AuthService } from '@/services/authService';
import { BiometricService } from '@/services/biometricService';
import { useAuth } from '@/context/AuthContext'; 

export default function GuardianGateScreen() {
  const [employeeId, setEmployeeId] = useState('');
  const [isIdValid, setIsIdValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingFaceId, setIsLoadingFaceId] = useState(false); 
  const [isBiometricLoginAvailable, setIsBiometricLoginAvailable] = useState(false);

  const { login } = useAuth(); 

  // Se ejecuta cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      const checkBiometricStatus = async () => {
        const isEnabled = await AuthService.getBiometricRegistrationStatus();
        console.log(`[IndexScreen] Biometric login enabled flag: ${isEnabled}`);
        setIsBiometricLoginAvailable(isEnabled);
      };
      checkBiometricStatus();
    }, [])
  );

  const handleIdChange = useCallback((id: string) => {
    const numericId = id.replace(/[^0-9]/g, '');
    const trimmedId = numericId.substring(0, 12);
    setEmployeeId(trimmedId);
    setIsIdValid(trimmedId.length >= 6 && trimmedId.length <= 12);
  }, []);

  const handleContinue = async () => {
    if (!isInputVisible) {
      setIsInputVisible(true);
      return;
    }
    if (!isIdValid || isLoading) return;
    Keyboard.dismiss();
    setIsLoading(true);
    try {
      // La llamada a checkEmployeeId es una pre-verificación para dar feedback rápido
      const userExists = await AuthService.checkEmployeeId(employeeId);
      if (userExists) {
        // Pasamos el control a la siguiente pantalla
        router.push({ pathname: '/dob', params: { employeeId } }); 
      } else {
        Alert.alert('Acceso Denegado', 'El ID de empleado no está registrado o no se encuentra activo.');
      }
    } catch (error: any) {
      // El error de "dispositivo vinculado" se manejará en la pantalla 'dob'
      // donde realmente se llama a verifyIdentity.
      Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    setIsLoadingFaceId(true);
    try {
      const isAuthenticatedOnDevice = await BiometricService.authenticateWithBiometrics('Inicia sesión en Guardian Gate');
      
      if (isAuthenticatedOnDevice) {
        console.log('Biometric auth successful. Calling getMe...');
        
        // Obtenemos los datos frescos del perfil desde el backend
        const userProfile = await AuthService.getMe();
        const token = await AuthService.getToken();

        if (userProfile && token) {
          console.log('getMe successful. Logging in with profile:', userProfile);
          // Usamos los datos reales y actualizados para el login
          await login(
            token, 
            userProfile.userId, 
            userProfile.isBiometricEnabled,
            userProfile.name, 
            userProfile.position
          );
          // Navegamos al área principal de la app
          router.replace('/(tabs)');
        } else {
            Alert.alert('Error', 'No se pudieron recuperar las credenciales completas. Por favor, inicia sesión manualmente.');
        }
      } else {
        console.log('Biometric authentication failed or was cancelled by user.');
      }
    } catch (error: any) {
      console.error('Error during FaceId login:', error);
      Alert.alert('Error de Autenticación', `No se pudo iniciar sesión: ${error.message}`);
    } finally {
      setIsLoadingFaceId(false);
    }
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[globalStyles.contentContainer, styles.containerPadding]}>
            <FontAwesome6 name="user-shield" size={150} color={Colors.brand.lightBlue} />

            <View style={styles.inputContainer}>
              {isInputVisible ? (
                <>
                  <TextInput
                    style={globalStyles.textInput}
                    placeholder="Enter your Employee ID"
                    placeholderTextColor={Colors.brand.gray}
                    value={employeeId}
                    onChangeText={handleIdChange}
                    autoCapitalize="none"
                    keyboardType="number-pad"
                    maxLength={12}
                    autoFocus
                  />
                  <TouchableOpacity
                    style={[globalStyles.primaryButton, (!isIdValid || isLoading) && globalStyles.disabledButton]}
                    disabled={!isIdValid || isLoading}
                    onPress={handleContinue}>
                    {isLoading ? <ActivityIndicator color={Colors.brand.white} /> : <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={globalStyles.primaryButton} onPress={handleContinue}>
                    <ThemedText style={globalStyles.primaryButtonText}>
                      Enter your Employee ID
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      globalStyles.primaryButton,
                      (!isBiometricLoginAvailable || isLoadingFaceId) && globalStyles.disabledButton,
                    ]}
                    disabled={!isBiometricLoginAvailable || isLoadingFaceId}
                    onPress={handleFaceIdLogin}
                  >
                    {isLoadingFaceId ? (
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : (
                      <ThemedText style={globalStyles.primaryButtonText}>
                        Enter with FaceId
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>

            <ThemedText style={globalStyles.infoText}>
              {'For currently active employees only.\nAny fraudulent activity will be penalized.'}
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  containerPadding: {
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  inputContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
    gap: 20,
  },
});