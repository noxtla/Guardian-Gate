import React, { useState, useCallback } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { globalStyles } from '@/constants/AppStyles';
import { AttendanceButton } from '@/components/home/AttendanceButton';
import * as Location from 'expo-location';
import { getHaversineDistance } from '@/utils/location';
import { Colors } from '@/constants/Colors';
import { AttendanceService, AttendanceStatusResponse } from '@/services/attendanceService';
import { IconSymbol } from '@/components/ui/IconSymbol';

// --- COMPONENTE DE ESTADO DE ÉXITO ---
const SuccessState = ({ time }: { time: string }) => (
    <View style={styles.centered}>
        <IconSymbol name="checkmark.circle.fill" size={150} color={'#2E7D32'} />
        <ThemedText style={styles.successTitle}>Checked-in!</ThemedText>
        <ThemedText style={styles.successSubtitle}>Your attendance was recorded at {time}.</ThemedText>
    </View>
);

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusResponse | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null); // Nuevo estado para el éxito

  const loadAttendanceStatus = useCallback(() => {
    setIsLoading(true);
    // En una app real, aquí también verificaríamos si el usuario ya hizo check-in hoy.
    // El backend podría devolver `isCheckedIn: true` en la respuesta de getStatus.
    // Por ahora, reiniciamos el estado en cada foco.
    setCheckInTime(null); 
    
    AttendanceService.getStatus()
      .then(setAttendanceStatus)
      .catch(error => {
        console.error("Failed to load attendance status:", error);
        Alert.alert("Error", "Could not load attendance data.");
        setAttendanceStatus(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useFocusEffect(loadAttendanceStatus);

  const handleCheckIn = async () => {
    if (!attendanceStatus) return;
    setIsProcessingCheckIn(true);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required.');
      setIsProcessingCheckIn(false);
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;
      const { geofence } = attendanceStatus;
      
      const distance = getHaversineDistance(latitude, longitude, geofence.latitude, geofence.longitude);

      if (distance <= geofence.radius) {
        // --- LLAMADA A LA API DE CHECK-IN ---
        const response = await AttendanceService.postCheckIn(latitude, longitude);
        if (response.status === 'success') {
          // Formateamos la hora para mostrarla en la UI
          const localTime = new Date(response.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setCheckInTime(localTime); // Guardamos la hora del check-in exitoso
        } else {
          Alert.alert('Check-in Failed', response.message);
        }
      } else {
        Alert.alert('Out of Range', `You are ${Math.round(distance)}m away. Be within ${geofence.radius}m to check-in.`);
      }
    } catch (error) {
        Alert.alert('Error', 'An unexpected error occurred during check-in.');
        console.error(error);
    } finally {
        setIsProcessingCheckIn(false);
    }
  };
  
  // --- LÓGICA DE RENDERIZADO ---
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.brand.lightBlue} />
          <ThemedText>Loading Attendance Status...</ThemedText>
        </View>
      );
    }
    
    if (checkInTime) {
      return <SuccessState time={checkInTime} />;
    }

    if (attendanceStatus) {
      return (
        <>
          {isProcessingCheckIn && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.brand.white} />
              <ThemedText style={styles.loadingText}>Verifying location...</ThemedText>
            </View>
          )}
          <AttendanceButton status={attendanceStatus} onPress={handleCheckIn} />
        </>
      );
    }

    // Estado de Error
    return (
        <View style={styles.centered}>
            <IconSymbol name="wifi.slash" size={48} color={Colors.brand.gray} />
            <ThemedText style={styles.errorText}>Failed to load data</ThemedText>
            <TouchableOpacity style={globalStyles.primaryButton} onPress={loadAttendanceStatus}>
                <ThemedText style={globalStyles.primaryButtonText}>Retry</ThemedText>
            </TouchableOpacity>
        </View>
    );
  };

  return (
    <ThemedView style={[globalStyles.lightScreenContainer, styles.centered]}>
        {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 15,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: { color: Colors.brand.white, marginTop: 15, fontSize: 16 },
    errorText: { fontSize: 18, fontWeight: '600', color: Colors.brand.darkGray },
    successTitle: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', fontFamily: 'OpenSans-SemiBold' },
    successSubtitle: { fontSize: 16, color: Colors.brand.darkGray, textAlign: 'center' },
});