// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  View,
  TextInput,
  ScrollView,
  Text,
  // --- CAMBIO CLAVE: Importaciones necesarias para manejar el teclado ---
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';

// --- Datos y Funciones Auxiliares (sin cambios) ---
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];
const isLeapYear = (year: number): boolean => ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0);
const getDaysInMonth = (monthIndex: number, year: number): number => {
  if (monthIndex === 1) return isLeapYear(year) ? 29 : 28;
  if ([3, 5, 8, 10].includes(monthIndex)) return 30;
  return 31;
};

export default function DobScreen() {
  const [selectedMonth, setSelectedMonth] = useState<number>(6);
  const [selectedDay, setSelectedDay] = useState<number | null>(15);
  const [year, setYear] = useState('1985');

  const yearNum = parseInt(year, 10) || new Date().getFullYear();
  const daysInMonth = useMemo(() => getDaysInMonth(selectedMonth, yearNum), [selectedMonth, yearNum]);
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (selectedDay && selectedDay > daysInMonth) setSelectedDay(null);
  }, [daysInMonth, selectedDay]);

  const isFormValid = selectedMonth !== null && selectedDay !== null && year.length === 4;

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      {/* --- CAMBIO CLAVE: Se ajusta KeyboardAvoidingView para que envuelva toda la pantalla --- */}
      {/* Esto asegura que el layout se adapte a la aparición del teclado. */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        // El offset compensa la altura del header en iOS.
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>2/3</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '66.6%' }]} />
            </View>
          </View>

          <ThemedText style={styles.sectionTitle}>Month</ThemedText>
          <View style={styles.gridContainer}>
            {MONTHS.map((month, index) => (
              <TouchableOpacity
                key={month}
                style={[
                  styles.gridButton, { minWidth: '22%' },
                  selectedMonth === index ? styles.selectedButton : styles.unselectedButton,
                ]}
                onPress={() => setSelectedMonth(index)}
              >
                <Text style={selectedMonth === index ? styles.selectedButtonText : styles.unselectedButtonText}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.sectionTitle}>Day</ThemedText>
          <View style={styles.gridContainer}>
            {daysArray.map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.gridButton, { minWidth: '12.5%' },
                  selectedDay === day ? styles.selectedButton : styles.unselectedButton,
                ]}
                onPress={() => setSelectedDay(day)}
              >
                <Text style={selectedDay === day ? styles.selectedButtonText : styles.unselectedButtonText}>
                  {day}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ThemedText style={styles.sectionTitle}>Year</ThemedText>
          <TextInput
            style={globalStyles.textInput}
            keyboardType="number-pad"
            maxLength={4}
            value={year}
            onChangeText={(text) => setYear(text.replace(/[^0-9]/g, ''))}
            placeholder="YYYY"
            placeholderTextColor={Colors.brand.gray}
          />
        </ScrollView>

        {/* --- CAMBIO CLAVE: El footer ahora está fuera del ScrollView pero dentro del KeyboardAvoidingView --- */}
        {/* Esto permite que se mantenga fijo en la parte inferior y sea empujado por el teclado. */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[globalStyles.primaryButton, !isFormValid && globalStyles.disabledButton]}
            disabled={!isFormValid}
            onPress={() => alert(`Date selected: ${MONTHS[selectedMonth]} ${selectedDay}, ${year}`)}
          >
            <ThemedText style={globalStyles.primaryButtonText}>Confirm</ThemedText>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // --- CAMBIO CLAVE: El contenedor principal ahora tiene flex:1 para que KAV funcione ---
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  progressContainer: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.brand.white,
    marginBottom: 16,
    marginTop: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  unselectedButtonText: {
    color: Colors.brand.white,
    fontWeight: '500',
  },
  selectedButton: {
    backgroundColor: Colors.brand.lightBlue,
  },
  selectedButtonText: {
    color: Colors.brand.white,
    fontWeight: 'bold',
  },
  footer: {
    paddingTop: 10,
    paddingBottom: 20,
    width: '100%',
  },
});