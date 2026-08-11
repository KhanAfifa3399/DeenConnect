import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { getContentByType } from '../../api/quranContentApi';
import { getAllDuas } from '../../api/duasApi';
import { getAllDailySurahs } from '../../api/dailySurahApi';
import { getFileUrl } from '../../utils/urls';
import RepeatAudioPlayer from './RepeatAudioPlayer';

const TABS = [
  { key: 'surah', label: 'Surah' },
  { key: 'para', label: 'Para' },
  { key: 'duas', label: 'Duas' },
  { key: 'daily', label: 'Daily' },
];

export default function QuranScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('surah');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  function openSurahReader(surahNumber, surahName) {
    navigation.navigate('SurahReader', { surahNumber, surahName });
  }

  function openParaReader(paraNumber, paraName) {
    navigation.navigate('ParaReader', { paraNumber, paraName });
  }

  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  async function loadTabData(tab) {
    setLoading(true);
    try {
      let data;
      if (tab === 'surah' || tab === 'para') {
        data = await getContentByType(tab);
      } else if (tab === 'duas') {
        data = await getAllDuas();
      } else {
        data = await getAllDailySurahs();
      }
      setItems(data || []);
    } catch (err) {
      console.error('Failed to load Quran content:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function openPdf(url) {
    if (url) {
      Linking.openURL(getFileUrl(url));
    }
  }

  function renderItem({ item, index }) {
    if (activeTab === 'surah' || activeTab === 'para') {
      const isSurah = activeTab === 'surah';
      return (
        <View style={styles.contentCard}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => {
              if (isSurah) {
                openSurahReader(item.number, item.name);
              } else {
                openParaReader(item.number, item.name);
              }
            }}
          >
            <View style={styles.indexBadge}>
              <Text style={styles.indexBadgeText}>{item.number || index + 1}</Text>
            </View>

            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>
                {isSurah ? 'Surah' : 'Para'} {item.number} — {item.name}
              </Text>
              <Text style={styles.rowSubtitle}>
                {isSurah ? 'Tap to read & play recitation' : 'Tap to read Arabic text'}
              </Text>
            </View>

            {isSurah ? (
              <View style={styles.actionIconWrapper}>
                <Feather name="chevron-right" size={18} color={colors.primary || '#0D9488'} />
              </View>
            ) : (
              <View style={styles.rightActionGroup}>
                {item.pdf_url && (
                  <Pressable
                    hitSlop={8}
                    style={styles.downloadBtn}
                    onPress={(e) => {
                      e.stopPropagation();
                      openPdf(item.pdf_url);
                    }}
                  >
                    <Feather name="download" size={15} color={colors.primary || '#0D9488'} />
                  </Pressable>
                )}
                <View style={styles.actionIconWrapper}>
                  <Feather name="chevron-right" size={18} color={colors.primary || '#0D9488'} />
                </View>
              </View>
            )}
          </Pressable>
        </View>
      );
    }

    if (activeTab === 'duas') {
      return (
        <View style={styles.duaCard}>
          <View style={styles.duaHeader}>
            <Text style={styles.duaTitle}>{item.title}</Text>
            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            )}
          </View>

          <Text style={styles.duaArabic}>{item.arabic_text}</Text>

          {item.transliteration && (
            <Text style={styles.duaTranslit}>{item.transliteration}</Text>
          )}

          <Text style={styles.duaTranslation}>{item.translation}</Text>

          {item.reference && (
            <View style={styles.referenceRow}>
              <Feather name="book-open" size={12} color={colors.gray400 || '#9CA3AF'} />
              <Text style={styles.duaReference}>{item.reference}</Text>
            </View>
          )}

          <View style={styles.audioPlayerWrapper}>
            <RepeatAudioPlayer audioUri={item.audio_url ? getFileUrl(item.audio_url) : null} />
          </View>
        </View>
      );
    }

    // Daily Surah Tab
    return (
      <View style={styles.contentCard}>
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={() => openSurahReader(item.surah_number, item.surah_name)}
        >
          <View style={[styles.indexBadge, styles.dailyBadge]}>
            <Feather name="moon" size={16} color={colors.primary || '#0D9488'} />
          </View>

          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>Surah {item.surah_number} — {item.surah_name}</Text>
            {item.note && <Text style={styles.rowNote}>{item.note}</Text>}
            <Text style={styles.rowSubtitle}>Tap to read Arabic text & audio repeat</Text>
          </View>

          <View style={styles.actionIconWrapper}>
            <Feather name="chevron-right" size={18} color={colors.primary || '#0D9488'} />
          </View>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quran & Duas</Text>
        <Feather name="book" size={22} color={colors.primary || '#0D9488'} />
      </View>

      {/* Dynamic Segmented Mode Switcher */}
      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab.key && styles.tabButtonTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Main List Display */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={colors.primary || '#0D9488'}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, index) => String(item.id || item.number || index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={32} color={colors.gray300 || '#D1D5DB'} />
              <Text style={styles.emptyText}>Nothing here yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: typography.fontSizeXl || 22,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },

  /* Segmented Navigation */
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.gray100 || '#F3F4F6',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonText: {
    fontSize: 12,
    color: colors.gray600 || '#4B5563',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: colors.primary || '#0D9488',
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  /* Item Cards */
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowPressed: {
    opacity: 0.7,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  dailyBadge: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderColor: 'transparent',
  },
  indexBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray700 || '#374151',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray900 || '#111827',
  },
  rowSubtitle: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },
  rowNote: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    marginTop: 2,
    fontWeight: '500',
  },
  rightActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  downloadBtn: {
    padding: 6,
    borderRadius: 15,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  actionIconWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentLight || '#F0FDFA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Dua Card Styling */
  duaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    gap: 10,
  },
  duaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  duaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.gray900 || '#111827',
    flex: 1,
  },
  categoryTag: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 10,
    color: colors.primary || '#0D9488',
    fontWeight: '600',
  },
  duaArabic: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 22,
    lineHeight: 42,
    color: colors.primaryDark || '#0F172A',
    textAlign: 'right',
    writingDirection: 'rtl',
    marginVertical: 4,
  },
  duaTranslit: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.gray500 || '#6B7280',
  },
  duaTranslation: {
    fontSize: 13,
    color: colors.gray700 || '#374151',
    lineHeight: 20,
  },
  referenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  duaReference: {
    fontSize: 11,
    color: colors.gray400 || '#9CA3AF',
    fontStyle: 'italic',
  },
  audioPlayerWrapper: {
    marginTop: 4,
  },

  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    color: colors.gray400 || '#9CA3AF',
    fontSize: 13,
  },
});