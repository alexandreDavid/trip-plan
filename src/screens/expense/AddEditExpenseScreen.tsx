import React, { useLayoutEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, ExpenseInput, EventType, ExpenseCategory } from '@/types';
import { DEFAULT_CURRENCY } from '@/config/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useTrip } from '@/hooks/useTrip';
import { useTripExpenses } from '@/hooks/useExpenses';
import { useAllEvents } from '@/hooks/useEvents';
import { getEventPrimaryTime } from '@/utils/events';
import { ExpenseForm, ExpensePrefill } from '@/components/expense/ExpenseForm';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { EmptyState } from '@/components/ui/EmptyState';
import { createExpense, updateExpense, deleteExpense } from '@/services/expenseService';
import { Palette, spacing } from '@/theme';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditExpense'>;

// Catégorie de dépense par défaut selon le type d'événement source.
const EVENT_TYPE_TO_CATEGORY: Record<EventType, ExpenseCategory> = {
  [EventType.ACCOMMODATION]: ExpenseCategory.ACCOMMODATION,
  [EventType.TRANSPORT]: ExpenseCategory.TRANSPORT,
  [EventType.ACTIVITY]: ExpenseCategory.ACTIVITY,
  [EventType.RESTAURANT]: ExpenseCategory.FOOD,
};

export function AddEditExpenseScreen({ route, navigation }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const t = useT();
  const { tripId, expenseId, eventId: eventIdParam } = route.params;
  const { user } = useAuth();
  const { trip } = useTrip(tripId);
  const { participants, expenses, loading } = useTripExpenses(tripId);
  const { events, loading: eventsLoading } = useAllEvents(tripId);
  const [submitting, setSubmitting] = useState(false);

  const baseCurrency = trip?.baseCurrency ?? DEFAULT_CURRENCY;
  const initialExpense = expenseId ? expenses.find((e) => e.id === expenseId) : undefined;

  // Création depuis un événement : pré-remplit et pré-lie la dépense.
  const sourceEvent = !expenseId && eventIdParam ? events.find((e) => e.id === eventIdParam) : undefined;
  const prefill: ExpensePrefill | undefined = sourceEvent
    ? {
        eventId: sourceEvent.id,
        label: sourceEvent.name,
        amount: sourceEvent.budget,
        category: EVENT_TYPE_TO_CATEGORY[sourceEvent.type],
        date: getEventPrimaryTime(sourceEvent)?.toDate(),
      }
    : undefined;

  const handleDelete = () => {
    if (!expenseId) return;
    Alert.alert(t('expense.deleteConfirmTitle'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteExpense(tripId, expenseId);
          navigation.goBack();
        },
      },
    ]);
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () =>
        expenseId ? (
          <Pressable onPress={handleDelete} hitSlop={8} style={{ marginRight: spacing.md }}>
            <Ionicons name="trash-outline" size={22} color={colors.danger} />
          </Pressable>
        ) : null,
    });
  }, [navigation, expenseId, colors]);

  if (loading || (eventIdParam && eventsLoading) || (expenseId && !initialExpense)) {
    return <LoadingScreen />;
  }

  if (participants.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.empty}>
          <EmptyState
            icon="people-outline"
            title={t('expense.noParticipants')}
            subtitle={t('expense.noParticipantsSubtitle')}
            actionLabel={t('expense.manageParticipants')}
            onAction={() => navigation.replace('Participants', { tripId })}
          />
        </View>
      </SafeAreaView>
    );
  }

  const handleSubmit = async (input: ExpenseInput) => {
    if (!user) return;
    setSubmitting(true);
    try {
      if (expenseId) {
        await updateExpense(tripId, expenseId, input);
      } else {
        await createExpense(tripId, input, user.uid);
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert(t('common.error'), (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ExpenseForm
        participants={participants}
        events={events}
        baseCurrency={baseCurrency}
        currentUid={user?.uid}
        initialExpense={initialExpense}
        prefill={prefill}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const makeStyles = (colors: Palette) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  empty: { flex: 1, padding: spacing.md },
});
