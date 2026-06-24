/**
 * Plutos — Listeler Bileşeni (Piyasa ekranı)
 * Kullanıcının listelerini ve "En Popüler" sistem listesini gösterir.
 */
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Body, Caption, H3 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import {
  createList,
  deleteList,
  getLists,
  type StockList,
} from '@/services/listsService';

interface ListsWidgetProps {
  refreshTrigger?: number;
}

const LIST_ICONS = ['📋', '⭐', '🔥', '💡', '🚀', '💎', '📊', '🏦'];

export function ListsWidget({ refreshTrigger }: ListsWidgetProps) {
  const router = useRouter();
  const [lists, setLists] = useState<StockList[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📋');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadLists = useCallback(async () => {
    const data = await getLists();
    setLists(data);
    setLoading(false);
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists, refreshTrigger]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createList(newName.trim(), selectedIcon);
    setNewName('');
    setSelectedIcon('📋');
    setShowModal(false);
    loadLists();
  };

  const handleDelete = (list: StockList) => {
    if (list.isSystem) return;
    Alert.alert('Listeyi Sil', `"${list.name}" listesini silmek istiyor musunuz?`, [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteList(list.id);
          loadLists();
        },
      },
    ]);
  };

  const handleListPress = (list: StockList) => {
    router.push(`/list/${list.id}` as any);
  };

  if (loading) {
    return (
      <View style={styles.skeleton}>
        {[1, 2].map(i => (
          <View key={i} style={styles.skeletonItem} />
        ))}
      </View>
    );
  }

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      {/* Liste Öğeleri */}
      {lists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={24} color={FinanceTheme.textMuted} />
          <Caption style={styles.emptyText}>
            Henüz listeniz yok. Aşağıdan yeni bir liste oluşturun.
          </Caption>
        </View>
      ) : (
        <View style={styles.listContainer}>
          {lists.map(list => (
            <View
              key={list.id}
              style={styles.listItem}
            >
              {/* Sol: İkon + İsim (Tıklanabilir Alan) */}
              <TouchableOpacity
                style={styles.listLeft}
                onPress={() => handleListPress(list)}
                activeOpacity={0.7}
              >
                <View style={styles.listIconWrap}>
                  <Caption style={styles.listIcon}>{list.icon ?? '📋'}</Caption>
                </View>
                <View style={{ flex: 1 }}>
                  <Body style={styles.listName}>{list.name}</Body>
                  <Caption style={styles.listCount}>
                    {list.symbols.length} enstrüman
                    {list.isSystem && (
                      <Caption style={styles.systemBadge}> · Otomatik</Caption>
                    )}
                  </Caption>
                </View>
              </TouchableOpacity>

              {/* Sağ: Ok veya Silme Butonu */}
              {list.isSystem ? (
                <TouchableOpacity
                  style={styles.rightAction}
                  onPress={() => handleListPress(list)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={16} color={FinanceTheme.textMuted} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.deleteBtnContainer}
                  onPress={() => handleDelete(list)}
                  activeOpacity={0.6}
                >
                  <Ionicons name="trash-outline" size={18} color={FinanceTheme.loss} />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Yeni Liste Oluştur */}
      <TouchableOpacity
        style={styles.createBtn}
        onPress={() => setShowModal(true)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle-outline" size={18} color={FinanceTheme.primary} />
        <Body style={styles.createText}>Yeni Liste Oluştur</Body>
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <H3 style={styles.modalTitle}>Yeni Liste</H3>

            {/* İkon seçimi */}
            <View style={styles.iconRow}>
              {LIST_ICONS.map(icon => (
                <TouchableOpacity
                  key={icon}
                  style={[styles.iconOption, selectedIcon === icon && styles.iconOptionActive]}
                  onPress={() => setSelectedIcon(icon)}
                >
                  <Caption style={styles.iconOptionText}>{icon}</Caption>
                </TouchableOpacity>
              ))}
            </View>

            {/* İsim */}
            <TextInput
              style={styles.modalInput}
              placeholder="Liste adı..."
              placeholderTextColor={FinanceTheme.inputPlaceholder}
              value={newName}
              onChangeText={setNewName}
              maxLength={30}
              autoFocus
            />

            {/* Butonlar */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Body style={styles.cancelText}>İptal</Body>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !newName.trim() && styles.confirmBtnDisabled]}
                onPress={handleCreate}
                disabled={!newName.trim()}
              >
                <Body style={styles.confirmText}>Oluştur</Body>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  skeletonItem: {
    height: 58,
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.card,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    gap: 8,
    paddingBottom: 4,
  },
  emptyText: {
    color: FinanceTheme.textMuted,
    flex: 1,
    lineHeight: 17,
  },
  listContainer: {
    marginHorizontal: Spacing.xl,
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
    justifyContent: 'space-between',
  },
  deleteBtnContainer: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAction: {
    padding: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  listIconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radii.md,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listIcon: {
    fontSize: 18,
  },
  listName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
  },
  listCount: {
    color: FinanceTheme.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  systemBadge: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.xl,
    marginTop: 10,
    paddingVertical: Spacing.sm,
  },
  createText: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: FinanceTheme.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: Spacing.xl,
  },
  modalTitle: {
    fontFamily: Fonts.bold,
    fontSize: 18,
    marginBottom: Spacing.md,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: Radii.md,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  iconOptionActive: {
    borderColor: FinanceTheme.primary,
    backgroundColor: FinanceTheme.primary + '20',
  },
  iconOptionText: {
    fontSize: 20,
  },
  modalInput: {
    backgroundColor: FinanceTheme.inputBg,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: FinanceTheme.inputBorder,
    color: FinanceTheme.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
  },
  cancelText: {
    color: FinanceTheme.textSecondary,
    fontFamily: Fonts.medium,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: Radii.lg,
    backgroundColor: FinanceTheme.primary,
    alignItems: 'center',
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    color: '#0F172A',
    fontFamily: Fonts.semiBold,
  },
});
