import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { updateProfile } from '../../api/usersApi';
import { getUser, setUser as saveUser } from '../../utils/secureStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const MARITAL_OPTIONS = ['Unmarried', 'Married'];

function Field({ label, ...rest }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor={colors.gray400} {...rest} />
    </View>
  );
}

function EditProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUser().then((u) => {
        if (!u) return;
        setUserId(u.id);
        setFullName(u.full_name || '');
        setPhone(u.phone || '');
        setCity(u.city || '');
        setState(u.state || '');
        setAddress(u.address || '');
        setEducation(u.education || '');
        setMaritalStatus(u.marital_status || '');
      });
    }, [])
  );

  async function handleSave() {
    if (!fullName.trim()) {
      Alert.alert('Missing Name', 'Full name is required.');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfile(userId, {
        full_name: fullName,
        phone,
        city,
        state,
        address,
        education,
        marital_status: maritalStatus,
      });
      const currentUser = await getUser();
      await saveUser({ ...currentUser, ...updated });
      Alert.alert('Success', 'Profile updated successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update profile');
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
        <Text style={styles.topBarTitle}>Edit Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Your full name" />
        <Field label="Contact Number" value={phone} onChangeText={setPhone} placeholder="+ 91 123 456 7890" keyboardType="phone-pad" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="e.g. Mumbai" />
        <Field label="State / Province" value={state} onChangeText={setState} placeholder="e.g. Maharshtra" />
        <Field label="Address" value={address} onChangeText={setAddress} placeholder="Street address" multiline numberOfLines={2} />
        <Field label="Education" value={education} onChangeText={setEducation} placeholder="e.g. Bachelor's in Islamic Studies" />

        <View style={styles.field}>
          <Text style={styles.label}>Marital Status</Text>
          <View style={styles.pillRow}>
            {MARITAL_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[styles.pill, maritalStatus === opt && styles.pillActive]}
                onPress={() => setMaritalStatus(opt)}
              >
                <Text style={[styles.pillText, maritalStatus === opt && styles.pillTextActive]}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator color={colors.white} /> : <Text style={styles.saveButtonText}>Save Changes</Text>}
        </Pressable>
      </ScrollView>
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
  content: { padding: spacing.space5, paddingBottom: spacing.space10 },
  field: { marginBottom: spacing.space4 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
    fontSize: typography.fontSizeBase, color: colors.gray900, backgroundColor: colors.white,
  },
  pillRow: { flexDirection: 'row', gap: spacing.space2 },
  pill: {
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space2,
    borderRadius: spacing.radiusFull, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200,
  },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: typography.fontSizeSm, color: colors.gray600 },
  pillTextActive: { color: colors.white, fontWeight: typography.weightMedium },
  saveButton: {
    backgroundColor: colors.primary, borderRadius: spacing.radiusFull,
    paddingVertical: spacing.space4, alignItems: 'center', marginTop: spacing.space4,
  },
  saveButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default EditProfileScreen;