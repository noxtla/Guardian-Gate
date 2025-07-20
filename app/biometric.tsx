// app/biometric.tsx
import React, { useState } from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Button } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera'; // <-- CAMBIO: Importaciones modernas
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
    
    // CAMBIO: Se usa el hook para gestionar permisos. Es más simple y declarativo.
    const [permission, requestPermission] = useCameraPermissions();
    const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    
    // CAMBIO: La ref ahora apunta al tipo 'CameraView'
    const cameraRef = React.useRef<CameraView | null>(null);

    const takePicture = async () => {
        if (cameraRef.current && !isLoading) {
            setIsLoading(true);
            try {
                // Tomamos la foto con calidad media para que no sea muy pesada
                const photo = await cameraRef.current.takePictureAsync({ quality: 0.5 });
                setCapturedImage(photo.uri);
            } catch (error) {
                console.error("Failed to take picture:", error);
                Alert.alert("Error", "No se pudo capturar la foto.");
            } finally {
                setIsLoading(false);
            }
        }
    };

    const retakePicture = () => {
        setCapturedImage(null);
    };

    const confirmAndRegister = async () => {
        if (!capturedImage) return;
        setIsLoading(true);
        
        try {
            // Paso 1: Autenticar al usuario para obtener su token y userId
            const { token, userId } = await AuthService.verifyIdentity(
                phone!, parseInt(day!, 10), parseInt(month!, 10), parseInt(year!)
            );

            // Paso 2: Convertir la imagen a formato Base64
            const imageBase64 = await FileSystem.readAsStringAsync(capturedImage, {
                encoding: FileSystem.EncodingType.Base64,
            });

            // Paso 3: Enviar la imagen para el registro facial
            await AuthService.registerFace(userId, imageBase64);

            Alert.alert("¡Éxito!", "Su rostro ha sido registrado correctamente.", [
                { text: "OK", onPress: () => {
                    // Paso 4: Completar el proceso de login en la app
                    login(token, userId, true); // Marcamos biometría como 'true'
                }}
            ]);

        } catch (error: any) {
            Alert.alert('Registro Fallido', error.message || 'No se pudo completar el registro.');
            setIsLoading(false);
        }
    };
    
    // --- Renderizado Condicional Actualizado ---
    if (!permission) {
        // Los permisos aún se están cargando
        return <View style={styles.container}><ActivityIndicator size="large" color={Colors.brand.lightBlue} /></View>;
    }

    if (!permission.granted) {
        // El usuario no ha concedido los permisos
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
                    // CAMBIO: Se usa el componente CameraView con la prop 'facing'
                    <CameraView style={styles.camera} facing="front" ref={cameraRef} />
                )}
            </View>

            <ThemedText style={globalStyles.infoText}>Centre su rostro en el marco y tome una foto.</ThemedText>

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
                    <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
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
    captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'white' },
    controlButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    confirmButton: { backgroundColor: Colors.brand.lightBlue },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});