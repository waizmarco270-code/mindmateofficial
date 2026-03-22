'use client';

import { Award, CheckCircle, Medal, Menu, Shield, Zap, Flame, CalendarCheck, Crown, Gamepad2, ShieldCheck, Code, Mail, Vote, Swords, CreditCard, KeyRound, PinOff, Pin, Fingerprint, DollarSign, Users, Gift, PanelLeft, Check, X, BookOpen, ShoppingCart, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useUsers, useAdmin, SUPER_ADMIN_UID, useAnnouncements, AppThemeId } from '@/hooks/use-admin';
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
import { useTheme } from 'next-themes';

const availableThemes: {id: AppThemeId, name: string, bg: string, primary: string}[] = [
    { id: 'light', name: 'Light', bg: 'bg-white', primary: 'bg-slate-900' },
    { id: 'dark', name: 'Dark', bg: 'bg-slate-900', primary: 'bg-slate-50' },
    { id: 'emerald-dream', name: 'Emerald', bg: 'bg-emerald-50', primary: 'bg-emerald-600' },
    { id: 'solar-flare', name: 'Solar', bg: 'bg-gray-900', primary: 'bg-orange-500' },
    { id: 'synthwave-sunset', name: 'Synthwave', bg: 'bg-indigo-950', primary: 'bg-fuchsia-500' },
];

