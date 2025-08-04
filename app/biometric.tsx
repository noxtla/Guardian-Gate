// app/biometric.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Button, Text } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import { SafeAreaView } from 'react-native-safe-area-context';

import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/authService';

export default function BiometricScreen() {
    const { phone, month, day, year } = useLocalSearchParams<{ phone: string; month: string; day: string; year: string }>();
    const { login } = useAuth();
    
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    
    const cameraRef = useRef<CameraView | null>(null);

    useFocusEffect(
        useCallback(() => {
            // [CORRECCIÓN] Se usa ReturnType<typeof setInterval> para que el tipo sea universal
            // y compatible con el 'number' que devuelve en React Native.
            let timer: ReturnType<typeof setInterval> | undefined;

            if (permission?.granted && !capturedImage) {
                let currentCount = 3;
                setCountdown(currentCount);

                timer = setInterval(() => {
                    currentCount -= 1;
                    setCountdown(currentCount);

                    if (currentCount === 0) {
                        clearInterval(timer);
                        setCountdown(null);
                        
                        if (cameraRef.current) {
                            cameraRef.current.takePictureAsync({ quality: 0.5 })
                                .then(photo => {
                                    setCapturedImage(photo.uri);
                                })
                                .catch(error => {
                                    console.error("Fallo al tomar la foto:", error);
                                    Alert.alert("Error", "No se pudo capturar la foto.");
                                });
                        }
                    }
                }, 1000);
            }

            return () => {
                if (timer) {
                    clearInterval(timer);
                }
                setCountdown(null);
            };
        }, [permission?.granted, capturedImage])
    );

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const confirmAndRegister = async () => {
        if (!capturedImage) return;
        setIsLoading(true);
        
        try {
            const { token, userId } = await AuthService.verifyIdentity(
                phone!, parseInt(day!, 10), parseInt(month!, 10), parseInt(year!)
            );

            const imageBase64 = await FileSystem.readAsStringAsync(capturedImage, {
                encoding: FileSystem.EncodingType.Base64,
            });

            await AuthService.registerFace(userId, imageBase64);

            Alert.alert("¡Éxito!", "Su rostro ha sido registrado correctamente.", [
                { text: "OK", onPress: () => {
                    login(token, userId, true);
                }}
            ]);

        } catch (error: any) {
            Alert.alert('Registro Fallido', error.message || 'No se pudo completar el registro.');
            setIsLoading(false);
        }
    };
    
    if (!permission) {
        return <View style={styles.container}><ActivityIndicator size="large" color={Colors.brand.lightBlue} /></View>;
    }

    if (!permission.granted) {
        return (
            <SafeAreaView style={styles.permissionContainer}>
                <ThemedText style={globalStyles.authTitle}>Acceso a la cámara</ThemedText>
                <ThemedText style={globalStyles.infoText}>Para registrar su rostro, necesitamos permiso para usar la cámara.</ThemedText>
                <Button title="Conceder Permiso" onPress={requestPermission} color={Colors.brand.lightBlue} />
            </SafeAreaView>
        );
    }
    
    return (
        <View style={styles.container}>
            <ThemedText style={globalStyles.authTitle}>Registro Facial</ThemedText>
            
            <View style={styles.cameraContainer}>
                {capturedImage ? (
                    <Image source={{ uri: capturedImage }} style={styles.camera} />
                ) : (
                    <CameraView style={styles.camera} facing="front" ref={cameraRef}>
                        {countdown !== null && countdown > 0 && (
                            <View style={styles.countdownOverlay}>
                                <Text style={styles.countdownText}>{countdown}</Text>
                            </View>
                        )}
                    </CameraView>
                )}
            </View>

            <ThemedText style={globalStyles.infoText}>
                {capturedImage ? 'Revise la foto.' : 'Mantenga el rostro centrado. La foto se tomará automáticamente.'}
            </ThemedText>

            <View style={styles.controlsContainer}>
                {isLoading ? (
                    <ActivityIndicator size="large" color={Colors.brand.white} />
                ) : capturedImage ? (
                    <View style={styles.previewControls}>
                        <TouchableOpacity style={styles.controlButton} onPress={retakePicture}>
                            <ThemedText style={styles.buttonText}>Repetir</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.controlButton, styles.confirmButton]} onPress={confirmAndRegister}>
                            <ThemedText style={styles.buttonText}>Confirmar</ThemedText>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <ThemedText style={styles.instructionText}>Prepárate...</ThemedText>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.brand.darkBlue, padding: 20 },
    permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.brand.darkBlue, padding: 30, gap: 20 },
    cameraContainer: { width: '90%', aspectRatio: 3/4, borderRadius: 20, overflow: 'hidden', marginVertical: 20, borderWidth: 2, borderColor: Colors.brand.lightBlue },
    camera: { flex: 1 },
    controlsContainer: { height: 100, width: '100%', position: 'absolute', bottom: 40, justifyContent: 'center', alignItems: 'center' },
    previewControls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    controlButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    confirmButton: { backgroundColor: Colors.brand.lightBlue },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    countdownOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    countdownText: {
        fontSize: 120,
        color: 'white',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
    },
    instructionText: {
        fontSize: 18,
        color: Colors.brand.white,
        fontWeight: '600',
    }
});