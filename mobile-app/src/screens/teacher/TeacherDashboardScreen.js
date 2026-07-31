import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses } from '../../api/coursesApi';
import { getUser } from '../../utils/secureStorage';
import { getTeacherAnnouncements } from '../../api/announcementsApi';
import { getLastSeenNotifTime } from '../../utils/secureStorage';

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

function CourseCard({ course, index, onPress }) {
    return (
        <Animated.View entering={FadeInDown.duration(400).delay(index * 70)}>
            <Pressable style={({ pressed }) => [styles.courseCard, pressed && styles.courseCardPressed]} onPress={onPress}>
                <LinearGradient
                    colors={[colors.primaryDark, colors.primary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.courseThumb}
                >
                    <Text style={styles.courseThumbText}>{course.title.charAt(0)}</Text>
                </LinearGradient>

                <View style={styles.courseBody}>
                    <Text style={styles.courseSubject}>{course.subject_name}</Text>
                    <Text style={styles.courseTitle} numberOfLines={2}>{course.title}</Text>

                    <View style={styles.courseMetaRow}>
                        <View style={styles.metaChip}>
                            <Feather name="users" size={11} color={colors.gray500} />
                            <Text style={styles.metaChipText}>{course.enrolled_count} students</Text>
                        </View>
                        <View style={styles.metaChip}>
                            <Feather name="calendar" size={11} color={colors.gray500} />
                            <Text style={styles.metaChipText}>{course.total_weeks} weeks</Text>
                        </View>
                    </View>

                    <View
                        style={[
                            styles.statusBadge,
                            course.status === 'published' ? styles.statusPublished : styles.statusDraft,
                        ]}
                    >
                        <Text
                            style={[
                                styles.statusBadgeText,
                                course.status === 'published' ? styles.statusPublishedText : styles.statusDraftText,
                            ]}
                        >
                            {course.status}
                        </Text>
                    </View>
                </View>

                <Feather name="chevron-right" size={18} color={colors.gray300} />
            </Pressable>
        </Animated.View>
    );
}

function TeacherDashboardScreen() {
    const navigation = useNavigation();
    const [userName, setUserName] = useState('');
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unseenCount, setUnseenCount] = useState(0);

    const loadData = useCallback(async () => {
        try {
            const user = await getUser();
            setUserName(user?.full_name?.split(' ')[0] || 'Teacher');

            const data = await getMyAssignedCourses();
            setCourses(data);

            try {
                const announcements = await getTeacherAnnouncements();
                const lastSeen = await getLastSeenNotifTime();
                const lastSeenTime = lastSeen ? new Date(lastSeen).getTime() : 0;
                const unseen = announcements.filter((a) => new Date(a.created_at).getTime() > lastSeenTime).length;
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

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer} edges={['top']}>
                <ActivityIndicator size="large" color={colors.primary} />
            </SafeAreaView>
        );
    }

    const publishedCount = courses.filter((c) => c.status === 'published').length;
    const totalStudents = courses.reduce((sum, c) => sum + Number(c.enrolled_count), 0);

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
                    <Text style={styles.greetingName}>Ustadh {userName} 👋</Text>

                    <View style={styles.statsRow}>
                        <StatPill icon="book" value={courses.length} label="Courses" />
                        <StatPill icon="check-circle" value={publishedCount} label="Published" />
                        <StatPill icon="users" value={totalStudents} label="Students" />
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

                <View style={styles.sectionHeaderRowSplit}>
                    <View style={styles.sectionHeaderLeft}>
                        <Feather name="book-open" size={16} color={colors.primaryDark} />
                        <Text style={styles.sectionTitle}>My Classes</Text>
                    </View>
                    <Pressable style={styles.announceButton} onPress={() => navigation.navigate('CreateAnnouncement')}>
                        <Feather name="megaphone" size={13} color={colors.primary} />
                        <Text style={styles.announceButtonText}>Announce</Text>
                    </Pressable>
                </View>

                {courses.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <Feather name="inbox" size={22} color={colors.gray300} />
                        <Text style={styles.emptyText}>No courses assigned to you yet.</Text>
                    </View>
                ) : (
                    <View style={styles.coursesList}>
                        {courses.map((course, index) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                index={index}
                                onPress={() => navigation.navigate('TeacherCourseDetails', { courseId: course.id, courseTitle: course.title })}
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
    coursesList: { paddingHorizontal: spacing.space5, gap: spacing.space3 },
    courseCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: spacing.radiusXl,
        padding: spacing.space4, gap: spacing.space3,
        shadowColor: colors.gray900, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3,
    },
    sectionHeaderRowSplit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.space5, marginTop: spacing.space6, marginBottom: spacing.space3 },
sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2 },
announceButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.accentLight, paddingHorizontal: spacing.space3, paddingVertical: 5, borderRadius: spacing.radiusFull },
announceButtonText: { fontSize: 11, color: colors.primaryDark, fontWeight: typography.weightMedium },
    courseCardPressed: { opacity: 0.9 },
    courseThumb: { width: 60, height: 60, borderRadius: spacing.radiusLg, alignItems: 'center', justifyContent: 'center' },
    courseThumbText: { color: colors.white, fontSize: typography.fontSizeXl, fontWeight: typography.weightBold },
    courseBody: { flex: 1, gap: 4 },
    courseSubject: { fontSize: 10, fontWeight: typography.weightSemibold, color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.5 },
    courseTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightBold, color: colors.gray900, lineHeight: 18 },
    courseMetaRow: { flexDirection: 'row', gap: spacing.space2, marginTop: 2 },
    metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.gray100, paddingHorizontal: spacing.space2, paddingVertical: 2, borderRadius: spacing.radiusFull },
    metaChipText: { fontSize: 10, color: colors.gray600 },
    statusBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.space2, paddingVertical: 2, borderRadius: spacing.radiusFull, marginTop: 2 },
    statusPublished: { backgroundColor: 'rgba(46,125,50,0.1)' },
    statusDraft: { backgroundColor: colors.gray100 },
    statusBadgeText: { fontSize: 10, fontWeight: typography.weightMedium, textTransform: 'capitalize' },
    statusPublishedText: { color: colors.success },
    statusDraftText: { color: colors.gray500 },
    notifCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4, marginHorizontal: spacing.space5, marginTop: spacing.space4, shadowColor: colors.gray900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    notifIconWrap: { position: 'relative' },
    notifBadge: { position: 'absolute', top: -4, right: -6, minWidth: 16, height: 16, borderRadius: spacing.radiusFull, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
    notifBadgeText: { color: colors.white, fontSize: 9, fontWeight: typography.weightBold },
    notifCardText: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray900, fontWeight: typography.weightMedium },
});

export default TeacherDashboardScreen;