import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

function getSurahAudioUrl(surahNumber) {
  return `https://server8.mp3quran.net/afs/${String(surahNumber).padStart(3, '0')}.mp3`;
}

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}

function SurahReaderModal({ visible, surahNumber, surahName, onClose }) {
  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentTrack, isPlaying, isLoading: audioLoading, position, duration, playTrack, togglePlayPause } = useAudioPlayer();

  const trackId = `surah-${surahNumber}`;
  const isThisPlaying = currentTrack?.id === trackId;

  useEffect(() => {
    if (!visible || !surahNumber) return;
    setLoading(true);
    setError('');
    fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-uthmani`)
      .then((res) => res.json())
      .then((json) => setAyahs(json.data?.ayahs || []))
      .catch(() => setError('Could not load the Surah text. Check your connection.'))
      .finally(() => setLoading(false));
  }, [visible, surahNumber]);

  function handlePlayPause() {
    if (isThisPlaying) {
      togglePlayPause();
    } else {
      playTrack({ id: trackId, title: `Surah ${surahName}`, uri: getSurahAudioUrl(surahNumber) });
    }
  }

  const progress = isThisPlaying && duration > 0 ? position / duration : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.surahTitle}>Surah {surahName}</Text>
              <Text style={styles.surahSubtitle}>No. {surahNumber}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Feather name="chevron-down" size={22} color={colors.gray600} />
            </Pressable>
          </View>

          <View style={styles.playerBar}>
            <Pressable style={styles.playBtn} onPress={handlePlayPause}>
              {isThisPlaying && audioLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name={isThisPlaying && isPlaying ? 'pause' : 'play'} size={18} color={colors.white} />
              )}
            </Pressable>
            <View style={{ flex: 1 }}>
              <View style={styles.playerTrack}>
                <View style={[styles.playerFill, { width: `${(isThisPlaying ? progress : 0) * 100}%` }]} />
              </View>
              <Text style={styles.playerTime}>
                {isThisPlaying ? `${formatTime(position)} / ${formatTime(duration)}` : 'Tap play to listen while you read'}
              </Text>
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.space10 }} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Feather name="wifi-off" size={22} color={colors.gray300} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <ScrollView style={styles.ayahScroll} contentContainerStyle={styles.ayahContent} showsVerticalScrollIndicator={false}>
              {ayahs.map((ayah) => (
                <View key={ayah.number} style={styles.ayahRow}>
                  <View style={styles.ayahNumberBadge}>
                    <Text style={styles.ayahNumberText}>{ayah.numberInSurah}</Text>
                  </View>
                  <Text style={styles.ayahArabic}>{ayah.text}</Text>
                </View>
              ))}
              <View style={{ height: spacing.space10 }} />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,20,20,0.5)' },
  sheet: { height: '85%', backgroundColor: colors.white, borderTopLeftRadius: spacing.radiusXl, borderTopRightRadius: spacing.radiusXl, paddingTop: spacing.space2 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.gray200, alignSelf: 'center', marginVertical: spacing.space2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.space5, paddingBottom: spacing.space3 },
  surahTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.primaryDark },
  surahSubtitle: { fontSize: typography.fontSizeXs, color: colors.gray500, marginTop: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  playerBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, marginHorizontal: spacing.space5, marginBottom: spacing.space4, backgroundColor: colors.accentLight, borderRadius: spacing.radiusLg, padding: spacing.space3 },
  playBtn: { width: 38, height: 38, borderRadius: spacing.radiusFull, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  playerTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' },
  playerFill: { height: '100%', backgroundColor: colors.primary },
  playerTime: { fontSize: 11, color: colors.primaryDark, marginTop: 4 },
  errorBox: { alignItems: 'center', gap: spacing.space2, marginTop: spacing.space10 },
  errorText: { color: colors.gray500, fontSize: typography.fontSizeSm, textAlign: 'center', paddingHorizontal: spacing.space6 },
  ayahScroll: { flex: 1 },
  ayahContent: { paddingHorizontal: spacing.space5, paddingTop: spacing.space2 },
  ayahRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.space3, paddingVertical: spacing.space4, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  ayahNumberBadge: { width: 26, height: 26, borderRadius: spacing.radiusFull, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ayahNumberText: { fontSize: 11, color: colors.primary, fontWeight: typography.weightBold },
  ayahArabic: { flex: 1, fontFamily: 'Amiri_400Regular', fontSize: 24, lineHeight: 46, color: colors.gray900, textAlign: 'right', writingDirection: 'rtl' },
});

export default SurahReaderModal;