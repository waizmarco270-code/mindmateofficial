
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
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider);
    } catch(error: any) {
        console.error("Google sign-in error on redirect:", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
        setLoading(false);
    }
  };

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
            toast({
                title: 'Signed in successfully!',
                description: 'Welcome to MindMate.',
            });
            const firebaseUser = result.user;
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
              // This is a new user, create their document
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
        }
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
      }
    }
    
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          if (!firebaseUser.emailVerified && firebaseUser.providerData[0].providerId === 'password') {
            setUser(null);
          } else {
            setUser(firebaseUser);
             if (isAuthModalOpen) {
              setAuthModalOpen(false);
            }
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
