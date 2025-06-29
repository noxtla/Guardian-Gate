// components/profile/ProfileInfo.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles';

interface ProfileInfoProps {
  lastActive: string;
  joinedDate: string;
}

const ProfileInfo: React.FC<ProfileInfoProps> = ({ lastActive, joinedDate }) => {
  return (
    <View style={styles.container}>
      <View style={globalStyles.profileOptionItem}>
        <View style={globalStyles.profileOptionIconContainer}>
          <IconSymbol name="clock.fill" size={20} color={Colors.brand.darkBlue} />
        </View>
        <ThemedText style={globalStyles.profileOptionText}>Last Active:</ThemedText>
        <ThemedText style={globalStyles.profileOptionText}>{lastActive}</ThemedText>
      </View>
      <View style={globalStyles.profileOptionItem}>
        <View style={globalStyles.profileOptionIconContainer}>
          <IconSymbol name="calendar" size={20} color={Colors.brand.darkBlue} />
        </View>
        <ThemedText style={globalStyles.profileOptionText}>Joined Date:</ThemedText>
        <ThemedText style={globalStyles.profileOptionText}>{joinedDate}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.brand.white,
    borderRadius: 10,
    marginBottom: 20,
    overflow: 'hidden', // To ensure border radius clips children
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default ProfileInfo;