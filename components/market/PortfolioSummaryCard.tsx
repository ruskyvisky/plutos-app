import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Card } from '@/components/ui/Card';
import { H1, Body, Caption } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import { formatPercent } from '@/services/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';

interface PortfolioSummaryCardProps {
  totalBalance: number;
  dailyPL: number;
  dailyPLPercent: number;
  onPress?: () => void;
}

export function PortfolioSummaryCard({
  totalBalance,
  dailyPL,
  dailyPLPercent,
  onPress,
}: PortfolioSummaryCardProps) {
  const { formatPrice } = useCurrency();
  const isPositive = dailyPL >= 0;
  const plColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;
  const plBg = isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress}>
      <Card variant="elevated" padding="md" style={styles.card}>
        <View style={styles.header}>
          <Caption>Portföy Değeri</Caption>
          <Ionicons name="chevron-forward" size={16} color={FinanceTheme.textMuted} />
        </View>
        <H1 style={styles.balance}>{formatPrice(totalBalance)}</H1>
        <View style={[styles.plBadge, { backgroundColor: plBg }]}>
          <Ionicons
            name={isPositive ? 'arrow-up' : 'arrow-down'}
            size={14}
            color={plColor}
          />
          <Body
            style={[styles.plText, { color: plColor }]}
            numeric
          >
            {formatPrice(Math.abs(dailyPL))} ({formatPercent(dailyPLPercent)})
          </Body>
          <Caption style={styles.plLabel}> bugün</Caption>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  balance: {
    fontSize: 28,
    marginBottom: Spacing.sm,
  },
  plBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  plText: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    marginLeft: 4,
    lineHeight: 18,
  },
  plLabel: {
    fontSize: 12,
    color: FinanceTheme.textMuted,
  },
});
