import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { splashBlend } from '@/components/splashBlend';
import { WaveField } from '@/components/WaveField';
import { useSignIn } from '@/hooks/useFinance';
import { colors } from '@/theme/colors';

const enter = (delay: number) =>
  FadeInDown.delay(delay)
    .duration(750)
    .easing(Easing.bezier(0.16, 1, 0.3, 1));

function CoinBag() {
  return (
    <View className="h-16 w-16 items-center justify-center">
      <MaterialCommunityIcons name="sack" size={46} color="#6B4330" />
      <MaterialCommunityIcons
        name="currency-rupee"
        size={17}
        color="#F6E6C8"
        style={{ position: 'absolute', top: 26 }}
      />
    </View>
  );
}

function GoogleMark() {
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24">
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </Svg>
  );
}

function BrandTag() {
  return (
    <View className="border-primary/15 flex-row items-center rounded-full border bg-white/60 px-4 py-2">
      <View className="bg-primary mr-2 h-1.5 w-1.5 rounded-full" />
      <Text className="text-primary text-[10px] font-semibold tracking-[2px]">
        YOUR FINANCIAL COMPANION
      </Text>
    </View>
  );
}

export function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const signIn = useSignIn();

  const isVerySmallScreen = height < 650;
  const isSmallScreen = height < 740;
  const isTablet = width >= 768;

  const horizontalPadding = isTablet ? 48 : 24;

  const waveHeight = Math.min(
    Math.max(height * (isVerySmallScreen ? 0.19 : isSmallScreen ? 0.23 : 0.29), 115),
    250
  );
  const glow = useSharedValue(0);
  const spin = useSharedValue(0);
  const rippleScale = useSharedValue(0.8);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(
      withTiming(1, {
        duration: 2100,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    spin.value = withRepeat(
      withTiming(360, {
        duration: 900,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, [glow, spin]);

  const emblemStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + glow.value * 0.045 }],
    borderColor: `rgba(38,122,99,${0.2 + glow.value * 0.3})`,
    opacity: interpolate(splashBlend.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spin.value}deg` }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    opacity: rippleOpacity.value,
    transform: [{ scale: rippleScale.value }],
  }));

  const pulseEmblem = () => {
    rippleScale.value = 0.8;
    rippleOpacity.value = 0.8;

    rippleScale.value = withTiming(1.65, {
      duration: 650,
      easing: Easing.out(Easing.cubic),
    });

    rippleOpacity.value = withTiming(0, { duration: 650 });
  };

  return (
    <LinearGradient colors={['#F5FCF8', '#EAF7F1', '#DCEFE6']} style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
          alignItems: 'center',
        }}>
        <View
          style={{
            width: '100%',
            maxWidth: 600,
            flex: 1,
            justifyContent: 'flex-start',
          }}>
          {/* HERO / BRAND EMBLEM */}

          <View
            style={{
              height: waveHeight,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}>
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
              <WaveField
                width={Math.min(width, 600)}
                height={waveHeight}
                centerY={waveHeight / 2}
              />
            </View>

            <Pressable onPress={pulseEmblem} className="h-24 w-24 items-center justify-center">
              <View className="bg-primary/10 absolute h-20 w-20 rounded-full" />

              <Animated.View
                style={rippleStyle}
                className="border-primary/40 absolute h-20 w-20 rounded-full border-2"
              />

              <Animated.View
                style={[
                  {
                    height: 80,
                    width: 80,
                    borderRadius: 999,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.88)',
                    shadowColor: '#267A63',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.14,
                    shadowRadius: 18,
                    elevation: 5,
                  },
                  emblemStyle,
                ]}>
                <CoinBag />
              </Animated.View>
            </Pressable>
          </View>

          {/* BRAND INTRODUCTION */}

          <View
            className="items-center px-6"
            style={{
              marginTop: isSmallScreen ? 0 : 4,
            }}>
            <Animated.Text
              entering={enter(150)}
              className="font-display text-ink text-[36px] tracking-tight">
              Poonji
            </Animated.Text>

            <Animated.View entering={enter(260)} className="mt-3">
              <BrandTag />
            </Animated.View>

            <Animated.View
              entering={enter(400)}
              className="mt-8 w-full items-center rounded-2xl border border-white/80 bg-white/65 px-5 py-5"
              style={{
                shadowColor: '#267A63',
                shadowOffset: { width: 0, height: 5 },
                shadowOpacity: 0.04,
                shadowRadius: 12,
                elevation: 2,
              }}>
              <Text className="text-ink text-center text-[18px] font-medium leading-7">
                Make smarter money decisions.
              </Text>

              <Text className="text-secondary mt-1 text-center text-[14px] leading-6">
                Build better financial habits, understand your money, and feel more confident every
                day.
              </Text>

              <View className="bg-primary/20 mt-4 h-px w-12" />

              <Text className="text-primary mt-3 text-[10px] font-semibold tracking-[2px]">
                YOUR MONEY. YOUR PACE.
              </Text>
            </Animated.View>
          </View>

          {/* SIGN IN SECTION */}

          <View
            style={{
              paddingHorizontal: horizontalPadding,
              marginTop: isSmallScreen ? 28 : 38,
            }}>
            <Animated.View entering={enter(550)}>
              <Pressable
                disabled={signIn.isPending}
                onPress={() => signIn.mutate()}
                className="border-primary/15 h-[58px] flex-row items-center justify-center gap-3 rounded-2xl border bg-white"
                style={({ pressed }) => ({
                  transform: [{ scale: pressed ? 0.985 : 1 }],
                  opacity: signIn.isPending ? 0.8 : 1,
                  shadowColor: '#267A63',
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.08,
                  shadowRadius: 12,
                  elevation: 3,
                })}>
                {signIn.isPending ? (
                  <>
                    <Animated.View
                      style={spinnerStyle}
                      className="border-primary h-5 w-5 rounded-full border-2 border-t-transparent"
                    />

                    <Text className="text-primary text-[15px] font-semibold">
                      Connecting to Google...
                    </Text>
                  </>
                ) : (
                  <>
                    <GoogleMark />

                    <Text className="text-ink text-[15px] font-semibold">Continue with Google</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>

          {/* TRUST & PRIVACY */}

          <Animated.View
            entering={enter(680)}
            className="mt-7 px-6"
            style={{
              paddingHorizontal: horizontalPadding,
            }}>
            <View className="border-primary/10 flex-row items-start rounded-xl border bg-white/45 p-4">
              <View className="bg-primary/10 mr-3 h-9 w-9 items-center justify-center rounded-full">
                <MaterialIcons name="verified-user" size={19} color={colors.primary} />
              </View>

              <View className="flex-1">
                <Text className="text-ink text-[12px] font-semibold">Your privacy comes first</Text>

                <Text className="text-secondary mt-1 text-[11px] leading-[18px]">
                  Your financial information stays protected. We never ask for your bank passwords.
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={enter(680)}
            className="mb-1 mt-auto flex-row items-center justify-center gap-2">
            <View className="bg-primary/60 h-1.5 w-1.5 rounded-full" />
            <Text className="text-moss/60 text-[9px] font-medium tracking-[1.5px]">
              POONJI • VERSION 1.0
            </Text>
          </Animated.View>
        </View>
      </View>
    </LinearGradient>
  );
}
