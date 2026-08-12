import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getMyAssignedCourses } from '../../api/coursesApi';
import { getUser, getLastSeenNotifTime } from '../../utils/secureStorage';
import { getTeacherAnnouncements } from '../../api/announcementsApi';
import { getMyUpcomingSessionsTeacher } from '../../api/liveSessionsApi';
import { getMyMissingVideoLectures } from '../../api/lecturesApi';
import { getFileUrl } from '../../api/urls';
import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';
function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <View style={styles.statIconWrap}>
        <Feather name={icon} size={14} color={colors.primaryDark || '#0F766E'} />
      </View>
      <View style={styles.statTextWrap}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function SessionCard({ session, index, onPress }) {
  const timeStr = formatWallClockTime(session.scheduled_at);
  const dateStr = formatWallClockDate(session.scheduled_at);
  const isLive = session.computed_status === 'live';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
      <Pressable
        style={({ pressed }) => [styles.sessionCard, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <View style={styles.sessionDateBox}>
          <Text style={styles.sessionDateText}>{dateStr}</Text>
          <Text style={styles.sessionTimeText}>{timeStr}</Text>
        </View>

        <View style={styles.sessionInfo}>
          <Text style={styles.sessionTitle} numberOfLines={1}>
            {session.title}
          </Text>
          <Text style={styles.sessionCourse} numberOfLines={1}>
            {session.course_title}
          </Text>
        </View>

        {isLive ? (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        ) : (
          <Feather name="chevron-right" size={16} color={colors.gray400 || '#9CA3AF'} />
        )}
      </Pressable>
    </Animated.View>
  );
}

function CourseCard({ course, index, onPress }) {
  const isPublished = course.status === 'published';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 70)}>
      <Pressable
        style={({ pressed }) => [styles.courseCard, pressed && styles.cardPressed]}
        onPress={onPress}
      >
        <View style={styles.courseThumb}>
          {course.thumbnail ? (
            <Image source={{ uri: getFileUrl(course.thumbnail) }} style={styles.courseThumbImage} />
          ) : (
            <LinearGradient
              colors={['#0F172A', colors.primaryDark || '#0F766E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.courseThumbInner}
            >
              <Text style={styles.courseThumbText}>{course.title ? course.title.charAt(0) : 'C'}</Text>
            </LinearGradient>
          )}
        </View>

        <View style={styles.courseBody}>
          <View style={styles.courseHeaderRow}>
            <Text style={styles.courseSubject}>{course.subject_name || 'General'}</Text>
            <View style={[styles.statusBadge, isPublished ? styles.statusPublished : styles.statusDraft]}>
              <Text style={[styles.statusBadgeText, isPublished ? styles.statusPublishedText : styles.statusDraftText]}>
                {course.status}
              </Text>
            </View>
          </View>

          <Text style={styles.courseTitle} numberOfLines={2}>
            {course.title}
          </Text>

          <View style={styles.courseMetaRow}>
            <Feather name="users" size={12} color={colors.gray400 || '#9CA3AF'} style={styles.inlineIcon} />
            <Text style={styles.metaChipText}>{course.enrolled_count || 0} Students</Text>
            <View style={styles.metaDivider} />
            <Feather name="calendar" size={12} color={colors.gray400 || '#9CA3AF'} style={styles.inlineIcon} />
            <Text style={styles.metaChipText}>{course.total_weeks || 0}w</Text>
          </View>
        </View>

        <Feather name="chevron-right" size={18} color={colors.gray300 || '#D1D5DB'} />
      </Pressable>
    </Animated.View>
  );
}

