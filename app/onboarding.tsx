import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { Body, Caption, H1, H2, H3, Typography } from '@/components/ui/Typography';
import { FinanceTheme, Fonts, Radii, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { saveOnboardingApi } from '@/services/authService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const QUESTIONS = [
  {
    id: 1,
    title: 'Yatırım yaparken senin için en önemli şey hangisidir?',
    subtitle: 'Vade ve Güven Algısı',
    options: [
      {
        key: 'A',
        text: '"Parayı yatırayım, arkama yaslanayım. Yıllarca dokunmam, şirketin büyümesini izlerim."',
        desc: 'Vade: Çok Uzun',
        value: 0,
      },
      {
        key: 'B',
        text: '"Günlük hayatımda gördüğüm, ürünlerini kullandığım, güvendiğim popüler şirketlere ortak olmak isterim."',
        desc: 'Vade: Orta-Uzun',
        value: 1,
      },
      {
        key: 'C',
        text: '"Geleceği değiştirecek yenilikçi teknolojilere, yapay zekâya veya uzay şirketlerine yatırım yapıp hızla büyümek isterim."',
        desc: 'Vade: Değişken/Agresif',
        value: 2,
      },
    ],
  },
  {
    id: 2,
    title: 'Seçtiğin bir hisse senedi ertesi gün %20 düşse ne hissedersin / ne yaparsın?',
    subtitle: 'Risk Toleransı ve Dijital Dürtme',
    options: [
      {
        key: 'A',
        text: '"Hiç panik yapmam. Şirketin temeli sağlamsa, ucuz fiyattan daha fazla hisse almak için harika bir fırsattır."',
        desc: 'Düşük Kayıp Kaygısı / Rasyonel',
        value: 0,
      },
      {
        key: 'B',
        text: '"Biraz canım sıkılır ama beklerim. Şirketin mağazaları hâlâ dolup taşıyorsa elbet toparlanacaktır."',
        desc: 'Gözleme Dayalı / Dengeli',
        value: 1,
      },
      {
        key: 'C',
        text: '"Çok strese girerim. Zararımı erkenden kesip parayı hemen daha hızlı yükselebilecek başka bir teknolojiye taşımayı düşünürüm."',
        desc: 'Hızlı Aksiyon / Agresif',
        value: 2,
      },
    ],
  },
  {
    id: 3,
    title: 'Bir şirketi seçerken en çok neye dikkat edersin?',
    subtitle: 'Analiz ve Strateji Tarzı',
    options: [
      {
        key: 'A',
        text: '"Şirketin kasasındaki nakit paraya, borçsuz olmasına ve yıllardır düzenli temettü (kâr payı) dağıtıp dağıtmadığına."',
        desc: 'Değer Yatırımı',
        value: 0,
      },
      {
        key: 'B',
        text: '"Şirketin ürettiği ürünün piyasada kapış kapış satılmasına ve etrafımdaki insanların bu markayı ne kadar çok övdüğüne."',
        desc: 'Büyüme/Hikaye Yatırımı',
        value: 1,
      },
      {
        key: 'C',
        text: '"Şirketin ne kadar inovatif olduğuna, ezber bozan teknolojiler üretip üretmediğine ve gelecekte dünyayı değiştirip değiştiremeyeceğine."',
        desc: 'Yıkıcı İnovasyon',
        value: 2,
      },
    ],
  },
  {
    id: 4,
    title: 'Plutos\'taki sanal portföyünde nasıl bir cüzdan oluşturmak istersin?',
    subtitle: 'Portföy Çeşitlendirmesi',
    options: [
      {
        key: 'A',
        text: '"Az sayıda ama Türkiye\'nin/dünyanın en köklü, batması imkansız dev holdinglerinden oluşan garantici bir portföy."',
        desc: 'Odaklanmış / Defansif',
        value: 0,
      },
      {
        key: 'B',
        text: '"Hepsinden azar azar olsun; perakende, giyim, gıda gibi farklı sektörlerden 10-15 tanıdık şirkete dağılmış dengeli bir portföy."',
        desc: 'Geniş Çeşitlendirme',
        value: 1,
      },
      {
        key: 'C',
        text: '"Sadece teknoloji, yenilenebilir enerji, yapay zekâ odaklı, yüksek riskli ama devasa büyüme potansiyeli olan dinamik bir portföy."',
        desc: 'Sektörel / Büyüme',
        value: 2,
      },
    ],
  },
];

