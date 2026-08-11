import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
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

function getSurahDataUrl(surahNumber) {
  return `https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`;
}

function getFullSurahAudioUrl(surahNumber) {
  return `https://server8.mp3quran.net/afs/${String(surahNumber).padStart(3, '0')}.mp3`;
}

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}

export default function SurahReaderScreen({ route, navigation }) {
  const { surahNumber = 1, surahName = 'Al-Fatiha' } = route.params || {};

  const [ayahs, setAyahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('ayah');

  // Full Surah player context
  const {
    currentTrack,
    isPlaying: fullIsPlaying,
    isLoading: fullLoading,
    position,
    duration,
    playTrack,
    togglePlayPause,
  } = useAudioPlayer();

  const fullTrackId = `surah-${surahNumber}`;
  const isFullThisPlaying = currentTrack?.id === fullTrackId;
  const fullProgress = isFullThisPlaying && duration > 0 ? position / duration : 0;

  function handleFullPlayPause() {
    if (isFullThisPlaying) {
      togglePlayPause();
    } else {
      playTrack({
        id: fullTrackId,
        title: `Surah ${surahName}`,
        uri: getFullSurahAudioUrl(surahNumber),
      });
    }
  }

  // Ayah repeat player state
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
      .catch(() => setError('Could not load Surah text. Check internet connection.'))
      .finally(() => setLoading(false));
  }, [surahNumber]);

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    if (mode === 'ayah' && isFullThisPlaying) {
      togglePlayPause();
    } else if (mode === 'full' && ayahIsPlaying) {
      pauseAyah();
    }
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
      try { await soundRef.current.unloadAsync(); } catch (err) {}
      soundRef.current = null;
    }

    if (!ayah.audio) {
      setAyahAudioError('Audio not available.');
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
      setAyahAudioError('Could not play audio.');
      setAyahIsPlaying(false);
    } finally {
      setAyahLoading(false);
    }
  }

  async function pauseAyah() {
    setAyahIsPlaying(false);
    if (soundRef.current) {
      try { await soundRef.current.pauseAsync(); } catch (err) {}
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
      } catch (err) {}
    } else {
      await loadAndPlayAyah(currentIndex, true);
    }
  }

  async function goToAyah(index) {
    if (index < 0 || index >= ayahs.length) return;
    const wasPlaying = ayahIsPlaying;
    stoppedRef.current = true;
    if (soundRef.current) {
      try { await soundRef.current.unloadAsync(); } catch (err) {}
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

  const renderAyah = useCallback(
    ({ item, index }) => {
      const isActive = mode === 'ayah' && index === currentIndex;
      const Row = mode === 'ayah' ? Pressable : View;
      return (
        <Row
          style={[styles.ayahCard, isActive && styles.ayahCardActive]}
          onPress={mode === 'ayah' ? () => goToAyah(index) : undefined}
        >
          <View style={styles.ayahHeader}>
            <View style={[styles.badge, isActive && styles.badgeActive]}>
              <Text style={[styles.badgeText, isActive && styles.badgeTextActive]}>
                {item.numberInSurah}
              </Text>
            </View>
            {isActive && (
              <View style={styles.playingTag}>
                <Feather
                  name={ayahIsPlaying ? 'activity' : 'pause'}
                  size={12}
                  color={colors.primary || '#0D9488'}
                />
                <Text style={styles.playingTagText}>
                  {ayahIsPlaying ? 'Playing' : 'Paused'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.ayahArabic}>{item.text}</Text>
        </Row>
      );
    },
    [mode, currentIndex, ayahIsPlaying]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.gray700 || '#374151'} />
        </Pressable>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.surahTitle}>Surah {surahName}</Text>
          <Text style={styles.surahSubtitle}>
            Surah {surahNumber} {ayahs.length ? `• ${ayahs.length} Ayahs` : ''}
          </Text>
        </View>
        <Feather name="bar-chart-2" size={20} color={colors.primary || '#0D9488'} />
      </View>

      {/* Mode Switcher */}
      <View style={styles.modeContainer}>
        {MODES.map((m) => (
          <Pressable
            key={m.key}
            style={[styles.modeTab, mode === m.key && styles.modeTabActive]}
            onPress={() => setMode(m.key)}
          >
            <Text style={[styles.modeText, mode === m.key && styles.modeTextActive]}>
              {m.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Ayahs List */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary || '#0D9488'} style={{ marginTop: 40 }} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Feather name="wifi-off" size={24} color={colors.gray400 || '#9CA3AF'} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={ayahs}
          keyExtractor={(item) => String(item.number)}
          renderItem={renderAyah}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onScrollToIndexFailed={({ index, averageItemLength }) => {
            listRef.current?.scrollToOffset({
              offset: (averageItemLength || 100) * index,
              animated: true,
            });
            setTimeout(
              () =>
                listRef.current?.scrollToIndex({
                  index,
                  animated: true,
                  viewPosition: 0.25,
                }),
              150
            );
          }}
        />
      )}

      {/* Light Dynamic Floating Control Player Card */}
      <View style={styles.bottomCardContainer}>
        {mode === 'full' ? (
          <View style={styles.playerCard}>
            <Pressable style={styles.mainPlayBtn} onPress={handleFullPlayPause}>
              {isFullThisPlaying && fullLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Feather
                  name={isFullThisPlaying && fullIsPlaying ? 'pause' : 'play'}
                  size={20}
                  color="#FFFFFF"
                />
              )}
            </Pressable>

            <View style={styles.playerDetails}>
              <View style={styles.playerTitleRow}>
                <Text style={styles.playerTitle}>Surah {surahName}</Text>
                <Text style={styles.playerTimeText}>
                  {isFullThisPlaying
                    ? `${formatTime(position)} / ${formatTime(duration)}`
                    : 'Full Recitation'}
                </Text>
              </View>
              <View style={styles.trackBackground}>
                <View
                  style={[
                    styles.trackFill,
                    { width: `${(isFullThisPlaying ? fullProgress : 0) * 100}%` },
                  ]}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.playerCardVertical}>
            {/* Control Bar Top */}
            <View style={styles.playerMainRow}>
              <Pressable
                style={[styles.smallNavBtn, currentIndex === 0 && styles.btnDisabled]}
                onPress={() => goToAyah(currentIndex - 1)}
                disabled={currentIndex === 0}
              >
                <Feather name="skip-back" size={18} color={colors.gray600 || '#4B5563'} />
              </Pressable>

              <Pressable
                style={styles.mainPlayBtn}
                onPress={handleAyahPlayPause}
                disabled={ayahLoading}
              >
                {ayahLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Feather
                    name={ayahIsPlaying ? 'pause' : 'play'}
                    size={22}
                    color="#FFFFFF"
                  />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.smallNavBtn,
                  currentIndex >= ayahs.length - 1 && styles.btnDisabled,
                ]}
                onPress={() => goToAyah(currentIndex + 1)}
                disabled={currentIndex >= ayahs.length - 1}
              >
                <Feather name="skip-forward" size={18} color={colors.gray600 || '#4B5563'} />
              </Pressable>

              <View style={styles.statusInfo}>
                <Text style={styles.statusPrimaryText}>
                  Ayah {ayahs[currentIndex]?.numberInSurah ?? currentIndex + 1} / {ayahs.length}
                </Text>
                {ayahIsPlaying && repeatTarget > 1 && (
                  <Text style={styles.statusSecondaryText}>
                    Repeat {repeatsDone + 1} of {repeatTarget}
                  </Text>
                )}
              </View>

              {surahComplete && (
                <View style={styles.completedBadge}>
                  <Feather name="check" size={12} color={colors.primary || '#0D9488'} />
                </View>
              )}
            </View>

            {/* Repeat Selectors Row */}
            <View style={styles.repeatControlsRow}>
              {REPEAT_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  style={[
                    styles.repeatOption,
                    !isCustom && repeatTarget === n && styles.repeatOptionActive,
                  ]}
                  onPress={() => selectRepeat(n)}
                >
                  <Text
                    style={[
                      styles.repeatOptionText,
                      !isCustom && repeatTarget === n && styles.repeatOptionTextActive,
                    ]}
                  >
                    {n}x
                  </Text>
                </Pressable>
              ))}
              <Pressable
                style={[styles.repeatOption, isCustom && styles.repeatOptionActive]}
                onPress={selectCustom}
              >
                <Text
                  style={[
                    styles.repeatOptionText,
                    isCustom && styles.repeatOptionTextActive,
                  ]}
                >
                  Custom
                </Text>
              </Pressable>
              {isCustom && (
                <TextInput
                  style={styles.customInput}
                  value={customValue}
                  onChangeText={onCustomChange}
                  placeholder="#"
                  keyboardType="number-pad"
                  placeholderTextColor={colors.gray400 || '#9CA3AF'}
                />
              )}
            </View>
            {ayahAudioError ? (
              <Text style={styles.audioErrorText}>{ayahAudioError}</Text>
            ) : null}
          </View>
        )}
      </View>
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
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  surahTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },
  surahSubtitle: {
    fontSize: 12,
    color: colors.gray500 || '#6B7280',
    marginTop: 2,
  },

  modeContainer: {
    flexDirection: 'row',
    backgroundColor: colors.gray100 || '#F3F4F6',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 4,
    marginVertical: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  modeText: {
    fontSize: 13,
    color: colors.gray600 || '#4B5563',
    fontWeight: '600',
  },
  modeTextActive: {
    color: colors.primary || '#0D9488',
  },

  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 160,
  },
  ayahCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  ayahCardActive: {
    borderColor: colors.primary || '#0D9488',
    backgroundColor: colors.accentLight || '#F0FDFA',
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  badge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },
  badgeActive: {
    backgroundColor: colors.primary || '#0D9488',
    borderColor: colors.primary || '#0D9488',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray700 || '#374151',
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  playingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  playingTagText: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    fontWeight: '600',
  },
  ayahArabic: {
    fontFamily: 'Amiri_400Regular',
    fontSize: 22,
    lineHeight: 44,
    color: colors.gray900 || '#111827',
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  bottomCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  playerCardVertical: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  playerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  mainPlayBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary || '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallNavBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gray100 || '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  playerDetails: {
    flex: 1,
  },
  playerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  playerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },
  playerTimeText: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
  },
  trackBackground: {
    height: 4,
    backgroundColor: colors.gray200 || '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: colors.primary || '#0D9488',
  },

  statusInfo: {
    flex: 1,
  },
  statusPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark || '#0F172A',
  },
  statusSecondaryText: {
    fontSize: 11,
    color: colors.primary || '#0D9488',
    marginTop: 2,
  },
  completedBadge: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },

  repeatControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: colors.gray100 || '#F3F4F6',
    paddingTop: 10,
  },
  repeatLabel: {
    fontSize: 11,
    color: colors.gray500 || '#6B7280',
    marginRight: 2,
  },
  repeatOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.gray100 || '#F3F4F6',
  },
  repeatOptionActive: {
    backgroundColor: colors.primary || '#0D9488',
  },
  repeatOptionText: {
    fontSize: 11,
    color: colors.gray700 || '#374151',
    fontWeight: '600',
  },
  repeatOptionTextActive: {
    color: '#FFFFFF',
  },
  customInput: {
    width: 38,
    backgroundColor: colors.gray100 || '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 11,
    color: colors.gray900 || '#111827',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.gray200 || '#E5E7EB',
  },

  errorBox: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  errorText: {
    color: colors.gray500 || '#6B7280',
    fontSize: 14,
  },
  audioErrorText: {
    color: '#EF4444',
    fontSize: 11,
    textAlign: 'center',
  },
});