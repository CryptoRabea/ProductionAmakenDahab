import { Event, ServiceProvider, Booking, User, UserRole, BookingStatus, Review, Post, Comment, AppSettings } from '../types';

// Increment this version to force a data reset on client browsers
const DB_VERSION = '2.0'; 

// Default settings if none exist in DB
const INITIAL_SETTINGS: AppSettings = {
  appName: 'AmakenDahab',
  // Using a stable CDN image for the default logo (Palm tree/Beach icon)
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/1042/1042390.png', 
  heroImages: [
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop"
  ],
  backgroundStyle: 'linear-gradient(to bottom, #0f172a, #1e293b)',
  contentOverrides: {}
};

// Seed Data for initial load
const SEED_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Blue Hole Diving',
    description: 'Experience the legendary Blue Hole with certified guides. Suitable for advanced divers.',
    date: '2024-12-01',
    time: '09:00 AM',
    location: 'Blue Hole',
    price: 450,
    imageUrl: 'https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=1000',
    category: 'Diving',
    organizerId: 'admin1',
    status: 'approved',
    isFeatured: true
  },
  {
    id: '2',
    title: 'Laguna Sunset Yoga',
    description: 'Relaxing yoga session by the lagoon at sunset. Bring your own mat.',
    date: '2024-12-02',
    time: '17:00 PM',
    location: 'Laguna',
    price: 150,
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1000',
    category: 'Wellness',
    organizerId: 'admin1',
    status: 'approved',
    isFeatured: true
  },
  {
    id: '3',
    title: 'Full Moon Desert Party',
    description: 'Music, dancing, and bonfire under the stars in Wadi Gnai.',
    date: '2024-12-05',
    time: '21:00 PM',
    location: 'Wadi Gnai',
    price: 300,
    imageUrl: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=1000',
    category: 'Party',
    organizerId: 'admin1',
    status: 'approved',
    isFeatured: false
  }
];

const SEED_PROVIDERS: ServiceProvider[] = [
  {
    id: 'p1',
    name: 'Ahmed Driver',
    serviceType: 'Driver',
    description: 'Reliable pickup truck, airport transfers, and blue hole trips.',
    phone: '01000000001',
    rating: 4.8,
    imageUrl: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&q=80&w=200',
    isVerified: true
  }
];

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// LocalStorage Helpers
const getItem = <T>(key: string, defaultVal: T): T => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

const setItem = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

class DatabaseService {
  constructor() {
    this._initSeeds();
  }

  private _initSeeds() {
    // Check DB Version to force reset on updates if needed
    const currentVersion = localStorage.getItem('db_version');
    if (currentVersion !== DB_VERSION) {
      console.log('Database version mismatch. Resetting seed data...');
      localStorage.removeItem('events');
      localStorage.removeItem('providers');
      // We keep 'users' and 'bookings' to not delete user progress if possible, 
      // but for "broken images" we definitely need to reset events/providers.
      // If severe structure change, use localStorage.clear();
      
      // Force update settings to get new hero images if changed
      localStorage.removeItem('settings');
      
      localStorage.setItem('db_version', DB_VERSION);
    }

    if (!localStorage.getItem('events')) {
      setItem('events', SEED_EVENTS);
    }
    if (!localStorage.getItem('providers')) {
      setItem('providers', SEED_PROVIDERS);
    }
    if (!localStorage.getItem('settings')) {
      setItem('settings', INITIAL_SETTINGS);
    }
    // Ensure an admin user exists for testing
    const users = getItem<User[]>('users', []);
    if (!users.find(u => u.email === 'admin@dahab.com')) {
        const admin: User = {
            id: 'admin1',
            name: 'Admin User',
            email: 'admin@dahab.com',
            role: UserRole.ADMIN,
            savedEventIds: []
        };
        users.push(admin);
        setItem('users', users);
    }
  }

  // --- AUTHENTICATION ---

  async login(email: string, password: string): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    const user = users.find(u => u.email === email);
    
