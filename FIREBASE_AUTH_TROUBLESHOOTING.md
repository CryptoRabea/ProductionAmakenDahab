# Firebase Auth Error Troubleshooting Guide

## Error: `Firebase: Error (auth/internal-error)`

This error typically occurs when Firebase Authentication is not properly configured or there's a connectivity issue.

## Fixes Applied

### 1. ✅ Added Missing `databaseURL` to Firebase Config
- Updated `services/firebase.ts` to include `databaseURL` in the Firebase configuration
- This is required for Firebase Realtime Database integration

### 2. ✅ Fixed Environment Variable Naming
- Changed `GEMINI_API_KEY` to `VITE_GEMINI_API_KEY` in `.env`
- Vite requires all client-side env variables to be prefixed with `VITE_`

### 3. ✅ Enhanced Error Handling
- Added comprehensive error handling in `services/auth.ts`
- Added Firebase configuration validation checks
- Added detailed error messages for troubleshooting

## How to Resolve the Error

### Step 1: Verify Firebase Console Settings

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **amakendahab**
3. Navigate to **Authentication** → **Sign-in method**
4. Ensure these providers are **ENABLED**:
   - ✅ Email/Password
   - ✅ Google (optional)
   - ✅ Facebook (optional)

### Step 2: Check Your `.env` File

Ensure your `.env` file has all required variables:

```env
VITE_FIREBASE_API_KEY=AIzaSyBnR_11fhP0NrfXuupRDYTidy5NZkYBGN8
VITE_FIREBASE_AUTH_DOMAIN=amakendahab.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://amakendahab-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=amakendahab
VITE_FIREBASE_STORAGE_BUCKET=amakendahab.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=227241553128
VITE_FIREBASE_APP_ID=1:227241553128:web:0b0fe4939299f97ca9ad5d
VITE_FIREBASE_MEASUREMENT_ID=G-VCBR1CXKF4
```

### Step 3: Restart Development Server

After making changes to `.env`, you **must** restart the dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

⚠️ **Important**: Environment variables are loaded at build time. Any changes to `.env` require a restart.

### Step 4: Clear Browser Cache

1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Clear site data**
4. Refresh the page

### Step 5: Check Browser Console

Open DevTools console and look for:
- ✅ "Firebase initialized successfully"
- ✅ Firebase Project ID logged
- ❌ Any error messages about Firebase config

## Testing Login

### Test with Mock Admin (No Firebase Required)

You can test login immediately with the mock admin account:

```
Email: Rahma@organizer.com
Password: Organizer@2024!
```

This bypasses Firebase and lets you test the app's functionality.

### Test with Firebase Authentication

Create a new account:
1. Go to Login page
2. Click "Sign Up"
3. Fill in:
   - Name: Your Name
   - Email: your@email.com
   - Password: Must meet requirements (8+ chars, uppercase, lowercase, number, special char)
4. Check your email for verification link (optional for testing)
5. Login with your credentials

## Common Issues

### Issue: "Firebase not configured" error

**Solution**:
- Check that all `VITE_FIREBASE_*` variables are set in `.env`
- Restart dev server after adding/changing environment variables

### Issue: "Network error" or CORS issues

**Solution**:
1. Check your internet connection
2. Verify Firebase project is active in Firebase Console
3. Check that your domain is authorized in Firebase Console:
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Add `localhost` and your deployed domain

### Issue: "Authentication service not available"

**Solution**:
- This means Firebase Auth failed to initialize
- Check browser console for detailed error messages
- Verify Firebase credentials in `.env` are correct
- Try copying credentials fresh from Firebase Console

## Firebase Console Links

- **Project Overview**: https://console.firebase.google.com/project/amakendahab
- **Authentication**: https://console.firebase.google.com/project/amakendahab/authentication
- **Firestore Database**: https://console.firebase.google.com/project/amakendahab/firestore

## Getting Fresh Firebase Credentials

If you need to regenerate your Firebase config:

1. Go to Firebase Console → Project Settings (⚙️ icon)
2. Scroll to "Your apps"
3. Click on your web app or add a new one
4. Copy the config object values to your `.env` file

## Still Having Issues?

If the error persists after trying all steps:

1. Check the browser console for detailed error logs
2. All error messages now include specific codes (auth/internal-error, etc.)
3. Share the full error message for more targeted help

---

**Last Updated**: December 2024
**Firebase Project**: amakendahab
