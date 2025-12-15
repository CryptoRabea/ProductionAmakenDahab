// This file mocks the Firebase services to allow the application to run without the firebase dependency installed.
// Real Firebase initialization has been removed to fix "Module not found" errors in the current environment.

export const auth = {} as any;
export const googleProvider = {} as any;
export const dbFirestore = {} as any;
export const storage = {} as any;

// Mock functions in case they are imported directly (though mockDatabase.ts refactor should remove the need for these)
export const initializeApp = () => {};
export const getAuth = () => {};
export const getFirestore = () => {};
export const getStorage = () => {};