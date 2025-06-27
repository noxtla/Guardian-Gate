// components/PhoneInput.tsx

import React, { useState } from 'react';
import { TextInput, View, Animated, Text } from 'react-native';
import { useAnimatedShake } from '@/hooks/useAnimatedShake';
import { styles } from './styles/PhoneInputStyles';
import { Colors } from '@/constants/Colors';

interface PhoneInputProps {
  onPhoneNumberChange: (number: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  const match = cleaned.match(/^(\d{1,3})?(\d{1,3})?(\d{1,4})?$/);
  if (!match) return cleaned;
  
  let formatted = '';
  if (match[1]) formatted += `(${match[1]}`;
  if (match[2]) formatted += `) ${match[2]}`;
  if (match[3]) formatted += `-${match[3]}`;
  
  return formatted;
};

const PhoneInput: React.FC<PhoneInputProps> = ({ onPhoneNumberChange, onValidationChange }) => {
  const [phone, setPhone] = useState('');
  const [isError, setIsError] = useState(false);
  const { animatedStyle, triggerShake } = useAnimatedShake();

  const handleInputChange = (text: string) => {
    if (/[a-zA-Z]/.test(text)) {
      setIsError(true);
      triggerShake();
      onValidationChange(false);
      return;
    }
    
    setIsError(false);
    const cleaned = text.replace(/\D/g, '');

    if (cleaned.length > 10) {
        setIsError(true);
        triggerShake();
        onValidationChange(false);
        return;
    }

    const formattedText = formatPhoneNumber(cleaned);
    setPhone(formattedText);
    onPhoneNumberChange(cleaned);
    onValidationChange(cleaned.length === 10);
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[animatedStyle]}>
        <TextInput
          style={[styles.input, isError && styles.inputError]}
          // --- CAMBIO CLAVE: Cambiar a 'number-pad' para un teclado solo numérico ---
          keyboardType="number-pad" 
          autoComplete="tel"
          onChangeText={handleInputChange}
          value={phone}
          maxLength={14}
          placeholder="(555) 555-5555"
          placeholderTextColor={Colors.brand.gray}
        />
      </Animated.View>
      {isError && <Text style={styles.errorText}>Please enter a valid 10-digit phone number.</Text>}
    </View>
  );
};

export default React.memo(PhoneInput);