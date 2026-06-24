import React from 'react';
import { View } from 'react-native';
import { Body, H2 } from '@/components/ui/Typography';
import { FinanceTheme } from '@/constants/theme';

export default function CompareScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: FinanceTheme.background, justifyContent: 'center', alignItems: 'center' }}>
      <H2>Karşılaştır</H2>
      <Body>Çok Yakında!</Body>
    </View>
  );
}
