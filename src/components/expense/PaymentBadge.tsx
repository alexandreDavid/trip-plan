import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { paymentStatus, formatMoney, PaymentStatus } from '@/utils/expenses';

type IconName = keyof typeof Ionicons.glyphMap;

interface Props {
  amount: number;
  paidAmount?: number;
  currency: string;
}

// Pastille de statut de paiement au prestataire (payée / partielle / non payée),
// déduit du montant payé. Pour "partielle", affiche payé / total.
export function PaymentBadge({ amount, paidAmount, currency }: Props) {
  const { colors } = useTheme();
  const t = useT();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const status = paymentStatus(amount, paidAmount);

  const config: Record<PaymentStatus, { color: string; icon: IconName; label: string }> = {
    paid: { color: colors.success, icon: 'checkmark-circle', label: t('expense.paid') },
    partial: { color: colors.warning, icon: 'contrast', label: t('expense.partiallyPaid') },
    unpaid: { color: colors.textMuted, icon: 'ellipse-outline', label: t('expense.unpaid') },
  };
  const c = config[status];

  return (
    <View style={[styles.badge, { backgroundColor: c.color + '1A' }]}>
      <Ionicons name={c.icon} size={12} color={c.color} />
      <Text style={[styles.text, { color: c.color }]} numberOfLines={1}>
        {status === 'partial'
          ? `${c.label} · ${formatMoney(paidAmount ?? 0, currency)} / ${formatMoney(amount, currency)}`
          : c.label}
      </Text>
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: radius.full,
    },
    text: { fontSize: fontSize.xs, fontWeight: '600' },
  });
