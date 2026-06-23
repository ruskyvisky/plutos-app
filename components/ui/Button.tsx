import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';

import { FinanceTheme, Fonts, FontSizes, Radii, Spacing } from '@/constants/theme';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  color?: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  title,
  variant = 'solid',
  size = 'md',
  color = FinanceTheme.primary,
  loading = false,
  icon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isSolid = variant === 'solid';
  const isOutline = variant === 'outline';

  const bgColor = isSolid ? color : 'transparent';
  const textColor = isSolid ? '#FFFFFF' : color;
  const borderColor = isOutline ? color : 'transparent';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.base,
        sizeStyles[size],
        {
          backgroundColor: bgColor,
          borderColor: borderColor,
          borderWidth: isOutline ? 1.5 : 0,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={textColor} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              sizeTextStyles[size],
              { color: textColor, marginLeft: icon ? Spacing.sm : 0 },
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  text: {
    fontFamily: Fonts.semiBold,
    letterSpacing: 0.3,
  },
});

const sizeStyles = StyleSheet.create({
  sm: {
    height: 36,
    paddingHorizontal: Spacing.md,
  },
  md: {
    height: 44,
    paddingHorizontal: Spacing.lg,
  },
  lg: {
    height: 52,
    paddingHorizontal: Spacing.xl,
  },
});

const sizeTextStyles = StyleSheet.create({
  sm: { fontSize: FontSizes.caption },
  md: { fontSize: FontSizes.bodySmall },
  lg: { fontSize: FontSizes.body },
});
