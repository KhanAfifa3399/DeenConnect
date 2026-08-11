import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getMyEnrollments } from '../../api/enrollmentsApi';
import { getFileUrl } from '../../api/urls';

const TAB_FILTERS = ['All', 'In Progress', 'Completed'];

export default function MyCoursesScreen({ navigation }) {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  const loadEnrollments = useCallback(async () => {
    try {
      const data = await getMyEnrollments();
      setEnrollments(data || []);
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

  const onRefresh = () => {
    setRefreshing(true);
    loadEnrollments();
  };

  // Status Metrics Summary
  const stats = useMemo(() => {
    const total = enrollments.length;
    const active = enrollments.filter((item) => item.status !== 'completed').length;
    const completed = enrollments.filter((item) => item.status === 'completed').length;
    return { total, active, completed };
  }, [enrollments]);

  // Tab Filter Logic
  const filteredEnrollments = useMemo(() => {
    if (activeTab === 'In Progress') {
      return enrollments.filter((item) => item.status !== 'completed');
    }
    if (activeTab === 'Completed') {
      return enrollments.filter((item) => item.status === 'completed');
    }
    return enrollments;
  }, [enrollments, activeTab]);

  function renderHeader() {
    return (
      <View style={styles.headerWrapper}>
        {/* Top Header Row */}
        <View style={styles.topRow}>
          <View>
            <Text style={styles.greetingText}>MY ACADEMICS</Text>
            <Text style={styles.headerTitle}>Enrolled Courses</Text>
          </View>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{stats.total}</Text>
          </View>
        </View>

        {/* Dashboard Stat Banner */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EEF2FF' }]}>
              <Feather name="book-open" size={16} color="#4F46E5" />
            </View>
            <View>
              <Text style={styles.statNumber}>{stats.active}</Text>
              <Text style={styles.statLabel}>In Progress</Text>
            </View>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <View style={[styles.statIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Feather name="award" size={16} color="#059669" />
            </View>
            <View>
              <Text style={styles.statNumber}>{stats.completed}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Status Filter Tabs */}
        <View style={styles.tabContainer}>
          {TAB_FILTERS.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderCourse({ item, index }) {
    const isCompleted = item.status === 'completed';
    const isDropped = item.status === 'dropped';
    const statusColor = isCompleted
      ? colors.success || '#059669'
      : isDropped
      ? colors.error || '#DC2626'
      : colors.primary || '#0D9488';

    return (
      <Animated.View entering={FadeInDown.duration(400).delay(index * 60)}>
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() =>
            navigation.navigate('CourseDetails', {
              courseId: item.course_id,
              courseTitle: item.course_title,
            })
          }
        >
          {/* Card Accent Top Line */}
          <View style={[styles.accentBorder, { backgroundColor: statusColor }]} />

          <View style={styles.cardContent}>
            {/* Left Thumbnail with Overlay Badge */}
            <View style={styles.thumbWrapper}>
              {item.thumbnail ? (
                <Image
                  source={{ uri: getFileUrl(item.thumbnail) }}
                  style={styles.thumbImage}
                />
              ) : (
                <LinearGradient
                  colors={['#0F172A', colors.primary || '#0D9488']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.thumbFallback}
                >
                  <Text style={styles.thumbFallbackText}>
                    {item.course_title ? item.course_title.charAt(0) : 'C'}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Right Card Meta & Content */}
            <View style={styles.cardBody}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.course_title}
                </Text>
                <Feather
                  name="chevron-right"
                  size={18}
                  color={colors.gray400 || '#9CA3AF'}
                  style={styles.chevronIcon}
                />
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <Feather name="clock" size={11} color={colors.gray500 || '#6B7280'} />
                  <Text style={styles.metaChipText}>{item.total_weeks} weeks</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${statusColor}14` }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>

              {/* Progress Indicator */}
              <View style={styles.progressContainer}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${item.progress_percentage || 0}%`,
                        backgroundColor: statusColor,
                      },
                    ]}
                  />
                </View>

                <View style={styles.progressMeta}>
                  <Text style={styles.progressLabel}>Completion</Text>
                  <Text style={styles.progressPercent}>{item.progress_percentage || 0}%</Text>
                </View>
              </View>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
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
      <FlatList
        data={filteredEnrollments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item, index }) => renderCourse({ item, index })}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary || '#0D9488']}
            tintColor={colors.primary || '#0D9488'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Feather name="book-open" size={28} color={colors.gray400 || '#9CA3AF'} />
            </View>
            <Text style={styles.emptyTitle}>No Courses Found</Text>
            <Text style={styles.emptySubtext}>
              {activeTab === 'All'
                ? 'You are not enrolled in any academic courses yet.'
                : `There are no courses matching "${activeTab}".`}
            </Text>
          </View>
        }
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

  /* Header & Dashboard Stats */
  headerWrapper: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  greetingText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray400 || '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: typography.fontSize2xl || 22,
    fontWeight: '800',
    color: colors.gray900 || '#111827',
  },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  countBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.gray700 || '#374151',
  },

  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50 || '#F9FAFB',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 6,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
  },
  statLabel: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.gray200 || '#E5E7EB',
  },

  /* Filter Tabs */
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  tabButtonActive: {
    backgroundColor: colors.primary || '#0D9488',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.gray600 || '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },

  /* Course Card */
  listContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
  accentBorder: {
    height: 3,
    width: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 14,
    gap: 14,
  },
  thumbWrapper: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbFallbackText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },

  cardBody: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
    lineHeight: 19,
    marginRight: 6,
  },
  chevronIcon: {
    marginTop: 2,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray100 || '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  metaChipText: {
    fontSize: 11,
    color: colors.gray600 || '#4B5563',
    fontWeight: '500',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  /* Progress Section */
  progressContainer: {
    gap: 4,
  },
  progressTrack: {
    height: 5,
    backgroundColor: colors.gray100 || '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 10,
    color: colors.gray400 || '#9CA3AF',
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.gray700 || '#374151',
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray800 || '#1F2937',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.gray500 || '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
});