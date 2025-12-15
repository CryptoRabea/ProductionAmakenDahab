# AmakenDahab - Production Deployment Guide

This guide will help you deploy AmakenDahab to production with Firebase and all security features properly configured.

## Prerequisites

1. **Node.js** (v20 or higher)
2. **Firebase Account** with billing enabled (for Cloud Functions)
3. **Gemini AI API Key** from Google AI Studio

## Step 1: Firebase Project Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `amakendahab-prod`
4. Enable Google Analytics (optional)
5. Create project

### 1.2 Enable Firebase Services

1. **Authentication**
   - Go to Build > Authentication
   - Click "Get Started"
   - Enable Email/Password provider
   - Enable Google provider (add OAuth client)
   - Enable Facebook provider (if needed)

2. **Firestore Database**
   - Go to Build > Firestore Database
   - Click "Create Database"
   - Choose production mode
   - Select location (closest to your users)

3. **Storage**
   - Go to Build > Storage
   - Click "Get Started"
   - Use default security rules for now (we'll update them)

4. **Hosting** (optional)
   - Go to Build > Hosting
   - Click "Get Started"

## Step 2: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init
```

Select:
- ✅ Firestore (configure rules)
- ✅ Functions (JavaScript)
- ✅ Storage (configure rules)
- ✅ Hosting (optional)

## Step 3: Configure Environment Variables

### 3.1 Frontend Environment (.env)

Create `.env` file in project root:

```env
# Firebase Configuration (from Firebase Console > Project Settings)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Cloud Function URL (after deploying functions)
VITE_CLOUD_FUNCTION_URL=https://us-central1-your-project.cloudfunctions.net/dahabConciergeHttp
```

### 3.2 Cloud Functions Environment

Set Gemini API key for Cloud Functions:

```bash
cd functions
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

Or use `.env` file in functions directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## Step 4: Deploy Firestore Security Rules

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

Verify rules are active in Firebase Console.

## Step 5: Deploy Cloud Functions

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

After deployment, copy the function URL and add it to your `.env` file as `VITE_CLOUD_FUNCTION_URL`.

## Step 6: Build Frontend

```bash
# Install dependencies
npm install

# Build for production
npm run build
```

The production build will be in the `dist` directory.

## Step 7: Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

Your app will be live at: `https://your-project.firebaseapp.com`

## Step 8: Initialize Database

### 8.1 Create Admin User

1. Go to Firebase Console > Authentication
2. Add a new user with email/password
3. Note the User UID
4. Go to Firestore Database
5. Create collection: `users`
6. Add document with UID as ID:

```json
{
  "id": "user_uid_here",
  "name": "Admin User",
  "email": "admin@yourdomain.com",
  "role": "admin",
  "savedEventIds": []
}
```

### 8.2 Initialize Settings

Create collection: `settings`
Document ID: `app`

```json
{
  "appName": "AmakenDahab",
  "logoUrl": "https://cdn-icons-png.flaticon.com/512/1042/1042390.png",
  "heroImages": [
    "https://images.unsplash.com/photo-1544550581-5f7ceaf7f992?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1920&auto=format&fit=crop"
  ],
  "backgroundStyle": "linear-gradient(to bottom, #0f172a, #1e293b)",
  "contentOverrides": {}
}
```

## Step 9: Seed Sample Data (Optional)

Create some sample events in Firestore:

Collection: `events`

```json
{
  "id": "event1",
  "title": "Blue Hole Diving",
  "description": "Experience the legendary Blue Hole",
  "date": "2025-12-20",
  "time": "09:00 AM",
  "location": "Blue Hole",
  "price": 450,
  "imageUrl": "https://images.unsplash.com/photo-1582967788606-a171f1080ca8?auto=format&fit=crop&q=80&w=1000",
  "category": "Diving",
  "organizerId": "admin1",
  "status": "approved",
  "isFeatured": true
}
```

## Step 10: Testing

### Test Authentication

1. Try email/password signup
2. Try Google login
3. Test provider registration flow

### Test Events

1. Create event as admin
2. Book event as user
3. Verify payment flow

### Test AI Concierge

1. Open AI chat
2. Ask questions about Dahab
3. Verify responses

## Step 11: Custom Domain (Optional)

1. Go to Firebase Hosting > Add Custom Domain
2. Follow instructions to verify domain
3. SSL certificate will be auto-provisioned

## Monitoring & Maintenance

### Firebase Console

- Monitor Authentication users
- Check Firestore usage
- Review Cloud Function logs
- Monitor Storage usage

### Error Tracking

Consider adding:
- Sentry for error tracking
- Google Analytics for user analytics
- Firebase Performance Monitoring

## Cost Optimization

### Free Tier Limits

- Firestore: 50K reads, 20K writes, 20K deletes per day
- Cloud Functions: 2M invocations per month
- Storage: 5 GB
- Hosting: 10 GB transfer per month

### Tips

1. Enable caching on Firebase Hosting
2. Optimize images before upload
3. Use Firestore query limits
4. Monitor function execution time
5. Set up billing alerts

## Security Checklist

- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed
- [ ] API keys properly configured
- [ ] Cloud Functions using environment variables
- [ ] Admin user created with strong password
- [ ] SSL certificate active
- [ ] Authentication providers properly configured
- [ ] Test all user roles (user, provider, admin)

## Troubleshooting

### Build Fails

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Functions Not Working

```bash
cd functions
npm run build
firebase deploy --only functions
```

### Firestore Permission Denied

- Check security rules are deployed
- Verify user is authenticated
- Check user role in Firestore

## Support

For issues, check:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

## Production Checklist

- [ ] Environment variables configured
- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created
- [ ] Storage configured
- [ ] Security rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend built and deployed
- [ ] Admin user created
- [ ] Sample data seeded
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Cost alerts enabled
