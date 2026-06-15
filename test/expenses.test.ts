import { Timestamp } from 'firebase/firestore';
import { Expense, ExpenseCategory } from '@/types';
import {
  computeExpenseShares,
  computeBalances,
  computeSettlements,
  sumExpensesInBase,
  formatCents,
  formatMoney,
} from '@/utils/expenses';

function makeExpense(p: Partial<Expense>): Expense {
  return {
    id: 'x',
    tripId: 't',
    label: 'l',
    amount: 0,
    currency: 'EUR',
    rate: 1,
    amountInBase: 0,
    paidBy: 'A',
    splitMode: 'equal',
    splitBetween: [],
    category: ExpenseCategory.OTHER,
    date: Timestamp.fromMillis(0),
    createdBy: 'u',
    createdAt: Timestamp.fromMillis(0),
    updatedAt: Timestamp.fromMillis(0),
    ...p,
  };
}

describe('computeExpenseShares', () => {
  it('répartit également et distribue le reste d’arrondi (10 / 3)', () => {
    const shares = computeExpenseShares(
      makeExpense({ amountInBase: 10, splitBetween: ['A', 'B', 'C'] }),
    );
    expect(shares).toEqual({ A: 334, B: 333, C: 333 });
    expect(shares.A + shares.B + shares.C).toBe(1000); // somme = total exact
  });

  it('répartit également sans reste (90 / 3)', () => {
    expect(
      computeExpenseShares(makeExpense({ amountInBase: 90, splitBetween: ['A', 'B', 'C'] })),
    ).toEqual({ A: 3000, B: 3000, C: 3000 });
  });

  it('gère le mode "shares" (parts pondérées)', () => {
    const shares = computeExpenseShares(
      makeExpense({
        amountInBase: 100,
        splitMode: 'shares',
        splitBetween: ['A', 'B'],
        shares: { A: 1, B: 3 },
      }),
    );
    expect(shares).toEqual({ A: 2500, B: 7500 });
  });

  it('gère le mode "amounts" (montants explicites)', () => {
    const shares = computeExpenseShares(
      makeExpense({
        amountInBase: 50,
        splitMode: 'amounts',
        splitBetween: ['A', 'B'],
        shares: { A: 20, B: 30 },
      }),
    );
    expect(shares).toEqual({ A: 2000, B: 3000 });
  });

  it('retourne {} si personne n’est concerné', () => {
    expect(computeExpenseShares(makeExpense({ amountInBase: 10, splitBetween: [] }))).toEqual({});
  });
});

describe('computeBalances', () => {
  it('calcule les soldes nets (A paie 90, B paie 30, partagés à 3)', () => {
    const expenses = [
      makeExpense({ paidBy: 'A', amountInBase: 90, splitBetween: ['A', 'B', 'C'] }),
      makeExpense({ paidBy: 'B', amountInBase: 30, splitBetween: ['A', 'B', 'C'] }),
    ];
    const balances = computeBalances(expenses, ['A', 'B', 'C']);
    expect(balances).toEqual({ A: 5000, B: -1000, C: -4000 });
    // La somme des soldes est toujours nulle.
    expect(balances.A + balances.B + balances.C).toBe(0);
  });

  it('initialise à 0 les participants sans dépense', () => {
    expect(computeBalances([], ['A', 'B'])).toEqual({ A: 0, B: 0 });
  });
});

describe('computeSettlements', () => {
  it('produit un remboursement minimal', () => {
    const settlements = computeSettlements({ A: 5000, B: -1000, C: -4000 });
    expect(settlements).toEqual([
      { from: 'C', to: 'A', amountCents: 4000 },
      { from: 'B', to: 'A', amountCents: 1000 },
    ]);
  });

  it('ne propose rien quand tout est équilibré', () => {
    expect(computeSettlements({ A: 0, B: 0, C: 0 })).toEqual([]);
  });

  it('équilibre les remboursements (somme dûe = somme reçue)', () => {
    const balances = { A: 2500, B: -1500, C: -1000 };
    const settlements = computeSettlements(balances);
    const total = settlements.reduce((s, x) => s + x.amountCents, 0);
    expect(total).toBe(2500);
  });
});

describe('formatage monétaire', () => {
  it('formatCents et formatMoney sont cohérents', () => {
    expect(formatCents(5000, 'EUR')).toBe(formatMoney(50, 'EUR'));
    expect(formatCents(5000, 'EUR')).toContain('50');
  });

  it('replie proprement sur une devise au code invalide', () => {
    expect(formatMoney(10, 'X')).toBe('10.00 X');
  });
});

describe('sumExpensesInBase', () => {
  it('somme les montants en devise de base', () => {
    expect(
      sumExpensesInBase([
        makeExpense({ amountInBase: 12.5 }),
        makeExpense({ amountInBase: 7.5 }),
      ]),
    ).toBe(20);
  });
});
