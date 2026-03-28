import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useNika } from '@/lib/nika-context';
import { NikaAvatar } from '@/components/nika/nika-avatar';
import { NikaOutfit, OutfitRarity } from '@/lib/nika-types';

const RARITY_COLORS: Record<OutfitRarity, string> = {
  Common: '#94A3B8',
  Rare: '#3B82F6',
  Epic: '#A855F7',
  Legendary: '#F59E0B',
};

export default function WardrobeScreen() {
  const router = useRouter();
  const { outfits, state, currentOutfit, setOutfit } = useNika();
  const [selectedId, setSelectedId] = useState(state.currentOutfitId);

  const handleSelect = (outfit: NikaOutfit) => {
    if (!outfit.unlocked) return;
    setSelectedId(outfit.id);
    setOutfit(outfit.id);
  };

  const selected = outfits.find(o => o.id === selectedId) ?? outfits[0];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: '#A78BFA', fontSize: 16 }}>← Zurück</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nikas Kleiderschrank</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Preview Stage */}
      <View style={styles.previewStage}>
        <NikaAvatar outfit={selected} size={120} />
        <Text style={styles.outfitName}>{selected.name}</Text>
        <View style={[styles.rarityBadge, { borderColor: RARITY_COLORS[selected.rarity] }]}>
          <Text style={[styles.rarityText, { color: RARITY_COLORS[selected.rarity] }]}>
            {selected.rarity}
          </Text>
        </View>
        <Text style={styles.outfitDesc}>{selected.unlockDescription}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{outfits.filter(o => o.unlocked).length}</Text>
          <Text style={styles.statLabel}>Freigeschaltet</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{outfits.length}</Text>
          <Text style={styles.statLabel}>Gesamt</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{state.streak}</Text>
          <Text style={styles.statLabel}>Streak 🔥</Text>
        </View>
      </View>

      {/* Outfit Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        <Text style={styles.sectionTitle}>Alle Outfits</Text>
        <View style={styles.outfitGrid}>
          {outfits.map(outfit => {
            const isSelected = outfit.id === selectedId;
            const rarityColor = RARITY_COLORS[outfit.rarity];

            return (
              <Pressable
                key={outfit.id}
                onPress={() => handleSelect(outfit)}
                style={[
                  styles.outfitCard,
                  isSelected && styles.outfitCardSelected,
                  !outfit.unlocked && styles.outfitCardLocked,
                ]}
              >
                <NikaAvatar outfit={outfit} size={64} />
                {!outfit.unlocked && (
                  <View style={styles.lockOverlay}>
                    <Text style={{ fontSize: 20 }}>🔒</Text>
                  </View>
                )}
                <Text style={styles.outfitCardName} numberOfLines={2}>
                  {outfit.name}
                </Text>
                <View style={[styles.outfitRarityDot, { backgroundColor: rarityColor }]} />
                {!outfit.unlocked && (
                  <Text style={styles.unlockHint} numberOfLines={2}>
                    {outfit.unlockCondition}
                  </Text>
                )}
                {isSelected && outfit.unlocked && (
                  <View style={styles.selectedBadge}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>AN</Text>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0618' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 16,
  },
  headerTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: '700' },
  previewStage: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#1a1040',
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#7C3AED',
  },
  outfitName: { color: '#F8FAFC', fontSize: 20, fontWeight: '800', marginTop: 12 },
  rarityBadge: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginTop: 6,
  },
  rarityText: { fontSize: 12, fontWeight: '700' },
  outfitDesc: { color: '#94A3B8', fontSize: 13, marginTop: 8, textAlign: 'center', paddingHorizontal: 20 },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#1E1040',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statItem: { alignItems: 'center' },
  statValue: { color: '#A78BFA', fontSize: 22, fontWeight: '800' },
  statLabel: { color: '#94A3B8', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#334155' },
  grid: { paddingHorizontal: 20, paddingBottom: 32 },
  sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', marginTop: 20, marginBottom: 12 },
  outfitGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  outfitCard: {
    width: '30%',
    backgroundColor: '#1E1040',
    borderRadius: 16,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    position: 'relative',
  },
  outfitCardSelected: { borderColor: '#7C3AED', backgroundColor: '#1a1040' },
  outfitCardLocked: { opacity: 0.6 },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  outfitCardName: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  outfitRarityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 4,
  },
  unlockHint: {
    color: '#64748B',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 4,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
});
