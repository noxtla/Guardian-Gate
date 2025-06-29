// app/profile/edit.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';
import HorizontalTabBar from '@/components/profile/HorizontalTabBar';
import EditProfileForm from '@/components/profile/EditProfileForm';
import { useAuth } from '@/context/AuthContext'; // To potentially get initial user data

// Mock data for user profile to simulate fetching from a backend
interface UserProfileData {
  Name: string;
  Position: string;
  Email: string;
  PhoneNumber: string;
}

const mockUserProfileData: UserProfileData = {
  Name: "John Doe",
  Position: "Field Worker",
  Email: "john.doe@example.com",
  PhoneNumber: "(555) 123-4567",
};

const profileTabLabels = ["Vehicles", "Profile", "DOT", "Driver License", "Warnings", "Special Mentions"];

export default function EditProfilePage() {
  const insets = useSafeAreaInsets();
  const { user, isLoadingAuth } = useAuth(); // Get user from AuthContext
  const [activeTab, setActiveTab] = useState("Profile");
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loadingContent, setLoadingContent] = useState(true);

  useEffect(() => {
    // Simulate fetching user data for editing
    if (!isLoadingAuth) {
      // In a real app, you would fetch the full profile details for 'user.userId'
      // For now, use mock data and set loading to false
      setUserData(mockUserProfileData);
      setLoadingContent(false);
    }
  }, [isLoadingAuth, user]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    if (loadingContent) {
      return (
        <View style={styles.contentPlaceholder}>
          <ActivityIndicator size="large" color={Colors.brand.lightBlue} />
          <ThemedText style={globalStyles.infoText}>Loading content...</ThemedText>
        </View>
      );
    }

    if (!userData) return null; // Should not happen if loadingContent is false and userData is set

    switch (activeTab) {
      case "Profile":
        return <EditProfileForm userData={userData} onSave={() => console.log("Profile Saved!")} />;
      case "Vehicles":
        return <ThemedText style={styles.tabContentPlaceholderText}>Vehicles management coming soon.</ThemedText>;
      case "DOT":
        return <ThemedText style={styles.tabContentPlaceholderText}>DOT information coming soon.</ThemedText>;
      case "Driver License":
        return <ThemedText style={styles.tabContentPlaceholderText}>Driver License details coming soon.</ThemedText>;
      case "Warnings":
        return <ThemedText style={styles.tabContentPlaceholderText}>Warnings history coming soon.</ThemedText>;
      case "Special Mentions":
        return <ThemedText style={styles.tabContentPlaceholderText}>Special Mentions coming soon.</ThemedText>;
      default:
        return null;
    }
  };

  return (
    <ThemedView style={globalStyles.lightScreenContainer}>
      {/* Custom Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="arrow.left" size={24} color={Colors.brand.darkBlue} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Settings</ThemedText>
        <View style={styles.spacer} /> {/* Spacer for centering */}
      </View>

      <HorizontalTabBar labels={profileTabLabels} activeTab={activeTab} onTabClick={handleTabClick} />

      <ScrollView contentContainerStyle={styles.mainContentContainer} showsVerticalScrollIndicator={false}>
        <ThemedText style={globalStyles.profileSectionHeader}>{activeTab}</ThemedText>
        {renderTabContent()}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingBottom: 15,
    backgroundColor: Colors.brand.lightGray,
    height: Platform.OS === 'ios' ? 100 : 80,
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
    flex: 1,
    textAlign: 'center',
    marginRight: -34, // Compensate for backButton padding to truly center
  },
  spacer: {
    width: 34, // Match back button width + padding
  },
  mainContentContainer: {
    padding: 20,
    flexGrow: 1,
  },
  tabContentPlaceholderText: {
    textAlign: 'center',
    color: Colors.brand.gray,
    marginTop: 20,
    fontSize: 16,
  },
  contentPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200, // Ensure it takes some space
  }
});