/**
 * Unified Database Service
 *
 * This service provides a single interface for database operations.
 * It uses Firestore when Firebase is configured, and falls back to
 * localStorage-based mock database for development without Firebase.
 */

import { isFirebaseConfigured } from './firebase';
import { firestoreDb } from './firestoreDatabase';
import { db as mockDb } from './mockDatabase';

// Export the appropriate database instance based on Firebase configuration
export const db = isFirebaseConfigured ? firestoreDb : mockDb;

// Log which database is being used
if (isFirebaseConfigured) {
  console.log('🔥 Using Firebase Firestore for database operations');
} else {
  console.log('💾 Using localStorage mock database (development mode)');
  console.log('ℹ️  Configure Firebase to use production database');
}
