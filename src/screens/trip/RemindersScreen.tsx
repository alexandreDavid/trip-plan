import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
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
import { colors, radius, spacing, fontSize } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Reminders'>;

export function RemindersScreen({ route }: Props) {
  const { tripId } = route.params;
  const { trip, loading } = useTrip(tripId);
  const { events } = useAllEvents(tripId);
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
        Alert.alert(
          'Permission refusée',
          'Autorisez les notifications dans les réglages pour recevoir les rappels.',
        );
        return;
      }
      const n = await scheduleTripReminders(trip, events);
      await refresh();
      Alert.alert('Rappels programmés', `${n} rappel(s) programmé(s) pour ce voyage.`);
    } catch (e) {
      Alert.alert(
        'Indisponible',
        `${(e as Error).message}\n\nLes notifications nécessitent un build de développement (elles ne fonctionnent pas dans Expo Go sur SDK 55).`,
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
      Alert.alert('Erreur', (e as Error).message);
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
                ? 'Statut des rappels indisponible'
                : `${scheduledCount} rappel(s) programmé(s)`}
            </Text>
          </View>
          <Text style={styles.hint}>
            {upcomingCount} événement(s) à venir avec une heure pourront recevoir un rappel.
          </Text>
        </View>

        <Text style={styles.section}>Anticipation par type</Text>
        <View style={styles.card}>
          <LeadRow icon="airplane-outline" label="Transport" value="3 h avant le départ" />
          <LeadRow icon="bed-outline" label="Hébergement" value="2 h avant le check-in" />
          <LeadRow icon="map-outline" label="Activité" value="1 h avant" />
          <LeadRow icon="restaurant-outline" label="Restaurant" value="1 h avant" />
        </View>

        <Button
          title="Programmer les rappels"
          onPress={handleSchedule}
          loading={busy}
          style={{ marginTop: spacing.md }}
        />
        <Button title="Annuler les rappels" onPress={handleCancel} variant="ghost" disabled={busy} />

        <Text style={styles.footnote}>
          Reprogrammez après avoir modifié l'itinéraire pour garder les rappels à jour. Les rappels
          sont locaux à cet appareil.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function LeadRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.leadRow}>
      <Ionicons name={icon} size={18} color={colors.textMuted} />
      <Text style={styles.leadLabel}>{label}</Text>
      <Text style={styles.leadValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
