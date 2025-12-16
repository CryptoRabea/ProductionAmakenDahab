/**
 * Authentication Service with Firebase Auth
 * - Strong password requirements
 * - Email verification
 * - Role-based access control
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification,
  User as FirebaseUser,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from './firebase';
import { User, UserRole } from '../types';

// Mock Admin User for immediate testing (bypasses email verification)
const MOCK_ADMIN = {
  email: 'Rahma@organizer.com',
  password: 'Organizer@2024!',
  user: {
    id: 'mock-admin-rahma',
    name: 'Rahma - Event Organizer',
    email: 'Rahma@organizer.com',
    role: UserRole.ADMIN,
    isEmailVerified: true,
    provider: 'mock',
    savedEventIds: []
  } as User
};

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true
};

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Create user document in Firestore
 */
async function createUserDocument(
  firebaseUser: FirebaseUser,
  name: string,
  role: UserRole = UserRole.USER,
  isProvider: boolean = false
): Promise<User> {
  console.log('💾 Creating user document for:', { uid: firebaseUser.uid, name, role, isProvider });

  if (!firebaseUser.email) {
    console.error('❌ Firebase user has no email');
    throw new Error('User email is required but not found.');
  }

  const user: User = {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email,
    role,
    isEmailVerified: firebaseUser.emailVerified,
    provider: firebaseUser.providerData[0]?.providerId || 'email',
    savedEventIds: []
  };

  // Only add providerStatus if user is registering as a provider
  if (isProvider) {
    user.providerStatus = 'pending';
    console.log('✅ User registered as provider, status set to pending');
  }

  try {
    console.log('📝 Writing to Firestore...');
    await setDoc(doc(db, 'users', firebaseUser.uid), user);
    console.log('✅ User document saved to Firestore');
  } catch (error: any) {
    console.error('❌ Failed to save user document to Firestore:', error);
    throw new Error(`Failed to save user profile: ${error.message}`);
  }

  return user;
}

/**
 * Get user document from Firestore
 */
async function getUserDocument(uid: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) return null;
  return userDoc.data() as User;
}

/**
 * Register new user with email and password
 */
export async function registerWithEmail(
  name: string,
  email: string,
  password: string,
  isProvider: boolean = false
): Promise<{ user: User; needsVerification: boolean }> {
  console.log('🔵 Registration attempt:', { name, email, isProvider });

  // Validate inputs
  if (!name || !email || !password) {
    console.error('❌ Missing required fields');
    throw new Error('Please provide name, email, and password.');
  }

  if (name.trim().length < 2) {
    throw new Error('Name must be at least 2 characters long.');
  }

  // Validate password
  const validation = validatePassword(password);
  if (!validation.valid) {
    console.error('❌ Password validation failed:', validation.errors);
    throw new Error(validation.errors.join('. '));
  }

  try {
    console.log('📝 Creating Firebase Auth user...');
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('✅ Firebase Auth user created:', firebaseUser.uid);

    // Update display name
    console.log('📝 Updating display name...');
    await updateProfile(firebaseUser, { displayName: name });
    console.log('✅ Display name updated');

    // Send email verification
    console.log('📧 Sending verification email...');
    await sendEmailVerification(firebaseUser);
    console.log('✅ Verification email sent');

    // Create user document in Firestore
    console.log('💾 Creating Firestore user document...');
    const user = await createUserDocument(firebaseUser, name, UserRole.USER, isProvider);
    console.log('✅ Firestore user document created:', user.id);

    return {
      user,
      needsVerification: true
    };
  } catch (error: any) {
    console.error('❌ Registration error:', error);

    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.message?.includes('Firebase') || error.code?.startsWith('auth/')) {
      throw new Error(`Firebase error: ${error.message}`);
    } else if (error.message?.includes('Firestore') || error.code?.startsWith('firestore/')) {
      throw new Error(`Database error: ${error.message}. User account created but profile not saved.`);
    } else {
      throw new Error(error.message || 'Registration failed. Please try again.');
    }
  }
}

