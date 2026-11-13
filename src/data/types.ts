import type { MaterialIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];
export type TxKind = 'expense' | 'income' | 'transfer';

export type Account = {
  id: string;
  name: string;
  role: string;
  detail: string;
  icon: IconName;
  opening: number;
  balance: number;
  started: string;
  last: string;
  archived?: boolean;
};

export type Transaction = {
  id: string;
  kind: TxKind;
  title: string;
  note: string;
  accountId: string;
  toAccountId?: string;
  amount: number;
  category: string;
  icon: IconName;
  dateLabel: string;
  group: string;
  time: string;
  backdated?: boolean;
  badge?: string;
};

export type Goal = {
  id: string;
  title: string;
  subtitle: string;
  icon: IconName;
  heldIn: string;
  saved: number;
  target: number;
  cadence: string;
  finish: string;
  paused?: boolean;
  queued?: string;
};

export type Commitment = {
  id: string;
  title: string;
  detail: string;
  amount: number;
  when: string;
  icon: IconName;
  status: 'due' | 'scheduled' | 'paid';
  upcoming: boolean;
};

export type NoticeGroup = 'bills' | 'cycle' | 'system';

export type Notice = {
  id: string;
  group: NoticeGroup;
  title: string;
  body: string;
  icon: IconName;
  time: string;
  unread: boolean;
  commitmentId?: string;
};

export type MemoryFact = {
  id: string;
  title: string;
  body: string;
  source: string;
  status: string;
};

export type DraftCard = {
  title: string;
  amount: number;
  category: string;
  accountId: string;
  saved?: boolean;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  card?: 'runway' | 'draft' | 'split';
  draft?: DraftCard;
  runway?: {
    flexible: number;
    purchase: number;
    remaining: number;
    headline: string;
    notes: string[];
  };
};

export type Budget = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: IconName;
  note: string;
};

export type Period = {
  label: string;
  days: number;
  income: number;
  incomeCount: number;
  expense: number;
  expenseCount: number;
};

export type Profile = {
  name: string;
  email: string;
  memberSince: string;
  payday: number;
  tone: string;
  currency: string;
  biometric: boolean;
  maskNotifications: boolean;
  useHistory: boolean;
  quietHours: boolean;
};

export type Ledger = {
  signedIn: boolean;
  accounts: Account[];
  transactions: Transaction[];
  goals: Goal[];
  commitments: Commitment[];
  notices: Notice[];
  facts: MemoryFact[];
  messages: ChatMessage[];
  budgets: Budget[];
  periods: Period[];
  periodIndex: number;
  otherReserve: number;
  profile: Profile;
};

export type NewTransaction = {
  kind: TxKind;
  amount: number;
  title: string;
  category: string;
  icon: IconName;
  accountId: string;
  toAccountId?: string;
  note?: string;
  dateLabel?: string;
  group?: string;
  backdated?: boolean;
};
