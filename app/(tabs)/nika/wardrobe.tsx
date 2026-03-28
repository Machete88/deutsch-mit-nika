import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { NikaOutfit, OutfitRarity } from '@/lib/nika-types';
import { DS } from '@/constants/design';

const RARITY_CONFIG: Record<OutfitRarity, { color: string; bg: string; label: string; icon: string }> = {
  Common:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.12)', label: 'Common',    icon: '⚪' },
  Rare:      { color: '#60A5FA', bg: 'rgba(96,165,250,0.12)',  label: 'Rare',      icon: '🔵' },
  Epic:      { color: '#A855F7', bg: 'rgba(168,85,247,0.15)',  label: 'Epic',      icon: '🟣' },
  Legendary: { color: '#F59E0B', bg: 'rgba(245,158,11,0.15)', label: 'Legendary', icon: '⭐' },
};

export default function WardrobeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { outfits, state, setOutfit } = useNika();
  const [selectedId, setSelectedId] = useState(state.currentOutfitId);

  const handleSelect = (outfit: NikaOutfit) => {
    if (!outfit.unlocked) return;
    setSelectedId(outfit.id);
    setOutfit(outfit.id);
  };

  const selected = outfits.find(o => o.id === selectedId) ?? outfits[0];
  const rarityConfig = RARITY_CONFIG[selected.rarity];
  const unlockedCount = outfits.filter(o => o.unlocked).length;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Ambient orbs */}
      <View style={styles.orb1} pointerEvents="none" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.backText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nikas Kleiderschrank</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>{unlockedCount}/{outfits.length}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}>

        {/* ── Preview Stage ── */}
        <View style={[styles.previewStage, { borderColor: rarityConfig.color + '55' }]}>
          <View style={[styles.previewGlow, { backgroundColor: rarityConfig.color + '0F' }]} />

          {/* Rarity ring */}
          <View style={[styles.avatarRing, { borderColor: rarityConfig.color + '60' }]}>
            <View style={[styles.avatarInner, { backgroundColor: rarityConfig.bg }]}>
              <NikaAvatar outfit={selected} size={100} />
            </View>
          </View>

          <Text style={styles.outfitName}>{selected.name}</Text>

          <View style={[styles.rarityBadge, { backgroundColor: rarityConfig.bg, borderColor: rarityConfig.color + '66' }]}>
            <Text style={styles.rarityIcon}>{rarityConfig.icon}</Text>
            <Text style={[styles.rarityText, { color: rarityConfig.color }]}>{rarityConfig.label}</Text>
          </View>

          <Text style={styles.outfitDesc}>{selected.unlockDescription}</Text>

          {selected.unlocked && selectedId === selected.id && (
            <View style={styles.equippedBadge}>
              <Text style={styles.equippedText}>✓ Ausgerüstet</Text>
            </View>
          )}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {[
            { label: 'Freigeschaltet', value: String(unlockedCount), color: DS.colors.neonGreen },
            { label: 'Gesamt', value: String(outfits.length), color: DS.colors.purple400 },
            { label: 'Streak 🔥', value: String(state.streak), color: '#FB923C' },
          ].map(item => (
            <View key={item.label} style={[styles.statCard, { borderColor: item.color + '33' }]}>
              <Text style={[styles.statValue, { color: item.color }]}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Outfit Grid ── */}
        <Text style={styles.sectionTitle}>Alle Outfits</Text>
        <View style={styles.outfitGrid}>
          {outfits.map(outfit => {
            const isSelected = outfit.id === selectedId;
            const rc = RARITY_CONFIG[outfit.rarity];

            return (
              <Pressable
                key={outfit.id}
                onPress={() => handleSelect(outfit)}
                style={({ pressed }) => [
                  styles.outfitCard,
                  { borderColor: isSelected ? rc.color + '80' : DS.colors.glassBorder },
                  isSelected && { backgroundColor: rc.bg },
                  !outfit.unlocked && styles.outfitCardLocked,
                  pressed && outfit.unlocked && { opacity: 0.85, transform: [{ scale: 0.96 }] },
                ]}
              >
                {/* Rarity top bar */}
                <View style={[styles.outfitRarityBar, { backgroundColor: rc.color }]} />

                <View style={styles.outfitAvatarWrap}>
                  <NikaAvatar outfit={outfit} size={56} />
                  {!outfit.unlocked && (
                    <View style={styles.lockOverlay}>
                      <Text style={styles.lockIcon}>🔒</Text>
                    </View>
                  )}
                  {isSelected && outfit.unlocked && (
                    <View style={[styles.selectedRing, { borderColor: rc.color }]} />
                  )}
                </View>

                <Text style={styles.outfitCardName} numberOfLines={2}>
                  {outfit.name}
                </Text>

                <View style={[styles.rarityDot, { backgroundColor: rc.color }]} />

                {!outfit.unlocked && (
                  <Text style={styles.unlockHint} numberOfLines={2}>
                    {outfit.unlockCondition}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>

        {/* ── Progress ── */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Fortschritt</Text>
            <Text style={styles.progressPct}>{Math.round((unlockedCount / outfits.length) * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(unlockedCount / outfits.length) * 100}%` as any }]} />
          </View>
          <Text style={styles.progressSub}>
            Lerne mehr Wörter und halte deinen Streak, um neue Outfits freizuschalten!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: DS.colors.bg1 },
  orb1: {
    position: 'absolute', top: -80, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  scroll: { paddingHorizontal: DS.space[4] },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: DS.space[4], paddingVertical: DS.space[3],
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  backBtn: {
    width: 36, height: 36, borderRadius: DS.radius.md,
    backgroundColor: DS.colors.glass2, borderWidth: 1,
    borderColor: DS.colors.glassBorder,
    alignItems: 'center', justifyContent: 'center', marginRight: DS.space[3],
  },
  backText: { color: DS.colors.purple300, fontSize: 18, fontWeight: DS.font.bold },
  headerTitle: { flex: 1, color: DS.colors.textPrimary, fontSize: DS.font.md, fontWeight: DS.font.bold },
  headerBadge: {
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderRadius: DS.radius.full, paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: 'rgba(168,85,247,0.3)',
  },
  headerBadgeText: { color: DS.colors.purple300, fontSize: DS.font.xs, fontWeight: DS.font.bold },

  // Preview Stage
  previewStage: {
    alignItems: 'center',
    marginTop: DS.space[4],
    marginBottom: DS.space[4],
    backgroundColor: DS.colors.glass1,
    borderRadius: DS.radius['2xl'],
    borderWidth: 1,
    paddingVertical: DS.space[6],
    paddingHorizontal: DS.space[4],
    overflow: 'hidden',
    position: 'relative',
    ...DS.shadow.md,
  },
  previewGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  avatarRing: {
    width: 130, height: 130, borderRadius: 65,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    marginBottom: DS.space[3],
  },
  avatarInner: {
    width: 116, height: 116, borderRadius: 58,
    alignItems: 'center', justifyContent: 'center',
  },
  outfitName: {
    fontSize: DS.font.xl, fontWeight: DS.font.extrabold,
    color: DS.colors.textPrimary, marginBottom: 8,
  },
  rarityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: DS.radius.full, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 10,
  },
  rarityIcon: { fontSize: 12 },
  rarityText: { fontSize: DS.font.sm, fontWeight: DS.font.bold },
  outfitDesc: {
    color: DS.colors.textMuted, fontSize: DS.font.sm,
    textAlign: 'center', lineHeight: 20, maxWidth: 260,
  },
  equippedBadge: {
    marginTop: DS.space[3],
    backgroundColor: 'rgba(16,185,129,0.15)',
    borderRadius: DS.radius.full, borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.4)',
    paddingHorizontal: 14, paddingVertical: 5,
  },
  equippedText: { color: DS.colors.neonGreen, fontSize: DS.font.xs, fontWeight: DS.font.bold },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: DS.space[5] },
  statCard: {
    flex: 1, backgroundColor: DS.colors.glass1,
    borderRadius: DS.radius.lg, borderWidth: 1,
    paddingVertical: DS.space[3], alignItems: 'center', gap: 4,
  },
  statValue: { fontSize: DS.font.lg, fontWeight: DS.font.extrabold },
  statLabel: { fontSize: DS.font.xs, color: DS.colors.textMuted, textAlign: 'center' },

  sectionTitle: {
    fontSize: DS.font.xs, fontWeight: DS.font.bold, color: DS.colors.textMuted,
    textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: DS.space[3],
  },

  // Outfit Grid
  outfitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: DS.space[5] },
  outfitCard: {
    width: '30.5%', backgroundColor: DS.colors.glass1,
    borderRadius: DS.radius.lg, borderWidth: 1,
    alignItems: 'center', paddingBottom: DS.space[3],
    overflow: 'hidden', position: 'relative',
  },
  outfitRarityBar: { width: '100%', height: 3, marginBottom: DS.space[2] },
  outfitAvatarWrap: { position: 'relative', marginBottom: 6 },
  lockOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(5,3,15,0.6)',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: DS.radius.md,
  },
  lockIcon: { fontSize: 18 },
  selectedRing: {
    position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
    borderRadius: 36, borderWidth: 2,
  },
  outfitCardLocked: { opacity: 0.55 },
  outfitCardName: {
    color: DS.colors.textSecondary, fontSize: 10,
    fontWeight: DS.font.semibold, textAlign: 'center',
    paddingHorizontal: 4,
  },
  rarityDot: { width: 5, height: 5, borderRadius: 3, marginTop: 4 },
  unlockHint: {
    color: DS.colors.textDisabled, fontSize: 9,
    textAlign: 'center', paddingHorizontal: 4, marginTop: 3,
  },

  // Progress
  progressCard: {
    backgroundColor: DS.colors.glass1,
    borderRadius: DS.radius.xl, borderWidth: 1,
    borderColor: DS.colors.glassBorder,
    padding: DS.space[4], marginBottom: DS.space[4],
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: DS.space[2] },
  progressTitle: { color: DS.colors.textPrimary, fontSize: DS.font.sm, fontWeight: DS.font.bold },
  progressPct: { color: DS.colors.purple400, fontSize: DS.font.sm, fontWeight: DS.font.bold },
  progressTrack: {
    height: 6, backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: DS.radius.full, overflow: 'hidden', marginBottom: DS.space[3],
  },
  progressFill: {
    height: '100%', backgroundColor: DS.colors.purple500, borderRadius: DS.radius.full,
  },
  progressSub: { color: DS.colors.textMuted, fontSize: DS.font.xs, lineHeight: 18 },
});
