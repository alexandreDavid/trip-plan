import { Trip } from '@/types';
import {
  getTripRole,
  canEditTrip,
  canViewTrip,
  isTripOwner,
  roleLabel,
  otherRole,
} from '@/utils/permissions';

function makeTrip(p: Partial<Trip>): Trip {
  return {
    id: 't',
    name: 'Voyage',
    destination: 'Lisbonne',
    startDate: null as never,
    endDate: null as never,
    ownerId: 'owner',
    sharedWith: [],
    roles: {},
    createdAt: null as never,
    updatedAt: null as never,
    ...p,
  };
}

describe('getTripRole', () => {
  it('reconnaît l’owner', () => {
    expect(getTripRole(makeTrip({}), 'owner')).toBe('owner');
  });

  it('reconnaît un éditeur', () => {
    const trip = makeTrip({ sharedWith: ['e'], roles: { e: 'editor' } });
    expect(getTripRole(trip, 'e')).toBe('editor');
  });

  it('reconnaît un lecteur', () => {
    const trip = makeTrip({ sharedWith: ['v'], roles: { v: 'viewer' } });
    expect(getTripRole(trip, 'v')).toBe('viewer');
  });

  it('par défaut un membre partagé sans rôle est lecteur', () => {
    const trip = makeTrip({ sharedWith: ['x'], roles: {} });
    expect(getTripRole(trip, 'x')).toBe('viewer');
  });

  it('retourne null pour un inconnu, un trip nul ou un uid nul', () => {
    expect(getTripRole(makeTrip({}), 'stranger')).toBeNull();
    expect(getTripRole(null, 'owner')).toBeNull();
    expect(getTripRole(makeTrip({}), undefined)).toBeNull();
  });
});

describe('canEditTrip / canViewTrip / isTripOwner', () => {
  const trip = makeTrip({ sharedWith: ['e', 'v'], roles: { e: 'editor', v: 'viewer' } });

  it('owner et éditeur peuvent éditer ; lecteur non', () => {
    expect(canEditTrip(trip, 'owner')).toBe(true);
    expect(canEditTrip(trip, 'e')).toBe(true);
    expect(canEditTrip(trip, 'v')).toBe(false);
    expect(canEditTrip(trip, 'stranger')).toBe(false);
  });

  it('tous les membres peuvent voir ; pas un inconnu', () => {
    expect(canViewTrip(trip, 'owner')).toBe(true);
    expect(canViewTrip(trip, 'e')).toBe(true);
    expect(canViewTrip(trip, 'v')).toBe(true);
    expect(canViewTrip(trip, 'stranger')).toBe(false);
  });

  it('isTripOwner ne vaut que pour l’owner', () => {
    expect(isTripOwner(trip, 'owner')).toBe(true);
    expect(isTripOwner(trip, 'e')).toBe(false);
  });
});

describe('helpers UI', () => {
  it('roleLabel', () => {
    expect(roleLabel('owner')).toBe('Organisateur');
    expect(roleLabel('editor')).toBe('Éditeur');
    expect(roleLabel('viewer')).toBe('Lecteur');
    expect(roleLabel(null)).toBe('');
  });

  it('otherRole bascule', () => {
    expect(otherRole('editor')).toBe('viewer');
    expect(otherRole('viewer')).toBe('editor');
  });
});
