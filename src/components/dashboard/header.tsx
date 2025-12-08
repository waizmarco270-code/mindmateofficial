

'use client';

import { Award, CheckCircle, Medal, Menu, Shield, Zap, Flame, CalendarCheck, Crown, Gamepad2, ShieldCheck, Code, Mail, Vote, Swords, CreditCard, KeyRound, PinOff, Pin, Fingerprint, DollarSign, Users, Gift, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar, SidebarTrigger } from '@/components/ui/sidebar';
import { useUsers, useAdmin, SUPER_ADMIN_UID, useAnnouncements } from '@/hooks/use-admin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { UserButton, useUser, SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Separator } from '../ui/separator';
import { cn } from '@/lib/utils';
import { useUnreadMessages } from '@/hooks/use-unread';
import { Badge } from '../ui/badge';
import { usePinnedPage } from '@/hooks/use-pinned-page';
import { usePathname } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useFriends, type FriendRequest } from '@/hooks/use-friends';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useRewards } from '@/hooks/use-rewards';


function Inbox() {
    const { announcements } = useAnnouncements();
    const { 
      hasUnread, hasUnreadAnnouncements, hasUnreadFriendRequests, 
      markAnnouncementsAsRead, markFriendRequestsAsRead 
    } = useUnreadMessages();
    const { friendRequests, acceptFriendRequest, declineFriendRequest, loading: friendsLoading } = useFriends();
    const { toast } = useToast();

    const handleAccept = async (request: FriendRequest) => {
        await acceptFriendRequest(request);
        toast({ title: "Friend Added!" });
    };

    const handleDecline = async (request: FriendRequest) => {
        await declineFriendRequest(request);
        toast({ title: "Request Declined" });
    };

    return (
        <Popover onOpenChange={(open) => {
            if (open) {
                markAnnouncementsAsRead();
                markFriendRequestsAsRead();
            }
        }}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className={cn(
                        "relative h-10 w-10 rounded-full p-0 transition-all duration-300 ease-in-out",
                        hasUnread
                            ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-400 animate-pulse shadow-lg shadow-primary/30"
                            : "bg-secondary"
                    )}
                >
                    <Mail className="h-5 w-5" />
                    {hasUnread && (
                         <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                        </span>
                    )}
                    <span className="sr-only">Inbox</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
                <div className="p-4 bg-muted/50 rounded-t-lg">
                    <h4 className="font-bold text-base flex items-center gap-2"><Mail className="h-5 w-5 text-primary"/> Inbox</h4>
                    <p className="text-sm text-muted-foreground">Your recent notifications.</p>
                </div>
                <Tabs defaultValue="announcements">
                    <TabsList className="w-full justify-around rounded-none bg-muted/30">
                        <TabsTrigger value="announcements" className="relative">
                            Announcements
                             {hasUnreadAnnouncements && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"/>}
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="relative">
                            Requests
                            {hasUnreadFriendRequests && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive"/>}
                        </TabsTrigger>
                        <TabsTrigger value="rewards" disabled>Rewards</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[400px]">
                        <TabsContent value="announcements" className="p-4 space-y-4">
                            {announcements.length > 0 ? announcements.map(announcement => (
                                <div key={announcement.id} className="space-y-1 p-3 rounded-md hover:bg-muted cursor-pointer">
                                    <p className="font-semibold text-sm">{announcement.title}</p>
                                    <p className="text-xs text-muted-foreground">{announcement.description}</p>
                                    <p className="text-xs text-muted-foreground/80 pt-1">{formatDistanceToNow(announcement.createdAt, { addSuffix: true })}</p>
                                </div>
                            )) : <p className="text-sm text-muted-foreground text-center py-10">No new announcements.</p>}
                        </TabsContent>
                        <TabsContent value="requests" className="p-4 space-y-2">
                             {friendRequests.length > 0 ? friendRequests.map(req => (
                                <div key={req.id} className="flex items-center gap-3 p-2 rounded-lg bg-background border">
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={req.sender.photoURL} />
                                        <AvatarFallback>{req.sender.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold">{req.sender.displayName}</p>
                                        <p className="text-xs text-muted-foreground">sent you a friend request</p>
                                    </div>
                                    <div className="flex gap-1.5">
                                        <Button size="icon" className="h-8 w-8 bg-green-500/20 text-green-600 hover:bg-green-500/30" onClick={() => handleAccept(req)}><Check/></Button>
                                        <Button size="icon" variant="destructive" className="h-8 w-8" onClick={() => handleDecline(req)}><X/></Button>
                                    </div>
                                </div>
                             )) : <p className="text-sm text-muted-foreground text-center py-10">No pending friend requests.</p>}
                        </TabsContent>
                         <TabsContent value="rewards">
                           <p className="text-sm text-muted-foreground text-center py-10">Rewards notifications will appear here.</p>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </PopoverContent>
        </Popover>
    )
}

function AdminPanelMenu() {
    const { isAdmin, isSuperAdmin, currentUserData } = useAdmin();

    const showDevLink = isSuperAdmin || currentUserData?.isCoDev;

    if (!isAdmin && !isSuperAdmin && !showDevLink) {
        return null;
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button 
                    variant="outline" 
                    className="relative h-10 w-10 rounded-full p-0 bg-secondary"
                >
                    <Shield className="h-5 w-5 text-primary" />
                    <span className="sr-only">Admin Panels</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
                <div className="space-y-1">
                     {showDevLink && (
                        <Link href="/dashboard/dev">
                             <Button variant="ghost" className="w-full justify-start">
                                <DollarSign className="mr-2"/> Payments Panel
                            </Button>
                        </Link>
                    )}
                    {isAdmin && (
                        <Link href="/dashboard/admin">
                            <Button variant="ghost" className="w-full justify-start">
                                <ShieldCheck className="mr-2"/> Admin Panel
                            </Button>
                        </Link>
                    )}
                    {isSuperAdmin && (
                        <Link href="/waizmarcoadmin">
                             <Button variant="ghost" className="w-full justify-start">
                                <KeyRound className="mr-2"/> Super Admin
                            </Button>
                        </Link>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}


export default function Header() {
  const { setOpenMobile, toggleSidebar } = useSidebar();
  const { user, isLoaded } = useUser();
  const { currentUserData } = useUsers();
  const { pinnedPage, setPinnedPage } = usePinnedPage();
  const pathname = usePathname();
  
  const isCurrentPagePinned = pinnedPage === pathname;

  const handlePinToggle = () => {
    if (isCurrentPagePinned) {
      setPinnedPage(null); // Unpin
    } else {
      setPinnedPage(pathname); // Pin current page
    }
  };


  const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
  const credits = hasMasterCard ? '∞' : currentUserData?.credits ?? 0;
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
       <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpenMobile(true)}
      >
        <PanelLeft className="h-6 w-6" />
        <span className="sr-only">Toggle Menu</span>
      </Button>
       <SidebarTrigger className="hidden md:flex" />

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
                <AdminPanelMenu />
                
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
                
                <Inbox />

                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={handlePinToggle}
                    className={cn("h-10 w-10 rounded-full", isCurrentPagePinned && "bg-primary text-primary-foreground hover:bg-primary/90")}
                    title={isCurrentPagePinned ? "Unpin this page" : "Pin this as your start page"}
                >
                    {isCurrentPagePinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                </Button>

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
