
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseApp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { Logo } from '@/components/ui/logo';

interface LoginFormProps {
    onToggleView: () => void;
}

export function LoginForm({ onToggleView }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth(firebaseApp);
  const { toast } = useToast();
  const { setOpen } = useAuthModal();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        toast({
            variant: 'destructive',
            title: 'Email Not Verified',
            description: "Please check your inbox and verify your email address before signing in.",
            duration: 5000,
        });
        await auth.signOut(); // Log out the user if email is not verified
      } else {
        toast({
            title: 'Login Successful',
            description: 'Welcome back!',
        });
        setOpen(false); // Close the modal on success
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: error.code === 'auth/invalid-credential' 
            ? 'Incorrect email or password. Please try again.'
            : error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <form onSubmit={handleLogin}>
        <div className="grid gap-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
                <Logo className="h-12 w-12" />
                <h1 className="text-4xl font-bold tracking-tight">MindMate</h1>
            </div>
            <p className="text-balance text-muted-foreground">Welcome back! Please sign in to continue.</p>
        </div>
        <div className="grid gap-6 mt-8">
            <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input 
                id="email" 
                type="email" 
                placeholder="m@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />
            </div>
            <div className="grid gap-2">
            <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="ml-auto inline-block text-sm text-primary/80 hover:text-primary underline">
                Forgot password?
                </button>
            </div>
            <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />
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
