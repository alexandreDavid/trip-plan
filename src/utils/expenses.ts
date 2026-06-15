import { Expense } from '@/types';

// Tous les calculs se font en CENTIMES (entiers) dans la devise de base du
// voyage, pour éviter les dérives d'arrondi des flottants. On ne reconvertit en
// unités qu'à l'affichage.

const toCents = (amount: number): number => Math.round(amount * 100);

// Répartition d'une dépense : combien chaque participant concerné doit (centimes
// de base). Le reste d'arrondi est distribué de façon déterministe.
export function computeExpenseShares(expense: Expense): Record<string, number> {
  const ids = expense.splitBetween;
  if (ids.length === 0) return {};
  const totalCents = toCents(expense.amountInBase);
  const result: Record<string, number> = {};

  if (expense.splitMode === 'amounts' && expense.shares) {
    for (const id of ids) result[id] = toCents(expense.shares[id] ?? 0);
    return result;
  }

  const weights = ids.map((id) =>
    expense.splitMode === 'shares' ? expense.shares?.[id] ?? 0 : 1,
  );
  const totalWeight = weights.reduce((a, b) => a + b, 0) || 1;

  let allocated = 0;
  ids.forEach((id, i) => {
    const cents = Math.floor((totalCents * weights[i]) / totalWeight);
    result[id] = cents;
    allocated += cents;
  });

  // Distribution du reste (≤ nb de participants centimes) aux premiers concernés.
  let remainder = totalCents - allocated;
  let i = 0;
  while (remainder > 0) {
    result[ids[i % ids.length]] += 1;
    remainder -= 1;
    i += 1;
  }
  return result;
}

// Solde net par participant (centimes de base) :
//   positif  = on lui doit de l'argent (il a avancé plus que sa part)
//   négatif  = il doit de l'argent
export function computeBalances(
  expenses: Expense[],
  participantIds: string[],
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const id of participantIds) balances[id] = 0;

  for (const e of expenses) {
    const paidCents = toCents(e.amountInBase);
    balances[e.paidBy] = (balances[e.paidBy] ?? 0) + paidCents;
    const shares = computeExpenseShares(e);
    for (const [id, cents] of Object.entries(shares)) {
      balances[id] = (balances[id] ?? 0) - cents;
    }
  }
  return balances;
}

export interface Settlement {
  from: string; // participantId débiteur
  to: string; // participantId créancier
  amountCents: number;
}

// Remboursement minimal (glouton) : on apparie le plus gros débiteur avec le
// plus gros créancier jusqu'à épuisement. Minimise le nombre de virements.
export function computeSettlements(balances: Record<string, number>): Settlement[] {
  const debtors: { id: string; amt: number }[] = [];
  const creditors: { id: string; amt: number }[] = [];

  for (const [id, cents] of Object.entries(balances)) {
    if (cents < 0) debtors.push({ id, amt: -cents });
    else if (cents > 0) creditors.push({ id, amt: cents });
  }
  debtors.sort((a, b) => b.amt - a.amt);
  creditors.sort((a, b) => b.amt - a.amt);

  const settlements: Settlement[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amt, creditors[j].amt);
    if (pay > 0) {
      settlements.push({ from: debtors[i].id, to: creditors[j].id, amountCents: pay });
    }
    debtors[i].amt -= pay;
    creditors[j].amt -= pay;
    if (debtors[i].amt === 0) i += 1;
    if (creditors[j].amt === 0) j += 1;
  }
  return settlements;
}

export function sumExpensesInBase(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amountInBase, 0);
}

// Mode 'amounts' : écart (devise de base, arrondi au centime) entre le total à
// répartir et la somme des montants saisis. 0 = répartition complète et exacte ;
// >0 = il reste à répartir ; <0 = trop réparti.
export function amountsSplitDiff(total: number, amounts: number[]): number {
  const sum = amounts.reduce((a, b) => a + (Number.isFinite(b) ? b : 0), 0);
  return Math.round((total - sum) * 100) / 100;
}

// --- Formatage monétaire ---

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Devise inconnue d'Intl : repli simple.
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatCents(cents: number, currency: string): string {
  return formatMoney(cents / 100, currency);
}
