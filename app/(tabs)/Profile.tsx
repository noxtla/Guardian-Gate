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
  Alert, // For sign-out confirmation
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext'; // Import useAuth
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ProfileStats from '@/components/profile/ProfileStats';

// Mock data to simulate richer user data beyond AuthContext's basic user
interface UserData {
  Name: string;
  Position: string;
  avatarSource?: ImageSourcePropType;
}

const mockUserData: UserData = {
  Name: "John Doe",
  Position: "Field Worker",
  // avatarSource: require('@/assets/images/john-doe-avatar.png'), // Uncomment and add a real image if available
};

const mockProfileData = {
  contributions: 10,
  followers: 0,
  following: 11,
  joinedDate: "2023-05-08", // Updated to a more realistic past date
  lastActive: "3 days ago", // Changed to more descriptive text
  activityData: Array.from({ length: 182 }, () => Math.floor(Math.random() * 5)), // Placeholder
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { logout, isLoadingAuth } = useAuth(); // Get logout function from AuthContext
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // In a real app, this would fetch detailed user data from an API
    // For now, use mock data
    setUserData(mockUserData);
  }, []);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Sign Out",
          onPress: async () => {
            await logout(); // Call logout from AuthContext
            Alert.alert("Signed Out", "You have been successfully signed out.");
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit'); // Navigate to the new Edit Profile screen
  };

  // Custom header renderer for this screen
  const renderHeader = () => (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <IconSymbol name="arrow.backward" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
      <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      <TouchableOpacity onPress={handleEditProfile} style={styles.settingsButton}>
        <IconSymbol name="gearshape.fill" size={24} color={Colors.brand.darkBlue} />
      </TouchableOpacity>
    </View>
  );

  // Show a loading indicator if authentication state is still loading
  if (isLoadingAuth || !userData) {
    return (
      <ThemedView style={[globalStyles.lightScreenContainer, styles.loadingContainer]}>
        <ThemedText>Loading Profile...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
      {renderHeader()}
      <FlatList
        data={[]} // Using an empty array because components are rendered in ListHeaderComponent
        renderItem={() => null} // No individual items to render
        keyExtractor={(item, index) => index.toString()}
        ListHeaderComponent={
          <View style={styles.contentPadding}>
            <ProfileHeader name={userData.Name} position={userData.Position} avatarSource={userData.avatarSource} />
            <ProfileInfo
              lastActive={mockProfileData.lastActive}
              joinedDate={mockProfileData.joinedDate}
            />
            <ProfileStats
              contributions={mockProfileData.contributions}
              followers={mockProfileData.followers}
              following={mockProfileData.following}
            />

            {/* Separator */}
            <View style={styles.separator} />

            {/* Activity Section Placeholder */}
            <View style={styles.activityContainer}>
              <ThemedText style={globalStyles.profileSectionHeader}>Activity</ThemedText>
              <View style={styles.activityChartPlaceholder}>
                <IconSymbol name="bolt.fill" size={50} color={Colors.brand.gray} />
                <ThemedText style={globalStyles.infoText}>Activity chart coming soon!</ThemedText>
              </View>
            </View>

            {/* Sign Out Button */}
            <TouchableOpacity
              style={[globalStyles.primaryButton, styles.signOutButton]}
              onPress={handleSignOut}>
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Colors.brand.lightGray,
    height: Platform.OS === 'ios' ? 100 : 80, // Adjust height for safe area on iOS
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.brand.lightGray,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.brand.darkBlue,
    fontFamily: 'OpenSans-SemiBold',
    flex: 1, // Allows title to take available space and center
    textAlign: 'center',
    marginRight: -34, // Compensate for settingsButton padding to truly center (24 icon + 5 padding)
  },
  settingsButton: {
    padding: 5,
  },
  listContentContainer: {
    paddingBottom: Platform.OS === 'ios' ? 100 : 80, // Ensure space for tab bar
  },
  contentPadding: {
    paddingHorizontal: 20, // General horizontal padding for sections
    paddingTop: 10,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.brand.lightGray,
    marginVertical: 20,
  },
  activityContainer: {
    marginBottom: 25,
  },
  activityChartPlaceholder: {
    backgroundColor: Colors.brand.lightGray,
    borderRadius: 10,
    padding: 20,
    height: 150, // Fixed height for placeholder
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutButton: {
    backgroundColor: '#D32F2F', // Destructive color for sign out
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  signOutIcon: {
    marginRight: 5,
  },
});