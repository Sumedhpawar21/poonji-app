import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/data/api';
import type { Ledger, NewTransaction } from '@/data/types';

function useLedgerMutation<TArgs>(
  mutationFn: (args: TArgs) => Promise<Ledger>,
  options?: { onSignedOut?: boolean }
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (ledger) => {
      client.setQueryData(['ledger'], ledger);
      client.setQueryData(['session'], ledger.signedIn);
      if (options?.onSignedOut) client.removeQueries({ queryKey: ['ledger'] });
    },
  });
}

export function useSession() {
  return useQuery({ queryKey: ['session'], queryFn: api.readSession });
}

export function useLedger() {
  const session = useSession();
  return useQuery({
    queryKey: ['ledger'],
    queryFn: api.readLedger,
    enabled: session.data === true,
  });
}

export function useSignIn() {
  return useLedgerMutation(api.signIn);
}

export function useSignOut() {
  return useLedgerMutation(api.signOut, { onSignedOut: true });
}

export function usePurgeVault() {
  return useLedgerMutation(api.purgeVault, { onSignedOut: true });
}

export function useCyclePeriod() {
  return useLedgerMutation(api.cyclePeriod);
}

export function useAddTransaction() {
  return useLedgerMutation((input: NewTransaction) => api.addTransaction(input));
}

export function useDeleteTransaction() {
  return useLedgerMutation(api.deleteTransaction);
}

export function useMarkPaid() {
  return useLedgerMutation(api.markCommitmentPaid);
}

export function useAllocate() {
  return useLedgerMutation(({ id, amount }: { id: string; amount: number }) =>
    api.allocateToGoal(id, amount)
  );
}

export function useResumeGoal() {
  return useLedgerMutation(api.resumeGoal);
}

export function useCreateGoal() {
  return useLedgerMutation(({ title, target }: { title: string; target: number }) =>
    api.createGoal(title, target)
  );
}

export function useAddAccount() {
  return useLedgerMutation(({ name, opening }: { name: string; opening: number }) =>
    api.addAccount(name, opening)
  );
}

export function useRestoreAccount() {
  return useLedgerMutation(api.restoreAccount);
}

export function useMarkNotice() {
  return useLedgerMutation(api.markNoticeRead);
}

export function useMarkAllNotices() {
  return useLedgerMutation(api.markAllNoticesRead);
}

export function useToggleProfile() {
  return useLedgerMutation(api.toggleProfile);
}

export function useSetPayday() {
  return useLedgerMutation(api.setPayday);
}

export function useRemoveFact() {
  return useLedgerMutation(api.removeFact);
}

export function useAddFact() {
  return useLedgerMutation(api.addFact);
}

export function useConfirmDraft() {
  return useLedgerMutation(api.confirmDraft);
}

export function useAsk() {
  return useLedgerMutation(api.askCompanion);
}
