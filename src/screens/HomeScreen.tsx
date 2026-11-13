import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { CalendarSheet } from '@/components/CalendarSheet';
import { AppHeader, Card, Icon, LoadingScreen, ScreenBody } from '@/components/ui';
import { accountName } from '@/data/ledger';
import { useLedger } from '@/hooks/useFinance';
import { formatRange, inDateRange, inclusiveDays, monthBounds, parseLedgerDate } from '@/lib/dates';
import { formatInr, formatSigned } from '@/lib/money';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

export function HomeScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const ledger = useLedger();
  const [hidden, setHidden] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [picking, setPicking] = useState(false);
  const [from, setFrom] = useState(() => monthBounds().start);
  const [to, setTo] = useState(() => monthBounds().end);
  const insets = useSafeAreaInsets();

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const ranged = data.transactions.filter((tx) => {
    const day = parseLedgerDate(tx.group);
    return day ? inDateRange(day, from, to) : false;
  });
  const incomeTx = ranged.filter((tx) => tx.kind === 'income');
  const expenseTx = ranged.filter((tx) => tx.kind === 'expense');
  const income = incomeTx.reduce((sum, tx) => sum + tx.amount, 0);
  const expense = expenseTx.reduce((sum, tx) => sum + tx.amount, 0);
  const recent = ranged.slice(0, 4);
  const total = data.accounts
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + account.balance, 0);
  const unread = data.notices.filter((notice) => notice.unread).length;

  const submitPrompt = () => {
    const text = prompt.trim();
    if (!text) return;
    const questioning = /afford|how much|can i|what if|\?/i.test(text);
    if (questioning) navigation.navigate('Ask', { prompt: text });
    else {
      const amount = text.match(/(\d+(?:\.\d+)?)/)?.[1];
      navigation.navigate('AddTransaction', { kind: 'expense', amount, note: text });
    }
    setPrompt('');
  };

  return (
    <View className="bg-surface flex-1" style={{ paddingTop: insets.top }}>
      <AppHeader
        title="Home"
        unread={unread}
        onBell={() => navigation.navigate('Notifications')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScreenBody extraBottom={36}>
        <View className="gap-4 px-4 pt-4">
          <View className="flex-row items-center justify-between">
            <View className="min-w-0 flex-1">
              <Text className="text-secondary text-xs">Mindful snapshot</Text>
              <Text className="font-display text-ink text-lg">Good evening, Ananya</Text>
            </View>
            <Pressable
              className="bg-surface-mid max-w-[48%] flex-row items-center gap-1 rounded-full px-3 py-1.5"
              onPress={() => setPicking(true)}>
              <Icon name="calendar-today" size={14} color={colors.primary} />
              <Text className="text-ink shrink text-xs" numberOfLines={1}>
                {formatRange(from, to)}
              </Text>
              <Icon name="expand-more" size={16} color={colors.secondary} />
            </Pressable>
          </View>

          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-secondary text-[11px] uppercase tracking-wider">
                Total across accounts
              </Text>
              <Pressable onPress={() => setHidden((value) => !value)}>
                <Icon
                  name={hidden ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.secondary}
                />
              </Pressable>
            </View>
            <View className="mt-2 flex-row items-center gap-2">
              <Text className="font-display text-ink text-[32px] tracking-tight">
                {hidden ? '₹ ••••••' : formatInr(total)}
              </Text>
              <Text className="bg-primary-fixed text-on-primary-fixed rounded-full px-2 py-0.5 text-[11px]">
                Stable
              </Text>
            </View>
            <Pressable
              className="mt-2 flex-row items-center gap-1"
              onPress={() => navigation.navigate('Accounts')}>
              <Icon name="check-circle" size={15} color={colors.primary} />
              <Text className="text-secondary text-[13px]">Based on balances recorded here.</Text>
            </Pressable>
          </Card>

          <View className="border-line/40 bg-surface-low rounded-2xl border p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-primary text-[11px] uppercase tracking-wider">
                Mindful quick log & ask
              </Text>
              <Text className="text-secondary text-[11px]">Natural language</Text>
            </View>
            <View className="border-line/60 flex-row items-center gap-2 rounded-xl border bg-white px-3 py-2">
              <TextInput
                className="text-ink flex-1 text-[13px]"
                placeholder='e.g. "Paid ₹420 for Swiggy"'
                placeholderTextColor={colors.secondary}
                value={prompt}
                onChangeText={setPrompt}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={submitPrompt}
              />
              <Pressable onPress={() => toast('Voice logging uses the same draft as typing.')}>
                <Icon name="mic" size={18} color={colors.secondary} />
              </Pressable>
              <Pressable
                className="bg-primary h-7 w-7 items-center justify-center rounded-full"
                onPress={submitPrompt}>
                <Icon name="arrow-upward" size={16} color={colors.white} />
              </Pressable>
            </View>
            <View className="mt-2 flex-row gap-2">
              {['Spent 250 on coffee', 'Can I afford dining out?'].map((sample) => (
                <Pressable
                  key={sample}
                  className="bg-surface-mid rounded-full px-2.5 py-1"
                  onPress={() => setPrompt(sample)}>
                  <Text className="text-ink text-xs">&quot;{sample}&quot;</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Card>
            <View className="flex-row items-center justify-between">
              <Text className="text-ink shrink text-sm" numberOfLines={1}>
                {formatRange(from, to)}
              </Text>
              <Text className="text-secondary ml-2 text-xs">
                {inclusiveDays(from, to)} {inclusiveDays(from, to) === 1 ? 'day' : 'days'}
              </Text>
            </View>
            <View className="mt-3 flex-row gap-2">
              <SummaryCell
                label="Income"
                value={`+ ${formatInr(income, 0)}`}
                meta={`${incomeTx.length} entries`}
                tone="primary"
                onPress={() => toast(`Income ${formatInr(income)}`)}
              />
              <SummaryCell
                label="Expenses"
                value={`- ${formatInr(expense, 0)}`}
                meta={`${expenseTx.length} entries`}
                tone="tertiary"
                onPress={() => toast(`Expenses ${formatInr(expense)}`)}
              />
              <SummaryCell
                label="Net"
                value={`${income - expense >= 0 ? '+' : '-'} ${formatInr(Math.abs(income - expense), 0)}`}
                meta="Retained"
                tone="ink"
                onPress={() => toast('Transfers between your accounts are excluded.')}
              />
            </View>
            <View className="bg-surface-low mt-3 flex-row items-start gap-2 rounded-xl p-2.5">
              <Icon name="info" size={16} color={colors.secondary} />
              <Text className="text-secondary flex-1 text-[13px] leading-5">
                Transfers between your accounts do not affect income or expense totals.
              </Text>
            </View>
          </Card>

          <View className="flex-row gap-2">
            <QuickAction
              icon="north-east"
              label="Expense"
              hint="Spend out"
              tint="bg-tertiary-fixed"
              color={colors.tertiary}
              onPress={() => navigation.navigate('AddTransaction', { kind: 'expense' })}
            />
            <QuickAction
              icon="south-west"
              label="Income"
              hint="Added in"
              tint="bg-primary-fixed"
              color={colors.primary}
              onPress={() => navigation.navigate('AddTransaction', { kind: 'income' })}
            />
            <QuickAction
              icon="swap-horiz"
              label="Transfer"
              hint="Between accts"
              tint="bg-secondary-container"
              color={colors.onSecondaryContainer}
              onPress={() => navigation.navigate('AddTransaction', { kind: 'transfer' })}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="font-display text-ink text-lg">Recent activity</Text>
            <Pressable
              className="flex-row items-center"
              onPress={() => navigation.navigate('Activity')}>
              <Text className="text-primary text-sm">See all</Text>
              <Icon name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </View>
          <View className="overflow-hidden rounded-2xl bg-white">
            {recent.length === 0 ? (
              <Text className="text-secondary p-4 text-sm">No entries in this range.</Text>
            ) : (
              recent.map((tx, index) => (
                <Pressable
                  key={tx.id}
                  className={`flex-row items-center justify-between p-4 ${index > 0 ? 'border-surface-mid border-t' : ''}`}
                  onPress={() => toast(`${tx.title} · ${formatSigned(tx.amount, tx.kind)}`)}>
                  <View className="min-w-0 flex-1 flex-row items-center gap-3">
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${tx.kind === 'income' ? 'bg-primary-fixed' : tx.kind === 'transfer' ? 'bg-secondary-container' : 'bg-tertiary-fixed'}`}>
                      <Icon
                        name={tx.icon}
                        size={20}
                        color={
                          tx.kind === 'income'
                            ? colors.primary
                            : tx.kind === 'transfer'
                              ? colors.onSecondaryContainer
                              : colors.tertiary
                        }
                      />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text className="text-ink text-[15px]" numberOfLines={1}>
                        {tx.title}
                      </Text>
                      <Text className="text-secondary text-[13px]" numberOfLines={1}>
                        {tx.note} · {accountName(tx.accountId, data)}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end pl-2">
                    <Text
                      className={`text-[15px] ${tx.kind === 'income' ? 'text-primary' : tx.kind === 'expense' ? 'text-tertiary' : 'text-ink'}`}>
                      {tx.kind === 'transfer'
                        ? formatInr(tx.amount)
                        : formatSigned(tx.amount, tx.kind)}
                    </Text>
                    <Text className="text-secondary text-[11px]">{tx.dateLabel}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          <View className="bg-surface-low flex-row items-start gap-3 rounded-2xl p-4">
            <Icon name="verified-user" size={18} color={colors.primary} />
            <View className="flex-1">
              <Text className="text-ink text-sm">Your calm pace, always</Text>
              <Text className="text-secondary mt-1 text-[13px] leading-5">
                Records stay on this device. Missed a few days? Backdate an entry without breaking
                anything.
              </Text>
            </View>
          </View>
        </View>
      </ScreenBody>
      <CalendarSheet
        visible={picking}
        mode="range"
        title="From and to"
        start={from}
        end={to}
        onClose={() => setPicking(false)}
        onConfirm={(nextFrom, nextTo) => {
          setFrom(nextFrom);
          setTo(nextTo);
          setPicking(false);
        }}
      />
      <Pressable
        accessibilityLabel="Quick add"
        className="bg-primary-deep absolute bottom-4 right-4 h-14 w-14 items-center justify-center rounded-full"
        onPress={() => navigation.navigate('AddTransaction', { kind: 'expense' })}>
        <Icon name="add" size={28} color={colors.white} />
      </Pressable>
    </View>
  );
}

function SummaryCell({
  label,
  value,
  meta,
  tone,
  onPress,
}: {
  label: string;
  value: string;
  meta: string;
  tone: 'primary' | 'tertiary' | 'ink';
  onPress: () => void;
}) {
  const color =
    tone === 'primary' ? 'text-primary' : tone === 'tertiary' ? 'text-tertiary' : 'text-ink';
  return (
    <Pressable
      className="bg-surface-low flex-1 items-center rounded-xl px-1 py-2.5"
      onPress={onPress}>
      <Text className="text-secondary text-[11px]">{label}</Text>
      <Text className={`mt-1 text-center text-[13px] ${color}`}>{value}</Text>
      <Text className="text-secondary mt-0.5 text-[11px]">{meta}</Text>
    </Pressable>
  );
}

function QuickAction({
  icon,
  label,
  hint,
  tint,
  color,
  onPress,
}: {
  icon: 'north-east' | 'south-west' | 'swap-horiz';
  label: string;
  hint: string;
  tint: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-1 items-center rounded-2xl bg-white p-3" onPress={onPress}>
      <View className={`mb-1.5 h-11 w-11 items-center justify-center rounded-full ${tint}`}>
        <Icon name={icon} size={22} color={color} />
      </View>
      <Text className="text-ink text-[13px]">{label}</Text>
      <Text className="text-secondary text-[11px]">{hint}</Text>
    </Pressable>
  );
}
