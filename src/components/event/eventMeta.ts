import { Ionicons } from '@expo/vector-icons';
import { EventType } from '@/types';
import { colors } from '@/theme';

type IconName = keyof typeof Ionicons.glyphMap;

export const eventMeta: Record<EventType, { icon: IconName; color: string; label: string }> = {
  [EventType.ACCOMMODATION]: { icon: 'bed-outline', color: colors.accommodation, label: 'Hebergement' },
  [EventType.TRANSPORT]: { icon: 'airplane-outline', color: colors.transport, label: 'Transport' },
  [EventType.ACTIVITY]: { icon: 'map-outline', color: colors.activity, label: 'Activite' },
  [EventType.RESTAURANT]: { icon: 'restaurant-outline', color: colors.restaurant, label: 'Restaurant' },
};
