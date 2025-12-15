# 🔥 Firebase Setup Guide - Step by Step

## 📋 **What You Need to Do**

### **Part 1: Download google-services.json (Android)**

1. **In Firebase Console** (where you are now in the screenshots):
   - Scroll down on the Android app settings page
   - Click **"Download google-services.json"**
   - Save the file

2. **Place the file in your project**:
   ```
   android/app/google-services.json
   ```

3. **Commit it to Git** (this file is NOT secret):
   ```bash
   git add android/app/google-services.json
   git commit -m "Add Firebase google-services.json for Android"
   git push
   ```

---

### **Part 2: Get Your Firebase Web Config**

1. **In Firebase Console**:
   - Click the **Settings gear** ⚙️ → **Project settings**
   - Scroll down to "Your apps" section
   - Look for the **Web app** (globe icon 🌐)
   - If you don't have a web app, click **"Add app"** → Select **Web** (</>) icon

2. **You'll see something like this**:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyD...",
     authDomain: "amakendahab-default-rtdb.firebaseapp.com",
     projectId: "amakendahab",
     storageBucket: "amakendahab.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456",
     measurementId: "G-XXXXXXXXXX"
   };
   ```

3. **Copy these values** - you'll need them for Step 3!

---

### **Part 3: Create Your .env File**

1. **Copy the example file**:
   ```bash
   cp .env.example .env
   ```

2. **Open `.env` file** and fill in your Firebase values:

```bash
# Firebase Configuration (from Firebase Console → Web App Config)
VITE_FIREBASE_API_KEY=AIzaSyD...your_actual_api_key
VITE_FIREBASE_AUTH_DOMAIN=amakendahab-default-rtdb.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amakendahab
VITE_FIREBASE_STORAGE_BUCKET=amakendahab.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# Gemini AI API Key (for Cloud Functions - NOT for client-side)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloud Function URL (after deployment)
VITE_CLOUD_FUNCTION_URL=https://your-region-your-project.cloudfunctions.net/dahabConcierge
```

3. **Save the file**

4. **IMPORTANT**: The `.env` file is already in `.gitignore`, so it won't be committed to Git (this is good for security!)

---

### **Part 4: Update Android Gradle Files**

Based on your Firebase screenshot, you need to add the Google services plugin:

#### **4.1: Update Project-level build.gradle**

Open: `android/build.gradle`

Add this to the `plugins` section (if not already there):

```gradle
plugins {
    // ... existing plugins

    // Add the dependency for the Google services Gradle plugin
    id("com.google.gms.google-services") version "4.4.4" apply false
}
```

#### **4.2: Your app/build.gradle is Already Configured!**

Looking at the system reminder, your `android/app/build.gradle` already has:
```gradle
try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found...")
}
```

This means once you add `google-services.json`, it will automatically work! ✅

---

### **Part 5: Add SHA Fingerprints to Firebase**

**You already have these from earlier!**

1. **In Firebase Console**:
   - Project Settings → Your Android app
   - Click **"Add fingerprint"**

2. **Add your SHA-1**:
   ```
   F3:24:B2:99:59:31:8B:4E:DD:A6:A1:68:3D:84:7E:96:46:43:A0:50
   ```

3. **Add your SHA-256**:
   ```
   C3:1D:1D:1D:E5:22:EE:D3:A9:E8:B2:DC:31:B4:B5:1E:0D:B9:43:89:A5:CD:E0:AC:A8:DC:39:43:E2:69:5B:C0
   ```

4. **Click Save**

---

## 🎯 **Quick Checklist**

- [ ] Download `google-services.json` from Firebase
- [ ] Place it in `android/app/google-services.json`
- [ ] Get Firebase Web Config from Firebase Console
- [ ] Copy `.env.example` to `.env`
- [ ] Fill in all `VITE_FIREBASE_*` values in `.env`
- [ ] Add SHA-1 and SHA-256 fingerprints to Firebase
- [ ] Update `android/build.gradle` with Google services plugin
- [ ] Test your app!

---

## 📝 **Example: Where to Find Each Value**

| .env Variable | Where to Find It |
|---------------|------------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Web app config → `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Console → Web app config → `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Web app config → `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Web app config → `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console → Web app config → `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Firebase Console → Web app config → `appId` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Console → Web app config → `measurementId` |
| `GEMINI_API_KEY` | Google AI Studio → Create API Key |

---

## 🔒 **Security Notes**

**Safe to commit:**
- ✅ `google-services.json` (Android config)
- ✅ `android/build.gradle`
- ✅ `.env.example` (template only)

**NEVER commit:**
- ❌ `.env` (already in .gitignore)
- ❌ `*.keystore` files (already in .gitignore)
- ❌ `key.properties` (already in .gitignore)

---

## 🚀 **After Setup, Test It!**

```bash
# 1. Build web app
npm run build

# 2. Sync with Android
npx cap sync android

# 3. Run on device/emulator
cd android
./gradlew installDebug
```

---

## 🆘 **Troubleshooting**

### Error: "Firebase config not found"
- Make sure `.env` file exists in project root
- Restart your dev server: `npm run dev`

### Error: "google-services.json not found"
- Verify file is in `android/app/google-services.json`
- File name must be exactly `google-services.json`

### Error: "SHA certificate fingerprints don't match"
- Make sure you added both SHA-1 and SHA-256 to Firebase
- Verify you're using the correct keystore

---

**Need help?** Check the screenshots you sent and follow the Firebase instructions there!
