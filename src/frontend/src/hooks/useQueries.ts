import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BetStatus, type Color } from "../backend.d";
import { useActor } from "./useActor";

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserBalance() {
  const { actor, isFetching } = useActor();
  return useQuery<bigint>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.getUserBalance();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useActiveRound() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["activeRound"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getActiveRound();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useGameHistory() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["gameHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGameHistory();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useMyDeposits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myDeposits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyDeposits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMyWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDeposits() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allDeposits"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDeposits();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllWithdrawals() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allWithdrawals"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllWithdrawals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllBets() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allBets"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBets();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.registerUser();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function usePlaceBet() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roundId,
      color,
      amount,
    }: { roundId: bigint; color: Color; amount: bigint }) => {
      if (!actor) throw new Error("No actor");
      return actor.placeBet(roundId, color, amount);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["balance"] });
      qc.invalidateQueries({ queryKey: ["activeRound"] });
    },
  });
}

export function useCreateDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      amount,
      utr,
      note,
    }: { amount: bigint; utr: string; note: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createDeposit(amount, utr, note);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myDeposits"] });
    },
  });
}

export function useCreateWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ amount, upi }: { amount: bigint; upi: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createWithdrawal(amount, upi);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myWithdrawals"] });
      qc.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}

export function useStartNewRound() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.startNewRound(180n);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRound"] });
    },
  });
}

export function useSetRoundResult() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      roundId,
      result,
    }: { roundId: bigint; result: Color }) => {
      if (!actor) throw new Error("No actor");
      return actor.setRoundResult(roundId, result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRound"] });
      qc.invalidateQueries({ queryKey: ["gameHistory"] });
    },
  });
}

export function useCloseRound() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (roundId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.closeRound(roundId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activeRound"] });
    },
  });
}

export function useApproveDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.approveDeposit(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDeposits"] });
    },
  });
}

export function useRejectDeposit() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectDeposit(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allDeposits"] });
    },
  });
}

export function useMarkWithdrawalPaid() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.markWithdrawalPaid(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allWithdrawals"] });
    },
  });
}

export function useRejectWithdrawal() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.rejectWithdrawal(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allWithdrawals"] });
    },
  });
}
