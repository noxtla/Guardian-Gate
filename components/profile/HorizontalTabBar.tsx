// components/profile/HorizontalTabBar.tsx
import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { globalStyles } from '@/constants/AppStyles';
import { Colors } from '@/constants/Colors';

interface HorizontalTabBarProps {
  labels: string[];
  activeTab: string;
  onTabClick: (tab: string) => void;
}

const HorizontalTabBar: React.FC<HorizontalTabBarProps> = ({ labels, activeTab, onTabClick }) => {
  return (
    <View style={globalStyles.horizontalTabBarContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
      >
        {labels.map((label) => (
          <TouchableOpacity
            key={label}
            style={[
              globalStyles.horizontalTabButton,
              activeTab === label && globalStyles.horizontalTabButtonActive,
            ]}
            onPress={() => onTabClick(label)}
          >
            <ThemedText
              style={[
                globalStyles.horizontalTabButtonText,
                activeTab === label && globalStyles.horizontalTabButtonTextActive,
              ]}
            >
              {label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10, // Add some padding to the sides
  },
});

export default HorizontalTabBar;