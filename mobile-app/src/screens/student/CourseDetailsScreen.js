import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, LayoutAnimation, Platform, UIManager, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getCourseById } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import EnrollModal from './EnrollModal';
// import { Alert } from 'react-native';
import { getMyEnrollments, enrollInCourse } from '../../api/enrollmentsApi';
import { getSessionsByWeek } from '../../api/liveSessionsApi';
import { Linking } from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CourseDetailsScreen({ route, navigation }) {
  const { courseId, courseTitle, targetWeekId } = route.params;
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [lecturesByWeek, setLecturesByWeek] = useState({});
  const [loadingWeekId, setLoadingWeekId] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollModalVisible, setEnrollModalVisible] = useState(false);
  const [sessionsByWeek, setSessionsByWeek] = useState({});

  useEffect(() => {
    async function load() {
      try {
        const [courseData, weeksData, myEnrollments] = await Promise.all([
          getCourseById(courseId),
          getWeeksByCourse(courseId),
          getMyEnrollments(),
        ]);
        setCourse(courseData);
        setWeeks(weeksData);
        setIsEnrolled(myEnrollments.some((e) => e.course_id === courseId));

        if (targetWeekId) {
          toggleWeek(targetWeekId);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

  // async function handleEnroll() {
  //   setEnrolling(true);
  //   try {
  //     await enrollInCourse(courseId);
  //     setIsEnrolled(true);
  //     Alert.alert('Enrolled!', 'You have successfully enrolled in this course.');
  //   } catch (err) {
  //     Alert.alert('Error', err.response?.data?.message || 'Failed to enroll');
  //   } finally {
  //     setEnrolling(false);
  //   }
  // }

  async function toggleWeek(weekId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedWeek === weekId) {
      setExpandedWeek(null);
      return;
    }
    setExpandedWeek(weekId);

    if (!lecturesByWeek[weekId]) {
      setLoadingWeekId(weekId);
      try {
        const [lectures, sessions] = await Promise.all([
          getLecturesByWeek(weekId),
          getSessionsByWeek(weekId),
        ]);
        setLecturesByWeek((prev) => ({ ...prev, [weekId]: lectures }));
        setSessionsByWeek((prev) => ({ ...prev, [weekId]: sessions }));
      } catch (err) {
        console.error('Failed to load week content:', err);
      } finally {
        setLoadingWeekId(null);
      }
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>{courseTitle}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={styles.subjectTag}>{course?.subject_name}</Text>
          <Text style={styles.courseTitle}>{course?.title}</Text>
          <Text style={styles.courseDesc}>{course?.description}</Text>
          <View style={styles.metaRow}>
            <Feather name="user" size={13} color={colors.gray500} />
            <Text style={styles.metaText}>{course?.teacher_name}</Text>
            <View style={styles.metaDivider} />
            <Feather name="calendar" size={13} color={colors.gray500} />
            <Text style={styles.metaText}>{course?.total_weeks} weeks</Text>
          </View>
        </View>
        {!isEnrolled ? (
          <Pressable style={styles.enrollButton} onPress={() => setEnrollModalVisible(true)}>
            <Feather name="plus-circle" size={16} color={colors.white} />
            <Text style={styles.enrollButtonText}>Enroll Now</Text>
          </Pressable>
        ) : (
          <View style={styles.enrolledBanner}>
            <Feather name="check-circle" size={16} color={colors.success} />
            <Text style={styles.enrolledBannerText}>You're enrolled in this course</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Course Content</Text>

        {weeks.map((week) => {
          const isExpanded = expandedWeek === week.id;
          const weekLectures = lecturesByWeek[week.id];
          return (
            <View key={week.id} style={styles.weekCard}>
              <Pressable style={styles.weekHeader} onPress={() => toggleWeek(week.id)}>
                <Feather name={isExpanded ? 'chevron-down' : 'chevron-right'} size={18} color={colors.primary} />
                <Text style={styles.weekTitle}>{week.title}</Text>
                <Text style={styles.weekCount}>{weekLectures?.length ?? ''}</Text>
              </Pressable>
              {sessionsByWeek[week.id]?.length > 0 && (
                <View style={styles.sessionsSection}>
                  <Text style={styles.sessionsSectionTitle}>Live Sessions</Text>
                  {sessionsByWeek[week.id].map((session) => {
                    const sessionDate = new Date(session.scheduled_at);
                    return (
                      <Pressable
                        key={session.id}
                        style={({ pressed }) => [styles.sessionRow, pressed && { opacity: 0.7 }]}
                        onPress={() => Linking.openURL(session.meeting_link)}
                      >
                        <View style={styles.sessionIconWrap}>
                          <Feather name="radio" size={16} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.sessionRowTitle}>{session.title}</Text>
                          <Text style={styles.sessionRowMeta}>
                            {new Date(session.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                            {new Date(session.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        </View>
                        {session.status === 'ongoing' ? (
                          <View style={styles.joinBadge}>
                            <Text style={styles.joinBadgeText}>LIVE · JOIN</Text>
                          </View>
                        ) : (
                          <View style={styles.joinBadgeScheduled}>
                            <Feather name="external-link" size={11} color={colors.primary} />
                            <Text style={styles.scheduledText}>Join</Text>
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
              {isExpanded && (
                <View style={styles.lecturesList}>
                  {loadingWeekId === week.id ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.space3 }} />
                  ) : weekLectures?.length > 0 ? (
                    weekLectures.map((lecture) => (
                      <Pressable
                        key={lecture.id}
                        style={({ pressed }) => [styles.lectureRow, pressed && styles.lectureRowPressed]}
                        onPress={() => navigation.navigate('LecturePlayer', { lecture })}
                      >
                        <View style={styles.lectureIconWrap}>
                          <Feather name={lecture.video_url ? 'play-circle' : 'video-off'} size={18} color={lecture.video_url ? colors.primary : colors.gray300} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.lectureTitle} numberOfLines={1}>{lecture.title}</Text>
                          {lecture.duration_minutes && (
                            <Text style={styles.lectureDuration}>{lecture.duration_minutes} min</Text>
                          )}
                        </View>
                        <Feather name="chevron-right" size={16} color={colors.gray300} />
                      </Pressable>
                    ))
                  ) : (
                    <Text style={styles.emptyLectures}>No lectures in this week yet.</Text>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <EnrollModal
        visible={enrollModalVisible}
        course={course}
        onClose={() => setEnrollModalVisible(false)}
        onEnrolled={() => {
          setEnrollModalVisible(false);
          setIsEnrolled(true);
        }}
      />
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  backButton: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  content: { padding: spacing.space5, paddingBottom: spacing.space10 },
  heroCard: { backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space5, marginBottom: spacing.space5 },
  subjectTag: {
    alignSelf: 'flex-start', backgroundColor: colors.accentLight, color: colors.primaryDark,
    fontSize: typography.fontSizeXs, fontWeight: typography.weightMedium,
    paddingHorizontal: spacing.space3, paddingVertical: 3, borderRadius: spacing.radiusFull, marginBottom: spacing.space3,
    overflow: 'hidden',
  },
  enrollButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.space2,
    backgroundColor: colors.primary, borderRadius: spacing.radiusFull, paddingVertical: spacing.space3, marginTop: spacing.space4,
  },
  enrollButtonText: { color: colors.white, fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold,},
  enrolledBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.space2,
    backgroundColor: 'rgba(46,125,50,0.1)', borderRadius: spacing.radiusFull, paddingVertical: spacing.space3, marginTop: spacing.space4,
  },
  sessionsSection: { paddingTop: spacing.space2, paddingBottom: spacing.space2, padding: spacing.space4 },
  sessionsSectionTitle: { fontSize: typography.fontSizeXs, fontWeight: typography.weightSemibold, color: colors.gray500, textTransform: 'uppercase', marginBottom: spacing.space2, marginTop: spacing.space1 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingVertical: spacing.space2 },
  sessionIconWrap: { width: 32, height: 32, borderRadius: spacing.radiusMd, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  sessionRowTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  sessionRowMeta: { fontSize: typography.fontSizeXs, color: colors.gray500, marginTop: 1 },
  joinBadge: { backgroundColor: colors.error, paddingHorizontal: spacing.space2, paddingVertical: 4, borderRadius: spacing.radiusFull },
  joinBadgeText: { color: colors.white, fontSize: 9, fontWeight: typography.weightBold },
  joinBadgeScheduled: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, paddingHorizontal: spacing.space2, paddingVertical: 4, borderRadius: spacing.radiusFull },
  scheduledText: { fontSize: 10, color: colors.primary, fontWeight: typography.weightMedium },
  enrolledBannerText: { color: colors.success, fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium },
  courseTitle: { fontSize: typography.fontSizeXl, fontWeight: typography.weightBold, color: colors.gray900, marginBottom: spacing.space2 },
  courseDesc: { fontSize: typography.fontSizeSm, color: colors.gray600, lineHeight: 20, marginBottom: spacing.space4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
  metaText: { fontSize: typography.fontSizeXs, color: colors.gray500 },
  metaDivider: { width: 1, height: 10, backgroundColor: colors.gray200, marginHorizontal: 2 },
  sectionTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900, marginBottom: spacing.space3, marginTop: spacing.space3 },
  weekCard: { backgroundColor: colors.white, borderRadius: spacing.radiusLg, marginBottom: spacing.space3, overflow: 'hidden' },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, padding: spacing.space4 },
  weekTitle: { flex: 1, fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  weekCount: { fontSize: typography.fontSizeXs, color: colors.gray400 },
  lecturesList: { paddingHorizontal: spacing.space4, paddingBottom: spacing.space3, borderTopWidth: 1, borderTopColor: colors.gray100 },
  lectureRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingVertical: spacing.space3 },
  lectureRowPressed: { opacity: 0.7 },
  lectureIconWrap: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  lectureTitle: { fontSize: typography.fontSizeSm, color: colors.gray900 },
  lectureDuration: { fontSize: typography.fontSizeXs, color: colors.gray500, marginTop: 1 },
  emptyLectures: { fontSize: typography.fontSizeSm, color: colors.gray400, paddingVertical: spacing.space3 },
});

export default CourseDetailsScreen;