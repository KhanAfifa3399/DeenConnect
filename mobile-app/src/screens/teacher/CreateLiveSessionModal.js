import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Modal, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { createLiveSession } from '../../api/liveSessionsApi';

const PLATFORMS = ['Zoom', 'Google Meet', 'Jitsi', 'Other'];

function CreateLiveSessionModal({ visible, weekId, onClose, onCreated }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState('Zoom');
  const [meetingLink, setMeetingLink] = useState('');
  const [duration, setDuration] = useState('60');
  const [scheduledAt, setScheduledAt] = useState(new Date(Date.now() + 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function resetAndClose() {
    setTitle('');
    setDescription('');
    setPlatform('Zoom');
    setMeetingLink('');
    setDuration('60');
    setScheduledAt(new Date(Date.now() + 60 * 60 * 1000));
    setError('');
    onClose();
  }

  function onChangeDate(event, selectedDate) {
    setShowDatePicker(false);
    if (!selectedDate) return;
    setScheduledAt((prev) => {
      const next = new Date(prev);
      next.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      return next;
    });
  }

  function onChangeTime(event, selectedTime) {
    setShowTimePicker(false);
    if (!selectedTime) return;
    setScheduledAt((prev) => {
      const next = new Date(prev);
      next.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0, 0);
      return next;
    });
  }

  async function handleSubmit() {
    setError('');
    if (!title.trim()) {
      setError('Please enter a session title.');
      return;
    }
    if (!meetingLink.trim()) {
      setError('Please enter a meeting link.');
      return;
    }
    if (scheduledAt.getTime() < Date.now()) {
      setError('Please choose a date/time in the future.');
      return;
    }

    setSaving(true);
    try {
      await createLiveSession({
        week_id: weekId,
        title: title.trim(),
        description: description.trim() || undefined,
        meeting_platform: platform,
        meeting_link: meetingLink.trim(),
        scheduled_at: scheduledAt.toISOString(),
        duration_minutes: duration ? Number(duration) : undefined,
      });
      resetAndClose();
      onCreated();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to schedule session. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const dateStr = scheduledAt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = scheduledAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={resetAndClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetWrapper}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Schedule Live Session</Text>
              <Pressable onPress={resetAndClose} style={styles.closeButton}>
                <Feather name="x" size={18} color={colors.gray600} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.field}>
                <Text style={styles.label}>Session Title</Text>
                <TextInput
                  style={styles.input}
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. Week 3 Tajweed Practice"
                  placeholderTextColor={colors.gray400}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textarea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="What will this session cover?"
                  placeholderTextColor={colors.gray400}
                  multiline
                  numberOfLines={2}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Platform</Text>
                <View style={styles.chipRow}>
                  {PLATFORMS.map((p) => (
                    <Pressable
                      key={p}
                      style={[styles.chip, platform === p && styles.chipActive]}
                      onPress={() => setPlatform(p)}
                    >
                      <Text style={[styles.chipText, platform === p && styles.chipTextActive]}>{p}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Meeting Link</Text>
                <TextInput
                  style={styles.input}
                  value={meetingLink}
                  onChangeText={setMeetingLink}
                  placeholder="https://meet.google.com/..."
                  placeholderTextColor={colors.gray400}
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Date</Text>
                  <Pressable style={styles.pickerButton} onPress={() => setShowDatePicker(true)}>
                    <Feather name="calendar" size={15} color={colors.primary} />
                    <Text style={styles.pickerButtonText}>{dateStr}</Text>
                  </Pressable>
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>Time</Text>
                  <Pressable style={styles.pickerButton} onPress={() => setShowTimePicker(true)}>
                    <Feather name="clock" size={15} color={colors.primary} />
                    <Text style={styles.pickerButtonText}>{timeStr}</Text>
                  </Pressable>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Duration (minutes)</Text>
                <TextInput
                  style={styles.input}
                  value={duration}
                  onChangeText={setDuration}
                  placeholder="60"
                  placeholderTextColor={colors.gray400}
                  keyboardType="number-pad"
                />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <Text style={styles.submitButtonText}>Schedule Session</Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {showDatePicker && (
          <DateTimePicker value={scheduledAt} mode="date" display="default" onChange={onChangeDate} minimumDate={new Date()} />
        )}
        {showTimePicker && (
          <DateTimePicker value={scheduledAt} mode="time" display="default" onChange={onChangeTime} />
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(10,46,54,0.5)', justifyContent: 'flex-end' },
  sheetWrapper: { justifyContent: 'flex-end', maxHeight: '88%' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: spacing.radiusXl, borderTopRightRadius: spacing.radiusXl, padding: spacing.space5, paddingBottom: spacing.space8 },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.space4 },
  sheetTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900 },
  closeButton: { width: 30, height: 30, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  field: { marginBottom: spacing.space4 },
  row: { flexDirection: 'row', gap: spacing.space3 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, fontSize: typography.fontSizeBase, color: colors.gray900 },
  textarea: { height: 60, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.space2 },
  chip: { paddingHorizontal: spacing.space4, paddingVertical: spacing.space2, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100 },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: typography.fontSizeXs, fontWeight: typography.weightMedium, color: colors.gray700 },
  chipTextActive: { color: colors.white },
  pickerButton: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space2, borderWidth: 1.5, borderColor: colors.gray200,
    borderRadius: spacing.radiusMd, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
  },
  pickerButtonText: { fontSize: typography.fontSizeSm, color: colors.gray900, fontWeight: typography.weightMedium },
  errorText: { color: colors.error, fontSize: typography.fontSizeSm, marginBottom: spacing.space3 },
  submitButton: { backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space4, alignItems: 'center', marginTop: spacing.space1 },
  submitButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default CreateLiveSessionModal;