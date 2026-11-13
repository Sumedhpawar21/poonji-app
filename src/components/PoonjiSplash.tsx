import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeIn,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { splashBlend } from '@/components/splashBlend';

const restingDots = [
  { x: -78, y: -46 },
  { x: -36, y: -72 },
  { x: 18, y: -78 },
  { x: 68, y: -50 },
  { x: -92, y: 6 },
  { x: 90, y: 2 },
  { x: -64, y: 58 },
  { x: 62, y: 62 },
  { x: 8, y: 84 },
];

const MARK = 112;

export function PoonjiSplash() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const glow = useSharedValue(0);
  const ripple = useSharedValue(0.86);
  const verySmall = height < 650;
  const small = height < 740;
  const waveHeight = Math.min(Math.max(height * (verySmall ? 0.19 : small ? 0.23 : 0.29), 115), 250);
  const travel = insets.top + waveHeight / 2 - height / 2;

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => undefined);
    glow.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    ripple.value = withRepeat(
      withTiming(1.28, { duration: 2200, easing: Easing.out(Easing.cubic) }),
      -1,
      false
    );
  }, [glow, ripple]);

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(splashBlend.value, [0, 0.72], [1, 0], Extrapolation.CLAMP),
  }));

  const copyStyle = useAnimatedStyle(() => ({
    opacity: interpolate(splashBlend.value, [0.08, 0.5], [1, 0], Extrapolation.CLAMP),
  }));

  const emblemStyle = useAnimatedStyle(() => ({
    opacity: interpolate(splashBlend.value, [0.62, 1], [1, 0], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          splashBlend.value,
          [0, 0.4, 0.75, 1],
          [0, travel * 0.72, travel * 0.94, travel],
          Extrapolation.CLAMP
        ),
      },
      {
        scale:
          (1 + glow.value * 0.035 * (1 - splashBlend.value)) *
          interpolate(splashBlend.value, [0, 1], [1, 80 / MARK], Extrapolation.CLAMP),
      },
    ],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity:
      interpolate(splashBlend.value, [0, 0.4], [1, 0], Extrapolation.CLAMP) *
      (0.55 * (1 - (ripple.value - 0.86) / 0.42)),
    transform: [{ scale: ripple.value }],
  }));

  return (
    <View pointerEvents="none" style={styles.fill}>
      <Animated.View style={[styles.fill, sheetStyle]}>
        <LinearGradient colors={['#F5FCF8', '#EAF7F1', '#DCEFE6']} style={styles.fill}>
          <View
            style={{
              flex: 1,
              paddingTop: insets.top,
              paddingBottom: Math.max(insets.bottom, 20),
              paddingHorizontal: 28,
            }}>
            <View
              style={[
                styles.copy,
                { justifyContent: 'flex-start', paddingTop: height / 2 + MARK / 2 + 18 - insets.top },
              ]}>
              <Animated.View style={copyStyle}>
                <Animated.Text
                  entering={FadeInDown.delay(120).duration(650)}
                  className="font-display text-ink mt-2 text-center text-[44px] tracking-tight">
                  Poonji
                </Animated.Text>
                <Animated.View
                  entering={FadeInDown.delay(240).duration(650)}
                  className="border-primary/15 mt-4 flex-row items-center self-center rounded-full border bg-white/70 px-4 py-2">
                  <View className="bg-primary mr-2 h-1.5 w-1.5 rounded-full" />
                  <Text className="text-primary text-[10px] font-semibold tracking-[2px]">
                    YOUR FINANCIAL COMPANION
                  </Text>
                </Animated.View>
                <Animated.View entering={FadeIn.delay(420).duration(700)} className="mt-8 items-center">
                  <Text className="text-ink text-center text-[20px] leading-7">
                    A little more clarity.
                  </Text>
                  <Text className="text-secondary mt-1 text-center text-[16px] leading-6">
                    A little less worry.
                  </Text>
                </Animated.View>
              </Animated.View>
            </View>
            <Animated.View style={copyStyle}>
              <Animated.View entering={FadeIn.delay(620).duration(700)}>
                <Text className="text-primary mb-1 text-center text-[11px] font-semibold tracking-[2.4px]">
                  YOUR MONEY. YOUR PACE.
                </Text>
              </Animated.View>
            </Animated.View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: 'absolute',
            top: height / 2 - MARK / 2,
            left: '50%',
            marginLeft: -MARK / 2,
            width: MARK,
            height: MARK,
            alignItems: 'center',
            justifyContent: 'center',
          },
          emblemStyle,
        ]}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.center, rippleStyle]}>
          {restingDots.map((dot) => (
            <View
              key={`${dot.x}-${dot.y}`}
              style={{
                position: 'absolute',
                width: 5,
                height: 5,
                borderRadius: 3,
                backgroundColor: 'rgba(0,97,76,0.18)',
                transform: [{ translateX: dot.x }, { translateY: dot.y }],
              }}
            />
          ))}
          <View className="border-primary/30 h-36 w-36 rounded-full border" />
        </Animated.View>
        <View
          style={{
            height: MARK,
            width: MARK,
            borderRadius: 999,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(0,97,76,0.16)',
            backgroundColor: 'rgba(255,255,255,0.92)',
            shadowColor: '#267A63',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.12,
            shadowRadius: 18,
            elevation: 4,
          }}>
          <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons name="sack" size={62} color="#6B4330" />
            <MaterialCommunityIcons
              name="currency-rupee"
              size={20}
              color="#F6E6C8"
              style={{ position: 'absolute', top: 27 }}
            />
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  copy: { flex: 1, alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
});
