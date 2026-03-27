
'use client';

import { Medal, Mail, Crown, ShieldCheck, Code, Settings, LifeBuoy, CreditCard, KeyRound, DollarSign, Wallet, Check, X, PanelLeft, Gift, ShoppingCart, CheckCircle, Users, Pin, PinOff, Fingerprint, Sun, Moon, Monitor, User as UserIcon, LogOut, BellRing, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { useUsers, useAdmin, SUPER_ADMIN_UID, useAnnouncements, AppThemeId } from '@/hooks/use-admin';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import Link from 'next/link';
import { useUser, useClerk, SignedOut, SignInButton, SignUpButton, SignedIn } from '@clerk/nextjs';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
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
import { useTheme } from 'next-themes';
import { InboxContent } from '@/components/inbox/inbox-content';

function Inbox() {
    const { hasUnread } = useUnreadMessages();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative h-12 w-12 rounded-full transition-all duration-300 group",
                        hasUnread 
                            ? "bg-yellow-400/20 text-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] border-2 border-yellow-400/50" 
                            : "hover:bg-muted text-muted-foreground"
                    )}
                >
                    <div className="relative">
                        <Bell className={cn(
                            "h-7 w-7 transition-all duration-300",
                            hasUnread ? "text-yellow-400 drop-shadow-[0_0_8px_currentColor]" : "group-hover:rotate-12"
                        )} />
                        {hasUnread && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-background shadow-lg"></span>
                            </span>
                        )}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[22rem] sm:w-[26rem] p-0 overflow-hidden border-yellow-400/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-[2.5rem]">
                <InboxContent isMini />
            </PopoverContent>
        </Popover>
    )
}

