import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/Toast';
import { AppHeader, Icon, KeyboardDock, LoadingScreen } from '@/components/ui';
import { accountName } from '@/data/ledger';
import { useAsk, useConfirmDraft, useLedger } from '@/hooks/useFinance';
import { formatInr } from '@/lib/money';
import { runAction } from '@/lib/run';
import type { AppNav, TabParamList } from '@/navigation/types';
import { colors } from '@/theme/colors';

const suggestions = [
  'How much did I spend on food this cycle?',
  'Can I afford a ₹15,000 flight?',
  'Upcoming commitments before payday',
];

export function AskScreen() {
  const navigation = useNavigation<AppNav>();
  const route = useRoute<RouteProp<TabParamList, 'Ask'>>();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const ledger = useLedger();
  const ask = useAsk();
  const confirm = useConfirmDraft();
  const [text, setText] = useState('');
  const handled = useRef<string | undefined>(undefined);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      list.current?.scrollToEnd({ animated: true });
    });
    return () => show.remove();
  }, []);

  useEffect(() => {
    const prompt = route.params?.prompt;
    if (!prompt || handled.current === prompt) return;
    handled.current = prompt;
    ask.mutate(prompt);
  }, [route.params?.prompt, ask]);

  const messageCount = ledger.data?.messages.length ?? 0;
  useEffect(() => {
    const frame = requestAnimationFrame(() => list.current?.scrollToEnd({ animated: true }));
    return () => cancelAnimationFrame(frame);
  }, [messageCount, ask.isPending]);

  if (!ledger.data) return <LoadingScreen />;
  const data = ledger.data;

  const send = (value?: string) => {
    const next = (value ?? text).trim();
    if (!next) return;
    setText('');
    runAction(() => ask.mutateAsync(next), toast, '');
  };

  return (
    <View className="flex-1 bg-surface" style={{ paddingTop: insets.top }}>
      <AppHeader
        title="Ask"
        unread={data.notices.filter((notice) => notice.unread).length}
        onBell={() => navigation.navigate('Notifications')}
        onProfile={() => navigation.navigate('Profile')}
      />
      <View className="border-b border-hairline px-4 py-3">
        <Text className="font-display text-base text-ink">Deterministic companion</Text>
        <Text className="text-xs text-secondary">
          Cycle anchored to the {data.profile.payday}th ·{' '}
          {data.accounts.filter((account) => !account.archived).length} accounts · answers use your
          ledger only
        </Text>
      </View>
      <ScrollView
        ref={list}
        className="flex-1"
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        <Text className="text-xs text-secondary">Try a grounded question</Text>
        {suggestions.map((item) => (
          <Pressable
            key={item}
            className="self-start rounded-full bg-white px-3 py-2"
            onPress={() => send(item)}>
            <Text className="text-[13px] text-ink">{item}</Text>
          </Pressable>
        ))}
        {data.messages.map((message) => (
          <View
            key={message.id}
            className={message.role === 'user' ? 'max-w-[90%] self-end' : 'max-w-[95%] self-start'}>
            <View
              className={`rounded-2xl px-3 py-3 ${message.role === 'user' ? 'bg-primary' : 'bg-white'}`}>
              <Text
                className={`text-[14px] leading-5 ${message.role === 'user' ? 'text-white' : 'text-ink'}`}>
                {message.text}
              </Text>
              {message.runway ? (
                <View className="mt-3 gap-1 rounded-xl bg-surface-low p-3">
                  <Text className="text-xs text-primary">{message.runway.headline}</Text>
                  <Line label="Current flexible cash" value={formatInr(message.runway.flexible)} />
                  <Line label="Purchase" value={`- ${formatInr(message.runway.purchase)}`} />
                  <Line label="Projected buffer" value={formatInr(message.runway.remaining)} />
                  {message.runway.notes.map((note) => (
                    <Text key={note} className="text-[12px] leading-5 text-secondary">
                      {note}
                    </Text>
                  ))}
                </View>
              ) : null}
              {message.draft ? (
                <View className="mt-3 rounded-xl bg-surface-low p-3">
                  <Text className="text-[15px] text-ink">{message.draft.title}</Text>
                  <Text className="text-xs text-secondary">
                    {message.draft.category} · {accountName(message.draft.accountId, data)} · Today
                  </Text>
                  <Text className="mt-1 text-tertiary">- {formatInr(message.draft.amount)}</Text>
                  <Pressable
                    className="mt-3 h-10 items-center justify-center rounded-xl bg-primary"
                    disabled={message.draft.saved || confirm.isPending}
                    onPress={() =>
                      runAction(
                        () => confirm.mutateAsync(message.id),
                        toast,
                        'Saved to the ledger.'
                      )
                    }>
                    <Text className="text-sm text-white">
                      {message.draft.saved ? 'Saved' : 'Confirm & save'}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
            <Text className="mt-1 text-[11px] text-secondary">{message.time}</Text>
          </View>
        ))}
        {ask.isPending ? (
          <Text className="text-xs text-secondary">Checking the ledger…</Text>
        ) : null}
      </ScrollView>
      <KeyboardDock offset={64 + insets.bottom}>
      <View className="flex-row items-center gap-2 border-t border-hairline bg-white px-3 py-2">
        <TextInput
          className="h-11 flex-1 text-sm text-ink"
          placeholder="Ask or describe a spend"
          placeholderTextColor={colors.secondary}
          value={text}
          onChangeText={setText}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={() => send()}
        />
        <Pressable onPress={() => toast('Voice uses the same ledger check as typing.')}>
          <Icon name="mic" size={20} color={colors.secondary} />
        </Pressable>
        <Pressable
          className="h-9 w-9 items-center justify-center rounded-full bg-primary"
          onPress={() => send()}>
          <Icon name="arrow-upward" size={18} color={colors.white} />
        </Pressable>
      </View>
      </KeyboardDock>
    </View>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-[12px] text-secondary">{label}</Text>
      <Text className="text-[12px] text-ink">{value}</Text>
    </View>
  );
}
