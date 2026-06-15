import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { EventType } from '@/types';
import { colors, spacing, radius, fontSize } from '@/theme';
import { formatBudget } from '@/utils/budget';
import { eventMeta } from '@/components/event/eventMeta';

interface Props {
  total: number;
  byType: Record<EventType, number>;
}

export function BudgetSummary({ total, byType }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Budget total</Text>
        <Text style={styles.totalValue}>{formatBudget(total)}</Text>
      </View>
      <View style={styles.breakdown}>
        {(Object.keys(byType) as EventType[]).map((type) => {
          const meta = eventMeta[type];
          return (
            <View key={type} style={styles.item}>
              <View style={[styles.dot, { backgroundColor: meta.color }]} />
              <Text style={styles.itemLabel}>{meta.label}</Text>
              <Text style={styles.itemValue}>{formatBudget(byType[type])}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: spacing.sm,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  breakdown: { gap: spacing.xs },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  itemLabel: { flex: 1, fontSize: fontSize.sm, color: colors.text },
  itemValue: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500' },
});
