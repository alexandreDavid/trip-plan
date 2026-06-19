import { Expense, ExpenseCategory } from '@/types';

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

// Normalise le champ payeurs en map participantId -> montant payé (devise de la
// dépense). Tolère l'ancien format `paidBy: string` (un seul payeur, montant total).
export function expensePayers(expense: Expense): Record<string, number> {
  const pb = expense.paidBy as unknown;
  if (typeof pb === 'string') return { [pb]: expense.amount };
  return (pb as Record<string, number>) ?? {};
}

// Montant réellement payé (au prestataire) = somme des paiements des payeurs, dans
// la devise de la dépense. ≤ `amount` : 0 = non payée, = amount = payée.
export function expensePaidAmount(expense: Expense): number {
  return Object.values(expensePayers(expense)).reduce((a, b) => a + b, 0);
}

// Montant payé converti en centimes de base.
function paidBaseCents(expense: Expense): number {
  return toCents(expensePaidAmount(expense) * expense.rate);
}

// Crédit de chaque payeur en centimes de base. Le dernier payeur absorbe l'arrondi
// pour que la somme égale exactement le montant payé.
function payerCreditsCents(expense: Expense): Record<string, number> {
  const payers = expensePayers(expense);
  const ids = Object.keys(payers);
  if (ids.length === 0) return {};
  const targetCents = paidBaseCents(expense);
  const out: Record<string, number> = {};
  let allocated = 0;
  ids.forEach((id, i) => {
    if (i === ids.length - 1) {
      out[id] = targetCents - allocated;
    } else {
      const cents = toCents(payers[id] * expense.rate);
      out[id] = cents;
      allocated += cents;
    }
  });
  return out;
}

// Ramène une répartition (centimes) à un total cible, en conservant les
// proportions. Le dernier absorbe l'arrondi → la somme égale exactement la cible.
// Sert à n'imputer aux participants QUE ce qui a été payé (cas partiel) tout en
// respectant les parts choisies (égales ou non).
function scaleCentsTo(shares: Record<string, number>, targetCents: number): Record<string, number> {
  const ids = Object.keys(shares);
  const fullSum = ids.reduce((s, id) => s + shares[id], 0);
  const out: Record<string, number> = {};
  if (fullSum <= 0 || targetCents <= 0) {
    for (const id of ids) out[id] = 0;
    return out;
  }
  let allocated = 0;
  ids.forEach((id, i) => {
    if (i === ids.length - 1) {
      out[id] = targetCents - allocated;
    } else {
      const cents = Math.floor((shares[id] * targetCents) / fullSum);
      out[id] = cents;
      allocated += cents;
    }
  });
  return out;
}

// Solde net par participant (centimes de base) :
//   positif  = on lui doit de l'argent (il a payé plus que sa part)
//   négatif  = il doit de l'argent
// Seul ce qui a été réellement payé est réparti (cas partiel), selon les parts
// choisies — l'invariant « somme des soldes = 0 » est préservé.
export function computeBalances(
  expenses: Expense[],
  participantIds: string[],
): Record<string, number> {
  const balances: Record<string, number> = {};
  for (const id of participantIds) balances[id] = 0;

  for (const e of expenses) {
    const paidCents = paidBaseCents(e);
    const credits = payerCreditsCents(e);
    for (const [id, cents] of Object.entries(credits)) {
      balances[id] = (balances[id] ?? 0) + cents;
    }
    const debits = scaleCentsTo(computeExpenseShares(e), paidCents);
    for (const [id, cents] of Object.entries(debits)) {
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

export type PaymentStatus = 'unpaid' | 'partial' | 'paid';

// Statut de paiement au prestataire, déduit du montant payé vs le total (même
// devise). Comparaison en centimes pour éviter les dérives de flottants.
export function paymentStatus(amount: number, paidAmount: number | undefined): PaymentStatus {
  const paid = toCents(paidAmount ?? 0);
  const total = toCents(amount);
  if (paid <= 0) return 'unpaid';
  if (paid >= total) return 'paid';
  return 'partial';
}

// Total dépensé par catégorie (devise de base). Sert au récap « Dépenses du
// voyage » sur l'écran du voyage.
export function groupExpensesByCategory(expenses: Expense[]): Record<ExpenseCategory, number> {
  const result: Record<ExpenseCategory, number> = {
    [ExpenseCategory.ACCOMMODATION]: 0,
    [ExpenseCategory.TRANSPORT]: 0,
    [ExpenseCategory.FOOD]: 0,
    [ExpenseCategory.ACTIVITY]: 0,
    [ExpenseCategory.SHOPPING]: 0,
    [ExpenseCategory.OTHER]: 0,
  };
  for (const e of expenses) {
    result[e.category] = (result[e.category] ?? 0) + e.amountInBase;
  }
  return result;
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
