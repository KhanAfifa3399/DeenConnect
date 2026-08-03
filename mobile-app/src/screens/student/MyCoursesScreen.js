import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyEnrollments } from '../../api/enrollmentsApi';
import { getFileUrl } from '../../api/urls';

function MyCoursesScreen({ navigation }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await getMyEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEnrollments();
  }, [loadEnrollments]);

  function onRefresh() {
    setRefreshing(true);
    loadEnrollments();
  }

  function renderCourse({ item, index }) {
    const statusColor = item.status === 'completed' ? colors.success : item.status === 'dropped' ? colors.error : colors.primary;

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 70)}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => navigation.navigate('CourseDetails', { courseId: item.course_id, courseTitle: item.course_title })}
        >
          <View style={styles.browseThumb}>
            <View style={styles.browseThumbInner}>
              {item.thumbnail ? (
                <Image source={{ uri: getFileUrl(item.thumbnail) }} style={styles.browseThumbImage} />
              ) : (
                <LinearGradient
                  colors={[colors.primaryDark, colors.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.browseThumbInner}
                >
                  <Text style={styles.browseThumbText}>{item.course_title ? item.course_title.charAt(0) : 'C'}</Text>
                </LinearGradient>
              )}
            </View>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.cardTopRow}>
              <Text style={styles.cardTitle} numberOfLines={2}>{item.course_title}</Text>
              <Feather name="chevron-right" size={18} color={colors.gray300} />
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Feather name="calendar" size={11} color={colors.gray500} />
                <Text style={styles.metaChipText}>{item.total_weeks} weeks</Text>
              </View>
              <View style={[styles.metaChip, { backgroundColor: `${statusColor}1A` }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                <Text style={[styles.metaChipText, { color: statusColor, textTransform: 'capitalize' }]}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${item.progress_percentage}%`, backgroundColor: statusColor }]} />
              </View>
              <Text style={styles.progressPercent}>{item.progress_percentage}%</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
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
      <Text style={styles.header}>My Courses</Text>
      <FlatList
        data={enrollments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => renderCourse({ item, index })}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={24} color={colors.gray300} />
            <Text style={styles.emptyText}>You're not enrolled in any courses yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  header: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
    paddingHorizontal: spacing.space5,
    paddingTop: spacing.space4,
    paddingBottom: spacing.space3,
  },
  listContent: { paddingHorizontal: spacing.space5, paddingBottom: spacing.space10 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.radiusXl,
    padding: spacing.space4,
    marginBottom: spacing.space4,
    gap: spacing.space4,
    shadowColor: colors.gray900,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  browseThumb: {
    width: 68,
    height: 68,
    borderRadius: spacing.radiusLg,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: colors.gray100,
  },
  browseThumbInner: {
    width: '100%',
    height: '100%',
    borderRadius: spacing.radiusLg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseThumbImage: { width: '100%', height: '100%' },
  browseThumbText: { color: colors.white, fontSize: typography.fontSize2xl, fontWeight: typography.weightBold },
  cardBody: { flex: 1, justifyContent: 'center', gap: spacing.space2 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.space2 },
  cardTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900, lineHeight: 20 },
  metaRow: { flexDirection: 'row', gap: spacing.space2 },
  metaChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.gray100, paddingHorizontal: spacing.space2, paddingVertical: 3,
    borderRadius: spacing.radiusFull,
  },
  metaChipText: { fontSize: 11, color: colors.gray600, fontWeight: typography.weightMedium },
  statusDot: { width: 6, height: 6, borderRadius: spacing.radiusFull },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, marginTop: spacing.space1 },
  progressTrack: { flex: 1, height: 7, backgroundColor: colors.gray100, borderRadius: spacing.radiusFull, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: spacing.radiusFull },
  progressPercent: { fontSize: 11, fontWeight: typography.weightSemibold, color: colors.gray600, minWidth: 30, textAlign: 'right' },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm },
});

export default MyCoursesScreen;