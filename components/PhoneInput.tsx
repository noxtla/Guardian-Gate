// components/PhoneInput.tsx

import React, { useState } from 'react';
import { TextInput, View, Animated, Text } from 'react-native';
import { useAnimatedShake } from '@/hooks/useAnimatedShake';
import { styles } from './styles/PhoneInputStyles'; // Importando estilos separados

interface PhoneInputProps {
  onPhoneNumberChange: (number: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

const formatPhoneNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  // Solo formatear si hay dígitos presentes para una mejor UX al teclear
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
    // Validar si se intentan ingresar caracteres no numéricos (ej. al pegar)
    if (/[a-zA-Z]/.test(text)) {
      setIsError(true);
      triggerShake();
      onValidationChange(false);
      return;
    }
    
    setIsError(false);
    const cleaned = text.replace(/\D/g, '');

    // Limitar a 10 dígitos
    if (cleaned.length > 10) {
        setIsError(true);
        triggerShake();
        onValidationChange(false);
        // No actualizamos el estado para no mostrar más de 10 dígitos formateados
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
          keyboardType="phone-pad"
          autoComplete="tel"
          onChangeText={handleInputChange}
          value={phone}
          maxLength={14} // (999) 999-9999
        />
      </Animated.View>
      {isError && <Text style={styles.errorText}>Please enter a valid 10-digit phone number.</Text>}
    </View>
  );
};

export default React.memo(PhoneInput);