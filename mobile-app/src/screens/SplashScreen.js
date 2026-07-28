import { useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

const { height } = Dimensions.get('window');

function SplashScreen({ navigation }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(10);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.2)) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(400, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <ImageBackground
      source={require('../assets/splash-bg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <Image source={require('../assets/logo.png')} style={styles.logoImage} resizeMode="contain" />
        </Animated.View>

        <Animated.Text style={[styles.appName, textAnimatedStyle]}>
          DEEN CONNECT
        </Animated.Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: height,
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: spacing.radiusFull,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space5,
  },
  logoImage: {
    width: 130,
    height: 130,
  },
  appName: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
    letterSpacing: 2,
  },
});

export default SplashScreen;