import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { Icon, LoadingScreen, Pill, ScreenBody, StackHeader } from '@/components/ui';
import type { NoticeGroup } from '@/data/types';
import {
  useLedger,
  useMarkAllNotices,
  useMarkNotice,
  useMarkPaid,
  useToggleProfile,
} from '@/hooks/useFinance';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

const filters: { id: 'all' | NoticeGroup; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'bills', label: 'Commitments' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'system', label: 'System' },
];

export function NotificationsScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const mark = useMarkNotice();
  const markAll = useMarkAllNotices();
  const markPaid = useMarkPaid();
  const toggle = useToggleProfile();
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const unread = data.notices.filter((notice) => notice.unread).length;
  const rows = data.notices.filter((notice) => filter === 'all' || notice.group === filter);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <StackHeader
        title="Reminders"
        onBack={() => navigation.goBack()}
        right={
          <Pressable
            onPress={() => runAction(() => markAll.mutateAsync(), toast, 'All caught up.')}>
            <Text className="text-xs text-primary">Mark read</Text>
          </Pressable>
        }
      />
      <ScreenBody>
        <View className="gap-3 px-4">
          <Text className="text-sm text-secondary">{unread} unread · calm pace</Text>
          <View className="flex-row items-center justify-between rounded-2xl bg-surface-low px-4 py-3">
            <View className="flex-1 flex-row items-center gap-2">
              <Icon name="bedtime" size={18} color={colors.primary} />
              <Text className="flex-1 text-[13px] text-ink">Quiet hours 10 PM – 8 AM</Text>
            </View>
            <Pressable onPress={() => toggle.mutate('quietHours')}>
              <Text className="text-sm text-primary">{data.profile.quietHours ? 'On' : 'Off'}</Text>
            </Pressable>
          </View>
          <View className="flex-row flex-wrap gap-2">
            {filters.map((item) => (
              <Pill
                key={item.id}
                active={filter === item.id}
                label={item.label}
                onPress={() => setFilter(item.id)}
              />
            ))}
          </View>
          {rows.map((notice) => (
            <Pressable
              key={notice.id}
              className="rounded-2xl bg-white p-4"
              onPress={() => mark.mutate(notice.id)}>
              <View className="flex-row gap-3">
                <Icon
                  name={notice.icon}
                  size={22}
                  color={notice.unread ? colors.primary : colors.secondary}
                />
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="flex-1 text-[15px] text-ink">{notice.title}</Text>
                    <Text className="text-[11px] text-secondary">{notice.time}</Text>
                  </View>
                  <Text className="mt-1 text-[13px] leading-5 text-secondary">{notice.body}</Text>
                  {notice.commitmentId ? (
                    <Pressable
                      className="mt-3 self-start rounded-full bg-primary-fixed px-3 py-1.5"
                      onPress={() =>
                        runAction(
                          async () => {
                            await markPaid.mutateAsync(notice.commitmentId!);
                          },
                          toast,
                          'Linked to the ledger as paid.'
                        )
                      }>
                      <Text className="text-xs text-primary">Mark as paid</Text>
                    </Pressable>
                  ) : null}
                  {notice.group === 'cycle' ? (
                    <Pressable
                      className="mt-3"
                      onPress={() => navigation.navigate('Main', { screen: 'Plan' })}>
                      <Text className="text-xs text-primary">Review runway</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
          <Pressable
            className="rounded-2xl bg-white p-4"
            onPress={() => navigation.navigate('Profile')}>
            <Text className="text-sm text-ink">Mask figures on the lock screen</Text>
            <Text className="mt-1 text-xs text-secondary">
              {data.profile.maskNotifications
                ? 'Rupee values stay hidden on system alerts.'
                : 'Amounts can show on system alerts.'}
            </Text>
          </Pressable>
        </View>
      </ScreenBody>
    </View>
  );
}
