import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { updateProfile } from '../../api/usersApi';
import { getUser, setUser as saveUser } from '../../utils/secureStorage';
import { useFocusEffect } from '@react-navigation/native';

const MARITAL_OPTIONS = ['Unmarried', 'Married'];

function InputField({ label, icon, isFocused, onFocus, onBlur, ...rest }) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, isFocused && styles.inputContainerFocused]}>
        <Feather
          name={icon}
          size={18}
          color={isFocused ? (colors.primary || '#0D9488') : (colors.gray400 || '#9CA3AF')}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.gray400 || '#9CA3AF'}
          onFocus={onFocus}
          onBlur={onBlur}
          {...rest}
        />
      </View>
    </View>
  );
}

export default function EditProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [address, setAddress] = useState('');
  const [education, setEducation] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

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
      {/* Navigation Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={24} color={colors.gray800 || '#1F2937'} />
        </Pressable>
        <Text style={styles.topBarTitle}>Edit Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Details Section */}
        <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
        <View style={styles.card}>
          <InputField
            label="Full Name"
            icon="user"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            isFocused={focusedField === 'fullName'}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => setFocusedField(null)}
          />

          <InputField
            label="Contact Number"
            icon="phone"
            value={phone}
            onChangeText={setPhone}
            placeholder="+91 123 456 7890"
            keyboardType="phone-pad"
            isFocused={focusedField === 'phone'}
            onFocus={() => setFocusedField('phone')}
            onBlur={() => setFocusedField(null)}
          />

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Marital Status</Text>
            <View style={styles.pillRow}>
              {MARITAL_OPTIONS.map((opt) => {
                const isActive = maritalStatus === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => setMaritalStatus(opt)}
                  >
                    {isActive && (
                      <Feather name="check" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
                    )}
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Location Information Section */}
        <Text style={styles.sectionTitle}>LOCATION INFORMATION</Text>
        <View style={styles.card}>
          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <InputField
                label="City"
                icon="map-pin"
                value={city}
                onChangeText={setCity}
                placeholder="e.g. Mumbai"
                isFocused={focusedField === 'city'}
                onFocus={() => setFocusedField('city')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <InputField
                label="State"
                icon="map"
                value={state}
                onChangeText={setState}
                placeholder="e.g. Maharashtra"
                isFocused={focusedField === 'state'}
                onFocus={() => setFocusedField('state')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <InputField
            label="Address"
            icon="home"
            value={address}
            onChangeText={setAddress}
            placeholder="Street address details"
            multiline
            numberOfLines={2}
            isFocused={focusedField === 'address'}
            onFocus={() => setFocusedField('address')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Education Section */}
        <Text style={styles.sectionTitle}>QUALIFICATIONS</Text>
        <View style={styles.card}>
          <InputField
            label="Education"
            icon="book-open"
            value={education}
            onChangeText={setEducation}
            placeholder="e.g. Bachelor's in Islamic Studies"
            isFocused={focusedField === 'education'}
            onFocus={() => setFocusedField('education')}
            onBlur={() => setFocusedField(null)}
          />
        </View>

        {/* Submit Action */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            pressed && styles.pressed,
            saving && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.buttonContent}>
              <Feather name="check-circle" size={18} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Save Changes</Text>
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

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

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

  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },

  /* Custom Status Pills */
  pillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.primary || '#0D9488',
    borderColor: colors.primary || '#0D9488',
  },
  pillText: {
    fontSize: 13,
    color: colors.gray600 || '#4B5563',
    fontWeight: '500',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  /* Buttons */
  saveButton: {
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
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