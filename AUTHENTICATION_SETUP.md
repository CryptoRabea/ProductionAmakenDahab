# 🔒 Authentication Setup Guide

## ✅ **What's Been Implemented**

Your app now has **production-ready authentication** with:

- ✅ **Strong Password Requirements**
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*...)

- ✅ **Email Verification**
  - New users must verify email before logging in
  - Verification emails sent automatically
  - Resend verification option

- ✅ **Multiple Login Methods**
  - Email/Password (with strong password)
  - Google Sign-In
  - Facebook Sign-In

- ✅ **Role-Based Access Control**
  - ADMIN role for full access
  - PROVIDER role for service providers
  - USER role for regular users

---

## 🎯 **Firebase Console Setup**

### **Step 1: Enable Authentication Methods**

1. Go to [Firebase Console](https://console.firebase.google.com/project/amakendahab/authentication)
2. Click **"Authentication"** → **"Sign-in method"** tab
3. **Enable these providers:**

#### **Email/Password:**
- ✅ Enable "Email/Password"
- ✅ Enable "Email link (passwordless sign-in)" (optional)

#### **Google:**
- ✅ Enable "Google"
- **Project support email:** Select your email
- Click **"Save"**

#### **Facebook:**
- ✅ Enable "Facebook"
- Get **App ID** and **App Secret** from [Facebook Developers](https://developers.facebook.com/)
- Enter them and click **"Save"**

---

## 👤 **Create First Admin User**

### **Option 1: Through Firebase Console (Recommended)**

1. **Go to Authentication:**
   - https://console.firebase.google.com/project/amakendahab/authentication/users

2. **Add User:**
   - Click **"Add user"**
   - **Email:** `youssefrabea3@gmail.com`
   - **Password:** Create a strong password (e.g., `Admin@2024!`)
   - Click **"Add user"**

3. **Set as Admin:**
   - Open **Firestore Database**
   - Go to `users` collection
   - Find the user document (by UID)
   - Click **"Add field"**:
     - **Field:** `role`
     - **Type:** `string`
     - **Value:** `ADMIN`
   - Click **"Update"**

4. **Verify Email:**
   - Click on the user in Authentication
   - Click the **three dots (...)** menu
   - Click **"Verify email"**

---

### **Option 2: Using Browser Console**

1. **Open your app:** https://amakendahab.web.app
2. **Register normally** with a strong password
3. **Open Developer Tools** (F12)
4. **Go to Application tab** → **Firestore**
5. **Manually update** your user document to have `role: "ADMIN"`

---

### **Option 3: Using Firebase CLI (Advanced)**

Create a Firebase Function to set admin:

```javascript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const setAdminRole = functions.https.onCall(async (data, context) => {
  // Check if requester is already admin
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only admins can make other users admins'
    );
  }

  const email = data.email;
  const user = await admin.auth().getUserByEmail(email);

  // Set custom claims
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });

  // Update Firestore
  await admin.firestore().collection('users').doc(user.uid).update({
    role: 'ADMIN'
  });

  return { result: `Success! ${email} is now an admin` };
});
```

---

## 🔐 **Password Requirements**

When users register, passwords must include:

```
✅ At least 8 characters
✅ One uppercase letter (A-Z)
✅ One lowercase letter (a-z)
✅ One number (0-9)
✅ One special character (!@#$%^&*...)
```

**Example valid passwords:**
- `SecurePass123!`
- `Admin@2024`
- `MyApp$2025`

**Example invalid passwords:**
- `password` ❌ (no uppercase, number, special char)
- `Password` ❌ (no number, special char)
- `Pass1!` ❌ (too short)

---

## 📧 **Email Verification Flow**

### **For New Users:**

1. User registers with email/password
2. User receives verification email
3. User clicks verification link in email
4. User can now log in

### **If Verification Email Not Received:**

```typescript
// User can request a new verification email
await resendVerificationEmail();
```

---

## 🎯 **Login Flow**

### **Email/Password Login:**

```typescript
import { loginWithEmail } from './services/auth';

const user = await loginWithEmail(email, password);
// User is now logged in
// Redirect based on role:
// - ADMIN → /admin
// - PROVIDER → /provider-dashboard
// - USER → /
```

### **Google Login:**

```typescript
import { loginWithGoogle } from './services/auth';

const user = await loginWithGoogle();
// User automatically logged in
```

### **Check if Email Verified:**

The login will automatically fail if email is not verified:
```
Error: "Please verify your email before logging in. Check your inbox for the verification link."
```

---

## 🛡️ **Role Management**

### **Promote User to Admin (Firestore Console):**

1. **Firestore Database** → `users` collection
2. **Find user** by email or UID
3. **Edit document**:
   - Change `role` field to `"ADMIN"`
4. **Save**

### **Programmatically (Admin Dashboard Feature):**

```typescript
import { promoteToAdmin } from './services/auth';

// Only works if current user is admin
await promoteToAdmin(targetUserId, currentUserRole);
```

---

## 🧪 **Testing Authentication**

### **Test Strong Password:**

```typescript
import { validatePassword } from './services/auth';

const result = validatePassword('Test123!');
console.log(result.valid); // true or false
console.log(result.errors); // Array of error messages
```

### **Test Registration:**

1. Go to: https://amakendahab.web.app/login
2. Click **"Sign Up"**
3. Try password: `weak` → Should show errors
4. Use strong password: `StrongPass123!` → Should work
5. Check email for verification link
6. Click verification link
7. Log in successfully

---

## 🔄 **Migration from Mock Database**

If you have existing users in localStorage (mock database), they need to:

1. **Re-register** with the new authentication system
2. **Verify their email**
3. **Admin** must re-assign admin role in Firestore

**Or**, you can create a migration script to move users to Firebase Auth.

---

## 📊 **Monitoring**

### **View Users:**
- https://console.firebase.google.com/project/amakendahab/authentication/users

### **View Auth Events:**
- **Authentication** → **Usage** tab
- See sign-ins, sign-ups, failures

---

## 🆘 **Troubleshooting**

### **Error: "Email not verified"**

**Solution:**
```typescript
import { resendVerificationEmail } from './services/auth';

await resendVerificationEmail();
// Check email for new verification link
```

### **Error: "Password is too weak"**

**Solution:** Use a password that meets all requirements:
- At least 8 characters
- Uppercase + lowercase + number + special char

### **Error: "Popup blocked"**

**Solution:** Allow popups for your site in browser settings

---

## 🎯 **Quick Start Checklist**

```
[ ] Enable Email/Password authentication in Firebase Console
[ ] Enable Google authentication in Firebase Console
[ ] Create first admin user in Firebase Console
[ ] Set admin role in Firestore
[ ] Verify admin email in Firebase Console
[ ] Test login with admin credentials
[ ] Test registration with strong password
[ ] Test email verification flow
```

---

## 🔗 **Useful Links**

- **Firebase Authentication:** https://console.firebase.google.com/project/amakendahab/authentication
- **Firestore Database:** https://console.firebase.google.com/project/amakendahab/firestore
- **Facebook App Setup:** https://developers.facebook.com/
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth

---

**Your app now has enterprise-level authentication! 🎉**
