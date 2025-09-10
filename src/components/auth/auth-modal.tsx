
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

type AuthView = 'login' | 'signup';

export function AuthModal() {
  const { isOpen, setOpen } = useAuthModal();
  const [view, setView] = useState<AuthView>('login');

  const onToggleView = () => {
    setView(view === 'login' ? 'signup' : 'login');
  }

  const handleClose = () => {
    setOpen(false);
    // Add a small delay before resetting the view
    // so the content doesn't flicker as it closes.
    setTimeout(() => setView('login'), 300);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="p-0 max-w-4xl grid grid-cols-1 md:grid-cols-2">
            <div className="p-10">
                {view === 'login' ? (
                    <LoginForm onToggleView={onToggleView} />
                ) : (
                    <SignupForm onToggleView={onToggleView} />
                )}
            </div>
            <div className="hidden md:block bg-muted relative overflow-hidden rounded-r-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-background z-10"></div>
                <img
                    src="https://picsum.photos/1200/1000"
                    alt="Abstract background"
                    className="h-full w-full object-cover dark:brightness-[0.3]"
                    data-ai-hint="abstract digital"
                />
                 <div className="absolute inset-0 flex items-end p-10 z-20">
                    <div className="text-white bg-black/30 p-8 rounded-xl backdrop-blur-sm">
                        <h2 className="text-4xl font-bold leading-tight">Unlock Your Potential.</h2>
                        <p className="text-lg mt-4 text-white/80 max-w-lg">Join a community of learners and achieve your academic goals.</p>
                    </div>
                </div>
            </div>
        </DialogContent>
    </Dialog>
  )
}
