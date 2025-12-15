# 📱 Android Build Guide - AmakenDahab

## 🔐 Your Firebase SHA Fingerprints

**Use these fingerprints to configure Firebase:**

### **SHA-1:**
```
F3:24:B2:99:59:31:8B:4E:DD:A6:A1:68:3D:84:7E:96:46:43:A0:50
```

### **SHA-256:**
```
C3:1D:1D:1D:E5:22:EE:D3:A9:E8:B2:DC:31:B4:B5:1E:0D:B9:43:89:A5:CD:E0:AC:A8:DC:39:43:E2:69:5B:C0
```

---

## 🔑 Step 1: Create Your Keystore

**IMPORTANT: Run this on your local machine!**

```bash
cd android/app

keytool -genkeypair \
  -v \
  -storetype PKCS12 \
  -keystore amakendahab-release-key.keystore \
  -alias amakendahab \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass "AmakenDahab2024!" \
  -keypass "AmakenDahab2024!" \
  -dname "CN=AmakenDahab, OU=Development, O=AmakenDahab, L=Dahab, ST=South Sinai, C=EG"
```

### Verify keystore was created:
```bash
ls -lh android/app/*.keystore
```

### Get your fingerprints (to verify they match):
```bash
keytool -list -v \
  -keystore android/app/amakendahab-release-key.keystore \
  -alias amakendahab \
  -storepass "AmakenDahab2024!" | grep -E "(SHA1:|SHA256:)"
```

---

## 🔥 Step 2: Configure Firebase

### Add Fingerprints to Firebase:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **AmakenDahab** project
3. Click ⚙️ → **Project settings**
4. Scroll to "Your apps" section
5. Find or add Android app: `com.amakendahab.app`
6. Click **"Add fingerprint"** and add both:
   - **SHA-1:** `F3:24:B2:99:59:31:8B:4E:DD:A6:A1:68:3D:84:7E:96:46:43:A0:50`
   - **SHA-256:** `C3:1D:1D:1D:E5:22:EE:D3:A9:E8:B2:DC:31:B4:B5:1E:0D:B9:43:89:A5:CD:E0:AC:A8:DC:39:43:E2:69:5B:C0`

### Download google-services.json:

7. Download **google-services.json** from Firebase
8. Save it to: `android/app/google-services.json`
9. Commit it to your repository (it's not sensitive)

---

## 📦 Step 3: Build Your App

### Prerequisites:
- ✅ Java JDK 11+ installed
- ✅ Android SDK installed
- ✅ Keystore created (Step 1)
- ✅ Internet connection

### Build APK (for testing):
```bash
# Build web app first
npm run build

# Sync with Capacitor
npx cap sync android

# Build signed APK
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

### Build AAB (for Google Play):
```bash
# Build web app first
npm run build

# Sync with Capacitor
npx cap sync android

# Build signed AAB
cd android
./gradlew bundleRelease
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 Step 4: Test Your APK

### Method 1: Install on Connected Device
```bash
cd android
./gradlew installRelease
```

### Method 2: Transfer APK File
1. Find APK: `android/app/build/outputs/apk/release/app-release.apk`
2. Transfer to phone (USB, email, Google Drive)
3. Enable "Install from Unknown Sources"
4. Tap APK to install

---

## 🏪 Step 5: Publish to Google Play

### What you need:
- ✅ Google Play Developer account ($25)
- ✅ AAB file from Step 3
- ✅ App screenshots (at least 2)
- ✅ App icon (512x512 PNG)
- ✅ Feature graphic (1024x500)

### Upload to Play Store:

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in:
   - **App name:** AmakenDahab
   - **Package name:** com.amakendahab.app
   - **Category:** Travel & Local
4. Upload AAB: `android/app/build/outputs/bundle/release/app-release.aab`
5. Add screenshots and descriptions
6. Submit for review (takes 1-3 days)

---

## 🔄 Updating Your App

When you make changes:

```bash
# 1. Update code
# ... make your changes ...

# 2. Build web app
npm run build

# 3. Sync with Android
npx cap sync android

# 4. Update version in android/app/build.gradle
# Change: versionCode 1 -> versionCode 2
# Change: versionName "1.0" -> versionName "1.1"

# 5. Build new release
cd android
./gradlew bundleRelease

# 6. Upload new AAB to Play Store
```

---

## 🔧 Troubleshooting

### Error: "SDK location not found"

Create `android/local.properties`:
```properties
sdk.dir=/path/to/android/sdk
```

**Examples:**
- Windows: `C:\\Users\\YourName\\AppData\\Local\\Android\\sdk`
- Mac: `/Users/YourName/Library/Android/sdk`
- Linux: `/home/YourName/Android/sdk`

### Error: "Keystore not found"

Make sure you created the keystore in `android/app/` directory (Step 1).

### Error: "Build failed"

Clean and rebuild:
```bash
cd android
./gradlew clean
./gradlew assembleRelease
```

---

## 📋 App Configuration

**Configured in:** `android/app/build.gradle`

```
App ID: com.amakendahab.app
App Name: AmakenDahab
Version Code: 1
Version Name: 1.0
Min SDK: 22 (Android 5.1)
Target SDK: 34 (Android 14)
```

**Signing Configuration:**
- Keystore: `android/app/amakendahab-release-key.keystore`
- Properties: `android/key.properties`
- Alias: amakendahab

---

## ⚠️ Security Checklist

- [ ] Keystore backed up in safe location
- [ ] Passwords stored securely (password manager)
- [ ] `android/.gitignore` contains `*.keystore` and `key.properties`
- [ ] Never commit keystore to Git
- [ ] Never share keystore publicly

**Backup locations:**
- Google Drive (private folder)
- Password manager (1Password, LastPass)
- Encrypted USB drive
- Secure cloud storage

---

## 📊 File Locations

```
android/
├── app/
│   ├── build.gradle                 ✅ Signing config
│   ├── google-services.json         ✅ Add this from Firebase
│   ├── amakendahab-release-key.keystore  ⚠️ CREATE & BACKUP
│   └── build/outputs/
│       ├── apk/release/
│       │   └── app-release.apk      📱 Install file
│       └── bundle/release/
│           └── app-release.aab      🏪 Play Store file
├── key.properties                   ⚠️ SECRET (not in git)
└── .gitignore                       ✅ Protects secrets
```

---

## 🎯 Quick Reference

```bash
# Create keystore (once)
cd android/app && keytool -genkeypair ...

# Build workflow
npm run build                        # Build web
npx cap sync android                 # Sync to Android
cd android && ./gradlew assembleRelease  # APK
cd android && ./gradlew bundleRelease    # AAB

# Install on device
cd android && ./gradlew installRelease

# Clean build
cd android && ./gradlew clean
```

---

## 📞 Support

- [Capacitor Docs](https://capacitorjs.com/docs/android)
- [Android Developer Guide](https://developer.android.com/studio/publish/app-signing)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Play Console](https://play.google.com/console)

---

**Built with ❤️ for AmakenDahab**
