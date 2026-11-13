import { useNavigation } from '@react-navigation/native';
import { useRef, useState, type ComponentRef } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { FormSheet, Icon, LoadingScreen, PrimaryButton, ScreenBody, StackHeader } from '@/components/ui';
import { liquidOf } from '@/data/ledger';
import { useAddAccount, useLedger, useRestoreAccount } from '@/hooks/useFinance';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function AccountsScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const add = useAddAccount();
  const restore = useRestoreAccount();
  const [open, setOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [name, setName] = useState('');
  const [opening, setOpening] = useState('0');
  const openingRef = useRef<ComponentRef<typeof TextInput>>(null);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const active = data.accounts.filter((account) => !account.archived);
  const archived = data.accounts.filter((account) => account.archived);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <StackHeader title="Accounts" onBack={() => navigation.goBack()} />
      <ScreenBody>
        <View className="gap-4 px-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-secondary">{active.length} active ledgers</Text>
            <Pressable className="flex-row items-center gap-1" onPress={() => setOpen(true)}>
              <Icon name="add" size={18} color={colors.primary} />
              <Text className="text-sm text-primary">Add account</Text>
            </Pressable>
          </View>
          <View className="rounded-2xl bg-white p-4">
            <Text className="text-xs uppercase tracking-wider text-secondary">Total recorded</Text>
            <Text className="mt-1 font-display text-3xl text-ink">{formatInr(liquidOf(data))}</Text>
            <Text className="mt-2 text-[13px] leading-5 text-secondary">
              Opening balances plus the transactions you recorded. Nothing is guessed.
            </Text>
          </View>
          {active.map((account) => (
            <Pressable
              key={account.id}
              className="rounded-2xl bg-white p-4"
              onPress={() => toast(`${account.name} · ${formatInr(account.balance)}`)}>
              <View className="flex-row items-center gap-3">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-surface-low">
                  <Icon name={account.icon} size={22} color={colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="text-[15px] text-ink">{account.name}</Text>
                  <Text className="text-xs text-secondary">{account.role}</Text>
                  <Text className="text-xs text-secondary">{account.detail}</Text>
                </View>
                <Text className="font-display text-base text-ink">
                  {formatInr(account.balance)}
                </Text>
              </View>
              <Text className="mt-3 text-xs text-secondary">
                Opening {formatInr(account.opening)} · {account.started}
              </Text>
              <Text className="mt-1 text-xs text-moss">{account.last}</Text>
            </Pressable>
          ))}
          <Pressable
            className="flex-row items-center justify-between rounded-2xl bg-surface-low p-4"
            onPress={() => setShowArchived((value) => !value)}>
            <Text className="text-sm text-ink">Archived accounts ({archived.length})</Text>
            <Icon
              name={showArchived ? 'expand-less' : 'expand-more'}
              size={20}
              color={colors.secondary}
            />
          </Pressable>
          {showArchived
            ? archived.map((account) => (
                <View key={account.id} className="rounded-2xl bg-white p-4">
                  <Text className="text-[15px] text-ink">{account.name}</Text>
                  <Text className="mt-1 text-xs text-secondary">
                    Historical entries stay. This ledger is left out of daily balances and pickers.
                  </Text>
                  <Text className="mt-2 text-sm text-ink">
                    Final balance {formatInr(account.balance)}
                  </Text>
                  <Pressable
                    className="mt-3"
                    onPress={() =>
                      runAction(() => restore.mutateAsync(account.id), toast, 'Account restored.')
                    }>
                    <Text className="text-sm text-primary">Restore account</Text>
                  </Pressable>
                </View>
              ))
            : null}
          <View className="flex-row gap-3 rounded-2xl bg-white p-4">
            <Icon name="shield" size={20} color={colors.primary} />
            <Text className="flex-1 text-[13px] leading-5 text-secondary">
              Stored on this device. Poonji never asks for bank passwords.
            </Text>
          </View>
        </View>
      </ScreenBody>
      <Modal animationType="slide" transparent visible={open} onRequestClose={() => setOpen(false)}>
        <FormSheet onClose={() => setOpen(false)}>
            <Text className="font-display text-lg text-ink">Add account</Text>
            <TextInput
              className="mt-3 rounded-xl bg-surface-low px-3 py-3 text-ink"
              placeholder="Account name"
              placeholderTextColor={colors.secondary}
              value={name}
              onChangeText={setName}
              returnKeyType="next"
              blurOnSubmit={false}
              autoFocus
              onSubmitEditing={() => openingRef.current?.focus()}
            />
            <TextInput
              ref={openingRef}
              className="mt-2 rounded-xl bg-surface-low px-3 py-3 text-ink"
              keyboardType="decimal-pad"
              placeholder="Opening balance"
              placeholderTextColor={colors.secondary}
              value={opening}
              onChangeText={setOpening}
            />
            <View className="mt-4">
              <PrimaryButton
                label="Save account"
                pending={add.isPending}
                onPress={() =>
                  runAction(
                    () => add.mutateAsync({ name, opening: Number(opening) || 0 }),
                    toast,
                    'Account added.'
                  ).then((ok) => {
                    if (ok) {
                      setOpen(false);
                      setName('');
                      setOpening('0');
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
