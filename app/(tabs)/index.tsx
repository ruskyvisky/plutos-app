import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import { IndexWidget } from '@/components/market/IndexWidget';
import { FavoriteWidget } from '@/components/market/FavoriteWidget';
import { PortfolioSummaryCard } from '@/components/market/PortfolioSummaryCard';
import { StockRow } from '@/components/market/StockRow';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonCard, SkeletonRow } from '@/components/ui/SkeletonLoader';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import {
  fetchIndices,
  fetchPortfolio,
  fetchTopGainers,
  fetchTopLosers,
  fetchTopVolume,
} from '@/services/api';
import type { IndexData, PortfolioData, Stock } from '@/services/api';

type TabKey = 'gainers' | 'losers' | 'volume';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'gainers', label: 'Yükselenler' },
  { key: 'losers', label: 'Düşenler' },
  { key: 'volume', label: 'Hacim' },
];

export default function MarketScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('gainers');
  const [stockData, setStockData] = useState<Record<TabKey, Stock[]>>({
    gainers: [],
    losers: [],
    volume: [],
  });
  // Favori bölümünü yenilemek için focus trigger
  const [favTrigger, setFavTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFavTrigger((n) => n + 1);
    }, [])
  );

  const loadData = useCallback(async () => {
    try {
      const [indicesRes, portfolioRes, gainersRes, losersRes, volumeRes] =
        await Promise.all([
          fetchIndices(),
          fetchPortfolio(),
          fetchTopGainers(),
          fetchTopLosers(),
          fetchTopVolume(),
        ]);
      setIndices(indicesRes);
      setPortfolio(portfolioRes);
      setStockData({ gainers: gainersRes, losers: losersRes, volume: volumeRes });
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
        {/* Header */}
        <View style={styles.header}>
          <H2>Piyasa Özeti</H2>
          <Caption>Canlı veriler</Caption>
        </View>

        {/* Portföy Özet */}
        {portfolio && (
          <PortfolioSummaryCard
            totalBalance={portfolio.totalBalance}
            dailyPL={portfolio.dailyPL}
            dailyPLPercent={portfolio.dailyPLPercent}
            onPress={() => router.push('/(tabs)/portfolio' as any)}
          />
        )}

        {/* Favori Hisseler */}
        <View style={styles.sectionHeader}>
          <Caption style={styles.sectionLabel}>FAVORİ HİSSELER</Caption>
        </View>
        <FavoriteWidget refreshTrigger={favTrigger} />

        {/* Endeksler — yatay scroll */}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
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
});
