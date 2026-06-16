import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, TripEvent } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useAllEvents } from '@/hooks/useEvents';
import { EventCard } from '@/components/event/EventCard';
import { EventTypePicker } from '@/components/event/EventTypePicker';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/utils/dates';
import { sortEventsChronologically } from '@/utils/events';
import { spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Timeline'>;

export function TimelineScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const { trip, days, loading: tripLoading, canEdit } = useTrip(tripId);
  const { events, loading: eventsLoading, error } = useAllEvents(tripId);
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const [pickerDayId, setPickerDayId] = useState<string | null>(null);

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

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.emptyWrap}>
          <EmptyState icon="warning-outline" title={t('common.error')} subtitle={error.message} />
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
                <View style={styles.dayHeaderLeft}>
                  <View style={styles.dayDot} />
                  <Text style={styles.dayLabel} numberOfLines={1}>
                    {`${t('trip.day', { index: index + 1 })} · ${formatDate(day.date, 'EEE d MMM')}`}
                  </Text>
                </View>
                {canEdit && (
                  <Pressable onPress={() => setPickerDayId(day.id)} hitSlop={8}>
                    <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
                  </Pressable>
                )}
              </View>
              {dayEvents.length === 0 ? (
                <Text style={styles.emptyDay}>{t('tripx.nothingPlanned')}</Text>
              ) : (
                dayEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    currency={trip.baseCurrency ?? DEFAULT_CURRENCY}
                    onPress={() =>
                      navigation.navigate('EventDetail', {
                        tripId,
                        dayId: event.dayId,
                        eventId: event.id,
                      })
                    }
                  />
                ))
              )}
            </View>
          );
        })}
      </ScrollView>

      <EventTypePicker
        visible={pickerDayId != null}
        onClose={() => setPickerDayId(null)}
        onSelect={(type) => {
          const dayId = pickerDayId;
          setPickerDayId(null);
          if (dayId) navigation.navigate('AddEditEvent', { tripId, dayId, eventType: type });
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: colors.background },
    container: { padding: spacing.md },
    emptyWrap: { flex: 1, padding: spacing.md },
    daySection: { marginBottom: spacing.lg },
    dayHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    dayHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 },
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
