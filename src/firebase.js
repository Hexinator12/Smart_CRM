// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Optional if you need file storage

// Your web app's Firebase configuration
const firebaseConfig = {
apiKey: "AIzaSyB6BqfZzPrYPsCHtmThkjuDVDab28lf6c8",
authDomain: "crm-31-d3ebd.firebaseapp.com",
projectId: "crm-31-d3ebd",
storageBucket: "crm-31-d3ebd.firebasestorage.app",
messagingSenderId: "574622545192",
 appId: "1:574622545192:web:5e81117c533915db5a0c1d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Optional
const googleProvider = new GoogleAuthProvider();

// Export the services you'll use
export { auth, db, storage, googleProvider };

