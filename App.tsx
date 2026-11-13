import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Easing, runOnJS, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PoonjiSplash } from '@/components/PoonjiSplash';
import { splashBlend } from '@/components/splashBlend';
import { ToastProvider } from '@/components/Toast';
import { useSession } from '@/hooks/useFinance';
import { queryClient } from '@/lib/queryClient';
import { RootNavigator } from '@/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const HOLD_MS = 2000;
const BLEND_MS = 1800;

let fontsApplied = false;

function applyManrope() {
  if (fontsApplied) return;
  fontsApplied = true;

  const style = { fontFamily: 'Manrope_500Medium' };

  const text = Text as typeof Text & {
    defaultProps?: { style?: object };
  };

  const input = TextInput as typeof TextInput & {
    defaultProps?: { style?: object };
  };

  text.defaultProps = { ...text.defaultProps, style };
  input.defaultProps = { ...input.defaultProps, style };
}

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#F5FCF8',
  },
};

function HandOff() {
  const session = useSession();
  const [holdDone, setHoldDone] = useState(false);
  const [signInReady, setSignInReady] = useState(false);
  const [splashOn, setSplashOn] = useState(true);

  useEffect(() => {
    const warm = setTimeout(() => setSignInReady(true), 400);
    const hold = setTimeout(() => setHoldDone(true), HOLD_MS);
    return () => {
      clearTimeout(warm);
      clearTimeout(hold);
    };
  }, []);

  useEffect(() => {
    if (!holdDone || !session.isFetched) return;
    splashBlend.value = withTiming(
      1,
      { duration: BLEND_MS, easing: Easing.bezier(0.4, 0, 0.2, 1) },
      (finished) => {
        if (finished) runOnJS(setSplashOn)(false);
      }
    );
  }, [holdDone, session.isFetched]);

  return (
    <View style={styles.stage}>
      {signInReady ? <RootNavigator /> : null}
      {splashOn ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <PoonjiSplash />
        </View>
      ) : null}
    </View>
  );
}

export default function App() {
  const [loaded, error] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!loaded && !error) return null;
  if (loaded) applyManrope();

  return (
    <GestureHandlerRootView style={styles.stage}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <StatusBar style="dark" />
            <NavigationContainer theme={navTheme}>
              <HandOff />
            </NavigationContainer>
          </ToastProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  stage: {
    flex: 1,
    backgroundColor: '#F5FCF8',
  },
});
