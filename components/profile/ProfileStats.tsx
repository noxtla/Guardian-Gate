// components/profile/ProfileStats.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { globalStyles } from '@/constants/AppStyles';

interface ProfileStatsProps {
  contributions: number;
  followers: number;
  following: number;
}

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={globalStyles.profileStatItem}>
    <ThemedText style={globalStyles.profileStatNumber}>{value}</ThemedText>
    <ThemedText style={globalStyles.profileStatLabel}>{label}</ThemedText>
  </View>
);

const ProfileStats: React.FC<ProfileStatsProps> = ({ contributions, followers, following }) => {
  return (
    <View style={globalStyles.profileStatsContainer}>
      <StatItem label="Contributions" value={contributions} />
      <StatItem label="Followers" value={followers} />
      <StatItem label="Following" value={following} />
    </View>
  );
};

export default ProfileStats;