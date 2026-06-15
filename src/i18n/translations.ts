// Fusion des dictionnaires par namespace. Chaque module exporte { fr, en } avec
// des clés à plat « namespace.clé ». Les sous-écrans remplissent leur module.
import common from './strings/common';
import profile from './strings/profile';
import auth from './strings/auth';
import home from './strings/home';
import trip from './strings/trip';
import tripx from './strings/tripx';
import event from './strings/event';
import expense from './strings/expense';

const parts = [common, profile, auth, home, trip, tripx, event, expense];

export const translations: Record<'fr' | 'en' | 'pt', Record<string, string>> = {
  fr: Object.assign({}, ...parts.map((p) => p.fr)),
  en: Object.assign({}, ...parts.map((p) => p.en)),
  pt: Object.assign({}, ...parts.map((p) => p.pt)),
};
