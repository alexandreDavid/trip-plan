import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { alertDialog } from '@/utils/dialog';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, EventType, TripEvent, EventInput } from '@/types';
import { EventForm } from '@/components/event/EventForm';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import {
  createEvent,
  subscribeToEventsForDay,
  updateEvent,
} from '@/services/eventService';
import { getDaysOnce } from '@/services/tripService';
import { spacing, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { toDate } from '@/utils/dates';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditEvent'>;

export function AddEditEventScreen({ route, navigation }: Props) {
  const { tripId, dayId, eventId, eventType } = route.params;
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const [initialEvent, setInitialEvent] = useState<TripEvent | undefined>();
  const [dayDate, setDayDate] = useState<Date | undefined>();
  const [existingCount, setExistingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const resolvedType: EventType | undefined = initialEvent?.type ?? eventType;

  useEffect(() => {
    (async () => {
      const days = await getDaysOnce(tripId);
      const day = days.find((d) => d.id === dayId);
      setDayDate(toDate(day?.date));
    })();
  }, [tripId, dayId]);

  useEffect(() => {
    const unsub = subscribeToEventsForDay(tripId, dayId, (events) => {
      setExistingCount(events.length);
      if (eventId) {
        const e = events.find((ev) => ev.id === eventId);
        if (e) setInitialEvent(e);
      }
      setLoading(false);
    });
    return unsub;
  }, [tripId, dayId, eventId]);

  if (loading || !dayDate || !resolvedType) return <LoadingScreen />;

  const handleSubmit = async (input: EventInput) => {
    setSubmitting(true);
    try {
      if (eventId) {
        await updateEvent(tripId, dayId, eventId, input);
      } else {
        await createEvent(tripId, dayId, input, existingCount);
      }
      navigation.goBack();
    } catch (err) {
      alertDialog(t('common.error'), (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <EventForm
          type={resolvedType}
          initialEvent={initialEvent}
          dayDate={dayDate}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md },
});