function AdminCommandShield() {
    const { isAdmin, isSuperAdmin, currentUserData } = useAdmin();
    const showMenu = isAdmin || isSuperAdmin || currentUserData?.isCoDev;

    if (!showMenu) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                    <ShieldCheck className="h-6 w-6" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2 rounded-2xl shadow-2xl border-emerald-500/20">
                <div className="p-2 border-b border-muted mb-1 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Command Center</div>
                <div className="space-y-1">
                    {(isAdmin || isSuperAdmin) && (
                        <Link href="/dashboard/admin">
                            <Button variant="ghost" className="w-full justify-start font-bold">
                                <ShieldCheck className="mr-2 h-4 w-4 text-emerald-500"/> Admin Panel
                            </Button>
                        </Link>
                    )}
                    {(isSuperAdmin || currentUserData?.isCoDev) && (
                        <Link href="/dashboard/dev">
                            <Button variant="ghost" className="w-full justify-start font-bold">
                                <Fingerprint className="mr-2 h-4 w-4 text-rose-500"/> Dev & Payments
                            </Button>
                        </Link>
                    )}
                    {isSuperAdmin && (
                        <Link href="/dashboard/super-admin">
                            <Button variant="ghost" className="w-full justify-start font-bold text-amber-500">
                                <KeyRound className="mr-2 h-4 w-4"/> Super Admin
                            </Button>
                        </Link>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

function ProfileHub() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const { theme, setTheme } = useTheme();
    const { currentUserData, isSuperAdmin, isAdmin } = useAdmin();
    const { toast } = useToast();

    if (!user) return null;

    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="relative group focus:outline-none focus:ring-0">
                    <div className="rainbow-border-wrap">
                        <Avatar className="h-12 w-12 border-2 border-background">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback><UserIcon /></AvatarFallback>
                        </Avatar>
                    </div>
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden border-primary/20 shadow-2xl rounded-2xl">
                <div className="p-6 bg-gradient-to-br from-primary/10 to-background border-b">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-14 w-14 border-2 border-primary/20 shadow-lg">
                            <AvatarImage src={user.imageUrl} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-lg truncate leading-tight">{currentUserData?.displayName || user.fullName}</p>
                            <p className="text-[10px] text-muted-foreground truncate uppercase font-bold tracking-tighter">{user.primaryEmailAddress?.emailAddress}</p>
                        </div>
                    </div>
                </div>

                <div className="p-2 space-y-1">
                    <Link href="/dashboard/profile">
                        <Button variant="ghost" className="w-full justify-start h-11 rounded-xl">
                            <UserIcon className="mr-3 h-4 w-4 text-primary"/> View Profile
                        </Button>
                    </Link>
                    <Link href="/dashboard/settings">
                        <Button variant="ghost" className="w-full justify-start h-11 rounded-xl">
                            <Settings className="mr-3 h-4 w-4 text-primary"/> Settings & Info
                        </Button>
                    </Link>
                    <Link href="/dashboard/help">
                        <Button variant="ghost" className="w-full justify-start h-11 rounded-xl">
                            <LifeBuoy className="mr-3 h-4 w-4 text-primary"/> Help & Support
                        </Button>
                    </Link>
                </div>

                <div className="px-4 py-3 bg-muted/30 border-t">
                    <Tabs value={theme} onValueChange={(v) => setTheme(v)} className="w-full">
                        <TabsList className="grid w-full grid-cols-3 h-10 bg-background/50 border p-1 rounded-xl">
                            <TabsTrigger value="light" className="text-[10px] uppercase font-black"><Sun className="h-3.5 w-3.5 mr-1"/> Light</TabsTrigger>
                            <TabsTrigger value="dark" className="text-[10px] uppercase font-black"><Moon className="h-3.5 w-3.5 mr-1"/> Dark</TabsTrigger>
                            <TabsTrigger value="system" className="text-[10px] uppercase font-black"><Monitor className="h-3.5 w-3.5 mr-1"/> System</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="p-2 border-t">
                    <Button 
                        variant="ghost" 
                        onClick={() => { signOut(); toast({ title: "Signed Out", description: "Safe travels, Legend." }); }}
                        className="w-full justify-start h-11 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="mr-3 h-4 w-4"/> Sign Out
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default function Header() {
  const { setOpenMobile } = useSidebar();
  const { currentUserData } = useAdmin();
  
  const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();
  const credits = hasMasterCard ? '∞' : currentUserData?.credits ?? 0;
  const walletBalance = currentUserData?.walletBalance ?? 0;
  
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
            <div className="flex items-center gap-2 md:gap-3">
                <Link href="/dashboard/store">
                    <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 hover:bg-green-500 hover:text-white transition-all group shadow-sm">
                        <ShoppingCart className="h-5 w-5 animate-pulse group-hover:animate-none" />
                    </Button>
                </Link>

                <Popover>
                    <PopoverTrigger asChild>
                        <div className="flex cursor-pointer items-center gap-2 rounded-full bg-secondary hover:bg-secondary/80 px-4 py-2 text-sm font-bold transition-all border border-transparent hover:border-primary/20 shadow-sm">
                            <Medal className="h-5 w-5 text-amber-500 animate-gold-shine" />
                            <span>{credits}</span>
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-0 overflow-hidden border-primary/20 shadow-2xl">
                        <div className="p-4 bg-gradient-to-br from-amber-500/10 to-primary/5 border-b border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Your Treasury</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Medal className="h-5 w-5 text-amber-500" />
                                    <span className="text-2xl font-black tracking-tighter">{credits} <span className="text-xs text-muted-foreground uppercase font-medium">Credits</span></span>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/10">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-4 w-4 text-primary" />
                                    <span className="text-sm font-bold">Wallet Balance</span>
                                </div>
                                <span className="font-black text-primary">₹{walletBalance}</span>
                            </div>
                            
                            <Button asChild className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none font-bold" variant="outline">
                                <Link href="/dashboard/wallet">
                                    <ShieldCheck className="mr-2 h-4 w-4"/> Visit MindMate Vault
                                </Link>
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>

                <AdminCommandShield />
                <Inbox />
                <ProfileHub />
            </div>
        </SignedIn>
      </div>
    </header>
  );
}
