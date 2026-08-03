import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getAllCourses } from '../../api/coursesApi';
import { getMyEnrollments } from '../../api/enrollmentsApi';
import { getMyUpcomingSessions } from '../../api/liveSessionsApi';
import { getStudentAnnouncements } from '../../api/announcementsApi';
import { getUser, getLastSeenNotifTime } from '../../utils/secureStorage';
import { getFileUrl } from '../../api/urls';
import { formatWallClockDate, formatWallClockTime } from '../../utils/formatDateTime';


function StatPill({ icon, value, label }) {
  return (
    <View style={styles.statPill}>
      <View style={styles.statIconWrap}>
        <Feather name={icon} size={16} color={colors.primaryDark} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SessionCard({ session, index }) {
  const date = new Date(session.scheduled_at);
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  const isLive = session.status === 'ongoing';

  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 80)} style={styles.sessionCard}>
      <View style={styles.sessionDateBox}>
        <Text style={styles.sessionDateText}>{dateStr}</Text>
        <Text style={styles.sessionTimeText}>{timeStr}</Text>
      </View>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
        <Text style={styles.sessionCourse} numberOfLines={1}>{session.course_title}</Text>
      </View>
      {isLive && (
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      )}
    </Animated.View>
  );
}

function CourseBrowseCard({ course, index, isEnrolled, onPress }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 70)}>
      <Pressable style={({ pressed }) => [styles.browseCard, pressed && styles.browseCardPressed]} onPress={onPress}>
        <View style={styles.browseThumb}>
          <View style={styles.browseThumbInner}>
            {course.thumbnail ? (
              <Image source={{ uri: getFileUrl(course.thumbnail) }} style={styles.browseThumbImage} />
            ) : (
              <LinearGradient
                colors={[colors.primaryDark, colors.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.browseThumbInner}
              >
                <Text style={styles.browseThumbText}>{course.title.charAt(0)}</Text>
              </LinearGradient>
            )}
          </View>

          {isEnrolled && (
            <View style={styles.enrolledPill}>
              <Feather name="check" size={10} color={colors.white} />
            </View>
          )}
        </View>

        <View style={styles.browseBody}>
          <Text style={styles.browseSubject}>{course.subject_name}</Text>
          <Text style={styles.browseTitle} numberOfLines={2}>{course.title}</Text>
          {/* ... rest of your component */}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function StudentDashboardScreen() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('');
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [sessions, setSessions] = useState([]);
  const [unseenCount, setUnseenCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getUser();
      setUserName(user?.full_name?.split(' ')[0] || 'Student');

      const [allCourses, enrollments, sessionsData] = await Promise.all([
        getAllCourses(),
        getMyEnrollments(),
        getMyUpcomingSessions(),
      ]);

      setCourses(allCourses.filter((c) => c.status === 'published'));
      setEnrolledIds(new Set(enrollments.map((e) => e.course_id)));
      setSessions(sessionsData);

      try {
        const announcements = await getStudentAnnouncements();
        const lastSeen = await getLastSeenNotifTime();
        const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
        const unseen = announcements.filter((a) => new Date(a.created_at).getTime() > lastSeenTime).length;
        setUnseenCount(unseen);
      } catch (notifErr) {
        console.error('Failed to check notifications:', notifErr);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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
    navigation.navigate('CourseDetails', { courseId: course.id, courseTitle: course.title });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  function SessionCard({ session, index, onPress }) {
    const date = new Date(session.scheduled_at);
    const timeStr = formatWallClockTime(session.scheduled_at);
const dateStr = formatWallClockDate(session.scheduled_at);
    const isLive = session.status === 'ongoing';

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 80)}>
        <Pressable style={({ pressed }) => [styles.sessionCard, pressed && { opacity: 0.9 }]} onPress={onPress}>
          <View style={styles.sessionDateBox}>
            <Text style={styles.sessionDateText}>{dateStr}</Text>
            <Text style={styles.sessionTimeText}>{timeStr}</Text>
          </View>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTitle} numberOfLines={1}>{session.title}</Text>
            <Text style={styles.sessionCourse} numberOfLines={1}>{session.course_title}</Text>
          </View>
          {isLive && (
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          )}
          <Feather name="chevron-right" size={16} color={colors.gray300} />
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        }
      >
        <LinearGradient
          colors={[colors.primaryDark, colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerCard}
        >
          <Text style={styles.greeting}>Assalamu Alaikum,</Text>
          <Text style={styles.greetingName}>{userName} 👋</Text>

          <View style={styles.statsRow}>
            <StatPill icon="book" value={courses.length} label="Courses" />
            <StatPill icon="check-circle" value={enrolledIds.size} label="Enrolled" />
            <StatPill icon="radio" value={sessions.length} label="Live Soon" />
          </View>
        </LinearGradient>

        <Pressable style={styles.notifCard} onPress={() => navigation.navigate('Notifications')}>
          <View style={styles.notifIconWrap}>
            <Feather name="bell" size={18} color={colors.primaryDark} />
            {unseenCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={styles.notifBadgeText}>{unseenCount > 9 ? '9+' : unseenCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.notifCardText}>
            {unseenCount > 0 ? `${unseenCount} new announcement${unseenCount > 1 ? 's' : ''}` : 'No new announcements'}
          </Text>
          <Feather name="chevron-right" size={16} color={colors.gray300} />
        </Pressable>

        <View style={styles.sectionHeaderRow}>
          <Feather name="radio" size={16} color={colors.primaryDark} />
          <Text style={styles.sectionTitle}>Upcoming Live Sessions</Text>
        </View>
        {sessions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="calendar" size={22} color={colors.gray300} />
            <Text style={styles.emptyText}>No upcoming live sessions right now.</Text>
          </View>
        ) : (
          sessions.map((session, index) =>
            <SessionCard
              key={session.id}
              session={session}
              index={index}
              onPress={() =>
                navigation.navigate('CourseDetails', {
                  courseId: session.course_id,
                  courseTitle: session.course_title,
                  targetWeekId: session.week_id,
                })
              }
            />
          ))
        }

        <View style={styles.sectionHeaderRow}>
          <Feather name="compass" size={16} color={colors.primaryDark} />
          <Text style={styles.sectionTitle}>Explore Courses</Text>
        </View>
        {courses.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={22} color={colors.gray300} />
            <Text style={styles.emptyText}>No courses published yet.</Text>
          </View>
        ) : (
          <View style={styles.browseGrid}>
            {courses.map((course, index) => (
              <CourseBrowseCard
                key={course.id}
                course={course}
                index={index}
                isEnrolled={enrolledIds.has(course.id)}
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
  safeArea: { flex: 1, backgroundColor: colors.primaryDark },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  container: { flex: 1, backgroundColor: colors.gray50 },
  content: { paddingBottom: spacing.space10 },
  headerCard: {
    paddingHorizontal: spacing.space5, paddingTop: spacing.space5, paddingBottom: spacing.space6,
    borderBottomLeftRadius: spacing.radiusXl, borderBottomRightRadius: spacing.radiusXl,
  },
  greeting: { fontSize: typography.fontSizeSm, color: 'rgba(255,255,255,0.75)' },
  greetingName: { fontSize: typography.fontSize2xl, fontWeight: typography.weightBold, color: colors.white, marginBottom: spacing.space5 },
  statsRow: { flexDirection: 'row', gap: spacing.space3 },
  statPill: { flex: 1, backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: spacing.radiusLg, padding: spacing.space3, alignItems: 'center' },
  statIconWrap: {
    width: 30, height: 30, borderRadius: spacing.radiusFull, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.space2,
  },
  statValue: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.white },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', marginTop: 1 },
  notifCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4,
    marginHorizontal: spacing.space5, marginTop: spacing.space4,
    shadowColor: colors.gray900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  notifIconWrap: { position: 'relative' },
  notifBadge: {
    position: 'absolute', top: -4, right: -6, minWidth: 16, height: 16, borderRadius: spacing.radiusFull,
    backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3,
  },
  notifBadgeText: { color: colors.white, fontSize: 9, fontWeight: typography.weightBold },
  notifCardText: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray900, fontWeight: typography.weightMedium },
  sectionHeaderRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space2,
    paddingHorizontal: spacing.space5, marginTop: spacing.space6, marginBottom: spacing.space3,
  },
  sectionTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  emptyBox: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space6,
    marginHorizontal: spacing.space5, alignItems: 'center', gap: spacing.space2,
  },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm, textAlign: 'center' },
  sessionCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4,
    marginHorizontal: spacing.space5, marginBottom: spacing.space3, gap: spacing.space4, alignItems: 'center',
    shadowColor: colors.gray900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  sessionDateBox: {
    backgroundColor: colors.accentLight, borderRadius: spacing.radiusMd, paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3, alignItems: 'center', minWidth: 64,
  },
  sessionDateText: { fontSize: typography.fontSizeXs, fontWeight: typography.weightSemibold, color: colors.primaryDark },
  sessionTimeText: { fontSize: typography.fontSizeXs, color: colors.primaryDark },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold, color: colors.gray900 },
  sessionCourse: { fontSize: typography.fontSizeXs, color: colors.gray500 },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(211,47,47,0.1)',
    paddingHorizontal: spacing.space2, paddingVertical: 4, borderRadius: spacing.radiusFull,
  },
  liveDot: { width: 6, height: 6, borderRadius: spacing.radiusFull, backgroundColor: colors.error },
  liveText: { fontSize: 9, fontWeight: typography.weightBold, color: colors.error },
  browseGrid: { paddingHorizontal: spacing.space5, gap: spacing.space4 },
  browseCard: {
    flexDirection: 'row', backgroundColor: colors.white, borderRadius: spacing.radiusXl, padding: spacing.space4, gap: spacing.space3,
    shadowColor: colors.gray900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
  },
  browseCardPressed: { opacity: 0.92 },
 // In StyleSheet.create:
