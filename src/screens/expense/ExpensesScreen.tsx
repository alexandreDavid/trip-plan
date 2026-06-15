import React, { useLayoutEffect, useMemo } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Participant } from '@/types';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { useTrip } from '@/hooks/useTrip';
import { useTripExpenses } from '@/hooks/useExpenses';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { BalancePanel } from '@/components/expense/BalancePanel';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { colors, radius, spacing, fontSize } from '@/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export function ExpensesScreen({ route, navigation }: Props) {
  const { tripId } = route.params;
  const { trip, canEdit } = useTrip(tripId);
  const { participants, expenses, balances, settlements, totalInBase, loading } =
    useTripExpenses(tripId);

  const baseCurrency = trip?.baseCurrency ?? DEFAULT_CURRENCY;
  const participantsById = useMemo(
    () => Object.fromEntries(participants.map((p) => [p.id, p])) as Record<string, Participant>,
    [participants],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Dépenses',
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Participants', { tripId })} hitSlop={8}>
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, tripId]);

  if (loading) return <LoadingScreen />;

  const noParticipants = participants.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {noParticipants ? (
        <View style={styles.empty}>
          <EmptyState
            icon="people-outline"
            title="Commencez par les participants"
            subtitle="Ajoutez les personnes avec qui vous partagez les dépenses."
            actionLabel={canEdit ? 'Gérer les participants' : undefined}
            onAction={canEdit ? () => navigation.navigate('Participants', { tripId }) : undefined}
          />
        </View>
      ) : (
        <ScrollView>
          <BalancePanel
            participants={participants}
            balances={balances}
            settlements={settlements}
            totalInBase={totalInBase}
            baseCurrency={baseCurrency}
          />

          <Text style={styles.sectionTitle}>Dépenses</Text>
          <View style={styles.list}>
            {expenses.length === 0 ? (
              <View style={{ paddingVertical: spacing.xl }}>
                <EmptyState
                  icon="receipt-outline"
                  title="Aucune dépense"
                  subtitle={canEdit ? 'Ajoutez votre première dépense' : undefined}
                />
              </View>
            ) : (
              <FlatList
                data={expenses}
                scrollEnabled={false}
                keyExtractor={(e) => e.id}
                renderItem={({ item }) => (
                  <ExpenseCard
                    expense={item}
                    participantsById={participantsById}
                    baseCurrency={baseCurrency}
                    onPress={
                      canEdit
                        ? () => navigation.navigate('AddEditExpense', { tripId, expenseId: item.id })
                        : undefined
                    }
                  />
                )}
              />
            )}
          </View>
        </ScrollView>
      )}

      {canEdit && !noParticipants && (
        <Pressable style={styles.fab} onPress={() => navigation.navigate('AddEditExpense', { tripId })}>
          <Ionicons name="add" size={28} color="#fff" />
        </Pressable>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, padding: spacing.md },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
