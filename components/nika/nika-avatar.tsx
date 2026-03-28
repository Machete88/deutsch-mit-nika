import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NikaOutfit } from '@/lib/nika-types';

const OUTFIT_IMAGES: Record<string, ReturnType<typeof require>> = {
  nika_hero: require('@/assets/nika/nika_hero.png'),
  nika_classic: require('@/assets/nika/nika_classic.png'),
  nika_study_hoodie: require('@/assets/nika/nika_study_hoodie.png'),
  nika_pink_bow: require('@/assets/nika/nika_pink_bow.png'),
  nika_exam_queen: require('@/assets/nika/nika_exam_queen.png'),
  nika_listening: require('@/assets/nika/nika_listening.png'),
  nika_home_greeting: require('@/assets/nika/nika_home_greeting.png'),
};

interface NikaAvatarProps {
  outfit?: NikaOutfit | null;
  size?: number;
  listening?: boolean;
  style?: object;
}

export function NikaAvatar({ outfit, size = 120, listening = false, style }: NikaAvatarProps) {
  const imageKey = listening
    ? 'nika_listening'
    : outfit?.image ?? 'nika_hero';

  const source = OUTFIT_IMAGES[imageKey] ?? OUTFIT_IMAGES['nika_hero'];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
});
