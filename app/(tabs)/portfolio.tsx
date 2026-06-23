import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SkeletonCard, SkeletonRow } from '@/components/ui/SkeletonLoader';
import { H1, H2, H3, Body, Caption, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Shadows, Spacing } from '@/constants/theme';
import { fetchPortfolio, executeTrade } from '@/services/api';
import {
  formatCurrency,
  formatPercent,
  type Holding,
  type PortfolioData,
} from '@/services/mockData';

export default function PortfolioScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [tradeModalVisible, setTradeModalVisible] = useState(false);
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [tradeQuantity, setTradeQuantity] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);

  const loadData = useCallback(async () => {
    const data = await fetchPortfolio();
    setPortfolio(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openTradeSheet = (holding: Holding, type: 'buy' | 'sell') => {
    setSelectedHolding(holding);
    setTradeType(type);
    setTradeQuantity('');
    setTradeModalVisible(true);
  };

  const handleTrade = async () => {
    if (!selectedHolding || !tradeQuantity) return;
    setTradeLoading(true);
    const result = await executeTrade(
      selectedHolding.symbol,
      parseInt(tradeQuantity, 10),
      tradeType
    );
    setTradeLoading(false);
    setTradeModalVisible(false);
    if (result.success) {
      Alert.alert('✓ Başarılı', result.message);
    }
  };

  if (loading || !portfolio) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <SkeletonCard />
          <View style={{ marginTop: 24 }}>
            {[1, 2, 3, 4].map((i) => (
              <SkeletonRow key={i} />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isPositiveTotal = portfolio.totalPL >= 0;
  const isPositiveDaily = portfolio.dailyPL >= 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <H2>Sanal Portföy</H2>
          <Caption style={styles.headerSubtitle}>Risksiz simülasyon</Caption>
        </View>

        {/* Bakiye Kartı */}
        <Card variant="elevated" padding="lg" style={styles.balanceCard}>
          <Caption style={styles.balanceLabel}>TOPLAM DEĞERİ</Caption>
          <H1 style={styles.balanceAmount}>{formatCurrency(portfolio.totalBalance)}</H1>

          {/* Toplam Kâr/Zarar */}
          <View style={styles.plRow}>
            <View
              style={[
                styles.plBadge,
                {
                  backgroundColor: isPositiveTotal
                    ? FinanceTheme.profitBg
                    : FinanceTheme.lossBg,
                },
              ]}
            >
              <Ionicons
                name={isPositiveTotal ? 'trending-up' : 'trending-down'}
                size={14}
                color={isPositiveTotal ? FinanceTheme.profit : FinanceTheme.loss}
              />
              <Typography
                variant="bodySmall"
                numeric
                style={{
                  color: isPositiveTotal ? FinanceTheme.profit : FinanceTheme.loss,
                  fontFamily: Fonts.semiBold,
                  marginLeft: 4,
                }}
              >
                {formatCurrency(Math.abs(portfolio.totalPL))} ({formatPercent(portfolio.totalPLPercent)})
              </Typography>
            </View>
            <Caption> toplam</Caption>
          </View>

          {/* Günlük Kâr/Zarar */}
          <View style={styles.plRow}>
            <View
              style={[
                styles.plBadge,
                {
                  backgroundColor: isPositiveDaily
                    ? FinanceTheme.profitBg
                    : FinanceTheme.lossBg,
                },
              ]}
            >
              <Ionicons
                name={isPositiveDaily ? 'arrow-up' : 'arrow-down'}
                size={12}
                color={isPositiveDaily ? FinanceTheme.profit : FinanceTheme.loss}
              />
              <Typography
                variant="bodySmall"
                numeric
                style={{
                  color: isPositiveDaily ? FinanceTheme.profit : FinanceTheme.loss,
                  fontFamily: Fonts.semiBold,
                  marginLeft: 4,
                }}
              >
                {formatCurrency(Math.abs(portfolio.dailyPL))} ({formatPercent(portfolio.dailyPLPercent)})
              </Typography>
            </View>
            <Caption> bugün</Caption>
          </View>

          {/* Nakit Bakiye */}
          <View style={styles.cashRow}>
            <Caption>Nakit Bakiye</Caption>
            <Typography variant="body" numeric style={{ fontFamily: Fonts.semiBold }}>
              {formatCurrency(portfolio.cash)}
            </Typography>
          </View>
        </Card>

        {/* Holdings Header */}
        <View style={styles.sectionHeader}>
          <Caption style={styles.sectionLabel}>HİSSELERİM</Caption>
          <Caption>{portfolio.holdings.length} varlık</Caption>
        </View>

        {/* Holdings List */}
        {portfolio.holdings.map((holding) => (
          <HoldingRow
            key={holding.symbol}
            holding={holding}
            onBuy={() => openTradeSheet(holding, 'buy')}
            onSell={() => openTradeSheet(holding, 'sell')}
            onPress={() => router.push(`/stock/${holding.symbol}` as any)}
          />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* ─── Trade Bottom Sheet (Modal + KeyboardAvoidingView) ─── */}
      <Modal
        visible={tradeModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setTradeModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalKeyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setTradeModalVisible(false)}
          >
            <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
              {/* Handle */}
              <View style={styles.sheetHandle} />

              <H3 style={styles.sheetTitle}>
                {tradeType === 'buy' ? 'Hisse Al' : 'Hisse Sat'} — {selectedHolding?.symbol}
              </H3>

              <Body style={styles.sheetPrice}>
                Güncel Fiyat: {formatCurrency(selectedHolding?.currentPrice ?? 0)}
              </Body>

              {/* Miktar Input */}
              <View style={styles.sheetInputGroup}>
                <Caption style={styles.sheetInputLabel}>ADET</Caption>
                <TextInput
                  style={styles.sheetInput}
                  value={tradeQuantity}
                  onChangeText={setTradeQuantity}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={FinanceTheme.textMuted}
                  autoFocus
                />
              </View>

              {/* Toplam */}
              {tradeQuantity && parseInt(tradeQuantity, 10) > 0 && (
                <View style={styles.totalRow}>
                  <Body style={{ color: FinanceTheme.textSecondary }}>Toplam Tutar</Body>
                  <H3 numeric>
                    {formatCurrency(
                      parseInt(tradeQuantity, 10) * (selectedHolding?.currentPrice ?? 0)
                    )}
                  </H3>
                </View>
              )}

              {/* Butonlar */}
              <View style={styles.sheetButtons}>
                <Button
                  title="İptal"
                  variant="outline"
                  size="lg"
                  style={{ flex: 1, marginRight: 8 }}
                  onPress={() => setTradeModalVisible(false)}
                />
                <Button
                  title={tradeType === 'buy' ? 'Satın Al' : 'Sat'}
                  variant="solid"
                  size="lg"
                  color={tradeType === 'buy' ? FinanceTheme.profit : FinanceTheme.loss}
                  loading={tradeLoading}
                  style={{ flex: 1, marginLeft: 8 }}
                  onPress={handleTrade}
                  disabled={!tradeQuantity || parseInt(tradeQuantity, 10) <= 0}
                />
              </View>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

// ─── Holding Row Component ───────────────────────────────────

function HoldingRow({
  holding,
  onBuy,
  onSell,
  onPress,
}: {
  holding: Holding;
  onBuy: () => void;
  onSell: () => void;
  onPress: () => void;
}) {
  const pl = (holding.currentPrice - holding.avgCost) * holding.quantity;
  const plPercent = ((holding.currentPrice - holding.avgCost) / holding.avgCost) * 100;
  const isPositive = pl >= 0;
  const plColor = isPositive ? FinanceTheme.profit : FinanceTheme.loss;

  return (
    <TouchableOpacity style={styles.holdingRow} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.holdingLeft}>
        <View style={styles.holdingBadge}>
          <Typography variant="caption" style={styles.holdingBadgeText}>
            {holding.symbol.slice(0, 2)}
          </Typography>
        </View>
        <View style={styles.holdingInfo}>
          <Body style={{ fontFamily: Fonts.semiBold, fontSize: 15 }}>{holding.symbol}</Body>
          <Caption>{holding.quantity} adet · Ort. {formatCurrency(holding.avgCost)}</Caption>
        </View>
      </View>

      <View style={styles.holdingRight}>
        <Typography variant="body" numeric style={{ fontFamily: Fonts.semiBold, fontSize: 15 }}>
          {formatCurrency(holding.currentPrice * holding.quantity)}
        </Typography>
        <Typography variant="caption" numeric style={{ color: plColor, fontFamily: Fonts.medium }}>
          {formatCurrency(pl)} ({formatPercent(plPercent)})
        </Typography>
      </View>

      <View style={styles.holdingActions}>
        <TouchableOpacity style={[styles.actionBtn, styles.buyBtn]} onPress={onBuy}>
          <Ionicons name="add" size={16} color={FinanceTheme.profit} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.sellBtn]} onPress={onSell}>
          <Ionicons name="remove" size={16} color={FinanceTheme.loss} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  loadingContainer: {
    padding: Spacing.xl,
    paddingTop: 60,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  headerSubtitle: {
    marginTop: 4,
    color: FinanceTheme.textMuted,
    fontSize: 13,
  },
  balanceCard: {
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  balanceLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 32,
    marginBottom: Spacing.md,
  },
  plRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  plBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cashRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FinanceTheme.divider,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
    letterSpacing: 1,
  },
  // Holding Row
  holdingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  holdingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  holdingBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  holdingBadgeText: {
    fontFamily: Fonts.bold,
    color: FinanceTheme.primary,
    fontSize: 13,
  },
  holdingInfo: {
    flex: 1,
  },
  holdingRight: {
    alignItems: 'flex-end',
    marginRight: Spacing.md,
  },
  holdingActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    backgroundColor: FinanceTheme.profitBg,
  },
  sellBtn: {
    backgroundColor: FinanceTheme.lossBg,
  },
  // Modal / Bottom Sheet
  modalKeyboardView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: FinanceTheme.overlay,
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: FinanceTheme.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    ...Shadows.bottomSheet,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: FinanceTheme.divider,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    marginBottom: Spacing.sm,
  },
  sheetPrice: {
    color: FinanceTheme.textSecondary,
    marginBottom: Spacing.xl,
  },
  sheetInputGroup: {
    marginBottom: Spacing.lg,
  },
  sheetInputLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sheetInput: {
    backgroundColor: FinanceTheme.inputBg,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: FinanceTheme.inputBorder,
    height: 48,
    paddingHorizontal: Spacing.lg,
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.text,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FinanceTheme.divider,
  },
  sheetButtons: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
});
