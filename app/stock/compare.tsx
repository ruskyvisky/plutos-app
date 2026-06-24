import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Body, Caption, H2, H3, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { fetchStockDetail, fetchAllStocks, type Stock } from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MetricComparisonProps {
  label: string;
  valA: number;
  valB: number;
  formatType?: 'price' | 'percent' | 'number' | 'currency';
  symbolA: string;
  symbolB: string;
  colorA: string;
  colorB: string;
}

function MetricComparison({
  label,
  valA,
  valB,
  formatType = 'number',
  symbolA,
  symbolB,
  colorA,
  colorB,
}: MetricComparisonProps) {
  const { formatPrice } = useCurrency();

  const renderVal = (v: number, sym: string) => {
    if (v === undefined || v === null || isNaN(v)) return '–';
    if (formatType === 'price') return formatPrice(v, sym);
    if (formatType === 'percent') return `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`;
    if (formatType === 'currency') {
      if (v > 1e9) return `₺${(v / 1e9).toFixed(2)}B`;
      if (v > 1e6) return `₺${(v / 1e6).toFixed(2)}M`;
      return `₺${v.toLocaleString('tr-TR')}`;
    }
    return v.toFixed(2);
  };

  // Bar length calculation
  const maxVal = Math.max(Math.abs(valA || 0), Math.abs(valB || 0)) || 1;
  const pctA = Math.max(5, (Math.abs(valA || 0) / maxVal) * 100);
  const pctB = Math.max(5, (Math.abs(valB || 0) / maxVal) * 100);

  return (
    <View style={styles.metricCard}>
      <Body style={styles.metricLabel}>{label}</Body>
      
      {/* Values Row */}
      <View style={styles.metricValuesRow}>
        <View style={styles.valBlockLeft}>
          <Typography variant="body" numeric style={{ fontFamily: Fonts.semiBold, color: colorA }}>
            {renderVal(valA, symbolA)}
          </Typography>
          <Caption style={{ color: FinanceTheme.textMuted }}>{symbolA}</Caption>
        </View>
        
        <View style={styles.valBlockRight}>
          <Typography variant="body" numeric style={{ fontFamily: Fonts.semiBold, color: colorB }}>
            {renderVal(valB, symbolB)}
          </Typography>
          <Caption style={{ color: FinanceTheme.textMuted }}>{symbolB}</Caption>
        </View>
      </View>

      {/* Histogram Bars */}
      <View style={styles.histogramContainer}>
        {/* Left Bar (Stock A) */}
        <View style={styles.barTrackLeft}>
          <View
            style={[
              styles.barFillLeft,
              { width: `${pctA}%`, backgroundColor: colorA },
            ]}
          />
        </View>

        {/* Right Bar (Stock B) */}
        <View style={styles.barTrackRight}>
          <View
            style={[
              styles.barFillRight,
              { width: `${pctB}%`, backgroundColor: colorB },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export default function CompareScreen() {
  const router = useRouter();
  const { a: symbolA } = useLocalSearchParams<{ a: string }>();

  const [stockA, setStockA] = useState<Stock | null>(null);
  const [stockB, setStockB] = useState<Stock | null>(null);
  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  // Search Stock B state
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allStocksList, setAllStocksList] = useState<Stock[]>([]);
  const [filteredList, setFilteredList] = useState<Stock[]>([]);

  // Colors
  const colorA = '#38BDF8'; // Sky Blue
  const colorB = '#EC4899'; // Pink/Rose

  // Load Stock A details on mount
  useEffect(() => {
    if (symbolA) {
      setLoadingA(true);
      fetchStockDetail(symbolA)
        .then((detail) => setStockA(detail))
        .catch((e) => console.error(e))
        .finally(() => setLoadingA(false));
    }
  }, [symbolA]);

  // Load all stocks for B selection search
  const openSearch = async () => {
    setSearchModalVisible(true);
    setSearchQuery('');
    try {
      const list = await fetchAllStocks();
      setAllStocksList(list);
      setFilteredList(list);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredList(allStocksList);
    } else {
      const lower = text.toLowerCase();
      setFilteredList(
        allStocksList.filter(
          (s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
        )
      );
    }
  };

  const selectStockB = (symbol: string) => {
    setSearchModalVisible(false);
    setLoadingB(true);
    fetchStockDetail(symbol)
      .then((detail) => setStockB(detail))
      .catch((e) => console.error(e))
      .finally(() => setLoadingB(false));
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
        </TouchableOpacity>
        <H2 style={{ fontFamily: Fonts.bold }}>Hisse Karşılaştırma</H2>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Selector Cards (Stock A and Stock B side by side) */}
        <View style={styles.selectorsRow}>
          {/* Card A */}
          <View style={[styles.selectorCard, { borderColor: colorA }]}>
            <Caption style={{ color: colorA, fontFamily: Fonts.bold }}>HİSSE A</Caption>
            {loadingA ? (
              <Caption style={{ marginTop: 10 }}>Yükleniyor...</Caption>
            ) : stockA ? (
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <H3>{stockA.symbol}</H3>
                <Caption numberOfLines={1} style={styles.cardName}>{stockA.name}</Caption>
                <Body numeric style={{ fontFamily: Fonts.bold, marginTop: 4 }}>
                  ₺{stockA.price?.toFixed(2) || '0.00'}
                </Body>
              </View>
            ) : (
              <Caption style={{ marginTop: 10 }}>Seçilmedi</Caption>
            )}
          </View>

          {/* VS Divider */}
          <View style={styles.vsCircle}>
            <Caption style={styles.vsText}>VS</Caption>
          </View>

          {/* Card B */}
          <TouchableOpacity
            style={[styles.selectorCard, { borderColor: stockB ? colorB : FinanceTheme.cardBorder }]}
            onPress={openSearch}
            activeOpacity={0.8}
          >
            <Caption style={{ color: stockB ? colorB : FinanceTheme.textMuted, fontFamily: Fonts.bold }}>
              HİSSE B
            </Caption>
            {loadingB ? (
              <Caption style={{ marginTop: 10 }}>Yükleniyor...</Caption>
            ) : stockB ? (
              <View style={{ alignItems: 'center', marginTop: 8 }}>
                <H3>{stockB.symbol}</H3>
                <Caption numberOfLines={1} style={styles.cardName}>{stockB.name}</Caption>
                <Body numeric style={{ fontFamily: Fonts.bold, marginTop: 4 }}>
                  ₺{stockB.price?.toFixed(2) || '0.00'}
                </Body>
              </View>
            ) : (
              <View style={styles.selectPrompt}>
                <Ionicons name="add-circle-outline" size={24} color={FinanceTheme.primary} />
                <Caption style={styles.selectPromptText}>Hisse Seç</Caption>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {stockA && stockB ? (
          // Metric Comparisons List (Histogram Charts)
          <View style={styles.metricsContainer}>
            <MetricComparison
              label="Fiyat"
              valA={stockA.price}
              valB={stockB.price}
              formatType="price"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Günlük Değişim %"
              valA={stockA.change}
              valB={stockB.change}
              formatType="percent"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Piyasa Değeri"
              valA={stockA.marketCap}
              valB={stockB.marketCap}
              formatType="currency"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Fiyat/Kazanç (F/K) Oranı"
              valA={stockA.pe}
              valB={stockB.pe}
              formatType="number"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Piyasa Değeri/Defter Değeri (PD/DD)"
              valA={stockA.pb}
              valB={stockB.pb}
              formatType="number"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Hisse Başına Kazanç (EPS)"
              valA={stockA.eps}
              valB={stockB.eps}
              formatType="number"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />

            <MetricComparison
              label="Temettü Verimi %"
              valA={stockA.dividendYield}
              valB={stockB.dividendYield}
              formatType="percent"
              symbolA={stockA.symbol}
              symbolB={stockB.symbol}
              colorA={colorA}
              colorB={colorB}
            />
          </View>
        ) : (
          // Comparison Placeholder State
          <View style={styles.placeholderContainer}>
            <Ionicons name="git-compare-outline" size={48} color={FinanceTheme.textMuted} />
            <Body style={styles.placeholderTitle}>Karşılaştırma için Hisse Seçin</Body>
            <Caption style={styles.placeholderText}>
              Karşılaştırmak istediğiniz ikinci hisseyi sağdaki "Hisse Seç" kutusuna basarak belirleyin.
            </Caption>
          </View>
        )}
      </ScrollView>

      {/* Search Modal for Stock B Selection */}
      <Modal visible={searchModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.searchBarWrapper}>
              <Ionicons name="search" size={20} color={FinanceTheme.textMuted} style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder="Hisse adı veya sembolü ara..."
                placeholderTextColor={FinanceTheme.textMuted}
                value={searchQuery}
                onChangeText={handleSearch}
                autoFocus
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearch('')}>
                  <Ionicons name="close-circle" size={18} color={FinanceTheme.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)} style={styles.closeModalBtn}>
              <Caption style={styles.closeModalText}>İptal</Caption>
            </TouchableOpacity>
          </View>

          <FlatList
            data={filteredList}
            keyExtractor={(item) => item.symbol}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultRow}
                onPress={() => selectStockB(item.symbol)}
                activeOpacity={0.7}
              >
                <View>
                  <Body style={{ fontFamily: Fonts.bold }}>{item.symbol}</Body>
                  <Caption style={{ color: FinanceTheme.textSecondary }}>{item.name}</Caption>
                </View>
                <Ionicons name="chevron-forward" size={16} color={FinanceTheme.textMuted} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', padding: Spacing.xl }}>
                <Body style={{ color: FinanceTheme.textMuted }}>Sonuç bulunamadı.</Body>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FinanceTheme.divider,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
  },
  selectorsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  selectorCard: {
    flex: 1,
    height: 120,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1.5,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    color: FinanceTheme.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: '90%',
  },
  vsCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.md,
    borderWidth: 1.5,
    borderColor: FinanceTheme.cardBorder,
  },
  vsText: {
    fontFamily: Fonts.bold,
    fontSize: 11,
    color: FinanceTheme.textSecondary,
  },
  selectPrompt: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  selectPromptText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: Spacing.md,
  },
  placeholderTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: FinanceTheme.textSecondary,
  },
  placeholderText: {
    color: FinanceTheme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.xl,
  },
  metricsContainer: {
    gap: Spacing.md,
  },
  metricCard: {
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: Spacing.md,
  },
  metricLabel: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  metricValuesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  valBlockLeft: {
    alignItems: 'flex-start',
  },
  valBlockRight: {
    alignItems: 'flex-end',
  },
  histogramContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: FinanceTheme.background,
  },
  barTrackLeft: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: FinanceTheme.background,
  },
  barTrackRight: {
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: FinanceTheme.background,
  },
  barFillLeft: {
    height: '100%',
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  barFillRight: {
    height: '100%',
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FinanceTheme.divider,
    gap: Spacing.md,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FinanceTheme.surface,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    color: FinanceTheme.text,
    fontFamily: Fonts.medium,
    fontSize: 14,
    paddingVertical: 0,
  },
  closeModalBtn: {
    paddingVertical: 8,
  },
  closeModalText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.bold,
  },
  searchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: FinanceTheme.divider,
  },
});
