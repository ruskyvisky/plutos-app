import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { FinanceTheme, FontSizes, Fonts } from '@/constants/theme';

type TypographyVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TypographyProps extends TextProps {
  variant?: TypographyVariant;
  color?: string;
  numeric?: boolean;  // tabular-nums için
  center?: boolean;
}

export function Typography({
  variant = 'body',
  color,
  numeric = false,
  center = false,
  style,
  children,
  ...rest
}: TypographyProps) {
  const variantStyle = variantStyles[variant];

  const dynamicStyle: TextStyle = {
    ...(color ? { color } : {}),
    ...(numeric ? { fontVariant: ['tabular-nums'] } : {}),
    ...(center ? { textAlign: 'center' } : {}),
  };

  return (
    <Text style={[variantStyle, dynamicStyle, style]} {...rest}>
      {children}
    </Text>
  );
}

// Shorthand bileşenler
export function H1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h1" numeric {...props} />;
}

export function H2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h2" {...props} />;
}

export function H3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="h3" {...props} />;
}

export function Body(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="body" {...props} />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="caption" {...props} />;
}

export function Label(props: Omit<TypographyProps, 'variant'>) {
  return <Typography variant="label" {...props} />;
}

const variantStyles = StyleSheet.create({
  h1: {
    fontSize: FontSizes.h1,
    lineHeight: FontSizes.h1 * 1.2,
    fontFamily: Fonts.bold,
    color: FinanceTheme.text,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
  h2: {
    fontSize: FontSizes.h2,
    lineHeight: FontSizes.h2 * 1.3,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.text,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FontSizes.h3,
    lineHeight: FontSizes.h3 * 1.3,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.text,
  },
  body: {
    fontSize: FontSizes.body,
    lineHeight: FontSizes.body * 1.5,
    fontFamily: Fonts.regular,
    color: FinanceTheme.text,
  },
  bodySmall: {
    fontSize: FontSizes.bodySmall,
    lineHeight: FontSizes.bodySmall * 1.5,
    fontFamily: Fonts.regular,
    color: FinanceTheme.textSecondary,
  },
  caption: {
    fontSize: FontSizes.caption,
    lineHeight: FontSizes.caption * 1.4,
    fontFamily: Fonts.regular,
    color: FinanceTheme.textMuted,
  },
  label: {
    fontSize: FontSizes.caption,
    lineHeight: FontSizes.caption * 1.4,
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
