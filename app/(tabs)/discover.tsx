import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { StockRow } from '@/components/market/StockRow';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SearchBar } from '@/components/ui/SearchBar';
import { SkeletonRow } from '@/components/ui/SkeletonLoader';
import { Body, Caption, H2 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import type { Stock } from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';
import { fetchAllStocks, searchStocks, fetchCrypto, fetchCommodities } from '@/services/api';
import { SECTORS } from '@/services/mockData';

type CategoryTabKey = 'stocks' | 'crypto' | 'commodities';

export default function DiscoverScreen() {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryTabKey>('stocks');
  const [allStocks, setAllStocks] = useState<Stock[]>([]);
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const loadCategoryData = useCallback(async (cat: CategoryTabKey) => {
    setLoading(true);
    setSelectedSector(null);
    setSearchQuery('');
    try {
      let data: Stock[] = [];
      if (cat === 'stocks') {
        data = await fetchAllStocks();
      } else if (cat === 'crypto') {
        data = await fetchCrypto();
      } else if (cat === 'commodities') {
        data = await fetchCommodities();
      }
      setAllStocks(data);
      setFilteredStocks(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategoryData(activeCategory);
  }, [activeCategory, loadCategoryData]);

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      setSelectedSector(null);
      if (query.length === 0) {
        setFilteredStocks(allStocks);
      } else {
        if (activeCategory === 'stocks') {
          const results = await searchStocks(query);
          setFilteredStocks(results);
        } else {
          const lower = query.toLowerCase();
          const results = allStocks.filter(
            (s) => s.symbol.toLowerCase().includes(lower) || s.name.toLowerCase().includes(lower)
          );
          setFilteredStocks(results);
        }
      }
    },
    [allStocks, activeCategory]
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <H2>Keşfet</H2>
            <Caption>
              {allStocks.length} {activeCategory === 'stocks' ? 'hisse' : activeCategory === 'crypto' ? 'kripto' : 'emtia'}
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

      {/* Arama */}
      <SearchBar onSearch={handleSearch} />

      {/* Kategori Tab Bar */}
      <View style={styles.categoryTabContainer}>
        {(['stocks', 'crypto', 'commodities'] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryTab,
              activeCategory === cat && styles.categoryTabActive,
            ]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.7}
          >
            <Body
              style={[
                styles.categoryTabText,
                activeCategory === cat && styles.categoryTabTextActive,
              ]}
            >
              {cat === 'stocks' ? 'Hisseler' : cat === 'crypto' ? 'Kripto' : 'Emtia'}
            </Body>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sektör Filtreleri — Sadece Hisseler sekmesinde ve arama yokken görünür */}
      {activeCategory === 'stocks' && searchQuery.length === 0 && !loading && (
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

      {/* Hisse Listesi / Yükleme İskeleti */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : (
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
      )}
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
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: FinanceTheme.textMuted,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
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
  categoryTabContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: FinanceTheme.surface,
  },
  categoryTabActive: {
    backgroundColor: FinanceTheme.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: FinanceTheme.textSecondary,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
});
