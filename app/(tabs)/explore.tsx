import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { Body, Caption, H2, H3 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { getUser, getMeApi, logout, type AuthUser } from '@/services/authService';

const MENU_ITEMS = [
  { icon: 'person-outline', label: 'Hesap Bilgileri', sub: 'Ad, e-posta, şifre' },
  { icon: 'notifications-outline', label: 'Bildirimler', sub: 'Fiyat alarmları ve haberler' },
  { icon: 'shield-checkmark-outline', label: 'Güvenlik', sub: '2FA ve oturum yönetimi' },
  { icon: 'color-palette-outline', label: 'Görünüm', sub: 'Tema ve dil seçenekleri' },
  { icon: 'help-circle-outline', label: 'Yardım & Destek', sub: 'SSS ve iletişim' },
  { icon: 'information-circle-outline', label: 'Hakkında', sub: 'Plutos v1.0' },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await getUser();
      setUser(u);
      const remote = await getMeApi();
      if (remote) {
        setUser(remote);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <H2>Profil</H2>
        </View>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={48} color={FinanceTheme.primary} />
            </View>
          </View>
          <H3 style={styles.userName}>{user?.full_name || 'Kullanıcı'}</H3>
          <Caption style={styles.userEmail}>{user?.email || 'kullanici@ornek.com'}</Caption>

          {user?.investor_profile && (
            <View style={styles.profileBadgeContainer}>
              <View style={[
                styles.profileBadge,
                {
                  backgroundColor: 
                    user.investor_profile === 'BUFFETT' ? 'rgba(16,185,129,0.15)' :
                    user.investor_profile === 'LYNCH' ? 'rgba(56,189,248,0.15)' :
                    'rgba(239,68,68,0.15)',
                  borderColor:
                    user.investor_profile === 'BUFFETT' ? '#10B981' :
                    user.investor_profile === 'LYNCH' ? '#38BDF8' :
                    '#EF4444',
                }
              ]}>
                <Ionicons 
                  name={
                    user.investor_profile === 'BUFFETT' ? 'leaf-outline' :
                    user.investor_profile === 'LYNCH' ? 'people-outline' :
                    'rocket-outline'
                  } 
                  size={13} 
                  color={
                    user.investor_profile === 'BUFFETT' ? '#10B981' :
                    user.investor_profile === 'LYNCH' ? '#38BDF8' :
                    '#EF4444'
                  } 
                />
                <Caption style={[
                  styles.profileBadgeText,
                  {
                    color: 
                      user.investor_profile === 'BUFFETT' ? '#10B981' :
                      user.investor_profile === 'LYNCH' ? '#38BDF8' :
                      '#EF4444',
                  }
                ]}>
                  {
                    user.investor_profile === 'BUFFETT' ? 'Warren Buffett (Değer Yatırımcısı)' :
                    user.investor_profile === 'LYNCH' ? 'Peter Lynch (Halkın Yatırımcısı)' :
                    'Cathie Wood (İnovasyon Avcısı)'
                  }
                </Caption>
              </View>
              <TouchableOpacity 
                style={styles.retakeBtn} 
                onPress={() => router.push('/onboarding')}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={12} color={FinanceTheme.primary} />
                <Caption style={styles.retakeText}>Yeniden Test Et</Caption>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* İstatistik kartları */}
        <View style={styles.statsRow}>
          {[
            { label: 'Favori', value: '–', icon: 'star-outline' },
            { label: 'Liste', value: '–', icon: 'list-outline' },
            { label: 'İşlem', value: '–', icon: 'swap-horizontal-outline' },
          ].map((stat) => (
            <Card key={stat.label} variant="default" padding="sm" style={styles.statCard}>
              <Ionicons name={stat.icon as any} size={18} color={FinanceTheme.primary} />
              <H3 style={styles.statValue}>{stat.value}</H3>
              <Caption>{stat.label}</Caption>
            </Card>
          ))}
        </View>

        {/* Menü */}
        <View style={styles.menuSection}>
          {MENU_ITEMS.map((item, idx) => (
            <TouchableOpacity key={item.label} style={styles.menuItem} activeOpacity={0.7}>
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon as any} size={20} color={FinanceTheme.primary} />
              </View>
              <View style={styles.menuText}>
                <Body style={styles.menuLabel}>{item.label}</Body>
                <Caption style={styles.menuSub}>{item.sub}</Caption>
              </View>
              <Ionicons name="chevron-forward" size={16} color={FinanceTheme.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Çıkış */}
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.7}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={18} color={FinanceTheme.loss} />
          <Body style={styles.logoutText}>Çıkış Yap</Body>
        </TouchableOpacity>

        <Caption style={styles.version}>Plutos v1.0 · © 2025</Caption>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: FinanceTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginBottom: 4,
  },
  userEmail: {
    color: FinanceTheme.textSecondary,
    marginBottom: 12,
  },
  editBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FinanceTheme.surface,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  editText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: Fonts.bold,
    fontSize: 18,
  },
  menuSection: {
    marginHorizontal: Spacing.xl,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radii.md,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: Fonts.medium,
    fontSize: 15,
  },
  menuSub: {
    color: FinanceTheme.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.2)',
    marginBottom: Spacing.lg,
  },
  logoutText: {
    color: FinanceTheme.loss,
    fontFamily: Fonts.semiBold,
  },
  version: {
    textAlign: 'center',
    color: FinanceTheme.textMuted,
    paddingBottom: Spacing.xl,
  },
  profileBadgeContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  profileBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: FinanceTheme.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.full,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  retakeText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
    fontSize: 11,
  },
});
