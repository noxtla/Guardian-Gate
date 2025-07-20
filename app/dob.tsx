// app/dob.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import React, { useState, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, SafeAreaView, View, Text, ScrollView } from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { router, useLocalSearchParams } from 'expo-router';

// --- Datos y Funciones Auxiliares ---
const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const isLeapYear = (year: number): boolean => {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
};

const getDaysInMonth = (monthIndex: number, year: number): number => {
  if (monthIndex === 1) return isLeapYear(year) ? 29 : 28; // Febrero
  if ([3, 5, 8, 10].includes(monthIndex)) return 30; // Abril, Junio, Septiembre, Noviembre
  return 31;
};

export default function DobScreen() {
  // 1. Recibe el parámetro 'phone' de la pantalla anterior.
  const { phone } = useLocalSearchParams<{ phone: string }>();

  // 2. Estado local para la selección del usuario.
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // Enero por defecto
  const [selectedDay, setSelectedDay] = useState<number>(1);   // Día 1 por defecto

  // 3. Lógica para calcular dinámicamente los días del mes seleccionado.
  const currentYear = new Date().getFullYear();
  const daysInMonth = useMemo(
    () => getDaysInMonth(selectedMonth, currentYear),
    [selectedMonth, currentYear]
  );
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // 4. Función para navegar a la siguiente pantalla con todos los datos.
  const handleContinue = () => {
    router.push({
      pathname: '/year',
      params: { 
        phone, 
        month: selectedMonth + 1, // +1 porque el estado del mes es 0-11
        day: selectedDay 
      },
    });
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
            {/* Barra de Progreso */}
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>2/3</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '66%' }]} />
              </View>
            </View>

            <ThemedText style={globalStyles.authTitle}>¿Cuál es su fecha de nacimiento?</ThemedText>

            {/* Selector de Mes */}
            <ThemedText style={styles.sectionTitle}>Mes</ThemedText>
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

            {/* Selector de Día */}
            <ThemedText style={styles.sectionTitle}>Día</ThemedText>
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
        
          {/* Botón de Continuar */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={globalStyles.primaryButton}
              onPress={handleContinue}
            >
              <ThemedText style={globalStyles.primaryButtonText}>Continuar</ThemedText>
            </TouchableOpacity>
          </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos ---
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.brand.white,
    marginBottom: 16,
    marginTop: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
  },
  gridButton: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
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
    padding: 20,
    width: '100%',
  },
});