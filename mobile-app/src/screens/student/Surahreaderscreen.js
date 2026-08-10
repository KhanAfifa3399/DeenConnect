import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAudioPlayer } from '../../context/AudioPlayerContext';

const REPEAT_OPTIONS = [1, 3, 5, 7, 10];
const MODES = [
  { key: 'ayah', label: 'Ayah by Ayah' },
  { key: 'full', label: 'Full Surah' },
];

// Per-ayah recitation + Arabic text (Alafasy). Each ayah in the response
// carries its own "audio" URL, which is what makes ayah-wise repeat possible.
function getSurahDataUrl(surahNumber) {
  return `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`;
}

// Full continuous Surah recitation (single file), used for "Full Surah" mode.
function getFullSurahAudioUrl(surahNumber) {
  return `https://server8.mp3quran.net/afs/${String(surahNumber).padStart(3, '0')}.mp3`;
}

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}

function SurahReaderScreen({ route, navigation }) {
  const { surahNumber, surahName } = route.params || {};

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('ayah');

  // ---- Full Surah (single continuous file) — via the global mini-player ----
  const { currentTrack, isPlaying: fullIsPlaying, isLoading: fullLoading, position, duration, playTrack, togglePlayPause } = useAudioPlayer();
  const fullTrackId = `surah-${surahNumber}`;
  const isFullThisPlaying = currentTrack?.id === fullTrackId;
  const fullProgress = isFullThisPlaying && duration > 0 ? position / duration : 0;

  function handleFullPlayPause() {
    if (isFullThisPlaying) {
      togglePlayPause();
    } else {
      playTrack({ id: fullTrackId, title: `Surah ${surahName}`, uri: getFullSurahAudioUrl(surahNumber) });
    }
  }

  // ---- Ayah by Ayah repeat player (own local Audio.Sound instance) ----
  const [currentIndex, setCurrentIndex] = useState(0);
  const [repeatTarget, setRepeatTarget] = useState(3);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [ayahIsPlaying, setAyahIsPlaying] = useState(false);
  const [ayahLoading, setAyahLoading] = useState(false);
  const [repeatsDone, setRepeatsDone] = useState(0);
  const [surahComplete, setSurahComplete] = useState(false);
  const [ayahAudioError, setAyahAudioError] = useState('');

  const soundRef = useRef(null);
  const repeatsDoneRef = useRef(0);
  const targetRef = useRef(3);
  const currentIndexRef = useRef(0);
  const stoppedRef = useRef(false);
  const listRef = useRef(null);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    if (!surahNumber) return;
    setLoading(true);
    setError('');
    fetch(getSurahDataUrl(surahNumber))
      .then((res) => res.json())
      .then((json) => setAyahs(json.data?.ayahs || []))
      .catch(() => setError('Could not load the Surah text. Check your connection.'))
      .finally(() => setLoading(false));
  }, [surahNumber]);

  // Stop ayah-mode audio when leaving the screen entirely.
  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  // Keep only one thing playing at a time between the two modes.
  useEffect(() => {
    if (mode === 'ayah' && isFullThisPlaying) {
      togglePlayPause();
    } else if (mode === 'full' && ayahIsPlaying) {
      pauseAyah();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function scrollToIndex(index) {
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.25 });
    });
  }

  async function handleAyahStatus(status) {
    if (!status.isLoaded) return;
    if (status.didJustFinish && !stoppedRef.current) {
      repeatsDoneRef.current += 1;
      setRepeatsDone(repeatsDoneRef.current);
      if (repeatsDoneRef.current < targetRef.current) {
        await soundRef.current?.setPositionAsync(0);
        await soundRef.current?.playAsync();
      } else {
        const nextIndex = currentIndexRef.current + 1;
        if (nextIndex < ayahs.length) {
          setCurrentIndex(nextIndex);
          currentIndexRef.current = nextIndex;
          scrollToIndex(nextIndex);
          await loadAndPlayAyah(nextIndex, true);
        } else {
          setAyahIsPlaying(false);
          setSurahComplete(true);
        }
      }
    }
  }

  async function loadAndPlayAyah(index, autoplay) {
    const ayah = ayahs[index];
    if (!ayah) return;
    stoppedRef.current = false;
    setAyahAudioError('');
    setSurahComplete(false);

    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (err) { /* ignore */ }
      soundRef.current = null;
    }

    if (!ayah.audio) {
      setAyahAudioError('Audio not available for this ayah.');
      setAyahIsPlaying(false);
      return;
    }

    repeatsDoneRef.current = 0;
    setRepeatsDone(0);
    targetRef.current = repeatTarget;
    setAyahLoading(true);
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: ayah.audio },
        { shouldPlay: autoplay },
        handleAyahStatus
      );
      soundRef.current = sound;
      setAyahIsPlaying(autoplay);
    } catch (err) {
      console.error('Failed to play ayah audio:', err);
      setAyahAudioError('Could not play this ayah audio.');
      setAyahIsPlaying(false);
    } finally {
      setAyahLoading(false);
    }
  }

  async function pauseAyah() {
    setAyahIsPlaying(false);
    if (soundRef.current) {
      try { await soundRef.current.pauseAsync(); } catch (err) { /* ignore */ }
    }
  }

  async function handleAyahPlayPause() {
    if (ayahIsPlaying) {
      await pauseAyah();
      return;
    }
    if (soundRef.current) {
      try {
        await soundRef.current.playAsync();
        setAyahIsPlaying(true);
      } catch (err) { /* ignore */ }
    } else {
      await loadAndPlayAyah(currentIndex, true);
    }
  }

  async function goToAyah(index) {
    if (index < 0 || index >= ayahs.length) return;
    const wasPlaying = ayahIsPlaying;
    stoppedRef.current = true;
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (err) { /* ignore */ }
      soundRef.current = null;
    }
    setCurrentIndex(index);
    currentIndexRef.current = index;
    setRepeatsDone(0);
    setSurahComplete(false);
    scrollToIndex(index);

    if (wasPlaying) {
      await loadAndPlayAyah(index, true);
    } else {
      setAyahIsPlaying(false);
    }
  }

  function goNext() {
    goToAyah(currentIndex + 1);
  }

  function goPrev() {
    goToAyah(currentIndex - 1);
  }

  function selectRepeat(n) {
    setIsCustom(false);
    setRepeatTarget(n);
    targetRef.current = n;
  }

  function selectCustom() {
    setIsCustom(true);
    const parsed = parseInt(customValue, 10);
    if (parsed > 0) {
      setRepeatTarget(parsed);
      targetRef.current = parsed;
    }
  }

  function onCustomChange(text) {
    setCustomValue(text);
    const parsed = parseInt(text, 10);
    if (parsed > 0) {
      setRepeatTarget(parsed);
      targetRef.current = parsed;
    }
  }

  const renderAyah = useCallback(({ item, index }) => {
    const isActive = mode === 'ayah' && index === currentIndex;
    const Row = mode === 'ayah' ? Pressable : View;
    return (
      <Row
        style={[styles.ayahRow, isActive && styles.ayahRowActive]}
        onPress={mode === 'ayah' ? () => goToAyah(index) : undefined}
      >
        <View style={[styles.ayahNumberBadge, isActive && styles.ayahNumberBadgeActive]}>
          <Text style={[styles.ayahNumberText, isActive && styles.ayahNumberTextActive]}>
            {item.numberInSurah}
          </Text>
        </View>
        <Text style={styles.ayahArabic}>{item.text}</Text>
        {isActive && (
          <View style={styles.activeIndicator}>
            {ayahLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Feather name={ayahIsPlaying ? 'volume-2' : 'pause-circle'} size={16} color={colors.primary} />
            )}
          </View>
        )}
      </Row>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, currentIndex, ayahIsPlaying, ayahLoading]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={20} color={colors.gray700} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.surahTitle}>Surah {surahName}</Text>
          <Text style={styles.surahSubtitle}>No. {surahNumber}{ayahs.length ? ` · ${ayahs.length} Ayahs` : ''}</Text>
        </View>
      </View>

      <View style={styles.modeRow}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            style={[styles.modeButton, mode === m.key && styles.modeButtonActive]}
            onPress={() => setMode(m.key)}
          >
            <Text style={[styles.modeButtonText, mode === m.key && styles.modeButtonTextActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode === 'full' ? (
        <View style={styles.playerBar}>
          <Pressable style={styles.playBtn} onPress={handleFullPlayPause}>
            {isFullThisPlaying && fullLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Feather name={isFullThisPlaying && fullIsPlaying ? 'pause' : 'play'} size={18} color={colors.white} />
            )}
          </Pressable>
          <View style={{ flex: 1 }}>
            <View style={styles.playerTrack}>
              <View style={[styles.playerFill, { width: `${(isFullThisPlaying ? fullProgress : 0) * 100}%` }]} />
            </View>
            <Text style={styles.playerTime}>
              {isFullThisPlaying ? `${formatTime(position)} / ${formatTime(duration)}` : 'Tap play to listen while you read'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.ayahControls}>
          <View style={styles.navRow}>
            <Pressable
              style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
              onPress={goPrev}
              disabled={currentIndex === 0}
            >
              <Feather name="skip-back" size={18} color={currentIndex === 0 ? colors.gray300 : colors.primaryDark} />
            </Pressable>

            <Pressable style={styles.ayahPlayBtn} onPress={handleAyahPlayPause} disabled={ayahLoading}>
              {ayahLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Feather name={ayahIsPlaying ? 'pause' : 'play'} size={20} color={colors.white} />
              )}
            </Pressable>

            <Pressable
              style={[styles.navBtn, currentIndex >= ayahs.length - 1 && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={currentIndex >= ayahs.length - 1}
            >
              <Feather name="skip-forward" size={18} color={currentIndex >= ayahs.length - 1 ? colors.gray300 : colors.primaryDark} />
            </Pressable>
          </View>

          <View style={styles.statusRow}>
            <Text style={styles.statusText}>
              Ayah {ayahs[currentIndex]?.numberInSurah ?? currentIndex + 1} of {ayahs.length}
            </Text>
            {ayahIsPlaying && repeatTarget > 1 && (
              <Text style={styles.statusText}>Repeat {repeatsDone + 1} / {repeatTarget}</Text>
            )}
            {surahComplete && (
              <View style={styles.completeBadge}>
                <Feather name="check" size={11} color={colors.success} />
                <Text style={styles.completeBadgeText}>Surah Complete</Text>
              </View>
            )}
          </View>

          <View style={styles.repeatRow}>
            <Text style={styles.repeatLabel}>Repeat each ayah:</Text>
            {REPEAT_OPTIONS.map((n) => (
              <Pressable
                key={n}
                style={[styles.repeatChip, !isCustom && repeatTarget === n && styles.repeatChipActive]}
                onPress={() => selectRepeat(n)}
              >
                <Text style={[styles.repeatChipText, !isCustom && repeatTarget === n && styles.repeatChipTextActive]}>
                  {n}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={[styles.repeatChip, isCustom && styles.repeatChipActive]}
              onPress={selectCustom}
            >
              <Text style={[styles.repeatChipText, isCustom && styles.repeatChipTextActive]}>Custom</Text>
            </Pressable>
            {isCustom && (
              <TextInput
                style={styles.customInput}
                value={customValue}
                onChangeText={onCustomChange}
                placeholder="#"
                keyboardType="number-pad"
                placeholderTextColor={colors.gray400}
              />
            )}
          </View>

          {ayahAudioError ? <Text style={styles.errorText}>{ayahAudioError}</Text> : null}
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.space10 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="wifi-off" size={22} color={colors.gray300} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={renderAyah}
          contentContainerStyle={styles.ayahContent}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({ offset: (averageItemLength || 100) * index, animated: true });
            setTimeout(() => listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.25 }), 150);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    paddingHorizontal: spacing.space5, paddingTop: spacing.space3, paddingBottom: spacing.space2,
  },
  backBtn: { width: 36, height: 36, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100, alignItems: 'center', justifyContent: 'center' },
  surahTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.primaryDark },
  surahSubtitle: { fontSize: typography.fontSizeXs, color: colors.gray500, marginTop: 1 },

  modeRow: {
    flexDirection: 'row', paddingHorizontal: spacing.space5, gap: spacing.space2, marginBottom: spacing.space3,
  },
  modeButton: {
    paddingHorizontal: spacing.space3, paddingVertical: spacing.space2,
    borderRadius: spacing.radiusFull, backgroundColor: colors.gray100,
  },
  modeButtonActive: { backgroundColor: colors.primary },
  modeButtonText: { fontSize: typography.fontSizeXs, color: colors.gray600, fontWeight: typography.weightMedium },
  modeButtonTextActive: { color: colors.white },

  playerBar: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, marginHorizontal: spacing.space5, marginBottom: spacing.space4, backgroundColor: colors.accentLight, borderRadius: spacing.radiusLg, padding: spacing.space3 },
  playBtn: { width: 38, height: 38, borderRadius: spacing.radiusFull, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  playerTrack: { height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2, overflow: 'hidden' },
  playerFill: { height: '100%', backgroundColor: colors.primary },
  playerTime: { fontSize: 11, color: colors.primaryDark, marginTop: 4 },

  ayahControls: {
    marginHorizontal: spacing.space5, marginBottom: spacing.space3, backgroundColor: colors.accentLight,
    borderRadius: spacing.radiusLg, padding: spacing.space4, gap: spacing.space3,
  },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.space5 },
  navBtn: { width: 38, height: 38, borderRadius: spacing.radiusFull, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  navBtnDisabled: { opacity: 0.5 },
  ayahPlayBtn: { width: 54, height: 54, borderRadius: spacing.radiusFull, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.space3, flexWrap: 'wrap' },
  statusText: { fontSize: typography.fontSizeXs, color: colors.primaryDark, fontWeight: typography.weightMedium },
  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(46,125,50,0.12)',
    paddingHorizontal: spacing.space3, paddingVertical: 3, borderRadius: spacing.radiusFull,
  },
  completeBadgeText: { fontSize: 10, color: colors.success, fontWeight: typography.weightSemibold },
  repeatRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  repeatLabel: { fontSize: 11, color: colors.gray600, marginRight: 2 },
  repeatChip: { paddingHorizontal: spacing.space3, paddingVertical: 4, borderRadius: spacing.radiusFull, backgroundColor: colors.white },
  repeatChipActive: { backgroundColor: colors.primary },
  repeatChipText: { fontSize: 11, color: colors.gray700, fontWeight: typography.weightMedium },
  repeatChipTextActive: { color: colors.white },
  customInput: {
    width: 44, borderWidth: 1, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space2, paddingVertical: 3, fontSize: 11, color: colors.gray900, backgroundColor: colors.white,
  },

  errorBox: { alignItems: 'center', gap: spacing.space2, marginTop: spacing.space10 },
  errorText: { color: colors.gray500, fontSize: typography.fontSizeSm, textAlign: 'center', paddingHorizontal: spacing.space6 },
  ayahContent: { paddingHorizontal: spacing.space5, paddingBottom: spacing.space10 },
  ayahRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: spacing.space3, paddingVertical: spacing.space4, borderBottomWidth: 1, borderBottomColor: colors.gray100 },
  ayahRowActive: { backgroundColor: colors.gray50, borderRadius: spacing.radiusMd, borderBottomWidth: 0, paddingHorizontal: spacing.space2 },
  ayahNumberBadge: { width: 26, height: 26, borderRadius: spacing.radiusFull, borderWidth: 1, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ayahNumberBadgeActive: { backgroundColor: colors.primary },
  ayahNumberText: { fontSize: 11, color: colors.primary, fontWeight: typography.weightBold },
  ayahNumberTextActive: { color: colors.white },
  ayahArabic: { flex: 1, fontFamily: 'Amiri_400Regular', fontSize: 24, lineHeight: 46, color: colors.gray900, textAlign: 'right', writingDirection: 'rtl' },
  activeIndicator: { marginTop: 6 },
});

export default SurahReaderScreen;