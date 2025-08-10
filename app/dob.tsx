// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React, { useState, useMemo, useRef } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { globalStyles } from '@/constants/AppStyles';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAnimatedShake } from '@/hooks/useAnimatedShake';
import { AuthService } from '@/services/authService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MAX_ATTEMPTS = 3;

const isLeapYear = (year: number): boolean => ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
const getDaysInMonth = (monthIndex: number, year: number): number => {
  if (monthIndex === 1) return isLeapYear(year) ? 29 : 28;
  if ([3, 5, 8, 10].includes(monthIndex)) return 30;
  return 31;
};

export default function DobScreen() {
  const { employeeId } = useLocalSearchParams<{ employeeId: string }>();
  
  const [year, setYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { animatedStyle: yearShake, triggerShake: triggerYearShake } = useAnimatedShake();
  const { animatedStyle: monthShake, triggerShake: triggerMonthShake } = useAnimatedShake();
  const { animatedStyle: dayShake, triggerShake: triggerDayShake } = useAnimatedShake();

  const yearInputRef = useRef<TextInput>(null);

  const isFormComplete = selectedMonth !== null && selectedDay !== null && year.length === 4;
  let isDateValid = false;
  let isContinueDisabled = true;

  if (isFormComplete) {
    const today = new Date();
    const dob = new Date(parseInt(year), selectedMonth!, selectedDay!);
    const minAgeDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    const maxAgeDate = new Date(today.getFullYear() - 90, today.getMonth(), today.getDate());
    isDateValid = 
      dob.getFullYear() === parseInt(year) &&
      dob <= minAgeDate &&
      dob >= maxAgeDate;
  }
  isContinueDisabled = !isFormComplete || !isDateValid || isLoading;

  useFocusEffect(
    React.useCallback(() => {
      const checkLockStatus = async () => {
        const lockTimestamp = await AsyncStorage.getItem('@auth_lock_timestamp');
        if (lockTimestamp && new Date().getTime() < parseInt(lockTimestamp, 10)) {
          Alert.alert( 'Acceso Bloqueado', 'Has superado el número de intentos. El acceso desde este dispositivo está bloqueado temporalmente.', [{ text: 'Entendido', onPress: () => router.replace('/') }] );
        }
      };
      checkLockStatus();
    }, [])
  );

  const handleVerification = async () => {
    if (isContinueDisabled) return;
    Keyboard.dismiss(); 
    setIsLoading(true);

    // --- INICIO DEL PARCHE DE DEPURACIÓN ---
    console.log("======================================");
    console.log("[DOB DEBUG] Iniciando verificación...");
    console.log(`[DOB DEBUG] Employee ID: ${employeeId}`);
    console.log(`[DOB DEBUG] Datos seleccionados: Day=${selectedDay}, Month=${selectedMonth}, Year=${year}`);
    
    const monthToSend = selectedMonth! + 1;
    console.log(`[DOB DEBUG] Mes a enviar (1-12): ${monthToSend}`);
    // --- FIN DEL PARCHE DE DEPURACIÓN ---

    try {
      const { token, userId, isBiometricEnabled } = await AuthService.verifyIdentity(
          employeeId!, 
          selectedDay!, 
          monthToSend,
          parseInt(year, 10)
      );
      
      console.log("[DOB DEBUG] Verificación exitosa. Recibido:", { userId, token, isBiometricEnabled });
      
      await AsyncStorage.removeItem('@auth_fail_attempts');
      
      router.push({
        pathname: '/biometric',
        params: { 
          phone: 'N/A',
          month: monthToSend.toString(), 
          day: selectedDay!.toString(), 
          year, 
          userId, 
          token,
          isBiometricEnabled: isBiometricEnabled.toString(),
        },
      });

    } catch (error: any) {
      console.error("[DOB DEBUG] Error en la verificación:", error.message);
      handleFailedAttempt();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailedAttempt = async () => {
    const attemptsStr = await AsyncStorage.getItem('@auth_fail_attempts');
    const newAttempts = (attemptsStr ? parseInt(attemptsStr, 10) : 0) + 1;
    triggerYearShake(); 
    triggerMonthShake(); 
    triggerDayShake();
    if (newAttempts >= MAX_ATTEMPTS) {
      if (!__DEV__) {
        const lockUntil = new Date().getTime() + 24 * 60 * 60 * 1000;
        await AsyncStorage.setItem('@auth_lock_timestamp', lockUntil.toString());
      } else { 
        console.log('[DEV MODE] Bloqueo de dispositivo OMITIDO.'); 
      }
      await AsyncStorage.removeItem('@auth_fail_attempts');
      Alert.alert('Demasiados Intentos Fallidos', 'Por su seguridad, el acceso desde este dispositivo ha sido bloqueado temporalmente.', [{ text: 'Entendido', onPress: () => { if (!__DEV__) router.replace('/'); } }]);
    } else {
      await AsyncStorage.setItem('@auth_fail_attempts', newAttempts.toString());
      Alert.alert('Datos Incorrectos', `La fecha de nacimiento no coincide con nuestros registros. Le quedan ${MAX_ATTEMPTS - newAttempts} intentos.`);
      setSelectedDay(null); 
      setSelectedMonth(null); 
      setYear('');
      yearInputRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setYear(numericText);
    setSelectedDay(null);
  };

  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setSelectedDay(null);
  };

  const daysInSelectedMonth = useMemo(() => {
    if (year.length !== 4 || selectedMonth === null) return 0;
    return getDaysInMonth(selectedMonth, parseInt(year));
  }, [selectedMonth, year]);
  const daysArray = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <View style={styles.staticHeader}>
        <View style={globalStyles.authProgressContainer}>
          <Text style={globalStyles.authProgressText}>2/3</Text>
          <View style={globalStyles.authProgressBarBackground}><View style={[globalStyles.authProgressBarFill, { width: '66%' }]} /></View>
        </View>
        <ThemedText style={globalStyles.authTitle}>¿Cuál es su fecha de nacimiento?</ThemedText>
      </View>
      
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContainer}
        enableOnAndroid={true}
        extraHeight={120}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={yearShake}>
          <ThemedText style={styles.sectionTitle}>Año</ThemedText>
          <TextInput
            ref={yearInputRef}
            style={[globalStyles.textInput, styles.yearTextInput]}
            placeholder="YYYY"
            placeholderTextColor={Colors.brand.gray}
            keyboardType="number-pad"
            value={year}
            onChangeText={handleYearChange}
            maxLength={4}
            returnKeyType="done"
          />
        </Animated.View>
        
        {year.length === 4 && (
          <Animated.View style={monthShake}>
            <ThemedText style={styles.sectionTitle}>Mes</ThemedText>
            <View style={styles.gridContainer}>
              {MONTHS.map((month, index) => (
                <TouchableOpacity key={month} style={[styles.gridButton, { minWidth: '22%' }, selectedMonth === index && styles.selectedButton]} onPress={() => handleMonthSelect(index)}>
                  <Text style={[styles.unselectedButtonText, selectedMonth === index && styles.selectedButtonText]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {selectedMonth !== null && (
          <Animated.View style={dayShake}>
            <ThemedText style={styles.sectionTitle}>Día</ThemedText>
            <View style={styles.gridContainer}>
              {daysArray.map((day) => (
                <TouchableOpacity key={day} style={[styles.gridButton, { minWidth: '12.5%' }, selectedDay === day && styles.selectedButton]} onPress={() => setSelectedDay(day)}>
                  <Text style={[styles.unselectedButtonText, selectedDay === day && styles.selectedButtonText]}>{day}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}
      
        <View style={styles.footer}>
          <TouchableOpacity
            style={[globalStyles.primaryButton, isContinueDisabled && globalStyles.disabledButton]}
            disabled={isContinueDisabled}
            onPress={handleVerification}
          >
            {isLoading ? <ActivityIndicator color={Colors.brand.white} /> : <ThemedText style={globalStyles.primaryButtonText}>Verificar</ThemedText>}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  staticHeader: { paddingHorizontal: 20, paddingTop: 10 },
  scrollContainer: { flexGrow: 1, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.brand.white, marginBottom: 16, marginTop: 24 },
  yearTextInput: { fontSize: 28, paddingVertical: 20, letterSpacing: 8, fontWeight: 'bold' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10 },
  gridButton: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexGrow: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  unselectedButtonText: { color: Colors.brand.white, fontWeight: '500' },
  selectedButton: { backgroundColor: Colors.brand.lightBlue },
  selectedButtonText: { color: Colors.brand.white, fontWeight: 'bold' },
  footer: { paddingTop: 40, paddingBottom: 20, width: '100%' },
});