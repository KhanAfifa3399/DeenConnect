import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { getFileUrl } from '../../utils/urls';

function LecturePlayerScreen({ route, navigation }) {
  const { lecture } = route.params;
  const [isBuffering, setIsBuffering] = useState(true);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color={colors.white} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>{lecture.title}</Text>
      </View>

      {lecture.video_url ? (
        <View style={styles.videoWrapper}>
          <Video
            source={{ uri: getFileUrl(lecture.video_url) }}
            style={styles.video}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) => setIsBuffering(!status.isLoaded || status.isBuffering)}
          />
          {isBuffering && (
            <ActivityIndicator size="large" color={colors.white} style={styles.bufferSpinner} />
          )}
        </View>
      ) : (
        <View style={styles.noVideoBox}>
          <Feather name="video-off" size={40} color={colors.gray400} />
          <Text style={styles.noVideoText}>No video has been uploaded for this lecture yet.</Text>
        </View>
      )}

      <View style={styles.details}>
        <Text style={styles.detailTitle}>{lecture.title}</Text>
        {lecture.description && <Text style={styles.detailDesc}>{lecture.description}</Text>}
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
  videoWrapper: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', justifyContent: 'center' },
  video: { width: '100%', height: '100%' },
  bufferSpinner: { position: 'absolute', alignSelf: 'center' },
  noVideoBox: {
    width: '100%', aspectRatio: 16 / 9, backgroundColor: colors.gray800,
    alignItems: 'center', justifyContent: 'center', gap: spacing.space3, paddingHorizontal: spacing.space6,
  },
  noVideoText: { color: colors.gray400, fontSize: typography.fontSizeSm, textAlign: 'center' },
  details: { padding: spacing.space5, backgroundColor: colors.white, flex: 1 },
  detailTitle: { fontSize: typography.fontSizeLg, fontWeight: typography.weightBold, color: colors.gray900, marginBottom: spacing.space2 },
  detailDesc: { fontSize: typography.fontSizeSm, color: colors.gray600, lineHeight: 20 },
});

export default LecturePlayerScreen;