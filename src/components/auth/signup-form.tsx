
'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { firebaseApp, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { ADMIN_UIDS } from '@/hooks/use-admin';
import { Logo } from '@/components/ui/logo';

interface SignupFormProps {
    onToggleView: () => void;
}

export function SignupForm({ onToggleView }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = getAuth(firebaseApp);
  const { toast } = useToast();
  const { setOpen } = useAuthModal();

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

      const userDocRef = doc(db, "users", newUser.uid);
      await setDoc(userDocRef, {
        uid: newUser.uid,
        displayName: fullName,
        email: email,
        isBlocked: false,
        credits: 100,
        socialUnlocked: false,
        isAdmin: ADMIN_UIDS.includes(newUser.uid)
      });

      toast({
        title: 'Account Created!',
        description: "You've been successfully signed up.",
      });
      setOpen(false); // Close modal on success
    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
        <form onSubmit={handleSignup}>
            <div className="grid gap-2 text-center">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Logo className="h-12 w-12" />
                    <h1 className="text-4xl font-bold tracking-tight">Create Account</h1>
                </div>
                <p className="text-balance text-muted-foreground">Join us and start your AI-powered learning journey.</p>
            </div>
            <div className="grid gap-4 mt-8">
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
            </div>
        </form>
        <div className="mt-6 text-center text-sm">
        Already have an account?{' '}
        <button onClick={onToggleView} className="underline text-primary font-medium">
            Sign in
        </button>
        </div>
    </div>
  );
}
