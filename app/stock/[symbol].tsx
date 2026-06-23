import React, { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Svg, { Polyline } from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { H1, H2, H3, Body, Caption, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { fetchChartData, fetchStockDetail } from '@/services/api';
import type { Stock } from '@/services/api';
import { formatCurrency, formatLargeNumber, formatPercent } from '@/services/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - 40;
const CHART_HEIGHT = 200;

type Timeframe = '1G' | '1H' | '1A' | '1Y';
const TIMEFRAMES: Timeframe[] = ['1G', '1H', '1A', '1Y'];

export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [chartData, setChartData] = useState<number[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1A');
  const [loading, setLoading] = useState(true);
  const [tooltipInfo, setTooltipInfo] = useState<{ visible: boolean; index: number } | null>(null);

  const loadData = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    const [stockRes, chartRes] = await Promise.all([
      fetchStockDetail(symbol),
      fetchChartData(symbol, timeframe),
    ]);
    setStock(stockRes);
    setChartData(chartRes);
    setLoading(false);
  }, [symbol, timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Chart SVG path
  const chartPoints = useCallback(() => {
    if (chartData.length === 0) return '';
    const min = Math.min(...chartData);
    const max = Math.max(...chartData);
    const range = max - min || 1;
    const stepX = CHART_WIDTH / (chartData.length - 1);

    return chartData
      .map((val, i) => {
        const x = i * stepX;
        const y = CHART_HEIGHT - ((val - min) / range) * (CHART_HEIGHT - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');
  }, [chartData]);

  if (loading || !stock) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <SkeletonCard />
          <View style={{ marginTop: 16 }}>
            <SkeletonCard />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;
  const changeBg = isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg;
  const chartColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;

  // Metrik verileri
  const metrics = [
    { label: 'F/K', value: stock.pe.toFixed(1), tooltip: 'Fiyat/Kazanç oranı. Hissenin kârına göre ne kadar pahalı olduğunu gösterir.' },
    { label: 'PD/DD', value: stock.pb.toFixed(2), tooltip: 'Piyasa Değeri / Defter Değeri oranı. Şirketin varlıklarına kıyasla piyasa fiyatını gösterir.' },
    { label: 'HBK', value: '₺' + stock.eps.toFixed(2), tooltip: 'Hisse Başına Kâr. Şirketin net kârının hisse sayısına bölümüdür.' },
    { label: 'Piyasa D.', value: formatLargeNumber(stock.marketCap) + ' TL', tooltip: 'Toplam piyasa değeri (milyon TL cinsinden).' },
    { label: 'Hacim', value: formatLargeNumber(stock.volume), tooltip: 'Günlük işlem hacmi (lot sayısı).' },
    { label: 'Temettü', value: stock.dividendYield.toFixed(1) + '%', tooltip: 'Yıllık temettü verimi. Hisse fiyatına göre temettü getirisi.' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <H3>{stock.symbol}</H3>
          <Caption>{stock.name}</Caption>
        </View>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="star-outline" size={22} color={FinanceTheme.textMuted} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Fiyat Alanı */}
        <View style={styles.priceSection}>
          <H1 numeric style={styles.priceText}>{formatCurrency(stock.price)}</H1>
          <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
            <Ionicons
              name={isPositive ? 'caret-up' : 'caret-down'}
              size={14}
              color={changeColor}
            />
            <Typography variant="body" numeric style={[styles.changeText, { color: changeColor }]}>
              {formatCurrency(Math.abs(stock.changeAmount))} ({formatPercent(stock.change)})
            </Typography>
          </View>
        </View>

        {/* ─── Grafik ─────────────────────────────────── */}
        <View style={styles.chartContainer}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
            <Polyline
              points={chartPoints()}
              fill="none"
              stroke={chartColor}
              strokeWidth="2"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </Svg>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map((tf) => (
            <TouchableOpacity
              key={tf}
              style={[
                styles.timeframeButton,
                timeframe === tf && styles.timeframeActive,
              ]}
              onPress={() => setTimeframe(tf)}
              activeOpacity={0.7}
            >
              <Caption
                style={[
                  styles.timeframeText,
                  timeframe === tf && styles.timeframeTextActive,
                ]}
              >
                {tf}
              </Caption>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Gün İçi Bilgileri ──────────────────────── */}
        <Card variant="default" padding="md" style={styles.dayInfoCard}>
          <View style={styles.dayInfoRow}>
            <DayInfoItem label="Açılış" value={formatCurrency(stock.open)} />
            <DayInfoItem label="Yüksek" value={formatCurrency(stock.high)} color={FinanceTheme.profit} />
            <DayInfoItem label="Düşük" value={formatCurrency(stock.low)} color={FinanceTheme.loss} />
            <DayInfoItem label="Ön. Kapanış" value={formatCurrency(stock.prevClose)} />
          </View>
        </Card>

        {/* ─── Temel Veriler Grid ─────────────────────── */}
        <View style={styles.metricsHeader}>
          <Caption style={styles.sectionLabel}>TEMEL VERİLER</Caption>
        </View>
        <View style={styles.metricsGrid}>
          {metrics.map((m) => (
            <MetricCard key={m.label} label={m.label} value={m.value} tooltip={m.tooltip} />
          ))}
        </View>

        {/* ─── Sektör Bilgisi ─────────────────────────── */}
        <Card variant="default" padding="md" style={styles.sectorCard}>
          <View style={styles.sectorRow}>
            <Caption>Sektör</Caption>
            <Body style={{ fontFamily: Fonts.semiBold }}>{stock.sector}</Body>
          </View>
        </Card>

        <DataSourceFooter />
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Day Info Item ───────────────────────────────────────────
function DayInfoItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <View style={styles.dayInfoItem}>
      <Caption style={styles.dayInfoLabel}>{label}</Caption>
      <Typography
        variant="bodySmall"
        numeric
        style={[styles.dayInfoValue, color ? { color } : {}]}
      >
        {value}
      </Typography>
    </View>
  );
}

// ─── Metric Card with Tooltip ────────────────────────────────
function MetricCard({
  label,
  value,
  tooltip,
}: {
  label: string;
  value: string;
  tooltip: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <TouchableOpacity
      style={styles.metricCard}
      activeOpacity={0.7}
      onPress={() => setShowTooltip(!showTooltip)}
    >
      <View style={styles.metricHeader}>
        <Caption style={styles.metricLabel}>{label}</Caption>
        <Ionicons
          name="information-circle-outline"
          size={14}
          color={FinanceTheme.textMuted}
        />
      </View>
      <H3 numeric style={styles.metricValue}>{value}</H3>
      {showTooltip && (
        <View style={styles.tooltipContainer}>
          <Caption style={styles.tooltipText}>{tooltip}</Caption>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  loadingContainer: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  backButton: {
    padding: 4,
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  favoriteButton: {
    padding: 4,
  },
  // Price
  priceSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  priceText: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 10,
  },
  changeText: {
    fontSize: 15,
    fontFamily: Fonts.semiBold,
    marginLeft: 6,
    lineHeight: 20,
  },
  // Chart
  chartContainer: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  // Timeframe
  timeframeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FinanceTheme.surface,
  },
  timeframeActive: {
    backgroundColor: FinanceTheme.primary,
  },
  timeframeText: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textSecondary,
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  // Day Info
  dayInfoCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  dayInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayInfoItem: {
    alignItems: 'center',
  },
  dayInfoLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayInfoValue: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.text,
  },
  // Metrics
  metricsHeader: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 40 - 24) / 3,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    fontSize: 16,
  },
  tooltipContainer: {
    backgroundColor: FinanceTheme.surface,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
  },
  tooltipText: {
    fontSize: 11,
    lineHeight: 15,
    color: FinanceTheme.textSecondary,
  },
  // Sector
  sectorCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  sectorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
