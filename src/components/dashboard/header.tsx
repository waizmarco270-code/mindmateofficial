
'use client';

import { LogIn, LogOut, Medal, Menu, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserNav } from './user-nav';
import { ThemeToggle } from '../theme-toggle';
import { useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useUsers, useAdmin } from '@/hooks/use-admin';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import Link from 'next/link';
import { useAuthModal } from '@/hooks/use-auth-modal';
import { cn } from '@/lib/utils';


export default function Header() {
  const { setOpenMobile } = useSidebar();
  const { user, loading, logout } = useAuth();
  const { currentUserData } = useUsers();
  const { isAdmin } = useAdmin();
  const { setOpen: openAuthModal } = useAuthModal();
  
  const isGuest = !user && !loading;
  const credits = isGuest ? 0 : currentUserData?.credits ?? 0;

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
        {isGuest ? (
           <Button 
                onClick={() => openAuthModal(true)} 
                className={cn(
                    "font-bold group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-md px-6",
                    "bg-primary text-primary-foreground transition-all duration-300",
                    "hover:bg-primary/90 hover:ring-2 hover:ring-primary hover:ring-offset-2 hover:ring-offset-background"
                )}
           >
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:[transform:skew(-12deg)_translateX(100%)]">
                    <div className="relative h-full w-8 bg-white/20"></div>
                </div>
                <span className="relative flex items-center gap-2"> <LogIn className="h-4 w-4" /> Login / Sign Up</span>
           </Button>
        ) : (
          <>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                            <Medal className="h-5 w-5 text-yellow-500" />
                            <span>{credits} Credits</span>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Credits can be used to unlock premium content.</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            {isAdmin && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button asChild variant="ghost" size="icon">
                      <Link href="/dashboard/admin">
                        <Shield className="h-5 w-5 text-primary" />
                        <span className="sr-only">Admin Panel</span>
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Admin Panel</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <ThemeToggle />
            <UserNav />
            <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Log out</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
