import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { StockRow } from '@/components/market/StockRow';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonRow } from '@/components/ui/SkeletonLoader';
import { H2, Body, Caption } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import { fetchAllStocks, searchStocks } from '@/services/api';
import { SECTORS, type Stock } from '@/services/mockData';

export default function DiscoverScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  useEffect(() => {
    fetchAllStocks().then((data) => {
      setAllStocks(data);
      setFilteredStocks(data);
      setLoading(false);
    });
  }, []);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setSelectedSector(null);
      if (query.length === 0) {
        setFilteredStocks(allStocks);
      } else {
        const results = await searchStocks(query);
        setFilteredStocks(results);
      }
    },
    [allStocks]
  );

  const handleSectorPress = useCallback(
    (sector: string) => {
      if (selectedSector === sector) {
        setSelectedSector(null);
        setFilteredStocks(allStocks);
      } else {
        setSelectedSector(sector);
        setFilteredStocks(allStocks.filter((s) => s.sector === sector));
      }
    },
    [allStocks, selectedSector]
  );

  const handleStockPress = useCallback(
    (symbol: string) => {
      router.push(`/stock/${symbol}` as any);
    },
    [router]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <H2>Keşfet</H2>
        <Caption>{allStocks.length} hisse</Caption>
      </View>

      {/* Arama */}
      <SearchBar onSearch={handleSearch} />

      {/* Sektör Filtreleri — sabit yükseklikte ScrollView */}
      {searchQuery.length === 0 && (
        <View style={styles.sectorWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectorList}
          >
            {(SECTORS as readonly string[]).map((sector) => (
              <TouchableOpacity
                key={sector}
                style={[
                  styles.sectorChip,
                  selectedSector === sector && styles.sectorChipActive,
                ]}
                onPress={() => handleSectorPress(sector)}
                activeOpacity={0.7}
              >
                <Caption
                  style={[
                    styles.sectorText,
                    selectedSector === sector && styles.sectorTextActive,
                  ]}
                >
                  {sector}
                </Caption>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Hisse Listesi */}
      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => (
          <StockRow stock={item} onPress={handleStockPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Body style={styles.emptyText}>
              {searchQuery ? 'Sonuç bulunamadı.' : 'Hisse bulunamadı.'}
            </Body>
          </View>
        }
        ListFooterComponent={<DataSourceFooter />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  loadingContainer: {
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
  sectorWrapper: {
    height: 40,          // sabit yükseklik — uzama engelleniyor
    marginBottom: Spacing.md,
  },
  sectorList: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectorChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FinanceTheme.surface,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectorChipActive: {
    backgroundColor: FinanceTheme.primary,
    borderColor: FinanceTheme.primary,
  },
  sectorText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: FinanceTheme.textSecondary,
    lineHeight: 16,
  },
  sectorTextActive: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    padding: Spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    color: FinanceTheme.textMuted,
  },
});
