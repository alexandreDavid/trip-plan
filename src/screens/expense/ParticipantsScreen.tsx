import React, { useState } from 'react';
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
import { colors, radius, spacing, fontSize } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Participants'>;

// Un participant est référencé s'il a payé ou s'il fait partie d'un partage.
function isReferenced(participantId: string, expenses: Expense[]): boolean {
  return expenses.some(
    (e) => e.paidBy === participantId || e.splitBetween.includes(participantId),
  );
}

export function ParticipantsScreen({ route }: Props) {
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
      Alert.alert('Erreur', (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = (participantId: string, displayName: string) => {
    if (isReferenced(participantId, expenses)) {
      Alert.alert(
        'Impossible de retirer',
        `${displayName} est lié à des dépenses. Modifiez ou supprimez ces dépenses d'abord.`,
      );
      return;
    }
    Alert.alert('Retirer ce participant ?', `${displayName} ne fera plus partie du partage.`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Retirer', style: 'destructive', onPress: () => removeParticipant(tripId, participantId) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        {canEdit && (
          <>
            <Text style={styles.title}>Ajouter un participant</Text>
            <Text style={styles.subtitle}>
              Pas besoin de compte : ajoutez n'importe qui par son nom.
            </Text>
            <View style={styles.addRow}>
              <View style={{ flex: 1 }}>
                <Input value={name} onChangeText={setName} placeholder="Prénom" />
              </View>
              <Button title="Ajouter" onPress={() => handleAdd(name)} loading={submitting} style={styles.addBtn} />
            </View>
            {!selfPresent && user && (
              <Pressable
                style={styles.selfRow}
                onPress={() =>
                  handleAdd(user.displayName ?? user.email?.split('@')[0] ?? 'Moi', user.uid)
                }
              >
                <Ionicons name="person-add-outline" size={18} color={colors.primary} />
                <Text style={styles.selfText}>M'ajouter au partage</Text>
              </Pressable>
            )}
          </>
        )}

        <Text style={[styles.title, { marginTop: spacing.lg }]}>Participants</Text>
        {participants.length === 0 ? (
          <EmptyState icon="people-outline" title="Personne" subtitle="Ajoutez le premier participant" />
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
                  {item.uid && <Text style={styles.linked}>Compte lié</Text>}
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

const styles = StyleSheet.create({
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
