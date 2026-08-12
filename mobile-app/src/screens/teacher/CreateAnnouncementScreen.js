import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { getMyAssignedCourses } from '../../api/coursesApi';
import { createAnnouncement, updateAnnouncement } from '../../api/announcementsApi';

const AUDIENCE_OPTIONS = [
  { value: 'students', label: 'My Students' },
  { value: 'all', label: 'Everyone' },
];

export default function CreateAnnouncementScreen({ navigation, route }) {
  const editingAnnouncement = route.params?.editingAnnouncement;

  const [title, setTitle] = useState(editingAnnouncement?.title || '');
  const [message, setMessage] = useState(editingAnnouncement?.message || '');
  const [audience, setAudience] = useState(editingAnnouncement?.audience || 'students');
  const [courseId, setCourseId] = useState(editingAnnouncement?.course_id || null);

  const [courses, setCourses] = useState([]);
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
      const payload = {
        title: title.trim(),
        message: message.trim(),
        audience,
        course_id: courseId,
      };

      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, payload);
      } else {
        await createAnnouncement(payload);
      }

      Alert.alert(
        'Success',
        editingAnnouncement ? 'Announcement updated.' : 'Your announcement has been posted.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save announcement');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Academic Navigation Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={colors.gray900 || '#0F172A'} />
        </Pressable>
        <Text style={styles.topBarTitle}>
          {editingAnnouncement ? 'Edit Announcement' : 'Post Announcement'}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.headerSubmitBtn, pressed && styles.btnPressed]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.headerSubmitText}>
            {editingAnnouncement ? 'Save' : 'Post'}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Upcoming Class Rescheduled"
            placeholderTextColor={colors.gray400 || '#9CA3AF'}
          />
        </View>

        {/* Message Field */}
        <View style={styles.field}>
          <Text style={styles.label}>Message</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={message}
            onChangeText={setMessage}
            placeholder="Write your announcement details..."
            placeholderTextColor={colors.gray400 || '#9CA3AF'}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        </View>

        {/* Audience Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Audience</Text>
          <View style={styles.pillRow}>
            {AUDIENCE_OPTIONS.map((opt) => {
              const isActive = audience === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.pill, isActive && styles.pillActive]}
                  onPress={() => setAudience(opt.value)}
                >
                  <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Course Target Selector */}
        <View style={styles.field}>
          <Text style={styles.label}>Target Course (Optional)</Text>
          {loadingCourses ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="small" color={colors.primary || '#0D9488'} />
            </View>
          ) : (
            <View style={styles.courseList}>
              <Pressable
                style={[styles.courseChip, courseId === null && styles.courseChipActive]}
                onPress={() => setCourseId(null)}
              >
                <Text
                  style={[
                    styles.courseChipText,
                    courseId === null && styles.courseChipTextActive,
                  ]}
                >
                  All My Courses
                </Text>
              </Pressable>

              {courses.map((c) => {
                const isActive = courseId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.courseChip, isActive && styles.courseChipActive]}
                    onPress={() => setCourseId(c.id)}
                  >
                    <Text
                      style={[styles.courseChipText, isActive && styles.courseChipTextActive]}
                      numberOfLines={1}
                    >
                      {c.title}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorBox}>
            <Feather name="alert-circle" size={14} color={colors.error || '#EF4444'} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Main Action Submit Button */}
        <Pressable
          style={({ pressed }) => [
            styles.submitButton,
            submitting && styles.submitButtonDisabled,
            pressed && styles.btnPressed,
          ]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <View style={styles.submitInner}>
              <Feather name="send" size={15} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>
                {editingAnnouncement ? 'Save Changes' : 'Post Announcement'}
              </Text>
            </View>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },

  /* Top Navigation Header */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200 || '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900 || '#0F172A',
  },
  headerSubmitBtn: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  headerSubmitText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark || '#0F766E',
  },

  /* Form Content */
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray700 || '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray200 || '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: colors.gray900 || '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  textarea: {
    height: 120,
  },

  /* Audience Pills */
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillActive: {
    backgroundColor: colors.primary || '#0D9488',
    borderColor: colors.primary || '#0D9488',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray600 || '#475569',
  },
  pillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  /* Course Target Chips */
  loadingBox: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  courseList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  courseChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E2E8F0',
  },
  courseChipActive: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderColor: colors.primaryDark || '#0F766E',
  },
  courseChipText: {
    fontSize: 12,
    color: colors.gray600 || '#475569',
    fontWeight: '500',
  },
  courseChipTextActive: {
    color: colors.primaryDark || '#0F766E',
    fontWeight: '700',
  },

  /* Error Box */
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.error || '#EF4444',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },

  /* Main Action Submit Button */
  submitButton: {
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: colors.primary || '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.85,
  },
});