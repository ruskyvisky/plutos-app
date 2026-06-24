import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import type { IndexData } from '@/services/api';
import { formatCompactValue, formatPercent } from '@/services/mockData';

import { useCurrency } from '@/contexts/CurrencyContext';

interface IndexWidgetProps {
  data: IndexData[];
}

/** Endeks/parite için uygun emoji döner */
function getIndexEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('bitcoin') || n.includes('btc')) return '₿';
  if (n.includes('dolar') || n.includes('usd')) return '$';
  if (n.includes('euro') || n.includes('eur')) return '€';
  if (n.includes('altın') || n.includes('gold') || n.includes('gc')) return '🥇';
  if (n.includes('bist')) return '📈';
  return '📊';
}

export function IndexWidget({ data }: IndexWidgetProps) {
  return (
    <FlatList
      data={data}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      keyExtractor={(item) => item.name}
      renderItem={({ item }) => <IndexCard item={item} />}
    />
  );
}

function IndexCard({ item }: { item: IndexData }) {
  const { formatPrice } = useCurrency();
  const isPositive = item.change >= 0;
  const changeColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;
  const changeBg = isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg;

  let formattedValue = '';
  const nameLower = item.name.toLowerCase();
  if (item.name === 'XU100' || item.name === 'XU030') {
    formattedValue = item.value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (nameLower.includes('dolar/tl') || nameLower.includes('euro/tl')) {
    formattedValue = `₺${item.value.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  } else if (nameLower.includes('gram altın')) {
    formattedValue = formatPrice(item.value, 'GC=F');
  } else if (nameLower.includes('bitcoin')) {
    formattedValue = formatPrice(item.value, 'BTC-USD');
  } else {
    formattedValue = formatPrice(item.value);
  }

  return (
    <Card variant="default" padding="sm" style={styles.card}>
      {/* İkon + İsim */}
      <View style={styles.header}>
        <View style={styles.emojiBadge}>
          <Caption style={styles.emoji}>{getIndexEmoji(item.name)}</Caption>
        </View>
        <Caption style={styles.label} numberOfLines={1}>{item.name}</Caption>
      </View>

      {/* Değer */}
      <H3 numeric style={styles.value}>
        {formattedValue}
      </H3>

      {/* Değişim Rozeti */}
      <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
        <Body numeric style={[styles.change, { color: changeColor }]}>
          {formatPercent(item.change)}
        </Body>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  card: {
    width: 148,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  emojiBadge: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 16,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    flex: 1,
  },
  value: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    marginBottom: 6,
  },
  changeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  change: {
    fontSize: 12,
    fontFamily: Fonts.semiBold,
  },
});
