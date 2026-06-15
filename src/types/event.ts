import { Timestamp } from 'firebase/firestore';

export enum EventType {
  ACCOMMODATION = 'accommodation',
  TRANSPORT = 'transport',
  ACTIVITY = 'activity',
  RESTAURANT = 'restaurant',
}

export type TransportMode = 'flight' | 'train' | 'bus' | 'car' | 'ferry' | 'other';

interface BaseEvent {
  id: string;
  dayId: string;
  tripId: string;
  name: string;
  notes?: string;
  budget?: number;
  latitude?: number;
  longitude?: number;
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AccommodationEvent extends BaseEvent {
  type: EventType.ACCOMMODATION;
  address: string;
  checkInTime?: Timestamp;
  checkOutTime?: Timestamp;
}

export interface TransportEvent extends BaseEvent {
  type: EventType.TRANSPORT;
  transportMode: TransportMode;
  departureLocation: string;
  arrivalLocation: string;
  departureTime?: Timestamp;
  arrivalTime?: Timestamp;
}

export interface ActivityEvent extends BaseEvent {
  type: EventType.ACTIVITY;
  location?: string;
  startTime?: Timestamp;
  endTime?: Timestamp;
}

export interface RestaurantEvent extends BaseEvent {
  type: EventType.RESTAURANT;
  address?: string;
  time?: Timestamp;
}

export type TripEvent = AccommodationEvent | TransportEvent | ActivityEvent | RestaurantEvent;

// Version "input" sans les metadata serveur. Les dates sont en Date cote UI.
export type EventInput =
  | (Omit<AccommodationEvent, 'id' | 'dayId' | 'tripId' | 'createdAt' | 'updatedAt' | 'order' | 'checkInTime' | 'checkOutTime'> & {
      checkInTime?: Date;
      checkOutTime?: Date;
    })
  | (Omit<TransportEvent, 'id' | 'dayId' | 'tripId' | 'createdAt' | 'updatedAt' | 'order' | 'departureTime' | 'arrivalTime'> & {
      departureTime?: Date;
      arrivalTime?: Date;
    })
  | (Omit<ActivityEvent, 'id' | 'dayId' | 'tripId' | 'createdAt' | 'updatedAt' | 'order' | 'startTime' | 'endTime'> & {
      startTime?: Date;
      endTime?: Date;
    })
  | (Omit<RestaurantEvent, 'id' | 'dayId' | 'tripId' | 'createdAt' | 'updatedAt' | 'order' | 'time'> & {
      time?: Date;
    });
