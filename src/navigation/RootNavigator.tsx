import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
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
import { colors } from '@/theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { user, initialized } = useAuth();

  if (!initialized) return <LoadingScreen />;
  if (!user) return <AuthStack />;

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.text },
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Voyage' }} />
      <Stack.Screen
        name="AddEditTrip"
        component={AddEditTripScreen}
        options={({ route }) => ({
          title: route.params?.tripId ? 'Modifier le voyage' : 'Nouveau voyage',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="AddEditEvent"
        component={AddEditEventScreen}
        options={({ route }) => ({
          title: route.params?.eventId ? 'Modifier l\'evenement' : 'Nouvel evenement',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="ShareTrip"
        component={ShareTripScreen}
        options={{ title: 'Partager', presentation: 'modal' }}
      />
      <Stack.Screen name="Timeline" component={TimelineScreen} options={{ title: 'Timeline' }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Rappels' }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: 'Carte' }} />
      <Stack.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Dépenses' }} />
      <Stack.Screen
        name="AddEditExpense"
        component={AddEditExpenseScreen}
        options={({ route }) => ({
          title: route.params?.expenseId ? 'Modifier la dépense' : 'Nouvelle dépense',
          presentation: 'modal',
        })}
      />
      <Stack.Screen
        name="Participants"
        component={ParticipantsScreen}
        options={{ title: 'Participants', presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
