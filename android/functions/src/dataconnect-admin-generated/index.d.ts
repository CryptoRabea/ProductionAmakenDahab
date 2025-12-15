import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

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

/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to execute without passing in DataConnect. */
export function createUser(dc: DataConnect, vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;
/** Generated Node Admin SDK operation action function for the 'CreateUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function createUser(vars: CreateUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListEvents' Query. Allow users to execute without passing in DataConnect. */
export function listEvents(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEventsData>>;
/** Generated Node Admin SDK operation action function for the 'ListEvents' Query. Allow users to pass in custom DataConnect instances. */
export function listEvents(options?: OperationOptions): Promise<ExecuteOperationResponse<ListEventsData>>;

/** Generated Node Admin SDK operation action function for the 'CreateBooking' Mutation. Allow users to execute without passing in DataConnect. */
export function createBooking(dc: DataConnect, vars: CreateBookingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateBookingData>>;
/** Generated Node Admin SDK operation action function for the 'CreateBooking' Mutation. Allow users to pass in custom DataConnect instances. */
export function createBooking(vars: CreateBookingVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateBookingData>>;

/** Generated Node Admin SDK operation action function for the 'GetUserBookings' Query. Allow users to execute without passing in DataConnect. */
export function getUserBookings(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserBookingsData>>;
/** Generated Node Admin SDK operation action function for the 'GetUserBookings' Query. Allow users to pass in custom DataConnect instances. */
export function getUserBookings(options?: OperationOptions): Promise<ExecuteOperationResponse<GetUserBookingsData>>;

