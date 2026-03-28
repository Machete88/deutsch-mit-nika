import React from 'react';
import { View, Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { NikaOutfit } from '@/lib/nika-types';

// ── CDN-URLs für alle Outfit-Bilder (auf S3 hochgeladen) ──────────────────────
const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663487380385/BXeVnGCbdDbGSTbQB9nRKD';

const OUTFIT_IMAGES: Record<string, ImageSourcePropType> = {
  // Legacy keys (für Rückwärtskompatibilität)
  nika_hero:          { uri: `${CDN}/nika_hero_814a39da.png` },
  nika_classic:       { uri: `${CDN}/nika_classic_b2ce4bf5.png` },
  nika_study_hoodie:  { uri: `${CDN}/nika_study_hoodie_758a7c65.png` },
  nika_pink_bow:      { uri: `${CDN}/nika_pink_bow_f377bb96.png` },
  nika_exam_queen:    { uri: `${CDN}/nika_exam_queen_b5bea23c.png` },
  nika_listening:     { uri: `${CDN}/nika_listening_cafdbe0c.png` },
  nika_home_greeting: { uri: `${CDN}/nika_home_greeting_445427c5.png` },
  // Neue Outfit-Bilder
  outfit_classic:       { uri: `${CDN}/outfit_classic_4bdae234.png` },
  outfit_study_hoodie:  { uri: `${CDN}/outfit_study_hoodie_87c064be.png` },
  outfit_pink_bow:      { uri: `${CDN}/outfit_pink_bow_9fbee1b7.png` },
  outfit_cozy2:         { uri: `${CDN}/outfit_cozy2_39490502.png` },
  outfit_headset_coach: { uri: `${CDN}/outfit_headset_coach_503c1d98.png` },
  outfit_exam_queen:    { uri: `${CDN}/outfit_exam_queen_5ee931ae.png` },
  outfit_princess:      { uri: `${CDN}/outfit_princess_c9f077d7.png` },
  outfit_cozy_blanket:  { uri: `${CDN}/outfit_cozy_blanket_e74f439d.png` },
  outfit_neon:          { uri: `${CDN}/outfit_neon_06e32738.png` },
  outfit_teacher:       { uri: `${CDN}/outfit_teacher_2bccfa51.png` },
  outfit_traveler:      { uri: `${CDN}/outfit_traveler_38648eac.png` },
  outfit_royal:         { uri: `${CDN}/outfit_royal_d1352f8b.png` },
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

  const source: ImageSourcePropType = (OUTFIT_IMAGES[imageKey] ?? OUTFIT_IMAGES['outfit_classic']) as ImageSourcePropType;

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
