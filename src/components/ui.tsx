import { MaterialIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { IconName } from '@/data/types';
import { colors } from '@/theme/colors';

export function Icon({
  name,
  size = 22,
  color = colors.ink,
}: {
  name: IconName;
  size?: number;
  color?: string;
}) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

export function ScreenBody({
  children,
  extraBottom = 28,
}: {
  children: ReactNode;
  extraBottom?: number;
}) {
  return (
    <ScrollView
      className="flex-1 bg-surface"
      contentContainerStyle={{ paddingBottom: extraBottom, flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  );
}

export function FormSheet({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  const insets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const sheet = useAnimatedStyle(() => ({
    paddingBottom: Math.max(insets.bottom, 16) + keyboard.height.value,
  }));

  return (
    <View className="flex-1 justify-end bg-black/40">
      <Pressable
        className="flex-1"
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      />
      <Animated.View
        style={[
          {
            maxHeight: '88%',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: '#fff',
            overflow: 'hidden',
          },
          sheet,
        ]}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          bounces={false}
          contentContainerStyle={{ padding: 20 }}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

export function KeyboardDock({
  children,
  offset = 0,
}: {
  children: ReactNode;
  offset?: number;
}) {
  const keyboard = useAnimatedKeyboard();
  const dock = useAnimatedStyle(() => ({
    paddingBottom: Math.max(0, keyboard.height.value - offset),
  }));

  return <Animated.View style={[{ backgroundColor: '#fff' }, dock]}>{children}</Animated.View>;
}

export function AppHeader({
  title,
  eyebrow = 'Poonji',
  onBell,
  onProfile,
  unread = 0,
}: {
  title: string;
  eyebrow?: string;
  onBell: () => void;
  onProfile: () => void;
  unread?: number;
}) {
  return (
    <View className="h-16 flex-row items-center justify-between border-b border-black/5 bg-surface px-4">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-xl bg-surface-high">
          <Icon name="account-balance-wallet" size={20} color={colors.primary} />
        </View>
        <View className="min-w-0">
          <Text className="text-xs tracking-wide text-secondary">{eyebrow}</Text>
          <Text className="font-display text-lg text-ink" numberOfLines={1}>
            {title}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Pressable
          accessibilityLabel="Notifications"
          className="h-11 w-11 items-center justify-center rounded-full"
          onPress={onBell}>
          <Icon name="notifications" size={22} color={colors.moss} />
          {unread > 0 ? (
            <View className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tertiary" />
          ) : null}
        </Pressable>
        <Pressable
          accessibilityLabel="Profile"
          className="h-8 w-8 items-center justify-center rounded-full bg-primary-fixed"
          onPress={onProfile}>
          <Text className="font-display text-xs text-primary">AS</Text>
        </Pressable>
      </View>
    </View>
  );
}

export function StackHeader({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <View className="h-14 flex-row items-center justify-between px-2">
      <Pressable
        accessibilityLabel="Back"
        className="h-11 w-11 items-center justify-center"
        onPress={onBack}>
        <Icon name="arrow-back" size={22} color={colors.ink} />
      </Pressable>
      <Text className="font-display text-base text-ink">{title}</Text>
      <View className="h-11 min-w-11 items-center justify-center px-2">{right}</View>
    </View>
  );
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <View className={`rounded-2xl bg-white p-4 ${className}`}>{children}</View>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  pending,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  pending?: boolean;
}) {
  return (
    <Pressable
      className="h-12 items-center justify-center rounded-xl bg-primary"
      disabled={disabled || pending}
      onPress={onPress}
      style={{ opacity: disabled ? 0.5 : 1 }}>
      {pending ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="font-display text-white">{label}</Text>
      )}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      className="h-12 items-center justify-center rounded-xl bg-primary-fixed"
      onPress={onPress}>
      <Text className="font-display text-primary">{label}</Text>
    </Pressable>
  );
}

export function LoadingScreen() {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="flex-1 items-center justify-center bg-surface"
      style={{ paddingTop: insets.top }}>
      <ActivityIndicator color={colors.primary} />
      <Text className="mt-3 text-sm text-secondary">Gathering your ledger…</Text>
    </View>
  );
}

export function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className={`rounded-full border px-3 py-1.5 ${active ? 'border-primary bg-primary-fixed' : 'border-hairline bg-white'}`}
      onPress={onPress}>
      <Text className={`text-xs ${active ? 'text-primary' : 'text-secondary'}`}>{label}</Text>
    </Pressable>
  );
}
