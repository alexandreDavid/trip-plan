import { format, eachDayOfInterval, differenceInCalendarDays } from 'date-fns';
import { fr, enUS, ptBR } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

// Locale date-fns active. Alignée sur la langue de l'app via setDateLocale()
// (appelé par le I18nProvider), pour que mois/jours soient traduits.
const LOCALES: Record<string, typeof fr> = { fr, en: enUS, pt: ptBR };
let currentLocale: typeof fr = fr;

export function setDateLocale(lang: string): void {
  currentLocale = LOCALES[lang] ?? enUS;
}

// --- Dates "heure murale", indépendantes du fuseau --------------------------
// Les dates métier (jours de voyage, heures d'événements, dates de dépense)
// représentent une heure murale : "17 juin", "14:00". On veut qu'elles
// s'affichent à l'identique quel que soit le fuseau de l'appareil (app
// collaborative, web ↔ téléphone, voyage partagé entre pays). Pour ça :
//   - à l'écriture, on encode l'heure murale dans les composantes UTC du
//     Timestamp (dateToTimestamp),
//   - à la lecture, on relit toujours via les composantes UTC, ré-exprimées en
//     heure locale (timestampToWallClock).
// Ainsi le fuseau n'entre jamais en jeu : on stocke et relit les mêmes chiffres.

// Date (heure murale locale) -> Timestamp (mêmes composantes, en UTC).
export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        date.getSeconds(),
      ),
    ),
  );
}

// Timestamp (heure murale stockée en UTC) -> Date locale aux mêmes composantes.
function timestampToWallClock(ts: Timestamp): Date {
  const d = ts.toDate();
  return new Date(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds(),
  );
}

export function getDaysBetween(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function getDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function formatDate(date: Date | Timestamp, fmt: string = 'EEE d MMM'): string {
  const d = date instanceof Timestamp ? timestampToWallClock(date) : date;
  return format(d, fmt, { locale: currentLocale });
}

export function formatDateRange(start: Date | Timestamp, end: Date | Timestamp): string {
  const s = start instanceof Timestamp ? timestampToWallClock(start) : start;
  const e = end instanceof Timestamp ? timestampToWallClock(end) : end;
  return `${format(s, 'd MMM', { locale: currentLocale })} - ${format(e, 'd MMM yyyy', { locale: currentLocale })}`;
}

export function formatTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? timestampToWallClock(date) : date;
  return format(d, 'HH:mm');
}

export function toDate(ts: Timestamp | Date): Date;
export function toDate(ts: Timestamp | Date | undefined): Date | undefined;
export function toDate(ts: Timestamp | Date | undefined): Date | undefined {
  if (!ts) return undefined;
  return ts instanceof Timestamp ? timestampToWallClock(ts) : ts;
}

// Cle de jour normalisee (date civile, heure murale), independante du fuseau.
export function dayKey(date: Date | Timestamp): string {
  return formatDate(date, 'yyyy-MM-dd');
}
