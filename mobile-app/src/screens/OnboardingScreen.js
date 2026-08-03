import { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, Pressable, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';
import { onboardingSlides } from '../constants/onboardingSlides';

const { width } = Dimensions.get('window');

function Dot({ index, scrollX }) {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [8, 24, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return { width: dotWidth, opacity };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function Slide({ item }) {
  return (
    <View style={styles.slide}>
      <View style={styles.imageContainer}>
        <Image source={item.image} style={styles.slideImage} resizeMode="contain" />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );
}

function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useSharedValue(0);
  const flatListRef = useRef(null);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
  });

  function handleMomentumScrollEnd(event) {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(index);
  }

  function goToNext() {
    if (currentIndex < onboardingSlides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login');
    }
  }

  function skip() {
    navigation.replace('Login');
  }

  const isLastSlide = currentIndex === onboardingSlides.length - 1;

  return (
    <View style={styles.container}>
      <Pressable style={styles.skipButton} onPress={skip}>
        <Text style={styles.skipText}>Skip</Text>
      </Pressable>

      <Animated.FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {onboardingSlides.map((_, index) => (
            <Dot key={index} index={index} scrollX={scrollX} />
          ))}
        </View>

        <Pressable style={styles.nextButton} onPress={goToNext}>
          <Text style={styles.nextButtonText}>{isLastSlide ? 'Get Started' : 'Next'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.space12,
    right: spacing.space5,
    zIndex: 10,
    padding: spacing.space2,
  },
  skipText: {
    fontSize: typography.fontSizeSm,
    color: colors.gray500,
    fontWeight: typography.weightMedium,
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.space8,
  },
  imageContainer: {
    width: 240,
    height: 240,
    marginBottom: spacing.space8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  slideTitle: {
    fontSize: typography.fontSize2xl,
    fontWeight: typography.weightBold,
    color: colors.primaryDark,
    textAlign: 'center',
    marginBottom: spacing.space3,
  },
  slideDescription: {
    fontSize: typography.fontSizeBase,
    color: colors.gray600,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingHorizontal: spacing.space8,
    paddingBottom: spacing.space10,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: spacing.space2,
    marginBottom: spacing.space6,
  },
  dot: {
    height: 8,
    borderRadius: spacing.radiusFull,
    backgroundColor: colors.primary,
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.space4,
    borderRadius: spacing.radiusFull,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: colors.white,
    fontSize: typography.fontSizeBase,
    fontWeight: typography.weightSemibold,
  },
});

export default OnboardingScreen;