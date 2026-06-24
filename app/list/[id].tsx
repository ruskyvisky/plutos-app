/**
 * Plutos — Liste Detay Ekranı
 * Listeye eklenmiş hisse/fon/kripto'ları gösterir.
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { StockRow } from '@/components/market/StockRow';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonRow } from '@/components/ui/SkeletonLoader';
import { Body, Caption, H2 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import type { Stock } from '@/services/api';
import { fetchStockDetail } from '@/services/api';
import { getLists, type StockList } from '@/services/listsService';

export default function ListDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [list, setList] = useState<StockList | null>(null);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const lists = await getLists();
    const found = lists.find(l => l.id === id) ?? null;
    setList(found);

    if (found && found.symbols.length > 0) {
      const results = await Promise.all(
        found.symbols.map(s => fetchStockDetail(s).catch(() => null))
      );
      setStocks(results.filter(Boolean) as Stock[]);
    } else {
      setStocks([]);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleStockPress = (symbol: string) => {
    router.push(`/stock/${symbol}` as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <View style={styles.iconBadge}>
            <Caption style={styles.icon}>{list?.icon ?? '📋'}</Caption>
          </View>
          <View>
            <H2 style={styles.title} numberOfLines={1}>
              {list?.name ?? 'Liste'}
            </H2>
            {!loading && (
              <Caption style={styles.subtitle}>
                {stocks.length} enstrüman
                {list?.isSystem && <Caption style={styles.systemTag}> · Otomatik</Caption>}
              </Caption>
            )}
          </View>
        </View>
      </View>

      {/* İçerik */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3, 4].map(i => <SkeletonRow key={i} />)}
        </View>
      ) : (
        <FlatList
          data={stocks}
          keyExtractor={item => item.symbol}
          renderItem={({ item }) => (
            <StockRow stock={item} onPress={handleStockPress} />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="add-circle-outline" size={48} color={FinanceTheme.textMuted} />
              <Body style={styles.emptyTitle}>Liste Boş</Body>
              <Caption style={styles.emptyText}>
                Hisse detay sayfasından bu listeye enstrüman ekleyebilirsiniz.
              </Caption>
            </View>
          }
          ListFooterComponent={<DataSourceFooter />}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  headerTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 22,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
  },
  subtitle: {
    color: FinanceTheme.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  systemTag: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
  },
  loadingContainer: {
    paddingTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: FinanceTheme.textSecondary,
  },
  emptyText: {
    color: FinanceTheme.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
