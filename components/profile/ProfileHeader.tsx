// components/profile/ProfileHeader.tsx
import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { globalStyles } from '@/constants/AppStyles'; // Import globalStyles

interface ProfileHeaderProps {
  name: string;
  username?: string; // Add optional username
  position: string;
  avatarSource?: ImageSourcePropType; // Optional: provide a real image source
}

// Placeholder para el avatar, usando el adaptive-icon.png como genérico
const DEFAULT_AVATAR_PLACEHOLDER: ImageSourcePropType = require('@/assets/images/adaptive-icon.png');

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ name, username, position, avatarSource }) => {
  return (
    <View style={styles.container}>
      <Image
        source={avatarSource || DEFAULT_AVATAR_PLACEHOLDER}
        style={styles.avatar}
      />
      <ThemedText style={styles.name}>{name}</ThemedText>
      {username && <ThemedText style={globalStyles.usernameText}>@{username}</ThemedText>}
      <ThemedText style={styles.position}>{position}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 10,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 15,
    borderColor: Colors.brand.lightBlue,
    borderWidth: 2,
    backgroundColor: Colors.brand.lightGray, // Fallback background
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.brand.darkBlue,
    fontFamily: 'OpenSans-SemiBold',
    // marginBottom removed, now handled by usernameText margin
  },
  position: {
    fontSize: 16,
    color: Colors.brand.gray,
    fontFamily: 'OpenSans-Regular',
  },
});

export default ProfileHeader;