browseThumb: {
  width: 68,
  height: 68,
  borderRadius: spacing.radiusLg,
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  backgroundColor: colors.gray100,
  // Removed overflow: 'hidden' from here
},
browseThumbInner: {
  width: '100%',
  height: '100%',
  borderRadius: spacing.radiusLg,
  overflow: 'hidden', // Keep overflow hidden only for the inner image/gradient
  alignItems: 'center',
  justifyContent: 'center',
},
browseThumbImage: { width: '100%', height: '100%' },
  browseThumbText: { color: colors.white, fontSize: typography.fontSize2xl, fontWeight: typography.weightBold },
  enrolledPill: {
    position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: spacing.radiusFull,
    backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.white,
  },
  browseBody: { flex: 1, gap: 3 },
  browseSubject: { fontSize: 10, fontWeight: typography.weightSemibold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
  browseTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightBold, color: colors.gray900, lineHeight: 18 },
  browseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  browseMetaText: { fontSize: 11, color: colors.gray500, flexShrink: 1 },
  metaDivider: { width: 1, height: 9, backgroundColor: colors.gray200, marginHorizontal: 2 },
  browsePrice: { fontSize: 11, color: colors.primary, fontWeight: typography.weightSemibold },
  browseButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.space1 },
  browseButtonText: { fontSize: 12, fontWeight: typography.weightSemibold, color: colors.primary },
});

export default StudentDashboardScreen;