import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { AppHeader, Card, Icon, LoadingScreen, ScreenBody } from '@/components/ui';
import { earmarkedOf, flexibleOf, liquidOf, unpaidOf } from '@/data/ledger';
import { useLedger, useMarkPaid } from '@/hooks/useFinance';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function PlanScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const markPaid = useMarkPaid();
  const [showMath, setShowMath] = useState(false);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const flexible = flexibleOf(data);
  const upcoming = data.commitments.filter((item) => item.upcoming);
  const power = data.commitments.find((item) => item.id === 'power');

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <AppHeader
        title="Plan"
        unread={data.notices.filter((notice) => notice.unread).length}
        onBell={() => navigation.navigate('Notifications')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScreenBody>
        <View className="gap-4 px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-xs text-secondary">10 Oct – 09 Nov 2026</Text>
              <Text className="font-display text-lg text-ink">Pay-cycle horizon</Text>
              <Text className="text-[13px] text-secondary">
                Anchored to payday on the {data.profile.payday}th
              </Text>
            </View>
            <Pressable
              className="rounded-full bg-white px-3 py-2"
              onPress={() => navigation.navigate('Profile')}>
              <Text className="text-xs text-primary">Edit cycle</Text>
            </Pressable>
          </View>

          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-xs uppercase tracking-wider text-secondary">
                Estimated flexible cash
              </Text>
              <Pressable onPress={() => setShowMath((value) => !value)}>
                <Icon name="info" size={18} color={colors.secondary} />
              </Pressable>
            </View>
            <Text className="mt-1 font-display text-4xl text-ink">{formatInr(flexible)}</Text>
            <Text className="mt-2 text-[13px] leading-5 text-secondary">
              Comfortable to use after unpaid commitments and earmarked goals. 12 days remain.
            </Text>
            {showMath ? (
              <View className="mt-3 gap-1.5 rounded-xl bg-surface-low p-3">
                <MathRow label="Recorded liquid cash" value={formatInr(liquidOf(data))} />
                <MathRow label="Unpaid commitments" value={`- ${formatInr(unpaidOf(data))}`} />
                <MathRow label="Earmarked for goals" value={`- ${formatInr(earmarkedOf(data))}`} />
                <MathRow label="Remaining free flow" value={formatInr(flexible)} />
              </View>
            ) : null}
          </Card>

          <Card>
            <Text className="text-sm text-ink">Inflows this cycle</Text>
            <View className="mt-3 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <Icon name="payments" size={22} color={colors.primary} />
                <View>
                  <Text className="text-[15px] text-ink">Primary salary</Text>
                  <Text className="text-xs text-secondary">HDFC ••4092 · 10 Oct</Text>
                </View>
              </View>
              <Text className="text-primary">+{formatInr(85000, 0)}</Text>
            </View>
          </Card>

          {power ? (
            <View className="rounded-2xl bg-surface-low p-4">
              <Text className="text-sm text-ink">Gentle check-in</Text>
              <Text className="mt-1 text-[13px] leading-5 text-secondary">
                Electricity was planned for {formatInr(power.amount, 0)}. Was this settled,
                rescheduled, or left open?
              </Text>
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  className="h-10 flex-1 items-center justify-center rounded-xl bg-primary"
                  onPress={() =>
                    runAction(
                      () => markPaid.mutateAsync(power.id),
                      toast,
                      power.status === 'paid' ? 'Already settled.' : 'Marked settled.'
                    )
                  }>
                  <Text className="text-sm text-white">
                    {power.status === 'paid' ? 'Settled' : 'Yes, paid'}
                  </Text>
                </Pressable>
                <Pressable
                  className="h-10 flex-1 items-center justify-center rounded-xl bg-white"
                  onPress={() => toast('Left on the plan. No guilt, no streak.')}>
                  <Text className="text-sm text-ink">Reschedule</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          <View className="flex-row items-center justify-between">
            <Text className="font-display text-lg text-ink">Upcoming commitments</Text>
            <Text className="text-xs text-secondary">
              {formatInr(
                upcoming
                  .filter((item) => item.status !== 'paid')
                  .reduce((sum, item) => sum + item.amount, 0),
                0
              )}
            </Text>
          </View>
          {upcoming.map((item) => (
            <Card key={item.id}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 flex-row gap-3">
                  <Icon name={item.icon} size={22} color={colors.primaryDeep} />
                  <View className="flex-1">
                    <Text className="text-[15px] text-ink">{item.title}</Text>
                    <Text className="text-xs text-secondary">{item.detail}</Text>
                    <Text className="mt-1 text-xs text-secondary">
                      {item.status === 'paid' ? 'Marked paid' : item.when}
                    </Text>
                  </View>
                </View>
                <Text className="text-[15px] text-ink">{formatInr(item.amount, 0)}</Text>
              </View>
              {item.status !== 'paid' ? (
                <Pressable
                  className="mt-3 h-10 items-center justify-center rounded-xl bg-primary-fixed"
                  onPress={() =>
                    runAction(
                      () => markPaid.mutateAsync(item.id),
                      toast,
                      `${item.title} marked paid.`
                    )
                  }>
                  <Text className="text-sm text-primary">Mark paid</Text>
                </Pressable>
              ) : null}
            </Card>
          ))}

          <Text className="font-display text-lg text-ink">Flexible pace</Text>
          {data.budgets.map((budget) => {
            const pct = Math.min(100, Math.round((budget.spent / budget.limit) * 100));
            return (
              <Card key={budget.id}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <Icon name={budget.icon} size={18} color={colors.primary} />
                    <Text className="text-[15px] text-ink">{budget.name}</Text>
                  </View>
                  <Text className="text-xs text-secondary">
                    {formatInr(budget.spent, 0)} / {formatInr(budget.limit, 0)}
                  </Text>
                </View>
                <View className="mt-3 h-2 overflow-hidden rounded-full bg-surface-mid">
                  <View className="h-2 rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </View>
                <Text className="mt-2 text-xs text-secondary">
                  {budget.note} · {pct}% of the guidepost
                </Text>
              </Card>
            );
          })}
          <Text className="text-[13px] leading-5 text-secondary">
            Budgets are guideposts. Reallocate whenever priorities change — the month&apos;s history
            stays put.
          </Text>
        </View>
      </ScreenBody>
    </View>
  );
}

function MathRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-[13px] text-secondary">{label}</Text>
      <Text className="text-[13px] text-ink">{value}</Text>
    </View>
  );
}
