import { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { registerStudent, registerTeacher } from '../api/authApi';
import { setToken, setUser } from '../utils/secureStorage';

function RegisterScreen({ navigation }) {
  const [role, setRole] = useState('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    setError('');

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in your name, email, and password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      if (role === 'student') {
        const result = await registerStudent(fullName.trim(), email.trim(), password, phone.trim());
        await setToken(result.data.token);
        await setUser(result.data.user);
        navigation.replace('StudentApp');
      } else {
        await registerTeacher(fullName.trim(), email.trim(), password, phone.trim());
        Alert.alert(
          'Registration Submitted',
          'Your teacher account has been submitted for review. An Admin will approve it before you can log in.',
          [{ text: 'OK', onPress: () => navigation.replace('Login') }]
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>

        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join DeenConnect to start learning</Text>
        </View>

        <View style={styles.roleToggle}>
          <Pressable
            style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]}
            onPress={() => setRole('student')}
          >
            <Feather name="user" size={15} color={role === 'student' ? colors.white : colors.gray500} />
            <Text style={[styles.roleBtnText, role === 'student' && styles.roleBtnTextActive]}>Student</Text>
          </Pressable>
          <Pressable
            style={[styles.roleBtn, role === 'teacher' && styles.roleBtnActive]}
            onPress={() => setRole('teacher')}
          >
            <Feather name="award" size={15} color={role === 'teacher' ? colors.white : colors.gray500} />
            <Text style={[styles.roleBtnText, role === 'teacher' && styles.roleBtnTextActive]}>Teacher</Text>
          </Pressable>
        </View>

        {role === 'teacher' && (
          <View style={styles.noticeBox}>
            <Feather name="info" size={14} color={colors.primaryDark} />
            <Text style={styles.noticeText}>
              Teacher accounts require Admin approval before you can log in.
            </Text>
          </View>
        )}

        <View style={styles.form}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={colors.gray400}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.gray400}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="e.g. 03001234567"
            placeholderTextColor={colors.gray400}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="At least 8 characters"
              placeholderTextColor={colors.gray400}
              secureTextEntry={!showPassword}
            />
            <Pressable style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={colors.gray500} />
            </Pressable>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor={colors.gray400}
            secureTextEntry={!showPassword}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.submitButton} onPress={handleRegister} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.submitButtonText}>
                {role === 'student' ? 'Create Account' : 'Submit for Review'}
              </Text>
            )}
          </Pressable>

          <Pressable style={styles.loginLink} onPress={() => navigation.replace('Login')}>
            <Text style={styles.loginLinkText}>
              Already have an account? <Text style={styles.loginLinkBold}>Sign In</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.white },
  container: { flexGrow: 1, paddingHorizontal: spacing.space6, paddingTop: spacing.space6, paddingBottom: spacing.space10 },
  backButton: { width: 36, height: 36, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.space5 },
  header: { marginBottom: spacing.space5 },
  title: { fontSize: typography.fontSize2xl, fontWeight: typography.weightBold, color: colors.primaryDark },
  subtitle: { fontSize: typography.fontSizeSm, color: colors.gray500, marginTop: spacing.space1 },
  roleToggle: { flexDirection: 'row', backgroundColor: colors.gray100, borderRadius: spacing.radiusFull, padding: 4, marginBottom: spacing.space4 },
  roleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.space3, borderRadius: spacing.radiusFull },
  roleBtnActive: { backgroundColor: colors.primary },
  roleBtnText: { fontSize: typography.fontSizeSm, color: colors.gray500, fontWeight: typography.weightMedium },
  roleBtnTextActive: { color: colors.white },
  noticeBox: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.space2, backgroundColor: colors.accentLight, borderRadius: spacing.radiusMd, padding: spacing.space3, marginBottom: spacing.space4 },
  noticeText: { flex: 1, fontSize: typography.fontSizeXs, color: colors.primaryDark, lineHeight: 17 },
  form: { gap: spacing.space2 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginTop: spacing.space3 },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, fontSize: typography.fontSizeBase, color: colors.gray900,
  },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  passwordInput: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space4, paddingRight: spacing.space10, paddingVertical: spacing.space3,
    fontSize: typography.fontSizeBase, color: colors.gray900,
  },
  eyeButton: { position: 'absolute', right: spacing.space3, padding: spacing.space2 },
  errorText: { color: colors.error, fontSize: typography.fontSizeSm, marginTop: spacing.space3 },
  submitButton: { backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space4, alignItems: 'center', marginTop: spacing.space5 },
  submitButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
  loginLink: { alignItems: 'center', marginTop: spacing.space4 },
  loginLinkText: { fontSize: typography.fontSizeSm, color: colors.gray600 },
  loginLinkBold: { color: colors.primary, fontWeight: typography.weightSemibold },
});

export default RegisterScreen;