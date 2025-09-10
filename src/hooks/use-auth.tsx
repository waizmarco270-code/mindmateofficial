
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult } from 'firebase/auth';
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
  const { setOpen: setAuthModalOpen } = useAuthModal();
  const { toast } = useToast();
  
  const auth = getAuth(firebaseApp);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
        await signInWithRedirect(auth, provider);
    } catch(error: any) {
        toast({
          variant: 'destructive',
          title: 'Google Sign-In Failed',
          description: error.message,
        });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
           const userDocRef = doc(db, 'users', firebaseUser.uid);
           const userDoc = await getDoc(userDocRef);
           if (!userDoc.exists()) {
               const { displayName, email, photoURL, uid } = firebaseUser;
               try {
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
               } catch (error) {
                   console.error("Error creating user document:", error);
               }
           }
          setUser(firebaseUser);
          setAuthModalOpen(false);
        } else {
          setUser(null);
        }
        setLoading(false);
      });

    // Handle the redirect result
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          toast({
              title: 'Signed in successfully!',
              description: 'Welcome to MindMate.',
          });
          // onAuthStateChanged will handle the user creation
        }
      })
      .catch((error) => {
        if (error.code !== 'auth/no-redirect-result') {
            console.error("Google sign-in error:", error);
            toast({
              variant: 'destructive',
              title: 'Google Sign-In Failed',
              description: error.message,
            });
        }
    }).finally(() => {
        // Even if there's no redirect, the auth state check can complete.
        // This is mainly to ensure loading is false if onAuthStateChanged hasn't fired yet
        // for a non-redirect scenario (e.g., initial page load with no user).
        setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, setAuthModalOpen, toast]);
  
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
