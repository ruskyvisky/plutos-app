import { FinanceTheme, Fonts } from '@/constants/theme';
import { registerApi } from '@/services/authService';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import * as yup from 'yup';

// ─── Validation Schema ───────────────────────────────────────
const registerSchema = yup.object().shape({
    fullName: yup
        .string()
        .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
        .required('Ad Soyad zorunludur'),
    email: yup
        .string()
        .email('Geçerli bir e-posta adresi girin')
        .required('E-posta adresi zorunludur'),
    password: yup
        .string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre zorunludur'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Şifreler eşleşmiyor')
        .required('Şifre tekrarı zorunludur'),
});

type RegisterFormData = {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
};

// ─── Logo Component ──────────────────────────────────────────
function AppLogo() {
    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoIconWrapper}>
                <View style={styles.secretWhiteBox} />
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.logoText}>Plutos</Text>
            <Text style={styles.welcomeText}>Hesap Oluştur</Text>
        </View>
    );
}

// ─── Input Field Component ───────────────────────────────────
function InputField({
    label,
    icon,
    error,
    rightElement,
    inputProps,
}: {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    error?: string;
    rightElement?: React.ReactNode;
    inputProps: React.ComponentProps<typeof TextInput>;
}) {
    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={[styles.inputWrapper, !!error && styles.inputWrapperError]}>
                <Ionicons
                    name={icon}
                    size={20}
                    color={FinanceTheme.textMuted}
                    style={styles.inputIcon}
                />
                <TextInput
                    style={styles.input}
                    placeholderTextColor={FinanceTheme.inputPlaceholder}
                    {...inputProps}
                />
                {rightElement}
            </View>
            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

// ─── Main Register Screen ─────────────────────────────────────
export default function RegisterScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: yupResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true);
        setApiError(null);
        try {
            await registerApi({
                email: data.email,
                password: data.password,
                full_name: data.fullName,
            });
            setSuccess(true);
            // Kısa bekleme sonrası login'e yönlendir
            setTimeout(() => {
                router.replace('/login');
            }, 1800);
        } catch (error: any) {
            setApiError(error?.message ?? 'Kayıt sırasında bir hata oluştu.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[FinanceTheme.background, FinanceTheme.backgroundLight, FinanceTheme.background]}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Geri Butonu */}
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={22} color={FinanceTheme.text} />
                    </TouchableOpacity>

                    {/* Logo */}
                    <AppLogo />

                    {/* Register Card */}
                    <View style={styles.card}>

                        {/* Başarı Mesajı */}
                        {success && (
                            <View style={styles.successBox}>
                                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                                <Text style={styles.successText}>
                                    Hesabın oluşturuldu! Giriş sayfasına yönlendiriliyorsun...
                                </Text>
                            </View>
                        )}

                        {/* API Hatası */}
                        {apiError && (
                            <View style={styles.apiErrorBox}>
                                <Ionicons name="alert-circle-outline" size={16} color={FinanceTheme.loss} />
                                <Text style={styles.apiErrorText}>{apiError}</Text>
                            </View>
                        )}

                        {/* Ad Soyad */}
                        <Controller
                            control={control}
                            name="fullName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Ad Soyad"
                                    icon="person-outline"
                                    error={errors.fullName?.message}
                                    inputProps={{
                                        placeholder: 'Adınız Soyadınız',
                                        value,
                                        onChangeText: onChange,
                                        onBlur,
                                        autoCapitalize: 'words',
                                    }}
                                />
                            )}
                        />

                        {/* E-posta */}
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="E-posta"
                                    icon="mail-outline"
                                    error={errors.email?.message}
                                    inputProps={{
                                        placeholder: 'ornek@email.com',
                                        value,
                                        onChangeText: onChange,
                                        onBlur,
                                        keyboardType: 'email-address',
                                        autoCapitalize: 'none',
                                        autoCorrect: false,
                                    }}
                                />
                            )}
                        />

                        {/* Şifre */}
                        <Controller
                            control={control}
                            name="password"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Şifre"
                                    icon="lock-closed-outline"
                                    error={errors.password?.message}
                                    rightElement={
                                        <TouchableOpacity
                                            onPress={() => setShowPassword(!showPassword)}
                                            style={styles.eyeButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons
                                                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={FinanceTheme.textMuted}
                                            />
                                        </TouchableOpacity>
                                    }
                                    inputProps={{
                                        placeholder: '••••••••',
                                        value,
                                        onChangeText: onChange,
                                        onBlur,
                                        secureTextEntry: !showPassword,
                                    }}
                                />
                            )}
                        />

                        {/* Şifre Tekrar */}
                        <Controller
                            control={control}
                            name="confirmPassword"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <InputField
                                    label="Şifre Tekrar"
                                    icon="shield-checkmark-outline"
                                    error={errors.confirmPassword?.message}
                                    rightElement={
                                        <TouchableOpacity
                                            onPress={() => setShowConfirm(!showConfirm)}
                                            style={styles.eyeButton}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons
                                                name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                                                size={22}
                                                color={FinanceTheme.textMuted}
                                            />
                                        </TouchableOpacity>
                                    }
                                    inputProps={{
                                        placeholder: '••••••••',
                                        value,
                                        onChangeText: onChange,
                                        onBlur,
                                        secureTextEntry: !showConfirm,
                                    }}
                                />
                            )}
                        />

                        {/* Kayıt Ol Butonu */}
                        <TouchableOpacity
                            style={[styles.registerButton, (isLoading || success) && styles.registerButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.85}
                            disabled={isLoading || success}
                        >
                            <LinearGradient
                                colors={[FinanceTheme.primary, FinanceTheme.primaryDark]}
                                style={styles.registerButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.registerButtonText}>Kayıt Ol</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* Zaten hesabın var mı? */}
                    <View style={styles.bottomLinks}>
                        <TouchableOpacity
                            style={styles.loginRow}
                            activeOpacity={0.7}
                            onPress={() => router.replace('/login')}
                        >
                            <Text style={styles.loginText}>Zaten hesabın var mı? </Text>
                            <Text style={styles.loginHighlight}>Giriş Yap</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    gradient: { flex: 1 },
    keyboardView: { flex: 1 },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },

    // Back Button
    backButton: {
        position: 'absolute',
        top: 48,
        left: 20,
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: FinanceTheme.card,
        borderWidth: 1,
        borderColor: FinanceTheme.cardBorder,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 60,
    },
    logoIconWrapper: {
        marginBottom: 12,
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
    },
    secretWhiteBox: {
        position: 'absolute',
        width: 40,
        height: 40,
        backgroundColor: '#FFFFFF',
    },
    logoImage: {
        width: 70,
        height: 70,
        borderRadius: 14,
    },
    logoText: {
        fontSize: 22,
        color: FinanceTheme.text,
        letterSpacing: 0.5,
        fontFamily: Fonts.bold,
    },
    welcomeText: {
        fontSize: 14,
        color: FinanceTheme.textSecondary,
        marginTop: 4,
        letterSpacing: 0.3,
        fontFamily: Fonts.regular,
    },

    // Card
    card: {
        backgroundColor: FinanceTheme.card,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: FinanceTheme.cardBorder,
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },

    // Success Box
    successBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.25)',
        padding: 10,
        marginBottom: 14,
        gap: 8,
    },
    successText: {
        color: '#22c55e',
        fontSize: 13,
        fontFamily: Fonts.regular,
        flex: 1,
    },

    // API Error Box
    apiErrorBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.25)',
        padding: 10,
        marginBottom: 14,
        gap: 8,
    },
    apiErrorText: {
        color: FinanceTheme.loss,
        fontSize: 13,
        fontFamily: Fonts.regular,
        flex: 1,
    },

    // Input
    inputGroup: { marginBottom: 14 },
    inputLabel: {
        fontSize: 13,
        color: FinanceTheme.textSecondary,
        marginBottom: 6,
        letterSpacing: 0.3,
        textTransform: 'uppercase',
        fontFamily: Fonts.semiBold,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: FinanceTheme.inputBg,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: FinanceTheme.inputBorder,
        paddingHorizontal: 14,
        height: 48,
    },
    inputWrapperError: {
        borderColor: FinanceTheme.loss,
    },
    inputIcon: { marginRight: 10 },
    input: {
        flex: 1,
        fontSize: 15,
        color: FinanceTheme.text,
        height: '100%',
    },
    eyeButton: { padding: 4 },
    errorText: {
        color: FinanceTheme.loss,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontFamily: Fonts.regular,
    },

    // Register Button
    registerButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginTop: 4,
    },
    registerButtonDisabled: { opacity: 0.7 },
    registerButtonGradient: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    registerButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        letterSpacing: 0.5,
        fontFamily: Fonts.bold,
    },

    // Bottom links
    bottomLinks: {
        alignItems: 'center',
        marginTop: 20,
    },
    loginRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    loginText: {
        color: FinanceTheme.textSecondary,
        fontSize: 14,
        fontFamily: Fonts.regular,
    },
    loginHighlight: {
        color: FinanceTheme.primary,
        fontSize: 14,
        fontFamily: Fonts.bold,
    },
});
