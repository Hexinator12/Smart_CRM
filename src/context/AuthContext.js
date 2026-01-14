import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }
  
  // Add the registerWithGoogle function
  function registerWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  function logout() {
    return signOut(auth);
  }

  const registerWithEmailAndPassword = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Update the user profile with the name
      await updateProfile(userCredential.user, {
        displayName: name
      });
      return userCredential.user;
    } catch (error) {
      throw error;
    }
  };

  // Remove the unused value variable

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{
      currentUser,
      loginWithGoogle,
      registerWithGoogle,
      registerWithEmailAndPassword,
      logout,
      loading
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}