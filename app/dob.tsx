// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React, { useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, View, Text } from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { router } from 'expo-router';

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
  const [selectedMonth, setSelectedMonth] = useState<number | null>(0); // --- CAMBIO CLAVE ---: Valor por defecto
  const [selectedDay, setSelectedDay] = useState<number | null>(1); // --- CAMBIO CLAVE ---: Valor por defecto

  const currentYear = new Date().getFullYear();
  const daysInMonth = useMemo(
    () => selectedMonth !== null ? getDaysInMonth(selectedMonth, currentYear) : 31,
    [selectedMonth, currentYear]
  );
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // --- CAMBIO CLAVE ---: isFormValid siempre true
  const isFormValid = true; // Para desarrollo, siempre válido

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <View style={styles.container}>
        <View>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>3/4</Text>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '75%' }]} />
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
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[globalStyles.primaryButton /* --- CAMBIO CLAVE ---: No disabled */]}
            // disabled={!isFormValid} // Eliminado
            onPress={() => router.push('/year')}
          >
            <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
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
    marginTop: 40,
    paddingBottom: 20,
    width: '100%',
  },
});