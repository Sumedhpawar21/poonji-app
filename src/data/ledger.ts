import { clockNow } from '@/lib/money';
import type { ChatMessage, Ledger, NewTransaction, Transaction, TxKind } from '@/data/types';

const budgetKey: Record<string, string> = {
  'Food & Dining': 'food',
  'Work & Coffee': 'food',
  Groceries: 'shopping',
  'Transport / Commute': 'commute',
  Commute: 'commute',
  'Shopping & Personal': 'shopping',
};

function createLedger(): Ledger {
  return {
    signedIn: false,
    periodIndex: 0,
    otherReserve: 19550,
    periods: [
      {
        label: 'October 2026',
        days: 31,
        income: 85000,
        incomeCount: 1,
        expense: 42680,
        expenseCount: 24,
      },
      {
        label: 'September 2026',
        days: 30,
        income: 85000,
        incomeCount: 1,
        expense: 39120,
        expenseCount: 21,
      },
    ],
    profile: {
      name: 'Ananya Sharma',
      email: 'ananya.sharma@gmail.com',
      memberSince: 'Oct 2026',
      payday: 10,
      tone: 'Calm & Non-Judgmental',
      currency: 'INR (₹) • Indian Rupee',
      biometric: true,
      maskNotifications: true,
      useHistory: true,
      quietHours: true,
    },
    accounts: [
      {
        id: 'hdfc',
        name: 'HDFC Bank',
        role: 'Primary Salary',
        detail: 'Salary Account • ••4092',
        icon: 'account-balance',
        opening: 50000,
        balance: 92400,
        started: 'Started 1 Oct 2026',
        last: 'Dinner with team (−₹640.00)',
      },
      {
        id: 'icici',
        name: 'ICICI Savings',
        role: 'Emergency Buffer',
        detail: 'InstaSave • ••8812',
        icon: 'savings',
        opening: 36850,
        balance: 51850,
        started: 'Opening retained',
        last: 'Transfers received: +₹15,000.00 this month',
      },
      {
        id: 'cash',
        name: 'Cash Wallet',
        role: 'Physical Cash',
        detail: 'Wallet & Home Drawer',
        icon: 'payments',
        opening: 5000,
        balance: 4000,
        started: 'Opening ₹5,000.00',
        last: 'Filter Coffee (−₹280.00)',
      },
      {
        id: 'sbi',
        name: 'Old SBI Student Account',
        role: 'Archived',
        detail: 'Historical ledger preserved',
        icon: 'school',
        opening: 0,
        balance: 0,
        started: 'Closed',
        last: 'Final balance ₹0.00',
        archived: true,
      },
    ],
    transactions: [
      {
        id: 'tx-swiggy',
        kind: 'expense',
        title: 'Swiggy Food Delivery',
        note: 'Dinner with team',
        accountId: 'hdfc',
        amount: 640,
        category: 'Food & Dining',
        icon: 'restaurant',
        dateLabel: 'Today, 28 Oct',
        group: 'Today — 28 October 2026',
        time: 'Today, 4:15 PM',
      },
      {
        id: 'tx-tokai',
        kind: 'expense',
        title: 'Blue Tokai Coffee',
        note: 'Work catchup',
        accountId: 'cash',
        amount: 280,
        category: 'Work & Coffee',
        icon: 'local-cafe',
        dateLabel: 'Today, 28 Oct',
        group: 'Today — 28 October 2026',
        time: 'Today, 2:40 PM',
      },
      {
        id: 'tx-transfer',
        kind: 'transfer',
        title: 'Transfer to Savings',
        note: 'Monthly emergency buffer',
        accountId: 'hdfc',
        toAccountId: 'icici',
        amount: 15000,
        category: 'Self transfer',
        icon: 'swap-horiz',
        dateLabel: '26 Oct',
        group: 'Sunday — 26 October 2026',
        time: '26 Oct, 9:10 AM',
        badge: 'Neutral',
      },
      {
        id: 'tx-gym',
        kind: 'expense',
        title: 'Cult.fit Gym Membership',
        note: 'Annual renewal',
        accountId: 'icici',
        amount: 14500,
        category: 'Health',
        icon: 'fitness-center',
        dateLabel: '26 Oct',
        group: 'Sunday — 26 October 2026',
        time: '26 Oct, 8:02 AM',
      },
      {
        id: 'tx-salary',
        kind: 'income',
        title: 'Monthly Salary',
        note: 'Acme Corp Tech',
        accountId: 'hdfc',
        amount: 85000,
        category: 'Salary',
        icon: 'work',
        dateLabel: '25 Oct',
        group: 'Saturday — 25 October 2026',
        time: '25 Oct, 10:24 AM',
      },
      {
        id: 'tx-basket',
        kind: 'expense',
        title: "Nature's Basket",
        note: 'Weekly kitchen essentials',
        accountId: 'hdfc',
        amount: 1850,
        category: 'Groceries',
        icon: 'local-grocery-store',
        dateLabel: '22 Oct',
        group: 'Wednesday — 22 October 2026',
        time: '22 Oct, 6:40 PM',
        badge: 'Backdated',
        backdated: true,
      },
      {
        id: 'tx-uber',
        kind: 'expense',
        title: 'Uber Commute',
        note: 'Airport cab',
        accountId: 'hdfc',
        amount: 1240,
        category: 'Transport / Commute',
        icon: 'local-taxi',
        dateLabel: '18 Oct',
        group: 'Backdated — 18 October 2026',
        time: 'Added 25 Oct',
        badge: 'Logged catch-up',
        backdated: true,
      },
    ],
    goals: [
      {
        id: 'emergency',
        title: 'Emergency Buffer',
        subtitle: '3 Months',
        icon: 'shield',
        heldIn: 'Held in ICICI Savings',
        saved: 45000,
        target: 150000,
        cadence: '₹10,000 / month cadence',
        finish: 'April 2027',
      },
      {
        id: 'trek',
        title: 'Himalayan Trek & Vacation',
        subtitle: 'Priority 2 · Dec 2026',
        icon: 'landscape',
        heldIn: 'Earmarked across salary flow',
        saved: 15000,
        target: 35000,
        cadence: '2 cycles away',
        finish: 'Dec 2026',
        queued: '₹10,000 queued for next payday',
      },
      {
        id: 'laptop',
        title: 'New Work Laptop Upgrade',
        subtitle: 'Paused temporarily',
        icon: 'laptop-mac',
        heldIn: 'No active auto-debits',
        saved: 5000,
        target: 80000,
        cadence: 'No active auto-debits',
        finish: 'When you resume',
        paused: true,
      },
    ],
    commitments: [
      {
        id: 'rent',
        title: 'House Rent',
        detail: 'HDFC Salary • Due 01 Nov',
        amount: 28000,
        when: 'In 4 days',
        icon: 'home-work',
        status: 'due',
        upcoming: true,
      },
      {
        id: 'airtel',
        title: 'Airtel Fiber Broadband',
        detail: 'UPI AutoPay • Due 03 Nov',
        amount: 1180,
        when: 'Scheduled',
        icon: 'wifi',
        status: 'scheduled',
        upcoming: true,
      },
      {
        id: 'health',
        title: 'Care Health EMI',
        detail: 'ICICI Card • Due 05 Nov',
        amount: 3620,
        when: 'In 8 days',
        icon: 'health-and-safety',
        status: 'due',
        upcoming: true,
      },
      {
        id: 'power',
        title: 'Electricity Bill',
        detail: 'Planned for ₹2,450',
        amount: 2450,
        when: 'Check-in 27 Oct',
        icon: 'bolt',
        status: 'due',
        upcoming: false,
      },
    ],
    notices: [
      {
        id: 'n-rent',
        group: 'bills',
        title: 'House Rent due in 4 days',
        body: '₹28,000.00 planned from HDFC Salary on 01 Nov 2026. Auto-debit not scheduled.',
        icon: 'home-work',
        time: 'Today',
        unread: true,
        commitmentId: 'rent',
      },
      {
        id: 'n-power',
        group: 'bills',
        title: 'Electricity Bill check-in',
        body: 'Planned for ₹2,450. Was this settled or postponed? Backdating is welcome.',
        icon: 'bolt',
        time: 'Today',
        unread: true,
        commitmentId: 'power',
      },
      {
        id: 'n-cycle',
        group: 'cycle',
        title: 'Mid-Cycle Checkup Ready',
        body: '12 days remain until 10 Nov payday. Flexible reserve is ₹28,450.',
        icon: 'donut-large',
        time: 'Yesterday',
        unread: false,
      },
      {
        id: 'n-backup',
        group: 'system',
        title: 'Weekly Encrypted Backup Succeeded',
        body: 'Local ledger snapshot stored in your private keychain. Sync stays on this device.',
        icon: 'verified-user',
        time: '3d ago',
        unread: false,
      },
    ],
    facts: [
      {
        id: 'f1',
        title: 'Rhythm Memory',
        body: 'Payday rhythm anchored to 10th of each month; major overhead checks happen the following weekend.',
        source: 'Profile Setup',
        status: 'Confirmed by you',
      },
      {
        id: 'f2',
        title: 'Goal Safeguard',
        body: 'Emergency reserve goal is ₹1,50,000 kept in ICICI Savings; do not count it as discretionary.',
        source: 'Goals Vault',
        status: 'Verified',
      },
      {
        id: 'f3',
        title: 'Wellbeing Policy',
        body: 'Prefers no guilt notifications, red spending warnings, or aggressive daily streak popups.',
        source: 'Onboarding Preferences',
        status: 'Permanent anchor',
      },
    ],
    messages: [
      {
        id: 'm1',
        role: 'user',
        text: "I'm thinking of buying an ergonomic chair for ₹18,500. Will it derail my Diwali trip goal or leave me tight before 10 Nov payday?",
        time: '2:14 PM',
      },
      {
        id: 'm2',
        role: 'assistant',
        text: 'Here is what your verified accounts and scheduled commitments show for the remaining 12 days of this cycle (ending 09 Nov).',
        time: '2:14 PM',
        card: 'runway',
        runway: {
          headline: 'Solvent with a tighter buffer',
          flexible: 28450,
          purchase: 18500,
          remaining: 9950,
          notes: [
            'Rent (₹28,000) and utilities already sit in allocated funds.',
            'Diwali vacation goal stays intact. No withdrawal required.',
            'About ₹829 a day would remain. Your non-rent baseline is near ₹650 a day.',
          ],
        },
      },
      {
        id: 'm3',
        role: 'user',
        text: 'Add ₹380 for lunch with team today',
        time: '2:18 PM',
      },
      {
        id: 'm4',
        role: 'assistant',
        text: 'Expense drafted for verification. Nothing is saved until you confirm.',
        time: '2:18 PM',
        card: 'draft',
        draft: {
          title: 'Team Lunch',
          amount: 380,
          category: 'Food & Dining',
          accountId: 'hdfc',
        },
      },
    ],
    budgets: [
      {
        id: 'food',
        name: 'Food & Dining',
        spent: 14250,
        limit: 18000,
        icon: 'restaurant',
        note: 'Safe pace (~₹312/day left)',
      },
      {
        id: 'commute',
        name: 'Commute & Metro',
        spent: 3400,
        limit: 6000,
        icon: 'directions-subway',
        note: 'Well within limit',
      },
      {
        id: 'shopping',
        name: 'Shopping & Personal',
        spent: 6800,
        limit: 10000,
        icon: 'shopping-bag',
        note: 'Comfortable breathing room',
      },
    ],
  };
}

