import React, { useLayoutEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, TripEvent } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useAllEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/event/EventCard';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { getDayLabel } from '@/utils/dates';
import { sortEventsChronologically } from '@/utils/events';
import { spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Timeline'>;

export function TimelineScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const { trip, days, loading: tripLoading, canEdit } = useTrip(tripId);
  const { events, loading: eventsLoading } = useAllEvents(tripId);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();

  useLayoutEffect(() => {
    navigation.setOptions({ title: t('nav.timeline') });
  }, [navigation, t]);

  // Regroupe les événements par jour, triés chronologiquement.
  const eventsByDay = useMemo(() => {
    const map: Record<string, TripEvent[]> = {};
    for (const e of events) {
      (map[e.dayId] ??= []).push(e);
    }
    for (const dayId of Object.keys(map)) {
      map[dayId] = sortEventsChronologically(map[dayId]);
    }
    return map;
  }, [events]);

  if (tripLoading || eventsLoading || !trip) return <LoadingScreen />;

  if (events.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon="time-outline"
            title={t('tripx.emptyItineraryTitle')}
            subtitle={t('tripx.emptyItinerarySubtitle')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {days.map((day, index) => {
          const dayEvents = eventsByDay[day.id] ?? [];
          return (
            <View key={day.id} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <View style={styles.dayDot} />
                <Text style={styles.dayLabel}>{getDayLabel(index, day.date)}</Text>
              </View>
              {dayEvents.length === 0 ? (
                <Text style={styles.emptyDay}>{t('tripx.nothingPlanned')}</Text>
              ) : (
                dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onPress={
                      canEdit
                        ? () =>
                            navigation.navigate('AddEditEvent', {
                              tripId,
                              dayId: event.dayId,
                              eventId: event.id,
                              eventType: event.type,
                            })
                        : undefined
                    }
                  />
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md },
  emptyWrap: { flex: 1, padding: spacing.md },
  daySection: { marginBottom: spacing.lg },
  dayHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  dayDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  dayLabel: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
  emptyDay: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginLeft: spacing.md + 2,
    marginBottom: spacing.sm,
  },
});
