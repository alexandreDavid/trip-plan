import { EventType } from './event';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  MyTrips: undefined;
  SharedTrips: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  TripDetail: { tripId: string };
  AddEditTrip: { tripId?: string };
  AddEditEvent: {
    tripId: string;
    dayId: string;
    eventId?: string;
    eventType?: EventType;
  };
  EventDetail: { tripId: string; dayId: string; eventId: string };
  ShareTrip: { tripId: string };
  Expenses: { tripId: string };
  AddEditExpense: { tripId: string; expenseId?: string };
  Participants: { tripId: string };
  Timeline: { tripId: string };
  Reminders: { tripId: string };
  Map: { tripId: string };
  JoinTrip: { tripId?: string; token?: string } | undefined;
};
