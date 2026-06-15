import React, { useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Expense } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/hooks/useTrip';
import { useTripExpenses } from '@/hooks/useExpenses';
import { addParticipant, removeParticipant } from '@/services/expenseService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Participants'>;

// Un participant est référencé s'il a payé ou s'il fait partie d'un partage.
function isReferenced(participantId: string, expenses: Expense[]): boolean {
  return expenses.some(
    (e) => e.paidBy === participantId || e.splitBetween.includes(participantId),
  );
}

export function ParticipantsScreen({ route }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const { tripId } = route.params;
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
      Alert.alert(
        t('expense.cannotRemoveTitle'),
        t('expense.cannotRemoveBody', { name: displayName }),
      );
      return;
    }
    Alert.alert(t('expense.removeConfirmTitle'), t('expense.removeConfirmBody', { name: displayName }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => removeParticipant(tripId, participantId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {canEdit && (
          <>
            <Text style={styles.title}>{t('expense.addParticipant')}</Text>
            <Text style={styles.subtitle}>
              {t('expense.addParticipantSubtitle')}
            </Text>
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

        <Text style={[styles.title, { marginTop: spacing.lg }]}>{t('nav.participants')}</Text>
        {participants.length === 0 ? (
          <EmptyState icon="people-outline" title={t('expense.noParticipantsYet')} subtitle={t('expense.addFirstParticipant')} />
        ) : (
          <FlatList
            data={participants}
            keyExtractor={(p) => p.id}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitial}>
                    {item.displayName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name}>{item.displayName}</Text>
                  {item.uid && <Text style={styles.linked}>{t('expense.linkedAccount')}</Text>}
                </View>
                {canEdit && (
                  <Pressable onPress={() => handleRemove(item.id, item.displayName)} hitSlop={8}>
                    <Ionicons name="close-circle" size={24} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, padding: spacing.md },
  title: { fontSize: fontSize.lg, fontWeight: '700', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted, marginBottom: spacing.md },
  addRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  addBtn: { paddingHorizontal: spacing.md },
  selfRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.sm },
  selfText: { color: colors.primary, fontSize: fontSize.sm, fontWeight: '600' },
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