let state = createLedger();

export function snapshot(): Ledger {
  return JSON.parse(JSON.stringify(state)) as Ledger;
}

export function accountName(id: string, ledger: Ledger = state) {
  return ledger.accounts.find((account) => account.id === id)?.name ?? 'Account';
}

export function liquidOf(ledger: Ledger) {
  return ledger.accounts
    .filter((account) => !account.archived)
    .reduce((sum, account) => sum + account.balance, 0);
}

export function earmarkedOf(ledger: Ledger) {
  return ledger.goals.reduce((sum, goal) => sum + goal.saved, 0);
}

export function unpaidOf(ledger: Ledger) {
  const listed = ledger.commitments
    .filter((item) => item.status !== 'paid')
    .reduce((sum, item) => sum + item.amount, 0);
  return listed + ledger.otherReserve;
}

export function flexibleOf(ledger: Ledger) {
  return liquidOf(ledger) - unpaidOf(ledger) - earmarkedOf(ledger);
}

function requireAccount(id: string) {
  const account = state.accounts.find((item) => item.id === id && !item.archived);
  if (!account) throw new Error('Choose an active account.');
  return account;
}

function shiftBudget(category: string, delta: number) {
  const key = budgetKey[category];
  if (!key || state.periodIndex !== 0) return;
  const budget = state.budgets.find((item) => item.id === key);
  if (!budget) return;
  budget.spent = Math.max(0, Math.round((budget.spent + delta) * 100) / 100);
}

