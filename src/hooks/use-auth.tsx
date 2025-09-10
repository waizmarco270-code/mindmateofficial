
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, createUserWithEmailAndPassword, sendEmailVerification, updateProfile, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';
import { useToast } from './use-toast';
import { ADMIN_UIDS } from './use-admin';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  // We no longer need the Google sign-in function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setOpen } = useAuthModal();
  const { toast } = useToast();
  
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Only set the user if their email is verified
      if (user && user.emailVerified) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
      
      // If a user is returned (even unverified), close the modal
      if(user) {
        setOpen(false);
      }
    });

    return () => unsubscribe();
  }, [auth, setOpen]);
  

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // The context value no longer exposes a sign-in method directly.
  // The login/signup forms will handle their own logic.
  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
