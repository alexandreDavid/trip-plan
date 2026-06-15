import { Timestamp } from 'firebase/firestore';

// Un participant au partage des dépenses. N'est PAS forcément un utilisateur de
// l'app : on paie souvent pour des gens sans compte. `uid` lie optionnellement
// le participant à un compte (owner/collaborateur).
export interface Participant {
  id: string;
  tripId: string;
  displayName: string;
  uid?: string | null;
  createdAt: Timestamp;
}

export type ParticipantInput = {
  displayName: string;
  uid?: string | null;
};

export enum ExpenseCategory {
  ACCOMMODATION = 'accommodation',
  TRANSPORT = 'transport',
  FOOD = 'food',
  ACTIVITY = 'activity',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

// 'equal'   : partage égal entre les participants concernés
// 'shares'  : pondéré par des parts (shares[participantId] = poids)
// 'amounts' : montants explicites (shares[participantId] = montant en devise de base)
export type SplitMode = 'equal' | 'shares' | 'amounts';

export interface Expense {
  id: string;
  tripId: string;
  label: string;
  amount: number; // dans `currency`
  currency: string; // code ISO, ex 'EUR'
  rate: number; // 1 unité de `currency` = `rate` unités de la devise de base du voyage
  amountInBase: number; // = amount * rate, pré-calculé pour les soldes
  paidBy: string; // participantId qui a avancé
  splitMode: SplitMode;
  splitBetween: string[]; // participantId concernés
  shares?: Record<string, number>; // pour 'shares' / 'amounts'
  category: ExpenseCategory;
  date: Timestamp;
  eventId?: string; // lien optionnel vers un événement de l'itinéraire
  createdBy: string; // uid de l'auteur
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Version "input" côté UI : date en Date, sans les metadata serveur.
export type ExpenseInput = {
  label: string;
  amount: number;
  currency: string;
  rate: number;
  amountInBase: number;
  paidBy: string;
  splitMode: SplitMode;
  splitBetween: string[];
  shares?: Record<string, number>;
  category: ExpenseCategory;
  date: Date;
  eventId?: string;
};
