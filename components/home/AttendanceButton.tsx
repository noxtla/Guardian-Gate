import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

// --- INTERFACES Y TIPOS ---
interface AttendanceStatus {
  serverTimeUTC: string;
  isWindowOpen: boolean;
  windowEndTimeUTC: string;
  geofence: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

interface Props {
  status: AttendanceStatus;
  onPress: () => void;
}

// --- LÓGICA DE ESTADO VISUAL ---
const getButtonAppearance = (timeLeft: number) => {
  if (timeLeft > 600) { // > 10 minutos
    return { backgroundColor: '#2E7D32', textColor: Colors.brand.white }; // Verde
  }
  if (timeLeft > 300) { // > 5 minutos
    return { backgroundColor: '#F9A825', textColor: Colors.brand.darkBlue }; // Amarillo
  }
  if (timeLeft > 0) { // < 5 minutos
    return { backgroundColor: '#D32F2F', textColor: Colors.brand.white }; // Rojo
  }
  return { backgroundColor: Colors.brand.darkGray, textColor: Colors.brand.gray }; // Expirado/Inactivo
};

const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- COMPONENTE PRINCIPAL ---
export const AttendanceButton: React.FC<Props> = ({ status, onPress }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!status.isWindowOpen) {
      setTimeLeft(0);
      return;
    }

    const serverTime = new Date(status.serverTimeUTC);
    const endTime = new Date(status.windowEndTimeUTC);
    const initialTimeLeft = Math.round((endTime.getTime() - serverTime.getTime()) / 1000);
    setTimeLeft(initialTimeLeft);

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        // Feedback háptico en momentos clave
        if (newTime === 300 || newTime === 60) { // 5 minutos y 1 minuto
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return newTime;
      });
    }, 1000);

    // Limpieza del intervalo cuando el componente se desmonte o el status cambie
    return () => clearInterval(timer);

  }, [status]);

  const appearance = getButtonAppearance(timeLeft);
  const isDisabled = !status.isWindowOpen || timeLeft <= 0;
  const timeFormatted = useMemo(() => formatTime(timeLeft), [timeLeft]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: appearance.backgroundColor },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      <ThemedText style={[styles.mainText, { color: appearance.textColor }]}>
        {isDisabled ? 'Attendance Closed' : 'Check-in'}
      </ThemedText>
      {!isDisabled && (
         <ThemedText style={[styles.timerText, { color: appearance.textColor }]}>
          {timeFormatted}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

// --- ESTILOS ---
const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 4,
    borderColor: Colors.brand.darkBlue,
  },
  disabled: {
    opacity: 0.6,
  },
  mainText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-SemiBold',
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: 'Lato-Bold',
    marginTop: 5,
  },
});