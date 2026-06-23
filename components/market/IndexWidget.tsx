import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { H3, Body, Caption } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import { formatPercent, type IndexData } from '@/services/mockData';

interface IndexWidgetProps {
  data: IndexData[];
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
  const isPositive = item.change >= 0;
  const changeColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;

  return (
    <Card variant="default" padding="sm" style={styles.card}>
      <Caption style={styles.label}>{item.name}</Caption>
      <H3 numeric style={styles.value}>
        {item.value.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
      </H3>
      <Body
        numeric
        style={[styles.change, { color: changeColor }]}
      >
        {formatPercent(item.change)}
      </Body>
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
    width: 140,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  label: {
    marginBottom: 4,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    marginBottom: 2,
  },
  change: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },
});
