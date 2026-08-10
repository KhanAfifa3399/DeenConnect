import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

function formatTime(ms) {
  if (!ms) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  return `${Math.floor(totalSec / 60)}:${String(totalSec % 60).padStart(2, '0')}`;
}

function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, position, duration, togglePlayPause, closePlayer } = useAudioPlayer();

  if (!currentTrack) return null;

  const progress = duration > 0 ? position / duration : 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Feather name="headphones" size={16} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{currentTrack.title}</Text>
          <Text style={styles.time}>{formatTime(position)} / {formatTime(duration)}</Text>
        </View>
        <Pressable style={styles.controlBtn} onPress={togglePlayPause} hitSlop={10}>
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Feather name={isPlaying ? 'pause' : 'play'} size={18} color={colors.white} />
          )}
        </Pressable>
        <Pressable style={styles.controlBtn} onPress={closePlayer} hitSlop={10}>
          <Feather name="x" size={16} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute', left: spacing.space3, right: spacing.space3, bottom: 68,
    backgroundColor: colors.primaryDark, borderRadius: spacing.radiusLg, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 6,
  },
  progressTrack: { height: 3, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressFill: { height: '100%', backgroundColor: colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.space3, paddingHorizontal: spacing.space4, paddingVertical: spacing.space3 },
  iconWrap: { width: 32, height: 32, borderRadius: spacing.radiusFull, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.white, fontSize: typography.fontSizeSm, fontWeight: typography.weightSemibold },
  time: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },
  controlBtn: { width: 32, height: 32, borderRadius: spacing.radiusFull, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
});

export default MiniPlayer;