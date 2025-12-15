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
  const user: User = {
    id: firebaseUser.uid,
    name,
    email: firebaseUser.email!,
    role,
    isEmailVerified: firebaseUser.emailVerified,
    provider: firebaseUser.providerData[0]?.providerId || 'email',
    savedEventIds: [],
    providerStatus: isProvider ? 'pending' : undefined
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), user);
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
  // Validate password
  const validation = validatePassword(password);
  if (!validation.valid) {
    throw new Error(validation.errors.join('. '));
  }

  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update display name
    await updateProfile(firebaseUser, { displayName: name });

    // Send email verification
    await sendEmailVerification(firebaseUser);

    // Create user document in Firestore
    const user = await createUserDocument(firebaseUser, name, UserRole.USER, isProvider);

    return {
      user,
      needsVerification: true
    };
  } catch (error: any) {
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('This email is already registered. Please login instead.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a stronger password.');
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
  // Check for mock admin user (for immediate testing without Firebase setup)
  // Case-insensitive email comparison
  if (email.toLowerCase() === MOCK_ADMIN.email.toLowerCase() && password === MOCK_ADMIN.password) {
    console.log('✅ Mock admin login successful:', MOCK_ADMIN.user.name);
    return MOCK_ADMIN.user;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      throw new Error('EMAIL_NOT_VERIFIED');
    }

    // Get user document from Firestore
    let user = await getUserDocument(firebaseUser.uid);

    // Create user document if it doesn't exist (for legacy users)
    if (!user) {
      user = await createUserDocument(
        firebaseUser,
        firebaseUser.displayName || 'User',
        UserRole.USER
      );
    } else {
      // Update email verification status
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        isEmailVerified: true
      });
      user.isEmailVerified = true;
    }

    return user;
  } catch (error: any) {
    if (error.message === 'EMAIL_NOT_VERIFIED') {
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      throw new Error('Invalid email or password.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed login attempts. Please try again later.');
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
