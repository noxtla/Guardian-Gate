// app/(tabs)/Profile.tsx

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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
// [1] IMPORTAR EL HOOK useAuth
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  
  // [2] OBTENER user, logout, y isLoadingAuth DEL CONTEXTO
  const { user, logout, isLoadingAuth } = useAuth();

  // [3] CREAR LA FUNCIÓN QUE MANEJA EL EVENTO DE PRESIONAR EL BOTÓN
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out", 
      "Are you sure you want to sign out?", 
      [
        { text: "Cancel", style: "cancel" },
        // Al presionar "Sign Out", se llama a la función logout del contexto
        { text: "Sign Out", onPress: () => logout(), style: "destructive" },
      ]
    );
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
        data={[]}
        renderItem={() => null}
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.contentPadding}>
            <ProfileHeader 
              name={user.name} 
              username={user.userId.split('-')[0]} // Muestra una parte del UUID como username
              position={user.position}
            />
            
            <TouchableOpacity style={globalStyles.editProfileButton} onPress={handleEditProfile}>
              <ThemedText style={globalStyles.editProfileButtonText}>EDIT PROFILE</ThemedText>
            </TouchableOpacity>
            
            {/* [4] CONECTAR handleSignOut AL EVENTO onPress DEL BOTÓN */}
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
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',
    gap: 10,
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