    // In a real app, verify password hash. Here we just mock success if user exists.
    if (user) {
      return user;
    } else {
      // Mock failure
      throw new Error("auth/user-not-found");
    }
  }

  async register(name: string, email: string, password: string, isProvider: boolean): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    
    if (users.find(u => u.email === email)) {
      throw new Error("auth/email-already-in-use");
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role: isProvider ? UserRole.PROVIDER : UserRole.USER,
      providerStatus: isProvider ? 'pending' : undefined,
      isEmailVerified: false,
      provider: 'email',
      savedEventIds: []
    };

    users.push(newUser);
    setItem('users', users);
    return newUser;
  }

  async socialLogin(providerType: 'google' | 'facebook'): Promise<User> {
    await delay();
    const users = getItem<User[]>('users', []);
    // Simulate a user based on provider
    const email = `testuser@${providerType}.com`;
    let user = users.find(u => u.email === email);

    if (!user) {
      user = {
        id: Math.random().toString(36).substr(2, 9),
        name: `${providerType.charAt(0).toUpperCase() + providerType.slice(1)} User`,
        email,
        role: UserRole.USER,
        isEmailVerified: true,
        provider: providerType as any,
        savedEventIds: []
      };
      users.push(user);
      setItem('users', users);
    }
    return user;
  }

  async logout(): Promise<void> {
    await delay(100);
    // No-op for local mock
  }

  // --- SETTINGS ---
  async getSettings(): Promise<AppSettings> {
    await delay(100);
    const settings = getItem<AppSettings>('settings', INITIAL_SETTINGS);
    // Ensure contentOverrides exists
    if (!settings.contentOverrides) settings.contentOverrides = {};
    return settings;
  }

  async updateSettings(settings: AppSettings): Promise<void> {
    await delay();
    setItem('settings', settings);
  }
  
  async updateContentOverride(key: string, value: string): Promise<void> {
      await delay(50);
      const settings = getItem<AppSettings>('settings', INITIAL_SETTINGS);
      if (!settings.contentOverrides) settings.contentOverrides = {};
      settings.contentOverrides[key] = value;
      setItem('settings', settings);
  }

  // --- EVENTS ---
  async getEvents(): Promise<Event[]> {
    await delay();
    return getItem<Event[]>('events', []);
  }

  async getPublicEvents(): Promise<Event[]> {
    await delay();
    const events = getItem<Event[]>('events', []);
    return events.filter(e => e.status === 'approved');
  }

  async addEvent(event: Event): Promise<void> {
    await delay();
    const events = getItem<Event[]>('events', []);
    events.push(event);
    setItem('events', events);
  }

  async updateEvent(updatedEvent: Event): Promise<void> {
    await delay();
    const events = getItem<Event[]>('events', []);
    const index = events.findIndex(e => e.id === updatedEvent.id);
    if (index !== -1) {
      events[index] = updatedEvent;
      setItem('events', events);
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    await delay();
    const events = getItem<Event[]>('events', []);
    const filtered = events.filter(e => e.id !== eventId);
    setItem('events', filtered);
  }

  async toggleFeaturedEvent(eventId: string, featured: boolean): Promise<void> {
     await delay();
     const events = getItem<Event[]>('events', []);
     const event = events.find(e => e.id === eventId);
     if(event) {
         event.isFeatured = featured;
         setItem('events', events);
     }
  }

  // --- PROVIDERS ---
  async getProviders(): Promise<ServiceProvider[]> {
    await delay();
    return getItem<ServiceProvider[]>('providers', []);
  }

  // --- REVIEWS ---
  async getReviews(itemId: string): Promise<Review[]> {
    await delay();
    const reviews = getItem<Review[]>('reviews', []);
    return reviews
      .filter(r => r.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async addReview(review: Review): Promise<void> {
    await delay();
    const reviews = getItem<Review[]>('reviews', []);
    reviews.push(review);
    setItem('reviews', reviews);

    // Update Provider Rating Aggregation
    if (review.itemId.startsWith('p') || review.itemId.length > 5) {
       const itemReviews = reviews.filter(r => r.itemId === review.itemId);
       const avg = itemReviews.reduce((acc, curr) => acc + curr.rating, 0) / itemReviews.length;
       
       const providers = getItem<ServiceProvider[]>('providers', []);
       const pIndex = providers.findIndex(p => p.id === review.itemId);
       if (pIndex !== -1) {
         providers[pIndex].rating = Number(avg.toFixed(1));
         setItem('providers', providers);
       }
    }
  }

  // --- SOCIAL HUB (POSTS) ---
  async getPosts(): Promise<Post[]> {
    await delay();
    const posts = getItem<Post[]>('posts', []);
    return posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createPost(post: Post): Promise<void> {
    await delay();
    const posts = getItem<Post[]>('posts', []);
    posts.unshift(post);
    setItem('posts', posts);
  }

  async toggleLikePost(postId: string, userId: string): Promise<void> {
    await delay(100);
    const posts = getItem<Post[]>('posts', []);
    const post = posts.find(p => p.id === postId);
    if (post) {
      const hasLiked = post.likes.includes(userId);
      post.likes = hasLiked ? post.likes.filter(id => id !== userId) : [...post.likes, userId];
      setItem('posts', posts);
    }
  }

  async addComment(postId: string, comment: Comment): Promise<void> {
    await delay();
    const posts = getItem<Post[]>('posts', []);
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.comments = [...(post.comments || []), comment];
      setItem('posts', posts);
    }
  }

  // --- BOOKINGS ---
  async getBookings(): Promise<Booking[]> {
    await delay();
    const bookings = getItem<Booking[]>('bookings', []);
    return bookings.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
  
  async getUserBookings(userId: string): Promise<Booking[]> {
    await delay();
    const bookings = getItem<Booking[]>('bookings', []);
    return bookings.filter(b => b.userId === userId);
  }

  async createBooking(booking: Booking): Promise<void> {
    await delay();
    const bookings = getItem<Booking[]>('bookings', []);
    bookings.push(booking);
    setItem('bookings', bookings);
  }

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    await delay();
    const bookings = getItem<Booking[]>('bookings', []);
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.status = status;
      setItem('bookings', bookings);
    }
  }

  // --- USER MANAGEMENT ---
  async toggleSavedEvent(userId: string, eventId: string): Promise<void> {
    await delay(100);
    const users = getItem<User[]>('users', []);
    const user = users.find(u => u.id === userId);
    if (user) {
      const saved = user.savedEventIds || [];
      const isSaved = saved.includes(eventId);
      user.savedEventIds = isSaved ? saved.filter(id => id !== eventId) : [...saved, eventId];
      setItem('users', users);
    }
  }

  async getUser(userId: string): Promise<User | undefined> {
    await delay(100);
    const users = getItem<User[]>('users', []);
    return users.find(u => u.id === userId);
  }

  async getPendingProviders(): Promise<User[]> {
    await delay();
    const users = getItem<User[]>('users', []);
    return users.filter(u => u.providerStatus === 'pending' || u.providerStatus === 'payment_review');
  }

  // Stage 1: Admin approves profile, asks for payment
  async requestProviderPayment(userId: string): Promise<void> {
    await delay();
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].providerStatus = 'pending_payment';
      setItem('users', users);
    }
  }

  // Provider submits payment receipt
  async submitProviderPayment(userId: string, receiptUrl: string): Promise<void> {
      await delay();
      const users = getItem<User[]>('users', []);
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex !== -1) {
        users[userIndex].providerStatus = 'payment_review';
        users[userIndex].subscriptionReceipt = receiptUrl;
        setItem('users', users);
      }
  }

  // Stage 2: Admin final approval
  async approveProvider(userId: string): Promise<User | null> {
    await delay();
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].providerStatus = 'approved';
      setItem('users', users);

      // Create provider profile
      const providers = getItem<ServiceProvider[]>('providers', []);
      if (!providers.find(p => p.id === userId)) {
        const newProvider: ServiceProvider = {
          id: userId,
          name: users[userIndex].name,
          serviceType: 'Driver',
          description: 'Verified service provider',
          phone: '',
          rating: 5.0,
          // Use a reliable Unsplash image instead of Picsum which often breaks
          imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200', 
          isVerified: true
        };
        providers.push(newProvider);
        setItem('providers', providers);
      }
      return users[userIndex];
    }
    return null;
  }
  
  async rejectProvider(userId: string): Promise<void> {
    await delay();
    const users = getItem<User[]>('users', []);
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      users[userIndex].role = UserRole.USER;
      users[userIndex].providerStatus = 'rejected';
      setItem('users', users);
    }
  }

  async sendVerificationCode(email: string): Promise<boolean> {
    await delay();
    return true;
  }

  async verifyAndCreateUser(name: string, email: string, code: string, isProvider: boolean): Promise<User | null> {
    // Deprecated
    return null;
  }
}

export const db = new DatabaseService();
