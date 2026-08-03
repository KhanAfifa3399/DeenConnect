import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getTeacherAnnouncements, deleteAnnouncement } from '../../api/announcementsApi';
import { getUser } from '../../utils/secureStorage';
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

function MyAnnouncementsScreen() {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

const load = useCallback(async () => {
    try {
      const user = await getUser();
      setCurrentUserId(user?.id);
      const data = await getTeacherAnnouncements();
      setAnnouncements(data);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
      await setLastSeenNotifTime();
    }
}, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  function handleDelete(item) {
    Alert.alert('Delete Announcement', `Remove "${item.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAnnouncement(item.id);
            load();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to delete announcement');
          }
        },
      },
    ]);
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
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.gray900} />
        </Pressable>
        <Text style={styles.topBarTitle}>Announcements</Text>
        <Pressable onPress={() => navigation.navigate('CreateAnnouncement')} style={styles.addButton}>
          <Feather name="plus" size={20} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isMine = item.created_by === currentUserId;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.cardAuthor}>by {item.created_by_name}{isMine ? ' (you)' : ''}</Text>
                </View>
                {isMine && (
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() => navigation.navigate('CreateAnnouncement', { editingAnnouncement: item })}
                    >
                      <Feather name="edit-2" size={14} color={colors.gray600} />
                    </Pressable>
                    <Pressable style={styles.actionBtnDanger} onPress={() => handleDelete(item)}>
                      <Feather name="trash-2" size={14} color={colors.error} />
                    </Pressable>
                  </View>
                )}
              </View>
              <Text style={styles.cardMessage} numberOfLines={2}>{item.message}</Text>
              <View style={styles.cardFooter}>
                {item.course_title && (
                  <View style={styles.courseTag}>
                    <Text style={styles.courseTagText}>{item.course_title}</Text>
                  </View>
                )}
                <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Feather name="volume-2" size={24} color={colors.gray300} />
            <Text style={styles.emptyText}>No announcements yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.gray50 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  backButton: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  addButton: { padding: 4 },
  listContent: { padding: spacing.space5, paddingBottom: spacing.space10 },
  card: { backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4, marginBottom: spacing.space3 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.space2 },
  cardTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold, color: colors.gray900 },
  cardAuthor: { fontSize: 11, color: colors.gray500, marginTop: 1 },
  cardActions: { flexDirection: 'row', gap: spacing.space2 },
  actionBtn: { width: 28, height: 28, borderRadius: spacing.radiusMd, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  actionBtnDanger: { width: 28, height: 28, borderRadius: spacing.radiusMd, backgroundColor: 'rgba(211,47,47,0.1)', alignItems: 'center', justifyContent: 'center' },
  cardMessage: { fontSize: typography.fontSizeSm, color: colors.gray600, marginTop: spacing.space2, lineHeight: 19 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2, marginTop: spacing.space2 },
  courseTag: { backgroundColor: colors.gray100, paddingHorizontal: spacing.space2, paddingVertical: 2, borderRadius: spacing.radiusFull },
  courseTagText: { fontSize: 10, color: colors.gray600 },
  cardTime: { fontSize: 11, color: colors.gray400 },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm, textAlign: 'center' },
});

export default MyAnnouncementsScreen;