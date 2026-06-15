import { useEffect, useMemo, useState } from 'react';
import { Participant, Expense } from '@/types';
import {
  subscribeToParticipants,
  subscribeToExpenses,
} from '@/services/expenseService';
import {
  computeBalances,
  computeSettlements,
  sumExpensesInBase,
  Settlement,
} from '@/utils/expenses';

export function useParticipants(tripId: string | undefined) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    setLoading(true);
    const unsub = subscribeToParticipants(tripId, (p) => {
      setParticipants(p);
      setLoading(false);
    });
    return unsub;
  }, [tripId]);

  return { participants, loading };
}

interface ExpensesResult {
  expenses: Expense[];
  participants: Participant[];
  balances: Record<string, number>; // centimes, devise de base
  settlements: Settlement[];
  totalInBase: number;
  loading: boolean;
}

export function useTripExpenses(tripId: string | undefined): ExpensesResult {
  const { participants, loading: pLoading } = useParticipants(tripId);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [eLoading, setELoading] = useState(true);

  useEffect(() => {
    if (!tripId) return;
    setELoading(true);
    const unsub = subscribeToExpenses(tripId, (e) => {
      setExpenses(e);
      setELoading(false);
    });
    return unsub;
  }, [tripId]);

  const { balances, settlements } = useMemo(() => {
    const b = computeBalances(expenses, participants.map((p) => p.id));
    return { balances: b, settlements: computeSettlements(b) };
  }, [expenses, participants]);

  const totalInBase = useMemo(() => sumExpensesInBase(expenses), [expenses]);

  return {
    expenses,
    participants,
    balances,
    settlements,
    totalInBase,
    loading: pLoading || eLoading,
  };
}
