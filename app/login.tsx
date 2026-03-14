import GoogleIcon from '@/components/icons/GoogleIcon';
import { FinanceTheme, Fonts } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Dimensions,
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
const loginSchema = yup.object().shape({
    email: yup
        .string()
        .email('Geçerli bir e-posta adresi girin')
        .required('E-posta adresi zorunludur'),
    password: yup
        .string()
        .min(6, 'Şifre en az 6 karakter olmalıdır')
        .required('Şifre zorunludur'),
});

type LoginFormData = {
    email: string;
    password: string;
};

const { width } = Dimensions.get('window');

// ─── Logo Component ──────────────────────────────────────────
function AppLogo() {
    return (
        <View style={styles.logoContainer}>
            <View style={styles.logoIconWrapper}>
                {/* Sadece senin bildiğin gizli beyaz kutu */}
                <View style={styles.secretWhiteBox} />
                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>
            <Text style={styles.logoText}>Plutos</Text>
            <Text style={styles.welcomeText}>Öğren , Kazan , Büyü</Text>
        </View>
    );
}

// ─── Social Button ───────────────────────────────────────────
function SocialButton({
    icon,
    label,
    bgColor,
    textColor,
    iconColor,
    onPress,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
    onPress: () => void;
}) {
    return (
        <TouchableOpacity
            style={[styles.socialButton, { backgroundColor: bgColor }]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Ionicons name={icon} size={20} color={iconColor} style={styles.socialIcon} />
            <Text style={[styles.socialButtonText, { color: textColor }]}>{label}</Text>
        </TouchableOpacity>
    );
}

// ─── Main Login Screen ───────────────────────────────────────
export default function LoginScreen() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: yupResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            // TODO: Gerçek auth API çağrısı burada yapılacak
            console.log('Login attempt:', data.email);
            await new Promise((resolve) => setTimeout(resolve, 1500));
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Login failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestMode = () => {
        router.replace('/(tabs)');
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
                    {/* Logo & Welcome */}
                    <AppLogo />

                    {/* Login Card */}
                    <View style={styles.card}>
                        {/* Email Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>E-posta</Text>
                            <Controller
                                control={control}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            errors.email && styles.inputWrapperError,
                                        ]}
                                    >
                                        <Ionicons
                                            name="mail-outline"
                                            size={20}
                                            color={FinanceTheme.textMuted}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="ornek@email.com"
                                            placeholderTextColor={FinanceTheme.inputPlaceholder}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
                                    </View>
                                )}
                            />
                            {errors.email && (
                                <Text style={styles.errorText}>{errors.email.message}</Text>
                            )}
                        </View>

                        {/* Password Input */}
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>Şifre</Text>
                            <Controller
                                control={control}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View
                                        style={[
                                            styles.inputWrapper,
                                            errors.password && styles.inputWrapperError,
                                        ]}
                                    >
                                        <Ionicons
                                            name="lock-closed-outline"
                                            size={20}
                                            color={FinanceTheme.textMuted}
                                            style={styles.inputIcon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="••••••••"
                                            placeholderTextColor={FinanceTheme.inputPlaceholder}
                                            secureTextEntry={!showPassword}
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                        />
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
                                    </View>
                                )}
                            />
                            {errors.password && (
                                <Text style={styles.errorText}>{errors.password.message}</Text>
                            )}
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity style={styles.forgotPasswordButton} activeOpacity={0.7}>
                            <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
                            onPress={handleSubmit(onSubmit)}
                            activeOpacity={0.85}
                            disabled={isLoading}
                        >
                            <LinearGradient
                                colors={[FinanceTheme.primary, FinanceTheme.primaryDark]}
                                style={styles.loginButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.loginButtonText}>Giriş Yap</Text>
                                )}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>veya</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social Login */}
                        <TouchableOpacity
                            style={[styles.socialButton, { backgroundColor: FinanceTheme.googleBg }]}
                            onPress={() => { }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.socialIcon}>
                                <GoogleIcon size={20} />
                            </View>
                            <Text style={[styles.socialButtonText, { color: FinanceTheme.googleText }]}>Google ile Giriş Yap</Text>
                        </TouchableOpacity>
                        <SocialButton
                            icon="logo-apple"
                            label="Apple ile Giriş Yap"
                            bgColor={FinanceTheme.appleBg}
                            textColor={FinanceTheme.appleText}
                            iconColor="#FFFFFF"
                            onPress={() => { }}
                        />
                    </View>

                    {/* Bottom Links */}
                    <View style={styles.bottomLinks}>
                        <TouchableOpacity style={styles.registerRow} activeOpacity={0.7}>
                            <Text style={styles.registerText}>Henüz hesabın yok mu? </Text>
                            <Text style={styles.registerHighlight}>Kayıt Ol</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.guestButton}
                            onPress={handleGuestMode}
                            activeOpacity={0.7}
                        >
                            <Ionicons
                                name="glasses-outline"
                                size={18}
                                color={FinanceTheme.textSecondary}
                                style={{ marginRight: 6 }}
                            />
                            <Text style={styles.guestText}>Misafir olarak devam et</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },

    // Logo
    logoContainer: {
        alignItems: 'center',
        marginBottom: 24,
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
        width: 80,
        height: 80,
        borderRadius: 16,
    },
    logoText: {
        fontSize: 24,
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

    // Input
    inputGroup: {
        marginBottom: 14,
    },
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
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: FinanceTheme.text,
        height: '100%',
    },
    eyeButton: {
        padding: 4,
    },
    errorText: {
        color: FinanceTheme.loss,
        fontSize: 12,
        marginTop: 6,
        marginLeft: 4,
        fontFamily: Fonts.regular,
    },

    // Forgot password
    forgotPasswordButton: {
        alignSelf: 'flex-end',
        marginBottom: 16,
        marginTop: -4,
    },
    forgotPasswordText: {
        color: FinanceTheme.primary,
        fontSize: 13,
        fontFamily: Fonts.medium,
    },

    // Login button
    loginButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 16,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonGradient: {
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
    loginButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        letterSpacing: 0.5,
        fontFamily: Fonts.bold,
    },

    // Divider
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: FinanceTheme.cardBorder,
    },
    dividerText: {
        color: FinanceTheme.textMuted,
        fontSize: 13,
        marginHorizontal: 14,
    },

    // Social buttons
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: FinanceTheme.cardBorder,
    },
    socialIcon: {
        marginRight: 10,
    },
    socialButtonText: {
        fontSize: 14,
        fontFamily: Fonts.semiBold,
    },

    // Bottom links
    bottomLinks: {
        alignItems: 'center',
        marginTop: 20,
    },
    registerRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    registerText: {
        color: FinanceTheme.textSecondary,
        fontSize: 14,
        fontFamily: Fonts.regular,
    },
    registerHighlight: {
        color: FinanceTheme.primary,
        fontSize: 14,
        fontFamily: Fonts.bold,
    },
    guestButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: FinanceTheme.cardBorder,
    },
    guestText: {
        color: FinanceTheme.textSecondary,
        fontSize: 13,
        fontFamily: Fonts.medium,
    },
});
