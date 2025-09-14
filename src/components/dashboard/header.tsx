
'use client';

import { Award, CheckCircle, Medal, Menu, Shield, Zap, Flame, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '../theme-toggle';
import { useSidebar } from '@/components/ui/sidebar';
import { useUsers, useAdmin } from '@/hooks/use-admin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { UserButton, useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';


export default function Header() {
  const { setOpenMobile } = useSidebar();
  const { user, isLoaded } = useUser();
  const { currentUserData } = useUsers();
  const { isAdmin } = useAdmin();
  
  const credits = currentUserData?.credits ?? 0;
  const streak = currentUserData?.streak ?? 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpenMobile(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
      <div className="flex-1" />
      <div className="flex items-center gap-2 md:gap-4">
        <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost">Sign In</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button>Sign Up</Button>
            </SignUpButton>
        </SignedOut>
        <SignedIn>
            {isLoaded && user && (
            <>
                <Popover>
                    <PopoverTrigger asChild>
                         <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                            <Flame className="h-5 w-5 text-orange-500" />
                            <span>{streak} <span className="hidden sm:inline">Day Streak</span></span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs p-4">
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-base mb-1 flex items-center gap-2"><CalendarCheck className="h-5 w-5 text-primary"/> Streak Rewards</h4>
                                <p className="text-sm text-muted-foreground">
                                    Maintain your daily streak to earn bonus credits. The longer you go, the more you get!
                                </p>
                            </div>
                            <div>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">+50 Credits</span> for every 5-day streak.</li>
                                    <li><span className="font-semibold text-foreground">+100 Credits</span> bonus every 30 days!</li>
                                </ul>
                            </div>
                            <p className="text-xs text-orange-500 font-semibold text-center pt-2">Don't break the chain!</p>
                        </div>
                    </PopoverContent>
                </Popover>

                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                            <Medal className="h-5 w-5 text-yellow-500" />
                            <span>{credits} <span className="hidden sm:inline">Credits</span></span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="max-w-xs p-4">
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-bold text-base mb-1">How to Use Credits</h4>
                                <p className="text-sm text-muted-foreground">
                                    Use your credits to unlock premium study resources (Class 10, JEE, Class 12) and other special features in the app.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-bold text-base mb-1">How to Earn Credits</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                    <li><span className="font-semibold text-foreground">+1 Credit</span> for completing all daily tasks.</li>
                                    <li><span className="font-semibold text-foreground">+5 Credits</span> for a perfect quiz score.</li>
                                    <li><span className="font-semibold text-foreground">Up to +10 Credits</span> for completing focus sessions.</li>
                                    <li><span className="font-semibold text-foreground">Spin the Wheel</span> for a chance to win big!</li>
                                </ul>
                            </div>
                            <p className="text-xs text-amber-500 font-semibold text-center pt-2">Use them wisely!</p>
                        </div>
                    </PopoverContent>
                </Popover>

                <ThemeToggle />
                <UserButton afterSignOutUrl="/" appearance={{
                    elements: {
                        avatarBox: {
                            width: "2.5rem",
                            height: "2.5rem"
                        }
                    }
                }} />
            </>
            )}
        </SignedIn>
      </div>
    </header>
  );
}
