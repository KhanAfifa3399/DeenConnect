import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  Linking,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getCourseById } from '../../api/coursesApi';
import { getFileUrl } from '../../api/urls';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { getSessionsByWeek, updateSessionStatus } from '../../api/liveSessionsApi';
import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';

import UploadLectureModal from './UploadLectureModal';
import AttendanceModal from './AttendanceModal';
import CreateLiveSessionModal from './CreateLiveSessionModal';

function TeacherCourseDetailsScreen({ route, navigation }) {
  const { courseId, courseTitle } = route.params;
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [lecturesByWeek, setLecturesByWeek] = useState({});
  const [sessionsByWeek, setSessionsByWeek] = useState({});
  const [loadingWeekId, setLoadingWeekId] = useState(null);
  const [uploadModalWeek, setUploadModalWeek] = useState(null);
  const [sessionModalWeek, setSessionModalWeek] = useState(null);
  const [attendanceSession, setAttendanceSession] = useState(null);

  useEffect(() => {
    Promise.all([getCourseById(courseId), getWeeksByCourse(courseId)])
      .then(([courseData, weeksData]) => {
        setCourse(courseData);
        setWeeks(weeksData);
      })
      .catch((err) => console.error('Failed to load course:', err))
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

  function handleCancelSession(session, weekId) {
    Alert.alert(
      'Cancel Live Session',
      `Are you sure you want to cancel "${session.title}"? Students will no longer be able to join.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateSessionStatus(session.id, 'cancelled');
              refreshWeekContent(weekId);
            } catch (err) {
              console.error('Failed to cancel session:', err);
              Alert.alert('Error', 'Failed to cancel the session. Please try again.');
            }
          },
        },
      ]
    );
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark Ambient Hero Header */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[colors.primaryDark || '#0F172A', '#1E293B']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.ambientGlow} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top Navigation Bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={styles.topBarTitleWrap}>
            <Text style={styles.topBarSubtitle}>COURSE MANAGEMENT</Text>
            <Text style={styles.topBarTitle} numberOfLines={1}>
              {courseTitle}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Banner / Course Image Card */}
          <View style={styles.heroCard}>
            {course?.thumbnail ? (
              <Image source={{ uri: getFileUrl(course.thumbnail) }} style={styles.heroImage} />
            ) : (
              <View style={styles.heroFallback}>
                
              </View>
            )}
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.85)']}
              style={styles.heroGradient}
            />
            <View style={styles.heroContent}>
              <Text style={styles.heroSubject}>
                {course?.subject_name?.toUpperCase() || 'CURRICULUM'}
              </Text>
              <Text style={styles.heroTitle}>{course?.title || courseTitle}</Text>
              <View style={styles.heroStatsRow}>
                <View style={styles.heroStatChip}>
                  <Feather name="calendar" size={12} color="#2DD4BF" />
                  <Text style={styles.heroStatText}>{weeks.length} Weeks</Text>
                </View>
                <View style={styles.heroStatChip}>
                  <Feather name="users" size={12} color="#2DD4BF" />
                  <Text style={styles.heroStatText}>{course?.enrolled_count || 0} Students</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Section Divider Header */}
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeaderText}>COURSE SYLLABUS & WEEKS</Text>
          </View>

          {/* Weeks Accordion Cards */}
          {weeks.map((week, index) => {
            const isExpanded = expandedWeek === week.id;
            const lectures = lecturesByWeek[week.id];
            const sessions = sessionsByWeek[week.id];

            return (
              <View key={week.id} style={styles.weekCard}>
                <Pressable
                  style={styles.weekHeader}
                  onPress={() => toggleWeek(week.id)}
                >
                  <View style={styles.weekIndexBadge}>
                    <Text style={styles.weekIndexText}>
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                  </View>

                  <Text style={styles.weekTitle}>{week.title}</Text>

                  <View
                    style={[
                      styles.expandIconWrap,
                      isExpanded && styles.expandIconWrapActive,
                    ]}
                  >
                    <Feather
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={isExpanded ? '#0D9488' : colors.gray400 || '#9CA3AF'}
                    />
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.weekContent}>
                    {loadingWeekId === week.id ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.primary || '#0D9488'}
                        style={{ marginVertical: spacing.space4 || 16 }}
                      />
                    ) : (
                      <>
                        {/* LECTURES SECTION */}
                        <View style={styles.subHeader}>
                          <View style={styles.subHeaderLabelRow}>
                            <Feather name="video" size={13} color={colors.primary || '#0D9488'} />
                            <Text style={styles.subHeaderTitle}>Lectures</Text>
                          </View>
                          <Pressable
                            style={styles.addButton}
                            onPress={() => setUploadModalWeek(week.id)}
                          >
                            <Feather name="upload-cloud" size={12} color="#0D9488" />
                            <Text style={styles.addButtonText}>Upload</Text>
                          </Pressable>
                        </View>

                        {lectures?.length > 0 ? (
                          lectures.map((lecture) => (
                            <View key={lecture.id} style={styles.itemRow}>
                              <View
                                style={[
                                  styles.itemIconWrap,
                                  !lecture.video_url && styles.itemIconWrapDisabled,
                                ]}
                              >
                                <Feather
                                  name={lecture.video_url ? 'play' : 'video-off'}
                                  size={13}
                                  color={
                                    lecture.video_url
                                      ? colors.primary || '#0D9488'
                                      : colors.gray400 || '#9CA3AF'
                                  }
                                />
                              </View>
                              <Text style={styles.itemText} numberOfLines={1}>
                                {lecture.title}
                              </Text>
                            </View>
                          ))
                        ) : (
                          <Text style={styles.emptyText}>No lectures uploaded yet.</Text>
                        )}

                        {/* LIVE SESSIONS SECTION */}
                        <View style={[styles.subHeader, { marginTop: spacing.space4 || 16 }]}>
                          <View style={styles.subHeaderLabelRow}>
                            <Feather name="radio" size={13} color={colors.primary || '#0D9488'} />
                            <Text style={styles.subHeaderTitle}>Live Sessions</Text>
                          </View>
                          <Pressable
                            style={styles.addButton}
                            onPress={() => setSessionModalWeek(week.id)}
                          >
                            <Feather name="calendar" size={12} color="#0D9488" />
                            <Text style={styles.addButtonText}>Schedule</Text>
                          </Pressable>
                        </View>
{sessions?.length > 0 ? (
                          sessions.map((session) => {
                            const isEnded = session.computed_status === 'ended';
                            const isCancelled = session.status === 'cancelled';

                            return (
                              <View key={session.id} style={styles.sessionRow}>
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.itemText,
                                      isCancelled && styles.itemTextCancelled,
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {session.title}
                                  </Text>
                                  <Text style={styles.sessionMeta}>
                                    {formatWallClockDate(session.scheduled_at)} at {formatWallClockTime(session.scheduled_at)}
                                    {isCancelled ? '  ·  Cancelled' : isEnded ? '  ·  Ended' : ''}
                                  </Text>
                                </View>

                                {!isCancelled && (
                                  <View style={styles.sessionActions}>
                                    <Pressable
                                      style={[styles.actionBtn, isEnded && styles.actionBtnDisabled]}
                                      disabled={isEnded}
                                      onPress={() => Linking.openURL(session.meeting_link)}
                                    >
                                      <Feather name="video" size={13} color={isEnded ? colors.gray400 || '#9CA3AF' : colors.primary || '#0D9488'} />
                                    </Pressable>
                                    <Pressable
                                      style={styles.actionBtn}
                                      onPress={() => setAttendanceSession(session)}
                                    >
                                      <Feather name="check-square" size={13} color={colors.primary || '#0D9488'} />
                                    </Pressable>
                                    <Pressable
                                      style={styles.actionBtnDanger}
                                      onPress={() => handleCancelSession(session, week.id)}
                                    >
                                      <Feather name="x" size={13} color="#EF4444" />
                                    </Pressable>
                                  </View>
                                )}
                              </View>
                            );
                          })
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
      </SafeAreaView>

      {/* Modals */}
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

      <CreateLiveSessionModal
        visible={!!sessionModalWeek}
        weekId={sessionModalWeek}
        onClose={() => setSessionModalWeek(null)}
        onCreated={() => {
          const weekId = sessionModalWeek;
          setSessionModalWeek(null);
          refreshWeekContent(weekId);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50 || '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50 || '#F8FAFC',
  },

  /* Dark Ambient Hero Header */
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: colors.primaryDark || '#0F172A',
    overflow: 'hidden',
  },
  ambientGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: colors.primary || '#0D9488',
    opacity: 0.18,
  },
  safeArea: {
    flex: 1,
  },

  /* Top Navigation Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3 || 12,
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space2 || 8,
    paddingBottom: spacing.space3 || 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  topBarTitleWrap: {
    flex: 1,
  },
  topBarSubtitle: {
    fontSize: 10,
    fontWeight: typography.weightBold || '700',
    color: '#2DD4BF',
    letterSpacing: 1.2,
  },
  topBarTitle: {
    fontSize: typography.fontSizeLg || 18,
    fontWeight: typography.weightBold || '700',
    color: '#FFFFFF',
  },

  /* Scroll Content */
  content: {
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space3 || 12,
    paddingBottom: spacing.space10 || 40,
  },

  /* Hero Thumbnail Card */
  heroCard: {
    position: 'relative',
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: spacing.space5 || 20,
    backgroundColor: colors.primaryDark || '#0F172A',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    position: 'absolute',
    bottom: spacing.space4 || 12,
    left: spacing.space4 || 16,
    right: spacing.space4 || 16,
    marginTop: spacing.space2 || 8,
  },
  heroSubject: {
    fontSize: 10,
    fontWeight: typography.weightBold || '700',
    color: '#2DD4BF',
    letterSpacing: 1,
    marginBottom: 2,
  },
  heroTitle: {
    fontSize: typography.fontSizeLg || 18,
    fontWeight: typography.weightBold || '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2 || 8,
  },
  heroStatChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  heroStatText: {
    fontSize: 11,
    fontWeight: typography.weightMedium || '500',
    color: '#FFFFFF',
  },

  /* Section Title */
  sectionHeaderWrap: {
    marginBottom: spacing.space3 || 12,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: typography.weightBold || '700',
    color: colors.gray500 || '#64748B',
    letterSpacing: 1.2,
  },

  /* Week Card Accordion */
  weekCard: {
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: 16,
    marginBottom: spacing.space3 || 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray100 || '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3 || 12,
    padding: spacing.space4 || 16,
  },
  weekIndexBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekIndexText: {
    fontSize: 12,
    fontWeight: typography.weightBold || '700',
    color: colors.primary || '#0D9488',
  },
  weekTitle: {
    flex: 1,
    fontSize: typography.fontSizeSm || 15,
    fontWeight: typography.weightSemibold || '600',
    color: colors.gray900 || '#0F172A',
  },
  expandIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray50 || '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandIconWrapActive: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },

  /* Inner Content */
  weekContent: {
    paddingHorizontal: spacing.space4 || 16,
    paddingBottom: spacing.space4 || 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray100 || '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.space3 || 12,
    marginBottom: spacing.space2 || 8,
  },
  subHeaderLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  subHeaderTitle: {
    fontSize: 11,
    fontWeight: typography.weightBold || '700',
    color: colors.gray600 || '#475569',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.15)',
  },
  addButtonText: {
    fontSize: 11,
    color: '#0D9488',
    fontWeight: typography.weightBold || '700',
  },

  /* Item Rows */
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3 || 12,
    backgroundColor: colors.white || '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.gray100 || '#F1F5F9',
  },
  itemIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconWrapDisabled: {
    backgroundColor: colors.gray100 || '#F1F5F9',
  },
  itemText: {
    flex: 1,
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightMedium || '500',
    color: colors.gray900 || '#0F172A',
  },
  itemTextCancelled: {
    color: colors.gray400 || '#9CA3AF',
    textDecorationLine: 'line-through',
  },

  /* Sessions Rows */
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2 || 8,
    backgroundColor: colors.white || '#FFFFFF',
    padding: 10,
    borderRadius: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: colors.gray100 || '#F1F5F9',
  },
  sessionMeta: {
    fontSize: 11,
    color: colors.gray500 || '#64748B',
    marginTop: 2,
  },
  sessionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDanger: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontSize: 12,
    color: colors.gray400 || '#9CA3AF',
    paddingVertical: spacing.space1 || 4,
    fontStyle: 'italic',
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
});

export default TeacherCourseDetailsScreen;