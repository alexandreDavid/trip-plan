import React, { useLayoutEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Participant } from '@/types';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { useTrip } from '@/hooks/useTrip';
import { useTripExpenses } from '@/hooks/useExpenses';
import { useAllEvents } from '@/hooks/useEvents';
import { ExpenseCard } from '@/components/expense/ExpenseCard';
import { BalancePanel } from '@/components/expense/BalancePanel';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { Palette, radius, spacing, fontSize } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Expenses'>;

export function ExpensesScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const { tripId } = route.params;
  const { trip, canEdit } = useTrip(tripId);
  const { participants, expenses, balances, settlements, totalInBase, loading } =
    useTripExpenses(tripId);
  const { events } = useAllEvents(tripId);

  const baseCurrency = trip?.baseCurrency ?? DEFAULT_CURRENCY;
  const participantsById = useMemo(
    () => Object.fromEntries(participants.map((p) => [p.id, p])) as Record<string, Participant>,
    [participants],
  );
  const eventNameById = useMemo(
    () => Object.fromEntries(events.map((e) => [e.id, e.name])) as Record<string, string>,
    [events],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('nav.expenses'),
      headerRight: () => (
        <Pressable
          onPress={() => navigation.navigate('Participants', { tripId })}
          hitSlop={8}
          style={{ marginRight: spacing.md }}
        >
          <Ionicons name="people-outline" size={22} color={colors.primary} />
        </Pressable>
      ),
    });
  }, [navigation, tripId, t, colors]);

  if (loading) return <LoadingScreen />;

  const noParticipants = participants.length === 0;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {noParticipants ? (
        <View style={styles.empty}>
          <EmptyState
            icon="people-outline"
            title={t('expense.startWithParticipants')}
            subtitle={t('expense.startWithParticipantsSubtitle')}
            actionLabel={canEdit ? t('expense.manageParticipants') : undefined}
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

          <Text style={styles.sectionTitle}>{t('expense.expensesSection')}</Text>
          <View style={styles.list}>
            {expenses.length === 0 ? (
              <View style={{ paddingVertical: spacing.xl }}>
                <EmptyState
                  icon="receipt-outline"
                  title={t('expense.noExpenses')}
                  subtitle={canEdit ? t('expense.addFirstExpense') : undefined}
                />
              </View>
            ) : (
              // .map() plutôt qu'une FlatList imbriquée : sinon le scroll
              // imbriqué bloque les gestes sur web mobile (cf. TripDetail).
              expenses.map((item) => (
                <ExpenseCard
                  key={item.id}
                  expense={item}
                  participantsById={participantsById}
                  baseCurrency={baseCurrency}
                  eventName={item.eventId ? eventNameById[item.eventId] : undefined}
                  onPress={
                    canEdit
                      ? () => navigation.navigate('AddEditExpense', { tripId, expenseId: item.id })
                      : undefined
                  }
                />
              ))
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

const makeStyles = (colors: Palette) => StyleSheet.create({
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
