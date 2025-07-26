// components/PhoneInput.tsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { Colors } from '@/constants/Colors';

interface CustomPhoneInputProps {
  onPhoneNumberChange: (number: string) => void;
  onValidationChange: (isValid: boolean) => void;
}

// --- 1. CASTING DEL COMPONENTE ---
// Forzamos el tipo del componente importado a 'any' para evitar
// el chequeo de tipo de JSX, y luego lo re-asignamos a una nueva
// constante con un nombre claro para usarla en el JSX.
const PhoneInputComponent = PhoneInput as any;

const CustomPhoneInput: React.FC<CustomPhoneInputProps> = ({
  onPhoneNumberChange,
  onValidationChange,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // --- 2. TIPO 'any' PARA LA REF ---
  // Usamos 'any' para la ref también, para evitar problemas de tipado
  // al acceder a métodos como .isValidNumber()
  const phoneInputRef = useRef<any>(null);

  return (
    <View style={styles.container}>
      <PhoneInputComponent
        ref={phoneInputRef}
        defaultValue={phoneNumber}
        defaultCode="US"
        countryPickerProps={{
          countryCodes: ['US', 'MX', 'PR'],
        }}
        onChangeText={(text: string) => {
          setPhoneNumber(text);
        }}
        onChangeFormattedText={(text: string) => {
          onPhoneNumberChange(text);
          const isValid = phoneInputRef.current?.isValidNumber(text) || false;
          onValidationChange(isValid);
        }}
        layout="first"
        containerStyle={styles.phoneInputContainer}
        textContainerStyle={styles.textContainer}
        textInputStyle={styles.textInput}
        codeTextStyle={styles.codeText}
        flagButtonStyle={styles.flagButton}
        withDarkTheme={true}
        autoFocus
      />
    </View>
  );
};

// ... (estilos sin cambios) ...
const styles = StyleSheet.create({
    container: {
      width: '100%',
      alignItems: 'center',
    },
    phoneInputContainer: {
      width: '100%',
      height: 60,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 15,
      borderWidth: 1,
      borderColor: Colors.brand.gray,
    },
    textContainer: {
      backgroundColor: 'transparent',
      paddingVertical: 0,
      borderTopRightRadius: 15,
      borderBottomRightRadius: 15,
    },
    textInput: {
      color: Colors.brand.white,
      fontSize: 18,
      fontWeight: '600',
      height: 60,
    },
    codeText: {
      color: Colors.brand.white,
      fontSize: 18,
      fontWeight: '600',
    },
    flagButton: {
      width: 70,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default CustomPhoneInput;