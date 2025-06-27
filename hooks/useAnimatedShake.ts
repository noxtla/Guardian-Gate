// hooks/useAnimatedShake.ts

import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export const useAnimatedShake = () => {
  const translateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const triggerShake = () => {
    const SHAKE_OFFSET = 10;
    const DURATION = 60;
    translateX.value = withSequence(
      withTiming(-SHAKE_OFFSET, { duration: DURATION / 2 }),
      withTiming(SHAKE_OFFSET, { duration: DURATION }),
      withTiming(-SHAKE_OFFSET, { duration: DURATION }),
      withTiming(SHAKE_OFFSET, { duration: DURATION }),
      withTiming(0, { duration: DURATION / 2 })
    );
  };

  return { animatedStyle, triggerShake };
};