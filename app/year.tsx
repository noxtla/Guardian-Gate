// app/year.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function YearScreen() {
  // 1. Recibe los datos acumulados de las pantallas anteriores.
  const { phone, month, day } = useLocalSearchParams<{ phone: string; month: string; day: string }>();
  
  // 2. Estado local para gestionar la entrada del año.
  const [year, setYear] = useState('');
  const isYearValid = year.length === 4 && !isNaN(parseInt(year));

  // 3. Lógica de navegación simple que pasa todos los datos a la siguiente pantalla.
  const handleContinue = () => {
    if (!isYearValid) return;
    Keyboard.dismiss();

    // Navega a la pantalla final de biométricos, pasando toda la información recolectada.
    router.push({
      pathname: '/biometric',
      params: {
        phone,
        month,
        day,
        year,
      },
    });
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
            {/* La barra de progreso ahora es el paso 3 de 4. */}
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>3/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '75%' }]} />
              </View>
            </View>

            <IconSymbol name="calendar" size={120} color={Colors.brand.lightBlue} />
            <ThemedText style={globalStyles.authTitle}>¿En qué año nació?</ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="YYYY"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={year}
              onChangeText={setYear}
              maxLength={4}
              autoFocus={true}
            />

            <TouchableOpacity
              style={[globalStyles.primaryButton, !isYearValid && globalStyles.disabledButton]}
              disabled={!isYearValid}
              onPress={handleContinue}
            >
              <ThemedText style={globalStyles.primaryButtonText}>Continuar</ThemedText>
            </TouchableOpacity>

            <ThemedText style={globalStyles.infoText}>
              Este es el penúltimo paso para confirmar su identidad.
            </ThemedText>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}