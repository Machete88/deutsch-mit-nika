import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useStatistics } from '@/lib/statistics-context';
import { useSettings } from '@/lib/settings-context';
import { useFontSizes } from '@/hooks/use-accessibility';
import { useColors } from '@/hooks/use-colors';
import Svg, { Rect, Line, Text as SvgText, Circle, Polyline } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 48;
const CHART_HEIGHT = 160;
const BAR_CHART_HEIGHT = 140;

// Build last 7 days labels
function getLast7Days(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toLocaleDateString('ru-RU', { weekday: 'short' }));
  }
  return days;
}

function getLast7DaysDates(): string[] {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    days.push(d.toDateString());
  }
  return days;
}

export default function StatsScreen() {
  const router = useRouter();
  const { stats, sessionLogs } = useStatistics();
  const { settings } = useSettings();
  const fontSizes = useFontSizes(settings.fontSizeLevel);
  const colors = useColors();

  const dayLabels = getLast7Days();
  const dayDates = getLast7DaysDates();

  // Words learned per day (last 7 days)
  const wordsPerDay = useMemo(() => {
    return dayDates.map(date => {
      return sessionLogs
        .filter(l => l.type === 'learn' && new Date(l.startedAt).toDateString() === date)
        .reduce((sum, l) => sum + l.wordsSeen, 0);
    });
  }, [sessionLogs, dayDates]);

  // Words reviewed per day (last 7 days)
  const reviewsPerDay = useMemo(() => {
    return dayDates.map(date => {
      return sessionLogs
        .filter(l => l.type === 'review' && new Date(l.startedAt).toDateString() === date)
        .reduce((sum, l) => sum + l.wordsSeen, 0);
    });
  }, [sessionLogs, dayDates]);

  // Sessions per type
  const learnSessions = sessionLogs.filter(l => l.type === 'learn').length;
  const reviewSessions = sessionLogs.filter(l => l.type === 'review').length;
  const speakSessions = sessionLogs.filter(l => l.type === 'speak').length;
  const totalSessions = learnSessions + reviewSessions + speakSessions;

  // Accuracy trend (last 7 review sessions)
  const accuracyTrend = useMemo(() => {
    const reviewLogs = sessionLogs.filter(l => l.type === 'review' && l.successRate !== undefined);
    const last7 = reviewLogs.slice(-7);
    if (last7.length < 2) return [];
    return last7.map(l => l.successRate ?? 0);
  }, [sessionLogs]);

  const maxWords = Math.max(...wordsPerDay, ...reviewsPerDay, 1);
  const barWidth = (CHART_WIDTH - 40) / 7;

  // Line chart for accuracy
  const linePoints = useMemo(() => {
    if (accuracyTrend.length < 2) return '';
    const step = (CHART_WIDTH - 40) / (accuracyTrend.length - 1);
    return accuracyTrend.map((v, i) => {
      const x = 20 + i * step;
      const y = CHART_HEIGHT - 30 - (v / 100) * (CHART_HEIGHT - 50);
      return `${x},${y}`;
    }).join(' ');
  }, [accuracyTrend]);

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 }}>
          <Pressable onPress={() => router.back()} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={{ fontSize: fontSizes.xl, color: colors.muted }}>‹</Text>
          </Pressable>
          <Text style={{ fontSize: fontSizes['2xl'], fontWeight: '800', color: colors.foreground }}>
            Графики прогресса
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 20 }}>
          {[
            { label: 'Серия', value: `🔥 ${stats.currentStreak}`, sub: 'дней' },
            { label: 'Выучено', value: `📚 ${stats.totalWordsLearned}`, sub: 'слов' },
            { label: 'Точность', value: `🎯 ${Math.round(stats.averageReviewAccuracy)}%`, sub: 'повторений' },
          ].map(item => (
            <View key={item.label} style={{
              flex: 1, backgroundColor: colors.surface, borderRadius: 14,
              padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.border,
            }}>
              <Text style={{ fontSize: fontSizes.lg, fontWeight: '800', color: colors.foreground }}>{item.value}</Text>
              <Text style={{ fontSize: fontSizes.xs, color: colors.muted, marginTop: 2, textAlign: 'center' }}>{item.sub}</Text>
            </View>
          ))}
        </View>

        {/* Bar Chart: Words Learned per Day */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            📚 Слов выучено (последние 7 дней)
          </Text>
          <Svg width={CHART_WIDTH} height={BAR_CHART_HEIGHT + 30}>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = BAR_CHART_HEIGHT - ratio * BAR_CHART_HEIGHT;
              return (
                <Line
                  key={i}
                  x1={20} y1={y} x2={CHART_WIDTH - 10} y2={y}
                  stroke={colors.border} strokeWidth={0.5}
                />
              );
            })}
            {/* Bars */}
            {wordsPerDay.map((val, i) => {
              const barH = maxWords > 0 ? (val / maxWords) * BAR_CHART_HEIGHT : 0;
              const x = 20 + i * barWidth + barWidth * 0.1;
              const bw = barWidth * 0.8;
              return (
                <Rect
                  key={i}
                  x={x} y={BAR_CHART_HEIGHT - barH}
                  width={bw} height={Math.max(barH, 2)}
                  rx={4}
                  fill={colors.primary}
                  opacity={val === 0 ? 0.2 : 0.9}
                />
              );
            })}
            {/* Day labels */}
            {dayLabels.map((label, i) => {
              const x = 20 + i * barWidth + barWidth / 2;
              return (
                <SvgText
                  key={i}
                  x={x} y={BAR_CHART_HEIGHT + 18}
                  textAnchor="middle"
                  fontSize={9}
                  fill={colors.muted}
                >
                  {label}
                </SvgText>
              );
            })}
          </Svg>
        </View>

        {/* Bar Chart: Reviews per Day */}
        <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
          <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
            🔄 Слов повторено (последние 7 дней)
          </Text>
          <Svg width={CHART_WIDTH} height={BAR_CHART_HEIGHT + 30}>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
              const y = BAR_CHART_HEIGHT - ratio * BAR_CHART_HEIGHT;
              return (
                <Line key={i} x1={20} y1={y} x2={CHART_WIDTH - 10} y2={y}
                  stroke={colors.border} strokeWidth={0.5} />
              );
            })}
            {reviewsPerDay.map((val, i) => {
              const barH = maxWords > 0 ? (val / maxWords) * BAR_CHART_HEIGHT : 0;
              const x = 20 + i * barWidth + barWidth * 0.1;
              const bw = barWidth * 0.8;
              return (
                <Rect key={i} x={x} y={BAR_CHART_HEIGHT - barH}
                  width={bw} height={Math.max(barH, 2)} rx={4}
                  fill="#10B981" opacity={val === 0 ? 0.2 : 0.9}
                />
              );
            })}
            {dayLabels.map((label, i) => {
              const x = 20 + i * barWidth + barWidth / 2;
              return (
                <SvgText key={i} x={x} y={BAR_CHART_HEIGHT + 18}
                  textAnchor="middle" fontSize={9} fill={colors.muted}>
                  {label}
                </SvgText>
              );
            })}
          </Svg>
        </View>

        {/* Accuracy Line Chart */}
        {accuracyTrend.length >= 2 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              🎯 Точность повторений (тренд)
            </Text>
            <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
              {/* Grid */}
              {[0, 25, 50, 75, 100].map((pct, i) => {
                const y = CHART_HEIGHT - 30 - (pct / 100) * (CHART_HEIGHT - 50);
                return (
                  <React.Fragment key={i}>
                    <Line x1={20} y1={y} x2={CHART_WIDTH - 10} y2={y}
                      stroke={colors.border} strokeWidth={0.5} />
                    <SvgText x={14} y={y + 4} textAnchor="end" fontSize={8} fill={colors.muted}>
                      {pct}%
                    </SvgText>
                  </React.Fragment>
                );
              })}
              {/* Line */}
              <Polyline
                points={linePoints}
                fill="none"
                stroke="#F59E0B"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dots */}
              {accuracyTrend.map((v, i) => {
                const step = (CHART_WIDTH - 40) / (accuracyTrend.length - 1);
                const x = 20 + i * step;
                const y = CHART_HEIGHT - 30 - (v / 100) * (CHART_HEIGHT - 50);
                return (
                  <Circle key={i} cx={x} cy={y} r={4} fill="#F59E0B" />
                );
              })}
            </Svg>
          </View>
        )}

        {/* Session Distribution */}
        {totalSessions > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: fontSizes.base, fontWeight: '700', color: colors.foreground, marginBottom: 12 }}>
              📊 Распределение сессий
            </Text>
            {[
              { label: '📚 Учёба', count: learnSessions, color: colors.primary },
              { label: '🔄 Повторение', count: reviewSessions, color: '#10B981' },
              { label: '🗣️ Говорение', count: speakSessions, color: '#F59E0B' },
            ].map(item => {
              const pct = totalSessions > 0 ? (item.count / totalSessions) * 100 : 0;
              return (
                <View key={item.label} style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: fontSizes.sm, fontWeight: '600', color: colors.foreground }}>{item.label}</Text>
                    <Text style={{ fontSize: fontSizes.sm, color: colors.muted }}>{item.count} сессий ({Math.round(pct)}%)</Text>
                  </View>
                  <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: item.color, borderRadius: 4 }} />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {totalSessions === 0 && (
          <View style={{ marginHorizontal: 20, padding: 32, alignItems: 'center', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📈</Text>
            <Text style={{ fontSize: fontSizes.lg, fontWeight: '700', color: colors.foreground, textAlign: 'center' }}>
              Нет данных пока
            </Text>
            <Text style={{ fontSize: fontSizes.sm, color: colors.muted, textAlign: 'center', marginTop: 8 }}>
              Начни учиться, чтобы увидеть графики прогресса
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
