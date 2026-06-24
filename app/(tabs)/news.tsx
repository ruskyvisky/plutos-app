import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Card } from '@/components/ui/Card';
import { DataSourceFooter } from '@/components/ui/DataSourceFooter';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import { Body, Caption, H2, H3 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Spacing } from '@/constants/theme';
import type { NewsItem } from '@/services/api';
import { fetchNews } from '@/services/api';

type NewsCategory = 'all' | 'kap' | 'analiz' | 'piyasa' | 'gundem';

const CATEGORIES: { key: NewsCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'Tümü', icon: 'grid-outline' },
  { key: 'kap', label: 'KAP', icon: 'document-text-outline' },
  { key: 'analiz', label: 'Analiz', icon: 'analytics-outline' },
  { key: 'piyasa', label: 'Piyasa', icon: 'bar-chart-outline' },
  { key: 'gundem', label: 'Gündem', icon: 'globe-outline' },
];

export default function NewsScreen() {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');

  const loadNews = useCallback(async (category: NewsCategory) => {
    setLoading(true);
    const data = await fetchNews(category === 'all' ? undefined : category);
    setNews(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNews(activeCategory);
  }, [activeCategory, loadNews]);

  const handleCategoryChange = (cat: NewsCategory) => {
    setActiveCategory(cat);
  };

  const formatDate = (dateStr: string): string | null => {
    if (!dateStr || dateStr.trim() === '') return null;
    const date = new Date(dateStr);
    // Geçersiz tarih kontrolü
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 0) return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
  };


  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'kap': return '#FF9F43';
      case 'analiz': return '#54A0FF';
      case 'piyasa': return FinanceTheme.profit;
      case 'gundem': return '#A29BFE';
      default: return FinanceTheme.textMuted;
    }
  };

  const renderItem = ({ item }: { item: NewsItem }) => (
    <TouchableOpacity activeOpacity={0.8}>
      <Card variant="default" padding="md" style={styles.newsCard}>
        {/* Category & Date */}
        <View style={styles.newsHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + '20' }]}>
            <Caption style={[styles.categoryText, { color: getCategoryColor(item.category) }]}>
              {item.category.toUpperCase()}
            </Caption>
          </View>
          {formatDate(item.date) && (
            <Caption>{formatDate(item.date)}</Caption>
          )}
        </View>

        {/* Title */}
        <H3 style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </H3>

        {/* Summary */}
        <Body style={styles.newsSummary} numberOfLines={3}>
          {item.summary}
        </Body>

        {/* Footer */}
        <View style={styles.newsFooter}>
          <Caption>{item.source}</Caption>
          {item.symbol && (
            <View style={styles.symbolTag}>
              <Caption style={styles.symbolTagText}>
                {item.symbol}
              </Caption>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <H2>Haberler</H2>
      </View>

      {/* Category Tabs — sabit yükseklikte ScrollView */}
      <View style={styles.categoryWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryTab,
                activeCategory === cat.key && styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryChange(cat.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={
                  activeCategory === cat.key ? '#FFFFFF' : FinanceTheme.textSecondary
                }
                style={{ marginRight: 4 }}
              />
              <Caption
                style={[
                  styles.categoryTabText,
                  activeCategory === cat.key && styles.categoryTabTextActive,
                ]}
              >
                {cat.label}
              </Caption>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* News List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={<DataSourceFooter source="Borsa İstanbul & KAP" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Body style={styles.emptyText}>Bu kategoride haber bulunamadı.</Body>
            </View>
          }
        />
      )}
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
  categoryWrapper: {
    height: 40,
    marginBottom: Spacing.md,
  },
  categoryList: {
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FinanceTheme.surface,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    height: 34,
  },
  categoryTabActive: {
    backgroundColor: FinanceTheme.primary,
    borderColor: FinanceTheme.primary,
  },
  categoryTabText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: FinanceTheme.textSecondary,
    lineHeight: 16,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  newsList: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 16,
  },
  newsCard: {
    marginBottom: 4,
  },
  newsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 0.5,
  },
  newsTitle: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 6,
  },
  newsSummary: {
    fontSize: 13,
    lineHeight: 19,
    color: FinanceTheme.textSecondary,
    marginBottom: Spacing.md,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FinanceTheme.divider,
  },
  symbolTag: {
    backgroundColor: FinanceTheme.surface,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  symbolTagText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: FinanceTheme.primary,
  },
  emptyContainer: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    color: FinanceTheme.textMuted,
  },
});
