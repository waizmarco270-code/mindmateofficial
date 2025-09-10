
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, sendEmailVerification, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
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


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { isOpen: isAuthModalOpen, setOpen: setAuthModalOpen } = useAuthModal();
  const { toast } = useToast();
  
  const auth = getAuth(firebaseApp);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithRedirect(auth, provider);
  };

  useEffect(() => {
     const checkRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
           toast({
            title: 'Signed in successfully!',
            description: 'Welcome to MindMate.',
          });
          // The onAuthStateChanged listener below will handle setting user data
        }
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkRedirect();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setUser(null);
          setLoading(false);
          // This case is for new email/password signups who haven't verified.
          // It prevents them from being logged in.
          // Google sign-in users are always verified.
          return;
        }

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
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, isAuthModalOpen, setAuthModalOpen, toast]);
  
  const logout = async () => {
    await signOut(auth);
    setUser(null);
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
