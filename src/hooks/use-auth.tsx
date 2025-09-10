
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
  const { setOpen } = useAuthModal();
  const { toast } = useToast();
  
  // Safely get the auth instance only on the client
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Close auth modal if user state changes (login/logout)
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

  const signInWithGoogle = async () => {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      try {
          const result = await signInWithPopup(auth, provider);
          const user = result.user;
          const additionalInfo = getAdditionalUserInfo(result);

          // Check if this is a new user
          if (additionalInfo?.isNewUser) {
              const userDocRef = doc(db, 'users', user.uid);
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
      } catch (error: any) {
          console.error("Google Sign-in Error:", error);
          toast({ 
              variant: 'destructive', 
              title: "Sign-in Failed", 
              description: error.code === 'auth/unauthorized-domain' 
                ? "This domain is not authorized. Please contact the administrator." 
                : error.message
          });
      } finally {
          setLoading(false);
      }
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
