import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getCourseById } from '../../api/coursesApi';
import { getFileUrl } from '../../api/urls';
import { getWeeksByCourse } from '../../api/weeksApi';
import { getLecturesByWeek } from '../../api/lecturesApi';
import { getMyEnrollments } from '../../api/enrollmentsApi';
import { getSessionsByWeek } from '../../api/liveSessionsApi';
import EnrollModal from './EnrollModal';
import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';
// import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CourseDetailsScreen({ route, navigation }) {
  const { courseId, courseTitle, targetWeekId } = route.params;
  const [course, setCourse] = useState(null);
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [lecturesByWeek, setLecturesByWeek] = useState({});
  const [loadingWeekId, setLoadingWeekId] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
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

  async function toggleWeek(weekId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

    if (expandedWeek === weekId) {
      setExpandedWeek(null);
      return;
    }
    setExpandedWeek(weekId);

    if (!isEnrolled) return;

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
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Feather name="chevron-left" size={24} color={colors.gray800 || '#1F2937'} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {courseTitle || course?.title}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroThumbnailContainer}>
            {course?.thumbnail ? (
              <Image source={{ uri: getFileUrl(course.thumbnail) }} style={styles.heroThumbnail} />
            ) : (
              <LinearGradient
                colors={['#0F172A', colors.primary || '#0D9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroFallback}
              >
                <Text style={styles.heroFallbackText}>
                  {course?.title ? course.title.charAt(0) : 'C'}
                </Text>
              </LinearGradient>
            )}

            {course?.subject_name && (
              <View style={styles.subjectBadge}>
                <Text style={styles.subjectTag}>{course.subject_name}</Text>
              </View>
            )}
          </View>

          <Text style={styles.courseTitle}>{course?.title}</Text>
          {course?.description ? (
            <Text style={styles.courseDesc}>{course.description}</Text>
          ) : null}

          {/* Meta Information Grid */}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <View style={styles.metaIconWrap}>
                <Feather name="user" size={14} color={colors.primary || '#0D9488'} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Instructor</Text>
                <Text style={styles.metaValue}>{course?.teacher_name || 'Academic Faculty'}</Text>
              </View>
            </View>

            <View style={styles.metaDivider} />

            <View style={styles.metaItem}>
              <View style={styles.metaIconWrap}>
                <Feather name="calendar" size={14} color={colors.primary || '#0D9488'} />
              </View>
              <View>
                <Text style={styles.metaLabel}>Duration</Text>
                <Text style={styles.metaValue}>{course?.total_weeks || 0} Weeks</Text>
              </View>
            </View>
          </View>

          {/* Dynamic Action Button / Banner */}
          {!isEnrolled ? (
            <Pressable
              style={({ pressed }) => [styles.enrollButton, pressed && styles.pressed]}
              onPress={() => setEnrollModalVisible(true)}
            >
              <Feather name="plus-circle" size={18} color="#FFFFFF" />
              <Text style={styles.enrollButtonText}>Enroll In Course</Text>
            </Pressable>
          ) : (
            <View style={styles.enrolledBanner}>
              <Feather name="check-circle" size={18} color={colors.success || '#059669'} />
              <Text style={styles.enrolledBannerText}>Enrolled & Active</Text>
            </View>
          )}
        </View>

        {/* Course Syllabus & Content */}
        <Text style={styles.sectionTitle}>ACADEMIC SYLLABUS</Text>

        {weeks.map((week, idx) => {
          const isExpanded = expandedWeek === week.id;
          const weekLectures = lecturesByWeek[week.id];
          const weekSessions = sessionsByWeek[week.id] || [];

          return (
            <View key={week.id} style={styles.weekCard}>
              <Pressable
                style={styles.weekHeader}
                onPress={() => toggleWeek(week.id)}
              >
                <View style={styles.weekNumberBadge}>
                  <Text style={styles.weekNumberText}>W{idx + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.weekTitle}>{week.title}</Text>
                  <Text style={styles.weekSubtitle}>
                    {isEnrolled
                      ? `${weekLectures?.length ?? 0} Lectures • ${weekSessions.length} Sessions`
                      : 'Enroll to view contents'}
                  </Text>
                </View>

                <View style={styles.chevronWrap}>
                  <Feather
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.gray500 || '#6B7280'}
                  />
                </View>
              </Pressable>

              {isExpanded && (
                <View style={styles.expandedContent}>
                  {/* Lock Screen for Guest Users */}
                  {!isEnrolled ? (
                    <View style={styles.lockedBox}>
                      <View style={styles.lockIconCircle}>
                        <Feather name="lock" size={22} color={colors.primary || '#0D9488'} />
                      </View>
                      <Text style={styles.lockedTitle}>Syllabus Protected</Text>
                      <Text style={styles.lockedText}>
                        Enroll in this course to gain complete access to weekly lectures, assignments, and live interactive sessions.
                      </Text>
                      <Pressable
                        style={({ pressed }) => [styles.lockedEnrollBtn, pressed && styles.pressed]}
                        onPress={() => setEnrollModalVisible(true)}
                      >
                        <Text style={styles.lockedEnrollBtnText}>Enroll Now</Text>
                      </Pressable>
                    </View>
                  ) : loadingWeekId === week.id ? (
                    <ActivityIndicator size="small" color={colors.primary || '#0D9488'} style={{ paddingVertical: 20 }} />
                  ) : (
                    <>
                     {/* Live Sessions Section */}
                      {weekSessions.length > 0 && (
                        <View style={styles.sessionsSection}>
                          <Text style={styles.subSectionTitle}>LIVE INTERACTIVE SESSIONS</Text>
                          {weekSessions.map((session) => {
                            const isLive = session.computed_status === 'live';
                            const isEnded = session.computed_status === 'ended' || session.computed_status === 'cancelled';

                            return (
                              <Pressable
                                key={session.id}
                                style={({ pressed }) => [
                                  styles.sessionRow,
                                  pressed && !isEnded && styles.pressed,
                                  isEnded && styles.sessionRowDisabled,
                                ]}
                                disabled={isEnded}
                                onPress={() => Linking.openURL(session.meeting_link)}
                              >
                                <View style={styles.sessionIconWrap}>
                                  <Feather name="radio" size={16} color={isEnded ? colors.gray400 || '#9CA3AF' : colors.primary || '#0D9488'} />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.sessionRowTitle}>{session.title}</Text>
                                  <Text style={styles.sessionRowMeta}>
                                    {formatWallClockDate(session.scheduled_at)} at {formatWallClockTime(session.scheduled_at)}
                                  </Text>
                                </View>

                                {isLive ? (
                                  <View style={styles.joinBadgeLive}>
                                    <View style={styles.livePulseDot} />
                                    <Text style={styles.joinBadgeLiveText}>LIVE</Text>
                                  </View>
                                ) : isEnded ? (
                                  <View style={styles.joinBadgeEnded}>
                                    <Text style={styles.joinBadgeEndedText}>Ended</Text>
                                  </View>
                                ) : (
                                  <View style={styles.joinBadgeScheduled}>
                                    <Feather name="external-link" size={12} color={colors.primary || '#0D9488'} />
                                    <Text style={styles.scheduledText}>Join</Text>
                                  </View>
                                )}
                              </Pressable>
                            );
                          })}
                        </View>
                      )}

                      {/* On-Demand Lectures List */}
                      <View style={styles.lecturesSection}>
                        <Text style={styles.subSectionTitle}>LECTURES & RECORDINGS</Text>
                        {weekLectures?.length > 0 ? (
                          weekLectures.map((lecture) => (
                            <Pressable
                              key={lecture.id}
                              style={({ pressed }) => [styles.lectureRow, pressed && styles.pressed]}
                              onPress={() => navigation.navigate('LecturePlayer', { lecture })}
                            >
                              <View
                                style={[
                                  styles.lectureIconWrap,
                                  !lecture.video_url && styles.lectureIconWrapDisabled,
                                ]}
                              >
                                <Feather
                                  name={lecture.video_url ? 'play' : 'file-text'}
                                  size={14}
                                  color={lecture.video_url ? colors.primary || '#0D9488' : colors.gray400 || '#9CA3AF'}
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.lectureTitle} numberOfLines={1}>
                                  {lecture.title}
                                </Text>
                                {lecture.duration_minutes ? (
                                  <Text style={styles.lectureDuration}>
                                    {lecture.duration_minutes} min duration
                                  </Text>
                                ) : null}
                              </View>
                              <Feather name="chevron-right" size={16} color={colors.gray400 || '#9CA3AF'} />
                            </Pressable>
                          ))
                        ) : (
                          <Text style={styles.emptyLectures}>No recorded lectures added for this week yet.</Text>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Enrollment Modal */}
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
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  /* Top Navigation Bar */
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
    maxWidth: '75%',
  },
  headerSpacer: {
    width: 32,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  /* Hero Banner Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  heroThumbnailContainer: {
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  heroThumbnail: {
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroFallbackText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  subjectBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  subjectTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  courseTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.gray900 || '#111827',
    lineHeight: 26,
    marginBottom: 8,
  },
  courseDesc: {
    fontSize: 13,
    color: colors.gray600 || '#4B5563',
    lineHeight: 20,
    marginBottom: 16,
  },

  /* Instructor & Duration Metadata Grid */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50 || '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.gray100 || '#F3F4F6',
    marginBottom: 16,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaLabel: {
    fontSize: 10,
    color: colors.gray400 || '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray800 || '#1F2937',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.gray200 || '#E5E7EB',
    marginHorizontal: 12,
  },

  /* Action Buttons */
  enrollButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary || '#0D9488',
    borderRadius: 14,
    paddingVertical: 14,
    shadowColor: colors.primary || '#0D9488',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  enrollButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  enrolledBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accentLight || '#ECFDF5',
    borderRadius: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  enrolledBannerText: {
    color: colors.success || '#059669',
    fontSize: 13,
    fontWeight: '700',
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },

  /* Weekly Accordion Cards */
  weekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  weekNumberBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.gray700 || '#374151',
  },
  weekTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
  },
  weekSubtitle: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  chevronWrap: {
    padding: 4,
  },

  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: colors.gray100 || '#F3F4F6',
    backgroundColor: colors.gray50 || '#F9FAFB',
    padding: 14,
  },

  /* Locked Weekly Screen */
  lockedBox: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  lockIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  lockedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
    marginBottom: 4,
  },
  lockedText: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  lockedEnrollBtn: {
    backgroundColor: colors.primary || '#0D9488',
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  lockedEnrollBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Sub Section Headers */
  subSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 0.8,
    marginBottom: 10,
  },

  /* Live Sessions */
  sessionsSection: {
    marginBottom: 16,
  },
  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    marginBottom: 8,
  },
  sessionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionRowTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray900 || '#111827',
  },
  sessionRowMeta: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  joinBadgeLive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  joinBadgeLiveText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: '800',
  },
  joinBadgeScheduled: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  scheduledText: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    fontWeight: '700',
  },

  /* Lecture List */
  lecturesSection: {},
  lectureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    marginBottom: 8,
  },
  lectureIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lectureIconWrapDisabled: {
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  lectureTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.gray900 || '#111827',
  },
  lectureDuration: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  emptyLectures: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
    paddingVertical: 8,
    fontStyle: 'italic',
  },

  pressed: {
    opacity: 0.8,
  },
  sessionRowDisabled: { opacity: 0.5 },
  joinBadgeEnded: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  joinBadgeEndedText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '700',
  },
  sessionRowDisabled: {
    opacity: 0.5,
  },
});