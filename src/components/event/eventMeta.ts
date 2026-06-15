import { Ionicons } from '@expo/vector-icons';
import { EventType } from '@/types';
import { accent } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

// Le label est une clé i18n (résolue à l'affichage via t()).
export const eventMeta: Record<EventType, { icon: IconName; color: string; labelKey: string }> = {
  [EventType.ACCOMMODATION]: { icon: 'bed-outline', color: accent.accommodation, labelKey: 'event.type.accommodation' },
  [EventType.TRANSPORT]: { icon: 'airplane-outline', color: accent.transport, labelKey: 'event.type.transport' },
  [EventType.ACTIVITY]: { icon: 'map-outline', color: accent.activity, labelKey: 'event.type.activity' },
  [EventType.RESTAURANT]: { icon: 'restaurant-outline', color: accent.restaurant, labelKey: 'event.type.restaurant' },
};
