import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import * as Haptics from 'expo-haptics';
import { RFValue } from 'react-native-responsive-fontsize';

// --- INTERFACES AND LOGIC ---
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

// --- COMPONENT IMPLEMENTATION ---
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
        styles.container,
        { backgroundColor: appearance.backgroundColor },
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      <ThemedText
        style={[styles.mainText, { color: appearance.textColor }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}
      >
        {isDisabled ? 'Attendance Closed' : 'Check-in'}
      </ThemedText>
      {!isDisabled && (
        <ThemedText
          style={[styles.timerText, { color: appearance.textColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {timeFormatted}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
};

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: RFValue(12), // Ajustado para mejor espaciado
    width: '100%',
    height: '100%',
    borderRadius: RFValue(20), // Bordes suaves
  },
  disabled: {
    opacity: 0.65,
  },
  mainText: {
    alignSelf: 'flex-start',
    fontSize: RFValue(16),
    fontFamily: 'OpenSans-SemiBold',
    marginBottom: RFValue(8),
  },
  timerText: {
    fontSize: RFValue(40),
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    flexShrink: 1,
    width: '100%',
  },
});