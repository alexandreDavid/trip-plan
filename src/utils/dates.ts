import { format, eachDayOfInterval, differenceInCalendarDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Timestamp } from 'firebase/firestore';

export function getDaysBetween(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

export function getDayCount(start: Date, end: Date): number {
  return differenceInCalendarDays(end, start) + 1;
}

export function formatDate(date: Date | Timestamp, fmt: string = 'EEE d MMM'): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, fmt, { locale: fr });
}

export function formatDateRange(start: Date | Timestamp, end: Date | Timestamp): string {
  const s = start instanceof Timestamp ? start.toDate() : start;
  const e = end instanceof Timestamp ? end.toDate() : end;
  return `${format(s, 'd MMM', { locale: fr })} - ${format(e, 'd MMM yyyy', { locale: fr })}`;
}

export function formatTime(date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return format(d, 'HH:mm');
}

export function getDayLabel(dayIndex: number, date: Date | Timestamp): string {
  const d = date instanceof Timestamp ? date.toDate() : date;
  return `Jour ${dayIndex + 1} - ${format(d, 'EEE d MMM', { locale: fr })}`;
}

export function toDate(ts: Timestamp | Date | undefined): Date | undefined {
  if (!ts) return undefined;
  return ts instanceof Timestamp ? ts.toDate() : ts;
}

// Cle de jour normalisee (date civile locale) pour comparer/mapper des jours
// independamment de l'heure. Ex: '2026-06-15'.
export function dayKey(date: Date | Timestamp): string {
  return formatDate(date, 'yyyy-MM-dd');
}
