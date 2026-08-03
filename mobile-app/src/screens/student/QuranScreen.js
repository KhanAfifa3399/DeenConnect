import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getContentByType } from '../../api/quranContentApi';
import { getAllDuas } from '../../api/duasApi';
import { getAllDailySurahs } from '../../api/dailySurahApi';
import { getFileUrl } from '../../utils/urls';
import RepeatAudioPlayer from './RepeatAudioPlayer';

const TABS = [
  { key: 'surah', label: 'Surah' },
  { key: 'para', label: 'Para' },
  { key: 'duas', label: 'Duas' },
  { key: 'daily', label: 'Daily Surah' },
];

// Public Quran audio CDN (mp3quran.net) — Mishary Rashid Alafasy reciter.
// Free, no API key, indexed by 3-digit surah number. Only works per full
// Surah (a Juz/Para spans multiple surahs so it has no single audio file).
const RECITER_FOLDER = 'afs';
function getSurahAudioUrl(surahNumber) {
  if (!surahNumber) return null;
  return `https://server8.mp3quran.net/${RECITER_FOLDER}/${String(surahNumber).padStart(3, '0')}.mp3`;
}

function QuranScreen() {
  const [activeTab, setActiveTab] = useState('surah');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setItems(data);
    } catch (err) {
      console.error('Failed to load Quran content:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function openPdf(url) {
    Linking.openURL(getFileUrl(url));
  }

  function renderItem({ item }) {
    if (activeTab === 'surah' || activeTab === 'para') {
      return (
        <View style={styles.contentCard}>
          <Pressable
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
            onPress={() => item.pdf_url && openPdf(item.pdf_url)}
          >
            <View style={styles.rowIcon}>
              <Feather name="file-text" size={18} color={colors.primaryDark} />
            </View>
            <View style={styles.rowBody}>
              <Text style={styles.rowTitle}>{activeTab === 'surah' ? 'Surah' : 'Para'} {item.number} — {item.name}</Text>
            </View>
            {item.pdf_url ? (
              <Feather name="download" size={16} color={colors.primary} />
            ) : (
              <Text style={styles.noPdfText}>No PDF</Text>
            )}
          </Pressable>

          {activeTab === 'surah' ? (
            <RepeatAudioPlayer audioUri={getSurahAudioUrl(item.number)} />
          ) : (
            <View style={styles.unavailableBox}>
              <Feather name="info" size={12} color={colors.gray400} />
              <Text style={styles.unavailableNote}>
                Audio isn't available per-Para since a Para spans multiple Surahs.
              </Text>
            </View>
          )}
        </View>
      );
    }

    if (activeTab === 'duas') {
      return (
        <View style={styles.duaCard}>
          <Text style={styles.duaTitle}>{item.title}</Text>
          <Text style={styles.duaArabic}>{item.arabic_text}</Text>
          {item.transliteration && <Text style={styles.duaTranslit}>{item.transliteration}</Text>}
          <Text style={styles.duaTranslation}>{item.translation}</Text>
          <View style={styles.duaFooter}>
            {item.category && (
              <View style={styles.categoryTag}>
                <Text style={styles.categoryTagText}>{item.category}</Text>
              </View>
            )}
            {item.reference && <Text style={styles.duaReference}>{item.reference}</Text>}
          </View>
          <RepeatAudioPlayer audioUri={item.audio_url ? getFileUrl(item.audio_url) : null} />
        </View>
      );
    }

    return (
      <View style={styles.contentCard}>
        <View style={styles.row}>
          <View style={styles.rowIcon}>
            <Feather name="moon" size={18} color={colors.primaryDark} />
          </View>
          <View style={styles.rowBody}>
            <Text style={styles.rowTitle}>Surah {item.surah_number} — {item.surah_name}</Text>
            {item.note && <Text style={styles.rowNote}>{item.note}</Text>}
          </View>
        </View>
        <RepeatAudioPlayer audioUri={getSurahAudioUrl(item.surah_number)} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.header}>Quran & Duas</Text>

      <View style={styles.tabsRow}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabButtonText, activeTab === tab.key && styles.tabButtonTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.space8 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Feather name="inbox" size={22} color={colors.gray300} />
              <Text style={styles.emptyText}>Nothing here yet.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.gray50 },
  header: {
    fontSize: typography.fontSizeXl, fontWeight: typography.weightBold, color: colors.primaryDark,
    paddingHorizontal: spacing.space5, paddingTop: spacing.space4, paddingBottom: spacing.space3,
  },
  tabsRow: {
    flexDirection: 'row', paddingHorizontal: spacing.space5, gap: spacing.space2, marginBottom: spacing.space4,
  },
  tabButton: {
    paddingHorizontal: spacing.space3, paddingVertical: spacing.space2,
    borderRadius: spacing.radiusFull, backgroundColor: colors.gray100,
  },
  tabButtonActive: { backgroundColor: colors.primary },
  tabButtonText: { fontSize: typography.fontSizeXs, color: colors.gray600, fontWeight: typography.weightMedium },
  tabButtonTextActive: { color: colors.white },
  listContent: { paddingHorizontal: spacing.space5, paddingBottom: spacing.space10 },
  contentCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space3, marginBottom: spacing.space2,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
  },
  rowPressed: { opacity: 0.8 },
  rowIcon: {
    width: 36, height: 36, borderRadius: spacing.radiusMd,
    backgroundColor: colors.accentLight, alignItems: 'center', justifyContent: 'center',
  },
  rowBody: { flex: 1 },
  rowTitle: { fontSize: typography.fontSizeSm, fontWeight: typography.weightMedium, color: colors.gray900 },
  rowNote: { fontSize: typography.fontSizeXs, color: colors.gray500, marginTop: 2 },
  noPdfText: { fontSize: typography.fontSizeXs, color: colors.gray300 },
  unavailableBox: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.space2, paddingLeft: 2 },
  unavailableNote: { fontSize: 11, color: colors.gray400, fontStyle: 'italic', flex: 1 },
  duaCard: {
    backgroundColor: colors.white, borderRadius: spacing.radiusLg, padding: spacing.space4, marginBottom: spacing.space3, gap: spacing.space2,
  },
  duaTitle: { fontSize: typography.fontSizeBase, fontWeight: typography.weightSemibold, color: colors.gray900 },
  duaArabic: { fontSize: 20, lineHeight: 32, color: colors.primaryDark, textAlign: 'right', writingDirection: 'rtl' },
  duaTranslit: { fontSize: typography.fontSizeXs, fontStyle: 'italic', color: colors.gray500 },
  duaTranslation: { fontSize: typography.fontSizeSm, color: colors.gray700, lineHeight: 20 },
  duaFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.space2, marginTop: spacing.space1 },
  categoryTag: { backgroundColor: colors.accentLight, paddingHorizontal: spacing.space3, paddingVertical: 2, borderRadius: spacing.radiusFull },
  categoryTagText: { fontSize: 10, color: colors.primaryDark, fontWeight: typography.weightMedium },
  duaReference: { fontSize: 10, color: colors.gray500, fontStyle: 'italic' },
  emptyBox: { alignItems: 'center', gap: spacing.space2, paddingTop: spacing.space10 },
  emptyText: { color: colors.gray500, fontSize: typography.fontSizeSm },
});

export default QuranScreen;