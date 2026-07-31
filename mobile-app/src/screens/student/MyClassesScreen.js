import { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, TextInput, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses } from '../../api/coursesApi';

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

  useFocusEffect(useCallback(() => { loadCourses(); }, [loadCourses]));

  function onRefresh() {
    setRefreshing(true);
    loadCourses();
  }

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return courses;
    const term = searchTerm.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(term) || c.subject_name.toLowerCase().includes(term));
  }, [courses, searchTerm]);

  function renderCourse({ item }) {
    return (
      <Pressable
        style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}
        onPress={() => navigation.navigate('TeacherCourseDetails', { courseId: item.id, courseTitle: item.title })}
      >
        <View style={styles.thumb}>
          <Text style={styles.thumbText}>{item.title.charAt(0)}</Text>
        </View>
        <View style={styles.cardBody}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Feather name="users" size={11} color={colors.gray500} />
            <Text style={styles.metaText}>{item.enrolled_count} students</Text>
            <View style={styles.dot} />
            <Text style={styles.metaText}>{item.total_weeks} weeks</Text>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.gray300} />
      </Pressable>
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
      <Text style={styles.header}>My Classes</Text>
      <View style={styles.searchBox}>
        <Feather name="search" size={15} color={colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search classes..."
          placeholderTextColor={colors.gray400}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCourse}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="inbox" size={24} color={colors.gray300} />
            <Text style={styles.emptyText}>No classes found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  header: { fontSize: typography.fontSizeXl, fontWeight: typography.weightBold, color: colors.primaryDark, paddingHorizontal: spacing.space5, paddingTop: spacing.space4, paddingBottom: spacing.space3 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2, backgroundColor: colors.white, marginHorizontal: spacing.space5, marginBottom: spacing.space4, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, borderRadius: spacing.radiusFull, borderWidth: 1, borderColor: colors.gray200 },
  searchInput: { flex: 1, fontSize: typography.fontSizeSm, color: colors.gray900 },
  listContent: { paddingHorizontal: spacing.space5, paddingBottom: spacing.space10 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4, marginBottom: spacing.space3, gap: spacing.space3, shadowColor: colors.gray900, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  thumb: { width: 48, height: 48, borderRadius: spacing.radiusMd, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  thumbText: { color: colors.white, fontSize: typography.fontSizeLg, fontWeight: typography.weightBold },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold, color: colors.gray900 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  metaText: { fontSize: 11, color: colors.gray500 },
  dot: { width: 3, height: 3, borderRadius: 2, backgroundColor: colors.gray300, marginHorizontal: 2 },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm },
});

export default MyClassesScreen;