import { useNavigation } from '@react-navigation/native';
import { useState, type ReactNode } from 'react';
import { Modal, Pressable, Share, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { FormSheet, Icon, LoadingScreen, PrimaryButton, ScreenBody, StackHeader } from '@/components/ui';
import { accountName } from '@/data/ledger';
import {
  useAddFact,
  useLedger,
  usePurgeVault,
  useRemoveFact,
  useSetPayday,
  useSignOut,
  useToggleProfile,
} from '@/hooks/useFinance';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function ProfileScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const toggle = useToggleProfile();
  const setPayday = useSetPayday();
  const removeFact = useRemoveFact();
  const addFact = useAddFact();
  const signOut = useSignOut();
  const purge = usePurgeVault();
  const [payday, setPaydayText] = useState('10');
  const [editingPay, setEditingPay] = useState(false);
  const [fact, setFact] = useState('');
  const [addingFact, setAddingFact] = useState(false);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const profile = data.profile;

  const exportLedger = async () => {
    const lines = data.transactions.map(
      (tx) =>
        `${tx.dateLabel} | ${tx.title} | ${tx.kind} | ${tx.amount} | ${accountName(tx.accountId, data)}`
    );
    await Share.share({ message: lines.join('\n'), title: 'Poonji ledger' });
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <StackHeader title="Settings" onBack={() => navigation.goBack()} />
      <ScreenBody>
        <View className="gap-4 px-4">
          <View className="items-center rounded-2xl bg-white p-5">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
              <Text className="font-display text-xl text-primary">AS</Text>
            </View>
            <Text className="mt-3 font-display text-xl text-ink">{profile.name}</Text>
            <Text className="text-sm text-secondary">{profile.email}</Text>
            <Text className="mt-1 text-xs text-secondary">Member since {profile.memberSince}</Text>
            <Text className="mt-3 text-xs text-primary">Local vault · on this device</Text>
          </View>

          <Section title="Financial rhythm">
            <Row
              icon="calendar-today"
              title="Pay-cycle anchor"
              body={`${profile.payday}th of every month`}
              action="Edit"
              onPress={() => {
                setPaydayText(String(profile.payday));
                setEditingPay(true);
              }}
            />
            <Row icon="currency-rupee" title="Ledger unit" body={profile.currency} />
            <Row icon="spa" title="Reflection tone" body={profile.tone} />
          </Section>

          <Section title="Companion memory">
            <Toggle
              title="Use historical context"
              body="Let answers factor in the facts below."
              on={profile.useHistory}
              onPress={() => toggle.mutate('useHistory')}
            />
            {data.facts.map((item) => (
              <View key={item.id} className="border-t border-hairline px-4 py-3">
                <View className="flex-row items-start justify-between">
                  <Text className="text-sm text-ink">{item.title}</Text>
                  <Pressable
                    onPress={() =>
                      runAction(() => removeFact.mutateAsync(item.id), toast, 'Fact removed.')
                    }>
                    <Icon name="delete" size={16} color={colors.secondary} />
                  </Pressable>
                </View>
                <Text className="mt-1 text-[13px] leading-5 text-secondary">{item.body}</Text>
                <Text className="mt-1 text-[11px] text-secondary">
                  {item.source} · {item.status}
                </Text>
              </View>
            ))}
            <Pressable className="px-4 py-3" onPress={() => setAddingFact(true)}>
              <Text className="text-sm text-primary">Add a context fact</Text>
            </Pressable>
          </Section>

          <Section title="Privacy">
            <Toggle
              title="Biometric app lock"
              body="Ask for Face ID or fingerprint on resume."
              on={profile.biometric}
              onPress={() => toggle.mutate('biometric')}
            />
            <Toggle
              title="Mask amounts in alerts"
              body="Show ₹••• on the lock screen."
              on={profile.maskNotifications}
              onPress={() => toggle.mutate('maskNotifications')}
            />
            <Row icon="vpn-key" title="Device backup" body="Last snapshot: today, 06:30 AM" />
            <Pressable
              className="border-t border-hairline px-4 py-3"
              onPress={() => navigation.navigate('Accounts')}>
              <Text className="text-sm text-ink">Accounts</Text>
              <Text className="text-xs text-secondary">Opening balances and archived ledgers</Text>
            </Pressable>
            <Pressable className="border-t border-hairline px-4 py-3" onPress={exportLedger}>
              <Text className="text-sm text-ink">Export complete ledger</Text>
            </Pressable>
            <Pressable
              className="border-t border-hairline px-4 py-3"
              onPress={() =>
                runAction(() => purge.mutateAsync(), toast, 'Vault cleared on this device.')
              }>
              <Text className="text-sm text-tertiary">Delete account & purge vault</Text>
            </Pressable>
          </Section>

          <Pressable
            className="h-12 items-center justify-center rounded-xl bg-white"
            onPress={() => runAction(() => signOut.mutateAsync(), toast, 'Signed out.')}>
            <Text className="text-ink">Sign out</Text>
          </Pressable>
          <Text className="text-center text-[11px] text-secondary">
            Poonji · calm financial clarity
          </Text>
        </View>
      </ScreenBody>

      <Modal
        animationType="slide"
        transparent
        visible={editingPay}
        onRequestClose={() => setEditingPay(false)}>
        <FormSheet onClose={() => setEditingPay(false)}>
            <Text className="font-display text-lg text-ink">Payday</Text>
            <TextInput
              className="mt-3 rounded-xl bg-surface-low px-3 py-3 text-ink"
              keyboardType="number-pad"
              value={payday}
              onChangeText={setPaydayText}
              autoFocus
            />
            <View className="mt-4">
              <PrimaryButton
                label="Save cycle"
                pending={setPayday.isPending}
                onPress={() =>
                  runAction(
                    () => setPayday.mutateAsync(Number(payday)),
                    toast,
                    'Payday updated.'
                  ).then((ok) => {
                    if (ok) setEditingPay(false);
                  })
                }
              />
            </View>
        </FormSheet>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={addingFact}
        onRequestClose={() => setAddingFact(false)}>
        <FormSheet onClose={() => setAddingFact(false)}>
            <Text className="font-display text-lg text-ink">Remember this</Text>
            <TextInput
              className="mt-3 min-h-[80px] rounded-xl bg-surface-low px-3 py-3 text-ink"
              multiline
              placeholder="A fact the companion may use"
              placeholderTextColor={colors.secondary}
              value={fact}
              onChangeText={setFact}
              textAlignVertical="top"
              autoFocus
            />
            <View className="mt-4">
              <PrimaryButton
                label="Save fact"
                pending={addFact.isPending}
                onPress={() =>
                  runAction(() => addFact.mutateAsync(fact), toast, 'Remembered.').then((ok) => {
                    if (ok) {
                      setFact('');
                      setAddingFact(false);
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View>
      <Text className="mb-2 text-xs uppercase tracking-wider text-secondary">{title}</Text>
      <View className="overflow-hidden rounded-2xl bg-white">{children}</View>
    </View>
  );
}

function Row({
  icon,
  title,
  body,
  action,
  onPress,
}: {
  icon: 'calendar-today' | 'currency-rupee' | 'spa' | 'vpn-key';
  title: string;
  body: string;
  action?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-3 border-b border-hairline px-4 py-3"
      onPress={onPress}>
      <Icon name={icon} size={20} color={colors.primary} />
      <View className="flex-1">
        <Text className="text-sm text-ink">{title}</Text>
        <Text className="text-xs text-secondary">{body}</Text>
      </View>
      {action ? <Text className="text-xs text-primary">{action}</Text> : null}
    </Pressable>
  );
}

function Toggle({
  title,
  body,
  on,
  onPress,
}: {
  title: string;
  body: string;
  on: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className="flex-row items-center justify-between border-b border-hairline px-4 py-3"
      onPress={onPress}>
      <View className="flex-1 pr-3">
        <Text className="text-sm text-ink">{title}</Text>
        <Text className="text-xs text-secondary">{body}</Text>
      </View>
      <Text className={`text-sm ${on ? 'text-primary' : 'text-secondary'}`}>
        {on ? 'On' : 'Off'}
      </Text>
    </Pressable>
  );
}
