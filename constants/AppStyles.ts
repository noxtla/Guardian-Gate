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
    fontFamily: 'Lato-Bold',
  },

  // ---- Textos ----
  infoText: {
    fontSize: 12,
    color: Colors.brand.gray,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'Lato-Regular',
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
    fontFamily: 'Lato-Regular',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    textAlignVertical: 'center',
  },

  // --- NUEVOS ESTILOS COMUNES PARA EL FLUJO DE AUTENTICACIÓN ---
  authProgressContainer: {
    width: '100%',
    marginBottom: 24,
  },
  authProgressText: {
    alignSelf: 'flex-end',
    color: Colors.brand.gray,
    fontSize: 14,
    marginBottom: 8,
  },
  authProgressBarBackground: {
    height: 8,
    width: '100%',
    backgroundColor: Colors.brand.darkGray,
    borderRadius: 4,
  },
  authProgressBarFill: {
    height: '100%',
    backgroundColor: Colors.brand.lightBlue,
    borderRadius: 4,
  },
  authTitle: {
    fontSize: 22,
    color: Colors.brand.white,
    textAlign: 'center',
    fontWeight: '600',
    maxWidth: '90%',
    fontFamily: 'OpenSans-SemiBold',
  },
  // Añadimos un estilo general para el contenedor de pantallas de autenticación
  // que tienen el mismo padding y alineación central.
  authScreenContentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'center',
    gap: 25, // Espacio entre elementos principales de la pantalla
  },

  // --- NUEVOS ESTILOS PARA LA PANTALLA DE NOTIFICACIONES ---
  notificationSectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.darkGray,
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15, // Align with list items
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: Colors.brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth, // Thin separator
    borderBottomColor: Colors.brand.lightGray,
  },
  notificationAvatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.brand.lightGray, // Background for the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  notificationBotIcon: {
    // Styles for the SystemTreeService icon
  },
  notificationUserAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 24, // Ensures the image is circular
    resizeMode: 'cover',
  },
  notificationContentWrapper: {
    flex: 1,
    marginRight: 10,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.brand.darkBlue,
    fontFamily: 'OpenSans-SemiBold', // Matching the image's bold font
  },
  notificationMetadata: {
    fontSize: 12,
    color: Colors.brand.gray,
    marginTop: 2,
    fontFamily: 'Lato-Regular',
  },
  notificationContent: {
    fontSize: 14,
    color: Colors.brand.darkGray,
    marginTop: 4,
    fontFamily: 'Lato-Regular',
  },
  notificationUnreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand.lightBlue, // Blue dot for unread
    marginLeft: 'auto', // Pushes the dot to the far right
  },
  notificationReadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'transparent', // Transparent dot for read
    borderColor: Colors.brand.lightGray, // Border for visual separation
    borderWidth: 1,
    marginLeft: 'auto',
  },

  // --- ESTILOS PARA LA PANTALLA DE PERFIL ---
  profileSectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.brand.darkBlue,
    marginBottom: 15,
    fontFamily: 'OpenSans-SemiBold',
  },
  profileOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: Colors.brand.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.brand.lightGray,
  },
  profileOptionText: {
    fontSize: 16,
    color: Colors.brand.darkBlue,
    fontFamily: 'Lato-Regular',
    flex: 1,
  },
  profileOptionIconContainer: {
    marginRight: 10,
    width: 30, // Fixed width for icon alignment
    alignItems: 'center',
  },
  profileStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: Colors.brand.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginBottom: 20,
  },
  profileStatItem: {
    alignItems: 'center',
  },
  profileStatNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.brand.darkBlue,
  },
  profileStatLabel: {
    fontSize: 12,
    color: Colors.brand.gray,
    marginTop: 5,
  },
  // NUEVOS ESTILOS
  editProfileButton: {
    backgroundColor: Colors.brand.lightGray, // Fondo gris claro
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25, // Bordes más redondeados
    width: '80%', // Ocupa un buen ancho
    alignSelf: 'center', // Centra el botón
    marginTop: 15, // Espacio superior
    marginBottom: 20, // Espacio inferior
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  editProfileButtonText: {
    color: Colors.brand.darkBlue,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase', // "EDIT PROFILE" en mayúsculas
    fontFamily: 'Lato-Bold', // Utiliza una fuente semibold si es posible
  },
  usernameText: {
    fontSize: 14,
    color: Colors.brand.gray, // Color más claro para el username
    marginTop: 5, // Espacio debajo del nombre
    marginBottom: 5, // Espacio encima de la posición/botón
    fontFamily: 'Lato-Regular',
  },

  // --- ESTILOS PARA HORIZONTAL TAB BAR ---
  horizontalTabBarContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.brand.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.brand.lightGray,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  horizontalTabButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  horizontalTabButtonActive: {
    backgroundColor: Colors.brand.lightBlue,
  },
  horizontalTabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.darkGray,
  },
  horizontalTabButtonTextActive: {
    color: Colors.brand.white,
  },

  // --- ESTILOS PARA FORMULARIO DE EDICIÓN DE PERFIL ---
  editProfileFormContainer: {
    padding: 15,
    backgroundColor: Colors.brand.white,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formInputGroup: {
    marginBottom: 15,
  },
  formLabel: {
    fontSize: 14,
    color: Colors.brand.darkGray,
    marginBottom: 5,
    fontWeight: '600',
  },
  formTextInput: {
    backgroundColor: Colors.brand.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.brand.darkBlue,
  },
  formSaveButton: {
    marginTop: 20,
    marginBottom: 10,
  },
});