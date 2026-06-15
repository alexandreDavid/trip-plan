import { Timestamp } from 'firebase/firestore';

// Rôle d'un collaborateur sur un voyage. L'owner (ownerId) a tous les droits
// implicitement ; les collaborateurs présents dans `sharedWith` ont le rôle
// indiqué dans `roles` (par défaut 'viewer' si absent, pour rester sûr).
export type TripRole = 'editor' | 'viewer';

// Rôle effectif d'un utilisateur, owner inclus.
export type EffectiveRole = 'owner' | TripRole | null;

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Timestamp;
  endDate: Timestamp;
  coverImageURL?: string;
  ownerId: string;
  sharedWith: string[];
  roles?: Record<string, TripRole>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Day {
  id: string;
  tripId: string;
  date: Timestamp;
  order: number;
}

export type TripInput = {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImageURL?: string;
};
