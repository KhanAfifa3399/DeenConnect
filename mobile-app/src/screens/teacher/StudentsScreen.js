import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getMyAssignedCourses, getCourseEnrollments } from '../../api/coursesApi';

function StudentsScreen() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadStudents = useCallback(async () => {
    try {
      const courses = await getMyAssignedCourses();
      const rosters = await Promise.all(
        courses.map((c) => getCourseEnrollments(c.id).then((list) => list.map((s) => ({ ...s, courseTitle: c.title }))))
      );
      const flat = rosters.flat();
      const unique = Array.from(new Map(flat.map((s) => [`${s.student_id}-${s.courseTitle}`, s])).values());
      setStudents(unique);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadStudents(); }, [loadStudents]));

  const filtered = searchTerm.trim()
    ? students.filter((s) => s.student_name.toLowerCase().includes(searchTerm.toLowerCase()))
    : students;

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>My Students</Text>
      <View style={styles.searchBox}>
        <Feather name="search" size={15} color={colors.gray400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search students..."
          placeholderTextColor={colors.gray400}
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item, index) => `${item.student_id}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.student_name?.charAt(0)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>{item.student_name}</Text>
              <Text style={styles.course} numberOfLines={1}>{item.courseTitle}</Text>
            </View>
            <View style={[styles.statusBadge, styles[`badge_${item.status}`]]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="users" size={24} color={colors.gray300} />
            <Text style={styles.emptyText}>No students found.</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space3, marginBottom: spacing.space2 },
  avatar: { width: 40, height: 40, borderRadius: spacing.radiusFull, backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.primaryDark, fontWeight: typography.weightBold },
  name: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  course: { fontSize: 11, color: colors.gray500, marginTop: 1 },
  statusBadge: { paddingHorizontal: spacing.space2, paddingVertical: 3, borderRadius: spacing.radiusFull },
  badge_active: { backgroundColor: 'rgba(42,90,109,0.1)' },
  badge_completed: { backgroundColor: 'rgba(46,125,50,0.1)' },
  badge_dropped: { backgroundColor: 'rgba(211,47,47,0.08)' },
  statusText: { fontSize: 10, fontWeight: typography.weightMedium, color: colors.gray600, textTransform: 'capitalize' },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm },
});

export default StudentsScreen;