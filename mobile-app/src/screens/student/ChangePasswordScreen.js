import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { changePassword } from '../../api/usersApi';

function PasswordField({
  label,
  value,
  onChangeText,
  icon = 'lock',
  isFocused,
  onFocus,
  onBlur,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        <Feather
          name={icon}
          size={18}
          color={
            isFocused
              ? colors.primary || '#0D9488'
              : colors.gray400 || '#9CA3AF'
          }
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder="••••••••"
          placeholderTextColor={colors.gray400 || '#9CA3AF'}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        <Pressable
          style={styles.eyeButton}
          onPress={() => setVisible((v) => !v)}
          hitSlop={8}
        >
          <Feather
            name={visible ? 'eye-off' : 'eye'}
            size={18}
            color={
              visible
                ? colors.primary || '#0D9488'
                : colors.gray400 || '#9CA3AF'
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  async function handleSubmit() {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Weak Password', 'New password must be at least 6 characters long.');
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
      {/* Navigation Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={24} color={colors.gray800 || '#1F2937'} />
        </Pressable>
        <Text style={styles.topBarTitle}>Change Password</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={styles.infoBox}>
          <View style={styles.infoIconWrap}>
            <Feather name="shield" size={18} color={colors.primary || '#0D9488'} />
          </View>
          <Text style={styles.infoText}>
            Ensure your new password uses at least 6 characters with a combination of letters and numbers for safety.
          </Text>
        </View>

        {/* Input Card Container */}
        <Text style={styles.sectionTitle}>SECURITY CREDENTIALS</Text>
        <View style={styles.card}>
          <PasswordField
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            icon="key"
            isFocused={focusedField === 'current'}
            onFocus={() => setFocusedField('current')}
            onBlur={() => setFocusedField(null)}
          />

          <PasswordField
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            icon="lock"
            isFocused={focusedField === 'new'}
            onFocus={() => setFocusedField('new')}
            onBlur={() => setFocusedField(null)}
          />

          <PasswordField
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            icon="check-square"
            isFocused={focusedField === 'confirm'}
            onFocus={() => setFocusedField('confirm')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Save Action Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            saving && styles.buttonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Feather name="shield" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Update Password</Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100 || '#F3F4F6',
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  topBarTitle: {
    fontSize: typography.fontSizeBase || 16,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
  },
  headerSpacer: {
    width: 32,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Guidance Banner */
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.2)',
  },
  infoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.primaryDark || '#0F172A',
    lineHeight: 18,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  /* Card and Input Fields */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray700 || '#374151',
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    borderRadius: 12,
    backgroundColor: colors.gray50 || '#F9FAFB',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: colors.primary || '#0D9488',
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.gray900 || '#111827',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 4,
  },

  /* Action Buttons */
  saveButton: {
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    shadowColor: colors.primary || '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});