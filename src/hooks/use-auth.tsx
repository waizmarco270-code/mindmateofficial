
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, signOut, GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo } from 'firebase/auth';
import { firebaseApp, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuthModal } from './use-auth-modal';
import { useToast } from './use-toast';
import { ADMIN_UIDS } from './use-admin';

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
  const auth = getAuth(firebaseApp);
  const { setOpen } = useAuthModal();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      // Close auth modal if user state changes (login/logout)
      setOpen(false);
    });

    return () => unsubscribe();
  }, [auth, setOpen]);
  
  const logout = async () => {
    await signOut(auth);
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
              // Create a new document in Firestore for the new user
              const userDocRef = doc(db, 'users', user.uid);
              await setDoc(userDocRef, {
                  uid: user.uid,
                  displayName: user.displayName,
                  email: user.email,
                  photoURL: user.photoURL,
                  isBlocked: false,
                  credits: 100, // Assign 100 credits on signup
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
          setOpen(false); // Close modal on success
      } catch (error: any) {
          toast({ variant: 'destructive', title: "Sign-in Failed", description: error.message });
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
