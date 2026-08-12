import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  ActivityIndicator,
  TextInput,
  Pressable,
  LayoutAnimation,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses, getCourseEnrollments } from '../../api/coursesApi';
import { getFileUrl } from '../../utils/urls';

function StudentsScreen() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [collapsedCourses, setCollapsedCourses] = useState({});

  const loadStudents = useCallback(async () => {
    try {
      const courses = await getMyAssignedCourses();
      const grouped = await Promise.all(
        courses.map(async (c) => ({
          title: c.title,
          courseId: c.id,
          data: await getCourseEnrollments(c.id),
        }))
      );
      setSections(grouped.filter((g) => g.data.length > 0));
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStudents();
    }, [loadStudents])
  );

  function toggleCourse(courseId) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setCollapsedCourses((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  }

  const filteredSections = sections
    .map((section) => ({
      ...section,
      data: searchTerm.trim()
        ? section.data.filter((s) =>
            s.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : section.data,
    }))
    .filter((section) => section.data.length > 0);

  const totalStudentsCount = sections.reduce(
    (sum, section) => sum + section.data.length,
    0
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Dark Ambient Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[colors.primaryDark || '#0F172A', '#1E293B']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.ambientGlow} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Screen Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextRow}>
            <View>
              <Text style={styles.headerSubtitle}>ACADEMIC OVERVIEW</Text>
              <Text style={styles.headerTitle}>My Students</Text>
            </View>
            <View style={styles.totalBadge}>
              <Feather name="users" size={13} color="#2DD4BF" />
              <Text style={styles.totalBadgeText}>{totalStudentsCount}</Text>
            </View>
          </View>

          {/* Search Bar with Glassmorphism Effect */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by student name..."
              placeholderTextColor="rgba(255, 255, 255, 0.45)"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <Pressable onPress={() => setSearchTerm('')}>
                <Feather name="x-circle" size={16} color="rgba(255, 255, 255, 0.6)" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Section List / Student Cards */}
        <SectionList
          sections={filteredSections}
          keyExtractor={(item, index) => `${item.student_id}-${index}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => {
            const isCollapsed = collapsedCourses[section.courseId];
            return (
              <Pressable
                style={styles.sectionHeader}
                onPress={() => toggleCourse(section.courseId)}
              >
                <View style={styles.sectionTitleRow}>
                  <View style={styles.sectionIconWrap}>
                    <Feather
                      name={isCollapsed ? 'chevron-right' : 'chevron-down'}
                      size={16}
                      color={colors.primary || '#0D9488'}
                    />
                  </View>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{section.data.length}</Text>
                </View>
              </Pressable>
            );
          }}
          renderItem={({ item, section }) =>
            collapsedCourses[section.courseId] ? null : (
              <View style={styles.studentCard}>
                {/* Student Avatar / Profile Image */}
                <View style={styles.avatarWrapper}>
                  {item.profile_picture ? (
                    <Image
                      source={{ uri: getFileUrl(item.profile_picture) }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <View style={styles.avatarFallback}>
                      <Text style={styles.avatarText}>
                        {item.student_name?.charAt(0)?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Student Info */}
                <View style={styles.studentDetails}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {item.student_name}
                  </Text>
                  <Text style={styles.studentMeta} numberOfLines={1}>
                    ID: #{item.student_id || 'N/A'}
                  </Text>
                </View>

                {/* Status Indicator Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    styles[`badge_${item.status?.toLowerCase()}`] || styles.badge_default,
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      styles[`dot_${item.status?.toLowerCase()}`] || styles.dot_default,
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      styles[`text_${item.status?.toLowerCase()}`] || styles.text_default,
                    ]}
                  >
                    {item.status || 'Active'}
                  </Text>
                </View>
              </View>
            )
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Feather name="users" size={28} color={colors.gray400 || '#9CA3AF'} />
              </View>
              <Text style={styles.emptyTitle}>No Students Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm
                  ? 'Try searching with a different student name.'
                  : 'You do not have any enrolled students assigned yet.'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
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

  /* Dark Hero Background */
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

  /* Screen Header & Stats */
  headerContainer: {
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space2 || 8,
    paddingBottom: spacing.space4 || 16,
  },
  headerTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space4 || 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: typography.weightBold || '700',
    color: '#2DD4BF',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: typography.fontSizeXl || 24,
    fontWeight: typography.weightBold || '700',
    color: '#FFFFFF',
  },
  totalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  totalBadgeText: {
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightBold || '700',
    color: '#FFFFFF',
  },

  /* Search Input Bar */
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2 || 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: spacing.space4 || 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizeSm || 14,
    color: '#FFFFFF',
    padding: 0,
  },

  /* Section List */
  listContent: {
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space2 || 8,
    paddingBottom: spacing.space10 || 40,
  },

  /* Section Headers (Course Titles) */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white || '#FFFFFF',
    paddingHorizontal: spacing.space4 || 16,
    paddingVertical: spacing.space3 || 12,
    borderRadius: 14,
    marginTop: spacing.space3 || 12,
    marginBottom: spacing.space2 || 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary || '#0D9488',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2 || 8,
    flex: 1,
  },
  sectionIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightBold || '700',
    color: colors.primaryDark || '#0F172A',
    flex: 1,
  },
  countBadge: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: typography.weightBold || '700',
    color: colors.primary || '#0D9488',
  },

  /* Student Card Row */
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space3 || 12,
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: 16,
    padding: spacing.space3 || 12,
    marginBottom: spacing.space2 || 8,
    borderWidth: 1,
    borderColor: colors.gray100 || '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryDark || '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#2DD4BF',
    fontWeight: typography.weightBold || '700',
    fontSize: typography.fontSizeMd || 16,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: typography.fontSizeSm || 14,
    fontWeight: typography.weightSemibold || '600',
    color: colors.gray900 || '#0F172A',
    marginBottom: 2,
  },
  studentMeta: {
    fontSize: 11,
    color: colors.gray400 || '#9CA3AF',
  },

  /* Status Badges */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: typography.weightSemibold || '600',
    textTransform: 'capitalize',
  },

  /* Active Status */
  badge_active: { backgroundColor: 'rgba(13, 148, 136, 0.08)' },
  dot_active: { backgroundColor: '#0D9488' },
  text_active: { color: '#0D9488' },

  /* Completed Status */
  badge_completed: { backgroundColor: 'rgba(34, 197, 94, 0.08)' },
  dot_completed: { backgroundColor: '#22C55E' },
  text_completed: { color: '#16A34A' },

  /* Dropped Status */
  badge_dropped: { backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  dot_dropped: { backgroundColor: '#EF4444' },
  text_dropped: { color: '#DC2626' },

  /* Default / Fallback Status */
  badge_default: { backgroundColor: 'rgba(100, 116, 139, 0.08)' },
  dot_default: { backgroundColor: '#64748B' },
  text_default: { color: '#475569' },

  /* Empty State */
  emptyBox: {
    alignItems: 'center',
    paddingTop: spacing.space10 || 40,
    paddingHorizontal: spacing.space5 || 20,
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray100 || '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space3 || 12,
  },
  emptyTitle: {
    fontSize: typography.fontSizeMd || 16,
    fontWeight: typography.weightBold || '700',
    color: colors.gray900 || '#0F172A',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: typography.fontSizeSm || 14,
    color: colors.gray500 || '#64748B',
    textAlign: 'center',
  },
});

export default StudentsScreen;