/**
 * Login with email and password
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<User> {
  console.log('🔍 Login attempt:', email.toLowerCase());

  // Validate inputs
  if (!email || !password) {
    console.error('❌ Missing email or password');
    throw new Error('Please provide both email and password.');
  }

  // Check for mock admin user (for immediate testing without Firebase setup)
  // Case-insensitive email comparison
  if (email.toLowerCase() === MOCK_ADMIN.email.toLowerCase()) {
    console.log('📧 Email matches mock admin');
    if (password === MOCK_ADMIN.password) {
      console.log('✅ Mock admin login successful:', MOCK_ADMIN.user.name);
      return MOCK_ADMIN.user;
    } else {
      console.log('❌ Password incorrect for mock admin');
      console.log('Expected:', MOCK_ADMIN.password);
      console.log('Received:', password);
      throw new Error('Invalid email or password. (Hint: Password is case-sensitive)');
    }
  }

  try {
    console.log('🔐 Attempting Firebase authentication...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('✅ Firebase authentication successful:', firebaseUser.uid);

    // Check if email is verified (DISABLED FOR TESTING)
    // TODO: Re-enable email verification before production deployment
    // if (!firebaseUser.emailVerified) {
    //   console.log('⚠️ Email not verified for user:', firebaseUser.uid);
    //   throw new Error('EMAIL_NOT_VERIFIED');
    // }
    console.log('⚠️ Email verification check disabled for testing');

    // Get user document from Firestore
    console.log('📖 Fetching user document from Firestore...');
    let user = await getUserDocument(firebaseUser.uid);

    // Create user document if it doesn't exist (for legacy users)
    if (!user) {
      console.log('⚠️ User document not found, creating new one...');
      user = await createUserDocument(
        firebaseUser,
        firebaseUser.displayName || 'User',
        UserRole.USER
      );
      console.log('✅ User document created');
    } else {
      console.log('✅ User document found:', user.name);
      // Update email verification status
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        isEmailVerified: true
      });
      user.isEmailVerified = true;
    }

    console.log('✅ Login successful');
    return user;
  } catch (error: any) {
    console.error('❌ Login error:', error);

    if (error.message === 'EMAIL_NOT_VERIFIED') {
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your internet connection.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    } else {
      throw new Error(error.message || 'Login failed. Please try again.');
    }
  }
}

/**
 * Login with Google
 */
export async function loginWithGoogle(): Promise<User> {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const firebaseUser = userCredential.user;

    // Get or create user document
    let user = await getUserDocument(firebaseUser.uid);

    if (!user) {
      user = await createUserDocument(
        firebaseUser,
        firebaseUser.displayName || 'Google User',
        UserRole.USER
      );
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login cancelled.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    } else {
      throw new Error(error.message || 'Google login failed. Please try again.');
    }
  }
}

/**
 * Login with Facebook
 */
export async function loginWithFacebook(): Promise<User> {
  try {
    const userCredential = await signInWithPopup(auth, facebookProvider);
    const firebaseUser = userCredential.user;

    // Get or create user document
    let user = await getUserDocument(firebaseUser.uid);

    if (!user) {
      user = await createUserDocument(
        firebaseUser,
        firebaseUser.displayName || 'Facebook User',
        UserRole.USER
      );
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Login cancelled.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site.');
    } else {
      throw new Error(error.message || 'Facebook login failed. Please try again.');
    }
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  await firebaseSignOut(auth);
}

/**
 * Resend verification email
 */
export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No user logged in');
  }

  if (user.emailVerified) {
    throw new Error('Email already verified');
  }

  await sendEmailVerification(user);
}

/**
 * Check if user is admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
  const user = await getUserDocument(uid);
  return user?.role === UserRole.ADMIN;
}

/**
 * Promote user to admin (admin only)
 */
export async function promoteToAdmin(uid: string, currentUserRole: UserRole): Promise<void> {
  if (currentUserRole !== UserRole.ADMIN) {
    throw new Error('Only admins can promote users');
  }

  await updateDoc(doc(db, 'users', uid), {
    role: UserRole.ADMIN
  });
}

/**
 * Get current user
 */
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}
