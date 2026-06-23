import React, { useEffect } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { FinanceTheme, Radii } from '@/constants/theme';

interface SkeletonProps {
  width: number | `${number}%`;
  height: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({
  width,
  height,
  borderRadius = Radii.sm,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: FinanceTheme.skeleton,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

// ─── Preset Skeletons ────────────────────────────────────────

export function SkeletonText({ width = 120, lines = 1 }: { width?: number; lines?: number }) {
  return (
    <View style={skeletonStyles.textContainer}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 && lines > 1 ? width * 0.6 : width}
          height={14}
          borderRadius={4}
          style={i < lines - 1 ? skeletonStyles.textLine : undefined}
        />
      ))}
    </View>
  );
}

export function SkeletonCard() {
  return (
    <View style={skeletonStyles.card}>
      <View style={skeletonStyles.cardHeader}>
        <Skeleton width={40} height={40} borderRadius={Radii.sm} />
        <View style={skeletonStyles.cardHeaderText}>
          <Skeleton width={100} height={14} borderRadius={4} />
          <Skeleton width={60} height={12} borderRadius={4} style={{ marginTop: 6 }} />
        </View>
      </View>
      <View style={skeletonStyles.cardBody}>
        <Skeleton width={80} height={18} borderRadius={4} />
        <Skeleton width={50} height={14} borderRadius={4} />
      </View>
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View style={skeletonStyles.row}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <View style={skeletonStyles.rowContent}>
        <Skeleton width={80} height={14} borderRadius={4} />
        <Skeleton width={50} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <View style={skeletonStyles.rowRight}>
        <Skeleton width={60} height={14} borderRadius={4} />
        <Skeleton width={40} height={12} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

export function SkeletonStockDetail() {
  return (
    <View style={skeletonStyles.detailContainer}>
      {/* Price area */}
      <View style={skeletonStyles.detailPriceArea}>
        <Skeleton width={160} height={40} borderRadius={8} />
        <Skeleton width={120} height={24} borderRadius={12} style={{ marginTop: 10 }} />
      </View>
      {/* Timeframe bar */}
      <View style={skeletonStyles.detailTimeRow}>
        {[1,2,3,4].map(i => <Skeleton key={i} width={54} height={32} borderRadius={16} />)}
      </View>
      {/* Period badge */}
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <Skeleton width={130} height={30} borderRadius={15} />
      </View>
      {/* Chart */}
      <Skeleton width="100%" height={200} borderRadius={12} style={{ marginBottom: 16 }} />
      {/* Day info card */}
      <Skeleton width="100%" height={70} borderRadius={12} style={{ marginBottom: 16 }} />
      {/* Metrics grid */}
      <View style={skeletonStyles.detailMetricGrid}>
        {[1,2,3,4,5,6].map(i => <Skeleton key={i} width="47%" height={72} borderRadius={10} />)}
      </View>
    </View>
  );
}


const skeletonStyles = StyleSheet.create({
  textContainer: {
    gap: 4,
  },
  textLine: {
    marginBottom: 4,
  },
  card: {
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    marginLeft: 12,
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  rowContent: {
    flex: 1,
    marginLeft: 12,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  detailContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  detailPriceArea: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 0,
  },
  detailTimeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  detailMetricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
