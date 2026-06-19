import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { EventType, TripEvent } from '@/types';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import type { TranslateFn } from '@/i18n/I18nContext';
import { formatTime } from '@/utils/dates';
import { eventMeta, eventIcon } from './eventMeta';

interface Props {
  event: TripEvent;
  onPress?: () => void;
  onDelete?: () => void;
  editable?: boolean;
}

function getTimeLabel(event: TripEvent, t: TranslateFn): string | null {
  switch (event.type) {
    case EventType.ACCOMMODATION:
      return event.checkInTime
        ? t('event.checkInAt', { time: formatTime(event.checkInTime) })
        : null;
    case EventType.TRANSPORT:
      if (event.departureTime && event.arrivalTime)
        return `${formatTime(event.departureTime)} -> ${formatTime(event.arrivalTime)}`;
      if (event.departureTime)
        return t('event.departAt', { time: formatTime(event.departureTime) });
      return null;
    case EventType.ACTIVITY:
      if (event.startTime && event.endTime)
        return `${formatTime(event.startTime)} - ${formatTime(event.endTime)}`;
      if (event.startTime) return formatTime(event.startTime);
      return null;
    case EventType.RESTAURANT:
      return event.time ? formatTime(event.time) : null;
  }
}

function getSubtitle(event: TripEvent): string | null {
  switch (event.type) {
    case EventType.ACCOMMODATION:
      return event.address;
    case EventType.TRANSPORT:
      return `${event.departureLocation} -> ${event.arrivalLocation}`;
    case EventType.ACTIVITY:
      return event.location ?? null;
    case EventType.RESTAURANT:
      return event.address ?? null;
  }
}

export function EventCard({ event, onPress, onDelete, editable }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const meta = eventMeta[event.type];
  const timeLabel = getTimeLabel(event, t);
  const subtitle = getSubtitle(event);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={eventIcon(event)} size={22} color={meta.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.name} numberOfLines={1}>
            {event.name}
          </Text>
        </View>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
        {timeLabel ? <Text style={styles.time}>{timeLabel}</Text> : null}
      </View>
      {editable && onDelete && (
        <Pressable onPress={onDelete} style={styles.deleteBtn} hitSlop={8}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </Pressable>
      )}
    </Pressable>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  pressed: { opacity: 0.85 },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  time: { fontSize: fontSize.xs, color: colors.text, marginTop: 2, fontWeight: '500' },
  deleteBtn: { padding: spacing.xs },
});