function applyTransaction(tx: Transaction, direction: 1 | -1) {
  const amount = tx.amount * direction;
  const from = state.accounts.find((account) => account.id === tx.accountId);
  if (!from) return;
  if (tx.kind === 'expense') {
    from.balance -= amount;
    state.periods[state.periodIndex].expense += amount;
    if (direction > 0) state.periods[state.periodIndex].expenseCount += 1;
    if (direction < 0)
      state.periods[state.periodIndex].expenseCount = Math.max(
        0,
        state.periods[state.periodIndex].expenseCount - 1
      );
    shiftBudget(tx.category, amount);
  } else if (tx.kind === 'income') {
    from.balance += amount;
    state.periods[state.periodIndex].income += amount;
    if (direction > 0) state.periods[state.periodIndex].incomeCount += 1;
    if (direction < 0)
      state.periods[state.periodIndex].incomeCount = Math.max(
        0,
        state.periods[state.periodIndex].incomeCount - 1
      );
  } else if (tx.toAccountId) {
    const to = state.accounts.find((account) => account.id === tx.toAccountId);
    from.balance -= amount;
    if (to) to.balance += amount;
  }
}

export function signIn() {
  state.signedIn = true;
  return snapshot();
}

export function signOut() {
  state.signedIn = false;
  return snapshot();
}

