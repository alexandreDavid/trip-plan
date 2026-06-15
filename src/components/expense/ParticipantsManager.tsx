import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
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

// Gestion des participants "par nom" (sans compte ni lien) : ajout manuel,
// liste, retrait. Réutilisé dans l'onglet Participants et sous Dépenses.

function isReferenced(participantId: string, expenses: Expense[]): boolean {
  return expenses.some(
    (e) => e.paidBy === participantId || e.splitBetween.includes(participantId),
  );
}

export function ParticipantsManager({ tripId }: { tripId: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const { user } = useAuth();
  const { canEdit } = useTrip(tripId);
  const { participants, expenses } = useTripExpenses(tripId);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const selfPresent = participants.some((p) => p.uid === user?.uid);

  const handleAdd = async (displayName: string, uid?: string | null) => {
    if (!displayName.trim()) return;
    setSubmitting(true);
    try {
      await addParticipant(tripId, { displayName, uid: uid ?? null });
      setName('');
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (participantId: string, displayName: string) => {
    if (isReferenced(participantId, expenses)) {
      Alert.alert(t('expense.cannotRemoveTitle'), t('expense.cannotRemoveBody', { name: displayName }));
      return;
    }
    Alert.alert(t('expense.removeConfirmTitle'), t('expense.removeConfirmBody', { name: displayName }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => removeParticipant(tripId, participantId) },
    ]);
  };

  return (
    <View>
      {canEdit && (
        <>
          <Text style={styles.subtitle}>{t('expense.addParticipantSubtitle')}</Text>
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
        <Text style={styles.empty}>{t('expense.noParticipantsYet')}</Text>
      ) : (
        participants.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Text style={styles.avatarInitial}>{item.displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name}>{item.displayName}</Text>
              {item.uid ? <Text style={styles.linked}>{t('expense.linkedAccount')}</Text> : null}
            </View>
            {canEdit && (
              <Pressable onPress={() => handleRemove(item.id, item.displayName)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color={colors.danger} />
              </Pressable>
            )}
          </View>
        ))
      )}
    </View>
  );
}

const makeStyles = (colors: Palette) =>
  StyleSheet.create({
    subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
    addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
    addBtn: { paddingHorizontal: spacing.md },
    selfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm, marginBottom: spacing.sm },
    selfText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
    empty: { fontSize: fontSize.sm, color: colors.textMuted, fontStyle: 'italic', paddingVertical: spacing.sm },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: radius.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.border },
    avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
    avatarInitial: { fontSize: fontSize.md, fontWeight: '700', color: colors.text },
    body: { flex: 1 },
    name: { fontSize: fontSize.md, fontWeight: '600', color: colors.text },
    linked: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  });
