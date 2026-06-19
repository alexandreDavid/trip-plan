import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/hooks/useTrip';
import { useTripExpenses } from '@/hooks/useExpenses';
import { addParticipant, removeParticipant } from '@/services/expenseService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { formatCents, expensePayers } from '@/utils/expenses';
import { avatarColor, initials } from '@/utils/avatar';
import { confirmDialog, alertDialog } from '@/utils/dialog';

// Gestion des participants "par nom" (sans compte ni lien) : ajout manuel,
// liste, retrait. Réutilisé dans la page Participants (avec soldes) et sous
// l'écran "Partager le voyage" (identité seule, showBalances=false).

function isReferenced(participantId: string, expenses: Expense[]): boolean {
  return expenses.some(
    (e) => participantId in expensePayers(e) || e.splitBetween.includes(participantId),
  );
}

interface Props {
  tripId: string;
  // Affiche le solde de chaque participant + un en-tête récapitulatif.
  showBalances?: boolean;
}

export function ParticipantsManager({ tripId, showBalances = false }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const { user } = useAuth();
  const { canEdit, trip } = useTrip(tripId);
  const { participants, expenses, balances, totalInBase } = useTripExpenses(tripId);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const baseCurrency = trip?.baseCurrency ?? 'EUR';
  const selfPresent = participants.some((p) => p.uid === user?.uid);

  const handleAdd = async (displayName: string, uid?: string | null) => {
    if (!displayName.trim()) return;
    setSubmitting(true);
    try {
      await addParticipant(tripId, { displayName: displayName.trim(), uid: uid ?? null });
      setName('');
    } catch (err) {
      alertDialog(t('common.error'), (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (participantId: string, displayName: string) => {
    if (isReferenced(participantId, expenses)) {
      alertDialog(t('expense.cannotRemoveTitle'), t('expense.cannotRemoveBody', { name: displayName }));
      return;
    }
    const ok = await confirmDialog({
      title: t('expense.removeConfirmTitle'),
      message: t('expense.removeConfirmBody', { name: displayName }),
      confirmLabel: t('common.remove'),
      cancelLabel: t('common.cancel'),
      destructive: true,
    });
    if (ok) removeParticipant(tripId, participantId);
  };

  const peopleLabel =
    participants.length === 1
      ? t('expense.peopleOne')
      : t('expense.peopleMany', { count: participants.length });

  return (
    <View>
      {participants.length > 0 && (
        <View style={styles.headerRow}>
          <Ionicons name="people" size={18} color={colors.primary} />
          <Text style={styles.headerText} numberOfLines={1}>
            {peopleLabel}
            {showBalances && totalInBase > 0
              ? ` · ${t('expense.totalSpentInline', {
                  amount: formatCents(Math.round(totalInBase * 100), baseCurrency),
                })}`
              : ''}
          </Text>
        </View>
      )}

      {canEdit && (
        <>
          {participants.length === 0 && (
            <Text style={styles.subtitle}>{t('expense.addParticipantSubtitle')}</Text>
          )}
          <View style={styles.addRow}>
            <View style={{ flex: 1 }}>
              <Input value={name} onChangeText={setName} placeholder={t('expense.firstNamePlaceholder')} />
            </View>
            <Button title={t('common.add')} onPress={() => handleAdd(name)} loading={submitting} style={styles.addBtn} />
          </View>
          {!selfPresent && user && (
            <Pressable
              style={styles.selfRow}
              onPress={() =>
                handleAdd(user.displayName ?? user.email?.split('@')[0] ?? t('expense.selfDefaultName'), user.uid)
              }
            >
              <Ionicons name="person-add-outline" size={18} color={colors.primary} />
              <Text style={styles.selfText}>{t('expense.addSelf')}</Text>
            </Pressable>
          )}
        </>
      )}

      {participants.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="people-outline" size={32} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            {canEdit ? t('expense.addFirstParticipant') : t('expense.noParticipantsYet')}
          </Text>
        </View>
      ) : (
        participants.map((item) => {
          const isSelf = !!item.uid && item.uid === user?.uid;
          const isLinked = !!item.uid && !isSelf;
          const badgeLabel = isSelf ? t('expense.you') : isLinked ? t('expense.linkedAccount') : t('expense.guest');
          const badgeColor = isSelf ? colors.primary : isLinked ? colors.secondary : colors.textMuted;
          const badgeBg = isSelf
            ? colors.primary + '1A'
            : isLinked
              ? colors.secondary + '1A'
              : colors.border;

          const cents = balances[item.id] ?? 0;
          const positive = cents > 0;
          const zero = cents === 0;
          const balanceText = zero ? '—' : `${positive ? '+' : ''}${formatCents(cents, baseCurrency)}`;
          const balanceStyle = zero ? styles.balNeutral : positive ? styles.balPositive : styles.balNegative;

          return (
            <View key={item.id} style={styles.row}>
              <View style={[styles.avatar, { backgroundColor: avatarColor(item.displayName) }]}>
                <Text style={styles.avatarInitial}>{initials(item.displayName)}</Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>{item.displayName}</Text>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                  <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                </View>
              </View>
              {showBalances && (
                <Text style={[styles.balance, balanceStyle]} numberOfLines={1}>
                  {balanceText}
                </Text>
              )}
              {canEdit && (
                <Pressable onPress={() => handleRemove(item.id, item.displayName)} hitSlop={8}>
                  <Ionicons name="close-circle" size={22} color={colors.textMuted} />
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    headerText: { flex: 1, fontSize: fontSize.md, fontWeight: '700', color: colors.text },
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
    addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    addBtn: { paddingHorizontal: spacing.md },
    selfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.sm },
    selfText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
    empty: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.lg },
    emptyText: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic' },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      gap: spacing.sm,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: fontSize.md, fontWeight: '700', color: '#FFFFFF' },
    body: { flex: 1, gap: 3 },
    name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
    badge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing.sm,
      paddingVertical: 1,
      borderRadius: radius.full,
    },
    badgeText: { fontSize: fontSize.xs, fontWeight: '700' },
    balance: { fontSize: fontSize.md, fontWeight: '700', marginLeft: spacing.xs },
    balPositive: { color: colors.success },
    balNegative: { color: colors.danger },
    balNeutral: { color: colors.textMuted },
  });