function Inbox() {
    const { announcements } = useAnnouncements();
    const { 
      hasUnread, hasUnreadAnnouncements, hasUnreadFriendRequests, 
      markAnnouncementsAsRead, markFriendRequestsAsRead 
    } = useUnreadMessages();
    const { friendRequests, acceptFriendRequest, declineFriendRequest } = useFriends();
    const { pinnedPage, setPinnedPage } = usePinnedPage();
    const { theme, setTheme } = useTheme();
    const pathname = usePathname();
    const { toast } = useToast();

    const isCurrentPagePinned = pinnedPage === pathname;

    const handlePinToggle = () => {
        if (isCurrentPagePinned) {
            setPinnedPage(null);
            toast({ title: "Page Unpinned" });
        } else {
            setPinnedPage(pathname);
            toast({ title: "Page Pinned!", description: "This will be your dashboard start page." });
        }
    };

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
                            : "bg-secondary text-muted-foreground hover:text-foreground"
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
            <PopoverContent className="w-[22rem] sm:w-96 p-0 overflow-hidden border-primary/20 shadow-2xl">
                <div className="p-4 bg-primary/5 border-b border-primary/10">
                    <h4 className="font-bold text-base flex items-center gap-2 text-primary"><Mail className="h-5 w-5"/> Control Hub</h4>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Manage Notifications & Environment</p>
                </div>
                <Tabs defaultValue="announcements" className="w-full">
                    <TabsList className="w-full grid grid-cols-4 rounded-none h-12 bg-muted/30">
                        <TabsTrigger value="announcements" className="relative text-[10px] sm:text-xs">
                            Inbox
                             {hasUnreadAnnouncements && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse"/>}
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="relative text-[10px] sm:text-xs">
                            Allies
                            {hasUnreadFriendRequests && <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-destructive animate-pulse"/>}
                        </TabsTrigger>
                        <TabsTrigger value="pinned" className="text-[10px] sm:text-xs">Pinned</TabsTrigger>
                        <TabsTrigger value="themes" className="text-[10px] sm:text-xs">Themes</TabsTrigger>
                    </TabsList>
                    <ScrollArea className="h-[350px]">
                        <TabsContent value="announcements" className="p-4 space-y-4 m-0">
                            {announcements.length > 0 ? announcements.map(announcement => (
                                <div key={announcement.id} className="group space-y-1 p-3 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all cursor-pointer">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="font-bold text-sm line-clamp-1">{announcement.title}</p>
                                        <Badge variant="outline" className="text-[8px] h-4 uppercase">{formatDistanceToNow(announcement.createdAt, { addSuffix: true })}</Badge>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{announcement.description}</p>
                                </div>
                            )) : <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50"><Mail className="h-10 w-10 mb-2"/><p className="text-xs font-bold uppercase">No new alerts</p></div>}
                        </TabsContent>

                        <TabsContent value="requests" className="p-4 space-y-2 m-0">
                             {friendRequests.length > 0 ? friendRequests.map(req => (
                                <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border">
                                    <Avatar className="h-9 w-9 border-2 border-primary/20">
                                        <AvatarImage src={req.sender.photoURL} />
                                        <AvatarFallback>{req.sender.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold truncate">{req.sender.displayName}</p>
                                        <p className="text-[10px] text-muted-foreground font-medium">Wants to form an alliance</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button size="icon" className="h-8 w-8 rounded-full bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white transition-all" onClick={() => handleAccept(req)}><Check className="h-4 w-4"/></Button>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10" onClick={() => handleDecline(req)}><X className="h-4 w-4"/></Button>
                                    </div>
                                </div>
                             )) : <div className="flex flex-col items-center justify-center h-64 text-muted-foreground opacity-50"><Users className="h-10 w-10 mb-2"/><p className="text-xs font-bold uppercase">No pending alliances</p></div>}
                        </TabsContent>

                        <TabsContent value="pinned" className="p-4 m-0 space-y-4">
                            <div className="text-center space-y-4 py-6">
                                <div className="p-4 rounded-full bg-primary/10 w-fit mx-auto">
                                    {isCurrentPagePinned ? <Pin className="h-10 w-10 text-primary animate-bounce"/> : <PinOff className="h-10 w-10 text-muted-foreground"/>}
                                </div>
                                <div>
                                    <h5 className="font-bold">Dashboard Start Page</h5>
                                    <p className="text-xs text-muted-foreground px-4">Pin the current page to land here every time you open MindMate.</p>
                                </div>
                                <Button 
                                    variant={isCurrentPagePinned ? "destructive" : "default"} 
                                    className="w-full rounded-xl h-12"
                                    onClick={handlePinToggle}
                                >
                                    {isCurrentPagePinned ? <><PinOff className="mr-2 h-4 w-4"/> Unpin Current Page</> : <><Pin className="mr-2 h-4 w-4"/> Pin Current Page</>}
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="themes" className="p-4 m-0 space-y-4">
                            <div className="grid grid-cols-1 gap-2">
                                {availableThemes.map(t => (
                                    <button 
                                        key={t.id} 
                                        onClick={() => { setTheme(t.id); toast({ title: `System Refreshed`, description: `${t.name} theme applied.` }); }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                                            theme === t.id ? "border-primary bg-primary/5" : "border-muted hover:border-primary/30"
                                        )}
                                    >
                                        <div className={cn("h-8 w-12 rounded-lg flex items-center justify-end p-1 shadow-inner", t.bg)}>
                                            <div className={cn("h-3 w-3 rounded-full", t.primary)}></div>
                                        </div>
                                        <span className="font-bold text-sm flex-1 text-left">{t.name}</span>
                                        {theme === t.id && <CheckCircle className="h-4 w-4 text-primary"/>}
                                    </button>
                                ))}
                            </div>
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
                        <>
                            <Link href="/dashboard/admin">
                                <Button variant="ghost" className="w-full justify-start">
                                    <ShieldCheck className="mr-2"/> Admin Panel
                                </Button>
                            </Link>
                             <Link href="/dashboard/admin/study-panel">
                                <Button variant="ghost" className="w-full justify-start">
                                    <BookOpen className="mr-2"/> Study Panel
                                </Button>
                            </Link>
                        </>
                    )}
                    {isSuperAdmin && (
                        <Link href="/dashboard/super-admin">
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
  const { setOpenMobile } = useSidebar();
  const { user, isLoaded } = useUser();
  const { currentUserData } = useUsers();
  const pathname = usePathname();
  
  const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
  const credits = hasMasterCard ? '∞' : currentUserData?.credits ?? 0;
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-lg sm:px-6">
       <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpenMobile(true)}
      >
        <PanelLeft className="h-6 w-6" />
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
                <AdminPanelMenu />
                
                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground transition-all hover:bg-secondary/80">
                                <Medal className="h-5 w-5 text-amber-500 animate-gold-shine" />
                                <span>{credits} <span className="hidden sm:inline">Credits</span></span>
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="max-w-xs p-4">
                            <div className="space-y-3">
                                <div>
                                    <h4 className="font-bold text-base mb-1">How to Use Credits</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Use your credits to unlock premium study resources and other special features in the app.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-base mb-1">How to Earn Credits</h4>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                        <li><span className="font-semibold text-foreground">+1 Credit</span> for daily tasks.</li>
                                        <li><span className="font-semibold text-foreground">+5 Credits</span> for perfect quizzes.</li>
                                        <li><span className="font-semibold text-foreground">Play games</span> in the Reward Zone!</li>
                                    </ul>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Link href="/dashboard/store" title="Nexus Emporium">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-primary/20 bg-primary/5 text-primary hover:bg-primary/10">
                            <ShoppingCart className="h-5 w-5" />
                        </Button>
                    </Link>
                </div>
                
                <Inbox />

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
