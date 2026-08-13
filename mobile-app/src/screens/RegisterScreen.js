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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { registerStudent, registerTeacher } from '../api/authApi';
import { setToken, setUser } from '../utils/secureStorage';

export default function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  async function handleRegister() {
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your full name, email address, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (role === 'student') {
        const result = await registerStudent(
          fullName.trim(),
          email.trim(),
          password,
          phone.trim()
        );
        await setToken(result.data.token);
        await setUser(result.data.user);
        navigation.replace('StudentApp');
      } else {
        await registerTeacher(
          fullName.trim(),
          email.trim(),
          password,
          phone.trim()
        );
        Alert.alert(
          'Application Submitted',
          'Your educator account has been submitted for administrative review. You will receive access once approved.',
          [{ text: 'Return to Login', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Registration failed. Please verify your details.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Navigation & Header */}
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              hitSlop={8}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={colors.gray800 || '#1F2937'}
              />
            </Pressable>

            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join DeenConnect to access academic programs
              </Text>
            </View>
          </Animated.View>

          {/* Card Container */}
          <Animated.View
            entering={FadeInDown.duration(400).delay(100)}
            style={styles.card}
          >
            {/* Segmented Role Selector */}
            <View style={styles.roleToggle}>
              <Pressable
                style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
                onPress={() => setRole('student')}
              >
                <Feather
                  name="user"
                  size={14}
                  color={
                    role === 'student' ? '#FFFFFF' : colors.gray500 || '#6B7280'
                  }
                />
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'student' && styles.roleBtnTextActive,
                  ]}
                >
                  Student
                </Text>
              </Pressable>
              <Pressable
                style={[styles.roleBtn, role === 'teacher' && styles.roleBtnActive]}
                onPress={() => setRole('teacher')}
              >
                <Feather
                  name="award"
                  size={14}
                  color={
                    role === 'teacher' ? '#FFFFFF' : colors.gray500 || '#6B7280'
                  }
                />
                <Text
                  style={[
                    styles.roleBtnText,
                    role === 'teacher' && styles.roleBtnTextActive,
                  ]}
                >
                  Teacher
                </Text>
              </Pressable>
            </View>

            {role === 'teacher' && (
              <Animated.View entering={FadeIn} style={styles.noticeBox}>
                <Feather
                  name="info"
                  size={15}
                  color={colors.primary || '#0D9488'}

                />
                <Text style={styles.noticeText}>
                  Teacher registrations require administrative verification before
                  account activation.
                </Text>
              </Animated.View>
            )}

            {/* Form Fields */}
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>FULL NAME</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'fullName' && styles.inputWrapperFocused,
                  ]}
                >
                  <Feather
                    name="user"
                    size={18}
                    color={
                      focusedField === 'fullName'
                        ? colors.primary || '#0D9488'
                        : colors.gray400 || '#9CA3AF'
                    }
                  />
                  <TextInput
                    style={styles.input}
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="e.g. Dr. Muhammad Abdullah"
                    placeholderTextColor={colors.gray400 || '#9CA3AF'}
                    onFocus={() => setFocusedField('fullName')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Email Address */}
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
                    value={email}
                    onChangeText={setEmail}
                    placeholder="name@institution.com"
                    placeholderTextColor={colors.gray400 || '#9CA3AF'}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>PHONE NUMBER (OPTIONAL)</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'phone' && styles.inputWrapperFocused,
                  ]}
                >
                  <Feather
                    name="phone"
                    size={18}
                    color={
                      focusedField === 'phone'
                        ? colors.primary || '#0D9488'
                        : colors.gray400 || '#9CA3AF'
                    }
                  />
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={colors.gray400 || '#9CA3AF'}
                    keyboardType="phone-pad"
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Password */}
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
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Min. 8 characters"
                    placeholderTextColor={colors.gray400 || '#9CA3AF'}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((v) => !v)}
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

              {/* Confirm Password */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>CONFIRM PASSWORD</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    focusedField === 'confirmPassword' && styles.inputWrapperFocused,
                  ]}
                >
                  <Feather
                    name="check-circle"
                    size={18}
                    color={
                      focusedField === 'confirmPassword'
                        ? colors.primary || '#0D9488'
                        : colors.gray400 || '#9CA3AF'
                    }
                  />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter your password"
                    placeholderTextColor={colors.gray400 || '#9CA3AF'}
                    secureTextEntry={!showPassword}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <Animated.View entering={FadeIn} style={styles.errorBox}>
                  <Feather
                    name="alert-circle"
                    size={16}
                    color={colors.error || '#EF4444'}
                  />
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              {/* Submit Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.submitButtonText}>
                      {role === 'student'
                        ? 'Complete Registration'
                        : 'Submit Application'}
                    </Text>
                    <Feather name="arrow-right" size={18} color="#FFFFFF" />
                  </View>
                )}
              </Pressable>

              {/* Back to Login */}
              <Pressable
                style={styles.loginLink}
                onPress={() => navigation.replace('Login')}
              >
                <Text style={styles.loginLinkText}>
                  Already registered? <Text style={styles.loginLinkBold}>Sign In</Text>
                </Text>
              </Pressable>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 24,
  },

  /* Navigation & Header */
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  header: {
    marginBottom: 20,
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

  /* Form Container Card */
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

  /* Segmented Role Toggle */
  roleToggle: {
    flexDirection: 'row',
    backgroundColor: colors.gray100 || '#F3F4F6',
    borderRadius: 12,
    padding: 4,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  roleBtnActive: {
    backgroundColor: colors.primary || '#0D9488',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  roleBtnText: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
    fontWeight: '600',
  },
  roleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Administrative Notice Banner */
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.15)',
  },
  noticeText: {
    flex: 1,
    fontSize: 11,
    color: colors.primaryDark || '#0F766E',
    fontWeight: '600',
    lineHeight: 16,
  },

  /* Input Fields */
  form: {
    gap: 14,
  },
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

  /* Buttons & Footers */
  submitButton: {
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  buttonPressed: {
    opacity: 0.88,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 4,
  },
  loginLinkText: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
  },
  loginLinkBold: {
    color: colors.primary || '#0D9488',
    fontWeight: '700',
  },
});

