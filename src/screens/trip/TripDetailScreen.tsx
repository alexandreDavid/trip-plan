import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useEvents } from '@/hooks/useEvents';
import { useTripExpenses } from '@/hooks/useExpenses';
import { DaySelector } from '@/components/trip/DaySelector';
import { TripActionBar } from '@/components/trip/TripActionBar';
import { EventCard } from '@/components/event/EventCard';
import { SpendingSummary } from '@/components/expense/SpendingSummary';
import { groupExpensesByCategory } from '@/utils/expenses';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { deleteTrip } from '@/services/tripService';
import { spacing, radius, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatDateRange, dayKey } from '@/utils/dates';
import { sortEventsChronologically } from '@/utils/events';
import { confirmDialog } from '@/utils/dialog';
import { EventTypePicker } from '@/components/event/EventTypePicker';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

export function TripDetailScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const { tripId } = route.params;
  const { trip, days, loading, isOwner, canEdit } = useTrip(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>();
  const { events } = useEvents(tripId, selectedDayId);
  const sortedEvents = useMemo(() => sortEventsChronologically(events), [events]);
  const { expenses, totalInBase } = useTripExpenses(tripId);
  const spendingByCategory = useMemo(() => groupExpensesByCategory(expenses), [expenses]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (selectedDayId || days.length === 0) return;
    // Sélectionne le jour d'aujourd'hui s'il fait partie du voyage, sinon le 1er.
    const today = dayKey(new Date());
    const todayDay = days.find((d) => dayKey(d.date) === today);
    setSelectedDayId(todayDay?.id ?? days[0].id);
  }, [days, selectedDayId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: trip?.name ?? t('nav.trip'),
      headerRight: () =>
        isOwner ? (
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate('AddEditTrip', { tripId })} hitSlop={8}>
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} style={{ marginLeft: spacing.md }}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>
        ) : null,
    });
  }, [navigation, trip, isOwner, tripId, t, colors, styles]);

  const handleDelete = async () => {
    const ok = await confirmDialog({
      title: t('trip.deleteTripTitle'),
      message: t('trip.deleteTripMsg'),
      confirmLabel: t('common.delete'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (!ok) return;
    await deleteTrip(tripId);
    navigation.goBack();
  };

  if (loading || !trip) return <LoadingScreen />;

  const selectedDay = days.find((d) => d.id === selectedDayId);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView stickyHeaderIndices={[1]}>
        <View>
          {trip.coverImageURL ? (
            <Image source={{ uri: trip.coverImageURL }} style={styles.cover} />
          ) : null}
          <View style={styles.info}>
            <Text style={styles.destination}>{trip.destination}</Text>
            <Text style={styles.dates}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
          </View>
          <TripActionBar
            actions={[
              { icon: 'time-outline', label: t('trip.actions.timeline'), onPress: () => navigation.navigate('Timeline', { tripId }) },
              { icon: 'wallet-outline', label: t('trip.actions.expenses'), onPress: () => navigation.navigate('Expenses', { tripId }) },
              { icon: 'notifications-outline', label: t('trip.actions.reminders'), onPress: () => navigation.navigate('Reminders', { tripId }) },
              { icon: 'map-outline', label: t('trip.actions.map'), onPress: () => navigation.navigate('Map', { tripId }) },
              { icon: 'people-outline', label: t('trip.actions.participants'), onPress: () => navigation.navigate('ShareTrip', { tripId }) },
            ]}
          />
          {expenses.length > 0 && (
            <SpendingSummary
              total={totalInBase}
              byCategory={spendingByCategory}
              currency={trip.baseCurrency ?? DEFAULT_CURRENCY}
            />
          )}
        </View>

        <View style={styles.daySelectorWrap}>
          <DaySelector days={days} selectedDayId={selectedDayId} onSelect={setSelectedDayId} />
        </View>

        <View style={styles.eventsList}>
          {sortedEvents.length === 0 ? (
            <View style={{ paddingVertical: spacing.xl }}>
              <EmptyState
                icon="calendar-outline"
                title={t('trip.empty.title')}
                subtitle={canEdit ? t('trip.empty.subtitle') : undefined}
              />
            </View>
          ) : (
            // Rendu en .map() (pas de FlatList) : la liste vit dans le ScrollView
            // parent, sinon le scroll imbriqué casse les gestes sur web mobile.
            sortedEvents.map((item) => (
              <EventCard
                key={item.id}
                event={item}
                onPress={() =>
                  navigation.navigate('EventDetail', {
                    tripId,
                    dayId: item.dayId,
                    eventId: item.id,
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {canEdit && selectedDayId && (
        <Pressable style={styles.fab} onPress={() => setPickerOpen(true)}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
      <EventTypePicker
        visible={pickerOpen && !!selectedDayId}
        onClose={() => setPickerOpen(false)}
        onSelect={(type) => {
          setPickerOpen(false);
          if (selectedDayId) {
            navigation.navigate('AddEditEvent', { tripId, dayId: selectedDayId, eventType: type });
          }
        }}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  cover: { width: '100%', height: 180 },
  info: { padding: spacing.md },
  destination: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  dates: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  daySelectorWrap: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventsList: { padding: spacing.md },
  headerActions: { flexDirection: 'row', alignItems: 'center', marginRight: spacing.md },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
