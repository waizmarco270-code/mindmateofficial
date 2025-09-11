'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SignUpButton } from '@clerk/nextjs';
import { Logo } from '../ui/logo';
import { Award } from 'lucide-react';

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Open the dialog after a short delay to allow the page to render
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <Logo className="h-16 w-16" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Welcome to MindMate!</DialogTitle>
          <DialogDescription className="text-center">
            Your personal AI-powered study assistant.
          </DialogDescription>
        </DialogHeader>
        <div className="my-6 space-y-4">
            <div className="flex items-center justify-around text-center p-4 bg-muted rounded-lg">
                <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sign Up Bonus</p>
                    <p className="text-2xl font-bold flex items-center justify-center gap-2 text-green-500">
                        <Award className="h-6 w-6"/> 100 Credits
                    </p>
                </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
                Create a free account to unlock all features and claim your starting credits.
            </p>
        </div>
        <DialogFooter>
          <SignUpButton mode="modal">
            <Button className="w-full text-lg h-12">Create Your Free Account</Button>
          </SignUpButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
