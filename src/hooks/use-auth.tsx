
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithRedirect, getRedirectResult, getAdditionalUserInfo } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';
import { useToast } from './use-toast';
import { ADMIN_UIDS } from '@/hooks/use-admin';
import { db } from '@/lib/firebase';


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
  const { setOpen } = useAuthModal();
  const { toast } = useToast();
  
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if(user) {
        setOpen(false);
      }
    });

    return () => unsubscribe();
  }, [auth, setOpen]);
  
  // Handle the redirect result from Google Sign-In
  useEffect(() => {
      const processRedirectResult = async () => {
          try {
              setLoading(true);
              const result = await getRedirectResult(auth);
              if (result) {
                  const user = result.user;
                  const additionalInfo = getAdditionalUserInfo(result);

                  // Check if the user document already exists
                  const userDocRef = doc(db, 'users', user.uid);
                  const userDoc = await getDoc(userDocRef);

                  if (!userDoc.exists()) {
                      // New user, create document
                      await setDoc(userDocRef, {
                          uid: user.uid,
                          displayName: user.displayName,
                          email: user.email,
                          photoURL: user.photoURL,
                          isBlocked: false,
                          credits: 100,
                          socialUnlocked: false,
                          isAdmin: ADMIN_UIDS.includes(user.uid),
                          class10Unlocked: false,
                          jeeUnlocked: false,
                          class12Unlocked: false,
                          perfectedQuizzes: [],
                          quizAttempts: {},
                          votedPolls: {}
                      });
                      toast({ title: "Welcome!", description: "Your account has been created." });
                  } else {
                       toast({ title: "Welcome back!", description: "You've successfully signed in." });
                  }
                  setOpen(false);
              }
          } catch (error: any) {
              console.error("Google Sign-in Error:", error);
              toast({ 
                  variant: 'destructive', 
                  title: "Sign-in Failed", 
                  description: error.message
              });
          } finally {
              setLoading(false);
          }
      }
      processRedirectResult();
  }, [auth, toast, setOpen]);


  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const signInWithGoogle = async () => {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      // Use signInWithRedirect instead of signInWithPopup
      await signInWithRedirect(auth, provider);
  }

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
