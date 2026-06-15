import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useT } from '@/i18n/I18nContext';
import { AuthStack } from './AuthStack';
import { MainTabs } from './MainTabs';
import { TripDetailScreen } from '@/screens/trip/TripDetailScreen';
import { AddEditTripScreen } from '@/screens/trip/AddEditTripScreen';
import { AddEditEventScreen } from '@/screens/event/AddEditEventScreen';
import { ShareTripScreen } from '@/screens/trip/ShareTripScreen';
import { ExpensesScreen } from '@/screens/expense/ExpensesScreen';
import { AddEditExpenseScreen } from '@/screens/expense/AddEditExpenseScreen';
import { ParticipantsScreen } from '@/screens/expense/ParticipantsScreen';
import { TimelineScreen } from '@/screens/trip/TimelineScreen';
import { RemindersScreen } from '@/screens/trip/RemindersScreen';
import { MapScreen } from '@/screens/trip/MapScreen';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initialized } = useAuth();
  const { colors } = useTheme();
  const t = useT();

  if (!initialized) return <LoadingScreen />;
  if (!user) return <AuthStack />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: t('nav.trip') }} />
      <Stack.Screen
        name="AddEditTrip"
        component={AddEditTripScreen}
        options={({ route }) => ({
          title: route.params?.tripId ? t('nav.editTrip') : t('nav.newTrip'),
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="AddEditEvent"
        component={AddEditEventScreen}
        options={({ route }) => ({
          title: route.params?.eventId ? t('nav.editEvent') : t('nav.newEvent'),
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="ShareTrip"
        component={ShareTripScreen}
        options={{ title: t('nav.share'), presentation: 'modal' }}
      />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: t('nav.timeline') }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: t('nav.reminders') }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: t('nav.map') }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: t('nav.expenses') }} />
      <Stack.Screen
        name="AddEditExpense"
        component={AddEditExpenseScreen}
        options={({ route }) => ({
          title: route.params?.expenseId ? t('nav.editExpense') : t('nav.newExpense'),
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
        options={{ title: t('nav.participants'), presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
