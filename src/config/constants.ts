export const Collections = {
  USERS: 'users',
  TRIPS: 'trips',
  DAYS: 'days',
  EVENTS: 'events',
  PARTICIPANTS: 'participants',
  EXPENSES: 'expenses',
} as const;

export const MAX_TRIP_DAYS = 90;
export const MAX_SHARED_USERS = 20;

export const DEFAULT_CURRENCY = 'EUR';

// Devises proposées dans le sélecteur (code ISO 4217).
export const CURRENCIES = [
  'EUR',
  'USD',
  'GBP',
  'CHF',
  'JPY',
  'CAD',
  'AUD',
  'THB',
  'MAD',
  'SEK',
  'NOK',
  'DKK',
] as const;
