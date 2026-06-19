import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense, Participant } from '@/types';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatDate } from '@/utils/dates';
import { formatMoney, expensePayers, expensePaidAmount } from '@/utils/expenses';
import { expenseCategoryMeta } from './expenseMeta';
import { PaymentBadge } from './PaymentBadge';

interface Props {
  expense: Expense;
  participantsById: Record<string, Participant>;
  baseCurrency: string;
  eventName?: string;
  onPress?: () => void;
}

export function ExpenseCard({ expense, participantsById, baseCurrency, eventName, onPress }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const meta = expenseCategoryMeta[expense.category];
  const payerNames = Object.keys(expensePayers(expense)).map(
    (id) => participantsById[id]?.displayName ?? '?',
  );
  const payer =
    payerNames.length === 0
      ? '?'
      : payerNames.length <= 2
        ? payerNames.join(', ')
        : `${payerNames[0]} +${payerNames.length - 1}`;
  const splitCount = expense.splitBetween.length;
  const isForeign = expense.currency !== baseCurrency;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={meta.icon} size={22} color={meta.color} />
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label} numberOfLines={1}>
            {expense.label}
          </Text>
          <Text style={styles.amount}>{formatMoney(expense.amount, expense.currency)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.meta} numberOfLines={1}>
            {t('expense.paidBySplit', { payer, count: splitCount })}
          </Text>
          <Text style={styles.date}>{formatDate(expense.date, 'd MMM')}</Text>
        </View>
        {isForeign && (
          <Text style={styles.converted}>≈ {formatMoney(expense.amountInBase, baseCurrency)}</Text>
        )}
        <View style={styles.statusRow}>
          <PaymentBadge
            amount={expense.amount}
            paidAmount={expensePaidAmount(expense)}
            currency={expense.currency}
          />
        </View>
        {eventName && (
          <View style={styles.linkRow}>
            <Ionicons name="link-outline" size={12} color={colors.textMuted} />
            <Text style={styles.linkText} numberOfLines={1}>
              {eventName}
            </Text>
          </View>
        )}
      </View>
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
  label: { flex: 1, fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  amount: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginLeft: spacing.sm },
  meta: { flex: 1, fontSize: fontSize.sm, color: colors.textMuted, marginTop: 2 },
  date: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  converted: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2, fontStyle: 'italic' },
  statusRow: { flexDirection: 'row', marginTop: spacing.xs },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  linkText: { fontSize: fontSize.xs, color: colors.textMuted },
});

