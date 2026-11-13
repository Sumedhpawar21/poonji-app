import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui';
import { MONTHS, sameDay, startOfDay } from '@/lib/dates';
import { colors } from '@/theme/colors';

const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function monthCells(cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= count; day += 1) cells.push(startOfDay(new Date(year, month, day)));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));
  return weeks;
}

export function CalendarSheet({
  visible,
  mode,
  start,
  end,
  maximumDate,
  title,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  mode: 'single' | 'range';
  start: Date;
  end?: Date;
  maximumDate?: Date;
  title: string;
  onClose: () => void;
  onConfirm: (start: Date, end: Date) => void;
}) {
  const insets = useSafeAreaInsets();
  const [draftStart, setDraftStart] = useState(() => startOfDay(start));
  const [draftEnd, setDraftEnd] = useState(() => startOfDay(end ?? start));
  const [anchor, setAnchor] = useState<Date | null>(null);
  const [cursor, setCursor] = useState(() => new Date(start.getFullYear(), start.getMonth(), 1));
  const limit = maximumDate ? startOfDay(maximumDate) : null;

  useEffect(() => {
    if (!visible) return;
    const nextStart = startOfDay(start);
    const nextEnd = startOfDay(end ?? start);
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    setAnchor(null);
    setCursor(new Date(nextEnd.getFullYear(), nextEnd.getMonth(), 1));
  }, [visible, start, end]);

  const pick = (day: Date) => {
    if (limit && day.getTime() > limit.getTime()) return;
    if (mode === 'single') {
      setDraftStart(day);
      setDraftEnd(day);
      setAnchor(null);
      return;
    }
    if (!anchor) {
      setDraftStart(day);
      setDraftEnd(day);
      setAnchor(day);
      return;
    }
    const from = day.getTime() < anchor.getTime() ? day : anchor;
    const to = day.getTime() < anchor.getTime() ? anchor : day;
    setDraftStart(from);
    setDraftEnd(to);
    setAnchor(null);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          className="rounded-t-3xl bg-white px-4 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          onPress={() => undefined}>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-display text-lg text-ink">{title}</Text>
            <Pressable className="h-11 justify-center px-2" onPress={onClose}>
              <Text className="text-sm text-secondary">Close</Text>
            </Pressable>
          </View>

          {mode === 'range' ? (
            <View className="mb-3 flex-row gap-2">
              <View className="flex-1 rounded-2xl bg-primary-fixed px-3 py-2">
                <Text className="text-[11px] uppercase tracking-wider text-primary">From</Text>
                <Text className="mt-0.5 text-sm text-ink">
                  {draftStart.getDate()} {MONTHS[draftStart.getMonth()].slice(0, 3)}
                </Text>
              </View>
              <View className="flex-1 rounded-2xl bg-primary-fixed px-3 py-2">
                <Text className="text-[11px] uppercase tracking-wider text-primary">To</Text>
                <Text className="mt-0.5 text-sm text-ink">
                  {draftEnd.getDate()} {MONTHS[draftEnd.getMonth()].slice(0, 3)}
                </Text>
              </View>
            </View>
          ) : null}

          <View className="mb-2 flex-row items-center justify-between">
            <Pressable
              className="h-10 w-10 items-center justify-center"
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
              <Icon name="chevron-left" size={22} color={colors.ink} />
            </Pressable>
            <Text className="font-display text-base text-ink">
              {MONTHS[cursor.getMonth()]} {cursor.getFullYear()}
            </Text>
            <Pressable
              className="h-10 w-10 items-center justify-center"
              onPress={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
              <Icon name="chevron-right" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <View className="mb-1 flex-row">
            {WEEK.map((label, index) => (
              <Text key={`${label}-${index}`} className="flex-1 text-center text-[11px] text-secondary">
                {label}
              </Text>
            ))}
          </View>

          {monthCells(cursor).map((week, weekIndex) => (
            <View key={weekIndex} className="flex-row">
              {week.map((day, dayIndex) => {
                if (!day) return <View key={`empty-${dayIndex}`} className="h-11 flex-1" />;
                const disabled = limit ? day.getTime() > limit.getTime() : false;
                const startEdge = sameDay(day, draftStart);
                const endEdge = sameDay(day, draftEnd);
                const inside =
                  day.getTime() > draftStart.getTime() && day.getTime() < draftEnd.getTime();
                const today = sameDay(day, new Date());
                return (
                  <Pressable
                    key={day.toISOString()}
                    disabled={disabled}
                    className="h-11 flex-1 items-center justify-center"
                    onPress={() => pick(day)}>
                    {inside || startEdge || endEdge ? (
                      <View
                        className={`absolute inset-y-1 bg-primary-fixed ${startEdge ? 'left-1/2' : 'left-0'} ${endEdge ? 'right-1/2' : 'right-0'}`}
                      />
                    ) : null}
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-full ${startEdge || endEdge ? 'bg-primary' : ''} ${today && !startEdge && !endEdge ? 'border border-primary' : ''}`}>
                      <Text
                        className={`text-sm ${startEdge || endEdge ? 'text-white' : disabled ? 'text-secondary/40' : 'text-ink'}`}>
                        {day.getDate()}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {mode === 'range' ? (
            <Text className="mt-2 text-center text-[12px] text-secondary">
              Tap a start date, then an end date. The same day can be both.
            </Text>
          ) : null}

          <Pressable
            className="mt-3 h-12 items-center justify-center rounded-2xl bg-primary"
            onPress={() => onConfirm(draftStart, draftEnd)}>
            <Text className="text-sm text-white">Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
