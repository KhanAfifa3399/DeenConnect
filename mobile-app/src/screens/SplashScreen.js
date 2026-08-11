import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, StatusBar, Animated, Easing, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function SplashScreen({ navigation }) {
  // Logo — enlarged, clean, borderless
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoTranslateY = useRef(new Animated.Value(12)).current;

  // Wordmark
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkTranslateY = useRef(new Animated.Value(12)).current;

  // Dune silhouette drifts up gently on load
  const duneTranslateY = useRef(new Animated.Value(24)).current;
  const duneOpacity = useRef(new Animated.Value(0)).current;

  // Bottom progress
  const progressWidth = useRef(new Animated.Value(0)).current;

  // Exit
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Sky settles, dunes rise into place
      Animated.parallel([
        Animated.timing(duneOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(duneTranslateY, {
          toValue: 0,
          duration: 700,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 2. Logo settles in cleanly
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 7,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(logoTranslateY, {
          toValue: 0,
          duration: 550,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 3. Wordmark rises in beneath it
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 480,
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkTranslateY, {
          toValue: 0,
          duration: 480,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    Animated.timing(progressWidth, {
      toValue: 1,
      duration: 2500,
      delay: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 380,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => navigation.replace('Onboarding'));
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  const progressPercent = progressWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: exitOpacity }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Dusk sky backdrop using theme primary colors */}
      <LinearGradient
        colors={[
          colors.primaryDark || '#0F172A',
          colors.primary || '#0D9488',
          '#E8863A',
          '#F4B860',
        ]}
        locations={[0, 0.4, 0.75, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Dune silhouette layers */}
      <Animated.View
        pointerEvents="none"
        style={[styles.duneWrap, { opacity: duneOpacity, transform: [{ translateY: duneTranslateY }] }]}
      >
        <View style={[styles.dune, styles.duneBack]} />
        <View style={[styles.dune, styles.duneFront]} />
      </Animated.View>

      <View style={styles.contentContainer}>
        {/* Borderless enlarged logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { translateY: logoTranslateY }],
            },
          ]}
        >
          <Image
            source={require('../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={[
            styles.wordmarkWrapper,
            { opacity: wordmarkOpacity, transform: [{ translateY: wordmarkTranslateY }] },
          ]}
        >
          <Text style={styles.wordmarkText}>DEENCONNECT</Text>
        </Animated.View>
      </View>

      {/* Bottom progress */}
      <Animated.View style={[styles.footerContainer, { opacity: wordmarkOpacity }]}>
        <View style={styles.loadingTrack}>
          <Animated.View style={[styles.loadingProgressWrap, { width: progressPercent }]}>
            <View style={styles.loadingProgress} />
          </Animated.View>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark || '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    zIndex: 2,
  },

  duneWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 220,
  },
  dune: {
    position: 'absolute',
    left: -width * 0.2,
    width: width * 1.4,
    borderTopLeftRadius: width * 0.9,
    borderTopRightRadius: width * 0.9,
  },
  duneBack: {
    bottom: -40,
    height: 150,
    backgroundColor: colors.primaryDark || '#0F172A',
    opacity: 0.65,
  },
  duneFront: {
    bottom: -70,
    height: 130,
    backgroundColor: colors.primaryDark || '#0F172A',
  },

  /* Enlarged borderless logo container */
  logoContainer: {
    width: 170,
    height: 170,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },

  wordmarkWrapper: {
    alignItems: 'center',
  },
  wordmarkText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 4,
  },

  footerContainer: {
    position: 'absolute',
    bottom: 54,
    alignItems: 'center',
    width: '100%',
    zIndex: 2,
  },
  loadingTrack: {
    width: 100,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgressWrap: {
    height: '100%',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  loadingProgress: {
    height: '100%',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
});