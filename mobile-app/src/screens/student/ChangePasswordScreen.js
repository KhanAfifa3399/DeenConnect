import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { changePassword } from '../../api/usersApi';

function PasswordField({ label, value, onChangeText }) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.passwordWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="••••••••"
          placeholderTextColor={colors.gray400}
        />
        <Pressable style={styles.eyeButton} onPress={() => setVisible((v) => !v)}>
          <Feather name={visible ? 'eye-off' : 'eye'} size={18} color={colors.gray500} />
        </Pressable>
      </View>
    </View>
  );
}

function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      Alert.alert('Success', 'Password changed successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>
        <Text style={styles.topBarTitle}>Change Password</Text>
      </View>

      <View style={styles.content}>
        <PasswordField label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} />
        <PasswordField label="New Password" value={newPassword} onChangeText={setNewPassword} />
        <PasswordField label="Confirm New Password" value={confirmPassword} onChangeText={setConfirmPassword} />

        <Pressable style={styles.saveButton} onPress={handleSubmit} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Change Password</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  backButton: { padding: 4 },
  topBarTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  content: { padding: spacing.space5 },
  field: { marginBottom: spacing.space4 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  passwordWrapper: { position: 'relative', justifyContent: 'center' },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space4, paddingRight: spacing.space10, paddingVertical: spacing.space3,
    fontSize: typography.fontSizeBase, color: colors.gray900, backgroundColor: colors.white,
  },
  eyeButton: { position: 'absolute', right: spacing.space3, padding: spacing.space2 },
  saveButton: {
    backgroundColor: colors.primary, borderRadius: spacing.radiusFull,
    paddingVertical: spacing.space4, alignItems: 'center', marginTop: spacing.space4,
  },
  saveButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default ChangePasswordScreen;