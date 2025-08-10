// app/biometricCapture.tsx (VERSIÓN FINAL CON onCameraReady)

import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Text, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BiometricCaptureScreen() {
    const params = useLocalSearchParams();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    // Nuevo estado para saber si la cámara está lista
    const [isCameraReady, setIsCameraReady] = useState(false);

    useEffect(() => {
        if (!permission) {
            requestPermission();
        }
    }, []);

    const handleCameraReady = () => {
        console.log('[Capture] Evento onCameraReady disparado. La cámara está lista.');
        setIsCameraReady(true);
    };

    const takePictureAndNavigate = async () => {
        if (!isCameraReady || isProcessing) {
            console.log('[Capture] Intento de tomar foto, pero la cámara no está lista o ya está procesando.');
            return;
        }

        console.log('[Capture] Iniciando toma de foto...');
        setIsProcessing(true);

        try {
            const photo = await cameraRef.current?.takePictureAsync({ quality: 0.2 });

            if (!photo || !photo.uri) {
                throw new Error("La cámara no devolvió una foto válida.");
            }
            console.log('[Capture] Foto tomada en caché. URI temporal:', photo.uri);

            const newUri = `${FileSystem.documentDirectory}biometric_${Date.now()}.jpg`;
            console.log('[Capture] Moviendo archivo a:', newUri);
            
            await FileSystem.moveAsync({ from: photo.uri, to: newUri });
            console.log('[Capture] Archivo movido con éxito. Navegando...');
            
            router.replace({
                pathname: '/biometricConfirm',
                params: { ...params, imageUri: newUri },
            });

        } catch (error: any) {
            console.error("[Capture] Error en el proceso de captura:", error);
            Alert.alert("Error de Cámara", "No se pudo procesar la foto.", [
                { text: "OK", onPress: () => router.back() }
            ]);
            // Reiniciar el estado para permitir un reintento si el usuario vuelve
            setIsProcessing(false);
        }
    };

    // Usamos useEffect para disparar la foto una vez que la cámara esté lista
    useEffect(() => {
        if (isCameraReady) {
            // Un pequeño delay para asegurar que la UI esté estable
            const timer = setTimeout(takePictureAndNavigate, 500);
            return () => clearTimeout(timer);
        }
    }, [isCameraReady]);

    if (!permission) return <View style={styles.container}><ActivityIndicator color="white" /></View>; 
    
    if (!permission.granted) return (
        <SafeAreaView style={styles.container}>
            <ThemedText style={styles.text}>Se necesita permiso de la cámara.</ThemedText>
        </SafeAreaView>
    );

    return (
        <View style={styles.container}>
            <CameraView 
                style={StyleSheet.absoluteFill} 
                facing="front" 
                ref={cameraRef}
                onCameraReady={handleCameraReady} // <-- Aquí está la magia
            />
            <View style={styles.overlay}>
                {isProcessing ? (
                    <ActivityIndicator size="large" color="white" />
                ) : (
                    <ThemedText style={styles.text}>Mantenga el rostro centrado</ThemedText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.brand.darkBlue, justifyContent: 'center', alignItems: 'center', padding: 20 },
    overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
    text: { fontSize: 22, color: 'white', fontWeight: 'bold', textAlign: 'center' }
});