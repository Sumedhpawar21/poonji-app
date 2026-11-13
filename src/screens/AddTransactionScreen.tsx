import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CalendarSheet } from '@/components/CalendarSheet';
import { useToast } from '@/components/Toast';
import { Icon, LoadingScreen, PrimaryButton } from '@/components/ui';
import type { IconName, TxKind } from '@/data/types';
import { useAddTransaction, useLedger } from '@/hooks/useFinance';
import { describeDate, startOfDay } from '@/lib/dates';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { RootStackParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

const kinds: { id: TxKind; label: string; icon: IconName }[] = [
  { id: 'expense', label: 'Expense', icon: 'arrow-outward' },
  { id: 'income', label: 'Income', icon: 'arrow-downward' },
  { id: 'transfer', label: 'Transfer', icon: 'swap-horiz' },
];

const categories: { name: string; icon: IconName }[] = [
  { name: 'Food & Dining', icon: 'restaurant' },
  { name: 'Groceries', icon: 'shopping-basket' },
  { name: 'Commute', icon: 'directions-subway' },
  { name: 'Rent', icon: 'home' },
  { name: 'Utilities', icon: 'bolt' },
  { name: 'Entertainment', icon: 'movie' },
  { name: 'Salary', icon: 'work' },
  { name: 'Health', icon: 'favorite' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'AddTransaction'>;

export function AddTransactionScreen({ navigation, route }: Props) {
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const save = useAddTransaction();
  const [kind, setKind] = useState<TxKind>(route.params?.kind ?? 'expense');
  const [amount, setAmount] = useState(route.params?.amount ?? '');
  const [note, setNote] = useState(route.params?.note ?? '');
  const [category, setCategory] = useState(categories[0]);
  const [accountId, setAccountId] = useState('hdfc');
  const [toAccountId, setToAccountId] = useState('icici');
  const [date, setDate] = useState(() => startOfDay(new Date()));
  const [picking, setPicking] = useState(false);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const noteFocused = useRef(false);
  const keyboard = useAnimatedKeyboard();
  const keyboardSpace = useAnimatedStyle(() => ({ height: keyboard.height.value }));

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      if (!noteFocused.current) return;
      scrollRef.current?.scrollToEnd({ animated: true });
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    });
    return () => show.remove();
  }, []);

  const openPicker = () => {
    Keyboard.dismiss();
    setPicking(true);
  };

  if (!ledger.data) return <LoadingScreen />;
  const accounts = ledger.data.accounts.filter((account) => !account.archived);
  const when = describeDate(date);

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable onPress={() => navigation.goBack()}>
          <Text className="text-sm text-secondary">Cancel</Text>
        </Pressable>
        <Text className="font-display text-base text-ink">Add transaction</Text>
        <Text className="text-[11px] text-secondary">On device</Text>
      </View>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={{
          padding: 16,
          gap: 16,
          paddingBottom: Math.max(insets.bottom, 16),
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag">
        <View className="flex-row rounded-2xl bg-white p-1">
          {kinds.map((item) => (
            <Pressable
              key={item.id}
              className={`h-11 flex-1 flex-row items-center justify-center gap-1 rounded-xl ${kind === item.id ? 'bg-primary-fixed' : ''}`}
              onPress={() => setKind(item.id)}>
              <Icon
                name={item.icon}
                size={16}
                color={kind === item.id ? colors.primary : colors.secondary}
              />
              <Text className={`text-sm ${kind === item.id ? 'text-primary' : 'text-secondary'}`}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>
        <View className="items-center py-2">
          <Text className="text-xs text-secondary">Amount</Text>
          <View className="mt-1 flex-row items-center">
            <Text className="font-display text-4xl text-ink">₹</Text>
            <TextInput
              className="min-w-[120px] font-display text-4xl text-ink"
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor="#bec9c3"
              value={amount}
              onChangeText={setAmount}
              returnKeyType="done"
            />
          </View>
        </View>
        {kind === 'transfer' ? (
          <View className="rounded-2xl bg-surface-low p-3">
            <Text className="text-[13px] leading-5 text-secondary">
              Moving money between your accounts keeps both balances honest and does not count as
              income or spending.
            </Text>
          </View>
        ) : (
          <View>
            <Text className="mb-2 text-xs text-secondary">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {categories
                .filter((item) =>
                  kind === 'income'
                    ? item.name === 'Salary' || item.name === 'Health'
                    : item.name !== 'Salary'
                )
                .map((item) => (
                  <Pressable
                    key={item.name}
                    className={`flex-row items-center gap-1 rounded-full px-3 py-2 ${category.name === item.name ? 'bg-primary-fixed' : 'bg-white'}`}
                    onPress={() => setCategory(item)}>
                    <Icon name={item.icon} size={14} color={colors.primary} />
                    <Text className="text-xs text-ink">{item.name}</Text>
                  </Pressable>
                ))}
            </View>
          </View>
        )}
        <Text className="text-xs text-secondary">
          {kind === 'income' ? 'Received in' : 'Paid from'}
        </Text>
        {accounts.map((account) => (
          <Pressable
            key={account.id}
            className={`flex-row items-center justify-between rounded-2xl px-3 py-3 ${accountId === account.id ? 'bg-primary-fixed' : 'bg-white'}`}
            onPress={() => setAccountId(account.id)}>
            <View>
              <Text className="text-sm text-ink">{account.name}</Text>
              <Text className="text-xs text-secondary">Available {formatInr(account.balance)}</Text>
            </View>
            {accountId === account.id ? (
              <Icon name="check" size={18} color={colors.primary} />
            ) : null}
          </Pressable>
        ))}
        {kind === 'transfer' ? (
          <>
            <Text className="text-xs text-secondary">Transferred to</Text>
            {accounts
              .filter((account) => account.id !== accountId)
              .map((account) => (
                <Pressable
                  key={account.id}
                  className={`flex-row items-center justify-between rounded-2xl px-3 py-3 ${toAccountId === account.id ? 'bg-secondary-container' : 'bg-white'}`}
                  onPress={() => setToAccountId(account.id)}>
                  <Text className="text-sm text-ink">{account.name}</Text>
                  {toAccountId === account.id ? (
                    <Icon name="check" size={18} color={colors.primary} />
                  ) : null}
                </Pressable>
              ))}
          </>
        ) : null}
        <Pressable
          className="flex-row items-center justify-between rounded-2xl bg-white px-3 py-3"
          onPress={openPicker}>
          <View className="flex-row items-center gap-2">
            <Icon name="calendar-today" size={18} color={colors.primary} />
            <Text className="text-sm text-ink">{when.label}</Text>
          </View>
          <Text className="text-xs text-primary">Change</Text>
        </Pressable>
        <TextInput
          className="h-12 rounded-2xl bg-white px-3 text-sm text-ink"
          style={{ textAlignVertical: 'center', includeFontPadding: false }}
          placeholder="Note or merchant"
          placeholderTextColor={colors.secondary}
          value={note}
          onChangeText={setNote}
          returnKeyType="done"
          onFocus={() => {
            noteFocused.current = true;
            requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
          }}
          onBlur={() => {
            noteFocused.current = false;
          }}
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <PrimaryButton
          label={
            kind === 'expense'
              ? 'Save expense'
              : kind === 'income'
                ? 'Save income'
                : 'Save transfer'
          }
          pending={save.isPending}
          onPress={() =>
            runAction(
              () =>
                save.mutateAsync({
                  kind,
                  amount: Number(amount),
                  title: note.trim() || category.name,
                  note: note.trim(),
                  category: kind === 'transfer' ? 'Self transfer' : category.name,
                  icon: kind === 'transfer' ? 'swap-horiz' : category.icon,
                  accountId,
                  toAccountId: kind === 'transfer' ? toAccountId : undefined,
                  dateLabel: when.dateLabel,
                  group: when.group,
                  backdated: when.backdated,
                }),
              toast,
              'Saved on this device.'
            ).then((ok) => {
              if (ok) navigation.goBack();
            })
          }
        />
        <Text className="text-center text-xs text-secondary">No bank connection required.</Text>
        <Animated.View style={keyboardSpace} />
      </ScrollView>
      <CalendarSheet
        visible={picking}
        mode="single"
        title="Transaction date"
        start={date}
        maximumDate={new Date()}
        onClose={() => setPicking(false)}
        onConfirm={(next) => {
          setDate(startOfDay(next));
          setPicking(false);
        }}
      />
    </View>
  );
}
