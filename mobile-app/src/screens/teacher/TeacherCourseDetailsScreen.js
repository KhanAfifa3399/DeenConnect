import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, LayoutAnimation, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { getSessionsByWeek } from '../../api/liveSessionsApi';
import UploadLectureModal from './UploadLectureModal';
import AttendanceModal from './AttendanceModal';

function TeacherCourseDetailsScreen({ route, navigation }) {
  const { courseId, courseTitle } = route.params;
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [lecturesByWeek, setLecturesByWeek] = useState({});
  const [sessionsByWeek, setSessionsByWeek] = useState({});
  const [loadingWeekId, setLoadingWeekId] = useState(null);
  const [uploadModalWeek, setUploadModalWeek] = useState(null);
  const [attendanceSession, setAttendanceSession] = useState(null);

  useEffect(() => {
    getWeeksByCourse(courseId)
      .then(setWeeks)
      .catch((err) => console.error('Failed to load weeks:', err))
      .finally(() => setLoading(false));
  }, [courseId]);

  async function toggleWeek(weekId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedWeek === weekId) {
      setExpandedWeek(null);
      return;
    }
    setExpandedWeek(weekId);
    await refreshWeekContent(weekId);
  }

  async function refreshWeekContent(weekId) {
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
        {weeks.map((week) => {
          const isExpanded = expandedWeek === week.id;
          const lectures = lecturesByWeek[week.id];
          const sessions = sessionsByWeek[week.id];

          return (
            <View key={week.id} style={styles.weekCard}>
              <Pressable style={styles.weekHeader} onPress={() => toggleWeek(week.id)}>
                <Feather name={isExpanded ? 'chevron-down' : 'chevron-right'} size={18} color={colors.primary} />
                <Text style={styles.weekTitle}>{week.title}</Text>
              </Pressable>

              {isExpanded && (
                <View style={styles.weekContent}>
                  {loadingWeekId === week.id ? (
                    <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing.space4 }} />
                  ) : (
                    <>
                      <View style={styles.subHeader}>
                        <Text style={styles.subHeaderTitle}>Lectures</Text>
                        <Pressable style={styles.addButton} onPress={() => setUploadModalWeek(week.id)}>
                          <Feather name="upload" size={13} color={colors.primary} />
                          <Text style={styles.addButtonText}>Upload</Text>
                        </Pressable>
                      </View>

                      {lectures?.length > 0 ? (
                        lectures.map((lecture) => (
                          <View key={lecture.id} style={styles.itemRow}>
                            <Feather name={lecture.video_url ? 'play-circle' : 'video-off'} size={16} color={lecture.video_url ? colors.primary : colors.gray300} />
                            <Text style={styles.itemText} numberOfLines={1}>{lecture.title}</Text>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>No lectures uploaded yet.</Text>
                      )}

                      <View style={[styles.subHeader, { marginTop: spacing.space4 }]}>
                        <Text style={styles.subHeaderTitle}>Live Sessions</Text>
                      </View>

                      {sessions?.length > 0 ? (
                        sessions.map((session) => (
                          <View key={session.id} style={styles.sessionRow}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.itemText} numberOfLines={1}>{session.title}</Text>
                              <Text style={styles.sessionMeta}>
                                {new Date(session.scheduled_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </Text>
                            </View>
                            <Pressable style={styles.smallActionBtn} onPress={() => Linking.openURL(session.meeting_link)}>
                              <Feather name="video" size={13} color={colors.primary} />
                            </Pressable>
                            <Pressable style={styles.smallActionBtn} onPress={() => setAttendanceSession(session)}>
                              <Feather name="check-square" size={13} color={colors.primary} />
                            </Pressable>
                          </View>
                        ))
                      ) : (
                        <Text style={styles.emptyText}>No live sessions scheduled.</Text>
                      )}
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      <UploadLectureModal
        visible={!!uploadModalWeek}
        weekId={uploadModalWeek}
        nextOrder={(lecturesByWeek[uploadModalWeek]?.length || 0) + 1}
        onClose={() => setUploadModalWeek(null)}
        onUploaded={() => {
          const weekId = uploadModalWeek;
          setUploadModalWeek(null);
          refreshWeekContent(weekId);
        }}
      />

      <AttendanceModal
        visible={!!attendanceSession}
        session={attendanceSession}
        onClose={() => setAttendanceSession(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  backButton: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  content: { padding: spacing.space5, paddingBottom: spacing.space10 },
  weekCard: { backgroundColor: colors.white, borderRadius: spacing.radiusLg, marginBottom: spacing.space3, overflow: 'hidden' },
  weekHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, padding: spacing.space4 },
  weekTitle: { flex: 1, fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  weekContent: { paddingHorizontal: spacing.space4, paddingBottom: spacing.space4, borderTopWidth: 1, borderTopColor: colors.gray100 },
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.space3, marginBottom: spacing.space2 },
  subHeaderTitle: { fontSize: typography.fontSizeXs, fontWeight: typography.weightSemibold, color: colors.gray500, textTransform: 'uppercase' },
  addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, paddingHorizontal: spacing.space3, paddingVertical: 4, borderRadius: spacing.radiusFull },
  addButtonText: { fontSize: 11, color: colors.primaryDark, fontWeight: typography.weightMedium },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingVertical: spacing.space2 },
  itemText: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray900 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2, paddingVertical: spacing.space2 },
  sessionMeta: { fontSize: 11, color: colors.gray500, marginTop: 1 },
  smallActionBtn: { width: 30, height: 30, borderRadius: spacing.radiusMd, backgroundColor: colors.gray50, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: typography.fontSizeXs, color: colors.gray400, paddingVertical: spacing.space2 },
});

export default TeacherCourseDetailsScreen;