import { Timestamp } from 'firebase/firestore';

export interface Trip {
  id: string;
  name: string;
  destination: string;
  startDate: Timestamp;
  endDate: Timestamp;
  coverImageURL?: string;
  ownerId: string;
  sharedWith: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Day {
  id: string;
  tripId: string;
  date: Timestamp;
  order: number;
}

export type TripInput = {
  name: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImageURL?: string;
};
