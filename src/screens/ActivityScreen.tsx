import { useNavigation } from '@react-navigation/native';
import { useMemo, useState } from 'react';
import { Modal, Pressable, Share, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { AppHeader, Icon, LoadingScreen, Pill, PrimaryButton, ScreenBody } from '@/components/ui';
import { accountName, flexibleOf, liquidOf } from '@/data/ledger';
import type { Transaction, TxKind } from '@/data/types';
import { useDeleteTransaction, useLedger } from '@/hooks/useFinance';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { AppNav } from '@/navigation/types';
import { colors } from '@/theme/colors';

const filters: { id: 'all' | TxKind; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'expense', label: 'Expenses' },
  { id: 'income', label: 'Income' },
  { id: 'transfer', label: 'Transfers' },
];

export function ActivityScreen() {
  const navigation = useNavigation<AppNav>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const remove = useDeleteTransaction();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]['id']>('all');
  const [accountId, setAccountId] = useState<string>('all');
  const [selected, setSelected] = useState<Transaction | null>(null);

  const rows = useMemo(() => {
    if (!ledger.data) return [];
    return ledger.data.transactions.filter((tx) => {
      const kindOk = filter === 'all' || tx.kind === filter;
      const accountOk =
        accountId === 'all' || tx.accountId === accountId || tx.toAccountId === accountId;
      const hay = `${tx.title} ${tx.note} ${tx.category}`.toLowerCase();
      return kindOk && accountOk && hay.includes(query.trim().toLowerCase());
    });
  }, [ledger.data, filter, accountId, query]);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;
  const flow = data.periods[0].income - data.periods[0].expense;
  const groups = rows.reduce<{ title: string; items: Transaction[] }[]>((list, tx) => {
    const last = list[list.length - 1];
    if (!last || last.title !== tx.group) list.push({ title: tx.group, items: [tx] });
    else last.items.push(tx);
    return list;
  }, []);

  const exportCsv = async () => {
    const header = 'date,title,kind,amount,account,note';
    const body = data.transactions
      .map(
        (tx) =>
          `${tx.dateLabel},${tx.title},${tx.kind},${tx.amount},${accountName(tx.accountId, data)},${tx.note}`
      )
      .join('\n');
    await Share.share({ message: `${header}\n${body}`, title: 'Poonji ledger' });
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <AppHeader
        title="Activity"
        unread={data.notices.filter((notice) => notice.unread).length}
        onBell={() => navigation.navigate('Notifications')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <ScreenBody>
        <View className="gap-3 px-4 pt-4">
          <View className="flex-row items-center rounded-xl bg-white px-3">
            <Icon name="search" size={18} color={colors.secondary} />
            <TextInput
              className="h-11 flex-1 px-2 text-sm text-ink"
              placeholder="Search merchants, notes, categories"
              placeholderTextColor={colors.secondary}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
          <View className="rounded-2xl bg-white p-4">
            <Text className="text-xs text-secondary">October inflow & outflow</Text>
            <Text className="mt-1 font-display text-xl text-ink">{formatInr(flow)} net flow</Text>
            <Text className="mt-1 text-[13px] text-secondary">
              Liquid {formatInr(liquidOf(data))} · Flexible {formatInr(flexibleOf(data))}
            </Text>
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
            <Pill
              active={accountId !== 'all'}
              label={accountId === 'all' ? 'All accounts' : accountName(accountId, data)}
              onPress={() => {
                const active = data.accounts.filter((account) => !account.archived);
                const ids = ['all', ...active.map((account) => account.id)];
                const next = ids[(ids.indexOf(accountId) + 1) % ids.length];
                setAccountId(next);
              }}
            />
          </View>
          {groups.map((group) => (
            <View key={group.title}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs text-secondary">{group.title}</Text>
                <Text className="text-xs text-secondary">{group.items.length} entries</Text>
              </View>
              <View className="overflow-hidden rounded-2xl bg-white">
                {group.items.map((tx, index) => (
                  <Pressable
                    key={tx.id}
                    className={`flex-row items-center p-4 ${index > 0 ? 'border-t border-surface-mid' : ''}`}
                    onPress={() => setSelected(tx)}>
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-low">
                      <Icon name={tx.icon} size={20} color={colors.primaryDeep} />
                    </View>
                    <View className="ml-3 min-w-0 flex-1">
                      <Text className="text-[15px] text-ink" numberOfLines={1}>
                        {tx.title}
                      </Text>
                      <Text className="text-[13px] text-secondary" numberOfLines={1}>
                        {tx.note} · {accountName(tx.accountId, data)}
                        {tx.toAccountId ? ` → ${accountName(tx.toAccountId, data)}` : ''}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text
                        className={`text-[15px] ${tx.kind === 'income' ? 'text-primary' : tx.kind === 'expense' ? 'text-tertiary' : 'text-ink'}`}>
                        {tx.kind === 'expense'
                          ? `- ${formatInr(tx.amount)}`
                          : tx.kind === 'income'
                            ? `+ ${formatInr(tx.amount)}`
                            : formatInr(tx.amount)}
                      </Text>
                      {tx.badge ? (
                        <Text className="mt-0.5 text-[11px] text-secondary">{tx.badge}</Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}
          <Text className="text-center text-xs text-secondary">
            Showing {rows.length} of {data.transactions.length} recorded entries
          </Text>
          <View className="flex-row gap-2">
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-white"
              onPress={exportCsv}>
              <Text className="text-sm text-ink">Export CSV</Text>
            </Pressable>
            <Pressable
              className="h-11 flex-1 items-center justify-center rounded-xl bg-white"
              onPress={() => toast('Ledger already matches the balances on this device.')}>
              <Text className="text-sm text-ink">Reconcile</Text>
            </Pressable>
          </View>
        </View>
      </ScreenBody>
      <Modal
        animationType="slide"
        transparent
        visible={selected !== null}
        onRequestClose={() => setSelected(null)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setSelected(null)}>
          <Pressable className="rounded-t-3xl bg-white p-5" onPress={() => undefined}>
            {selected ? (
              <View className="gap-3">
                <Text className="font-display text-lg text-ink">{selected.title}</Text>
                <Text className="font-display text-3xl text-ink">{formatInr(selected.amount)}</Text>
                <Text className="text-sm text-secondary">
                  {selected.category} · {accountName(selected.accountId, data)} · {selected.time}
                </Text>
                <Text className="text-sm text-moss">{selected.note}</Text>
                <PrimaryButton
                  label="Delete entry"
                  pending={remove.isPending}
                  onPress={() =>
                    runAction(
                      () => remove.mutateAsync(selected.id),
                      toast,
                      'Entry removed. Balances updated.'
                    ).then((ok) => {
                      if (ok) setSelected(null);
                    })
                  }
                />
                <Pressable
                  className="h-11 items-center justify-center"
                  onPress={() => setSelected(null)}>
                  <Text className="text-secondary">Close</Text>
                </Pressable>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
