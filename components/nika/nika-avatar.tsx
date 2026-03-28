import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NikaOutfit } from '@/lib/nika-types';

// ── Alle verfügbaren Outfit-Bilder ────────────────────────────────────────────
const OUTFIT_IMAGES: Record<string, ReturnType<typeof require>> = {
  // Legacy keys (für Rückwärtskompatibilität)
  nika_hero:          require('@/assets/nika/nika_hero.png'),
  nika_classic:       require('@/assets/nika/nika_classic.png'),
  nika_study_hoodie:  require('@/assets/nika/nika_study_hoodie.png'),
  nika_pink_bow:      require('@/assets/nika/nika_pink_bow.png'),
  nika_exam_queen:    require('@/assets/nika/nika_exam_queen.png'),
  nika_listening:     require('@/assets/nika/nika_listening.png'),
  nika_home_greeting: require('@/assets/nika/nika_home_greeting.png'),

  // Neue Outfit-Bilder aus den hochgeladenen Sets
  outfit_classic:       require('@/assets/nika/outfit_classic.png'),
  outfit_study_hoodie:  require('@/assets/nika/outfit_study_hoodie.png'),
  outfit_pink_bow:      require('@/assets/nika/outfit_pink_bow.png'),
  outfit_cozy2:         require('@/assets/nika/outfit_cozy2.png'),
  outfit_headset_coach: require('@/assets/nika/outfit_headset_coach.png'),
  outfit_exam_queen:    require('@/assets/nika/outfit_exam_queen.png'),
  outfit_princess:      require('@/assets/nika/outfit_princess.png'),
  outfit_cozy_blanket:  require('@/assets/nika/outfit_cozy_blanket.png'),
  outfit_neon:          require('@/assets/nika/outfit_neon.png'),
  outfit_teacher:       require('@/assets/nika/outfit_teacher.png'),
  outfit_traveler:      require('@/assets/nika/outfit_traveler.png'),
  outfit_royal:         require('@/assets/nika/outfit_royal.png'),
};

interface NikaAvatarProps {
  outfit?: NikaOutfit | null;
  size?: number;
  listening?: boolean;
  style?: object;
  rounded?: boolean;
}

export function NikaAvatar({ outfit, size = 120, listening = false, style, rounded = true }: NikaAvatarProps) {
  const imageKey = listening
    ? 'nika_listening'
    : outfit?.image ?? 'outfit_classic';

  const source = OUTFIT_IMAGES[imageKey] ?? OUTFIT_IMAGES['outfit_classic'];

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? size / 2 : size * 0.2,
        }}
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
