import React, { useEffect, useLayoutEffect, useState } from 'react';
import { Alert, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, EventType } from '@/types';
import { useTrip } from '@/hooks/useTrip';
import { useEvents } from '@/hooks/useEvents';
import { useTripBudget } from '@/hooks/useBudget';
import { DaySelector } from '@/components/trip/DaySelector';
import { EventCard } from '@/components/event/EventCard';
import { BudgetSummary } from '@/components/budget/BudgetSummary';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { deleteEvent } from '@/services/eventService';
import { deleteTrip } from '@/services/tripService';
import { colors, spacing, radius, fontSize } from '@/theme';
import { formatDateRange } from '@/utils/dates';
import { eventMeta } from '@/components/event/eventMeta';

type Props = NativeStackScreenProps<RootStackParamList, 'TripDetail'>;

const EVENT_TYPES: EventType[] = [
  EventType.ACCOMMODATION,
  EventType.TRANSPORT,
  EventType.ACTIVITY,
  EventType.RESTAURANT,
];

export function TripDetailScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const { trip, days, loading, isOwner } = useTrip(tripId);
  const [selectedDayId, setSelectedDayId] = useState<string | undefined>();
  const { events } = useEvents(tripId, selectedDayId);
  const budget = useTripBudget(tripId);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (!selectedDayId && days.length > 0) {
      setSelectedDayId(days[0].id);
    }
  }, [days, selectedDayId]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: trip?.name ?? 'Voyage',
      headerRight: () =>
        isOwner ? (
          <View style={styles.headerActions}>
            <Pressable onPress={() => navigation.navigate('ShareTrip', { tripId })} hitSlop={8}>
              <Ionicons name="share-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => navigation.navigate('AddEditTrip', { tripId })}
              hitSlop={8}
              style={{ marginLeft: spacing.md }}
            >
              <Ionicons name="create-outline" size={22} color={colors.primary} />
            </Pressable>
            <Pressable onPress={handleDelete} hitSlop={8} style={{ marginLeft: spacing.md }}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
            </Pressable>
          </View>
        ) : null,
    });
  }, [navigation, trip, isOwner, tripId]);

  const handleDelete = () => {
    Alert.alert('Supprimer le voyage ?', 'Cette action est irreversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteTrip(tripId);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (!selectedDayId) return;
    Alert.alert('Supprimer cet evenement ?', '', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => deleteEvent(tripId, selectedDayId, eventId),
      },
    ]);
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
          <BudgetSummary total={budget.total} byType={budget.byType} />
        </View>

        <View style={styles.daySelectorWrap}>
          <DaySelector days={days} selectedDayId={selectedDayId} onSelect={setSelectedDayId} />
        </View>

        <View style={styles.eventsList}>
          {events.length === 0 ? (
            <View style={{ paddingVertical: spacing.xl }}>
              <EmptyState
                icon="calendar-outline"
                title="Aucun evenement"
                subtitle={isOwner ? 'Ajoutez votre premier evenement' : undefined}
              />
            </View>
          ) : (
            <FlatList
              data={events}
              scrollEnabled={false}
              keyExtractor={(e) => e.id}
              renderItem={({ item }) => (
                <EventCard
                  event={item}
                  editable={isOwner}
                  onDelete={() => handleDeleteEvent(item.id)}
                  onPress={
                    isOwner
                      ? () =>
                          navigation.navigate('AddEditEvent', {
                            tripId,
                            dayId: item.dayId,
                            eventId: item.id,
                            eventType: item.type,
                          })
                      : undefined
                  }
                />
              )}
            />
          )}
        </View>
      </ScrollView>

      {isOwner && selectedDayId && (
        <>
          {pickerOpen && (
            <View style={styles.pickerBackdrop}>
              <Pressable style={styles.backdropPress} onPress={() => setPickerOpen(false)} />
              <View style={styles.pickerCard}>
                <Text style={styles.pickerTitle}>Type d'evenement</Text>
                {EVENT_TYPES.map((t) => {
                  const meta = eventMeta[t];
                  return (
                    <Pressable
                      key={t}
                      style={styles.pickerItem}
                      onPress={() => {
                        setPickerOpen(false);
                        navigation.navigate('AddEditEvent', {
                          tripId,
                          dayId: selectedDayId,
                          eventType: t,
                        });
                      }}
                    >
                      <View style={[styles.pickerIcon, { backgroundColor: meta.color + '22' }]}>
                        <Ionicons name={meta.icon} size={20} color={meta.color} />
                      </View>
                      <Text style={styles.pickerLabel}>{meta.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
          <Pressable style={styles.fab} onPress={() => setPickerOpen(true)}>
            <Ionicons name="add" size={28} color="#fff" />
          </Pressable>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  cover: { width: '100%', height: 180 },
  info: { padding: spacing.md },
  destination: { fontSize: fontSize.lg, fontWeight: '600', color: colors.text },
  dates: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: spacing.xs },
  daySelectorWrap: { backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border },
  eventsList: { padding: spacing.md },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
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
  pickerBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  backdropPress: { ...StyleSheet.absoluteFillObject },
  pickerCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  pickerTitle: { fontSize: fontSize.lg, fontWeight: '700', marginBottom: spacing.md, color: colors.text },
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, gap: spacing.md },
  pickerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: { fontSize: fontSize.md, color: colors.text, fontWeight: '500' },
});
