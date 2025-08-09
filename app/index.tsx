// app/index.tsx
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
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext'; 

export default function GuardianGateScreen() {
  const [employeeId, setEmployeeId] = useState('');
  const [isIdValid, setIsIdValid] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [isLoadingFaceId, setIsLoadingFaceId] = useState(false); 

  const { login } = useAuth(); 

  const handleIdChange = useCallback((id: string) => {
    const numericId = id.replace(/[^0-9]/g, '');
    
    // --- LÍNEA CORREGIDA ---
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
      const userFound = await AuthService.checkEmployeeId(employeeId);

      if (userFound) {
        console.log('Empleado encontrado. Procediendo...');
        router.push({ pathname: '/dob', params: { employeeId: employeeId } }); 
      } else {
        Alert.alert(
          'Acceso Denegado',
          'El ID de empleado no está registrado o no se encuentra activo.'
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaceIdLogin = async () => {
    console.log('Attempting FaceId login...');
    setIsLoadingFaceId(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await login('dummy-faceid-token', 'faceid-user-123', true);
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error during FaceId login:', error);
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
                    style={[
                      globalStyles.primaryButton,
                      (!isIdValid || isLoading) && globalStyles.disabledButton,
                    ]}
                    disabled={!isIdValid || isLoading}
                    onPress={handleContinue}>
                    {isLoading ? (
                      <ActivityIndicator color={Colors.brand.white} />
                    ) : (
                      <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={globalStyles.primaryButton}
                    onPress={handleContinue}>
                    <ThemedText style={globalStyles.primaryButtonText}>
                      Enter your Employee ID
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      globalStyles.primaryButton,
                      isLoadingFaceId && globalStyles.disabledButton,
                    ]}
                    disabled={isLoadingFaceId}
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