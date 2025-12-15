
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  PROVIDER = 'provider'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected'
}

export enum PaymentMethod {
  VODAFONE_CASH = 'Vodafone Cash',
  INSTAPAY = 'Instapay'
}

export interface AppSettings {
  appName: string;
  logoUrl: string; // Base64 or URL
  heroImages: string[];
  backgroundStyle: string; // CSS background value
  contentOverrides: { [key: string]: string }; // Key-Value pair for text/image replacements
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  // Updated statuses for subscription flow
  providerStatus?: 'pending' | 'pending_payment' | 'payment_review' | 'approved' | 'rejected';
  email: string;
  isEmailVerified?: boolean;
  provider?: 'email' | 'google' | 'facebook';
  savedEventIds: string[];
  subscriptionReceipt?: string; // URL/Base64 of payment receipt
}

export interface Review {
  id: string;
  itemId: string; // Event ID or Service ID
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  timestamp: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  imageUrl?: string; // Base64 or URL
  likes: string[]; // Array of User IDs who liked
  comments: Comment[];
  timestamp: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  price: number;
  imageUrl: string;
  organizerId: string;
  category: 'Party' | 'Hike' | 'Diving' | 'Wellness' | 'Workshop';
  status: 'pending' | 'approved' | 'rejected';
  isFeatured?: boolean;
}

export interface ServiceProvider {
  id: string;
  name: string;
  serviceType: 'Driver' | 'Cleaner' | 'Guide' | 'Maintenance';
  description: string;
  phone: string;
  rating: number;
  imageUrl: string;
  isVerified: boolean;
}

export interface Booking {
  id: string;
  itemId: string; // Event ID or Service ID
  itemType: 'event' | 'service';
  userId: string;
  userName: string;
  amount: number;
  method: PaymentMethod;
  status: BookingStatus;
  timestamp: string;
  receiptImage?: string; // Base64 placeholder
}