export default function TeacherDashboardScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [courses, setCourses] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [missingVideos, setMissingVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unseenCount, setUnseenCount] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const user = await getUser();
      setUserName(user?.full_name?.split(' ')[0] || 'Teacher');

      const data = await getMyAssignedCourses();
      setCourses(data || []);

      try {
        const sessions = await getMyUpcomingSessionsTeacher();
        setUpcomingSessions(sessions || []);
      } catch (sessionErr) {
        console.error('Failed to load upcoming sessions:', sessionErr);
      }

      try {
        const missing = await getMyMissingVideoLectures();
        setMissingVideos(missing || []);
      } catch (missingErr) {
        console.error('Failed to load missing-video lectures:', missingErr);
      }

      try {
        const announcements = await getTeacherAnnouncements();
        const lastSeen = await getLastSeenNotifTime();
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        const unseen = announcements.filter(
          (a) => new Date(a.created_at).getTime() > lastSeenTime
        ).length;
        setUnseenCount(unseen);
      } catch (notifErr) {
        console.error('Failed to check notifications:', notifErr);
      }
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  function onRefresh() {
    setRefreshing(true);
    loadData();
  }

  function openCourse(course) {
    navigation.navigate('TeacherCourseDetails', { courseId: course.id, courseTitle: course.title });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} />
      </SafeAreaView>
    );
  }

  const publishedCount = courses.filter((c) => c.status === 'published').length;
  const totalStudents = courses.reduce((sum, c) => sum + Number(c.enrolled_count || 0), 0);
  const recentCourses = courses.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || '#0D9488']}
            tintColor={colors.primary || '#0D9488'}
          />
        }
      >
        {/* Academic Header Hero Card */}
        <LinearGradient
          colors={['#0F172A', colors.primaryDark || '#0F766E']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.greeting}>Assalamu Alaikum,</Text>
              <Text style={styles.greetingName}>Ustadh {userName} 👋</Text>
            </View>

            {/* Notification Bell Icon */}
            <Pressable
              style={styles.headerNotifBtn}
              onPress={() => navigation.navigate('MyAnnouncements')}
            >
              <Feather name="bell" size={18} color="#FFFFFF" />
              {unseenCount > 0 && <View style={styles.headerNotifDot} />}
            </Pressable>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <StatPill icon="book-open" value={courses.length} label="Courses" />
            <StatPill icon="check-circle" value={publishedCount} label="Published" />
            <StatPill icon="users" value={totalStudents} label="Students" />
          </View>
        </LinearGradient>

        {/* Announcement Banner */}
        <Pressable
          style={({ pressed }) => [styles.notifCard, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate('MyAnnouncements')}
        >
          <View style={styles.notifIconWrap}>
            <Feather name="volume-2" size={16} color={colors.primary || '#0D9488'} />
            {unseenCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>
                  {unseenCount > 9 ? '9+' : unseenCount}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.notifCardText}>
            {unseenCount > 0
              ? `${unseenCount} new academic announcement${unseenCount > 1 ? 's' : ''}`
              : 'No new announcements'}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.gray400 || '#9CA3AF'} />
        </Pressable>

        {/* Action Needed Banner */}
        {missingVideos.length > 0 && (
          <View style={styles.attentionCard}>
            <View style={styles.attentionHeader}>
              <View style={styles.attentionIconWrap}>
                <Feather name="alert-circle" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.attentionTitle}>Action Required</Text>
                <Text style={styles.attentionSubtitle}>
                  {missingVideos.length} lecture{missingVideos.length > 1 ? 's' : ''} awaiting video upload
                </Text>
              </View>
            </View>
            {missingVideos.slice(0, 3).map((lecture) => (
              <Pressable
                key={lecture.id}
                style={styles.attentionRow}
                onPress={() =>
                  navigation.navigate('TeacherCourseDetails', {
                    courseId: lecture.course_id,
                    courseTitle: lecture.course_title,
                  })
                }
              >
                <Feather name="video-off" size={14} color={colors.gray400 || '#9CA3AF'} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.attentionRowTitle} numberOfLines={1}>
                    {lecture.lecture_title}
                  </Text>
                  <Text style={styles.attentionRowMeta} numberOfLines={1}>
                    {lecture.course_title} • {lecture.week_title}
                  </Text>
                </View>
                <Feather name="chevron-right" size={14} color={colors.gray300 || '#D1D5DB'} />
              </Pressable>
            ))}
          </View>
        )}

        {/* Upcoming Live Sessions Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>UPCOMING LIVE SESSIONS</Text>
        </View>

        {upcomingSessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={20} color={colors.gray400 || '#9CA3AF'} />
            <Text style={styles.emptyText}>No upcoming live sessions scheduled right now.</Text>
          </View>
        ) : (
          upcomingSessions.map((session, index) => (
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              onPress={() =>
                navigation.navigate('TeacherCourseDetails', {
                  courseId: session.course_id,
                  courseTitle: session.course_title,
                })
              }
            />
          ))
        )}

        {/* My Classes Section Header with Right-Aligned Action Buttons */}
        <View style={styles.sectionHeaderRowSplit}>
          <Text style={styles.sectionTitle}>MY CLASSES</Text>
          <View style={styles.actionButtonGroup}>
            <Pressable
              style={styles.announceButton}
              onPress={() => navigation.navigate('CreateAnnouncement')}
            >
              <Feather name="plus-circle" size={13} color={colors.primaryDark || '#0F766E'} />
              <Text style={styles.announceButtonText}>Post Notice</Text>
            </Pressable>
            {courses.length > 3 && (
              <Pressable style={styles.viewAllButton} onPress={() => navigation.navigate('My Classes')}>
                <Text style={styles.viewAllButtonText}>View All</Text>
                <Feather name="arrow-right" size={12} color="#475569" />
              </Pressable>
            )}
          </View>
        </View>

        {courses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={20} color={colors.gray400 || '#9CA3AF'} />
            <Text style={styles.emptyText}>No assigned classes available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.coursesList}>
            {recentCourses.map((course, index) => (
              <CourseCard
                key={course.id}
                course={course}
                index={index}
                onPress={() => openCourse(course)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0F172A' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { paddingBottom: 40 },

  /* Top Academic Hero Card */
  headerCard: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  greeting: {
    fontSize: typography.fontSizeXs || 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  greetingName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  headerNotifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerNotifDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.error || '#EF4444',
  },

  /* Stat Pills Bar */
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextWrap: {
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 16,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 1,
  },

  /* Notification Banner */
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  notifIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error || '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  notifBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  notifCardText: {
    flex: 1,
    fontSize: 12,
    color: colors.gray800 || '#1F2937',
    fontWeight: '600',
  },

  /* Section Header & Split Actions */
  sectionHeaderRow: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRowSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 0.8,
  },
  actionButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  announceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  announceButtonText: {
    fontSize: 11,
    color: colors.primaryDark || '#0F766E',
    fontWeight: '700',
    lineHeight: 14,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  viewAllButtonText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    lineHeight: 14,
  },

  /* Action Needed Banner */
  attentionCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 8,
    gap: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  attentionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  attentionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionTitle: { fontSize: 13, fontWeight: '700', color: '#92400E' },
  attentionSubtitle: { fontSize: 11, color: '#B45309', marginTop: 1 },
  attentionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#FEF3C7',
  },
  attentionRowTitle: { fontSize: 12, fontWeight: '600', color: '#78350F' },
  attentionRowMeta: { fontSize: 10, color: '#B45309', marginTop: 1 },

  /* Empty State Placeholder */
  emptyBox: {
    backgroundColor: colors.gray50 || '#F9FAFB',
    borderRadius: 14,
    padding: 20,
    marginHorizontal: 20,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyText: {
    color: colors.gray500 || '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },

  /* Live Session Cards */
  sessionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  sessionDateBox: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  sessionDateText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary || '#0D9488',
  },
  sessionTimeText: {
    fontSize: 10,
    color: colors.primary || '#0D9488',
    fontWeight: '600',
    marginTop: 1,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
  },
  sessionCourse: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* Course Cards */
  coursesList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  courseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  courseThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  courseThumbInner: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseThumbImage: {
    width: '100%',
    height: '100%',
  },
  courseThumbText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  courseBody: { flex: 1 },
  courseHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseSubject: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary || '#0D9488',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
    marginTop: 2,
    lineHeight: 18,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  inlineIcon: {
    alignSelf: 'center',
  },
  metaChipText: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    lineHeight: 14,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.gray200 || '#E5E7EB',
    marginHorizontal: 4,
  },

  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPublished: { backgroundColor: '#DCFCE7' },
  statusDraft: { backgroundColor: '#F1F5F9' },
  statusBadgeText: { fontSize: 9, fontWeight: '800', textTransform: 'uppercase' },
  statusPublishedText: { color: '#166534' },
  statusDraftText: { color: '#64748B' },

  cardPressed: {
    opacity: 0.85,
  },
});