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

export function getDaysBetween(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function getDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function formatDate(date: Date | Timestamp, fmt: string = 'EEE d MMM'): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, fmt, { locale: currentLocale });
}

export function formatDateRange(start: Date | Timestamp, end: Date | Timestamp): string {
  const s = start instanceof Timestamp ? start.toDate() : start;
  const e = end instanceof Timestamp ? end.toDate() : end;
  return `${format(s, 'd MMM', { locale: currentLocale })} - ${format(e, 'd MMM yyyy', { locale: currentLocale })}`;
}

export function formatTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'HH:mm');
}

export function toDate(ts: Timestamp | Date | undefined): Date | undefined {
  if (!ts) return undefined;
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

// Cle de jour normalisee (date civile locale), independante de la langue.
export function dayKey(date: Date | Timestamp): string {
  return formatDate(date, 'yyyy-MM-dd');
}
