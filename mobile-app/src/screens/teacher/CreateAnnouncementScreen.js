import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses } from '../../api/coursesApi';
import { createAnnouncement } from '../../api/announcementsApi';

const AUDIENCE_OPTIONS = [
  { value: 'students', label: 'My Students' },
  { value: 'all', label: 'Everyone' },
];

function CreateAnnouncementScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('students');
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyAssignedCourses()
      .then(setCourses)
      .catch((err) => console.error('Failed to load courses:', err))
      .finally(() => setLoadingCourses(false));
  }, []);

  async function handleSubmit() {
    setError('');
    if (!title.trim() || !message.trim()) {
      setError('Please fill in both a title and a message.');
      return;
    }

    setSubmitting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        message: message.trim(),
        audience,
        course_id: courseId,
      });
      Alert.alert('Posted', 'Your announcement has been posted.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post announcement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>
        <Text style={styles.topBarTitle}>Post Announcement</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Class Rescheduled"
            placeholderTextColor={colors.gray400}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Write your announcement..."
            placeholderTextColor={colors.gray400}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Audience</Text>
          <View style={styles.pillRow}>
            {AUDIENCE_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.pill, audience === opt.value && styles.pillActive]}
                onPress={() => setAudience(opt.value)}
              >
                <Text style={[styles.pillText, audience === opt.value && styles.pillTextActive]}>{opt.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Specific Course (optional)</Text>
          {loadingCourses ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.courseList}>
              <Pressable
                style={[styles.courseChip, courseId === null && styles.courseChipActive]}
                onPress={() => setCourseId(null)}
              >
                <Text style={[styles.courseChipText, courseId === null && styles.courseChipTextActive]}>
                  All my courses
                </Text>
              </Pressable>
              {courses.map((c) => (
                <Pressable
                  key={c.id}
                  style={[styles.courseChip, courseId === c.id && styles.courseChipActive]}
                  onPress={() => setCourseId(c.id)}
                >
                  <Text style={[styles.courseChipText, courseId === c.id && styles.courseChipTextActive]} numberOfLines={1}>
                    {c.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color={colors.white} /> : <Text style={styles.submitButtonText}>Post Announcement</Text>}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  backButton: { padding: 4 },
  topBarTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  content: { padding: spacing.space5, paddingBottom: spacing.space10 },
  field: { marginBottom: spacing.space4 },
  label: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray700, marginBottom: spacing.space2 },
  input: { borderWidth: 1.5, borderColor: colors.gray200, borderRadius: spacing.radiusMd, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, fontSize: typography.fontSizeBase, color: colors.gray900, backgroundColor: colors.white },
  textarea: { height: 100, textAlignVertical: 'top' },
  pillRow: { flexDirection: 'row', gap: spacing.space2 },
  pill: { paddingHorizontal: spacing.space4, paddingVertical: spacing.space2, borderRadius: spacing.radiusFull, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200 },
  pillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillText: { fontSize: typography.fontSizeSm, color: colors.gray600 },
  pillTextActive: { color: colors.white, fontWeight: typography.weightMedium },
  courseList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.space2 },
  courseChip: { paddingHorizontal: spacing.space3, paddingVertical: spacing.space2, borderRadius: spacing.radiusFull, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.gray200, maxWidth: 200 },
  courseChipActive: { backgroundColor: colors.accentLight, borderColor: colors.primary },
  courseChipText: { fontSize: typography.fontSizeXs, color: colors.gray600 },
  courseChipTextActive: { color: colors.primaryDark, fontWeight: typography.weightMedium },
  errorText: { color: colors.error, fontSize: typography.fontSizeSm, marginBottom: spacing.space3 },
  submitButton: { backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space4, alignItems: 'center', marginTop: spacing.space2 },
  submitButtonText: { color: colors.white, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold },
});

export default CreateAnnouncementScreen;