// components/home/AttendanceButton.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { RFValue } from 'react-native-responsive-fontsize';

// --- INTERFACES Y LÓGICA SIMPLIFICADA ---
interface Props {
  isWindowOpen: boolean;
  timeLeft: number;
  onPress: () => void;
}

const getButtonAppearance = (timeLeft: number) => {
  if (timeLeft > 600) { return { backgroundColor: '#2E7D32', textColor: Colors.brand.white }; }
  if (timeLeft > 300) { return { backgroundColor: '#F9A825', textColor: Colors.brand.darkBlue }; }
  if (timeLeft > 0) { return { backgroundColor: '#D32F2F', textColor: Colors.brand.white }; }
  return { backgroundColor: Colors.brand.darkGray, textColor: Colors.brand.gray };
};

// --- COMPONENTE SIMPLIFICADO ---
export const AttendanceButton: React.FC<Props> = ({ isWindowOpen, timeLeft, onPress }) => {
  const appearance = getButtonAppearance(timeLeft);
  const isDisabled = !isWindowOpen || timeLeft <= 0;

  return (
    <TouchableOpacity
      style={[ styles.container, { backgroundColor: appearance.backgroundColor }, isDisabled && styles.disabled ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <ThemedText style={[styles.mainText, { color: appearance.textColor }]}>
        {isDisabled ? 'Attendance Closed' : 'Check-in'}
      </ThemedText>
    </TouchableOpacity>
  );
};

// --- ESTILOS ACTUALIZADOS ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // El contenido ahora es solo texto, así que lo centramos perfectamente
    justifyContent: 'center', 
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: RFValue(20),
  },
  disabled: {
    opacity: 0.65,
  },
  mainText: {
    fontSize: RFValue(22), // Hacemos el texto un poco más grande
    fontFamily: 'OpenSans-SemiBold',
  },
});