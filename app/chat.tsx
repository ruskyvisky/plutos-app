import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
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
  text: 'Merhaba! Ben Plutos Kıdemli Analiz Asistanı. Yapay zeka tabanlı finansal modelleme, rasyo analizi ve makroekonomik taramalar için hazırım. 📈\n\nSize nasıl yardımcı olabilirim?',
  ts: Date.now(),
};

const SUGGESTIONS = [
  'THYAO ne durumda?',
  'F/K oranı nedir?',
  'Temettü emekliliği mantıklı mı?',
];

export default function ChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Ekranda anlık görünecek düşünce yazısı
  const [currentThought, setCurrentThought] = useState<string | null>(null);

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
    const query = text.trim();

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: query, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    startDotAnimation();

    const lower = query.toLowerCase();
    let thoughts: string[] = [];

    // Detaylı inceleme için adımları 7-8 aşamaya çıkardık (Toplam ~35 saniye sürecek)
    if (lower.includes('thyao')) {
      thoughts = [
        'Küresel havacılık sektörü makro verileri ve IATA raporları taranıyor...',
        'THYAO güncel bilanço verileri ve gelir tablosu yükleniyor...',
        'Akıllı Yatırımcı kitabındaki "Güvenlik Marjı" (Margin of Safety) formülü uygulanıyor...',
        'F/K, PD/DD ve FD/FAVÖK tarihsel çarpanları küresel rakiplerle kıyaslanıyor...',
        'Jet yakıtı (Brent petrol) maliyet eğrileri ve nakit akış tablosu simüle ediliyor...',
        'Teknik analiz algoritması çalıştırılıyor; hareketli ortalamalar ve RSI seviyeleri taranıyor...',
        'Risk/ödül rasyosu hesaplanıyor ve derinlemesine stratejik özet oluşturuluyor...'
      ];
    } else if (lower.includes('f/k') || lower.includes('fiyat kazanç')) {
      thoughts = [
        'Temel analiz rasyo kütüphanesi ve Benjamin Graham doktrinleri taranıyor...',
        'Borsa İstanbul genelindeki sektörlerin güncel F/K ortalamaları çekiliyor...',
        'Yüksek ve düşük F/K korelasyonlarının tarihsel getiri analizleri inceleniyor...',
        'Tek seferlik kârların (gayrimenkul satışı vb.) rasyoyu yanıltma payı hesaplanıyor...',
        'Büyüme şirketleri (PEG Rasyosu) ile değer şirketleri arasındaki çarpan farkları ayrıştırılıyor...',
        'Yatırımcı eğitimi için sadeleştirilmiş ve derinlikli anlatım modeli hazırlanıyor...'
      ];
    } else if (lower.includes('temettü') || lower.includes('emekli')) {
      thoughts = [
        'Bileşik getirinin (Compound Interest) matematiksel modellemesi başlatılıyor...',
        'BIST Temettü 25 endeksindeki şirketlerin son 10 yıllık nakit temettü dağıtma oranları inceleniyor...',
        'Kartopu etkisinin (Snowball Effect) 5, 10 ve 20 yıllık projeksiyonları hesaplanıyor...',
        'Enflasyon karşısında net temettü verimliliğinin korunma gücü ölçülüyor...',
        'Şirketlerin borçluluk oranları ve serbest nakit akışı (FCF) sürdürülebilirliği taranıyor...',
        'Stratejik temettü yatırımcılığı risk matrisi ve kuralları raporlanıyor...'
      ];
    } else {
      thoughts = [
        'Finansal veri tabanında ilgili anahtar kelimeler taranıyor...',
        'Makroekonomik göstergeler ve merkez bankası faiz kararları analiz ediliyor...',
        'Benjamin Graham ve Warren Buffett yatırım felsefelerine göre filtreleme yapılıyor...',
        'Uygun rasyolar ve teknik indikatörler korele ediliyor...',
        'Kullanıcı için en optimize finansal yanıt derleniyor...'
      ];
    }

    // Her bir adımı 5 saniye boyunca ekranda tutarak toplam süreyi ~30-40 saniyeye yayıyoruz
    for (const thought of thoughts) {
      setCurrentThought(thought);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
      await new Promise(r => setTimeout(r, 5000));
    }

    // Analiz bittiğinde kutuyu kapatıp cevabı basıyoruz
    setCurrentThought(null);

    const botMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      text: getDetailedReply(query),
      ts: Date.now(),
    };

    setIsTyping(false);
    setMessages(prev => [...prev, botMsg]);
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  };

  function getDetailedReply(q: string): string {
    const lower = q.toLowerCase();

    if (lower.includes('thyao')) {
      return `✈️ **THYAO (Türk Hava Yolları) Kapsamlı Temel ve Stratejik Analiz Raporu**\n\n**1. Küresel Makro ve Sektörel Görünüm**\nIATA verilerine göre küresel yolcu trafiği güçlü seyrini korurken, transit yolcu pazarında daralma yaşanmamıştır. THYAO, geniş uçuş ağı ve İstanbul Havalimanı'nın jeopolitik avantajını kullanarak küresel pazar payını artırmaya devam ediyor. Cargo operasyonları ise küresel tedarik zinciri dinamikleriyle stabil bir gelir kapısı oluşturuyor.\n\n**2. Temel Analiz & Çarpan Değerlemesi (Akıllı Yatırımcı Yaklaşımı)**\nBenjamin Graham'ın "Güvenlik Marjı" ilkesine göre incelendiğinde; THYAO'nun F/K ve FD/FAVÖK çarpanları, Lufthansa, Delta ve Air France gibi küresel bayrak taşıyıcı rakiplerine kıyasla yaklaşık %35-40 oranında iskontolu işlem görmektedir. Şirketin özsermaye kârlılığı güçlü yapısını korurken, döviz bazlı gelir yapısı kur risklerine karşı doğal bir hedge mekanizması sağlamaktadır.\n\n**3. Teknik Görünüm ve Trend Analizi**\nHisse, majör yükselen kanal içerisindeki konsolidasyon sürecini sürdürüyor. 200 günlük üssel hareketli ortalamanın (EMA) üzerinde tutunması, kurumsal fonların uzun vadeli toplama (akümülasyon) bölgesinde olduğunu gösteriyor. RSI indikatörü aşırı satım bölgesinden dengeli bölgeye geçiş sinyali üretmektedir.\n\n**4. Riskler ve Katalizörler**\n• **Riskler:** Jeopolitik gerilimler, jet yakıtı (petrol) maliyetlerindeki ani yükselişler ve küresel resesyon beklentileri.\n• **Katalizörler:** Filo genişleme stratejisinin planlanandan hızlı ilerlemesi, yeni dış hat rotalarının açılması ve çarpan iskontosunun yabancı kurumsal yatırımcılar tarafından fark edilmesi.\n\n*Not: Bu analiz veri simülasyonu olup, yatırım tavsiyesi niteliği taşımamaktadır.*`;
    }

    if (lower.includes('f/k') || lower.includes('fiyat kazanç')) {
      return `📊 **F/K (Fiyat/Kazanç) Rasyosu: İleri Düzey Finansal Analiz Rehberi**\n\n**1. Matematiksel Tanım ve Mantık**\nF/K oranı, bir şirketin toplam piyasa değerinin, yıllık net kârına bölünmesiyle (veya hisse fiyatının hisse başına kâra bölünmesiyle) bulunur. Temel değerleme teorisinde bu rasyo, şirketin mevcut kârlılığını hiç artırmadığı varsayımı altında, yaptığınız yatırımın kendisini kaç yılda amorti edeceğini söyler.\n\n**2. Benjamin Graham ve Değer Yatırımcılığı Gözüyle**\nDeğer yatırımcılığının babası Graham, sanayi şirketlerinde tek başına yüksek F/K oranlarının risk barındırdığını savunur. Ancak burada kritik bir tuzak vardır: **"Geçici Kârlılık Tuzağı"**. Eğer bir şirket gayrimenkul satışı gibi tek seferlik (sürdürülemez) bir gelir elde ettiyse, o yıl kârı çok yüksek görünür ve F/K yanıltıcı şekilde düşük çıkar. Yatırımcı her zaman "Esas Faaliyet Kârı" üzerinden düzeltilmiş F/K'yı incelemelidir.\n\n**3. Sektörel Matris ve Kullanım Kuralları**\n• **Sektörel Kıyaslama:** Bir teknoloji şirketinin F/K'sının 25 olması normal karşılanırken, geleneksel bir çimento şirketinin 25 F/K olması aşırı pahalı olduğuna işaret edebilir. Analiz daima sektör ortalaması ile yapılmalıdır.\n• **Yüksek F/K Her Zaman Kötü müdür?:** Hayır. Eğer şirket her yıl %80 büyüyorsa, yatırımcılar gelecekteki devasa kârları şimdiden satın almak için yüksek F/K ödemeye razı olurlar (Bkz: PEG Rasyosu).\n• **Düşük F/K Her Zaman Ucuz mudur?:** Hayır. Pazarda geleceği karanlık görülen, pazar payını kaybeden "değer tuzakları" da sürekli düşük F/K ile fiyatlanır.`;
    }

    if (lower.includes('temettü') || lower.includes('emekli')) {
      return `💰 **Temettü Emekliliği ve Kartopu Getiri Projeksiyonu**\n\n**1. Bileşik Getirinin Gücü ve Matematiksel Model**\nAlbert Einstein'ın "Dünyanın sekizinci harikası" olarak tanımladığı bileşik faiz ilkesi, temettü yatırımcılığının temel direğidir. Temettü emekliliği, şirketin dağıttığı nakit kâr paylarının cebe atılması değil, **kesintisiz olarak yeniden aynı hisseye yatırılarak** lot sayısının geometrik olarak artırılması sürecidir.\n\n**2. Sürdürülebilirlik Kriterleri (Serbest Nakit Akışı Analizi)**\nBir şirketin sadece yüksek temettü verimine (Dividend Yield) sahip olması onu iyi bir temettü hissesi yapmaz. Yatırımcının bakması gereken en önemli rasyo **Temettü Dağıtma Oranı (Payout Ratio)** ve **Serbest Nakit Akışıdır (Free Cash Flow)**. Eğer bir şirket kârından fazlasını temettü olarak dağıtıyorsa veya borçlanarak temettü veriyorsa, bu yapı sürdürülemez ve gelecekte şirketin küçülmesine yol açar.\n\n**3. Stratejik Yol Haritası**\n• **Erken Evre:** Alınan her kuruş temettü ile lot sayısı büyütülür. Hisse fiyat düşüşleri, daha ucuza daha çok lot almak için fırsat kabul edilir.\n• **Geç Evre (Emeklilik):** Lot adeti finansal özgürlüğü sağlayacak boyuta ulaştığında, gelen nakit akışı yaşam maliyetlerini karşılamak üzere nakit olarak kullanılmaya başlanır.\n• **Hisse Seçimi:** Sektöründe lider, nakit yaratma gücü yüksek, borçsuz ve düzenli büyüyen (kârını her yıl enflasyon üzerinde artıran) temettü aristokratları seçilmelidir.`;
    }

    return `İlgili finansal rasyo veya hisse kodu üzerinde derin analiz modellemesi başlatılabilir. Lütfen incelemek istediğiniz başlığı detaylandırın. 🤖`;
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
            <H2 style={styles.headerTitle}>Plutos Analiz Asistanı</H2>
            <Caption style={styles.headerSub}>Finansal AI • Çevrimiçi</Caption>
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
              <View style={styles.footerContainer}>
                {/* Her biri 5 saniye boyunca ekranda okunaklı kalacak olan Düşünce Kutusu */}
                {currentThought && (
                  <View style={styles.thoughtBox}>
                    <Ionicons name="analytics" size={14} color={FinanceTheme.primary} style={{ marginRight: 8 }} />
                    <Caption style={styles.thoughtText}>{currentThought}</Caption>
                  </View>
                )}

                {/* Yazıyor Baloncuğu */}
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
            placeholder="Analiz etmek için hisse veya rasyo girin..."
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
    maxWidth: '85%',
    borderRadius: Radii.xl,
    padding: 14,
    paddingHorizontal: 16,
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
    fontSize: 14,
    lineHeight: 22,
    color: FinanceTheme.text,
  },
  bubbleTextUser: {
    color: '#0F172A',
  },
  bubbleTime: {
    fontSize: 10,
    marginTop: 6,
    color: FinanceTheme.textMuted,
    alignSelf: 'flex-end',
  },
  bubbleTimeUser: {
    color: 'rgba(15,23,42,0.6)',
  },
  footerContainer: {
    gap: 10,
    marginTop: 4,
  },
  // Genişletilmiş, daha dolgun ve okunaklı Yeni Düşünce Kutusu Tasarımı
  thoughtBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FinanceTheme.surface,
    borderWidth: 1,
    borderColor: FinanceTheme.primary + '30', // Hafif prim rengi vurgusu
    borderRadius: Radii.lg,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '85%',
    alignSelf: 'flex-start',
    marginLeft: 36,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  thoughtText: {
    color: FinanceTheme.textSecondary,
    fontFamily: Fonts.medium,
    fontSize: 12.5,
    lineHeight: 17,
    flex: 1, // Uzun cümlelerin taşmaması için
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderBottomLeftRadius: 4,
    padding: 12,
    paddingHorizontal: 16,
    gap: 5,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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