// app/biometric.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import { AuthService } from '@/services/authService';
import { useAuth } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import Animated, { useSharedValue, useAnimatedStyle, withSequence, withTiming } from 'react-native-reanimated';

export default function BiometricScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    
    // 1. RECUPERAR TODOS LOS PARÁMETROS, INCLUYENDO 'name' Y 'position'
    const { userId, token, isBiometricEnabled, name, position } = useLocalSearchParams<{ 
        userId: string; 
        token: string; 
        isBiometricEnabled: string;
        name: string;
        position: string;
    }>();
    
    const { login, updateBiometricsStatus } = useAuth();
    
    const cameraRef = useRef<CameraView>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Coloca tu rostro en el centro');

    const flashOpacity = useSharedValue(0);

    const animatedFlashStyle = useAnimatedStyle(() => ({
        opacity: flashOpacity.value,
    }));

    const triggerFlash = () => {
        flashOpacity.value = withSequence(
            withTiming(0.7, { duration: 50 }),
            withTiming(0, { duration: 250 })
        );
    };

    const hasBiometrics = isBiometricEnabled === 'true';

    useEffect(() => {
        if (!permission) {
            requestPermission();
        } else if (!permission.granted) {
            Alert.alert(
                'Permiso Requerido',
                'Necesitamos acceso a tu cámara para la verificación biométrica.',
                [{ text: 'Otorgar Permiso', onPress: requestPermission }]
            );
        }
    }, [permission]);

    const handleVerification = async () => {
        if (!cameraRef.current || isLoading) return;

        triggerFlash();

        setIsLoading(true);
        setMessage(hasBiometrics ? 'Verificando tu rostro...' : 'Registrando tu rostro...');

        try {
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.7,
                base64: false,
            });

            if (!photo?.uri) {
                throw new Error('No se pudo capturar la foto.');
            }

            const { uploadUrl, s3Key } = await AuthService.getUploadUrl(userId, token);

            const response = await FileSystem.uploadAsync(uploadUrl, photo.uri, {
                httpMethod: 'PUT',
                headers: { 'Content-Type': 'image/jpeg' },
                uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
            });

            if (response.status !== 200) {
                console.error('Fallo en la subida a S3:', response.body);
                throw new Error('No se pudo subir la imagen para verificación.');
            }
            
            await AuthService.processFaceImage(userId, s3Key, token, hasBiometrics);

            updateBiometricsStatus(true);
            
            // 2. PASAR TODOS LOS DATOS (name, position) A LA FUNCIÓN 'login' DEL CONTEXTO
            await login(token, userId, true, name, position);

        } catch (error: any) {
            console.error('[Error de Verificación Biométrica]', error);
            Alert.alert('Verificación Fallida', error.message || 'Ocurrió un error desconocido. Por favor, inténtalo de nuevo.');
            setMessage('Verificación fallida. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!permission) {
        return <View style={globalStyles.darkScreenContainer}><ActivityIndicator size="large" color={Colors.brand.white} /></View>;
    }

    if (!permission.granted) {
        return (
            <View style={[globalStyles.darkScreenContainer, styles.centerContent]}>
                <ThemedText style={styles.messageText}>Se requiere acceso a la cámara.</ThemedText>
                <TouchableOpacity style={globalStyles.primaryButton} onPress={requestPermission}>
                    <ThemedText style={globalStyles.primaryButtonText}>Otorgar Permiso</ThemedText>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CameraView style={StyleSheet.absoluteFillObject} facing="front" ref={cameraRef} />

            <Animated.View style={[styles.flashOverlay, animatedFlashStyle]} pointerEvents="none" />

            <View style={styles.overlay}>
                <View style={styles.header}>
                    <View style={globalStyles.authProgressContainer}>
                        <Text style={globalStyles.authProgressText}>3/3</Text>
                        <View style={globalStyles.authProgressBarBackground}><View style={[globalStyles.authProgressBarFill, { width: '100%' }]} /></View>
                    </View>
                    <ThemedText style={globalStyles.authTitle}>Verificación Biométrica</ThemedText>
                </View>

                <View style={styles.footer}>
                    <ThemedText style={styles.messageText}>{message}</ThemedText>
                    <TouchableOpacity
                        style={[globalStyles.primaryButton, isLoading && globalStyles.disabledButton]}
                        onPress={handleVerification}
                        disabled={isLoading}
                    >
                        {isLoading 
                            ? <ActivityIndicator color={Colors.brand.white} /> 
                            : <ThemedText style={globalStyles.primaryButtonText}>{hasBiometrics ? 'Verificar' : 'Registrar Rostro'}</ThemedText>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.brand.darkBlue,
    },
    flashOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: Colors.brand.white,
        zIndex: 1,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        gap: 20,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        padding: 20,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        zIndex: 2,
    },
    header: {
        alignItems: 'center'
    },
    footer: {
        alignItems: 'center',
        gap: 20,
    },
    messageText: {
        fontSize: 18,
        color: Colors.brand.white,
        textAlign: 'center',
        fontWeight: '600',
        padding: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderRadius: 10,
    },
});