const PROFILES = {
  BUFFETT: {
    title: 'Sen bir Warren Buffett\'sın!',
    subtitle: 'Değer Yatırımcısı (Value Investor)',
    description: 'Sen tam bir sabır küpüsün. Kısa vadeli piyasa dalgalanmaları seni korkutmuyor. Tıpkı Buffett gibi, "Hisseyi 10 yıl tutmayacaksanız, 10 dakika bile tutmayın" mantığıyla hareket ediyorsun. Borçsuz, güçlü ve temettü veren köklü şirketler senin kalen.',
    color: '#10B981',
    icon: 'leaf-outline',
  },
  LYNCH: {
    title: 'Sen bir Peter Lynch\'sin!',
    subtitle: 'Halkın Yatırımcısı (Growth at Reasonable Price)',
    description: '"Bildiğin şeye yatırım yap!" felsefesini benimsiyorsun. Karmaşık rasyolar yerine, sokakta, alışveriş merkezinde gördüğün, büyüyen ve herkesin ürününü severek tükettiği şirketleri bulmakta üstüne yok. Portföyünü farklı sektörlerle çeşitlendirmeyi seviyorsun.',
    color: '#38BDF8',
    icon: 'people-outline',
  },
  WOOD: {
    title: 'Sen bir Cathie Wood\'sun!',
    subtitle: 'Yıkıcı İnovasyon Avcısı (Disruptive Innovation)',
    description: 'Gözün hep gelecekte! Geleneksel şirketler sana sıkıcı geliyor; sen yapay zekâ, otonom araçlar ve DNA teknolojileri gibi dünyayı yerinden oynatacak riskli ama dev büyüme potansiyeli olan alanları seçiyorsun. Volatilite (dalgalanma) senin yakıtın.',
    color: '#EF4444',
    icon: 'rocket-outline',
  },
};

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0); // 0-3: Questions, 4: Result
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSelectOption = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = value;
    setAnswers(newAnswers);

    // Otomatik sonraki soruya geç
    if (currentStep < 3) {
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
      }, 300);
    } else {
      setCurrentStep(4);
    }
  };

  const getMatchedProfileKey = () => {
    const counts = [0, 0, 0];
    answers.forEach((ans) => {
      if (ans >= 0 && ans <= 2) {
        counts[ans]++;
      }
    });
    const maxVal = Math.max(...counts);
    const idx = counts.indexOf(maxVal);
    const profileKeys: ('BUFFETT' | 'LYNCH' | 'WOOD')[] = ['BUFFETT', 'LYNCH', 'WOOD'];
    return profileKeys[idx] || 'LYNCH';
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await saveOnboardingApi(answers);
      router.replace('/(tabs)');
    } catch (e) {
      console.error('Failed to save onboarding:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const matchedProfileKey = currentStep === 4 ? getMatchedProfileKey() : 'LYNCH';
  const matchedProfile = PROFILES[matchedProfileKey];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[FinanceTheme.background, FinanceTheme.backgroundLight, FinanceTheme.background]}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {/* Step Indicator */}
        {currentStep < 4 && (
          <View style={styles.progressContainer}>
            <TouchableOpacity onPress={handleBack} disabled={currentStep === 0} style={styles.backBtn}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={currentStep === 0 ? 'transparent' : FinanceTheme.textSecondary}
              />
            </TouchableOpacity>
            <View style={styles.progressBarWrapper}>
              {[0, 1, 2, 3].map((idx) => (
                <View
                  key={idx}
                  style={[
                    styles.progressDot,
                    idx === currentStep && styles.progressDotActive,
                    idx < currentStep && styles.progressDotCompleted,
                  ]}
                />
              ))}
            </View>
            <Caption style={{ color: FinanceTheme.textMuted }}>{currentStep + 1} / 4</Caption>
          </View>
        )}

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {currentStep < 4 ? (
            // Question view
            <View style={styles.questionCard}>
              <Caption style={styles.questionSubtitle}>{QUESTIONS[currentStep].subtitle}</Caption>
              <H2 style={styles.questionTitle}>{QUESTIONS[currentStep].title}</H2>

              <View style={styles.optionsList}>
                {QUESTIONS[currentStep].options.map((opt) => {
                  const isSelected = answers[currentStep] === opt.value;
                  return (
                    <TouchableOpacity
                      key={opt.key}
                      style={[styles.optionCard, isSelected && styles.optionCardActive]}
                      onPress={() => handleSelectOption(opt.value)}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.optionIndicator,
                          isSelected && {
                            backgroundColor: FinanceTheme.primary,
                            borderColor: FinanceTheme.primary,
                          },
                        ]}
                      >
                        <Body
                          style={[
                            styles.optionIndicatorText,
                            isSelected && { color: FinanceTheme.background },
                          ]}
                        >
                          {opt.key}
                        </Body>
                      </View>
                      <View style={styles.optionTextBlock}>
                        <Body style={styles.optionText}>{opt.text}</Body>
                        <Caption style={styles.optionDesc}>{opt.desc}</Caption>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ) : (
            // Result View
            <View style={styles.resultCard}>
              <View style={styles.celebrationRing}>
                <View style={[styles.celebrationInner, { borderColor: matchedProfile.color }]}>
                  <Ionicons name={matchedProfile.icon as any} size={48} color={matchedProfile.color} />
                </View>
              </View>

              <Caption style={styles.resultBadge}>YATIRIMCI KİMLİĞİN</Caption>
              <H1 style={styles.resultTitle}>{matchedProfile.title}</H1>
              <H3 style={[styles.resultSubtitle, { color: matchedProfile.color }]}>
                {matchedProfile.subtitle}
              </H3>

              <View style={styles.descCard}>
                <Body style={styles.resultDesc}>{matchedProfile.description}</Body>
              </View>

              <View style={styles.oscNotice}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={16}
                  color={FinanceTheme.textMuted}
                  style={{ marginRight: 6 }}
                />
                <Caption style={styles.oscText}>
                  Ontario Menkul Kıymetler Komisyonu (OSC) standartlarına uygun portföy eşleştirme.
                </Caption>
              </View>

              <Button
                title="Plutos'a Başla"
                variant="solid"
                size="lg"
                loading={loading}
                style={[styles.startBtn, { backgroundColor: matchedProfile.color }]}
                onPress={handleFinish}
              />
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: FinanceTheme.background,
  },
  gradient: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'ios' ? 10 : Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: FinanceTheme.divider,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarWrapper: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  progressDot: {
    height: 4,
    flex: 1,
    maxWidth: 40,
    borderRadius: 2,
    backgroundColor: FinanceTheme.surface,
  },
  progressDotActive: {
    backgroundColor: FinanceTheme.primary,
  },
  progressDotCompleted: {
    backgroundColor: FinanceTheme.primary + '80',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  questionCard: {
    flex: 1,
    justifyContent: 'center',
  },
  questionSubtitle: {
    color: FinanceTheme.primary,
    fontFamily: Fonts.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  questionTitle: {
    fontFamily: Fonts.bold,
    fontSize: 22,
    lineHeight: 30,
    color: FinanceTheme.text,
    marginBottom: Spacing.xl,
  },
  optionsList: {
    gap: Spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionCardActive: {
    borderColor: FinanceTheme.primary,
    backgroundColor: FinanceTheme.backgroundLight,
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FinanceTheme.surface,
  },
  optionIndicatorText: {
    fontFamily: Fonts.bold,
    fontSize: 14,
    color: FinanceTheme.textSecondary,
  },
  optionTextBlock: {
    flex: 1,
  },
  optionText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: FinanceTheme.text,
    lineHeight: 20,
  },
  optionDesc: {
    color: FinanceTheme.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  resultCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
  },
  celebrationRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FinanceTheme.card,
    marginBottom: Spacing.lg,
  },
  celebrationInner: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FinanceTheme.backgroundLight,
  },
  resultBadge: {
    fontFamily: Fonts.semiBold,
    color: FinanceTheme.textMuted,
    letterSpacing: 2,
    marginBottom: 8,
  },
  resultTitle: {
    fontFamily: Fonts.bold,
    fontSize: 26,
    textAlign: 'center',
    color: FinanceTheme.text,
    marginBottom: 4,
  },
  resultSubtitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  descCard: {
    backgroundColor: FinanceTheme.card,
    borderRadius: Radii.xl,
    borderWidth: 1,
    borderColor: FinanceTheme.cardBorder,
    padding: Spacing.lg,
    width: '100%',
    marginBottom: Spacing.xl,
  },
  resultDesc: {
    color: FinanceTheme.textSecondary,
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
  },
  oscNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
  },
  oscText: {
    color: FinanceTheme.textMuted,
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  startBtn: {
    width: '100%',
  },
});
