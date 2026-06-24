/**
 * Plutos — Favori Hisseler Kartı (Ana Sayfa)
 * AsyncStorage'dan favorileri okur, fiyat/değişim gösterir.
 */
import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Caption, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { getFavorites } from '@/services/favorites';
import { fetchStockDetail } from '@/services/api';
import type { Stock } from '@/services/api';
import { formatPercent } from '@/services/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';

interface FavoriteWidgetProps {
  /** Dış kaynaklı yenileme tetikleyici — örn. focus event'ten değişen sayaç */
  refreshTrigger?: number;
}

export function FavoriteWidget({ refreshTrigger }: FavoriteWidgetProps) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    const symbols = await getFavorites();
    if (symbols.length === 0) {
      setStocks([]);
      setLoading(false);
      return;
    }
    const results = await Promise.all(
      symbols.map((s) => fetchStockDetail(s).catch(() => null))
    );
    setStocks(results.filter(Boolean) as Stock[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites, refreshTrigger]);

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        {[1, 2].map((i) => (
          <View key={i} style={styles.skeletonChip} />
        ))}
      </View>
    );
  }

  if (stocks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="star-outline" size={20} color={FinanceTheme.textMuted} />
        <Caption style={styles.emptyText}>
          Henüz favori hisse eklemediniz. Hisse detay sayfasındaki ★ ikonuna basın.
        </Caption>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {stocks.map((stock) => {
        const isPos = stock.change >= 0;
        const color = isPos ? FinanceTheme.profit : FinanceTheme.loss;
        const bg = isPos ? FinanceTheme.profitBg : FinanceTheme.lossBg;
        return (
          <TouchableOpacity
            key={stock.symbol}
            style={styles.chip}
            onPress={() => router.push(`/stock/${stock.symbol}` as any)}
            activeOpacity={0.75}
          >
            <View style={styles.chipTop}>
              <Caption style={styles.chipSymbol}>{stock.symbol}</Caption>
              <View style={[styles.chipBadge, { backgroundColor: bg }]}>
                <Ionicons
                  name={isPos ? 'caret-up' : 'caret-down'}
                  size={9}
                  color={color}
                />
                <Caption style={[styles.chipChange, { color }]}>
                  {formatPercent(stock.change)}
                </Caption>
              </View>
            </View>
            <Typography variant="bodySmall" numeric style={styles.chipPrice}>
              {formatPrice(stock.price, stock.symbol)}
            </Typography>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 4,
    gap: 10,
  },
  chip: {
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: 12,
    minWidth: 110,
  },
  chipTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 6,
  },
  chipSymbol: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.text,
    fontSize: 13,
  },
  chipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 2,
  },
  chipChange: { fontSize: 10, fontFamily: Fonts.semiBold },
  chipPrice: {
    fontFamily: Fonts.medium,
    color: FinanceTheme.textSecondary,
    fontSize: 12,
  },
  loadingRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  skeletonChip: {
    width: 110, height: 68,
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.card,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  emptyText: {
    color: FinanceTheme.textMuted,
    flex: 1,
    lineHeight: 17,
  },
});
