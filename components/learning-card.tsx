import { View, Text, Pressable, Animated, PanResponder } from 'react-native';
import { useState } from 'react';
import { Word } from '@/lib/types';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';

interface LearningCardProps {
  word: Word;
  isFlipped?: boolean;
  onFlip?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onAudioPlay?: () => void;
}

export function LearningCard({ word, isFlipped = false, onFlip, onSwipeLeft, onSwipeRight, onAudioPlay }: LearningCardProps) {
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();
  const [flipped, setFlipped] = useState(isFlipped);
  const [pan] = useState(new Animated.ValueXY());

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > 5,
    onPanResponderMove: (_, gs) => {
      pan.setValue({ x: gs.dx * 0.3, y: 0 });
    },
    onPanResponderRelease: (_, gs) => {
      if (gs.dx > 60 && onSwipeRight) {
        onSwipeRight();
      } else if (gs.dx < -60 && onSwipeLeft) {
        onSwipeLeft();
      }
      Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
    },
  });

  const handleFlip = () => {
    setFlipped(f => !f);
    onFlip?.();
  };

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={{ transform: [{ translateX: pan.x }] }}
    >
      <Pressable
        onPress={handleFlip}
        accessibilityRole="button"
        accessibilityLabel={`Lernkarte: ${word.russian}`}
        accessibilityHint="Tippen zum Umdrehen, nach rechts wischen für leicht, nach links für schwer"
        style={({ pressed }) => ({
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 32,
          borderWidth: 2,
          borderColor: colors.primary,
          minHeight: 320,
          justifyContent: 'center',
          alignItems: 'center',
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ gap: 16, alignItems: 'center', width: '100%' }}>
          {/* Label */}
          <Text style={{ fontSize: fontSizes.xs, color: colors.muted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 2 }}>
            {flipped ? 'Deutsch' : 'Русский'}
          </Text>

          {/* Main Word */}
          {flipped ? (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: fontSizes['5xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center', lineHeight: fontSizes['5xl'] * 1.2 }}>
                {word.german}
              </Text>
              {word.ipa && (
                <Text style={{ fontSize: fontSizes.lg, color: colors.muted, textAlign: 'center' }}>
                  {word.ipa}
                </Text>
              )}
              {word.partOfSpeech && (
                <View style={{ backgroundColor: colors.primary + '20', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.primary, fontWeight: '600' }}>
                    {word.partOfSpeech}
                  </Text>
                </View>
              )}
              {word.examples && word.examples.length > 0 && (
                <View style={{ backgroundColor: colors.background, borderRadius: 12, padding: 12, width: '100%' }}>
                  <Text style={{ fontSize: fontSizes.sm, color: colors.foreground, fontStyle: 'italic', textAlign: 'center' }}>
                    {word.examples[0].de}
                  </Text>
                  <Text style={{ fontSize: fontSizes.xs, color: colors.muted, textAlign: 'center', marginTop: 4 }}>
                    {word.examples[0].ru}
                  </Text>
                </View>
              )}
              {onAudioPlay && (
                <Pressable
                  onPress={onAudioPlay}
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary, borderRadius: 50, paddingHorizontal: 20, paddingVertical: 10,
                    marginTop: 8, opacity: pressed ? 0.8 : 1, transform: [{ scale: pressed ? 0.95 : 1 }],
                  })}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: fontSizes.base }}>
                    🔊 Anhören
                  </Text>
                </Pressable>
              )}
            </View>
          ) : (
            <View style={{ alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: fontSizes['5xl'], fontWeight: '800', color: colors.foreground, textAlign: 'center', lineHeight: fontSizes['5xl'] * 1.2 }}>
                {word.russian}
              </Text>
              <Text style={{ fontSize: fontSizes.base, color: colors.muted, textAlign: 'center' }}>
                {word.category}
              </Text>
              <Text style={{ fontSize: fontSizes.sm, color: colors.muted, marginTop: 8 }}>
                Нажми, чтобы увидеть перевод
              </Text>
            </View>
          )}

          {/* Swipe hints */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 16 }}>
            <Text style={{ fontSize: fontSizes.xs, color: colors.error }}>← Сложно</Text>
            <Text style={{ fontSize: fontSizes.xs, color: colors.success }}>Легко →</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
