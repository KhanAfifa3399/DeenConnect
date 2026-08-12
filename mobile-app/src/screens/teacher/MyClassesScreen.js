import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses } from '../../api/coursesApi';
import { getFileUrl } from '../../api/urls';

function MyClassesScreen() {
  const navigation = useNavigation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const loadCourses = useCallback(async () => {
    try {
      const data = await getMyAssignedCourses();
      setCourses(data);
    } catch (err) {
      console.error('Failed to load classes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCourses();
    }, [loadCourses])
  );

  function onRefresh() {
    setRefreshing(true);
    loadCourses();
  }

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter(
      (c) =>
        c.title?.toLowerCase().includes(term) ||
        c.subject_name?.toLowerCase().includes(term)
    );
  }, [courses, searchTerm]);

  function renderCourse({ item }) {
    return (
      <Pressable
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
        onPress={() =>
          navigation.navigate('TeacherCourseDetails', {
            courseId: item.id,
            courseTitle: item.title,
          })
        }
      >
        {/* Accent Bar */}
        <View style={styles.accentBar} />

        {/* Thumbnail Image / Fallback Avatar */}
        <View style={styles.thumbWrapper}>
          {item.thumbnail ? (
            <Image source={{ uri: getFileUrl(item.thumbnail) }} style={styles.thumbImage} />
          ) : (
            <View style={styles.thumbFallback}>
              <Text style={styles.thumbText}>
                {item.title?.charAt(0)?.toUpperCase() || 'C'}
              </Text>
            </View>
          )}
        </View>

        {/* Course Details */}
        <View style={styles.cardBody}>
          {item.subject_name ? (
            <Text style={styles.subjectTag} numberOfLines={1}>
              {item.subject_name.toUpperCase()}
            </Text>
          ) : null}

          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>

          {/* Meta Badges Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Feather name="users" size={12} color={colors.primary || '#0D9488'} />
              <Text style={styles.metaText}>{item.enrolled_count || 0} Students</Text>
            </View>

            <View style={styles.metaBadge}>
              <Feather name="calendar" size={12} color={colors.gray500 || '#64748B'} />
              <Text style={styles.metaText}>{item.total_weeks || 0} Weeks</Text>
            </View>
          </View>
        </View>

        {/* Action Icon */}
        <View style={styles.chevronWrap}>
          <Feather name="chevron-right" size={18} color={colors.gray400 || '#9CA3AF'} />
        </View>
      </Pressable>
    );
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
      {/* Dark Hero Header Background */}
      <View style={styles.headerBackground}>
        <LinearGradient
          colors={[colors.primaryDark || '#0F172A', '#1E293B']}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.ambientGlow} />
      </View>

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Screen Header */}
        <View style={styles.headerContainer}>
          <View style={styles.headerTextRow}>
            <View>
              <Text style={styles.headerSubtitle}>ACADEMIC MANAGEMENT</Text>
              <Text style={styles.headerTitle}>My Classes</Text>
            </View>
            <View style={styles.totalBadge}>
              <Feather name="book-open" size={13} color="#2DD4BF" />
              <Text style={styles.totalBadgeText}>{courses.length}</Text>
            </View>
          </View>

          {/* Glassmorphic Search Input */}
          <View style={styles.searchBox}>
            <Feather name="search" size={16} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search assigned classes..."
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

        {/* Class Cards List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderCourse}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary || '#0D9488']}
              tintColor="#2DD4BF"
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconWrap}>
                <Feather name="inbox" size={28} color={colors.gray400 || '#9CA3AF'} />
              </View>
              <Text style={styles.emptyTitle}>No Classes Found</Text>
              <Text style={styles.emptySubtitle}>
                {searchTerm
                  ? 'Try searching with a different course title or subject.'
                  : 'You do not have any assigned classes available at this time.'}
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

  /* Header & Stats Container */
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

  /* Glassmorphism Search Bar */
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

  /* List Styling */
  listContent: {
    paddingHorizontal: spacing.space5 || 20,
    paddingTop: spacing.space2 || 8,
    paddingBottom: spacing.space10 || 40,
  },

  /* Course Card */
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white || '#FFFFFF',
    borderRadius: 16,
    padding: spacing.space4 || 16,
    marginBottom: spacing.space3 || 12,
    gap: spacing.space3 || 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gray100 || '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: colors.primary || '#0D9488',
  },

  /* Thumbnail Wrap */
  thumbWrapper: {
    width: 56,
    height: 56,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.gray100 || '#F1F5F9',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbFallback: {
    flex: 1,
    backgroundColor: colors.primaryDark || '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    color: '#2DD4BF',
    fontSize: typography.fontSizeXl || 20,
    fontWeight: typography.weightBold || '700',
  },

  /* Card Body */
  cardBody: {
    flex: 1,
  },
  subjectTag: {
    fontSize: 10,
    fontWeight: typography.weightBold || '700',
    color: colors.primary || '#0D9488',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: typography.fontSizeSm || 15,
    fontWeight: typography.weightBold || '700',
    color: colors.gray900 || '#0F172A',
    marginBottom: 6,
  },

  /* Meta Info Badges */
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space2 || 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gray50 || '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 11,
    fontWeight: typography.weightMedium || '500',
    color: colors.gray600 || '#475569',
  },

  /* Chevron Wrap */
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray50 || '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },

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

export default MyClassesScreen;