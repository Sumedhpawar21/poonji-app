export function formatInr(amount: number, digits = 2) {
  const negative = amount < 0;
  const fixed = Math.abs(amount).toFixed(digits);
  const [int, dec] = fixed.split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const body = rest ? `${grouped},${last3}` : last3;
  const fraction = digits > 0 ? `.${dec}` : '';
  return `${negative ? '-' : ''}₹${body}${fraction}`;
}

export function formatSigned(amount: number, kind: 'expense' | 'income' | 'transfer' | 'plain') {
  const body = formatInr(Math.abs(amount));
  if (kind === 'expense') return `- ${body.replace('₹', '₹')}`;
  if (kind === 'income') return `+ ${body}`;
  return body;
}

export function formatCompact(amount: number) {
  const body = formatInr(Math.abs(amount), 0);
  if (amount > 0) return `+ ${body}`;
  if (amount < 0) return `- ${body}`;
  return body;
}

export function clockNow() {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const suffix = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}
