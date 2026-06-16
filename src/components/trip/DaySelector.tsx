import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, Pressable, StyleSheet, Text } from 'react-native';
import { Day } from '@/types';
import { radius, spacing, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatDate } from '@/utils/dates';

interface Props {
  days: Day[];
  selectedDayId: string | undefined;
  onSelect: (dayId: string) => void;
}

export function DaySelector({ days, selectedDayId, onSelect }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const listRef = useRef<FlatList<Day>>(null);

  // Fait défiler jusqu'au jour sélectionné (ex. aujourd'hui) pour le rendre visible.
  useEffect(() => {
    const index = days.findIndex((d) => d.id === selectedDayId);
    if (index < 0) return;
    const timer = setTimeout(() => {
      try {
        listRef.current?.scrollToIndex({ index, viewPosition: 0.5, animated: true });
      } catch {
        // liste pas encore mesurée : ignoré (onScrollToIndexFailed gère le repli)
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [selectedDayId, days]);

  return (
    <FlatList
      ref={listRef}
      data={days}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(d) => d.id}
      contentContainerStyle={styles.content}
      onScrollToIndexFailed={(info) => {
        listRef.current?.scrollToOffset({
          offset: info.averageItemLength * info.index,
          animated: false,
        });
        setTimeout(() => {
          listRef.current?.scrollToIndex({ index: info.index, viewPosition: 0.5, animated: false });
        }, 50);
      }}
      renderItem={({ item, index }) => {
        const selected = item.id === selectedDayId;
        return (
          <Pressable
            onPress={() => onSelect(item.id)}
            style={[styles.day, selected && styles.selected]}
          >
            <Text style={[styles.dayNum, selected && styles.selectedText]}>
              {t('trip.day', { index: index + 1 })}
            </Text>
            <Text style={[styles.dayDate, selected && styles.selectedText]}>
              {formatDate(item.date, 'd MMM')}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
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
