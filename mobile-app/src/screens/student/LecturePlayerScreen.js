import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, ScrollView, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useState, useRef } from 'react';
import { Feather } from '@expo/vector-icons';
import { PanResponder } from 'react-native';
// import * as FileSystem from 'expo-file-system';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getFileUrl } from '../../utils/urls';

function LecturePlayerScreen({ route, navigation }) {
  const { lecture } = route.params;
  const videoRef = useRef(null);

  const [isBuffering, setIsBuffering] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);
  const [barWidth, setBarWidth] = useState(300);

  // Download states
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [localVideoUri, setLocalVideoUri] = useState(null);

  const videoSource = localVideoUri
    ? { uri: localVideoUri }
    : lecture.video_url ? { uri: getFileUrl(lecture.video_url) } : null;

  // Handle Video Download for Offline playback
  const handleDownloadVideo = async () => {
    if (!lecture.video_url) return;
    try {
      setIsDownloading(true);
      const filename = lecture.video_url.split('/').pop() || `lecture_${lecture.id || 'video'}.mp4`;
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (fileInfo.exists) {
        setLocalVideoUri(fileInfo.uri);
        setIsDownloading(false);
        Alert.alert('Offline Ready', 'This lecture is already saved on your device.');
        return;
      }

      const downloadResumable = FileSystem.createDownloadResumable(
        getFileUrl(lecture.video_url),
        fileUri,
        {},
        (downloadData) => {
          const progress = downloadData.totalBytesWritten / downloadData.totalBytesExpectedToWrite;
          setDownloadProgress(progress);
        }
      );

      const result = await downloadResumable.downloadAsync();
      if (result && result.uri) {
        setLocalVideoUri(result.uri);
        Alert.alert('Success', 'Lecture downloaded successfully for offline viewing!');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Download Failed', 'Could not download the lecture video. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      if (localVideoUri) {
        const available = await Sharing.isAvailableAsync();
        if (available) {
          await Sharing.shareAsync(localVideoUri, {
            mimeType: 'video/mp4',
            dialogTitle: lecture.title,
          });
          return;
        }
      }

      if (lecture.video_url) {
        await Share.share({
          title: lecture.title,
          message: `Watch "${lecture.title}" on DeenConnect: ${getFileUrl(lecture.video_url)}`,
        });
      } else {
        Alert.alert('Nothing to Share', 'This lecture has no video yet.');
      }
    } catch (err) {
      console.error('Share failed:', err.message);
    }
  };
  // Cycle through playback speeds
  const togglePlaybackSpeed = async () => {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextSpeed = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(nextSpeed);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(nextSpeed, true);
    }
  };

  // Skip forward 10 seconds
  const handleSkipForward = async () => {
    if (videoRef.current) {
      const newPosition = Math.min(positionMillis + 10000, durationMillis);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  // Skip backward 10 seconds
  const handleSkipBackward = async () => {
    if (videoRef.current) {
      const newPosition = Math.max(positionMillis - 10000, 0);
      await videoRef.current.setPositionAsync(newPosition);
    }
  };

  // Toggle Play / Pause
  const handleTogglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  // Fixed PanResponder utilizing gestureState.dx tracking from initial touch position
  const touchStartXRef = useRef(0);
  const initialPositionRef = useRef(0);

  // Bulletproof PanResponder with layout fallback
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        touchStartXRef.current = evt.nativeEvent.locationX;
        initialPositionRef.current = positionMillis;
        const currentBarWidth = barWidth > 1 ? barWidth : 300; // Fallback width
        if (durationMillis > 0) {
          const percentage = Math.max(0, Math.min(evt.nativeEvent.locationX / currentBarWidth, 1));
          setPositionMillis(percentage * durationMillis);
        }
      },
      onPanResponderMove: (_, gestureState) => {
        const currentBarWidth = barWidth > 1 ? barWidth : 300;
        if (durationMillis > 0) {
          const currentX = touchStartXRef.current + gestureState.dx;
          const percentage = Math.max(0, Math.min(currentX / currentBarWidth, 1));
          setPositionMillis(percentage * durationMillis);
        }
      },
      onPanResponderRelease: async (_, gestureState) => {
        const currentBarWidth = barWidth > 1 ? barWidth : 300;
        if (durationMillis > 0 && videoRef.current) {
          const currentX = touchStartXRef.current + gestureState.dx;
          const percentage = Math.max(0, Math.min(currentX / currentBarWidth, 1));
          const newPosition = percentage * durationMillis;
          await videoRef.current.setPositionAsync(newPosition);
        }
      },
    })
  ).current;

  const progressPercentage = durationMillis > 0 ? (positionMillis / durationMillis) * 100 : 0;

  // Format milliseconds to mm:ss
  const formatTime = (millis) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>{lecture.title}</Text>
      </View>

      {/* Video Player or Placeholder */}
      {videoSource ? (
        <Pressable
          style={styles.videoWrapper}
          onPress={() => setShowOverlay(!showOverlay)}
        >
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setIsBuffering(status.isBuffering);
                setIsPlaying(status.isPlaying);
                setPositionMillis(status.positionMillis);
                if (status.durationMillis) {
                  setDurationMillis(status.durationMillis);
                }
              }
            }}
          />

          {/* YouTube-style In-Video Overlay */}
          {showOverlay && (
            <View style={styles.videoOverlay}>
              <View style={styles.overlayCenterControls}>
                <Pressable style={styles.overlayIconButton} onPress={handleSkipBackward}>
                  <Feather name="rotate-ccw" size={24} color={colors.white} />
                </Pressable>

                <Pressable style={styles.overlayPlayButton} onPress={handleTogglePlayPause}>
                  <Feather name={isPlaying ? "pause" : "play"} size={28} color={colors.white} />
                </Pressable>

                <Pressable style={styles.overlayIconButton} onPress={handleSkipForward}>
                  <Feather name="rotate-cw" size={24} color={colors.white} />
                </Pressable>
              </View>

              {/* In-Video Bottom Panel (Draggable Progress Bar) */}
              <View style={styles.overlayBottomContainer}>
                <View style={styles.overlayMetaRow}>
                  <Text style={styles.timeText}>
                    {formatTime(positionMillis)} / {formatTime(durationMillis)}
                  </Text>

                  <View style={styles.overlayRightIcons}>
                    <Pressable style={styles.smallIconButton} onPress={togglePlaybackSpeed}>
                      <Text style={styles.speedText}>{playbackRate}x</Text>
                    </Pressable>
                    <Pressable style={styles.smallIconButton} onPress={() => videoRef.current?.presentFullscreenPlayer()}>
                      <Feather name="maximize" size={16} color={colors.white} />
                    </Pressable>
                  </View>
                </View>

                {/* Progress Bar Track with Smooth dx PanHandlers */}
                {/* Progress Bar Track with Safe Fallback Width */}
                <View
                  style={styles.progressBarContainer}
                  onLayout={(event) => {
                    const { width } = event.nativeEvent.layout;
                    if (width > 0) setBarWidth(width);
                  }}
                  {...panResponder.panHandlers}
                >
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
                    <View style={[styles.progressThumb, { left: `${progressPercentage}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <ActivityIndicator size="large" color={colors.white} style={styles.bufferSpinner} />
          )}
        </Pressable>
      ) : (
        <View style={styles.noVideoBox}>
          <Feather name="video-off" size={40} color={colors.gray400} />
          <Text style={styles.noVideoText}>No video has been uploaded for this lecture yet.</Text>
        </View>
      )}

      {/* Attractive Metadata & Content Layout */}
      <View style={styles.details}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.metaHeader}>
            <View style={styles.badgeContainer}>
              <Feather name="book-open" size={12} color={colors.primary} />
              <Text style={styles.badgeText}>LECTURE SESSION</Text>
            </View>

            <View style={styles.actionIconsRow}>
              <Pressable
                style={styles.iconActionBtn}
                onPress={handleDownloadVideo}
                disabled={isDownloading}
              >
                {isDownloading ? (
                  <ActivityIndicator size="small" color={colors.gray700} />
                ) : (
                  <Feather
                    name={localVideoUri ? "check-circle" : "download"}
                    size={20}
                    color={localVideoUri ? '#16a34a' : colors.gray700}
                  />
                )}
              </Pressable>

              <Pressable
                style={styles.iconActionBtn}
                onPress={handleShare}
              >
                <Feather name="share-2" size={20} color={colors.gray700} />
              </Pressable>
            </View>
          </View>
{isDownloading && (
  <View style={styles.downloadBanner}>
    <View style={styles.downloadBannerTop}>
      <Feather name="download" size={13} color={colors.primary} />
      <Text style={styles.downloadBannerText}>Downloading for offline viewing...</Text>
      <Text style={styles.downloadBannerPercent}>{Math.round(downloadProgress * 100)}%</Text>
    </View>
    <View style={styles.downloadProgressTrack}>
      <View style={[styles.downloadProgressFill, { width: `${downloadProgress * 100}%` }]} />
    </View>
  </View>
)}
          <Text style={styles.detailTitle}>{lecture.title}</Text>

          <View style={styles.metadataCard}>
            <View style={styles.metaItem}>
              <Feather name="calendar" size={14} color={colors.gray500} />
              <Text style={styles.metaText}>Added recently</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaItem}>
              <Feather name="video" size={14} color={colors.gray500} />
              <Text style={styles.metaText}>{localVideoUri ? 'Downloaded (Offline)' : 'Online Stream'}</Text>
            </View>
          </View>

          {lecture.description && (
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.detailDesc}>{lecture.description}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.primaryDark },
  topBar: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.space3,
    paddingHorizontal: spacing.space4, paddingVertical: spacing.space3,
  },
  backButton: { padding: 4 },
  topBarTitle: { flex: 1, fontSize: typography.fontSizeBase, fontWeight: typography.weightMedium, color: colors.white },

  videoWrapper: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', justifyContent: 'center', overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  bufferSpinner: { position: 'absolute', alignSelf: 'center', zIndex: 5 },

  videoOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  overlayCenterControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.space8,
    flex: 1,
  },
  overlayIconButton: {
    padding: spacing.space2,
  },
  overlayPlayButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  overlayBottomContainer: {
    width: '100%',
    zIndex: 25,
    paddingBottom: 4,
  },
  overlayMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.space4,
    marginBottom: spacing.space2,
  },
  timeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  overlayRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.space4,
  },
  smallIconButton: {
    padding: 2,
  },
  speedText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  progressBarTrack: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ef4444',
  },
  progressThumb: {
    position: 'absolute',
    top: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ef4444',
    marginLeft: -6,
    borderWidth: 2,
    borderColor: colors.white,
  },

  noVideoBox: {
    width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.gray800,
    alignItems: 'center', justifyContent: 'center', gap: spacing.space3, paddingHorizontal: spacing.space6,
  },
  noVideoText: { color: colors.gray400, fontSize: typography.fontSizeSm, textAlign: 'center' },

  details: { padding: spacing.space5, backgroundColor: colors.white, flex: 1, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -10 },
  scrollContent: { paddingBottom: spacing.space6 },
  metaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.space3,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: spacing.space3,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  detailTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900, marginBottom: spacing.space3 },
  metadataCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: spacing.space3,
    borderRadius: 8,
    marginBottom: spacing.space4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  metaDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#cbd5e1',
  },
  metaText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  descriptionBox: {
    backgroundColor: '#f8fafc',
    padding: spacing.space4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  descriptionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.gray700,
    marginBottom: spacing.space2,
    textTransform: 'uppercase',
  },
  detailDesc: { fontSize: typography.fontSizeSm, color: colors.gray600, lineHeight: 22 },
  downloadBanner: {
  backgroundColor: '#f8fafc',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e2e8f0',
  padding: spacing.space3,
  marginBottom: spacing.space4,
},
downloadBannerTop: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: spacing.space2,
},
downloadBannerText: {
  flex: 1,
  fontSize: 12,
  color: colors.gray700,
  fontWeight: '500',
},
downloadBannerPercent: {
  fontSize: 12,
  fontWeight: '700',
  color: colors.primary,
},
downloadProgressTrack: {
  height: 4,
  backgroundColor: '#e2e8f0',
  borderRadius: 2,
  overflow: 'hidden',
},
downloadProgressFill: {
  height: '100%',
  backgroundColor: colors.primary,
  borderRadius: 2,
},
});

export default LecturePlayerScreen;