import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Trip, TripEvent, EventType } from '@/types';
import { getEventPrimaryTime } from '@/utils/events';
import { formatTime } from '@/utils/dates';

// Affichage des notifications même app au premier plan.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Délai d'anticipation par type d'événement (minutes avant l'heure principale).
const LEAD_MINUTES: Record<EventType, number> = {
  [EventType.TRANSPORT]: 180, // 3 h avant le départ (vol, train…)
  [EventType.ACCOMMODATION]: 120, // 2 h avant le check-in
  [EventType.ACTIVITY]: 60,
  [EventType.RESTAURANT]: 60,
};

function reminderBody(event: TripEvent, primary: Date): string {
  const time = formatTime(primary);
  switch (event.type) {
    case EventType.TRANSPORT:
      return `Départ à ${time} — ${event.departureLocation} → ${event.arrivalLocation}`;
    case EventType.ACCOMMODATION:
      return `Check-in à ${time} — ${event.address}`;
    case EventType.ACTIVITY:
      return `À ${time}${event.location ? ` — ${event.location}` : ''}`;
    case EventType.RESTAURANT:
      return `À ${time}${event.address ? ` — ${event.address}` : ''}`;
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Rappels de voyage',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const { status } = await Notifications.getPermissionsAsync();
  if (status === 'granted') return true;
  const req = await Notifications.requestPermissionsAsync();
  return req.status === 'granted';
}

export async function getScheduledCountForTrip(tripId: string): Promise<number> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  return all.filter((n) => n.content.data?.tripId === tripId).length;
}

export async function cancelTripReminders(tripId: string): Promise<void> {
  const all = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    all
      .filter((n) => n.content.data?.tripId === tripId)
      .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
  );
}

// (Re)programme les rappels pour tous les événements futurs du voyage ayant une
// heure. Retourne le nombre de rappels programmés. À appeler après vérification
// de la permission.
export async function scheduleTripReminders(
  trip: Trip,
  events: TripEvent[],
  now: Date = new Date(),
): Promise<number> {
  await cancelTripReminders(trip.id);

  let count = 0;
  for (const event of events) {
    const primaryTs = getEventPrimaryTime(event);
    if (!primaryTs) continue;
    const primary = primaryTs.toDate();
    const triggerDate = new Date(primary.getTime() - LEAD_MINUTES[event.type] * 60_000);
    if (triggerDate.getTime() <= now.getTime()) continue; // déjà passé

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${trip.name} — ${event.name}`,
        body: reminderBody(event, primary),
        data: { tripId: trip.id, eventId: event.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
        channelId: Platform.OS === 'android' ? 'reminders' : undefined,
      },
    });
    count += 1;
  }
  return count;
}
