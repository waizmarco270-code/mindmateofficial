

'use client';

import { Award, CheckCircle, Medal, Menu, Shield, Zap, Flame, CalendarCheck, Crown, Gamepad2, ShieldCheck, Code, Mail, Vote, Swords } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useUsers, useAdmin, SUPER_ADMIN_UID, useAnnouncements } from '@/hooks/use-admin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { UserButton, useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/use-unread';


function AnnouncementInbox() {
    const { announcements } = useAnnouncements();
    const { hasUnreadAnnouncements, markAnnouncementsAsRead } = useUnreadMessages();
    
    const latestAnnouncement = announcements.length > 0 ? announcements[0] : null;
    const previousAnnouncements = announcements.slice(1, 10);

    return (
        <Popover onOpenChange={(open) => { if(open) markAnnouncementsAsRead() }}>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className={cn(
                        "relative h-12 w-12 rounded-full p-0 transition-all duration-300 ease-in-out",
                        hasUnreadAnnouncements 
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-400 animate-pulse shadow-lg shadow-primary/30"
                            : "bg-secondary"
                    )}
                >
                    <Mail className="h-6 w-6" />
                    {hasUnreadAnnouncements && (
                         <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                        </span>
                    )}
                    <span className="sr-only">Announcements</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                 <div className="p-4 bg-muted/50 rounded-t-lg">
                    <h4 className="font-bold text-base flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/> Inbox</h4>
                    <p className="text-sm text-muted-foreground">The latest updates and news from the admins.</p>
                 </div>
                 <Separator />
                <ScrollArea className="h-[400px]">
                    <div className="p-4 space-y-4">
                        {latestAnnouncement && (
                            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20">
                                <p className="font-bold text-primary mb-1">Latest Announcement</p>
                                <p className="font-semibold text-sm">{latestAnnouncement.title}</p>
                                <p className="text-xs text-muted-foreground">{latestAnnouncement.description}</p>
                                <p className="text-xs text-muted-foreground/80 pt-1">{formatDistanceToNow(latestAnnouncement.createdAt, { addSuffix: true })}</p>
                            </div>
                        )}

                        {previousAnnouncements.length > 0 && (
                            <>
                                <Separator/>
                                 <p className="font-semibold text-sm text-muted-foreground px-2">Previous Announcements</p>
                                {previousAnnouncements.map(announcement => (
                                    <div key={announcement.id} className="space-y-1 p-3 rounded-md hover:bg-muted cursor-pointer">
                                        <p className="font-semibold text-sm">{announcement.title}</p>
                                        <p className="text-xs text-muted-foreground">{announcement.description}</p>
                                        <p className="text-xs text-muted-foreground/80 pt-1">{formatDistanceToNow(announcement.createdAt, { addSuffix: true })}</p>
                                    </div>
                                ))}
                            </>
                        )}

                        {announcements.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-10">No announcements yet.</p>
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}


export default function Header() {
  const { setOpenMobile } = useSidebar();
  const { user, isLoaded } = useUser();
  const { currentUserData } = useUsers();
  
  const credits = currentUserData?.credits ?? 0;
  const streak = currentUserData?.streak ?? 0;
  
  const isSuperAdmin = currentUserData?.uid === SUPER_ADMIN_UID;
  const isAdmin = currentUserData?.isAdmin;
  const isVip = currentUserData?.isVip;
  const isGM = currentUserData?.isGM;
  const isChallenger = currentUserData?.isChallenger;

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
                {isSuperAdmin ? (
                    <span className="dev-badge flex-shrink-0"><Code className="h-3 w-3" /> DEV</span>
                ) : isAdmin ? (
                    <span className="admin-badge"><ShieldCheck className="h-3 w-3"/> ADMIN</span>
                ) : isChallenger ? (
                    <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>
                ) : isVip ? (
                    <span className="elite-badge flex-shrink-0"><Crown className="h-3 w-3" /> ELITE</span>
                ) : isGM ? (
                    <span className="gm-badge">GM</span>
                ) : null}

                <Popover>
                    <PopoverTrigger asChild>
                         <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground">
                            <Flame className="h-5 w-5 text-orange-500 animate-flicker" />
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
                            <Medal className="h-5 w-5 text-amber-500 animate-gold-shine" />
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
                                    <li><span className="font-semibold text-foreground">Play games</span> in the Reward Zone for a chance to win big!</li>
                                </ul>
                            </div>
                            <p className="text-xs text-amber-500 font-semibold text-center pt-2">Use them wisely!</p>
                        </div>
                    </PopoverContent>
                </Popover>
                
                <AnnouncementInbox />

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

  
