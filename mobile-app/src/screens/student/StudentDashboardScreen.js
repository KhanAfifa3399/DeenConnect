import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyEnrollments } from '../../api/enrollmentsApi';
import { getMyUpcomingSessions } from '../../api/liveSessionsApi';
import { getUser } from '../../utils/secureStorage';

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

function ProgressBar({ percentage }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percentage}%` }]} />
    </View>
  );
}

function CourseCard({ enrollment, index }) {
  return (
    <Animated.View entering={FadeInDown.duration(400).delay(index * 80)} style={styles.courseCard}>
      <View style={styles.courseThumb}>
        <Text style={styles.courseThumbText}>{enrollment.course_title.charAt(0)}</Text>
      </View>
      <View style={styles.courseInfo}>
        <Text style={styles.courseTitle} numberOfLines={1}>{enrollment.course_title}</Text>
        <View style={styles.courseMetaRow}>
          <Feather name="calendar" size={11} color={colors.gray500} />
          <Text style={styles.courseWeeks}>{enrollment.total_weeks} weeks</Text>
          <View style={styles.metaDivider} />
          <Feather name={enrollment.status === 'completed' ? 'check-circle' : 'clock'} size={11} color={colors.gray500} />
          <Text style={styles.courseWeeks}>{enrollment.status}</Text>
        </View>
        <ProgressBar percentage={enrollment.progress_percentage} />
        <Text style={styles.progressLabel}>{enrollment.progress_percentage}% complete</Text>
      </View>
    </Animated.View>
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
        <View style={styles.courseMetaRow}>
          <Feather name="book-open" size={11} color={colors.gray500} />
          <Text style={styles.sessionCourse} numberOfLines={1}>{session.course_title}</Text>
        </View>
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

function StudentDashboardScreen() {
  const [userName, setUserName] = useState('');
  const [enrollments, setEnrollments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const user = await getUser();
      setUserName(user?.full_name?.split(' ')[0] || 'Student');

      const [enrollmentsData, sessionsData] = await Promise.all([
        getMyEnrollments(),
        getMyUpcomingSessions(),
      ]);
      setEnrollments(enrollmentsData);
      setSessions(sessionsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function onRefresh() {
    setRefreshing(true);
    loadData();
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const activeCount = enrollments.filter((e) => e.status === 'active').length;
  const completedCount = enrollments.filter((e) => e.status === 'completed').length;

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
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
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
            <StatPill icon="book" value={enrollments.length} label="Courses" />
            <StatPill icon="play-circle" value={activeCount} label="Active" />
            <StatPill icon="award" value={completedCount} label="Completed" />
          </View>
        </LinearGradient>

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
          sessions.map((session, index) => <SessionCard key={session.id} session={session} index={index} />)
        )}

        <View style={styles.sectionHeaderRow}>
          <Feather name="book-open" size={16} color={colors.primaryDark} />
          <Text style={styles.sectionTitle}>My Courses</Text>
        </View>
        {enrollments.length === 0 ? (
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={22} color={colors.gray300} />
            <Text style={styles.emptyText}>You're not enrolled in any courses yet.</Text>
          </View>
        ) : (
          enrollments.map((enrollment, index) => (
            <CourseCard key={enrollment.id} enrollment={enrollment} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primaryDark,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray50,
  },
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  content: {
    paddingBottom: spacing.space10,
  },
  headerCard: {
    paddingHorizontal: spacing.space5,
    paddingTop: spacing.space5,
    paddingBottom: spacing.space6,
    borderBottomLeftRadius: spacing.radiusXl,
    borderBottomRightRadius: spacing.radiusXl,
  },
  greeting: {
    fontSize: typography.fontSizeSm,
    color: 'rgba(255,255,255,0.75)',
  },
  greetingName: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.weightBold,
    color: colors.white,
    marginBottom: spacing.space5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: spacing.radiusLg,
    padding: spacing.space3,
    alignItems: 'center',
  },
  statIconWrap: {
    width: 30,
    height: 30,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space2,
  },
  statValue: {
    fontSize: typography.fontSizeLg,
    fontWeight: typography.weightBold,
    color: colors.white,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2,
    paddingHorizontal: spacing.space5,
    marginTop: spacing.space6,
    marginBottom: spacing.space3,
  },
  sectionTitle: {
    fontSize: typography.fontSizeBase,
    fontWeight: typography.weightSemibold,
    color: colors.gray900,
  },
  emptyBox: {
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.space6,
    marginHorizontal: spacing.space5,
    alignItems: 'center',
    gap: spacing.space2,
  },
  emptyText: {
    color: colors.gray500,
    fontSize: typography.fontSizeSm,
    textAlign: 'center',
  },
  courseCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.space4,
    marginHorizontal: spacing.space5,
    marginBottom: spacing.space3,
    gap: spacing.space3,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  courseThumb: {
    width: 56,
    height: 56,
    borderRadius: spacing.radiusMd,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseThumbText: {
    color: colors.white,
    fontSize: typography.fontSizeLg,
    fontWeight: typography.weightBold,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  courseTitle: {
    fontSize: typography.fontSizeBase,
    fontWeight: typography.weightSemibold,
    color: colors.gray900,
  },
  courseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    marginBottom: spacing.space2,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.gray200,
    marginHorizontal: 2,
  },
  courseWeeks: {
    fontSize: typography.fontSizeXs,
    color: colors.gray500,
    textTransform: 'capitalize',
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.gray100,
    borderRadius: spacing.radiusFull,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: spacing.radiusFull,
  },
  progressLabel: {
    fontSize: typography.fontSizeXs,
    color: colors.gray500,
    marginTop: spacing.space1,
  },
  sessionCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusLg,
    padding: spacing.space4,
    marginHorizontal: spacing.space5,
    marginBottom: spacing.space3,
    gap: spacing.space4,
    alignItems: 'center',
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sessionDateBox: {
    backgroundColor: colors.accentLight,
    borderRadius: spacing.radiusMd,
    paddingVertical: spacing.space2,
    paddingHorizontal: spacing.space3,
    alignItems: 'center',
    minWidth: 64,
  },
  sessionDateText: {
    fontSize: typography.fontSizeXs,
    fontWeight: typography.weightSemibold,
    color: colors.primaryDark,
  },
  sessionTimeText: {
    fontSize: typography.fontSizeXs,
    color: colors.primaryDark,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: typography.fontSizeSm,
    fontWeight: typography.weightSemibold,
    color: colors.gray900,
  },
  sessionCourse: {
    fontSize: typography.fontSizeXs,
    color: colors.gray500,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(211,47,47,0.1)',
    paddingHorizontal: spacing.space2,
    paddingVertical: 4,
    borderRadius: spacing.radiusFull,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.error,
  },
  liveText: {
    fontSize: 9,
    fontWeight: typography.weightBold,
    color: colors.error,
  },
});

export default StudentDashboardScreen;