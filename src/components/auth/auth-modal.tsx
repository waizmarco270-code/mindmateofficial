
'use client';

import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';

export function AuthModal() {
  const { isOpen, setOpen } = useAuthModal();
  const [isLoginView, setIsLoginView] = useState(true);

  const toggleView = () => setIsLoginView(!isLoginView);

  // This modal is now only for cases where a guest user manually clicks a "login" button
  // from inside the app, not for the initial auth guard.
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setIsLoginView(true);
      }, 200);
    }
    setOpen(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="p-10 flex items-center justify-center">
             {isLoginView ? (
                <LoginForm onToggleView={toggleView} />
            ) : (
                <SignupForm onToggleView={toggleView} />
            )}
        </DialogContent>
    </Dialog>
  )
}
