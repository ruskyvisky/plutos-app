import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { FinanceTheme, Spacing } from '@/constants/theme';

interface DataSourceFooterProps {
  source?: string;
}

export function DataSourceFooter({
  source = 'Borsa İstanbul',
}: DataSourceFooterProps) {
  return (
    <View style={styles.container}>
      <Caption style={styles.text}>Veri Kaynağı: {source}</Caption>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  text: {
    color: FinanceTheme.textMuted,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
