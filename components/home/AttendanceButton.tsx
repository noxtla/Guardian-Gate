// components/home/AttendanceButton.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';

// --- INTERFACES Y TIPOS (sin cambios) ---
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

// --- LÓGICA DE ESTADO VISUAL (sin cambios) ---
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

// --- COMPONENTE PRINCIPAL (sin cambios en la lógica) ---
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
        if (newTime === 300 || newTime === 60) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);

  }, [status]);

  const appearance = getButtonAppearance(timeLeft);
  const isDisabled = !status.isWindowOpen || timeLeft <= 0;
  const timeFormatted = useMemo(() => formatTime(timeLeft), [timeLeft]);

  return (
    <TouchableOpacity
      style={[
        styles.container, // Usaremos los nuevos estilos
        { backgroundColor: appearance.backgroundColor },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8} // Un poco más sutil para un área grande
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

// --- ESTILOS (NUEVO DISEÑO RECTANGULAR) ---
const styles = StyleSheet.create({
  container: {
    // PASO 1: Ocupar todo el espacio disponible, sin dimensiones fijas.
    flex: 1,
    // PASO 2: Eliminar el borde y el borderRadius circular. Heredará el del gridItem.
    // El borderRadius se aplica en el contenedor padre en HomeScreen.
    justifyContent: 'space-between', // Distribuye el espacio entre los elementos
    alignItems: 'center',
    padding: 20, // Padding interno generoso
  },
  disabled: {
    opacity: 0.65,
  },
  mainText: {
    // PASO 3: Estilo para el texto superior "Check-in"
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    alignSelf: 'flex-start', // Alineado a la izquierda dentro del padding
  },
  timerText: {
    // PASO 4: Fuente grande y audaz para el temporizador. Ahora tenemos espacio.
    fontSize: 56,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    // El justifyContent: 'space-between' del contenedor lo centrará verticalmente
  },
});