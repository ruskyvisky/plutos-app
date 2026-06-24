/**
 * Plutos — Hisse Detay Sayfası
 * Mum grafiği, metrik kartlar, haberler, favori özelliği
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Linking,
  Modal,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText
} from 'react-native-svg';

import { Card } from '@/components/ui/Card';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonStockDetail } from '@/components/ui/SkeletonLoader';
import { Body, Caption, H1, H3, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import type { CandleData, OHLCVWithChange, Stock, StockNewsItem } from '@/services/api';
import {
  fetchOHLCVWithChange,
  fetchPortfolio,
  fetchStockDetail,
  fetchStockNews,
} from '@/services/api';
import { formatLargeNumber, formatPercent } from '@/services/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getLists, addToList, removeFromList, type StockList } from '@/services/listsService';
import { TradeBottomSheet } from '@/components/market/TradeBottomSheet';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const H_PADDING = 20;
const CHART_W = SCREEN_WIDTH - H_PADDING * 2;
const CHART_H = 220;
const CHART_PT = { top: 20, bottom: 28, left: 4, right: 4 };

type Timeframe = '1G' | '1H' | '1A' | '1Y';
const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: '1G', label: '1G' },
  { key: '1H', label: '1H' },
  { key: '1A', label: '1A' },
  { key: '1Y', label: '1Y' },
];

// ─── Candlestick Chart ────────────────────────────────────────
function CandlestickChart({
  candles,
  chartColor,
  periodChangePercent,
  symbol,
}: {
  candles: CandleData[];
  chartColor: string;
  periodChangePercent: number;
  symbol: string;
}) {
  const { formatPrice } = useCurrency();
  const [tooltipIdx, setTooltipIdx] = useState<number | null>(null);

  const innerW = CHART_W - CHART_PT.left - CHART_PT.right;
  const innerH = CHART_H - CHART_PT.top - CHART_PT.bottom;

  if (candles.length === 0) {
    return (
      <View style={[chartStyles.empty, { height: CHART_H }]}>
        <Ionicons name="bar-chart-outline" size={32} color={FinanceTheme.textMuted} />
        <Caption style={{ marginTop: 8 }}>Grafik verisi bulunamadı</Caption>
      </View>
    );
  }

  const allValues = candles.flatMap((c) => [c.high, c.low]);
  const minPrice = Math.min(...allValues);
  const maxPrice = Math.max(...allValues);
  const priceRange = maxPrice - minPrice || 1;

  const toY = (price: number) =>
    CHART_PT.top + innerH - ((price - minPrice) / priceRange) * innerH;

  // Max 60 mum göster — daha fazlaysa downsample
  const MAX_CANDLES = 60;
  const displayCandles =
    candles.length > MAX_CANDLES
      ? candles.filter((_, i) => i % Math.ceil(candles.length / MAX_CANDLES) === 0)
      : candles;

  const candleW = Math.max(2, Math.min(12, innerW / displayCandles.length - 2));
  const step = innerW / displayCandles.length;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const idx = Math.floor(
          ((e.nativeEvent.locationX - CHART_PT.left) / innerW) * displayCandles.length
        );
        setTooltipIdx(Math.max(0, Math.min(idx, displayCandles.length - 1)));
      },
      onPanResponderMove: (e) => {
        const idx = Math.floor(
          ((e.nativeEvent.locationX - CHART_PT.left) / innerW) * displayCandles.length
        );
        setTooltipIdx(Math.max(0, Math.min(idx, displayCandles.length - 1)));
      },
      onPanResponderRelease: () => setTooltipIdx(null),
      onPanResponderTerminate: () => setTooltipIdx(null),
    })
  ).current;

  const tooltipCandle = tooltipIdx !== null ? displayCandles[tooltipIdx] : null;
  const tooltipX =
    tooltipIdx !== null
      ? CHART_PT.left + tooltipIdx * step + step / 2
      : 0;

  // Background area path (smooth line for context)
  const closes = displayCandles.map((c) => c.close);
  let areaPath = '';
  if (closes.length > 1) {
    const pts = closes.map((v, i) => ({
      x: CHART_PT.left + i * step + step / 2,
      y: toY(v),
    }));
    let p = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i - 1].x + pts[i].x) / 2;
      p += ` C ${cp} ${pts[i - 1].y} ${cp} ${pts[i].y} ${pts[i].x} ${pts[i].y}`;
    }
    const bottom = CHART_PT.top + innerH + CHART_PT.bottom;
    areaPath = p + ` L ${pts[pts.length - 1].x} ${bottom} L ${pts[0].x} ${bottom} Z`;
  }

  const isUp = periodChangePercent >= 0;

  return (
    <View style={{ width: CHART_W, height: CHART_H }} {...panResponder.panHandlers}>
      <Svg width={CHART_W} height={CHART_H}>
        <Defs>
          <LinearGradient id="cgGreen" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={FinanceTheme.profit} stopOpacity="0.12" />
            <Stop offset="1" stopColor={FinanceTheme.profit} stopOpacity="0" />
          </LinearGradient>
          <LinearGradient id="cgRed" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={FinanceTheme.loss} stopOpacity="0.12" />
            <Stop offset="1" stopColor={FinanceTheme.loss} stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* Subtle area bg */}
        {areaPath ? <Path d={areaPath} fill={`url(#${isUp ? 'cgGreen' : 'cgRed'})`} /> : null}

        {/* Horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((r) => {
          const y = CHART_PT.top + innerH * r;
          const price = maxPrice - priceRange * r;
          return (
            <React.Fragment key={r}>
              <Line
                x1={CHART_PT.left} y1={y}
                x2={CHART_W - CHART_PT.right} y2={y}
                stroke={FinanceTheme.divider} strokeWidth="0.5"
              />
              <SvgText
                x={CHART_PT.left} y={y - 3}
                fontSize="8" fill={FinanceTheme.textMuted}
                fontFamily="Inter_400Regular"
              >
                {formatPrice(price, symbol)}
              </SvgText>
            </React.Fragment>
          );
        })}

        {/* Candles */}
        {displayCandles.map((c, i) => {
          const cx = CHART_PT.left + i * step + step / 2;
          const isGreen = c.close >= c.open;
          const color = isGreen ? FinanceTheme.profit : FinanceTheme.loss;
          const bodyTop = toY(Math.max(c.open, c.close));
          const bodyH = Math.max(1, Math.abs(toY(c.open) - toY(c.close)));
          const wickTop = toY(c.high);
          const wickBottom = toY(c.low);
          const halfW = candleW / 2;
          const isDimmed = tooltipIdx !== null && tooltipIdx !== i;

          return (
            <React.Fragment key={i}>
              {/* Wick */}
              <Line
                x1={cx} y1={wickTop} x2={cx} y2={wickBottom}
                stroke={color} strokeWidth="1"
                opacity={isDimmed ? 0.3 : 1}
              />
              {/* Body — both green and red candles are filled */}
              <Rect
                x={cx - halfW} y={bodyTop}
                width={candleW} height={bodyH}
                fill={color}
                stroke={color}
                strokeWidth={1}
                opacity={isDimmed ? 0.3 : 1}
                rx={1}
              />
            </React.Fragment>
          );
        })}

        {/* Tooltip crosshair */}
        {tooltipIdx !== null && (
          <Line
            x1={tooltipX} y1={CHART_PT.top}
            x2={tooltipX} y2={CHART_PT.top + innerH}
            stroke={FinanceTheme.textMuted} strokeWidth="1" strokeDasharray="4 3"
          />
        )}
      </Svg>

      {/* Tooltip bubble */}
      {tooltipCandle && (
        <View
          style={[
            chartStyles.tooltipBubble,
            { left: Math.min(Math.max(tooltipX - 60, 0), CHART_W - 120) },
          ]}
          pointerEvents="none"
        >
          <Caption style={chartStyles.tooltipDate}>{formatDate(tooltipCandle.date)}</Caption>
          <View style={chartStyles.tooltipRow}>
            <Caption style={chartStyles.tooltipKey}>A</Caption>
            <Caption style={chartStyles.tooltipVal}>{formatPrice(tooltipCandle.open, symbol)}</Caption>
          </View>
          <View style={chartStyles.tooltipRow}>
            <Caption style={[chartStyles.tooltipKey, { color: FinanceTheme.profit }]}>Y</Caption>
            <Caption style={chartStyles.tooltipVal}>{formatPrice(tooltipCandle.high, symbol)}</Caption>
          </View>
          <View style={chartStyles.tooltipRow}>
            <Caption style={[chartStyles.tooltipKey, { color: FinanceTheme.loss }]}>D</Caption>
            <Caption style={chartStyles.tooltipVal}>{formatPrice(tooltipCandle.low, symbol)}</Caption>
          </View>
          <View style={chartStyles.tooltipRow}>
            <Caption style={chartStyles.tooltipKey}>K</Caption>
            <Caption style={[chartStyles.tooltipVal, { fontFamily: Fonts.semiBold }]}>{formatPrice(tooltipCandle.close, symbol)}</Caption>
          </View>
        </View>
      )}
    </View>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
  } catch {
    return iso.slice(0, 10);
  }
}

