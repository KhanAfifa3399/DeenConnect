import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { updateProfile } from '../../api/usersApi';
import { getUser, setUser as saveUser } from '../../utils/secureStorage';
import { enrollInCourse } from '../../api/enrollmentsApi';

function EnrollModal({ visible, course, onClose, onEnrolled }) {
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    setError('');

    if (!phone.trim()) {
      setError('Please enter a contact number.');
      return;
    }
    if (!agreed) {
      setError('Please confirm you agree to the course terms.');
      return;
    }

    setSubmitting(true);
    try {
      const currentUser = await getUser();
      if (phone.trim() !== (currentUser?.phone || '')) {
        const updated = await updateProfile(currentUser.id, { ...currentUser, phone: phone.trim() });
        await saveUser({ ...currentUser, phone: updated.phone });
      }

      await enrollInCourse(course.id, notes.trim());
      onEnrolled();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrapper}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Enroll in Course</Text>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={18} color={colors.gray600} />
              </Pressable>
            </View>

            <Text style={styles.courseTitle} numberOfLines={2}>{course?.title}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="e.g. 03001234567"
                placeholderTextColor={colors.gray400}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Message to Teacher (optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any questions or notes before joining..."
                placeholderTextColor={colors.gray400}
                multiline
                numberOfLines={3}
              />
            </View>

            <Pressable style={styles.checkboxRow} onPress={() => setAgreed((a) => !a)}>
              <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
                {agreed && <Feather name="check" size={12} color={colors.white} />}
              </View>
              <Text style={styles.checkboxLabel}>I agree to attend classes and follow course guidelines</Text>
            </Pressable>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Confirm Enrollment</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,46,54,0.5)', justifyContent: 'flex-end' },
  sheetWrapper: { justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white, borderTopLeftRadius: spacing.radiusXl, borderTopRightRadius: spacing.radiusXl,
    padding: spacing.space5, paddingBottom: spacing.space8,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.space2 },
  sheetTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900 },
  closeButton: { width: 30, height: 30, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  courseTitle: { fontSize: typography.fontSizeSm, color: colors.primary, fontWeight: typography.weightMedium, marginBottom: spacing.space4 },
  field: { marginBottom: spacing.space4 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  input: {
    borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, fontSize: typography.fontSizeBase, color: colors.gray900,
  },
  textarea: { height: 80, textAlignVertical: 'top' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, marginBottom: spacing.space3 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.gray300,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  checkboxLabel: { flex: 1, fontSize: typography.fontSizeXs, color: colors.gray600 },
  errorText: { color: colors.error, fontSize: typography.fontSizeSm, marginBottom: spacing.space3 },
  submitButton: { backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space4, alignItems: 'center' },
  submitButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default EnrollModal;