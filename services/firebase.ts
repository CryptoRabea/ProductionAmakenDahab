import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate that Firebase config is present
const isFirebaseConfigured = Object.values(firebaseConfig).every(
  value => value !== undefined && value !== ''
);

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;
let facebookProvider: FacebookAuthProvider;

if (isFirebaseConfigured) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize services
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Configure auth providers
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account'
    });

    facebookProvider = new FacebookAuthProvider();

    console.log('✅ Firebase initialized successfully');
    console.log('📦 Firebase Project ID:', firebaseConfig.projectId);
  } catch (error: any) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('Please check your Firebase configuration in .env file');
    throw new Error(`Firebase initialization error: ${error.message}`);
  }
} else {
  console.error('❌ Firebase configuration incomplete. Please set environment variables.');
  console.error('Required variables: VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, etc.');
  console.error('See .env.example for template');
  console.error('Create a .env file with your Firebase credentials to enable authentication.');

  // Provide mock objects for development without Firebase
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  googleProvider = {} as GoogleAuthProvider;
  facebookProvider = {} as FacebookAuthProvider;
}

export { app, auth, db, storage, googleProvider, facebookProvider, isFirebaseConfigured };
