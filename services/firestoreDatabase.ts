import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import {
  ref,
  uploadBytes,
  getDownloadURL
} from 'firebase/storage';
import { db, auth, storage, googleProvider, facebookProvider, isFirebaseConfigured } from './firebase';
import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus, Review, Post, Comment, AppSettings } from '../types';
import { nanoid } from 'nanoid';

// Default settings if none exist in DB
const INITIAL_SETTINGS: AppSettings = {
  appName: 'AmakenDahab',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042390.png',
  heroImages: [
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop"
  ],
  backgroundStyle: 'linear-gradient(to bottom, #0f172a, #1e293b)',
  contentOverrides: {
    'home-hero-title-highlight': 'Dahab',
    'home-cat-title': 'Explore Dahab'
  }
};

// Helper to convert Firestore timestamp to string
const timestampToString = (timestamp: unknown): string => {
  if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
};

class FirestoreDatabase {
  private useFirestore: boolean;

  constructor() {
    this.useFirestore = isFirebaseConfigured;
    if (!this.useFirestore) {
      console.warn('⚠️ Firestore not configured. Using localStorage fallback.');
    }
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<User> {
    if (!this.useFirestore) {
      throw new Error('Firebase not configured. Please set environment variables.');
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Get user document from Firestore
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error('User profile not found');
      }

      return userDoc.data() as User;
    } catch (error: unknown) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(name: string, email: string, password: string, isProvider: boolean): Promise<User> {
    if (!this.useFirestore) {
      throw new Error('Firebase not configured. Please set environment variables.');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const newUser: User = {
        id: firebaseUser.uid,
        name,
        email,
        role: isProvider ? UserRole.PROVIDER : UserRole.USER,
        providerStatus: isProvider ? 'pending' : undefined,
        isEmailVerified: firebaseUser.emailVerified,
        provider: 'email',
        savedEventIds: []
      };

      // Save user profile to Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      return newUser;
    } catch (error: unknown) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async socialLogin(providerType: 'google' | 'facebook'): Promise<User> {
    if (!this.useFirestore) {
      throw new Error('Firebase not configured. Please set environment variables.');
    }

    try {
      const provider = providerType === 'google' ? googleProvider : facebookProvider;
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

      if (userDoc.exists()) {
        return userDoc.data() as User;
      }

      // Create new user profile
      const newUser: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: UserRole.USER,
        isEmailVerified: firebaseUser.emailVerified,
        provider: providerType,
        savedEventIds: []
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
      return newUser;
    } catch (error: unknown) {
      console.error('Social login error:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    if (!this.useFirestore) return;
    await signOut(auth);
  }

  // --- SETTINGS ---
  async getSettings(): Promise<AppSettings> {
    if (!this.useFirestore) {
      console.log('📦 Using default settings (Firestore not configured)');
      return INITIAL_SETTINGS;
    }

    try {
      console.log('📖 Fetching app settings from Firestore...');
      const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
      if (settingsDoc.exists()) {
        console.log('✅ App settings loaded from Firestore');
        const settings = settingsDoc.data() as AppSettings;
        if (!settings.contentOverrides) settings.contentOverrides = {};
        return settings;
      }

      console.log('⚠️ No settings found, initializing with defaults...');
      // Initialize with default settings
      await setDoc(doc(db, 'settings', 'app'), INITIAL_SETTINGS);
      console.log('✅ Default settings saved to Firestore');
      return INITIAL_SETTINGS;
    } catch (error: any) {
      console.error('❌ Error fetching settings:', error);

      // Check if it's a permissions error
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        console.error('🔒 Firestore permissions error. Using default settings.');
        console.error('💡 To fix: Deploy Firestore rules using Firebase Console');
        console.error('   Go to: https://console.firebase.google.com/project/amakendahab/firestore/rules');
      }

      // Return default settings as fallback
      console.log('📦 Using default settings as fallback');
      return INITIAL_SETTINGS;
    }
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    if (!this.useFirestore) return;
    await setDoc(doc(db, 'settings', 'app'), settings);
  }

  async updateContentOverride(key: string, value: string): Promise<void> {
    if (!this.useFirestore) return;

    const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
    const currentSettings = settingsDoc.exists() ? settingsDoc.data() as AppSettings : INITIAL_SETTINGS;

    const newOverrides = { ...currentSettings.contentOverrides, [key]: value };
    await updateDoc(doc(db, 'settings', 'app'), {
      contentOverrides: newOverrides
    });
  }

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
    if (!this.useFirestore) return [];

    try {
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      return eventsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Event));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async getPublicEvents(): Promise<Event[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(collection(db, 'events'), where('status', '==', 'approved'));
      const eventsSnapshot = await getDocs(q);
      return eventsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as Event));
    } catch (error) {
      console.error('Error fetching public events:', error);
      return [];
    }
  }

  async addEvent(event: Event): Promise<void> {
    if (!this.useFirestore) return;
    const eventId = event.id || nanoid();
    await setDoc(doc(db, 'events', eventId), { ...event, id: eventId });
  }

  async updateEvent(updatedEvent: Event): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'events', updatedEvent.id), updatedEvent as any);
  }

  async deleteEvent(eventId: string): Promise<void> {
    if (!this.useFirestore) return;
    await deleteDoc(doc(db, 'events', eventId));
  }

  async toggleFeaturedEvent(eventId: string, featured: boolean): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'events', eventId), { isFeatured: featured });
  }

  // --- PROVIDERS ---
  async getProviders(): Promise<ServiceProvider[]> {
    if (!this.useFirestore) return [];

    try {
      const providersSnapshot = await getDocs(collection(db, 'serviceProviders'));
      return providersSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      } as ServiceProvider));
    } catch (error) {
      console.error('Error fetching providers:', error);
      return [];
    }
  }

  // --- REVIEWS ---
  async getReviews(itemId: string): Promise<Review[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(
        collection(db, 'reviews'),
        where('itemId', '==', itemId),
        orderBy('timestamp', 'desc')
      );
      const reviewsSnapshot = await getDocs(q);
      return reviewsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: timestampToString(doc.data().timestamp)
      } as Review));
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return [];
    }
  }

  async addReview(review: Review): Promise<void> {
    if (!this.useFirestore) return;

    const reviewId = review.id || nanoid();
    await setDoc(doc(db, 'reviews', reviewId), {
      ...review,
      id: reviewId,
      timestamp: Timestamp.now()
    });

    // Update provider rating if it's a provider review
    if (review.itemId.startsWith('p') || review.itemId.length > 5) {
      const reviews = await this.getReviews(review.itemId);
      const avg = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;

      await updateDoc(doc(db, 'serviceProviders', review.itemId), {
        rating: Number(avg.toFixed(1))
      });
    }
  }

  // --- SOCIAL HUB (POSTS) ---
  async getPosts(): Promise<Post[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(collection(db, 'posts'), orderBy('timestamp', 'desc'));
      const postsSnapshot = await getDocs(q);
      return postsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: timestampToString(doc.data().timestamp)
      } as Post));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }

  async createPost(post: Post): Promise<void> {
    if (!this.useFirestore) return;

    const postId = post.id || nanoid();
    await setDoc(doc(db, 'posts', postId), {
      ...post,
      id: postId,
      timestamp: Timestamp.now()
    });
  }

  async toggleLikePost(postId: string, userId: string): Promise<void> {
    if (!this.useFirestore) return;

    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);

    if (postDoc.exists()) {
      const post = postDoc.data() as Post;
      const hasLiked = post.likes.includes(userId);

      if (hasLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(userId)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(userId)
        });
      }
    }
  }

  async addComment(postId: string, comment: Comment): Promise<void> {
    if (!this.useFirestore) return;

    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      comments: arrayUnion({
        ...comment,
        timestamp: new Date().toISOString()
      })
    });
  }

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(collection(db, 'bookings'), orderBy('timestamp', 'desc'));
      const bookingsSnapshot = await getDocs(q);
      return bookingsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: timestampToString(doc.data().timestamp)
      } as Booking));
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', userId));
      const bookingsSnapshot = await getDocs(q);
      return bookingsSnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
        timestamp: timestampToString(doc.data().timestamp)
      } as Booking));
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  async createBooking(booking: Booking): Promise<void> {
    if (!this.useFirestore) return;

    const bookingId = booking.id || nanoid();
    await setDoc(doc(db, 'bookings', bookingId), {
      ...booking,
      id: bookingId,
      timestamp: Timestamp.now()
    });
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'bookings', bookingId), { status });
  }

  // --- USER MANAGEMENT ---
  async toggleSavedEvent(userId: string, eventId: string): Promise<void> {
    if (!this.useFirestore) return;

    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const user = userDoc.data() as User;
      const savedIds = user.savedEventIds || [];
      const isSaved = savedIds.includes(eventId);

      if (isSaved) {
        await updateDoc(userRef, {
          savedEventIds: arrayRemove(eventId)
        });
      } else {
        await updateDoc(userRef, {
          savedEventIds: arrayUnion(eventId)
        });
      }
    }
  }

  async getUser(userId: string): Promise<User | undefined> {
    if (!this.useFirestore) return undefined;

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getPendingProviders(): Promise<User[]> {
    if (!this.useFirestore) return [];

    try {
      const q = query(
        collection(db, 'users'),
        where('providerStatus', 'in', ['pending', 'payment_review'])
      );
      const usersSnapshot = await getDocs(q);
      return usersSnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error fetching pending providers:', error);
      return [];
    }
  }

  async requestProviderPayment(userId: string): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'users', userId), {
      providerStatus: 'pending_payment'
    });
  }

  async submitProviderPayment(userId: string, receiptUrl: string): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'users', userId), {
      providerStatus: 'payment_review',
      subscriptionReceipt: receiptUrl
    });
  }

  async approveProvider(userId: string): Promise<User | null> {
    if (!this.useFirestore) return null;

    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return null;

      const user = userDoc.data() as User;

      await updateDoc(userRef, {
        providerStatus: 'approved'
      });

      // Create provider profile
      const providersSnapshot = await getDocs(collection(db, 'serviceProviders'));
      const providerExists = providersSnapshot.docs.some(doc => doc.id === userId);

      if (!providerExists) {
        const newProvider: ServiceProvider = {
          id: userId,
          name: user.name,
          serviceType: 'Driver',
          description: 'Verified service provider',
          phone: '',
          rating: 5.0,
          imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
          isVerified: true
        };

        await setDoc(doc(db, 'serviceProviders', userId), newProvider);
      }

      return { ...user, providerStatus: 'approved' };
    } catch (error) {
      console.error('Error approving provider:', error);
      return null;
    }
  }

  async rejectProvider(userId: string): Promise<void> {
    if (!this.useFirestore) return;
    await updateDoc(doc(db, 'users', userId), {
      role: UserRole.USER,
      providerStatus: 'rejected'
    });
  }

  async sendVerificationCode(email: string): Promise<boolean> {
    // This would typically trigger an email verification
    return true;
  }

  async verifyAndCreateUser(name: string, email: string, code: string, isProvider: boolean): Promise<User | null> {
    // Deprecated - use register instead
    return null;
  }

  // --- IMAGE UPLOAD ---
  async uploadImage(file: File, path: string): Promise<string> {
    if (!this.useFirestore) {
      throw new Error('Firebase Storage not configured');
    }

    try {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }
}

export const firestoreDb = new FirestoreDatabase();
