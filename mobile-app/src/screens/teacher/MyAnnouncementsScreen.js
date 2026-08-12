import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getTeacherAnnouncements, deleteAnnouncement } from '../../api/announcementsApi';
import { getUser, setLastSeenNotifTime } from '../../utils/secureStorage';

function timeAgo(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function MyAnnouncementsScreen() {
  const navigation = useNavigation();
  const [announcements, setAnnouncements] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const user = await getUser();
      setCurrentUserId(user?.id);
      const data = await getTeacherAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements:', err);
    } finally {
      setLoading(false);
      await setLastSeenNotifTime();
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Academic Navigation Header */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color={colors.gray900 || '#111827'} />
        </Pressable>
        <Text style={styles.topBarTitle}>Academic Notices</Text>
        <Pressable
          onPress={() => navigation.navigate('CreateAnnouncement')}
          style={styles.addButton}
        >
          <Feather name="plus" size={18} color={colors.primaryDark || '#0F766E'} />
          <Text style={styles.addButtonText}>Post</Text>
        </Pressable>
      </View>

      <FlatList
        data={announcements}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const isMine = item.created_by === currentUserId;
          return (
            <View style={styles.card}>
              {/* Card Top Row */}
              <View style={styles.cardHeader}>
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.titleRow}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {isMine && (
                      <View style={styles.ownerBadge}>
                        <Text style={styles.ownerBadgeText}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardAuthor}>by {item.created_by_name || 'Ustadh'}</Text>
                </View>

                {isMine && (
                  <View style={styles.cardActions}>
                    <Pressable
                      style={styles.actionBtn}
                      onPress={() =>
                        navigation.navigate('CreateAnnouncement', { editingAnnouncement: item })
                      }
                    >
                      <Feather name="edit-2" size={13} color={colors.gray600 || '#475569'} />
                    </Pressable>
                    <Pressable style={styles.actionBtnDanger} onPress={() => handleDelete(item)}>
                      <Feather name="trash-2" size={13} color={colors.error || '#EF4444'} />
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Message Content */}
              <Text style={styles.cardMessage}>{item.message}</Text>

              {/* Footer Meta Details */}
              <View style={styles.cardFooter}>
                {item.course_title ? (
                  <View style={styles.courseTag}>
                    <Feather name="book-open" size={10} color={colors.primary || '#0D9488'} />
                    <Text style={styles.courseTagText} numberOfLines={1}>
                      {item.course_title}
                    </Text>
                  </View>
                ) : (
                  <View style={styles.generalTag}>
                    <Text style={styles.generalTagText}>General</Text>
                  </View>
                )}
                <View style={styles.timeWrap}>
                  <Feather name="clock" size={11} color={colors.gray400 || '#9CA3AF'} />
                  <Text style={styles.cardTime}>{timeAgo(item.created_at)}</Text>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <View style={styles.emptyIconWrap}>
              <Feather name="volume-2" size={22} color={colors.gray400 || '#9CA3AF'} />
            </View>
            <Text style={styles.emptyTitle}>No Announcements Posted</Text>
            <Text style={styles.emptyText}>
              Important updates and class notices will appear here once published.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },

  /* Top Navigation Bar */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200 || '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.gray900 || '#0F172A',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark || '#0F766E',
  },

  /* List & Cards */
  listContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardHeaderInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray900 || '#0F172A',
    flexShrink: 1,
  },
  ownerBadge: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ownerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primaryDark || '#0F766E',
    textTransform: 'uppercase',
  },
  cardAuthor: {
    fontSize: 11,
    color: colors.gray500 || '#64748B',
    marginTop: 2,
  },

  /* Actions */
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnDanger: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Card Body & Footer */
  cardMessage: {
    fontSize: 13,
    color: colors.gray700 || '#334155',
    marginTop: 10,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  courseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: '65%',
  },
  courseTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark || '#0F766E',
  },
  generalTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  generalTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  timeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardTime: {
    fontSize: 11,
    color: colors.gray400 || '#9CA3AF',
    fontWeight: '500',
  },

  /* Empty State */
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E2E8F0',
    borderStyle: 'dashed',
  },
  emptyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.gray900 || '#0F172A',
  },
  emptyText: {
    color: colors.gray500 || '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
});