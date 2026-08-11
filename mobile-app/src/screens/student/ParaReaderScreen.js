import { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

function getParaDataUrl(paraNumber) {
  return `https://api.alquran.cloud/v1/juz/${paraNumber}/quran-uthmani`;
}

// Format number to Arabic-Indic digits with traditional Ayah End Ornament
const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
function getAyahSymbol(n) {
  const arabicNum = String(n)
    .split('')
    .map((d) => ARABIC_DIGITS[Number(d)] ?? d)
    .join('');
  return ` \u06DD${arabicNum} `;
}

function groupBySurah(ayahs) {
  const sections = [];
  for (const ayah of ayahs) {
    const last = sections[sections.length - 1];
    if (last && last.surahNumber === ayah.surah.number) {
      last.ayahs.push(ayah);
    } else {
      sections.push({
        key: `surah-${ayah.surah.number}`,
        surahNumber: ayah.surah.number,
        surahName: ayah.surah.name,
        surahEnglishName: ayah.surah.englishName,
        revelationType: ayah.surah.revelationType,
        ayahs: [ayah],
      });
    }
  }
  return sections;
}

export default function ParaReaderScreen({ route, navigation }) {
  const { paraNumber = 1, paraName = 'Juz 1' } = route.params || {};

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paraNumber) return;
    setLoading(true);
    setError('');
    fetch(getParaDataUrl(paraNumber))
      .then((res) => res.json())
      .then((json) => setAyahs(json.data?.ayahs || []))
      .catch(() => setError('Could not load the Para text. Check your connection.'))
      .finally(() => setLoading(false));
  }, [paraNumber]);

  const sections = useMemo(() => groupBySurah(ayahs), [ayahs]);

  const pageRange = useMemo(() => {
    if (!ayahs.length) return null;
    const pages = ayahs.map((a) => a.page);
    const min = Math.min(...pages);
    const max = Math.max(...pages);
    return min === max ? `Page ${min}` : `Pages ${min}–${max}`;
  }, [ayahs]);

  function renderSection({ item: section }) {
    return (
      <View style={styles.section}>
        {/* Traditional Ornamental Surah Title Banner */}
        <View style={styles.surahBanner}>
          <View style={styles.bannerBorderInner}>
            <Text style={styles.surahNameArabic}>{section.surahName}</Text>
            <Text style={styles.surahMeta}>
              Surah {section.surahNumber} • {section.surahEnglishName} • {section.revelationType}
            </Text>
          </View>
        </View>

        {/* Continuous Mushaf Paragraph Reading Flow */}
        <View style={styles.mushafPaper}>
          <Text style={styles.flowText}>
            {section.ayahs.map((ayah) => (
              <Text key={ayah.number}>
                {ayah.text}
                <Text style={styles.ayahSymbolText}>
                  {getAyahSymbol(ayah.numberInSurah)}
                </Text>
              </Text>
            ))}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.gray700 || '#374151'} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.title}>{paraName ? paraName : `Para ${paraNumber}`}</Text>
          <Text style={styles.subtitle}>
            Para {paraNumber}
            {ayahs.length ? ` • ${ayahs.length} Ayahs` : ''}
            {pageRange ? ` • ${pageRange}` : ''}
          </Text>
        </View>
        <Feather name="book-open" size={20} color={colors.primary || '#0D9488'} />
      </View>

      {/* Main Content List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="wifi-off" size={24} color={colors.gray400 || '#9CA3AF'} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item) => item.key}
          renderItem={renderSection}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200 || '#E5E7EB',
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },

  section: {
    marginBottom: 24,
  },

  /* Traditional Surah Header Banner */
  surahBanner: {
    backgroundColor: colors.accentLight || '#F0FDFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary || '#0D9488',
    padding: 3,
    marginBottom: 16,
  },
  bannerBorderInner: {
    borderWidth: 1,
    borderColor: 'rgba(13, 148, 136, 0.3)',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  surahNameArabic: {
    fontFamily: 'Amiri_700Bold',
    fontSize: 22,
    color: colors.primaryDark || '#0F172A',
  },
  surahMeta: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    marginTop: 2,
    fontWeight: '600',
  },

  /* Traditional Mushaf Border Frame */
  mushafPaper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.gray200 || '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  flowText: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 23,
    lineHeight: 52,
    color: colors.gray900 || '#111827',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  ayahSymbolText: {
    fontSize: 20,
    color: colors.primary || '#0D9488',
    fontWeight: '700',
  },

  errorBox: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  errorText: {
    color: colors.gray500 || '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});