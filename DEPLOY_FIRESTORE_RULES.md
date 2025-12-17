# 🔒 Deploy Firestore Security Rules

## Quick Fix for Permission Errors

You're seeing Firestore permission errors because the security rules haven't been deployed yet. Here's how to fix it:

### Option 1: Deploy via Firebase Console (Recommended - Easiest)

1. **Open the Firestore Rules page:**
   - Go to: https://console.firebase.google.com/project/amakendahab/firestore/rules

2. **Copy and paste the rules:**
   ```
   rules_version='2'

   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         // This rule allows anyone with your database reference to view, edit,
         // and delete all data in your database. It is useful for getting
         // started, but it is configured to expire after 30 days because it
         // leaves your app open to attackers. At that time, all client
         // requests to your database will be denied.
         //
         // Make sure to write security rules for your app before that time, or
         // else all client requests to your database will be denied until you
         // update your rules.
         allow read, write: if request.time < timestamp.date(2026, 1, 14);
       }
     }
   }
   ```

3. **Click "Publish"** button

4. **Refresh your website** - the permission errors should be gone!

---

### Option 2: Deploy via Firebase CLI

If you prefer using the command line:

1. **Install Firebase Tools (if not already installed):**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Deploy the rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## What These Rules Do

The current rules allow:
- ✅ **Public read access** to all collections (so users can view events, settings, etc.)
- ✅ **Public write access** (for now - you'll want to make this more restrictive later)
- ⏰ **Expires on:** January 14, 2026

## ⚠️ Important: Before Production

These rules are **very permissive** and good for development, but you should update them before going to production. Here's a more secure example:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read-only access to approved events
    match /events/{eventId} {
      allow read: if resource.data.status == 'approved';
      allow write: if request.auth != null && (
        request.auth.token.role == 'admin' ||
        request.auth.token.role == 'provider'
      );
    }

    // Public read access to settings
    match /settings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // Public read access to approved providers
    match /serviceProviders/{providerId} {
      allow read: if true;
      allow write: if request.auth != null && (
        request.auth.uid == providerId ||
        request.auth.token.role == 'admin'
      );
    }

    // Users can only read/write their own data
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Reviews require authentication
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }
  }
}
```

---

## Troubleshooting

### Still seeing permission errors after deploying?

1. **Hard refresh the browser:** Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear browser cache**
3. **Check the rules were deployed:**
   - Go to Firebase Console > Firestore Database > Rules
   - Verify the rules match what you deployed
   - Check the "Last modified" timestamp

### Rules deployed but still not working?

- Make sure your Firebase project is `amakendahab`
- Check that the Firestore database has been created (not just enabled)
- Verify your app is connected to the correct Firebase project

---

**That's it!** Once you deploy these rules, all the Firestore permission errors will be resolved. 🎉
