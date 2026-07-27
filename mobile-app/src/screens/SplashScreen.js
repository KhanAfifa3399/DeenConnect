import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
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

function SplashScreen({ navigation }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);
  const textOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.quad) });
    logoScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.2)) });
    textOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));

    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoCircle, logoAnimatedStyle]}>
        <Text style={styles.logoLetters}>DC</Text>
      </Animated.View>
      <Animated.Text style={[styles.appName, textAnimatedStyle]}>
        DeenConnect
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.accentLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.space5,
  },
  logoLetters: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
  },
  appName: {
    fontSize: typography.fontSizeXl,
    fontWeight: typography.weightSemibold,
    color: colors.white,
    letterSpacing: 1,
  },
});

export default SplashScreen;