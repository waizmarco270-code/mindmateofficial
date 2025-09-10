
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

  // When the modal is closed, reset it to the login view
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setIsLoginView(true);
      }, 200); // Delay to allow animation to finish
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
