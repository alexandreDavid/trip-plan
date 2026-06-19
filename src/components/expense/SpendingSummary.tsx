import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ExpenseCategory } from '@/types';
import { spacing, radius, fontSize, Palette } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatMoney } from '@/utils/expenses';
import { expenseCategoryMeta } from './expenseMeta';

interface Props {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  currency: string;
}

// Récap des dépenses réelles du voyage : total + répartition par catégorie.
// On n'affiche que les catégories non nulles, triées du plus gros au plus petit.
export function SpendingSummary({ total, byCategory, currency }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const rows = useMemo(
    () =>
      (Object.entries(byCategory) as [ExpenseCategory, number][])
        .filter(([, amount]) => amount > 0)
        .sort((a, b) => b[1] - a[1]),
    [byCategory],
  );

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t('trip.spendingTitle')}</Text>
        <Text style={styles.totalValue}>{formatMoney(total, currency)}</Text>
      </View>
      <View style={styles.breakdown}>
        {rows.map(([category, amount]) => {
          const meta = expenseCategoryMeta[category];
          return (
            <View key={category} style={styles.item}>
              <View style={[styles.dot, { backgroundColor: meta.color }]} />
              <Ionicons name={meta.icon} size={15} color={colors.textMuted} />
              <Text style={styles.itemLabel}>{t(meta.labelKey)}</Text>
              <Text style={styles.itemValue}>{formatMoney(amount, currency)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
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
