
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';
import { useToast } from './use-toast';
import { ADMIN_UIDS } from '@/hooks/use-admin';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  signInWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// A cutoff date. Any account created before this date will bypass email verification.
// Set this to the day you are implementing this feature.
const VERIFICATION_CUTOFF_DATE = new Date('2024-05-22T00:00:00Z');


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: isAuthModalOpen, setOpen: setAuthModalOpen } = useAuthModal();
  const { toast } = useToast();
  
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        let accountCreatedAt: Date | null = null;
        if(userDoc.exists()) {
            const data = userDoc.data();
            // Firestore timestamps can be null or undefined before being set
            if(data.accountCreatedAt && data.accountCreatedAt instanceof Timestamp) {
                accountCreatedAt = data.accountCreatedAt.toDate();
            }
        }
        
        // If the account was created before the cutoff, they are a trusted "existing" user.
        // If accountCreatedAt doesn't exist, we treat them as a new user for safety.
        const isGrandfatheredUser = accountCreatedAt && accountCreatedAt < VERIFICATION_CUTOFF_DATE;

        if (firebaseUser.emailVerified || isGrandfatheredUser) {
          setUser(firebaseUser);
          if (isAuthModalOpen) {
            setAuthModalOpen(false);
          }
        } else {
            // This case handles a new user who is technically logged in to Firebase
            // but hasn't verified their email. We treat them as logged out from the app's perspective.
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, isAuthModalOpen, setAuthModalOpen]);
  
  const signInWithGoogle = async () => {
      // This function can be kept for future use if needed, but is not currently used.
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    // No need for a toast here, it's a normal action
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, signInWithGoogle }}>
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
