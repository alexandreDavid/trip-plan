import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Participant } from '@/types';
import { colors, radius, spacing, fontSize } from '@/theme';
import { formatCents, Settlement } from '@/utils/expenses';

interface Props {
  participants: Participant[];
  balances: Record<string, number>; // centimes, devise de base
  settlements: Settlement[];
  totalInBase: number;
  baseCurrency: string;
}

export function BalancePanel({
  participants,
  balances,
  settlements,
  totalInBase,
  baseCurrency,
}: Props) {
  const nameOf = (id: string) => participants.find((p) => p.id === id)?.displayName ?? '?';

  return (
    <View style={styles.container}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total dépensé</Text>
        <Text style={styles.totalValue}>{formatCents(Math.round(totalInBase * 100), baseCurrency)}</Text>
      </View>

      <Text style={styles.sectionTitle}>Soldes</Text>
      {participants.map((p) => {
        const cents = balances[p.id] ?? 0;
        const positive = cents > 0;
        const zero = cents === 0;
        return (
          <View key={p.id} style={styles.balanceRow}>
            <Text style={styles.balanceName} numberOfLines={1}>
              {p.displayName}
            </Text>
            <Text
              style={[
                styles.balanceValue,
                zero ? styles.neutral : positive ? styles.positive : styles.negative,
              ]}
            >
              {zero ? '—' : `${positive ? '+' : ''}${formatCents(cents, baseCurrency)}`}
            </Text>
          </View>
        );
      })}

      <Text style={styles.sectionTitle}>Remboursements suggérés</Text>
      {settlements.length === 0 ? (
        <View style={styles.settledRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.settledText}>Tout est équilibré</Text>
        </View>
      ) : (
        settlements.map((s, i) => (
          <View key={`${s.from}-${s.to}-${i}`} style={styles.settlementRow}>
            <Text style={styles.settlementText} numberOfLines={1}>
              <Text style={styles.settlementName}>{nameOf(s.from)}</Text>
              {' doit '}
              <Text style={styles.settlementName}>{nameOf(s.to)}</Text>
            </Text>
            <Text style={styles.settlementAmount}>{formatCents(s.amountCents, baseCurrency)}</Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  totalLabel: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: fontSize.lg, fontWeight: '700', color: colors.primary },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 3,
  },
  balanceName: { flex: 1, fontSize: fontSize.md, color: colors.text },
  balanceValue: { fontSize: fontSize.md, fontWeight: '600', marginLeft: spacing.sm },
  positive: { color: colors.success },
  negative: { color: colors.danger },
  neutral: { color: colors.textMuted },
  settlementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settlementText: { flex: 1, fontSize: fontSize.md, color: colors.text },
  settlementName: { fontWeight: '700' },
  settlementAmount: { fontSize: fontSize.md, fontWeight: '700', color: colors.text, marginLeft: spacing.sm },
  settledRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 4 },
  settledText: { fontSize: fontSize.md, color: colors.textMuted },
});
