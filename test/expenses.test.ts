import { Timestamp } from 'firebase/firestore';
import { Expense, ExpenseCategory } from '@/types';
import {
  computeExpenseShares,
  computeBalances,
  computeSettlements,
  sumExpensesInBase,
  groupExpensesByCategory,
  expensePayers,
  expensePaidAmount,
  paymentStatus,
  amountsSplitDiff,
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
    paidBy: { A: 0 },
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
      makeExpense({ paidBy: { A: 90 }, amount: 90, amountInBase: 90, splitBetween: ['A', 'B', 'C'] }),
      makeExpense({ paidBy: { B: 30 }, amount: 30, amountInBase: 30, splitBetween: ['A', 'B', 'C'] }),
    ];
    const balances = computeBalances(expenses, ['A', 'B', 'C']);
    expect(balances).toEqual({ A: 5000, B: -1000, C: -4000 });
    // La somme des soldes est toujours nulle.
    expect(balances.A + balances.B + balances.C).toBe(0);
  });

  it('répartit le crédit entre plusieurs payeurs (Alex 200, Marie 100 sur 300, partagé à 3)', () => {
    const expenses = [
      makeExpense({
        paidBy: { A: 200, B: 100 },
        amount: 300,
        amountInBase: 300,
        splitBetween: ['A', 'B', 'C'],
      }),
    ];
    const balances = computeBalances(expenses, ['A', 'B', 'C']);
    // Chacun doit 100. A a avancé 200 → +100 ; B a avancé 100 → 0 ; C → -100.
    expect(balances).toEqual({ A: 10000, B: 0, C: -10000 });
    expect(balances.A + balances.B + balances.C).toBe(0);
  });

  it('partiel : ne répartit que ce qui est payé, soldes équilibrés', () => {
    // Hôtel 300, payé 90 (Alex 60, Marie 30), partagé également entre A, B, C.
    const expenses = [
      makeExpense({
        paidBy: { A: 60, B: 30 },
        amount: 300,
        amountInBase: 300,
        splitBetween: ['A', 'B', 'C'],
      }),
    ];
    const balances = computeBalances(expenses, ['A', 'B', 'C']);
    // On répartit les 90 payés → 30 chacun. A a payé 60 → +30 ; B 30 → 0 ; C → -30.
    expect(balances).toEqual({ A: 3000, B: 0, C: -3000 });
    expect(balances.A + balances.B + balances.C).toBe(0);
  });

  it('partiel avec parts inégales (mode shares) : équilibré', () => {
    // 300, payé 150 par A. Parts A:1 / B:3 → A 25 %, B 75 % des 150 payés.
    const expenses = [
      makeExpense({
        paidBy: { A: 150 },
        amount: 300,
        amountInBase: 300,
        splitMode: 'shares',
        splitBetween: ['A', 'B'],
        shares: { A: 1, B: 3 },
      }),
    ];
    const balances = computeBalances(expenses, ['A', 'B']);
    // A a payé 150 ; doit 25 % de 150 = 37,50 → +112,50. B doit 112,50 → -112,50.
    expect(balances).toEqual({ A: 11250, B: -11250 });
    expect(balances.A + balances.B).toBe(0);
  });

  it('initialise à 0 les participants sans dépense', () => {
    expect(computeBalances([], ['A', 'B'])).toEqual({ A: 0, B: 0 });
  });
});

describe('expensePaidAmount', () => {
  it('somme les paiements des payeurs', () => {
    expect(expensePaidAmount(makeExpense({ paidBy: { A: 60, B: 30 } }))).toBe(90);
    expect(expensePaidAmount(makeExpense({ paidBy: {} }))).toBe(0);
  });
});

describe('expensePayers', () => {
  it('retourne la map des payeurs', () => {
    expect(expensePayers(makeExpense({ paidBy: { A: 50, B: 20 } }))).toEqual({ A: 50, B: 20 });
  });

  it('tolère l’ancien format mono-payeur (string)', () => {
    const legacy = makeExpense({ amount: 80 });
    (legacy as unknown as { paidBy: string }).paidBy = 'A';
    expect(expensePayers(legacy)).toEqual({ A: 80 });
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

describe('amountsSplitDiff', () => {
  it('vaut 0 quand la somme couvre le total', () => {
    expect(amountsSplitDiff(50, [20, 30])).toBe(0);
  });

  it('positif quand il reste à répartir', () => {
    expect(amountsSplitDiff(50, [20, 20])).toBe(10);
  });

  it('négatif quand on a trop réparti', () => {
    expect(amountsSplitDiff(50, [20, 40])).toBe(-10);
  });

  it('ignore les valeurs non finies', () => {
    expect(amountsSplitDiff(50, [50, NaN])).toBe(0);
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

describe('groupExpensesByCategory', () => {
  it('cumule par catégorie, 0 pour les catégories absentes', () => {
    const result = groupExpensesByCategory([
      makeExpense({ category: ExpenseCategory.FOOD, amountInBase: 30 }),
      makeExpense({ category: ExpenseCategory.FOOD, amountInBase: 12 }),
      makeExpense({ category: ExpenseCategory.TRANSPORT, amountInBase: 50 }),
    ]);
    expect(result).toEqual({
      [ExpenseCategory.ACCOMMODATION]: 0,
      [ExpenseCategory.TRANSPORT]: 50,
      [ExpenseCategory.FOOD]: 42,
      [ExpenseCategory.ACTIVITY]: 0,
      [ExpenseCategory.SHOPPING]: 0,
      [ExpenseCategory.OTHER]: 0,
    });
  });

  it('retourne toutes les catégories à 0 sur une liste vide', () => {
    const result = groupExpensesByCategory([]);
    expect(Object.values(result).every((v) => v === 0)).toBe(true);
  });
});

describe('paymentStatus', () => {
  it('non payée quand rien n’est réglé', () => {
    expect(paymentStatus(100, 0)).toBe('unpaid');
    expect(paymentStatus(100, undefined)).toBe('unpaid');
  });

  it('payée quand le montant payé couvre le total', () => {
    expect(paymentStatus(100, 100)).toBe('paid');
    expect(paymentStatus(100, 150)).toBe('paid');
  });

  it('partielle entre 0 et le total', () => {
    expect(paymentStatus(100, 30)).toBe('partial');
    expect(paymentStatus(100, 99.99)).toBe('partial');
  });
});
