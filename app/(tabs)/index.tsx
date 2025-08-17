// app/(tabs)/index.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { Alert, ActivityIndicator, View, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { globalStyles } from '@/constants/AppStyles';
import { AttendanceButton } from '@/components/home/AttendanceButton';
import * as Location from 'expo-location';
import { getHaversineDistance } from '@/utils/location';
import { Colors } from '@/constants/Colors';
import { AttendanceService, AttendanceStatusResponse } from '@/services/attendanceService';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';

// --- Componentes de UI ---
interface GridItemData {
  id: string;
  title: string;
  icon: IconSymbolName;
  isSpecial?: boolean;
  action?: () => void;
}

const VehicleGridItem = ({ item }: { item: GridItemData }) => (
  <TouchableOpacity style={styles.gridItem} onPress={item.action}>
    <IconSymbol name={item.icon} size={50} color={Colors.brand.darkBlue} />
    <ThemedText style={styles.gridItemText}>{item.title}</ThemedText>
  </TouchableOpacity>
);

const SuccessState = ({ time }: { time: string }) => (
    <View style={styles.fullScreenCentered}>
        <IconSymbol name="checkmark.circle.fill" size={150} color={'#2E7D32'} />
        <ThemedText style={styles.successTitle}>Checked-in!</ThemedText>
        <ThemedText style={styles.successSubtitle}>Your attendance was recorded at {time}.</ThemedText>
    </View>
);

// --- LÓGICA DEL CRONÓMETRO (AHORA EN LA PANTALLA PRINCIPAL) ---
const formatTime = (totalSeconds: number): string => {
  if (totalSeconds < 0) return "00:00";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- Componente Principal: HomeScreen ---
export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusResponse | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const { user } = useAuth();
  
  // --- ESTADO DEL CRONÓMETRO ---
  const [timeLeft, setTimeLeft] = useState(0);

  // --- EFECTO PARA MANEJAR LA CUENTA REGRESIVA ---
  useEffect(() => {
    if (!attendanceStatus?.isWindowOpen) {
      setTimeLeft(0);
      return;
    }
    const serverTime = new Date(attendanceStatus.serverTimeUTC);
    const endTime = new Date(attendanceStatus.windowEndTimeUTC);
    const initialTimeLeft = Math.round((endTime.getTime() - serverTime.getTime()) / 1000);
    setTimeLeft(initialTimeLeft > 0 ? initialTimeLeft : 0);

    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = prevTime - 1;
        if (newTime <= 0) {
          clearInterval(timer);
          return 0;
        }
        if (newTime === 300 || newTime === 60) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attendanceStatus]);

  const loadAttendanceStatus = useCallback(() => {
    setIsLoading(true);
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

  const handleCheckIn = useCallback(async () => {
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
        const response = await AttendanceService.postCheckIn(latitude, longitude);
        if (response.status === 'success') {
          const localTime = new Date(response.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setCheckInTime(localTime);
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
  }, [attendanceStatus]);

  const gridData: GridItemData[] = [
    { id: 'attendance', title: 'Attendance', icon: 'person.badge.clock.fill', isSpecial: true },
    { id: 'vehicles', title: 'Vehicles', icon: 'car.fill', action: () => Alert.alert("Vehicles", "Navigate to Vehicles screen") },
  ];

  const renderGridItem = ({ item }: { item: GridItemData }) => {
    if (item.isSpecial) {
      return (
        <View style={styles.gridItem}>
          {attendanceStatus ? (
            <>
              {isProcessingCheckIn && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.brand.white} />
                  <ThemedText style={styles.loadingText}>Verifying...</ThemedText>
                </View>
              )}
              <AttendanceButton 
                isWindowOpen={attendanceStatus.isWindowOpen}
                timeLeft={timeLeft}
                onPress={handleCheckIn} 
              />
            </>
          ) : (
            <ActivityIndicator color={Colors.brand.lightBlue} />
          )}
        </View>
      );
    }
    return <VehicleGridItem item={item} />;
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <View style={styles.fullScreenCentered}><ActivityIndicator size="large" color={Colors.brand.lightBlue} /></View>;
    }
    
    if (checkInTime) {
      return <SuccessState time={checkInTime} />;
    }

    return (
      <View style={styles.dashboardContainer}>
        <ThemedText style={styles.welcomeMessage}>
          Hola, {user?.name || 'Empleado'}
        </ThemedText>
        
        {attendanceStatus?.isWindowOpen && timeLeft > 0 && (
          <View style={styles.timerDisplayContainer}>
            <ThemedText style={styles.timerDisplayText}>
              {formatTime(timeLeft)}
            </ThemedText>
          </View>
        )}

        <FlatList
          data={gridData}
          renderItem={renderGridItem}
          keyExtractor={item => item.id}
          numColumns={2}
          contentContainerStyle={styles.gridContainer}
        />
      </View>
    );
  };

  return <ThemedView style={globalStyles.lightScreenContainer}>{renderContent()}</ThemedView>;
}

// --- Estilos ---
const styles = StyleSheet.create({
    fullScreenCentered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 10, borderRadius: 20 },
    loadingText: { color: Colors.brand.white, marginTop: 15, fontSize: 16 },
    successTitle: { fontSize: 32, fontWeight: 'bold', color: '#2E7D32', fontFamily: 'OpenSans-SemiBold' },
    successSubtitle: { fontSize: 16, color: Colors.brand.darkGray, textAlign: 'center' },
    dashboardContainer: { flex: 1 },
    welcomeMessage: { fontSize: 28, fontWeight: 'bold', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
    gridContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 10 },
    gridItem: { width: 160, height: 200, margin: 10, borderRadius: 20, backgroundColor: Colors.brand.white, justifyContent: 'center', alignItems: 'center', padding: 0, shadowColor: "#000", shadowOffset: { width: 0, height: 4, }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 8, overflow: 'hidden' },
    gridItemText: { position: 'absolute', bottom: 20, fontSize: 18, fontWeight: '600', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold' },
    // --- INICIO DE LA MODIFICACIÓN ---
    timerDisplayContainer: {
      alignSelf: 'center',
      backgroundColor: Colors.brand.darkBlue,
      borderRadius: 15,
      paddingVertical: 10,
      paddingHorizontal: 25,
      marginVertical: 15, // Reducimos el margen vertical
      width: '80%',       // Aumentamos el ancho a 80%
    },
    // --- FIN DE LA MODIFICACIÓN ---
    timerDisplayText: {
      color: Colors.brand.white,
      fontSize: 48,
      fontFamily: 'SpaceMono',
      textAlign: 'center',
    },
});