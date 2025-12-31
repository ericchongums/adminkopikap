# Kopi Kap Web Dashboard

Web-based dashboard untuk Barista dan Admin Kopi Kap.

## 🎨 Design Features

- **Beautiful & Modern UI** - Clean design dengan color theme Kopi Kap (Green)
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Real-time Updates** - Orders update automatically menggunakan Firebase Firestore
- **Role-based Access** - Barista dan Admin mempunyai access yang berbeza

## 📁 Project Structure

```
web/
├── index.html              # Login page
├── css/
│   ├── login.css          # Login page styling
│   ├── dashboard.css      # Dashboard styling
│   └── profile.css        # Profile page styling
├── js/
│   ├── firebase-config.js        # Firebase configuration
│   ├── login.js                  # Login authentication
│   ├── barista-dashboard.js      # Barista dashboard logic
│   └── barista-profile.js        # Barista profile logic
├── barista/
│   ├── dashboard.html     # Barista dashboard
│   └── profile.html       # Barista profile
├── admin/
│   └── (Admin pages - coming soon)
└── README.md
```

## 🚀 Setup Instructions

### 1. Firebase Configuration

**IMPORTANT:** Anda perlu update Firebase credentials di `js/firebase-config.js`

1. Pergi ke [Firebase Console](https://console.firebase.google.com/)
2. Pilih project anda (atau create new project)
3. Pergi ke **Project Settings** > **General**
4. Scroll ke bahagian "Your apps" dan pilih Web app
5. Copy configuration values
6. Update file `js/firebase-config.js`:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 2. Firestore Rules

Pastikan Firestore rules anda membenarkan read/write untuk authenticated users:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }

    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }

    match /pickup_counter/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. Create Barista User Account

1. Pergi ke Firebase Console > Authentication
2. Create user dengan email & password
3. Pergi ke Firestore Database
4. Create document di collection `users`:

```
Collection: users
Document ID: [USER_UID dari Authentication]
Fields:
  - name: "Barista Name"
  - email: "barista@kopikap.com"
  - phone: "+60123456789"
  - role: "barista"
  - profileImageUrl: "" (optional)
```

### 4. Running the Website

**Option 1: Using Live Server (Recommended)**
1. Install "Live Server" extension di VS Code
2. Right-click pada `index.html`
3. Pilih "Open with Live Server"

**Option 2: Using Python HTTP Server**
```bash
cd web
python -m http.server 8000
```
Then open: http://localhost:8000

**Option 3: Using Node.js HTTP Server**
```bash
npm install -g http-server
cd web
http-server
```

## 🎯 Features

### Login Page
- ✅ Email & Password authentication
- ✅ Remember Me functionality
- ✅ Role-based redirect (Barista/Admin)
- ✅ Error handling dengan user-friendly messages
- ✅ Beautiful gradient design

### Barista Dashboard
- ✅ Real-time order updates
- ✅ Order statistics (Pending, Preparing, Completed)
- ✅ Filter orders by status (All, Pending, Preparing)
- ✅ Start preparing orders
- ✅ Mark orders as completed
- ✅ Auto-generate pickup numbers
- ✅ Notification badge for pending orders
- ✅ Beautiful card-based layout

### Barista Profile
- ✅ View personal information
- ✅ View statistics (Total completed, Today's completed, Currently preparing)
- ✅ Toggle email notifications
- ✅ Toggle sound alerts
- ✅ Quick actions (Dashboard, Logout)

## 🎨 Color Theme

```css
--kopi-green: #2D5F3F
--kopi-green-dark: #1E4029
--kopi-green-light: #3D7F5F
--pending-color: #FF9800
--preparing-color: #2196F3
--completed-color: #4CAF50
```

## 🔐 Access Control

Website ini hanya untuk **Barista** dan **Admin** sahaja. Customer tidak boleh access.

Login credentials akan check:
1. User authenticated di Firebase Auth
2. User document exists di Firestore
3. User role = "barista" atau "admin"

Jika tidak memenuhi syarat, user akan di-redirect ke login page.

## 📱 Responsive Breakpoints

- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

## 🔄 Real-time Features

Dashboard menggunakan Firebase Firestore **real-time listeners** (`onSnapshot`):
- Orders akan update automatically tanpa refresh page
- Statistics akan update setiap kali order status berubah
- Notification badge akan update automatically

## 🐛 Troubleshooting

### "Firebase not initialized" error
- Check `firebase-config.js` - pastikan credentials betul
- Pastikan Firebase SDK scripts loaded di HTML

### Orders tidak muncul
- Check Firestore rules
- Check console untuk errors
- Pastikan ada orders dengan status "pending" atau "preparing"

### Cannot login
- Check Firebase Auth settings
- Check user exists di Firestore dengan role "barista"
- Check browser console untuk error messages

## 📞 Support

Untuk masalah atau pertanyaan, contact developer.

---

**Version:** 1.0.0
**Last Updated:** December 2024
**Developer:** Kopi Kap Team
