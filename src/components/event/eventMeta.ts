import { Ionicons } from '@expo/vector-icons';
import { EventType, TransportMode, TripEvent } from '@/types';
import { accent } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Le label est une clé i18n (résolue à l'affichage via t()).
export const eventMeta: Record<EventType, { icon: IconName; color: string; labelKey: string }> = {
  [EventType.ACCOMMODATION]: { icon: 'bed-outline', color: accent.accommodation, labelKey: 'event.type.accommodation' },
  [EventType.TRANSPORT]: { icon: 'airplane-outline', color: accent.transport, labelKey: 'event.type.transport' },
  [EventType.ACTIVITY]: { icon: 'map-outline', color: accent.activity, labelKey: 'event.type.activity' },
  [EventType.RESTAURANT]: { icon: 'restaurant-outline', color: accent.restaurant, labelKey: 'event.type.restaurant' },
};

// Icône spécifique au mode de transport. La catégorie "transport" garde l'avion
// générique dans eventMeta (sélecteur de type) ; ici on précise selon le mode
// réellement choisi sur l'événement.
export const transportIcons: Record<TransportMode, IconName> = {
  flight: 'airplane-outline',
  train: 'train-outline',
  bus: 'bus-outline',
  car: 'car-outline',
  ferry: 'boat-outline',
  other: 'navigate-outline',
};

// Icône d'un événement concret : adapte le transport à son mode, sinon l'icône
// de sa catégorie.
export function eventIcon(event: TripEvent): IconName {
  return event.type === EventType.TRANSPORT
    ? transportIcons[event.transportMode]
    : eventMeta[event.type].icon;
}
