import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { IndexWidget } from '@/components/market/IndexWidget';
import { ListsWidget } from '@/components/market/ListsWidget';
import { StockRow } from '@/components/market/StockRow';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonCard, SkeletonRow } from '@/components/ui/SkeletonLoader';
import { Body, Caption, H2 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import type { IndexData, Stock } from '@/services/api';
import {
  fetchIndices,
  fetchTopGainers,
  fetchTopLosers,
  fetchTopVolume,
} from '@/services/api';
import { updatePopularList } from '@/services/listsService';

import { useCurrency } from '@/contexts/CurrencyContext';

type TabKey = 'gainers' | 'losers' | 'volume';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'gainers', label: 'Yükselenler' },
  { key: 'losers', label: 'Düşenler' },
  { key: 'volume', label: 'Hacim' },
];

export default function MarketScreen() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('gainers');
  const [stockData, setStockData] = useState<Record<TabKey, Stock[]>>({
    gainers: [],
    losers: [],
    volume: [],
  });
  const [listRefreshTrigger, setListRefreshTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setListRefreshTrigger((n) => n + 1);
    }, [])
  );

  const loadData = useCallback(async () => {
    try {
      const [indicesRes, gainersRes, losersRes, volumeRes] = await Promise.all([
        fetchIndices(),
        fetchTopGainers(),
        fetchTopLosers(),
        fetchTopVolume(),
      ]);
      setIndices(indicesRes);
      setStockData({ gainers: gainersRes, losers: losersRes, volume: volumeRes });

      // "En Popüler" sistem listesini güncelle (hacim bazlı + yükselenler)
      const popularSymbols = [
        ...new Set([
          ...volumeRes.slice(0, 5).map(s => s.symbol),
          ...gainersRes.slice(0, 5).map(s => s.symbol),
        ]),
      ].slice(0, 10);
      await updatePopularList(popularSymbols);
      // Liste güncellenince widget'ı tetikle
      setListRefreshTrigger((n) => n + 1);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleStockPress = useCallback(
    (symbol: string) => {
      router.push(`/stock/${symbol}` as any);
    },
    [router]
  );

  const activeStocks = stockData[activeTab];

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <View style={{ marginTop: 16 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={FinanceTheme.primary}
            colors={[FinanceTheme.primary]}
          />
        }
      >
        {/* Sayfa Başlığı */}
        <View style={styles.pageHeader}>
          <View style={styles.headerRow}>
            <View>
              <H2 style={styles.pageTitle}>Piyasa</H2>
              <Caption style={styles.pageSubtitle}>
                {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </Caption>
            </View>
            
            <View style={styles.currencySelector}>
              {(['TRY', 'USD', 'EUR'] as const).map((curr) => (
                <TouchableOpacity
                  key={curr}
                  style={[
                    styles.currencyPill,
                    currency === curr && styles.currencyPillActive,
                  ]}
                  onPress={() => setCurrency(curr)}
                  activeOpacity={0.7}
                >
                  <Body style={[
                    styles.currencyPillText,
                    currency === curr && styles.currencyPillTextActive
                  ]}>
                    {curr}
                  </Body>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Endeksler & Döviz — yatay scroll */}
        <View style={styles.sectionHeader}>
          <Caption style={styles.sectionLabel}>ENDEKSLER & DÖVİZ</Caption>
        </View>
        <IndexWidget data={indices} />

        {/* Hisse Listeleri — Sekmeli */}
        <View style={styles.tabContainer}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Body
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Body>
            </TouchableOpacity>
          ))}
        </View>

        {/* Hisse Listesi */}
        {activeStocks.map((stock) => (
          <StockRow key={stock.symbol} stock={stock} onPress={handleStockPress} />
        ))}

        {/* Listeler (Yükselen/Düşen/Hacim Hisse Listelerinin Altına Alındı) */}
        <View style={styles.sectionHeader}>
          <Caption style={styles.sectionLabel}>LİSTELER</Caption>
        </View>
        <ListsWidget refreshTrigger={listRefreshTrigger} />

        <DataSourceFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  skeletonContainer: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  pageHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.sm,
  },
  pageTitle: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    color: FinanceTheme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: FinanceTheme.surface,
  },
  tabActive: {
    backgroundColor: FinanceTheme.primary,
  },
  tabText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: FinanceTheme.textSecondary,
    lineHeight: 18,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencySelector: {
    flexDirection: 'row',
    backgroundColor: FinanceTheme.surface,
    borderRadius: 16,
    padding: 2,
    gap: 2,
  },
  currencyPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  currencyPillActive: {
    backgroundColor: FinanceTheme.primary,
  },
  currencyPillText: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textSecondary,
  },
  currencyPillTextActive: {
    color: '#FFFFFF',
  },
});