export function purgeVault() {
  const fresh = createLedger();
  fresh.signedIn = false;
  state = fresh;
  return snapshot();
}

export function cyclePeriod() {
  state.periodIndex = (state.periodIndex + 1) % state.periods.length;
  return snapshot();
}

export function addTransaction(input: NewTransaction) {
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    throw new Error('Enter an amount greater than zero.');
  }
  const from = requireAccount(input.accountId);
  if (input.kind === 'transfer') {
    if (!input.toAccountId || input.toAccountId === input.accountId) {
      throw new Error('Choose two different accounts.');
    }
    requireAccount(input.toAccountId);
  }
  const tx: Transaction = {
    id: `tx-${Date.now()}`,
    kind: input.kind,
    title: input.title.trim() || defaultTitle(input.kind),
    note: input.note?.trim() || input.category,
    accountId: input.accountId,
    toAccountId: input.toAccountId,
    amount: Math.round(input.amount * 100) / 100,
    category: input.category,
    icon: input.icon,
    dateLabel: input.dateLabel || 'Today, 28 Oct',
    group: input.group || 'Today — 28 October 2026',
    time: `Today, ${clockNow()}`,
    backdated: input.backdated,
    badge: input.backdated ? 'Backdated' : undefined,
  };
  applyTransaction(tx, 1);
  from.last = `${tx.title} · ${tx.dateLabel}`;
  state.transactions.unshift(tx);
  return snapshot();
}

function defaultTitle(kind: TxKind) {
  if (kind === 'income') return 'Money in';
  if (kind === 'transfer') return 'Transfer';
  return 'Expense';
}

