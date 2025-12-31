// Firebase Configuration
// Configuration for Kopi Kap project
// Credentials extracted from google-services.json

const firebaseConfig = {
    apiKey: "AIzaSyD9EMyZgu7FsJOwzYB59DxdAJYTK5mwZqc",
    authDomain: "finalyearproject-b3787.firebaseapp.com",
    projectId: "finalyearproject-b3787",
    storageBucket: "finalyearproject-b3787.firebasestorage.app",
    messagingSenderId: "581749071416",
    appId: "1:581749071416:android:ea60d7d3b7f238fa49d0cd"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.auth = auth;
window.db = db;

console.log('Firebase initialized successfully');
