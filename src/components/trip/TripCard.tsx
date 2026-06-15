import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Trip } from '@/types';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDateRange } from '@/utils/dates';

interface Props {
  trip: Trip;
  onPress: () => void;
  sharedBadge?: boolean;
}

export function TripCard({ trip, onPress, sharedBadge }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      {trip.coverImageURL ? (
        <Image source={{ uri: trip.coverImageURL }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {trip.name}
          </Text>
          {sharedBadge && (
            <View style={styles.badge}>
              <Ionicons name="people" size={12} color="#fff" />
            </View>
          )}
        </View>
        <Text style={styles.destination} numberOfLines={1}>
          {trip.destination}
        </Text>
        <Text style={styles.dates}>{formatDateRange(trip.startDate, trip.endDate)}</Text>
      </View>
    </Pressable>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  pressed: { opacity: 0.85 },
  image: { width: '100%', height: 140, backgroundColor: colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1, fontSize: fontSize.lg, fontWeight: '700', color: colors.text },
  badge: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  destination: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  dates: { fontSize: fontSize.sm, color: colors.text, marginTop: spacing.xs },
});
