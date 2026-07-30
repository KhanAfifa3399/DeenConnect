import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getStudentAnnouncements } from '../../api/announcementsApi';
import { setLastSeenNotifTime } from '../../utils/secureStorage';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function NotificationsScreen({ navigation }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStudentAnnouncements();
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
        await setLastSeenNotifTime();
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>
        <Text style={styles.topBarTitle}>Notifications</Text>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Feather name="bell" size={16} color={colors.primaryDark} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMessage}>{item.message}</Text>
              <View style={styles.cardFooter}>
                {item.course_title && (
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{item.course_title}</Text>
                  </View>
                )}
                <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="bell-off" size={24} color={colors.gray300} />
            <Text style={styles.emptyText}>No notifications yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
    backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100,
  },
  backButton: { padding: 4 },
  topBarTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  listContent: { padding: spacing.space5, paddingBottom: spacing.space10 },
  card: {
    flexDirection: 'row', gap: spacing.space3, backgroundColor: colors.white,
    borderRadius: spacing.radiusLg, padding: spacing.space4, marginBottom: spacing.space3,
  },
  cardIcon: {
    width: 34, height: 34, borderRadius: spacing.radiusFull, backgroundColor: colors.accentLight,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold, color: colors.gray900 },
  cardMessage: { fontSize: typography.fontSizeSm, color: colors.gray600, marginTop: 2, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2, marginTop: spacing.space2 },
  courseTag: { backgroundColor: colors.gray100, paddingHorizontal: spacing.space2, paddingVertical: 2, borderRadius: spacing.radiusFull },
  courseTagText: { fontSize: 10, color: colors.gray600 },
  cardTime: { fontSize: 11, color: colors.gray400 },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm },
});

export default NotificationsScreen;