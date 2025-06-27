// components/styles/PhoneInputStyles.ts

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    backgroundColor: Colors.brand.white,
    color: Colors.brand.darkBlue,
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    borderRadius: 15,
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    letterSpacing: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#D32F2F', // Color rojo para el borde de error
  },
  errorText: {
    color: '#FFCDD2', // Color de texto de error
    marginTop: 8,
    fontSize: 14,
  },
});