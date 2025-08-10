// app/biometric.tsx

import React, { useState, useRef, useCallback } from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Button, Text } from 'react-native';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system'; // <-- ¡Importación clave!
import { SafeAreaView } from 'react-native-safe-area-context';

import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/authService';

export default function BiometricScreen() {
    const { userId, token, isBiometricEnabled: isBiometricEnabledStr } = useLocalSearchParams<{
        userId: string;
        token: string;
        isBiometricEnabled: string;
    }>();

    const isBiometricEnabled = isBiometricEnabledStr === 'true';
    const { login } = useAuth();
    
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);
    
    const cameraRef = useRef<CameraView | null>(null);

    useFocusEffect(
        useCallback(() => {
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
                        cameraRef.current?.takePictureAsync({ quality: 0.5 }).then(photo => {
                            setCapturedImage(photo.uri);
                        }).catch(error => {
                            console.error("Fallo al tomar la foto:", error);
                            Alert.alert("Error", "No se pudo capturar la foto.");
                        });
                    }
                }, 1000);
            }
            return () => {
                if (timer) clearInterval(timer);
                setCountdown(null);
            };
        }, [permission?.granted, capturedImage])
    );

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const confirmAndRegister = async () => {
        console.log("======================================");
        console.log("[BIOMETRIC DEBUG] Iniciando confirmación y registro...");
        console.log("[BIOMETRIC DEBUG] Parámetros recibidos:", { userId, token, isBiometricEnabledStr });
        console.log(`[BIOMETRIC DEBUG] ¿Biometría ya activada? -> ${isBiometricEnabled}`);

        if (!capturedImage || !userId || !token) {
            Alert.alert("Error", "Faltan datos para continuar el proceso.");
            console.error("[BIOMETRIC DEBUG] Faltan datos:", { capturedImage, userId, token });
            return;
        }
        setIsLoading(true);
        
        try {
            console.log(`[BIOMETRIC DEBUG] Paso 1: Solicitando URL de subida para userId: ${userId}`);
            const { uploadUrl, s3Key } = await AuthService.getUploadUrl(userId, token);
            console.log(`[BIOMETRIC DEBUG] Paso 1.1: URL recibida. Key: ${s3Key}`);

            // --- INICIO DE LA LÓGICA DE SUBIDA ROBUSTA ---
            console.log("[BIOMETRIC DEBUG] Paso 2: Preparando imagen para la subida...");

            const base64 = await FileSystem.readAsStringAsync(capturedImage, {
                encoding: FileSystem.EncodingType.Base64,
            });
            
            const base64Response = await fetch(`data:image/jpeg;base64,${base64}`);
            const imageBlob = await base64Response.blob();
            
            console.log(`[BIOMETRIC DEBUG] Blob de imagen creado. Tamaño: ${imageBlob.size} bytes.`);
            // --- FIN DE LA LÓGICA DE SUBIDA ROBUSTA ---

            console.log("[BIOMETRIC DEBUG] Paso 2.1: Subiendo imagen a S3...");
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'image/jpeg',
                    'Content-Length': imageBlob.size.toString(),
                },
                body: imageBlob,
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error("[BIOMETRIC DEBUG] Error de S3:", errorText);
                throw new Error('Falló la subida de la imagen a nuestro servidor.');
            }
            console.log(`[BIOMETRIC DEBUG] Paso 2.2: Imagen subida con éxito.`);

            console.log("[BIOMETRIC DEBUG] Paso 3: Notificando al backend para procesar la imagen...");
            const processResponse = await AuthService.processFaceImage(
                userId, 
                s3Key, 
                token, 
                isBiometricEnabled
            );
            
            console.log("[BIOMETRIC DEBUG] Paso 3.1: Respuesta del procesamiento:", processResponse);

            Alert.alert("¡Éxito!", processResponse.message || "Su verificación biométrica ha sido completada.", [
                { text: "OK", onPress: () => {
                    login(token, userId, true);
                }}
            ]);

        } catch (error: any) {
            console.error("[BIOMETRIC DEBUG] Error en el flujo:", error.message);
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