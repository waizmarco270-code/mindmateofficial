
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
    const handleAuth = async () => {
      try {
        // First, check if there's a redirect result.
        const result = await getRedirectResult(auth);
        if (result) {
          // This is a fresh login via redirect.
          const firebaseUser = result.user;
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);

          if (!userDoc.exists()) {
            // New user, create their document.
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
            toast({
              title: 'Welcome to MindMate!',
              description: 'Your account has been created.',
            });
          } else {
             toast({
              title: 'Signed in successfully!',
              description: 'Welcome back.',
          });
          }
           // The onAuthStateChanged listener below will handle setting the user state.
        }

      } catch (error: any) {
          if (error.code !== 'auth/no-redirect-result') {
              console.error("Google sign-in error after redirect:", error);
              toast({
                  variant: 'destructive',
                  title: 'Google Sign-In Failed',
                  description: error.message,
              });
          }
      }

      // Set up the permanent listener for auth state changes.
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
              // User is signed in.
              setUser(firebaseUser);
          } else {
              // User is signed out.
              setUser(null);
          }
          // In all cases, authentication check is complete.
          setLoading(false);
      });

      return unsubscribe;
    };
    
    handleAuth();

  }, [auth, toast]);
  
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
