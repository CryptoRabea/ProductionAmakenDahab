import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Booking_Key {
  id: UUIDString;
  __typename?: 'Booking_Key';
}

export interface CreateBookingData {
  booking_insert: Booking_Key;
}

export interface CreateBookingVariables {
  eventId: UUIDString;
  ticketTypeId: UUIDString;
  quantity: number;
}

export interface CreateUserData {
  user_insert: User_Key;
}

export interface CreateUserVariables {
  displayName: string;
  email: string;
}

export interface Event_Key {
  id: UUIDString;
  __typename?: 'Event_Key';
}

export interface GetUserBookingsData {
  bookings: ({
    id: UUIDString;
    bookingDate: TimestampString;
    quantity: number;
    totalPrice: number;
    event: {
      id: UUIDString;
      title: string;
      description: string;
      location: string;
      startDate: TimestampString;
      endDate: TimestampString;
    } & Event_Key;
      ticketType: {
        id: UUIDString;
        name: string;
        price: number;
      } & TicketType_Key;
  } & Booking_Key)[];
}

export interface ListEventsData {
  events: ({
    id: UUIDString;
    title: string;
    description: string;
    location: string;
    startDate: TimestampString;
    endDate: TimestampString;
    category?: string | null;
    imageUrl?: string | null;
  } & Event_Key)[];
}

export interface TicketType_Key {
  id: UUIDString;
  __typename?: 'TicketType_Key';
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface CreateUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateUserVariables): MutationRef<CreateUserData, CreateUserVariables>;
  operationName: string;
}
export const createUserRef: CreateUserRef;

export function createUser(vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;
export function createUser(dc: DataConnect, vars: CreateUserVariables): MutationPromise<CreateUserData, CreateUserVariables>;

interface ListEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEventsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEventsData, undefined>;
  operationName: string;
}
export const listEventsRef: ListEventsRef;

export function listEvents(): QueryPromise<ListEventsData, undefined>;
export function listEvents(dc: DataConnect): QueryPromise<ListEventsData, undefined>;

interface CreateBookingRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateBookingVariables): MutationRef<CreateBookingData, CreateBookingVariables>;
  operationName: string;
}
export const createBookingRef: CreateBookingRef;

export function createBooking(vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;
export function createBooking(dc: DataConnect, vars: CreateBookingVariables): MutationPromise<CreateBookingData, CreateBookingVariables>;

interface GetUserBookingsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetUserBookingsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetUserBookingsData, undefined>;
  operationName: string;
}
export const getUserBookingsRef: GetUserBookingsRef;

export function getUserBookings(): QueryPromise<GetUserBookingsData, undefined>;
export function getUserBookings(dc: DataConnect): QueryPromise<GetUserBookingsData, undefined>;

