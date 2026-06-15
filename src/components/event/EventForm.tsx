import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventType, EventInput, TransportMode, TripEvent } from '@/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, radius } from '@/theme';
import { toDate } from '@/utils/dates';
import { validateEventName } from '@/utils/validation';

interface Props {
  type: EventType;
  initialEvent?: TripEvent;
  dayDate: Date; // date de la journee, pour construire les timestamps heure
  submitting?: boolean;
  onSubmit: (input: EventInput) => Promise<void> | void;
}

// Parse "HH:mm" + base date -> Date
function parseTimeOnDate(time: string | undefined, base: Date): Date | undefined {
  if (!time || !/^\d{1,2}:\d{2}$/.test(time.trim())) return undefined;
  const [h, m] = time.trim().split(':').map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTimeField(date: Date | undefined): string {
  if (!date) return '';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

const TRANSPORT_MODES: TransportMode[] = ['flight', 'train', 'bus', 'car', 'ferry', 'other'];
const TRANSPORT_LABELS: Record<TransportMode, string> = {
  flight: 'Avion',
  train: 'Train',
  bus: 'Bus',
  car: 'Voiture',
  ferry: 'Ferry',
  other: 'Autre',
};

export function EventForm({ type, initialEvent, dayDate, submitting, onSubmit }: Props) {
  // Champs communs
  const [name, setName] = useState(initialEvent?.name ?? '');
  const [notes, setNotes] = useState(initialEvent?.notes ?? '');
  const [budget, setBudget] = useState(
    initialEvent?.budget != null ? String(initialEvent.budget) : '',
  );
  const [nameError, setNameError] = useState<string | null>(null);

  // Hebergement
  const [address, setAddress] = useState(
    initialEvent && (initialEvent.type === EventType.ACCOMMODATION || initialEvent.type === EventType.RESTAURANT)
      ? (initialEvent as { address?: string }).address ?? ''
      : '',
  );
  const [checkInTime, setCheckInTime] = useState(
    initialEvent?.type === EventType.ACCOMMODATION
      ? formatTimeField(toDate(initialEvent.checkInTime))
      : '',
  );
  const [checkOutTime, setCheckOutTime] = useState(
    initialEvent?.type === EventType.ACCOMMODATION
      ? formatTimeField(toDate(initialEvent.checkOutTime))
      : '',
  );

  // Transport
  const [transportMode, setTransportMode] = useState<TransportMode>(
    initialEvent?.type === EventType.TRANSPORT ? initialEvent.transportMode : 'flight',
  );
  const [departureLocation, setDepartureLocation] = useState(
    initialEvent?.type === EventType.TRANSPORT ? initialEvent.departureLocation : '',
  );
  const [arrivalLocation, setArrivalLocation] = useState(
    initialEvent?.type === EventType.TRANSPORT ? initialEvent.arrivalLocation : '',
  );
  const [departureTime, setDepartureTime] = useState(
    initialEvent?.type === EventType.TRANSPORT
      ? formatTimeField(toDate(initialEvent.departureTime))
      : '',
  );
  const [arrivalTime, setArrivalTime] = useState(
    initialEvent?.type === EventType.TRANSPORT
      ? formatTimeField(toDate(initialEvent.arrivalTime))
      : '',
  );

  // Activite
  const [location, setLocation] = useState(
    initialEvent?.type === EventType.ACTIVITY ? initialEvent.location ?? '' : '',
  );
  const [startTime, setStartTime] = useState(
    initialEvent?.type === EventType.ACTIVITY ? formatTimeField(toDate(initialEvent.startTime)) : '',
  );
  const [endTime, setEndTime] = useState(
    initialEvent?.type === EventType.ACTIVITY ? formatTimeField(toDate(initialEvent.endTime)) : '',
  );

  // Restaurant
  const [restaurantTime, setRestaurantTime] = useState(
    initialEvent?.type === EventType.RESTAURANT ? formatTimeField(toDate(initialEvent.time)) : '',
  );

  const handleSubmit = async () => {
    const nameErr = validateEventName(name);
    setNameError(nameErr);
    if (nameErr) return;

    const base = {
      name: name.trim(),
      notes: notes.trim() || undefined,
      budget: budget ? parseFloat(budget.replace(',', '.')) : undefined,
    };

    let input: EventInput;
    switch (type) {
      case EventType.ACCOMMODATION:
        input = {
          ...base,
          type: EventType.ACCOMMODATION,
          address: address.trim(),
          checkInTime: parseTimeOnDate(checkInTime, dayDate),
          checkOutTime: parseTimeOnDate(checkOutTime, dayDate),
        };
        break;
      case EventType.TRANSPORT:
        input = {
          ...base,
          type: EventType.TRANSPORT,
          transportMode,
          departureLocation: departureLocation.trim(),
          arrivalLocation: arrivalLocation.trim(),
          departureTime: parseTimeOnDate(departureTime, dayDate),
          arrivalTime: parseTimeOnDate(arrivalTime, dayDate),
        };
        break;
      case EventType.ACTIVITY:
        input = {
          ...base,
          type: EventType.ACTIVITY,
          location: location.trim() || undefined,
          startTime: parseTimeOnDate(startTime, dayDate),
          endTime: parseTimeOnDate(endTime, dayDate),
        };
        break;
      case EventType.RESTAURANT:
        input = {
          ...base,
          type: EventType.RESTAURANT,
          address: address.trim() || undefined,
          time: parseTimeOnDate(restaurantTime, dayDate),
        };
        break;
    }

    await onSubmit(input);
  };

  return (
    <View>
      <Input label="Nom *" value={name} onChangeText={setName} error={nameError ?? undefined} />

      {type === EventType.ACCOMMODATION && (
        <>
          <Input label="Adresse" value={address} onChangeText={setAddress} />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Check-in (HH:mm)" value={checkInTime} onChangeText={setCheckInTime} placeholder="14:00" />
            </View>
            <View style={styles.half}>
              <Input label="Check-out (HH:mm)" value={checkOutTime} onChangeText={setCheckOutTime} placeholder="11:00" />
            </View>
          </View>
        </>
      )}

      {type === EventType.TRANSPORT && (
        <>
          <Text style={styles.label}>Mode</Text>
          <View style={styles.chips}>
            {TRANSPORT_MODES.map((m) => (
              <View
                key={m}
                style={[styles.chip, transportMode === m && styles.chipSelected]}
                onTouchEnd={() => setTransportMode(m)}
              >
                <Text style={[styles.chipText, transportMode === m && styles.chipTextSelected]}>
                  {TRANSPORT_LABELS[m]}
                </Text>
              </View>
            ))}
          </View>
          <Input label="Depart" value={departureLocation} onChangeText={setDepartureLocation} />
          <Input label="Arrivee" value={arrivalLocation} onChangeText={setArrivalLocation} />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Heure depart" value={departureTime} onChangeText={setDepartureTime} placeholder="09:00" />
            </View>
            <View style={styles.half}>
              <Input label="Heure arrivee" value={arrivalTime} onChangeText={setArrivalTime} placeholder="11:30" />
            </View>
          </View>
        </>
      )}

      {type === EventType.ACTIVITY && (
        <>
          <Input label="Lieu" value={location} onChangeText={setLocation} />
          <View style={styles.row}>
            <View style={styles.half}>
              <Input label="Debut" value={startTime} onChangeText={setStartTime} placeholder="10:00" />
            </View>
            <View style={styles.half}>
              <Input label="Fin" value={endTime} onChangeText={setEndTime} placeholder="12:00" />
            </View>
          </View>
        </>
      )}

      {type === EventType.RESTAURANT && (
        <>
          <Input label="Adresse" value={address} onChangeText={setAddress} />
          <Input label="Heure" value={restaurantTime} onChangeText={setRestaurantTime} placeholder="19:30" />
        </>
      )}

      <Input
        label="Budget (EUR)"
        value={budget}
        onChangeText={setBudget}
        keyboardType="decimal-pad"
      />
      <Input
        label="Notes"
        value={notes}
        onChangeText={setNotes}
        multiline
        numberOfLines={3}
        style={{ minHeight: 80, textAlignVertical: 'top' }}
      />

      <Button title="Enregistrer" onPress={handleSubmit} loading={submitting} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: colors.text,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: fontSize.sm, color: colors.text },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
});
