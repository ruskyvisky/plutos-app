import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Body, Caption, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import type { Stock } from '@/services/api';
import { formatPercent } from '@/services/mockData';
import { useCurrency } from '@/contexts/CurrencyContext';

interface StockRowProps {
  stock: Stock;
  onPress?: (symbol: string) => void;
}

export function StockRow({ stock, onPress }: StockRowProps) {
  const { formatPrice } = useCurrency();
  const isPositive = stock.change >= 0;
  const changeColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;
  const changeBg = isPositive ? FinanceTheme.profitBg : FinanceTheme.lossBg;

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.7}
      onPress={() => onPress?.(stock.symbol)}
    >
      {/* Sol: Sembol & İsim */}
      <View style={styles.left}>
        <View style={styles.symbolBadge}>
          {stock.logoUrl ? (
            <Image
              source={{ uri: stock.logoUrl }}
              style={styles.logo}
              contentFit="contain"
              // Logo yüklenemezse sembol baş harflerine fallback
              onError={() => {}}
            />
          ) : (
            <Typography variant="caption" style={styles.symbolText}>
              {stock.symbol.slice(0, 2)}
            </Typography>
          )}
        </View>
        <View style={styles.nameBlock}>
          <Body style={styles.symbol}>{stock.symbol}</Body>
          <Caption numberOfLines={1} style={styles.name}>{stock.name}</Caption>
        </View>
      </View>

      {/* Sağ: Fiyat & Değişim */}
      <View style={styles.right}>
        <Typography variant="body" numeric style={styles.price}>
          {formatPrice(stock.price, stock.symbol)}
        </Typography>
        <View style={[styles.changeBadge, { backgroundColor: changeBg }]}>
          <Ionicons
            name={isPositive ? 'caret-up' : 'caret-down'}
            size={10}
            color={changeColor}
          />
          <Typography variant="caption" numeric style={[styles.changeText, { color: changeColor }]}>
            {formatPercent(stock.change)}
          </Typography>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  symbolBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  symbolText: {
    fontFamily: Fonts.bold,
    color: FinanceTheme.primary,
    fontSize: 14,
  },
  nameBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  symbol: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  name: {
    fontSize: 12,
    marginTop: 1,
  },
  right: {
    alignItems: 'flex-end',
  },
  price: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    marginBottom: 3,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  changeText: {
    fontFamily: Fonts.semiBold,
    marginLeft: 3,
    fontSize: 11,
  },
});