const chartStyles = StyleSheet.create({
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.md,
  },
  tooltipBubble: {
    position: 'absolute',
    top: 8,
    width: 120,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.md,
    padding: 8,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  tooltipDate: { color: FinanceTheme.textMuted, fontSize: 9, marginBottom: 4 },
  tooltipRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  tooltipKey: { color: FinanceTheme.textMuted, fontSize: 10, width: 12 },
  tooltipVal: { color: FinanceTheme.text, fontSize: 10 },
});

// ─── Main Screen ──────────────────────────────────────────────
export default function StockDetailScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const router = useRouter();
  const { formatPrice, convertPrice, currency } = useCurrency();

  const [stock, setStock] = useState<Stock | null>(null);
  const [ohlcv, setOhlcv] = useState<OHLCVWithChange>({
    candles: [], closes: [], periodChangePercent: 0, dates: [],
  });
  const [news, setNews] = useState<StockNewsItem[]>([]);
  const [timeframe, setTimeframe] = useState<Timeframe>('1G');
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [cashBalance, setCashBalance] = useState(0);
  // Trade modal
  const [tradeVisible, setTradeVisible] = useState(false);
  const [tradeSide, setTradeSide] = useState<'buy' | 'sell'>('buy');

  // Lists modal states
  const [showListModal, setShowListModal] = useState(false);
  const [userLists, setUserLists] = useState<StockList[]>([]);

  const loadUserLists = async () => {
    const all = await getLists();
    setUserLists(all.filter(l => !l.isSystem));
  };

  useEffect(() => {
    if (showListModal) {
      loadUserLists();
    }
  }, [showListModal]);

  const handleToggleList = async (listId: string, isIn: boolean) => {
    if (!symbol) return;
    if (isIn) {
      await removeFromList(listId, symbol as string);
    } else {
      await addToList(listId, symbol as string);
    }
    loadUserLists();
  };

  // Info modal
  const [infoModal, setInfoModal] = useState<{ title: string; description: string } | null>(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const showModal = (title: string, description: string) => {
    setInfoModal({ title, description });
    Animated.spring(modalAnim, {
      toValue: 1, useNativeDriver: true, tension: 80, friction: 10,
    }).start();
  };
  const hideModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(
      () => setInfoModal(null)
    );
  };

  // Initial load
  const loadAll = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    const [stockRes, ohlcvRes, newsRes, portfolioRes] = await Promise.all([
      fetchStockDetail(symbol),
      fetchOHLCVWithChange(symbol, '1G'),
      fetchStockNews(symbol, 8),
      fetchPortfolio(),
    ]);
    setStock(stockRes);
    setOhlcv(ohlcvRes);
    setNews(newsRes);
    setCashBalance(portfolioRes.cash);
    setLoading(false);
  }, [symbol]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // Timeframe change
  const handleTimeframeChange = useCallback(async (tf: Timeframe) => {
    setTimeframe(tf);
    setChartLoading(true);
    const res = await fetchOHLCVWithChange(symbol as string, tf);
    setOhlcv(res);
    setChartLoading(false);
  }, [symbol]);

  // Trade handlers
  const openBuy = () => { setTradeSide('buy'); setTradeVisible(true); };
  const openSell = () => { setTradeSide('sell'); setTradeVisible(true); };

  // ── Loading state ──
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Minimal header while loading */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <H3>{symbol}</H3>
          </View>
          <View style={{ width: 36 }} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <SkeletonStockDetail />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!stock) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.header]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
          </TouchableOpacity>
          <View style={styles.headerCenter}><H3>{symbol}</H3></View>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={FinanceTheme.textMuted} />
          <Body style={{ color: FinanceTheme.textMuted, marginTop: 12 }}>
            Hisse verisi yüklenemedi.
          </Body>
        </View>
      </SafeAreaView>
    );
  }

  const isPositive = ohlcv.periodChangePercent >= 0;
  const changeColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;
  const changeBg = isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg;

  // ── Metrics ──
  type MetricDef = {
    label: string;
    value: string;
    description: string;
    hasValue: boolean;
  };

  const getCurrencySymbol = () => {
    if (currency === 'TRY') return ' ₺';
    if (currency === 'USD') return ' $';
    return ' €';
  };

  const allMetrics: MetricDef[] = [
    {
      label: 'Açılış',
      value: stock.open > 0 ? formatPrice(stock.open, symbol as string) : '—',
      hasValue: stock.open > 0,
      description: 'Günün açılış fiyatı. Piyasanın o gün işleme başladığı ilk fiyat seviyesidir.',
    },
    {
      label: 'Tavan',
      value: stock.upperLimit != null ? formatPrice(stock.upperLimit, symbol as string) : '—',
      hasValue: stock.upperLimit != null,
      description: 'Günlük tavan fiyat. BIST\'te hisse fiyatları bir günde önceki kapanışa göre en fazla %10 yükselebilir. Bu, teorik üst limitdir.',
    },
    {
      label: 'Taban',
      value: stock.lowerLimit != null ? formatPrice(stock.lowerLimit, symbol as string) : '—',
      hasValue: stock.lowerLimit != null,
      description: 'Günlük taban fiyat. BIST\'te hisse fiyatları bir günde önceki kapanışa göre en fazla %10 düşebilir. Bu, teorik alt limitdir.',
    },
    {
      label: '52H Yük.',
      value: stock.fiftyTwoWeekHigh != null ? formatPrice(stock.fiftyTwoWeekHigh, symbol as string) : '—',
      hasValue: stock.fiftyTwoWeekHigh != null,
      description: '52 Haftalık En Yüksek Fiyat. Son 1 yılda ulaşılan zirve. Mevcut fiyatla kıyaslanarak hissenin yıllık performansı değerlendirilebilir.',
    },
    {
      label: '52H Düş.',
      value: stock.fiftyTwoWeekLow != null ? formatPrice(stock.fiftyTwoWeekLow, symbol as string) : '—',
      hasValue: stock.fiftyTwoWeekLow != null,
      description: '52 Haftalık En Düşük Fiyat. Son 1 yılda görülen dip. Teknik analizde destek bölgesi olarak kullanılır.',
    },
    {
      label: 'F/K',
      value: stock.pe > 0 ? stock.pe.toFixed(1) : '—',
      hasValue: stock.pe > 0,
      description: 'Fiyat/Kazanç Oranı. Hisse fiyatının hisse başına kâra oranıdır. Düşük F/K ucuz, yüksek F/K pahalı hisseye işaret edebilir.',
    },
    {
      label: 'PD/DD',
      value: stock.pb > 0 ? stock.pb.toFixed(2) : '—',
      hasValue: stock.pb > 0,
      description: 'Piyasa Değeri / Defter Değeri. Borsadaki toplam değerin net varlık değerine oranıdır. 1\'in altı teorik olarak "ucuz" sayılır.',
    },
    {
      label: 'HBK',
      value: stock.eps > 0 ? formatPrice(stock.eps, symbol as string) : '—',
      hasValue: stock.eps > 0,
      description: 'Hisse Başına Kâr. Şirketin net kârının toplam hisse adedine bölümüdür.',
    },
    {
      label: 'EV/EBITDA',
      value: stock.enterpriseToEbitda != null ? stock.enterpriseToEbitda.toFixed(1) : '—',
      hasValue: stock.enterpriseToEbitda != null,
      description: 'Firma Değeri / FAVÖK. Farklı sermaye yapılarındaki şirketleri karşılaştırmak için kullanılan değerleme çarpanıdır.',
    },
    {
      label: 'Beta',
      value: stock.beta != null ? stock.beta.toFixed(2) : '—',
      hasValue: stock.beta != null,
      description: 'Hissenin piyasa geneline göre volatilite katsayısı. 1\'den büyükse piyasadan daha hareketli, küçükse daha sakin demektir.',
    },
    {
      label: 'Temettü',
      value: stock.dividendYield > 0 ? stock.dividendYield.toFixed(1) + '%' : '—',
      hasValue: stock.dividendYield > 0,
      description: 'Yıllık Temettü Verimi. Hisse başına ödenen yıllık temettünün mevcut fiyata oranıdır.',
    },
    {
      label: 'Piyasa D.',
      value: stock.marketCap > 0 ? formatLargeNumber(convertPrice(stock.marketCap, symbol as string)) + getCurrencySymbol() : '—',
      hasValue: stock.marketCap > 0,
      description: 'Piyasa Değeri. Şirketin borsadaki toplam değeridir. Hisse fiyatı × Dolaşımdaki hisse sayısı.',
    },
    {
      label: 'Hacim',
      value: stock.volume > 0 ? formatLargeNumber(stock.volume) : '—',
      hasValue: stock.volume > 0,
      description: 'Günlük İşlem Hacmi. O gün el değiştiren toplam hisse lotudur. Yüksek hacim güçlü ilgi ve likidite demektir.',
    },
    {
      label: 'Yab. Oranı',
      value: stock.foreignRatio != null ? stock.foreignRatio.toFixed(1) + '%' : '—',
      hasValue: stock.foreignRatio != null,
      description: 'Yabancı Yatırımcı Oranı. Hissede yabancıların elinde bulunan pay yüzdesidir.',
    },
    {
      label: '50G Ort.',
      value: stock.fiftyDayAvg != null ? formatPrice(stock.fiftyDayAvg, symbol as string) : '—',
      hasValue: stock.fiftyDayAvg != null,
      description: '50 Günlük Hareketli Ortalama. Kısa-orta vadeli trend yönünü belirlemek için kullanılır.',
    },
    {
      label: '200G Ort.',
      value: stock.twoHundredDayAvg != null ? formatPrice(stock.twoHundredDayAvg, symbol as string) : '—',
      hasValue: stock.twoHundredDayAvg != null,
      description: '200 Günlük Hareketli Ortalama. Uzun vadeli trend göstergesi. Bu ortalamanın üzeri "boğa", altı "ayı" eğilimi.',
    },
  ];

  // Sadece verisi olanları göster
  const visibleMetrics = allMetrics.filter((m) => m.hasValue);

  return (
    <SafeAreaView style={styles.container}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <H3>{stock.symbol}</H3>
          <Caption numberOfLines={1} style={styles.headerSub}>{stock.name}</Caption>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.compareTextButton}
            onPress={() => router.push(`/stock/compare?a=${stock.symbol}` as any)}
          >
            <Typography variant="bodySmall" style={styles.compareTextButtonText}>Karşılaştır</Typography>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ─── Price ─── */}
        <View style={styles.priceSection}>
          <H1 numeric style={styles.priceText}>{formatPrice(stock.price, symbol as string)}</H1>
          <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
            <Ionicons
              name={stock.change >= 0 ? 'caret-up' : 'caret-down'}
              size={13}
              color={stock.change >= 0 ? FinanceTheme.profit : FinanceTheme.loss}
            />
            <Typography
              variant="body"
              numeric
              style={[
                styles.changeText,
                { color: stock.change >= 0 ? FinanceTheme.profit : FinanceTheme.loss },
              ]}
            >
              {formatPrice(Math.abs(stock.changeAmount), symbol as string)} ({formatPercent(stock.change)})
            </Typography>
          </View>
        </View>

        {/* ─── Timeframe Tabs ─── */}
        <View style={styles.timeframeRow}>
          {TIMEFRAMES.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              style={[styles.tfBtn, timeframe === key && styles.tfBtnActive]}
              onPress={() => handleTimeframeChange(key)}
              activeOpacity={0.7}
            >
              <Caption style={[styles.tfText, timeframe === key && styles.tfTextActive]}>
                {label}
              </Caption>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Period Change Badge ─── */}
        <View style={styles.periodRow}>
          {chartLoading ? (
            <View style={[styles.periodBadge, { backgroundColor: FinanceTheme.surface }]}>
              <Caption style={{ color: FinanceTheme.textMuted }}>Yükleniyor…</Caption>
            </View>
          ) : (
            <View style={[styles.periodBadge, { backgroundColor: isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg }]}>
              <Ionicons
                name={isPositive ? 'trending-up' : 'trending-down'}
                size={15}
                color={changeColor}
              />
              <Typography variant="bodySmall" numeric style={[styles.periodText, { color: changeColor }]}>
                {timeframe === '1G' ? 'Bugün' : timeframe === '1H' ? 'Bu Hafta' : timeframe === '1A' ? 'Bu Ay' : 'Bu Yıl'}
                {'  '}
                {ohlcv.periodChangePercent >= 0 ? '+' : ''}{ohlcv.periodChangePercent.toFixed(2)}%
              </Typography>
            </View>
          )}
        </View>

        {/* ─── Candlestick Chart ─── */}
        <View style={styles.chartContainer}>
          {chartLoading ? (
            <View style={[{ height: CHART_H, width: CHART_W }, styles.chartLoadingBox]}>
              <Caption style={{ color: FinanceTheme.textMuted }}>Grafik yükleniyor…</Caption>
            </View>
          ) : (
            <CandlestickChart
              candles={ohlcv.candles}
              chartColor={changeColor}
              periodChangePercent={ohlcv.periodChangePercent}
              symbol={symbol as string}
            />
          )}
        </View>

        {/* ─── Gün İçi Bilgileri ─── */}
        <Card variant="default" padding="md" style={styles.dayCard}>
          <View style={styles.dayRow}>
            <DayItem label="Açılış" value={formatPrice(stock.open, symbol as string)} />
            <DayItem label="Yüksek" value={formatPrice(stock.high, symbol as string)} color={FinanceTheme.profit} />
            <DayItem label="Düşük" value={formatPrice(stock.low, symbol as string)} color={FinanceTheme.loss} />
            <DayItem label="Ön. Kapanış" value={formatPrice(stock.prevClose, symbol as string)} />
          </View>
        </Card>

        {/* ─── Temel Veriler ─── */}
        {visibleMetrics.length > 0 && (
          <>
            <SectionHeader label="TEMEL VERİLER" />
            <View style={styles.metricsGrid}>
              {visibleMetrics.map((m) => (
                <MetricCard
                  key={m.label}
                  label={m.label}
                  value={m.value}
                  onInfo={() => showModal(m.label, m.description)}
                />
              ))}
            </View>
          </>
        )}

        {/* ─── Şirket Profili ─── */}
        <SectionHeader label="ŞİRKET PROFİLİ" />
        <Card variant="default" padding="md" style={styles.profileCard}>
          {stock.sector ? <ProfileRow label="Sektör" value={stock.sector} /> : null}
          {stock.industry ? <ProfileRow label="Endüstri" value={stock.industry} /> : null}
          {stock.website ? (
            <TouchableOpacity onPress={() => Linking.openURL(stock.website!)} activeOpacity={0.7}>
              <ProfileRow label="Website" value={stock.website} isLink />
            </TouchableOpacity>
          ) : null}
          {stock.description ? (
            <View style={styles.descBox}>
              <Caption style={styles.descLabel}>Hakkında</Caption>
              <Body style={styles.descText} numberOfLines={6}>{stock.description}</Body>
            </View>
          ) : null}
          {!stock.sector && !stock.industry && !stock.website && !stock.description && (
            <Caption style={{ color: FinanceTheme.textMuted }}>Profil bilgisi bulunamadı.</Caption>
          )}
        </Card>

        {/* ─── İlgili Haberler ─── */}
        {news.length > 0 && (
          <>
            <SectionHeader label="İLGİLİ HABERLER" />
            <View style={styles.newsList}>
              {news.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.newsCard}
                  onPress={() => item.url ? Linking.openURL(item.url) : null}
                  activeOpacity={0.75}
                >
                  <View style={styles.newsContent}>
                    <Body style={styles.newsTitle} numberOfLines={2}>{item.title}</Body>
                    <Caption style={styles.newsDate}>{formatDate(item.date)}</Caption>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={FinanceTheme.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <DataSourceFooter />
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ─── Al / Sat Bar ─── */}
      <View style={styles.tradeBar}>
        <TouchableOpacity
          style={[styles.tradeBtn, styles.sellBtn]}
          onPress={openSell}
          activeOpacity={0.85}
        >
          <Ionicons name="trending-down" size={18} color="#fff" />
          <Body style={styles.tradeBtnText}>Sat</Body>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tradeBtn, styles.buyBtn]}
          onPress={openBuy}
          activeOpacity={0.85}
        >
          <Ionicons name="trending-up" size={18} color="#fff" />
          <Body style={styles.tradeBtnText}>Al</Body>
        </TouchableOpacity>
      </View>

      {/* ─── Info Modal ─── */}
      {infoModal && (
        <Modal transparent animationType="none" onRequestClose={hideModal}>
          <TouchableWithoutFeedback onPress={hideModal}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <Animated.View
                  style={[
                    styles.modalCard,
                    {
                      opacity: modalAnim,
                      transform: [
                        {
                          scale: modalAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.92, 1],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.modalHeader}>
                    <View style={styles.modalIconWrap}>
                      <Ionicons name="information-circle" size={20} color={FinanceTheme.primary} />
                    </View>
                    <Body style={styles.modalTitle}>{infoModal.title}</Body>
                    <TouchableOpacity onPress={hideModal} style={{ padding: 4 }}>
                      <Ionicons name="close" size={20} color={FinanceTheme.textMuted} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalDivider} />
                  <Body style={styles.modalDesc}>{infoModal.description}</Body>
                </Animated.View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}

      {/* ─── List Selection Modal ─── */}
      <Modal
        visible={showListModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowListModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowListModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.listModalCard}>
            <View style={styles.listModalHeader}>
              <H3 style={styles.listModalTitle}>Listelerime Ekle / Çıkar</H3>
              <TouchableOpacity onPress={() => setShowListModal(false)} style={{ padding: 4 }}>
                <Ionicons name="close" size={22} color={FinanceTheme.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalDivider} />
            
            {userLists.length === 0 ? (
              <Caption style={styles.emptyListText}>
                Henüz özel listeniz yok. Ana sayfadan bir liste oluşturabilirsiniz.
              </Caption>
            ) : (
              <ScrollView style={styles.listModalScroll}>
                {userLists.map((list) => {
                  const hasSymbol = list.symbols.includes((symbol as string).toUpperCase());
                  return (
                    <TouchableOpacity
                      key={list.id}
                      style={styles.listModalItem}
                      onPress={() => handleToggleList(list.id, hasSymbol)}
                      activeOpacity={0.7}
                    >
                      <Body style={styles.listModalItemName}>
                        {list.icon} {list.name}
                      </Body>
                      <Ionicons
                        name={hasSymbol ? 'checkbox' : 'square-outline'}
                        size={22}
                        color={hasSymbol ? FinanceTheme.primary : FinanceTheme.textMuted}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ─── Trade Bottom Sheet ─── */}
      {stock && (
        <TradeBottomSheet
          visible={tradeVisible}
          onClose={() => { setTradeVisible(false); loadAll(); }}
          symbol={stock.symbol}
          stockName={stock.name}
          currentPrice={stock.price}
          cashBalance={cashBalance}
          side={tradeSide}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Caption style={styles.sectionLabel}>{label}</Caption>
    </View>
  );
}

function DayItem({
  label, value, color,
}: { label: string; value: string; color?: string }) {
  return (
    <View style={styles.dayItem}>
      <Caption style={styles.dayLabel}>{label}</Caption>
      <Typography variant="bodySmall" numeric style={[styles.dayValue, color ? { color } : {}]}>
        {value}
      </Typography>
    </View>
  );
}

function MetricCard({
  label, value, onInfo,
}: { label: string; value: string; onInfo: () => void }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Caption style={styles.metricLabel}>{label}</Caption>
        <TouchableOpacity onPress={onInfo} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="information-circle-outline" size={15} color={FinanceTheme.primary} />
        </TouchableOpacity>
      </View>
      <Typography variant="body" numeric style={styles.metricValue}>
        {value}
      </Typography>
    </View>
  );
}

function ProfileRow({
  label, value, isLink,
}: { label: string; value: string; isLink?: boolean }) {
  return (
    <View style={styles.profileRow}>
      <Caption style={styles.profileLabel}>{label}</Caption>
      <Body
        style={[styles.profileValue, isLink && { color: FinanceTheme.primary }]}
        numberOfLines={1}
      >
        {value}
      </Body>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const METRIC_COL_COUNT = 2;
const METRIC_GAP = 10;
const METRIC_W =
  (SCREEN_WIDTH - H_PADDING * 2 - METRIC_GAP * (METRIC_COL_COUNT - 1)) / METRIC_COL_COUNT;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FinanceTheme.background },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  backButton: { padding: 4, width: 36 },
  headerCenter: { alignItems: 'center', flex: 1 },
  headerSub: { color: FinanceTheme.textMuted, marginTop: 1 },
  compareTextButton: {
    backgroundColor: FinanceTheme.primary + '1A',
    borderColor: FinanceTheme.primary,
    borderWidth: 1,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  compareTextButtonText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
  },

  // Price
  priceSection: { alignItems: 'center', paddingTop: Spacing.xl, paddingBottom: Spacing.sm },
  priceText: { fontSize: 38, marginBottom: Spacing.sm },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 6,
    borderRadius: 10, gap: 4,
  },
  changeText: { fontSize: 14, fontFamily: Fonts.semiBold, lineHeight: 20 },

  // Timeframe
  timeframeRow: {
    flexDirection: 'row', justifyContent: 'center',
    paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: 8,
  },
  tfBtn: {
    paddingHorizontal: 20, paddingVertical: 8,
    borderRadius: 20, backgroundColor: FinanceTheme.surface,
    borderWidth: 1, borderColor: 'transparent',
  },
  tfBtnActive: {
    backgroundColor: FinanceTheme.primary + '22',
    borderColor: FinanceTheme.primary,
  },
  tfText: { fontFamily: Fonts.semiBold, color: FinanceTheme.textSecondary },
  tfTextActive: { color: FinanceTheme.primary },

  // Period change
  periodRow: { alignItems: 'center', paddingBottom: Spacing.sm },
  periodBadge: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  periodText: { fontFamily: Fonts.semiBold, fontSize: 14 },

  // Chart
  chartContainer: {
    paddingHorizontal: H_PADDING,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  chartLoadingBox: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: FinanceTheme.card, borderRadius: Radii.md,
  },

  // Day info
  dayCard: { marginHorizontal: H_PADDING, marginBottom: Spacing.md },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center' },
  dayLabel: { fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  dayValue: { fontFamily: Fonts.semiBold, color: FinanceTheme.text },

  // Section header
  sectionHeader: {
    paddingHorizontal: H_PADDING,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11, fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
    letterSpacing: 1.2, textTransform: 'uppercase',
  },

  // Metrics — 2-column responsive
  metricsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: H_PADDING,
    gap: METRIC_GAP, marginBottom: Spacing.md,
  },
  metricCard: {
    width: METRIC_W,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.lg,
    padding: 14,
    borderWidth: 1, borderColor: FinanceTheme.cardBorder,
    minHeight: 80,
    justifyContent: 'space-between',
  },
  metricHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  metricLabel: {
    fontSize: 11, textTransform: 'uppercase',
    letterSpacing: 0.5, color: FinanceTheme.textMuted,
  },
  metricValue: {
    fontFamily: Fonts.semiBold, color: FinanceTheme.text,
    fontSize: 15,
  },

  // Profile
  profileCard: { marginHorizontal: H_PADDING, marginBottom: Spacing.md },
  profileRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  profileLabel: { color: FinanceTheme.textMuted, fontSize: 12 },
  profileValue: {
    fontFamily: Fonts.semiBold, color: FinanceTheme.text,
    fontSize: 13, maxWidth: '60%', textAlign: 'right',
  },
  descBox: { paddingTop: 10 },
  descLabel: {
    color: FinanceTheme.textMuted, fontSize: 10,
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6,
  },
  descText: { color: FinanceTheme.textSecondary, fontSize: 13, lineHeight: 20 },

  // News
  newsList: { paddingHorizontal: H_PADDING, marginBottom: Spacing.md, gap: 8 },
  newsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.lg, padding: 14,
    borderWidth: 1, borderColor: FinanceTheme.cardBorder,
    gap: 10,
  },
  newsContent: { flex: 1 },
  newsTitle: {
    color: FinanceTheme.text, fontSize: 13,
    fontFamily: Fonts.medium, lineHeight: 18, marginBottom: 4,
  },
  newsDate: { color: FinanceTheme.textMuted, fontSize: 11 },

  // Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  modalCard: {
    width: '100%', backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl, borderWidth: 1,
    borderColor: FinanceTheme.cardBorder, padding: Spacing.lg,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalIconWrap: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: FinanceTheme.primary + '1A',
    alignItems: 'center', justifyContent: 'center',
  },
  modalTitle: { fontFamily: Fonts.semiBold, color: FinanceTheme.text, fontSize: 16, flex: 1 },
  modalDivider: { height: 1, backgroundColor: FinanceTheme.divider, marginVertical: 14 },
  modalDesc: { color: FinanceTheme.textSecondary, fontSize: 14, lineHeight: 22 },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  listIconButton: {
    padding: 4,
  },
  listModalCard: {
    width: '90%',
    maxHeight: '60%',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: Spacing.lg,
  },
  listModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  listModalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: FinanceTheme.text,
  },
  listModalScroll: {
    marginTop: Spacing.sm,
  },
  listModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  listModalItemName: {
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  emptyListText: {
    textAlign: 'center',
    color: FinanceTheme.textMuted,
    paddingVertical: 24,
  },

  // ─── Trade Bar ───
  tradeBar: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: FinanceTheme.tabBar,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FinanceTheme.divider,
    gap: 12,
  },
  tradeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: Radii.xl,
    gap: 8,
  },
  buyBtn: { backgroundColor: FinanceTheme.profit },
  sellBtn: { backgroundColor: FinanceTheme.loss },
  tradeBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 16,
  },
});
