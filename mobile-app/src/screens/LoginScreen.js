import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { login } from '../api/authApi';
import { setToken, setUser } from '../utils/secureStorage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  async function handleLogin() {
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email address and password.');
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
        setError('This portal is restricted to Students and Teachers.');
        return;
      }
    } catch (err) {
      const message =
        err.response?.data?.message || 'Unable to authenticate. Please check your credentials.';
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Branding Section */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <LinearGradient
            colors={['#0F172A', colors.primaryDark || '#0F766E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoBadge}
          >
            <Text style={styles.logoLetters}>DC</Text>
          </LinearGradient>

          <Text style={styles.title}>M a r h a b a</Text>
          <Text style={styles.subtitle}>Sign in to access your academic portal</Text>
        </Animated.View>

        {/* Auth Form Container */}
        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.card}>
          {/* Email Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'email' && styles.inputWrapperFocused,
              ]}
            >
              <Feather
                name="mail"
                size={18}
                color={
                  focusedField === 'email'
                    ? colors.primary || '#0D9488'
                    : colors.gray400 || '#9CA3AF'
                }
              />
              <TextInput
                style={styles.input}
                placeholder="name@institution.com"
                placeholderTextColor={colors.gray400 || '#9CA3AF'}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>PASSWORD</Text>
            <View
              style={[
                styles.inputWrapper,
                focusedField === 'password' && styles.inputWrapperFocused,
              ]}
            >
              <Feather
                name="lock"
                size={18}
                color={
                  focusedField === 'password'
                    ? colors.primary || '#0D9488'
                    : colors.gray400 || '#9CA3AF'
                }
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••••••"
                placeholderTextColor={colors.gray400 || '#9CA3AF'}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                secureTextEntry={!showPassword}
              />
              <Pressable
                style={styles.eyeButton}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={8}
              >
                <Feather
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color={colors.gray400 || '#9CA3AF'}
                />
              </Pressable>
            </View>
          </View>

          {/* Error Message */}
          {error ? (
            <Animated.View entering={FadeIn} style={styles.errorBox}>
              <Feather name="alert-circle" size={16} color={colors.error || '#EF4444'} />
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {/* Action Button */}
          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Sign In</Text>
                <Feather name="arrow-right" size={18} color="#FFFFFF" />
              </View>
            )}
          </Pressable>

          {/* Register Nav Footer */}
          <Pressable
            style={styles.registerLink}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerLinkText}>
              Don't have an account?{' '}
              <Text style={styles.registerLinkBold}>Create an account</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  /* Header Branding */
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.primary || '#0D9488',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  logoLetters: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: colors.gray500 || '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },

  /* Card Container */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 12,
    elevation: 2,
    gap: 16,
  },

  /* Inputs Layout */
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray500 || '#6B7280',
    letterSpacing: 0.8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.gray200 || '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: colors.gray50 || '#F9FAFB',
    height: 48,
    gap: 10,
  },
  inputWrapperFocused: {
    borderColor: colors.primary || '#0D9488',
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.gray900 || '#111827',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },

  /* Error Banner */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
  },
  errorText: {
    flex: 1,
    color: colors.error || '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },

  /* Buttons & Footer */
  button: {
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: 4,
  },
  registerLinkText: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
  },
  registerLinkBold: {
    color: colors.primary || '#0D9488',
    fontWeight: '700',
  },
});