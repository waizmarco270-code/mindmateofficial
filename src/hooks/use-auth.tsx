
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, sendEmailVerification } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';
import { useToast } from './use-toast';
import { ADMIN_UIDS } from '@/hooks/use-admin';


interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


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
        
        if (firebaseUser.emailVerified) {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
           if (!userDoc.exists()) {
             const { displayName, email, photoURL, uid } = firebaseUser;
             await setDoc(userDocRef, {
                uid: uid,
                displayName: displayName || 'New User',
                email: email,
                photoURL: photoURL || `https://avatar.vercel.sh/${uid}.png`,
                isBlocked: false,
                credits: 100,
                socialUnlocked: false,
                isAdmin: ADMIN_UIDS.includes(uid),
                class10Unlocked: false,
                jeeUnlocked: false,
                class12Unlocked: false,
                perfectedQuizzes: [],
                quizAttempts: {},
             });
           }
          setUser(firebaseUser);
          if (isAuthModalOpen) {
            setAuthModalOpen(false);
          }
        } else {
            // This case handles a new user who has signed up but has not yet clicked
            // the verification link. We treat them as logged out from the app's perspective
            // and their login attempt will be blocked by the login form, prompting them to verify.
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, isAuthModalOpen, setAuthModalOpen]);
  
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
