import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { FinanceTheme, Radii, Shadows, Spacing } from '@/constants/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...rest
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variantMap[variant],
        paddingMap[padding],
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.card,
  },
  // Variants
  default: {
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    ...Shadows.cardLight,
  },
  elevated: {
    borderWidth: 0,
    ...Shadows.card,
  },
  outlined: {
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    backgroundColor: 'transparent',
  },
  // Padding
  paddingNone: {
    padding: 0,
  },
  paddingSm: {
    padding: Spacing.md,
  },
  paddingMd: {
    padding: Spacing.lg,
  },
  paddingLg: {
    padding: Spacing.xl,
  },
});

const variantMap = {
  default: styles.default,
  elevated: styles.elevated,
  outlined: styles.outlined,
};

const paddingMap = {
  none: styles.paddingNone,
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
};
