import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
} from 'react-native';

import { Body, Caption, H2 } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  ts: number;
}

const WELCOME: Message = {
  id: 'welcome',
  role: 'assistant',
  text: 'Merhaba! Ben Plutos Asistanı. Size piyasalar, hisseler veya yatırım hakkında yardımcı olabilirim. 📈',
  ts: Date.now(),
};

const SUGGESTIONS = [
  'THYAO ne durumda?',
  'En çok yükselen hisseler?',
  'Portföy diversifikasyonu nedir?',
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const dotAnim = useRef(new Animated.Value(0)).current;

  const startDotAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(dotAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: text.trim(), ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    startDotAnimation();

    // Basit cevap simülasyonu (gerçek AI entegrasyonu için değiştirin)
    await new Promise(r => setTimeout(r, 1200));
    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: getSimpleReply(text.trim()),
      ts: Date.now(),
    };
    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  function getSimpleReply(q: string): string {
    const lower = q.toLowerCase();
    if (lower.includes('thyao')) return 'THYAO (Türk Hava Yolları) güncel fiyat bilgisi için Keşfet sekmesinden arayabilirsiniz. 🛫';
    if (lower.includes('yüksel') || lower.includes('kazan')) return 'Günün en çok yükselenleri için Piyasa sekmesindeki "Yükselenler" listesine bakabilirsiniz. 📈';
    if (lower.includes('portföy') || lower.includes('diversi')) return 'Portföy çeşitlendirmesi, farklı sektör ve enstrümanlara yatırım yaparak riski dağıtmak anlamına gelir. Birden fazla hisse, tahvil ve döviz tutmak iyi bir başlangıçtır.';
    return 'Bu konuda size yardımcı olmaya çalışıyorum. Daha spesifik bir soru sorabilirsiniz. 🤖';
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <View style={styles.botAvatar}>
            <Ionicons name="sparkles" size={14} color={FinanceTheme.primary} />
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Body style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>{item.text}</Body>
          <Caption style={[styles.bubbleTime, isUser && styles.bubbleTimeUser]}>
            {formatTime(item.ts)}
          </Caption>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={FinanceTheme.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <View style={styles.headerAvatar}>
            <Ionicons name="sparkles" size={16} color={FinanceTheme.primary} />
          </View>
          <View>
            <H2 style={styles.headerTitle}>Plutos Asistanı</H2>
            <Caption style={styles.headerSub}>Yapay Zeka • Çevrimiçi</Caption>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Mesajlar */}
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.botAvatar}>
                  <Ionicons name="sparkles" size={14} color={FinanceTheme.primary} />
                </View>
                <View style={styles.typingBubble}>
                  <Animated.View style={[styles.typingDot, { opacity: dotAnim }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dotAnim }]} />
                  <Animated.View style={[styles.typingDot, { opacity: dotAnim }]} />
                </View>
              </View>
            ) : null
          }
        />

        {/* Öneri Chips */}
        {messages.length <= 1 && (
          <View style={styles.suggestionsRow}>
            {SUGGESTIONS.map(s => (
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => sendMessage(s)} activeOpacity={0.7}>
                <Caption style={styles.suggestionText}>{s}</Caption>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Bir şey sorun..."
            placeholderTextColor={FinanceTheme.inputPlaceholder}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(inputText)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isTyping}
            activeOpacity={0.8}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: FinanceTheme.background },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: FinanceTheme.divider,
    gap: Spacing.sm,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: FinanceTheme.surface,
    borderWidth: 1,
    borderColor: FinanceTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontFamily: Fonts.semiBold },
  headerSub: { color: FinanceTheme.profit, fontSize: 11, marginTop: 1 },
  msgList: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: 12,
  },
  msgRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  msgRowUser: {
    flexDirection: 'row-reverse',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FinanceTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: FinanceTheme.primary + '60',
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: Radii.xl,
    padding: 12,
    paddingHorizontal: 14,
  },
  bubbleBot: {
    backgroundColor: FinanceTheme.card,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: FinanceTheme.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
    color: FinanceTheme.text,
  },
  bubbleTextUser: {
    color: '#0F172A',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 4,
    color: FinanceTheme.textMuted,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(15,23,42,0.6)',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderBottomLeftRadius: 4,
    padding: 14,
    gap: 5,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: FinanceTheme.primary,
  },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    gap: 8,
    marginBottom: 8,
  },
  suggestionChip: {
    backgroundColor: FinanceTheme.surface,
    borderRadius: Radii.full,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  suggestionText: {
    color: FinanceTheme.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: FinanceTheme.divider,
  },
  input: {
    flex: 1,
    backgroundColor: FinanceTheme.inputBg,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.inputBorder,
    color: FinanceTheme.text,
    fontFamily: Fonts.regular,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FinanceTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
