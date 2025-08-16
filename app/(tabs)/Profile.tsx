// app/(tabs)/Profile.tsx
// INICIO DEL ARCHIVO COMPLETO Y FINAL

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Platform,
  Alert,
  ActivityIndicator, // Importar ActivityIndicator para el estado de carga
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  
  // 1. OBTENER LOS DATOS REALES DEL USUARIO Y EL ESTADO DE CARGA DEL CONTEXTO
  const { user, logout, isLoadingAuth } = useAuth();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", onPress: async () => { await logout(); }, style: "destructive" },
    ]);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.menuIconPlaceholder}>
        <IconSymbol name="list.bullet" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      <TouchableOpacity style={styles.threeDotsIconPlaceholder}>
        <IconSymbol name="ellipsis" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
    </View>
  );

  // 2. MOSTRAR UN INDICADOR DE CARGA MIENTRAS EL CONTEXTO SE HIDRATA O SI NO HAY DATOS DEL USUARIO
  if (isLoadingAuth || !user) {
    return (
        <ThemedView style={[globalStyles.lightScreenContainer, styles.loadingContainer]}>
            <ActivityIndicator size="large" color={Colors.brand.lightBlue} />
            <ThemedText>Loading Profile...</ThemedText>
        </ThemedView>
    );
  }

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
      {renderHeader()}
      <FlatList
        data={[]} // La lista es solo un contenedor para el header que es scrolleable
        renderItem={() => null}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.contentPadding}>
            {/* 3. PASAR LOS DATOS REALES DEL USUARIO AL COMPONENTE ProfileHeader */}
            <ProfileHeader 
              name={user.name} 
              username={user.userId} // Puedes usar userId o employeeId si lo añades al contexto
              position={user.position} 
              // avatarSource se podría manejar en el futuro
            />
            
            <TouchableOpacity style={globalStyles.editProfileButton} onPress={handleEditProfile}>
              <ThemedText style={globalStyles.editProfileButtonText}>EDIT PROFILE</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={[globalStyles.primaryButton, styles.signOutButton]} onPress={handleSignOut}>
              <IconSymbol name="door.right.hand.open.fill" size={20} color={Colors.brand.white} style={styles.signOutIcon} />
              <ThemedText style={globalStyles.primaryButtonText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, // Asegura que ocupe toda la pantalla
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10, // Espacio entre el spinner y el texto
  },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15, backgroundColor: Colors.brand.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.brand.lightGray },
  menuIconPlaceholder: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold' },
  threeDotsIconPlaceholder: { padding: 5 },
  listContentContainer: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  contentPadding: { paddingHorizontal: 20, paddingTop: 10 },
  signOutButton: { 
    backgroundColor: '#D32F2F', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 40,
  },
  signOutIcon: { marginRight: 5 },
});

// FIN DEL ARCHIVO COMPLETO Y FINAL