export function deleteTransaction(id: string) {
  const index = state.transactions.findIndex((item) => item.id === id);
  if (index < 0) throw new Error('That entry is no longer in the ledger.');
  const [tx] = state.transactions.splice(index, 1);
  applyTransaction(tx, -1);
  return snapshot();
}

export function markCommitmentPaid(id: string) {
  const item = state.commitments.find((commitment) => commitment.id === id);
  if (!item) throw new Error('Commitment not found.');
  if (item.status !== 'paid') item.status = 'paid';
  state.notices.forEach((notice) => {
    if (notice.commitmentId === id) notice.unread = false;
  });
  return snapshot();
}

export function allocateToGoal(id: string, amount: number) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) throw new Error('Goal not found.');
  if (amount <= 0) throw new Error('Choose an amount to earmark.');
  const room = flexibleOf(state);
  if (amount > room) throw new Error('That is more than the current flexible cash.');
  goal.saved = Math.min(goal.target, Math.round((goal.saved + amount) * 100) / 100);
  return snapshot();
}

export function resumeGoal(id: string) {
  const goal = state.goals.find((item) => item.id === id);
  if (!goal) throw new Error('Goal not found.');
  goal.paused = !goal.paused;
  goal.subtitle = goal.paused ? 'Paused temporarily' : 'Resumed gently';
  return snapshot();
}

export function createGoal(title: string, target: number) {
  if (!title.trim() || target <= 0) throw new Error('Name the goal and set a target.');
  state.goals.unshift({
    id: `goal-${Date.now()}`,
    title: title.trim(),
    subtitle: 'Just opened',
    icon: 'flag',
    heldIn: 'Earmarked virtually',
    saved: 0,
    target,
    cadence: 'Add whenever it feels right',
    finish: 'At your pace',
  });
  return snapshot();
}

export function addAccount(name: string, opening: number) {
  if (!name.trim()) throw new Error('Name this account.');
  if (opening < 0) throw new Error('Opening balance cannot be negative.');
  state.accounts.unshift({
    id: `acct-${Date.now()}`,
    name: name.trim(),
    role: 'Manual ledger',
    detail: 'Added on this device',
    icon: 'account-balance-wallet',
    opening,
    balance: opening,
    started: 'Started today',
    last: 'Opening balance recorded',
  });
  return snapshot();
}

export function restoreAccount(id: string) {
  const account = state.accounts.find((item) => item.id === id);
  if (!account) throw new Error('Account not found.');
  account.archived = false;
  account.role = 'Restored ledger';
  return snapshot();
}

export function markNoticeRead(id: string) {
  const notice = state.notices.find((item) => item.id === id);
  if (notice) notice.unread = false;
  return snapshot();
}

export function markAllNoticesRead() {
  state.notices.forEach((notice) => {
    notice.unread = false;
  });
  return snapshot();
}

export function toggleProfile(
  key: 'biometric' | 'maskNotifications' | 'useHistory' | 'quietHours'
) {
  state.profile[key] = !state.profile[key];
  return snapshot();
}

export function setPayday(day: number) {
  if (day < 1 || day > 28) throw new Error('Pick a payday between 1 and 28.');
  state.profile.payday = day;
  const fact = state.facts.find((item) => item.id === 'f1');
  if (fact) fact.body = `Payday rhythm anchored to the ${day}th of each month.`;
  return snapshot();
}

export function removeFact(id: string) {
  state.facts = state.facts.filter((fact) => fact.id !== id);
  return snapshot();
}

export function addFact(body: string) {
  if (!body.trim()) throw new Error('Write the fact you want remembered.');
  state.facts.unshift({
    id: `fact-${Date.now()}`,
    title: 'Personal note',
    body: body.trim(),
    source: 'Added by you',
    status: 'Confirmed by you',
  });
  return snapshot();
}

export function confirmDraft(messageId: string) {
  const message = state.messages.find((item) => item.id === messageId);
  if (!message?.draft || message.draft.saved) return snapshot();
  addTransaction({
    kind: 'expense',
    amount: message.draft.amount,
    title: message.draft.title,
    category: message.draft.category,
    icon: 'lunch-dining',
    accountId: message.draft.accountId,
    note: 'Confirmed from Ask',
  });
  message.draft.saved = true;
  message.text = 'Saved to your ledger. Balances updated quietly.';
  return snapshot();
}

