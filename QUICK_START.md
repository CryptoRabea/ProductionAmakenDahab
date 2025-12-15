# Quick Start Guide

## 🚀 Development (No Firebase Required)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# App runs at http://localhost:5173
```

The app will work with localStorage database automatically. Great for local development!

## 🔥 Production (With Firebase)

### Step 1: Create Firebase Project
1. Go to https://console.firebase.google.com/
2. Create new project: "amakendahab-prod"
3. Enable Authentication, Firestore, Storage

### Step 2: Get Firebase Config
1. Project Settings > General
2. Add web app
3. Copy config values

### Step 3: Create .env File
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Step 4: Deploy Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init

# Deploy security rules
firebase deploy --only firestore:rules,storage:rules

# Deploy Cloud Functions
cd functions
npm install
cd ..
firebase deploy --only functions

# Copy function URL and add to .env
VITE_CLOUD_FUNCTION_URL=https://...cloudfunctions.net/dahabConciergeHttp
```

### Step 5: Build & Deploy

```bash
# Build
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## 📝 Key Features

### ✅ Fixed Security Issues
- API keys secured in Cloud Functions
- Firebase Authentication implemented
- Input sanitization (XSS prevention)
- Firestore security rules
- No sensitive data in client code

### ✅ Performance Optimizations
- Code splitting & lazy loading
- TailwindCSS properly compiled
- Optimized bundle size
- Production build successful

### ✅ Code Quality
- TypeScript types fixed
- Error boundaries added
- Professional error handling
- Comprehensive documentation

## 🎯 What Works Now

### Without Firebase (Development)
- ✅ All UI components
- ✅ Authentication (localStorage)
- ✅ Event management (localStorage)
- ✅ Booking system (localStorage)
- ✅ Admin dashboard (localStorage)

### With Firebase (Production)
- ✅ Real authentication (Email, Google, Facebook)
- ✅ Firestore database
- ✅ File uploads to Storage
- ✅ Secure AI chatbot
- ✅ Role-based access control
- ✅ Real-time updates

## 📚 Documentation

- `PRODUCTION_READY_SUMMARY.md` - Complete overview
- `DEPLOYMENT.md` - Detailed deployment guide
- `CODE_REVIEW.md` - Original code review
- `.env.example` - Environment variable template

## 🐛 Troubleshooting

### Build fails?
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Firebase errors?
- Check `.env` file has correct values
- Ensure Firebase services are enabled
- Verify security rules are deployed

### TypeScript errors?
```bash
npm run lint
```

## 🎨 Admin Access

Create admin user in Firestore:
```
Collection: users
Document ID: [your-user-auth-uid]
{
  "id": "auth-uid-here",
  "name": "Admin",
  "email": "admin@example.com",
  "role": "admin",
  "savedEventIds": []
}
```

## 🔑 Test Accounts

Development mode (no Firebase):
- Email: `admin@dahab.com` (any password) - Admin access
- Any other email - Regular user

## 📞 Support

- Issues: Check `DEPLOYMENT.md`
- Architecture: See `PRODUCTION_READY_SUMMARY.md`
- Code review: Read `CODE_REVIEW.md`

## ✨ Status

**✅ PRODUCTION READY**

All critical security issues fixed and tested. Ready to deploy to Firebase!
