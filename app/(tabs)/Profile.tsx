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
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileStats from '@/components/profile/ProfileStats';

interface UserData {
  Name: string;
  username: string;
  Position: string;
  avatarSource?: ImageSourcePropType;
}

const mockUserData: UserData = {
  Name: "Jesus Salvador Cortes Gutierrez",
  username: "jesus-salvador-cortes-gutierrez-6489",
  Position: "Computer Engineer",
};

const mockProfileData = {
  contributions: 10,
  followers: 0,
  following: 11,
  joinedDate: "May 8, 2025",
  lastActive: "Active 3d ago",
};

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
      <ThemedText style={styles.skoolLogo}>skool</ThemedText>
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
            <ProfileInfo lastActive={mockProfileData.lastActive} joinedDate={mockProfileData.joinedDate} />
            <ProfileStats contributions={mockProfileData.contributions} followers={mockProfileData.followers} following={mockProfileData.following} />
            <View style={styles.separator} />
            <View style={styles.activityContainer}>
              <ThemedText style={globalStyles.profileSectionHeader}>Activity</ThemedText>
              <View style={styles.activityChartPlaceholder}>
                <IconSymbol name="bolt.fill" size={50} color={Colors.brand.gray} />
                <ThemedText style={globalStyles.infoText}>Activity chart coming soon!</ThemedText>
              </View>
            </View>
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
  headerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingBottom: 15, backgroundColor: Colors.brand.white, height: Platform.OS === 'ios' ? 100 : 80, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.brand.lightGray },
  menuIconPlaceholder: { padding: 5 },
  skoolLogo: { fontSize: 28, fontWeight: 'bold', color: '#E86F28', fontFamily: 'SpaceMono' },
  threeDotsIconPlaceholder: { padding: 5 },
  listContentContainer: { paddingBottom: Platform.OS === 'ios' ? 100 : 80 },
  contentPadding: { paddingHorizontal: 20, paddingTop: 10 },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: Colors.brand.lightGray, marginVertical: 20 },
  activityContainer: { marginBottom: 25 },
  activityChartPlaceholder: { backgroundColor: Colors.brand.lightGray, borderRadius: 10, padding: 20, height: 150, justifyContent: 'center', alignItems: 'center' },
  signOutButton: { backgroundColor: '#D32F2F', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 },
  signOutIcon: { marginRight: 5 },
});