
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setOpen } = useAuthModal();
  
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // If there's a Firebase user and their email is verified, set the user state.
      // Otherwise, the user is considered logged out (user state is null).
      if (firebaseUser && firebaseUser.emailVerified) {
        setUser(firebaseUser);
        setOpen(false); // Close modal on successful, verified login
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, setOpen]);
  

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

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
