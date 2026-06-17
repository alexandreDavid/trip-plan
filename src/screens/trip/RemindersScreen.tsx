import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { alertDialog } from '@/utils/dialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useAllEvents } from '@/hooks/useEvents';
import { getEventPrimaryTime } from '@/utils/events';
import {
  requestNotificationPermission,
  scheduleTripReminders,
  cancelTripReminders,
  getScheduledCountForTrip,
} from '@/services/notificationService';
import { Button } from '@/components/ui/Button';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>;

export function RemindersScreen({ route }: Props) {
  const { tripId } = route.params;
  const { trip, loading } = useTrip(tripId);
  const { events } = useAllEvents(tripId);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const [scheduledCount, setScheduledCount] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try {
      setScheduledCount(await getScheduledCountForTrip(tripId));
    } catch {
      setScheduledCount(null);
    }
  }, [tripId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Événements à venir ayant une heure (candidats à un rappel).
  const upcomingCount = useMemo(() => {
    const now = Date.now();
    return events.filter((e) => {
      const t = getEventPrimaryTime(e);
      return t != null && t.toMillis() > now;
    }).length;
  }, [events]);

  const handleSchedule = async () => {
    if (!trip) return;
    setBusy(true);
    try {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alertDialog(
          t('tripx.permissionDeniedTitle'),
          t('tripx.permissionDeniedMessage'),
        );
        return;
      }
      const n = await scheduleTripReminders(trip, events);
      await refresh();
      alertDialog(t('tripx.remindersScheduledTitle'), t('tripx.remindersScheduledMessage', { count: n }));
    } catch (e) {
      alertDialog(
        t('tripx.unavailableTitle'),
        t('tripx.remindersUnavailableMessage', { message: (e as Error).message }),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await cancelTripReminders(tripId);
      await refresh();
    } catch (e) {
      alertDialog(t('common.error'), (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (loading || !trip) return <LoadingScreen />;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
            <Text style={styles.statusText}>
              {scheduledCount == null
                ? t('tripx.reminderStatusUnavailable')
                : t('tripx.scheduledCount', { count: scheduledCount })}
            </Text>
          </View>
          <Text style={styles.hint}>
            {t('tripx.upcomingWithTime', { count: upcomingCount })}
          </Text>
        </View>

        <Text style={styles.section}>{t('tripx.leadByType')}</Text>
        <View style={styles.card}>
          <LeadRow
            icon="airplane-outline"
            label={t('event.type.transport')}
            value={t('tripx.leadTransport')}
            colors={colors}
            styles={styles}
          />
          <LeadRow
            icon="bed-outline"
            label={t('event.type.accommodation')}
            value={t('tripx.leadAccommodation')}
            colors={colors}
            styles={styles}
          />
          <LeadRow
            icon="map-outline"
            label={t('event.type.activity')}
            value={t('tripx.leadHourBefore')}
            colors={colors}
            styles={styles}
          />
          <LeadRow
            icon="restaurant-outline"
            label={t('event.type.restaurant')}
            value={t('tripx.leadHourBefore')}
            colors={colors}
            styles={styles}
          />
        </View>

        <Button
          title={t('tripx.scheduleReminders')}
          onPress={handleSchedule}
          loading={busy}
          style={{ marginTop: spacing.md }}
        />
        <Button title={t('tripx.cancelReminders')} onPress={handleCancel} variant="ghost" disabled={busy} />

        <Text style={styles.footnote}>
          {t('tripx.remindersFootnote')}
        </Text>
      </View>
    </SafeAreaView>
  );
}

function LeadRow({
  icon,
  label,
  value,
  colors,
  styles,
}: {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  label: string;
  value: string;
  colors: Palette;
  styles: ReturnType<typeof makeStyles>;
}) {
  return (
    <View style={styles.leadRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.leadLabel}>{label}</Text>
      <Text style={styles.leadValue}>{value}</Text>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusText: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  hint: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  section: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  leadRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 4 },
  leadLabel: { flex: 1, fontSize: fontSize.md, color: colors.text },
  leadValue: { fontSize: fontSize.sm, color: colors.textMuted },
  footnote: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: spacing.md, lineHeight: 16 },
});
