// app/otc.tsx

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { globalStyles } from '@/constants/AppStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';

// Lógica de escalado (sin cambios)
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GUIDELINE_BASE_WIDTH = 390;
const scale = (size: number) => (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;
const moderateScale = (size: number, factor = 0.5): number => {
  const newSize = size + (scale(size) - size) * factor;
  return Math.round(newSize);
};

// --- 1. RESTAURAR LA FUNCIÓN formatOtc ---
const formatOtc = (text: string): string => {
  if (typeof text !== 'string') return ''; // Protección adicional
  const cleaned = text.replace(/\D/g, '');
  const truncated = cleaned.substring(0, 6);
  if (truncated.length > 3) {
    return `${truncated.slice(0, 3)}-${truncated.slice(3)}`;
  }
  return truncated;
};

export default function OtcScreen() {
  const [otc, setOtc] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // --- 2. CÁLCULO SEGURO DE isOtcValid ---
  const isOtcValid = (otc || '').replace(/\D/g, '').length === 6;

  const handleOtcChange = (text: string) => {
    const formattedText = formatOtc(text);
    setOtc(formattedText);
  };

  const handleContinue = async () => {
    if (!isOtcValid || isLoading) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    router.push('/ssn');
    setIsLoading(false);
  };

  const handleResend = () => {
    console.log("Reenviando código...");
  };

  return (
    <SafeAreaView style={globalStyles.darkScreenContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={globalStyles.authScreenContentContainer}>
            
            <View style={globalStyles.authProgressContainer}>
              <Text style={globalStyles.authProgressText}>1/4</Text>
              <View style={globalStyles.authProgressBarBackground}>
                <View style={[globalStyles.authProgressBarFill, { width: '25%' }]} />
              </View>
            </View>

            <IconSymbol name="message.fill" size={80} color={Colors.brand.lightBlue} />
            
            <ThemedText style={globalStyles.authTitle}>
              Enter the code we sent to your phone.
            </ThemedText>

            <TextInput
              style={globalStyles.textInput}
              placeholder="123-456"
              placeholderTextColor={Colors.brand.gray}
              keyboardType="number-pad"
              value={otc}
              onChangeText={handleOtcChange}
              maxLength={7}
              editable={!isLoading}
            />

            <TouchableOpacity
              style={[
                globalStyles.primaryButton,
                (!isOtcValid || isLoading) && globalStyles.disabledButton,
              ]}
              disabled={!isOtcValid || isLoading}
              onPress={handleContinue}>
              {isLoading ? (
                <ActivityIndicator color={Colors.brand.white} />
              ) : (
                <ThemedText style={globalStyles.primaryButtonText}>Continue</ThemedText>
              )}
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <ThemedText style={[globalStyles.infoText, styles.adaptiveInfoText]}>
                    {"Didn't receive a code? "}
                </ThemedText>
                <TouchableOpacity onPress={handleResend}>
                    <ThemedText style={[globalStyles.infoText, styles.adaptiveInfoText, { color: Colors.brand.lightBlue, fontWeight: 'bold' }]}>
                        Resend
                    </ThemedText>
                </TouchableOpacity>
            </View>
            
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    adaptiveInfoText: {
        fontSize: moderateScale(12, 0.4),
    }
});