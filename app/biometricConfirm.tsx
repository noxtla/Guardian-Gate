// app/biometricConfirm.tsx (VERSIÓN CON FETCH SIMPLIFICADO)

import React, { useState } from 'react';
import { Alert, View, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as FileSystem from 'expo-file-system';

import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { AuthService } from '@/services/authService';

export default function BiometricConfirmScreen() {
    const { imageUri, userId, token, isBiometricEnabled: isBiometricEnabledStr } = useLocalSearchParams<{
        imageUri: string;
        userId: string;
        token: string;
        isBiometricEnabled: string;
    }>();
    
    const isBiometricEnabled = isBiometricEnabledStr === 'true';
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);

    const confirmAndRegister = async () => {
        if (!imageUri || !userId || !token) {
            Alert.alert("Error", "Faltan datos esenciales para continuar.");
            return;
        }
        setIsLoading(true);
        try {
            console.log("[Confirm] Obteniendo URL de subida...");
            const { uploadUrl, s3Key } = await AuthService.getUploadUrl(userId, token);
            console.log("[Confirm] Obteniendo información del archivo...");
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            
            if (!fileInfo.exists) {
                throw new Error("El archivo de imagen no existe.");
            }
            
            // --- INICIO DE LA CORRECCIÓN CLAVE ---
            // Usamos XMLHttpRequest porque es más robusto y de más bajo nivel
            // para subidas binarias que 'fetch' en algunos entornos de React Native.
            console.log("[Confirm] Preparando subida con XMLHttpRequest...");
            const xhr = new XMLHttpRequest();
            await new Promise<void>((resolve, reject) => {
                xhr.onreadystatechange = function () {
                    if (xhr.readyState !== 4) return;
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log("[Confirm] Subida exitosa. Status:", xhr.status);
                        resolve();
                    } else {
                        console.error("[Confirm] Falló la subida. Status:", xhr.status, "Respuesta:", xhr.responseText);
                        reject(new Error(`Error al subir la imagen. Código: ${xhr.status}`));
                    }
                };
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', 'image/jpeg'); // El único header que S3 necesita
                // XMLHttpRequest puede manejar URIs de archivo directamente
                xhr.send({ uri: imageUri, type: 'image/jpeg', name: 'profile.jpg' } as any);
            });
            // --- FIN DE LA CORRECCIÓN CLAVE ---

            console.log("[Confirm] Imagen subida. Procesando en backend...");
            const processResponse = await AuthService.processFaceImage(userId, s3Key, token, isBiometricEnabled);

            Alert.alert("¡Éxito!", processResponse.message || "Verificación completada.", [
                { text: "OK", onPress: () => login(token, userId, true) }
            ]);

        } catch (error: any) {
            console.error("[Confirm] Error en el flujo:", error);
            Alert.alert('Registro Fallido', error.message || "Un error desconocido ha ocurrido.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRetry = () => {
        router.replace({
            pathname: '/biometricCapture',
            params: { userId, token, isBiometricEnabled: isBiometricEnabledStr }
        });
    }

    if (!imageUri) {
        return (
            <View style={styles.container}>
                <ThemedText style={globalStyles.authTitle}>Error</ThemedText>
                <ThemedText style={globalStyles.infoText}>No se ha proporcionado una imagen.</ThemedText>
                 <TouchableOpacity style={styles.controlButton} onPress={handleRetry}>
                    <ThemedText style={styles.buttonText}>Intentar de Nuevo</ThemedText>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ThemedText style={globalStyles.authTitle}>Revise su foto</ThemedText>
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
            <ThemedText style={globalStyles.infoText}>¿Desea usar esta foto para la verificación?</ThemedText>
            
            {isLoading ? <ActivityIndicator size="large" color={Colors.brand.white} /> : (
                <View style={styles.previewControls}>
                    <TouchableOpacity style={styles.controlButton} onPress={handleRetry}>
                        <ThemedText style={styles.buttonText}>Repetir</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.controlButton, styles.confirmButton]} onPress={confirmAndRegister}>
                        <ThemedText style={styles.buttonText}>Confirmar</ThemedText>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.brand.darkBlue, padding: 20, gap: 20 },
    imagePreview: { width: '90%', aspectRatio: 3/4, borderRadius: 20, borderWidth: 2, borderColor: Colors.brand.lightBlue },
    previewControls: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
    controlButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, backgroundColor: 'rgba(255, 255, 255, 0.2)' },
    confirmButton: { backgroundColor: Colors.brand.lightBlue },
    buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});