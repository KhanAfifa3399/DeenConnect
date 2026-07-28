import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getCourseById } from '../../api/coursesApi';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function CourseDetailsScreen({ route, navigation }) {
  const { courseId, courseTitle } = route.params;
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [lecturesByWeek, setLecturesByWeek] = useState({});
  const [loadingWeekId, setLoadingWeekId] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [courseData, weeksData] = await Promise.all([
          getCourseById(courseId),
          getWeeksByCourse(courseId),
        ]);
        setCourse(courseData);
        setWeeks(weeksData);
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [courseId]);

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
        const lectures = await getLecturesByWeek(weekId);
        setLecturesByWeek((prev) => ({ ...prev, [weekId]: lectures }));
      } catch (err) {
        console.error('Failed to load lectures:', err);
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
  courseTitle: { fontSize: typography.fontSizeXl, fontWeight: typography.weightBold, color: colors.gray900, marginBottom: spacing.space2 },
  courseDesc: { fontSize: typography.fontSizeSm, color: colors.gray600, lineHeight: 20, marginBottom: spacing.space4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
  metaText: { fontSize: typography.fontSizeXs, color: colors.gray500 },
  metaDivider: { width: 1, height: 10, backgroundColor: colors.gray200, marginHorizontal: 2 },
  sectionTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900, marginBottom: spacing.space3 },
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