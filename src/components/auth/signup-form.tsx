
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, MailCheck } from 'lucide-react';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { ADMIN_UIDS } from '@/hooks/use-admin';
import { Logo } from '@/components/ui/logo';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

interface SignupFormProps {
    onToggleView: () => void;
}

export function SignupForm({ onToggleView }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const auth = getAuth(firebaseApp);
  const { toast } = useToast();
  const { signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) {
        toast({
            variant: 'destructive',
            title: 'Missing Information',
            description: 'Please enter your first and last name.',
        });
        return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const fullName = `${firstName} ${lastName}`.trim();
      
      await updateProfile(newUser, { displayName: fullName });
      
      // Send verification email
      await sendEmailVerification(newUser);

      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        displayName: fullName,
        email: email,
        photoURL: `https://avatar.vercel.sh/${newUser.uid}.png`, // Default avatar
        isBlocked: false,
        credits: 100,
        socialUnlocked: false,
        isAdmin: ADMIN_UIDS.includes(newUser.uid),
        class10Unlocked: false,
        jeeUnlocked: false,
        class12Unlocked: false,
        perfectedQuizzes: [],
        quizAttempts: {},
      });

      setEmailSent(true);

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.code === 'auth/email-already-in-use' 
            ? 'This email is already registered. Please sign in instead.'
            : error.message,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (emailSent) {
      return (
          <div className="w-full text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Logo className="h-12 w-12" />
              </div>
              <MailCheck className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold tracking-tight">Verify Your Email</h1>
              <p className="text-balance text-muted-foreground mt-2">
                  We've sent a verification link to <span className="font-semibold text-primary">{email}</span>. Please check your inbox and spam folder, then click the link to finish setting up your account.
              </p>
               <Button onClick={onToggleView} className="mt-6 w-full">Got It, Let Me Sign In</Button>
          </div>
      )
  }

  return (
    <div className="w-full">
        <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
                <Logo className="h-12 w-12" />
                <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
            </div>
            <p className="text-balance text-muted-foreground">Join us and start your AI-powered learning journey.</p>
        </div>
        <div className="grid gap-4 mt-8">
             <Button variant="outline" className="w-full py-6 text-lg" onClick={signInWithGoogle} disabled={loading}>
                <GoogleIcon /> Sign Up with Google
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" placeholder="Max" required value={firstName} onChange={e => setFirstName(e.target.value)} disabled={loading} />
                    </div>
                    <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={e => setLastName(e.target.value)} disabled={loading} />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading} />
                </div>
                <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                    {loading ? <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-primary-foreground"></div> : <><UserPlus className="mr-2 h-5 w-5" /> Create Account</>}
                </Button>
            </form>
        </div>
        <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <button onClick={onToggleView} className="underline text-primary font-medium">
            Sign in
        </button>
        </div>
    </div>
  );
}
