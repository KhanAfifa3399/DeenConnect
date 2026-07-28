import { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView,
    Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { login } from '../api/authApi';
import { setToken, setUser } from '../utils/secureStorage';
import { Feather } from '@expo/vector-icons';

function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin() {
        setError('');

        if (!email.trim() || !password.trim()) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email.trim(), password);
            await setToken(result.data.token);
            await setUser(result.data.user);

            const role = result.data.user.role;
            if (role === 'teacher') {
                navigation.replace('TeacherApp');
            } else if (role === 'student') {
                navigation.replace('StudentApp');
            } else {
                setError('This app is for Students and Teachers only. Please use the Admin Panel.');
                return;
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong. Please try again.';
            setError(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                    <View style={styles.logoBadge}>
                        <Text style={styles.logoLetters}>DC</Text>
                    </View>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue learning</Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.duration(500).delay(150)} style={styles.form}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={colors.gray400}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        autoCorrect={false}
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordWrapper}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="••••••••"
                            placeholderTextColor={colors.gray400}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <Pressable style={styles.eyeButton} onPress={() => setShowPassword((prev) => !prev)}>
                            <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.gray500} />
                        </Pressable>
                    </View>

                    {error ? (
                        <Animated.Text entering={FadeIn} style={styles.errorText}>
                            {error}
                        </Animated.Text>
                    ) : null}

                    <Pressable
                        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
        backgroundColor: colors.white,
    },
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.space8,
        paddingVertical: spacing.space10,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.space10,
    },
    logoBadge: {
        width: 64,
        height: 64,
        borderRadius: spacing.radiusFull,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.space4,
    },
    logoLetters: {
        color: colors.white,
        fontSize: typography.fontSizeLg,
        fontWeight: typography.weightBold,
    },
    title: {
        fontSize: typography.fontSize2xl,
        fontWeight: typography.weightBold,
        color: colors.primaryDark,
    },
    subtitle: {
        fontSize: typography.fontSizeSm,
        color: colors.gray500,
        marginTop: spacing.space1,
    },
    form: {
        gap: spacing.space2,
    },
    label: {
        fontSize: typography.fontSizeSm,
        fontWeight: typography.weightMedium,
        color: colors.gray700,
        marginTop: spacing.space3,
    },
    input: {
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderRadius: spacing.radiusMd,
        paddingHorizontal: spacing.space4,
        paddingVertical: spacing.space3,
        fontSize: typography.fontSizeBase,
        color: colors.gray900,
    },
    errorText: {
        color: colors.error,
        fontSize: typography.fontSizeSm,
        marginTop: spacing.space2,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: spacing.radiusFull,
        paddingVertical: spacing.space4,
        alignItems: 'center',
        marginTop: spacing.space6,
    },
    buttonPressed: {
        backgroundColor: colors.primaryLight,
    },
    buttonText: {
        color: colors.white,
        fontSize: typography.fontSizeBase,
        fontWeight: typography.weightSemibold,
    },
    passwordWrapper: {
        position: 'relative',
        justifyContent: 'center',
    },
    passwordInput: {
        borderWidth: 1.5,
        borderColor: colors.gray200,
        borderRadius: spacing.radiusMd,
        paddingHorizontal: spacing.space4,
        paddingRight: spacing.space10,
        paddingVertical: spacing.space3,
        fontSize: typography.fontSizeBase,
        color: colors.gray900,
    },
    eyeButton: {
        position: 'absolute',
        right: spacing.space3,
        padding: spacing.space2,
    },
});

export default LoginScreen;