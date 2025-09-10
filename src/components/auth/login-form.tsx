
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, AlertTriangle, Info } from 'lucide-react';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Logo } from '@/components/ui/logo';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';


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

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: 'Verification Email Sent',
          description: "A new verification link has been sent to your email address. Please check your spam folder.",
        });
      } else {
         toast({
          variant: 'destructive',
          title: 'Login Required',
          description: 'Please enter your credentials and try to log in once before resending.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Resend',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowResend(false); // Reset on new login attempt

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
          setShowResend(true);
          // Don't log the user out here, so they can click "Resend"
          return;
      }
      
      toast({
          title: 'Login Successful',
          description: 'Welcome back!',
      });
      setOpen(false);

    } catch (error: any) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          toast({
              variant: 'destructive',
              title: 'Login Failed',
              description: 'Incorrect email or password. Please try again.',
          });
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
        <form onSubmit={handleLogin}>
            <div className="grid gap-2 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Logo className="h-12 w-12" />
                    <h1 className="text-4xl font-bold tracking-tight">Welcome Back</h1>
                </div>
                <p className="text-balance text-muted-foreground">Sign in to access your dashboard.</p>
            </div>
            <div className="grid gap-4 mt-8">
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
                    <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} disabled={loading}/>
                </div>
                <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
                   {loading ? <div className="h-6 w-6 animate-spin rounded-full border-4 border-dashed border-primary-foreground"></div> : <><LogIn className="mr-2 h-5 w-5" /> Sign In</>}
                </Button>
            </div>
        </form>
        <div className="mt-6 text-center text-sm">
        Don&apos;t have an account?{' '}
        <button onClick={onToggleView} className="underline text-primary font-medium">
            Sign up
        </button>
        </div>
    </div>
  );
}
