// constants/AppStyles.ts

import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const globalStyles = StyleSheet.create({
  // ---- Contenedores ----
  darkScreenContainer: {
    flex: 1,
    backgroundColor: Colors.brand.darkBlue,
  },
  lightScreenContainer: {
    flex: 1,
    backgroundColor: Colors.brand.white,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 30,
  },

  // ---- Botones ----
  primaryButton: {
    backgroundColor: Colors.brand.lightBlue,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  disabledButton: {
    backgroundColor: Colors.brand.darkGray,
    opacity: 0.7,
  },
  primaryButtonText: {
    color: Colors.brand.white,
    fontSize: 18,
    fontWeight: '600',
  },

  // ---- Textos ----
  infoText: {
    fontSize: 12,
    color: Colors.brand.gray,
    textAlign: 'center',
    marginBottom: 10,
  },
  
  // ---- Inputs ----
  textInput: {
    backgroundColor: Colors.brand.white,
    width: '100%',
    padding: 15,
    borderRadius: 10,
    fontSize: 18,
    color: Colors.brand.darkGray,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});