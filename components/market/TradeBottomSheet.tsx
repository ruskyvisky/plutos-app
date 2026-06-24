import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Body, Caption, H3, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { executeTrade } from '@/services/api';
import { useCurrency } from '@/contexts/CurrencyContext';

interface TradeBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  symbol: string;
  stockName: string;
  currentPrice: number;
  cashBalance: number;
  side: 'buy' | 'sell';
}

type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

export function TradeBottomSheet({
  visible,
  onClose,
  symbol,
  stockName,
  currentPrice,
  cashBalance,
  side,
}: TradeBottomSheetProps) {
  const { formatPrice } = useCurrency();
  const [quantity, setQuantity] = useState('');
  const [orderType, setOrderType] = useState<OrderType>('market');
  const [customPrice, setCustomPrice] = useState(''); // Limit / Stop price
  const [customRate, setCustomRate] = useState('5'); // Stop limit percent rate
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Reset state on open
  useEffect(() => {
    if (visible) {
      setQuantity('');
      setOrderType('market');
      setCustomPrice(String(currentPrice));
      setCustomRate('5');
      setSuccessMsg(null);
    }
  }, [visible, currentPrice]);

  const qtyInt = parseInt(quantity, 10) || 0;
  const priceVal = orderType === 'limit' ? (parseFloat(customPrice) || 0) : currentPrice;
  const totalCost = qtyInt * priceVal;

  const handleMaxPress = () => {
    if (side === 'buy') {
      const maxQty = Math.floor(cashBalance / priceVal);
      setQuantity(maxQty > 0 ? String(maxQty) : '0');
    } else {
      // In sell, if we don't have the portfolio holdings quantity, we can default to a reasonable value
      setQuantity('10');
    }
  };

  const handleOrderConfirm = async () => {
    if (qtyInt <= 0) {
      Alert.alert('Hata', 'Lütfen geçerli bir adet giriniz.');
      return;
    }

    if (side === 'buy' && totalCost > cashBalance) {
      Alert.alert('Yetersiz Bakiye', 'Alım gücünüz bu işlem için yetersiz.');
      return;
    }

    setLoading(true);
    try {
      // Execute simulated trade
      const res = await executeTrade(symbol, qtyInt, side);
      if (res.success) {
        let msg = '';
        if (orderType === 'market') {
          msg = `Piyasa emriniz başarıyla gerçekleşti! ${qtyInt} adet ${symbol} portföyünüze eklendi.`;
        } else if (orderType === 'limit') {
          msg = `Limit emriniz kaydedildi. ${symbol} fiyatı ₺${parseFloat(customPrice).toFixed(2)} seviyesine ulaştığında otomatik alım gerçekleşecektir.`;
        } else if (orderType === 'stop') {
          msg = `Stop emriniz kaydedildi. ${symbol} fiyatı ₺${parseFloat(customPrice).toFixed(2)} seviyesine yükseldiğinde piyasa fiyatından alım yapılacaktır.`;
        } else {
          msg = `Stop limit emriniz kaydedildi. ${symbol} en düşük fiyatından %${customRate} yükseldiğinde piyasa fiyatından alım yapılacaktır.`;
        }
        
        if (side === 'sell') {
          if (orderType === 'market') {
            msg = `Piyasa emriniz başarıyla gerçekleşti! ${qtyInt} adet ${symbol} başarıyla satıldı.`;
          } else if (orderType === 'limit') {
            msg = `Limit satış emriniz kaydedildi. ${symbol} fiyatı ₺${parseFloat(customPrice).toFixed(2)} seviyesine ulaştığında otomatik satış gerçekleşecektir.`;
          } else if (orderType === 'stop') {
            msg = `Stop satış emriniz kaydedildi. ${symbol} fiyatı ₺${parseFloat(customPrice).toFixed(2)} seviyesine düştüğünde piyasa fiyatından satış yapılacaktır.`;
          } else {
            msg = `Stop limit satış emriniz kaydedildi. ${symbol} en yüksek fiyatından %${customRate} düştüğünde piyasa fiyatından satış yapılacaktır.`;
          }
        }
        setSuccessMsg(msg);
      } else {
        Alert.alert('İşlem Başarısız', res.message);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Hata', 'Bağlantı hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderExplanation = () => {
    const isBuy = side === 'buy';
    if (orderType === 'market') {
      return isBuy
        ? `Market açıldığında piyasa fiyatından ${symbol} al.`
        : `Market açıldığında piyasa fiyatından ${symbol} sat.`;
    }
    if (orderType === 'limit') {
      const p = parseFloat(customPrice) || 0;
      return isBuy
        ? `${symbol} fiyatı ₺${p.toFixed(2)} veya altına düştüğünde limit fiyattan al.`
        : `${symbol} fiyatı ₺${p.toFixed(2)} veya üzerine yükseldiğinde limit fiyattan sat.`;
    }
    if (orderType === 'stop') {
      const p = parseFloat(customPrice) || 0;
      return isBuy
        ? `${symbol} fiyatı ₺${p.toFixed(2)} seviyesine yükselirse piyasa fiyatından al.`
        : `${symbol} fiyatı ₺${p.toFixed(2)} seviyesine düşerse piyasa fiyatından sat.`;
    }
    if (orderType === 'stop_limit') {
      return isBuy
        ? `${symbol} en düşük fiyatından %${customRate} yükselirse piyasa fiyatından al.`
        : `${symbol} en yüksek fiyatından %${customRate} düşerse piyasa fiyatından sat.`;
    }
    return '';
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.sheet}>
                {/* Close handle indicator */}
                <View style={styles.handle} />

                {successMsg ? (
                  // Success State
                  <View style={styles.successContainer}>
                    <View style={styles.successIconWrapper}>
                      <Ionicons name="checkmark-circle" size={56} color={FinanceTheme.profit} />
                    </View>
                    <H3 style={styles.successTitle}>İşlem Başarılı</H3>
                    <Body style={styles.successText}>{successMsg}</Body>
                    <Button
                      title="Kapat"
                      variant="solid"
                      size="lg"
                      style={styles.closeSuccessBtn}
                      onPress={onClose}
                    />
                  </View>
                ) : (
                  // Order Form State
                  <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <View style={styles.sheetHeader}>
                      <H3 style={styles.sheetTitle}>
                        {side === 'buy' ? 'Satın Al' : 'Sat'} · {symbol}
                      </H3>
                      <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                        <Ionicons name="close" size={20} color={FinanceTheme.textMuted} />
                      </TouchableOpacity>
                    </View>

                    {/* Stock Name & Price Info */}
                    <View style={styles.stockInfoRow}>
                      <Caption style={{ color: FinanceTheme.textSecondary }}>{stockName}</Caption>
                      <Body numeric style={{ fontFamily: Fonts.bold }}>
                        Cari Fiyat: {formatPrice(currentPrice, symbol)}
                      </Body>
                    </View>

                    <View style={styles.divider} />

                    {/* Alım Gücü (Purchasing Power) */}
                    <View style={styles.purchasingPowerCard}>
                      <View style={styles.powerRow}>
                        <Ionicons name="wallet-outline" size={16} color={FinanceTheme.primary} />
                        <Body style={styles.powerLabel}>Alım Gücü (Bakiye)</Body>
                      </View>
                      <H3 numeric style={styles.powerValue}>
                        {formatPrice(cashBalance, 'TRY')}
                      </H3>
                    </View>

                    {/* Order Type Segment Control */}
                    <View style={styles.segmentContainer}>
                      {(['market', 'limit', 'stop', 'stop_limit'] as const).map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[styles.segmentBtn, orderType === type && styles.segmentBtnActive]}
                          onPress={() => setOrderType(type)}
                          activeOpacity={0.8}
                        >
                          <Caption
                            style={[
                              styles.segmentText,
                              orderType === type && styles.segmentTextActive,
                            ]}
                          >
                            {type === 'market' ? 'Piyasa' : type === 'limit' ? 'Limit' : type === 'stop' ? 'Stop' : 'Stop-L'}
                          </Caption>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Form Inputs Container */}
                    <View style={styles.formContainer}>
                      {/* Quantity Input */}
                      <View style={styles.inputGroup}>
                        <Caption style={styles.inputLabel}>Miktar (Adet)</Caption>
                        <View style={styles.inputWrapper}>
                          <TextInput
                            style={styles.textInput}
                            placeholder="0"
                            placeholderTextColor={FinanceTheme.textMuted}
                            keyboardType="numeric"
                            value={quantity}
                            onChangeText={setQuantity}
                          />
                          <TouchableOpacity style={styles.maxBtn} onPress={handleMaxPress}>
                            <Caption style={styles.maxBtnText}>MAX</Caption>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Custom Price Input (Limit or Stop Order) */}
                      {(orderType === 'limit' || orderType === 'stop') && (
                        <View style={styles.inputGroup}>
                          <Caption style={styles.inputLabel}>
                            {orderType === 'limit' ? 'Limit Fiyat (TL)' : 'Stop Fiyat (TL)'}
                          </Caption>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.textInput}
                              placeholder="0.00"
                              placeholderTextColor={FinanceTheme.textMuted}
                              keyboardType="numeric"
                              value={customPrice}
                              onChangeText={setCustomPrice}
                            />
                            <Caption style={styles.inputSuffix}>TL</Caption>
                          </View>
                        </View>
                      )}

                      {/* Custom Rate Input (Stop Limit Order) */}
                      {orderType === 'stop_limit' && (
                        <View style={styles.inputGroup}>
                          <Caption style={styles.inputLabel}>
                            {side === 'buy' ? 'Yükseliş Oranı (%)' : 'Düşüş Oranı (%)'}
                          </Caption>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={styles.textInput}
                              placeholder="5"
                              placeholderTextColor={FinanceTheme.textMuted}
                              keyboardType="numeric"
                              value={customRate}
                              onChangeText={setCustomRate}
                            />
                            <Caption style={styles.inputSuffix}>%</Caption>
                          </View>
                        </View>
                      )}
                    </View>

                    {/* Order Explanation Card */}
                    <View style={styles.explanationCard}>
                      <Ionicons
                        name="information-circle-outline"
                        size={14}
                        color={FinanceTheme.primary}
                        style={{ marginRight: 6 }}
                      />
                      <Caption style={styles.explanationText}>{getOrderExplanation()}</Caption>
                    </View>

                    {/* Estimated Total Card */}
                    {qtyInt > 0 && (
                      <View style={styles.totalCard}>
                        <Caption style={{ color: FinanceTheme.textSecondary }}>Tahmini Tutar</Caption>
                        <H3 numeric style={{ color: side === 'buy' ? FinanceTheme.profit : FinanceTheme.loss }}>
                          {formatPrice(totalCost, symbol)}
                        </H3>
                      </View>
                    )}

                    {/* Submit Buttons */}
                    <View style={styles.actionRow}>
                      <Button
                        title={side === 'buy' ? 'Satın Al' : 'Sat'}
                        variant="solid"
                        size="lg"
                        loading={loading}
                        color={side === 'buy' ? FinanceTheme.profit : FinanceTheme.loss}
                        onPress={handleOrderConfirm}
                        style={{ flex: 1 }}
                      />
                    </View>
                  </ScrollView>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: FinanceTheme.card,
    borderTopLeftRadius: Radii.xl,
    borderTopRightRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.xl,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: FinanceTheme.divider,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sheetTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: FinanceTheme.text,
  },
  closeBtn: {
    padding: 4,
  },
  stockInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: FinanceTheme.divider,
    marginBottom: Spacing.md,
  },
  purchasingPowerCard: {
    backgroundColor: FinanceTheme.backgroundLight,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    borderRadius: Radii.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  powerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  powerLabel: {
    color: FinanceTheme.textSecondary,
    fontSize: 13,
  },
  powerValue: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: FinanceTheme.background,
    borderRadius: Radii.md,
    padding: 3,
    gap: 2,
    marginBottom: Spacing.md,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.sm,
  },
  segmentBtnActive: {
    backgroundColor: FinanceTheme.card,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  segmentText: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: FinanceTheme.textMuted,
  },
  segmentTextActive: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.semiBold,
  },
  formContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 11,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textSecondary,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FinanceTheme.backgroundLight,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  textInput: {
    flex: 1,
    color: FinanceTheme.text,
    fontFamily: Fonts.medium,
    fontSize: 16,
    paddingVertical: 0,
  },
  maxBtn: {
    backgroundColor: FinanceTheme.primary + '1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.sm,
    borderWidth: 1,
    borderColor: FinanceTheme.primary + '30',
  },
  maxBtnText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.bold,
    fontSize: 10,
  },
  inputSuffix: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
  },
  explanationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FinanceTheme.backgroundLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  explanationText: {
    color: FinanceTheme.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: FinanceTheme.backgroundLight,
    borderRadius: Radii.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  successIconWrapper: {
    marginBottom: Spacing.md,
  },
  successTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: FinanceTheme.text,
    marginBottom: Spacing.sm,
  },
  successText: {
    color: FinanceTheme.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  closeSuccessBtn: {
    width: '100%',
  },
});
