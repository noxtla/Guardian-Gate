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
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useAuth } from '@/context/AuthContext';
import { RFValue } from 'react-native-responsive-fontsize';

// --- Componentes de UI ---
interface GridItemData {
  id: string;
  title?: string;
  icon?: IconSymbolName;
  isSpecial?: boolean;
  action?: () => void;
  type?: 'item' | 'placeholder';
}

const VehicleGridItem = ({ item }: { item: GridItemData }) => (
  <TouchableOpacity style={styles.gridItem} onPress={item.action}>
    <IconSymbol name={item.icon!} size={50} color={Colors.brand.darkBlue} />
    <ThemedText style={styles.gridItemText}>{item.title}</ThemedText>
  </TouchableOpacity>
);

// --- ANNOTATION A: This component is specifically for placeholders ---
const PlaceholderGridItem = () => (
    <View style={[styles.gridItem, styles.placeholderGridItem]} />
);

const SuccessState = ({ time }: { time: string }) => (
    <View style={styles.fullScreenCentered}>
        <IconSymbol name="checkmark.circle.fill" size={150} color={'#2E7D32'} />
        <ThemedText style={styles.successTitle}>Checked-in!</ThemedText>
        <ThemedText style={styles.successSubtitle}>Your attendance was recorded at {time}.</ThemedText>
    </View>
);

// --- Componente Principal: HomeScreen ---
export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState<AttendanceStatusResponse | null>(null);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  
  const { user } = useAuth();

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

  // --- ANNOTATION B: This function decides which component to render ---
  const renderGridItem = (item: GridItemData) => {
    if (item.type === 'placeholder') {
        return <PlaceholderGridItem key={item.id} />;
    }

    if (item.isSpecial) {
      return (
        <View style={styles.gridItem} key={item.id}>
          {attendanceStatus ? (
            <>
              {isProcessingCheckIn && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={Colors.brand.white} />
                  <ThemedText style={styles.loadingText}>Verifying...</ThemedText>
                </View>
              )}
              <AttendanceButton status={attendanceStatus} onPress={handleCheckIn} />
            </>
          ) : (
            <ActivityIndicator color={Colors.brand.lightBlue} />
          )}
        </View>
      );
    }
    
    return <VehicleGridItem item={item} key={item.id} />;
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.fullScreenCentered}>
          <ActivityIndicator size="large" color={Colors.brand.lightBlue} />
          <ThemedText>Loading Dashboard...</ThemedText>
        </View>
      );
    }
    
    if (checkInTime) {
      return <SuccessState time={checkInTime} />;
    }
    
    // --- ANNOTATION C: The data drives the UI ---
    const gridData: GridItemData[] = [
      { id: 'attendance', title: 'Attendance', icon: 'person.badge.clock.fill', isSpecial: true, type: 'item' },
      { id: 'vehicles', title: 'Vehicles', icon: 'car.fill', action: () => Alert.alert("Vehicles", "Navigate to Vehicles screen"), type: 'item' },
      { id: 'placeholder-1', type: 'placeholder' },
      { id: 'placeholder-2', type: 'placeholder' },
      { id: 'placeholder-3', type: 'placeholder' },
      { id: 'placeholder-4', type: 'placeholder' },
    ];

    return (
      <View style={styles.dashboardContainer}>
        <ThemedText 
          style={styles.welcomeMessage}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {user?.name || 'Empleado'}
        </ThemedText>
        
        <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
                {renderGridItem(gridData[0])}
                {renderGridItem(gridData[1])}
            </View>
            <View style={styles.gridRow}>
                {renderGridItem(gridData[2])}
                {renderGridItem(gridData[3])}
            </View>
            <View style={styles.gridRow}>
                {renderGridItem(gridData[4])}
                {renderGridItem(gridData[5])}
            </View>
        </View>
      </View>
    );
  };

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
        {renderContent()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
    fullScreenCentered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
        borderRadius: 20,
    },
    loadingText: { color: Colors.brand.white, marginTop: RFValue(15), fontSize: RFValue(16) },
    successTitle: { fontSize: RFValue(32), fontWeight: 'bold', color: '#2E7D32', fontFamily: 'OpenSans-SemiBold' },
    successSubtitle: { fontSize: RFValue(16), color: Colors.brand.darkGray, textAlign: 'center' },
    dashboardContainer: {
      flex: 1,
    },
    welcomeMessage: {
      fontSize: RFValue(28),
      fontWeight: 'bold',
      color: Colors.brand.darkBlue,
      fontFamily: 'OpenSans-SemiBold',
      paddingHorizontal: RFValue(20),
      paddingTop: RFValue(20),
      paddingBottom: RFValue(10),
      textAlign: 'center',
      numberOfLines: 1,
      adjustsFontSizeToFit: true,
      minimumFontScale: 0.7,
    },
    gridContainer: {
      flex: 1,
      flexDirection: 'column', 
      padding: RFValue(10),
    },
    gridRow: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    gridItem: {
      flex: 1,
      margin: RFValue(10),
      borderRadius: 20,
      backgroundColor: Colors.brand.white,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 8,
      overflow: 'visible',
      aspectRatio: 1,
    },
    gridItemText: {
      position: 'absolute',
      bottom: RFValue(20),
      fontSize: RFValue(18),
      fontWeight: '600',
      color: Colors.brand.darkBlue,
      fontFamily: 'OpenSans-SemiBold',
    },
    placeholderGridItem: {
        backgroundColor: Colors.brand.lightGray,
        shadowOpacity: 0,
        elevation: 0,
    },
});