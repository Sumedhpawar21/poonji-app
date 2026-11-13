import { useNavigation } from '@react-navigation/native';
import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { AppHeader, Card, FormSheet, Icon, LoadingScreen, PrimaryButton, ScreenBody } from '@/components/ui';
import { earmarkedOf, flexibleOf } from '@/data/ledger';
import type { Goal } from '@/data/types';
import { useAllocate, useCreateGoal, useLedger, useResumeGoal } from '@/hooks/useFinance';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function GoalsScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const allocate = useAllocate();
  const resume = useResumeGoal();
  const create = useCreateGoal();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [amount, setAmount] = useState('2000');
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('20000');
  const targetRef = useRef<ComponentRef<typeof TextInput>>(null);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const saved = earmarkedOf(data);
  const targetSum = data.goals.reduce((sum, item) => sum + item.target, 0);
  const pct = targetSum ? Math.round((saved / targetSum) * 1000) / 10 : 0;

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <AppHeader
        title="Goals"
        unread={data.notices.filter((notice) => notice.unread).length}
        onBell={() => navigation.navigate('Notifications')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScreenBody>
        <View className="gap-4 px-4 pt-4">
          <Text className="text-xs text-secondary">{data.goals.length} active pods</Text>
          <Card>
            <Text className="text-xs uppercase tracking-wider text-secondary">Total earmarked</Text>
            <Text className="mt-1 font-display text-4xl text-ink">{formatInr(saved)}</Text>
            <Text className="mt-2 text-[13px] leading-5 text-secondary">
              Earmarked inside your accounts — not locked away, and not counted twice.
            </Text>
            <View className="mt-3 h-2 overflow-hidden rounded-full bg-surface-mid">
              <View
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </View>
            <Text className="mt-2 text-xs text-secondary">
              {pct}% of {formatInr(targetSum, 0)} across goals
            </Text>
          </Card>

          {data.goals.map((item) => {
            const progress = Math.min(100, Math.round((item.saved / item.target) * 100));
            return (
              <Card key={item.id}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 flex-row gap-3">
                    <Icon name={item.icon} size={22} color={colors.primary} />
                    <View className="flex-1">
                      <Text className="text-[15px] text-ink">{item.title}</Text>
                      <Text className="text-xs text-secondary">{item.subtitle}</Text>
                    </View>
                  </View>
                  {item.paused ? <Text className="text-[11px] text-caution">Paused</Text> : null}
                </View>
                <Text className="mt-3 font-display text-2xl text-ink">{formatInr(item.saved)}</Text>
                <Text className="text-xs text-secondary">
                  of {formatInr(item.target, 0)} · {item.heldIn}
                </Text>
                <View className="mt-3 h-2 overflow-hidden rounded-full bg-surface-mid">
                  <View
                    className="h-2 rounded-full bg-primary-deep"
                    style={{ width: `${progress}%` }}
                  />
                </View>
                <Text className="mt-2 text-xs text-secondary">
                  {progress}% · {item.cadence} · {item.finish}
                </Text>
                {item.queued ? (
                  <Text className="mt-1 text-xs text-primary">{item.queued}</Text>
                ) : null}
                {item.paused ? (
                  <Text className="mt-2 text-[13px] leading-5 text-secondary">
                    Paused so the emergency buffer can come first. Resume whenever you want.
                  </Text>
                ) : null}
                <View className="mt-3 flex-row gap-2">
                  <Pressable
                    className="h-10 flex-1 items-center justify-center rounded-xl bg-primary"
                    onPress={() => {
                      setGoal(item);
                      setAmount('2000');
                    }}>
                    <Text className="text-sm text-white">
                      {item.paused ? 'Add anyway' : 'Add funds'}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="h-10 flex-1 items-center justify-center rounded-xl bg-surface-low"
                    onPress={() =>
                      runAction(
                        () => resume.mutateAsync(item.id),
                        toast,
                        item.paused ? 'Goal resumed.' : 'Goal paused.'
                      )
                    }>
                    <Text className="text-sm text-ink">{item.paused ? 'Resume' : 'Pause'}</Text>
                  </Pressable>
                </View>
              </Card>
            );
          })}

          <Pressable
            className="h-12 items-center justify-center rounded-xl border border-dashed border-primary"
            onPress={() => setCreating(true)}>
            <Text className="text-primary">Create new goal</Text>
          </Pressable>

          <Card className="bg-surface-low">
            <Text className="text-sm text-ink">Decision sandbox</Text>
            <Text className="mt-1 text-[13px] leading-5 text-secondary">
              Thinking about a purchase? Ask the companion to test it against flexible cash before
              you move money.
            </Text>
            <Pressable
              className="mt-3"
              onPress={() =>
                navigation.navigate('Ask', { prompt: 'Can I afford a ₹45,000 expense?' })
              }>
              <Text className="text-sm text-primary">Simulate a purchase</Text>
            </Pressable>
          </Card>
          <Text className="text-[13px] leading-5 text-secondary">
            Allocating to a goal changes flexible spending, never the bank balance itself.
          </Text>
        </View>
      </ScreenBody>

      <Modal
        animationType="slide"
        transparent
        visible={goal !== null}
        onRequestClose={() => setGoal(null)}>
        <FormSheet onClose={() => setGoal(null)}>
            <Text className="font-display text-lg text-ink">Earmark amount</Text>
            <Text className="mt-1 text-xs text-secondary">
              Flexible cash now {formatInr(flexibleOf(data))}. This does not move the bank balance.
            </Text>
            <TextInput
              className="mt-4 rounded-xl bg-surface-low px-4 py-3 font-display text-2xl text-ink"
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            <View className="mt-3 flex-row gap-2">
              {['2000', '5000', '10000'].map((value) => (
                <Pressable
                  key={value}
                  className="rounded-full bg-surface-low px-3 py-1.5"
                  onPress={() => setAmount(value)}>
                  <Text className="text-xs text-ink">
                    +₹{Number(value).toLocaleString('en-IN')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="mt-4">
              <PrimaryButton
                label="Confirm allocation"
                pending={allocate.isPending}
                onPress={() => {
                  if (!goal) return;
                  runAction(
                    () => allocate.mutateAsync({ id: goal.id, amount: Number(amount) }),
                    toast,
                    'Goal updated.'
                  ).then((ok) => {
                    if (ok) setGoal(null);
                  });
                }}
              />
            </View>
            <Pressable
              className="mt-3 h-10 items-center justify-center"
              onPress={() => setGoal(null)}>
              <Text className="text-secondary">Close</Text>
            </Pressable>
        </FormSheet>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={creating}
        onRequestClose={() => setCreating(false)}>
        <FormSheet onClose={() => setCreating(false)}>
            <Text className="font-display text-lg text-ink">New goal</Text>
            <TextInput
              className="mt-3 rounded-xl bg-surface-low px-3 py-3 text-ink"
              placeholder="Goal name"
              placeholderTextColor={colors.secondary}
              value={title}
              onChangeText={setTitle}
              returnKeyType="next"
              blurOnSubmit={false}
              autoFocus
              onSubmitEditing={() => targetRef.current?.focus()}
            />
            <TextInput
              ref={targetRef}
              className="mt-2 rounded-xl bg-surface-low px-3 py-3 text-ink"
              keyboardType="decimal-pad"
              placeholder="Target amount"
              placeholderTextColor={colors.secondary}
              value={target}
              onChangeText={setTarget}
            />
            <View className="mt-4">
              <PrimaryButton
                label="Save goal"
                pending={create.isPending}
                onPress={() =>
                  runAction(
                    () => create.mutateAsync({ title, target: Number(target) }),
                    toast,
                    'Goal opened.'
                  ).then((ok) => {
                    if (ok) {
                      setCreating(false);
                      setTitle('');
                    }
                  })
                }
              />
            </View>
        </FormSheet>
      </Modal>
    </View>
  );
}
