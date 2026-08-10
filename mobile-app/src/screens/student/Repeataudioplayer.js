import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

const REPEAT_OPTIONS = [1, 3, 5, 7, 10];

function RepeatAudioPlayer({ audioUri, label }) {
  const [repeatTarget, setRepeatTarget] = useState(1);
  const [customValue, setCustomValue] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState('');
  const soundRef = useRef(null);
  const repeatsDoneRef = useRef(0);
  const targetRef = useRef(1);
  const stoppedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, []);

  function selectRepeat(n) {
    setIsCustom(false);
    setRepeatTarget(n);
  }

  function selectCustom() {
    setIsCustom(true);
    const parsed = parseInt(customValue, 10);
    if (parsed > 0) setRepeatTarget(parsed);
  }

  function onCustomChange(text) {
    setCustomValue(text);
    const parsed = parseInt(text, 10);
    if (parsed > 0) setRepeatTarget(parsed);
  }

  async function handlePlaybackStatusUpdate(status) {
    if (!status.isLoaded) return;
    if (status.didJustFinish && !stoppedRef.current) {
      repeatsDoneRef.current += 1;
      setCompletedCount(repeatsDoneRef.current);
      if (repeatsDoneRef.current < targetRef.current) {
        await soundRef.current.setPositionAsync(0);
        await soundRef.current.playAsync();
      } else {
        setIsPlaying(false);
        setIsComplete(true);
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    }
  }

  async function handlePlay() {
    if (!audioUri) return;
    setError('');
    setIsComplete(false);
    repeatsDoneRef.current = 0;
    targetRef.current = repeatTarget;
    stoppedRef.current = false;
    setCompletedCount(0);
    setIsLoading(true);

    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        handlePlaybackStatusUpdate
      );
      soundRef.current = sound;
      setIsPlaying(true);
    } catch (err) {
      console.error('Failed to play audio:', err);
      setError('Could not play this audio.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStop() {
    stoppedRef.current = true;
    setIsPlaying(false);
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (err) {
        // ignore
      }
      soundRef.current = null;
    }
  }

  if (!audioUri) {
    return (
      <View style={styles.unavailableBox}>
        <Feather name="volume-x" size={13} color={colors.gray400} />
        <Text style={styles.unavailableText}>No audio available yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Pressable
          style={[styles.playButton, isPlaying && styles.playButtonActive]}
          onPress={isPlaying ? handleStop : handlePlay}
          disabled={isLoading}
        >
          <Feather name={isPlaying ? 'square' : 'play'} size={14} color={colors.white} />
          <Text style={styles.playButtonText}>
            {isLoading ? 'Loading...' : isPlaying ? 'Stop' : 'Play'}
          </Text>
        </Pressable>

        {isPlaying && repeatTarget > 1 && (
          <Text style={styles.progressText}>{completedCount + 1} / {repeatTarget}</Text>
        )}
        {isComplete && (
          <View style={styles.completeBadge}>
            <Feather name="check" size={11} color={colors.success} />
            <Text style={styles.completeBadgeText}>Repeat Complete</Text>
          </View>
        )}
      </View>

      <View style={styles.repeatRow}>
        <Text style={styles.repeatLabel}>Repeat:</Text>
        {REPEAT_OPTIONS.map((n) => (
          <Pressable
            key={n}
            style={[styles.repeatChip, !isCustom && repeatTarget === n && styles.repeatChipActive]}
            onPress={() => selectRepeat(n)}
            disabled={isPlaying}
          >
            <Text style={[styles.repeatChipText, !isCustom && repeatTarget === n && styles.repeatChipTextActive]}>
              {n}
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[styles.repeatChip, isCustom && styles.repeatChipActive]}
          onPress={selectCustom}
          disabled={isPlaying}
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
            editable={!isPlaying}
            placeholderTextColor={colors.gray400}
          />
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.space2, gap: spacing.space2 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3 },
  playButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primary,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space2, borderRadius: spacing.radiusFull,
  },
  playButtonActive: { backgroundColor: colors.error },
  playButtonText: { color: colors.white, fontSize: typography.fontSizeXs, fontWeight: typography.weightSemibold },
  progressText: { fontSize: typography.fontSizeXs, color: colors.gray600, fontWeight: typography.weightMedium },
  completeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(46,125,50,0.1)',
    paddingHorizontal: spacing.space3, paddingVertical: 3, borderRadius: spacing.radiusFull,
  },
  completeBadgeText: { fontSize: 10, color: colors.success, fontWeight: typography.weightSemibold },
  repeatRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 },
  repeatLabel: { fontSize: 11, color: colors.gray500, marginRight: 2 },
  repeatChip: { paddingHorizontal: spacing.space3, paddingVertical: 4, borderRadius: spacing.radiusFull, backgroundColor: colors.gray100 },
  repeatChipActive: { backgroundColor: colors.primary },
  repeatChipText: { fontSize: 11, color: colors.gray700, fontWeight: typography.weightMedium },
  repeatChipTextActive: { color: colors.white },
  customInput: {
    width: 44, borderWidth: 1, borderColor: colors.gray200, borderRadius: spacing.radiusMd,
    paddingHorizontal: spacing.space2, paddingVertical: 3, fontSize: 11, color: colors.gray900,
  },
  unavailableBox: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: spacing.space2 },
  unavailableText: { fontSize: 11, color: colors.gray400, fontStyle: 'italic' },
  errorText: { fontSize: 11, color: colors.error },
});

export default RepeatAudioPlayer;							