# 🚀 Kopi Kap Web - Complete Setup Guide

## ✅ Step 1: Firebase Configuration (ALREADY DONE!)

Firebase credentials sudah di-setup dari `google-services.json` Android app:
- ✅ API Key configured
- ✅ Project ID configured
- ✅ Storage Bucket configured

## 📝 Step 2: Create Barista Test Account

Untuk test login, anda perlu create user account dengan role "barista".

### Option A: Using Firebase Console (Recommended)

1. **Pergi ke Firebase Console**
   - URL: https://console.firebase.google.com
   - Login dengan Google account anda
   - Pilih project: `finalyearproject-b3787`

2. **Create Authentication User**
   - Klik **Authentication** di sidebar
   - Klik tab **Users**
   - Klik button **Add User**
   - Enter:
     - Email: `barista@kopikap.com` (atau email lain)
     - Password: `barista123` (atau password lain)
   - Klik **Add User**
   - **COPY USER UID** (contoh: `abc123xyz456`)

3. **Create Firestore User Document**
   - Klik **Firestore Database** di sidebar
   - Jika diminta enable Firestore, klik **Create database** (pilih mode **Test mode** untuk testing)
   - Klik **Start collection**
   - Collection ID: `users`
   - Document ID: **[PASTE USER UID dari step 2]**
   - Add fields:
     ```
     Field: name        Type: string    Value: Barista Test
     Field: email       Type: string    Value: barista@kopikap.com
     Field: phone       Type: string    Value: +60123456789
     Field: role        Type: string    Value: barista
     ```
   - Klik **Save**

### Option B: Using Android App

Jika anda sudah ada barista account di Android app:
1. Login ke Android app dengan barista account
2. Pergi ke Firebase Console > Authentication
3. Cari email barista tersebut
4. Pergi ke Firestore Database > users collection
5. Pastikan user document ada field `role: "barista"`

## 🌐 Step 3: Run the Website

### Using VS Code Live Server (Easiest)

1. Install extension **"Live Server"** di VS Code
2. Open folder `web` di VS Code
3. Right-click `index.html`
4. Pilih **"Open with Live Server"**
5. Browser akan auto-open ke `http://127.0.0.1:5500/index.html`

### Using Python HTTP Server

```bash
cd "C:\Users\pc\OneDrive - ums.edu.my\Desktop\Biz Outsource\Eric\Kopi Kap\web"
python -m http.server 8000
```
Then open: http://localhost:8000

### Using Node.js HTTP Server

```bash
npm install -g http-server
cd "C:\Users\pc\OneDrive - ums.edu.my\Desktop\Biz Outsource\Eric\Kopi Kap\web"
http-server
```
Then open: http://localhost:8080

## 🧪 Step 4: Test Login

1. Open website di browser
2. Enter credentials:
   - Email: `barista@kopikap.com`
   - Password: `barista123`
3. Klik **Sign In**

### Expected Result:
- ✅ Login successful
- ✅ Redirect to `barista/dashboard.html`
- ✅ See barista name di top-right
- ✅ See orders (jika ada orders di database)

### If Login Fails:

**Check Browser Console (F12)**
Look for errors:

1. **"Firebase not initialized"**
   - Solution: Refresh page, check firebase-config.js loaded

2. **"auth/invalid-credential"**
   - Solution: Double-check email & password
   - Make sure user exists di Firebase Authentication

3. **"User profile not found"**
   - Solution: Check Firestore - user document must exist with same UID

4. **"Access denied. Barista access only."**
   - Solution: Check Firestore - user document must have `role: "barista"`

5. **Network error**
   - Solution: Check internet connection
   - Check if Firebase project exists

## 🔐 Step 5: Firestore Security Rules

Untuk production, update Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - read own document, write own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Orders collection - authenticated users can read/write
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Pickup counter - authenticated users can read/write
    match /pickup_counter/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📱 Step 6: Test Complete Flow

1. **Create Order from Android App**
   - Login ke Android app as customer
   - Add coffee to cart
   - Complete payment
   - Order will go to "pending" status

2. **View Order in Web Dashboard**
   - Login to web dashboard as barista
   - You should see the new order in "Pending" section
   - Order akan appear automatically (real-time!)

3. **Start Preparing**
   - Klik **"Start Preparing"** button
   - Order akan move to "Preparing" section
   - Customer Android app akan auto-navigate ke PreparingOrderActivity

4. **Mark as Done**
   - Klik **"Mark as Done"** button
   - Order akan disappear dari dashboard (status = "completed")
   - Customer akan dapat pickup number
   - Customer Android app akan navigate ke OrderDoneActivity

## 🐛 Troubleshooting

### Orders tidak muncul di dashboard
1. Check Firestore - ada orders dengan status "pending" atau "preparing"?
2. Check browser console untuk errors
3. Check Firestore rules - allow read untuk authenticated users
4. Refresh page

### Cannot see order updates real-time
1. Check internet connection
2. Check browser console
3. Try logout dan login semula

### Profile tidak load
1. Check Firestore - user document exists?
2. Check user document has fields: name, email, role
3. Check browser console

### "Access denied" after login
1. Check Firestore user document
2. Field `role` MUST be exactly `"barista"` (lowercase)
3. User UID must match between Authentication and Firestore

## 📊 Test Data

Untuk testing, anda boleh create sample orders di Firestore manually:

```javascript
Collection: orders
Document ID: [auto-generate]
Fields:
{
  orderId: "test001",
  userId: "customer123",
  userName: "Test Customer",
  userEmail: "customer@test.com",
  orderStatus: "pending",
  paymentStatus: "paid",
  totalAmount: 15.50,
  createdAt: [timestamp],
  items: [
    {
      coffeeName: "Americano",
      variant: "Hot",
      size: "Regular",
      quantity: 2,
      price: 7.75
    }
  ]
}
```

## ✨ Features to Test

- [x] Login page
- [x] Remember me checkbox
- [x] Role-based redirect
- [x] Real-time orders display
- [x] Filter orders (All, Pending, Preparing)
- [x] Start preparing button
- [x] Mark as done button
- [x] Statistics cards
- [x] Notification badge
- [x] Profile page
- [x] Profile statistics
- [x] Settings toggle
- [x] Logout
- [x] Responsive design (try mobile view!)

## 🎉 Success Criteria

You'll know everything works when:
1. ✅ Login successful dengan barista account
2. ✅ Dashboard loads with orders
3. ✅ Can start preparing orders
4. ✅ Can mark orders as done
5. ✅ Statistics update automatically
6. ✅ Orders update real-time (no refresh needed!)
7. ✅ Profile page shows correct info
8. ✅ Can logout successfully

## 📞 Need Help?

Jika masih ada masalah:
1. Check browser console (F12) untuk error messages
2. Check Firebase Console untuk Authentication & Firestore data
3. Pastikan semua steps di atas sudah follow dengan betul
4. Try clear browser cache & refresh

---

**Current Configuration:**
- Project: finalyearproject-b3787
- Auth Domain: finalyearproject-b3787.firebaseapp.com
- Test Email: barista@kopikap.com (create this!)
- Role Required: barista

Good luck! 🚀☕
