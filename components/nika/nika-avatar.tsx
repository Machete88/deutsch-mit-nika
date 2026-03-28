import React, { useEffect, useRef } from 'react';
import { View, Image, ImageSourcePropType, StyleSheet, Animated } from 'react-native';
import { NikaOutfit } from '@/lib/nika-types';

const CDN = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663487380385/BXeVnGCbdDbGSTbQB9nRKD';

const OUTFIT_IMAGES: Record<string, ImageSourcePropType> = {
  nika_hero:          { uri: `${CDN}/nika_hero_814a39da.png` },
  nika_classic:       { uri: `${CDN}/nika_classic_b2ce4bf5.png` },
  nika_study_hoodie:  { uri: `${CDN}/nika_study_hoodie_758a7c65.png` },
  nika_pink_bow:      { uri: `${CDN}/nika_pink_bow_f377bb96.png` },
  nika_exam_queen:    { uri: `${CDN}/nika_exam_queen_b5bea23c.png` },
  nika_listening:     { uri: `${CDN}/nika_listening_cafdbe0c.png` },
  nika_home_greeting: { uri: `${CDN}/nika_home_greeting_445427c5.png` },
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
  speaking?: boolean;
  style?: object;
  rounded?: boolean;
  glowColor?: string;
}

export function NikaAvatar({
  outfit,
  size = 120,
  listening = false,
  speaking = false,
  style,
  rounded = true,
  glowColor,
}: NikaAvatarProps) {
  const imageKey = listening ? 'nika_listening' : outfit?.image ?? 'outfit_classic';
  const source: ImageSourcePropType = (OUTFIT_IMAGES[imageKey] ?? OUTFIT_IMAGES['outfit_classic']) as ImageSourcePropType;

  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (speaking) {
      const bounce = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -4, duration: 160, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 160, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: -2, duration: 120, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
        ])
      );
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, { toValue: 1, duration: 400, useNativeDriver: false }),
          Animated.timing(glowAnim, { toValue: 0.4, duration: 400, useNativeDriver: false }),
        ])
      );
      bounce.start();
      glow.start();
      return () => {
        bounce.stop();
        glow.stop();
        bounceAnim.setValue(0);
        glowAnim.setValue(0);
      };
    } else if (listening) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: -2, duration: 500, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => {
        pulse.stop();
        bounceAnim.setValue(0);
      };
    } else {
      bounceAnim.setValue(0);
      glowAnim.setValue(0);
    }
  }, [speaking, listening]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.8] });
  const effectiveGlow = glowColor ?? '#9D5FF3';

  return (
    <Animated.View
      style={[
        styles.container,
        { width: size, height: size },
        style,
        { transform: [{ translateY: bounceAnim }] },
      ]}
    >
      {(speaking || listening) && (
        <Animated.View
          style={[
            styles.glowRing,
            {
              width: size + 16,
              height: size + 16,
              borderRadius: rounded ? (size + 16) / 2 : (size + 16) * 0.22,
              borderColor: effectiveGlow,
              opacity: glowOpacity,
              top: -8,
              left: -8,
            },
          ]}
        />
      )}
      <Image
        source={source}
        style={{
          width: size,
          height: size,
          borderRadius: rounded ? size / 2 : size * 0.2,
        }}
        resizeMode="cover"
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    borderWidth: 2.5,
  },
});
