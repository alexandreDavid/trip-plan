import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Day } from '@/types';
import { colors, radius, spacing, fontSize } from '@/theme';
import { formatDate } from '@/utils/dates';

interface Props {
  days: Day[];
  selectedDayId: string | undefined;
  onSelect: (dayId: string) => void;
}

export function DaySelector({ days, selectedDayId, onSelect }: Props) {
  return (
    <FlatList
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      contentContainerStyle={styles.content}
      renderItem={({ item, index }) => {
        const selected = item.id === selectedDayId;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={[styles.day, selected && styles.selected]}
          >
            <Text style={[styles.dayNum, selected && styles.selectedText]}>Jour {index + 1}</Text>
            <Text style={[styles.dayDate, selected && styles.selectedText]}>
              {formatDate(item.date, 'd MMM')}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  day: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayNum: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  dayDate: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  selectedText: { color: '#fff' },
});