export function ask(text: string) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Ask a question or describe a transaction.');
  const user: ChatMessage = {
    id: `m-${Date.now()}`,
    role: 'user',
    text: trimmed,
    time: clockNow(),
  };
  const assistant = buildReply(trimmed);
  state.messages.push(user, assistant);
  return snapshot();
}

function buildReply(text: string): ChatMessage {
  const lower = text.toLowerCase();
  const amountMatch = text.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)/);
  const amount = amountMatch ? Number(amountMatch[1].replace(/,/g, '')) : 0;
  const flexible = flexibleOf(state);
  const base = { id: `a-${Date.now()}`, role: 'assistant' as const, time: clockNow() };

  if (/food|dining|swiggy|coffee/.test(lower) && /how much|spent|spend|total/.test(lower)) {
    const food = state.budgets.find((item) => item.id === 'food');
    return {
      ...base,
      text: food
        ? `${food.name} is ${formatPlain(food.spent)} of a ${formatPlain(food.limit)} guidepost. ${food.note}.`
        : 'Food spending is not on this cycle yet.',
    };
  }

  if (/commitment|bill|payday|upcoming|rent/.test(lower)) {
    const open = state.commitments.filter((item) => item.status !== 'paid' && item.upcoming);
    const lines = open
      .map((item) => `${item.title}: ${formatPlain(item.amount)} (${item.when})`)
      .join('\n');
    return {
      ...base,
      text: `Payday is the ${state.profile.payday}th. Flexible cash is ${formatPlain(flexible)}.\n${lines}`,
    };
  }

  if (/afford|chair|flight|what if|derail|buy/.test(lower) && amount > 0) {
    const remaining = Math.round((flexible - amount) * 100) / 100;
    return {
      ...base,
      text: 'Deterministic runway check from your ledger and unpaid commitments. No forecast beyond the numbers you recorded.',
      card: 'runway',
      runway: {
        headline:
          remaining >= 15000
            ? 'Comfortable after this purchase'
            : remaining >= 0
              ? 'Solvent with a tighter buffer'
              : 'This would use more than flexible cash',
        flexible,
        purchase: amount,
        remaining,
        notes: [
          'Earmarked goals stay untouched unless you choose to move them.',
          'Unpaid commitments are already removed from flexible cash.',
          remaining >= 0
            ? `About ${formatPlain(remaining / 12)} a day would remain across 12 days.`
            : 'You can still buy it from liquid cash. It would dip into the safety buffer.',
        ],
      },
    };
  }

  if (amount > 0 && /spent|paid|add|log|lunch|coffee|uber|bought/.test(lower)) {
    const title = text
      .replace(/₹?\s*\d+(?:,\d+)*(?:\.\d+)?/g, '')
      .replace(/spent|paid|add|log|for|on|today|₹/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    return {
      ...base,
      text: 'Expense drafted for verification. Nothing is saved until you confirm.',
      card: 'draft',
      draft: {
        title: title ? capitalize(title) : 'Quick log',
        amount,
        category: /coffee|lunch|food|dinner|swiggy/.test(lower)
          ? 'Food & Dining'
          : 'Shopping & Personal',
        accountId: 'hdfc',
      },
    };
  }

  const period = state.periods[state.periodIndex];
  return {
    ...base,
    text: `${period.label}: income ${formatPlain(period.income)}, expenses ${formatPlain(period.expense)}. Flexible cash is ${formatPlain(flexible)} across ${state.accounts.filter((account) => !account.archived).length} active accounts. Ask about a purchase, a category, or describe a spend to draft it.`,
  };
}

function formatPlain(amount: number) {
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const [int, dec] = abs.toFixed(2).split('.');
  const last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  const body = rest ? `${grouped},${last3}` : last3;
  return `${negative ? '-' : ''}₹${body}.${dec}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
