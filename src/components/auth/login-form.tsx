
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Info } from 'lucide-react';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Logo } from '@/components/ui/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';

const GoogleIcon = () => (
    <svg className="mr-2 h-4 w-4" version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);


interface LoginFormProps {
    onToggleView: () => void;
}

export function LoginForm({ onToggleView }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const auth = getAuth(firebaseApp);
  const { toast } = useToast();
  const { setOpen } = useAuthModal();
  const { signInWithGoogle, loading: authLoading } = useAuth();


  const handleResendVerification = async () => {
    setLoading(true);
    // Find the user first to resend email
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user) {
            await sendEmailVerification(userCredential.user);
            toast({
                title: 'Verification Email Sent',
                description: "A new verification link has been sent. Please check your spam folder.",
            });
        }
    } catch(e:any) {
        toast({
            variant: 'destructive',
            title: 'Could not send email',
            description: "Please check your email and password and try again.",
        });
    } finally {
        setLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle modal closing and success toast
    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Incorrect email or password. Please try again.',
          });
      } else if (error.code === 'auth/email-not-verified') {
           setShowResend(true);
      } else {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: error.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full">
        <div className="grid gap-2 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
                <Logo className="h-12 w-12" />
                <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
            </div>
            <p className="text-balance text-muted-foreground">Sign in to access your dashboard.</p>
        </div>
         <div className="grid gap-4 mt-8">
            <Button variant="outline" className="w-full py-6 text-lg" onClick={signInWithGoogle} disabled={loading || authLoading}>
                {authLoading ? <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-primary"></div> : <><GoogleIcon /> Sign In with Google</>}
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
            <form onSubmit={handleLogin} className="space-y-4">
                {showResend && (
                    <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 [&>svg]:text-yellow-600">
                        <Info className="h-4 w-4"/>
                        <AlertTitle className="font-bold">Already Registered? Please Verify Your Email</AlertTitle>
                        <AlertDescription className="text-xs space-y-2 mt-2">
                           <p>Please verify your email by clicking the "Resend Verification Email" button. After that, open your registered email and go to the spam folder to find and click the verification link.</p>
                           <p><span className="font-bold">Note:</span> If the verification link is not in your inbox, it will be in your spam folder 100%.</p>
                           <p><span className="font-bold">Note:</span> This change was made to prevent fake users from accessing the application.</p>
                           <Button onClick={handleResendVerification} className="mt-2 w-full" variant="secondary" size="sm" disabled={loading}>
                                {loading ? 'Sending...' : 'Resend Verification Email'}
                           </Button>
                        </AlertDescription>
                    </Alert>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading || authLoading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading || authLoading}/>
                </div>
                <Button type="submit" className="w-full py-6 text-lg" disabled={loading || authLoading}>
                   {loading ? <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-primary-foreground"></div> : <><LogIn className="mr-2 h-5 w-5" /> Sign In</>}
                </Button>
            </form>
        </div>
        <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <button onClick={onToggleView} className="underline text-primary font-medium">
            Sign up
        </button>
        </div>
    </div>
  );
}
