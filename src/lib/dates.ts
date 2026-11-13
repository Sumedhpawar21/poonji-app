const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function monthBounds(anchor = new Date()) {
  return {
    start: startOfDay(new Date(anchor.getFullYear(), anchor.getMonth(), 1)),
    end: startOfDay(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)),
  };
}

export function inclusiveDays(from: Date, to: Date) {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86400000) + 1;
}

export function formatDay(value: Date) {
  const day = startOfDay(value);
  return `${day.getDate()} ${MONTHS_SHORT[day.getMonth()]} ${day.getFullYear()}`;
}

export function formatRange(from: Date, to: Date) {
  const start = startOfDay(from);
  const end = startOfDay(to);
  if (sameDay(start, end)) return formatDay(start);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}–${end.getDate()} ${MONTHS_SHORT[start.getMonth()]} ${start.getFullYear()}`;
  }
  if (start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} ${MONTHS_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }
  return `${formatDay(start)} – ${formatDay(end)}`;
}

export function describeDate(value: Date) {
  const today = startOfDay(new Date());
  const day = startOfDay(value);
  const short = `${day.getDate()} ${MONTHS_SHORT[day.getMonth()]}`;
  const long = `${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`;
  const isToday = sameDay(day, today);
  return {
    label: isToday ? `${short} ${day.getFullYear()} (Today)` : `${short} ${day.getFullYear()}`,
    dateLabel: isToday ? `Today, ${short}` : short,
    group: isToday ? `Today — ${long}` : `${WEEKDAYS[day.getDay()]} — ${long}`,
    backdated: day.getTime() < today.getTime(),
  };
}

export function parseLedgerDate(group: string) {
  const match = group.match(
    new RegExp(`(\\d{1,2}) (${MONTHS.join('|')}) (\\d{4})`)
  );
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month < 0) return null;
  return startOfDay(new Date(Number(match[3]), month, Number(match[1])));
}

export function inDateRange(day: Date, from: Date, to: Date) {
  const time = startOfDay(day).getTime();
  return time >= startOfDay(from).getTime() && time <= startOfDay(to).getTime();
}
