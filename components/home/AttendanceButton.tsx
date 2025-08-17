import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { RFValue } from 'react-native-responsive-fontsize';

// --- INTERFACES AND LOGIC (Sin cambios) ---
interface AttendanceStatus {
  serverTimeUTC: string;
  isWindowOpen: boolean;
  windowEndTimeUTC: string;
  geofence: { latitude: number; longitude: number; radius: number };
}
interface Props { status: AttendanceStatus; onPress: () => void; }
const getButtonAppearance = (timeLeft: number) => {
  if (timeLeft > 600) { return { backgroundColor: '#2E7D32', textColor: Colors.brand.white }; }
  if (timeLeft > 300) { return { backgroundColor: '#F9A825', textColor: Colors.brand.darkBlue }; }
  if (timeLeft > 0) { return { backgroundColor: '#D32F2F', textColor: Colors.brand.white }; }
  return { backgroundColor: Colors.brand.darkGray, textColor: Colors.brand.gray };
};
const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- COMPONENT IMPLEMENTATION (Sin cambios en la lógica) ---
export const AttendanceButton: React.FC<Props> = ({ status, onPress }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!status.isWindowOpen) { setTimeLeft(0); return; }
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
      style={[ styles.container, { backgroundColor: appearance.backgroundColor }, isDisabled && styles.disabled ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <ThemedText style={[styles.mainText, { color: appearance.textColor }]}>
        {isDisabled ? 'Attendance Closed' : 'Check-in'}
      </ThemedText>
      
      {/* [CAMBIO] Envolvemos el cronómetro en una View para centrarlo en el espacio restante */}
      {!isDisabled && (
        <View style={styles.timerContainer}>
          <ThemedText
            style={[styles.timerText, { color: appearance.textColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
          >
            {timeFormatted}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
};

// --- STYLES (Aquí están las correcciones clave) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // [CORRECCIÓN] Alineamos el contenido desde arriba y añadimos padding
    justifyContent: 'flex-start', 
    alignItems: 'center',
    padding: RFValue(15),
    width: '100%',
    height: '100%',
    borderRadius: RFValue(20),
  },
  disabled: {
    opacity: 0.65,
  },
  mainText: {
    // [CORRECCIÓN] El texto del título se alinea solo y tiene un margen definido
    alignSelf: 'stretch', // Ocupa todo el ancho para poder centrar el texto
    textAlign: 'center',
    fontSize: RFValue(18),
    fontFamily: 'OpenSans-SemiBold',
    marginBottom: RFValue(8), // Pequeño espacio antes del cronómetro
  },
  // [NUEVO] Contenedor para el cronómetro que ocupa el espacio restante
  timerContainer: {
    flex: 1, // Ocupa todo el espacio vertical disponible
    justifyContent: 'center', // Centra el cronómetro verticalmente en este espacio
    alignItems: 'center', // Centra el cronómetro horizontalmente
    width: '100%',
  },
  timerText: {
    fontSize: RFValue(48), // Podemos hacerlo un poco más grande
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
});