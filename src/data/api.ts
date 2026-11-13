import * as ledger from '@/data/ledger';
import type { NewTransaction } from '@/data/types';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function run<T>(work: () => T, ms = 200) {
  await wait(ms);
  return work();
}

export const readSession = () => run(() => ledger.snapshot().signedIn, 60);
export const readLedger = () => run(() => ledger.snapshot(), 160);

export const signIn = () => run(() => ledger.signIn(), 700);
export const signOut = () => run(() => ledger.signOut(), 250);
export const purgeVault = () => run(() => ledger.purgeVault(), 400);
export const cyclePeriod = () => run(() => ledger.cyclePeriod(), 120);
export const addTransaction = (input: NewTransaction) => run(() => ledger.addTransaction(input));
export const deleteTransaction = (id: string) => run(() => ledger.deleteTransaction(id));
export const markCommitmentPaid = (id: string) => run(() => ledger.markCommitmentPaid(id));
export const allocateToGoal = (id: string, amount: number) =>
  run(() => ledger.allocateToGoal(id, amount));
export const resumeGoal = (id: string) => run(() => ledger.resumeGoal(id));
export const createGoal = (title: string, target: number) =>
  run(() => ledger.createGoal(title, target));
export const addAccount = (name: string, opening: number) =>
  run(() => ledger.addAccount(name, opening));
export const restoreAccount = (id: string) => run(() => ledger.restoreAccount(id));
export const markNoticeRead = (id: string) => run(() => ledger.markNoticeRead(id));
export const markAllNoticesRead = () => run(() => ledger.markAllNoticesRead(), 120);
export const toggleProfile = (
  key: 'biometric' | 'maskNotifications' | 'useHistory' | 'quietHours'
) => run(() => ledger.toggleProfile(key), 80);
export const setPayday = (day: number) => run(() => ledger.setPayday(day));
export const removeFact = (id: string) => run(() => ledger.removeFact(id));
export const addFact = (body: string) => run(() => ledger.addFact(body));
export const confirmDraft = (messageId: string) => run(() => ledger.confirmDraft(messageId));
export const askCompanion = (text: string) => run(() => ledger.ask(text), 450);
