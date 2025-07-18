// app/(tabs)/Profile.tsx
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  FlatList,
  View,
  Platform,
  Alert,
  ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import ProfileHeader from '@/components/profile/ProfileHeader';
// --- REMOVED: ProfileInfo and ProfileStats components are no longer needed.
// import ProfileInfo from '@/components/profile/ProfileInfo';
// import ProfileStats from '@/components/profile/ProfileStats';

interface UserData {
  Name: string;
  username: string;
  Position: string;
  avatarSource?: ImageSourcePropType;
}

const mockUserData: UserData = {
  Name: "User",
  username: "1000258060",
  Position: "Trimmer",
};

// --- REMOVED: mockProfileData is no longer used as the components displaying this data have been removed.
// const mockProfileData = { ... };

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout, isLoadingAuth } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    setUserData(mockUserData);
  }, []);

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

  if (isLoadingAuth || !userData) {
    return <ThemedView style={[globalStyles.lightScreenContainer, styles.loadingContainer]}><ThemedText>Loading Profile...</ThemedText></ThemedView>;
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
            <ProfileHeader name={userData.Name} username={userData.username} position={userData.Position} avatarSource={userData.avatarSource} />
            <TouchableOpacity style={globalStyles.editProfileButton} onPress={handleEditProfile}>
              <ThemedText style={globalStyles.editProfileButtonText}>EDIT PROFILE</ThemedText>
            </TouchableOpacity>
            
            {/* --- REMOVED ---
              The ProfileInfo, ProfileStats, separator, and Activity sections
              have been removed to simplify the UI as per your request.
            */}

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
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15, backgroundColor: Colors.brand.white, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.brand.lightGray },
  menuIconPlaceholder: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: '600', color: Colors.brand.darkBlue, fontFamily: 'OpenSans-SemiBold' },
  threeDotsIconPlaceholder: { padding: 5 },
  listContentContainer: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  contentPadding: { paddingHorizontal: 20, paddingTop: 10 },
  // --- REMOVED: Unused styles for separator and activityContainer.
  signOutButton: { 
    backgroundColor: '#D32F2F', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8, 
    marginTop: 40, // Added margin to create space after removing other elements
  },
  signOutIcon: { marginRight: 5 },
});