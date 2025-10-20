
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Bot, CreditCard, Users, BrainCircuit, Medal, BookOpen, Calendar, Zap, Gift, Trophy, Clock, LineChart, RefreshCw, Gamepad2, Swords, Puzzle as PuzzleIcon, ListTodo, Wrench, Lock, Crown, Sparkles as SparklesIcon, Rocket, Flame, Code, ShieldCheck, Timer, Globe, UserPlus, User, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useAnnouncements, useUsers, useAdmin, FeatureShowcase, BadgeType } from '@/hooks/use-admin';
import { CommunityPoll } from '@/components/dashboard/community-poll';
import { cn } from '@/lib/utils';
import { WelcomeDialog } from '@/components/dashboard/welcome-dialog';
import { DailySurpriseCard } from '@/components/dashboard/daily-surprise';
import { TypingAnimation } from '@/components/dashboard/typing-animation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { GlobalGiftCard } from '@/components/dashboard/global-gift';
import { lockableFeatures, type LockableFeature } from '@/lib/features';
import { FeatureUnlockDialog } from '@/components/dashboard/feature-unlock-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { format, parseISO } from 'date-fns';
import { useRewards } from '@/hooks/use-rewards';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import versionHistory from '@/app/lib/version-history.json';
import { useLocalStorage } from '@/hooks/use-local-storage';

const LATEST_VERSION = versionHistory[0].version;

function ShowcaseView({ showcases }: { showcases: FeatureShowcase[] }) {
    const [api, setApi] = useState<CarouselApi>()
    const [current, setCurrent] = useState(0)
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])


    if (!showcases || showcases.length === 0) {
        return null;
    }

    const getTemplateClasses = (template: FeatureShowcase['template']) => {
        switch (template) {
            case 'cosmic-blue': return 'blue-nebula-bg';
            case 'fiery-red': return 'red-nebula-bg';
            case 'golden-legend': return 'golden-legend-bg';
            case 'professional-dark': return 'professional-dark-bg';
            case 'emerald-dream': return 'emerald-dream-bg';
            case 'amethyst-haze': return 'amethyst-haze-bg';
            case 'solar-flare': return 'solar-flare-bg';
            case 'midnight-abyss': return 'midnight-abyss-bg';
            case 'rainbow-aurora': return 'rainbow-aurora-bg';
            case 'diamond-pearl': return 'diamond-pearl-bg';
            case 'cyber-grid': return 'cyber-grid-bg';
            case 'oceanic-flow': return 'oceanic-flow-bg';
            case 'synthwave-sunset': return 'synthwave-sunset-bg';
            case 'jungle-ruins': return 'jungle-ruins-bg';
            case 'black-hole': return 'black-hole-bg';
            case 'anime-speed-lines': return 'anime-speed-lines-bg';
            case 'blueprint-grid': return 'blueprint-grid-bg';
            case 'lava-flow': return 'lava-flow-bg';
            case 'mystic-forest': return 'mystic-forest-bg';
            case 'digital-glitch': return 'digital-glitch-bg';
            case 'steampunk-gears': return 'steampunk-gears-bg';
            case 'lofi-rain': return 'lofi-rain-bg';
            default: return 'bg-slate-900';
        }
    };
    
     return (
        <div>
            <Carousel 
                setApi={setApi}
                className="w-full"
                plugins={[
                    Autoplay({
                      delay: 5000,
                      stopOnInteraction: true,
                    }),
                ]}
                opts={{ loop: showcases.length > 1 }}
            >
                <CarouselContent>
                    {showcases.map((showcase) => {
                        const isLive = showcase.status === 'live';
                        return (
                            <CarouselItem key={showcase.id}>
                                <Card className={cn("relative group overflow-hidden border-0", getTemplateClasses(showcase.template))}>
                                     <div id="particle-container" className="[mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)]">
                                        {[...Array(12)].map((_, i) => <div key={i} className="particle"></div>)}
                                    </div>
                                     <div className="relative z-10 p-4">
                                        <CardContent className="relative z-10 p-4 sm:p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-4 rounded-lg bg-black/20 border border-white/10">
                                            <div className="flex-1">
                                                 <h2 className={cn("text-sm font-bold uppercase tracking-widest", isLive ? "text-green-400" : "text-red-400")}>
                                                    {isLive ? "New Feature" : "Coming Soon"}
                                                </h2>
                                                 <CardTitle className="text-2xl lg:text-3xl font-bold mt-1 text-white">{showcase.title}</CardTitle>
                                                <CardDescription className="text-slate-300 mt-2 max-w-lg mx-auto md:mx-0">
                                                    {showcase.description}
                                                </CardDescription>
                                                 {isLive && showcase.link && (
                                                    <Button asChild className="mt-4 animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
                                                        <Link href={showcase.link}>Go to Feature <ArrowRight className="ml-2 h-4 w-4"/></Link>
                                                    </Button>
                                                )}
                                            </div>
                                             {!isLive && showcase.launchDate && (
                                                <div className="flex flex-col items-center bg-black/20 p-4 rounded-lg border border-white/10 w-full sm:w-auto mt-4 md:mt-0">
                                                    <p className="text-base font-bold font-code text-cyan-300">LAUNCHING ON</p>
                                                    <p className="text-3xl font-bold font-serif text-white mt-1">{format(parseISO(showcase.launchDate), 'do MMMM')}</p>
                                                </div>
                                             )}
                                        </CardContent>
                                    </div>
                                </Card>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
                {showcases.length > 1 && (
                     <>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex" />
                     </>
                )}
            </Carousel>
             {count > 1 && (
                <div className="py-2 flex justify-center gap-2">
                    {Array.from({ length: count }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-1.5 rounded-full transition-all duration-300",
                                i + 1 === current ? "w-6 bg-primary" : "w-3 bg-muted"
                            )}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

const badgeDetails: Record<BadgeType, { name: string; badge: JSX.Element, icon: React.ElementType, gradient: string }> = {
    dev: { name: 'Developer', badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>, icon: Code, gradient: 'from-red-500 to-rose-500' },
    'co-dev': { name: 'Co-Developer', badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span>, icon: Code, gradient: 'from-red-500 to-rose-500' },
    admin: { name: 'Admin', badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span>, icon: ShieldCheck, gradient: 'from-green-500 to-emerald-500' },
    vip: { name: 'Elite Member', badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span>, icon: Crown, gradient: 'from-amber-400 to-yellow-500' },
    gm: { name: 'Game Master', badge: <span className="gm-badge">GM</span>, icon: Gamepad2, gradient: 'from-blue-500 to-sky-500' },
    challenger: { name: 'Challenger', badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>, icon: Swords, gradient: 'from-orange-500 to-red-500' },
};

const appBadges = [
    {
        badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span>,
        title: "Elite Member",
        description: "Awarded by admins to the most dedicated and active users."
    },
    {
        badge: <span className="gm-badge">GM</span>,
        title: "Game Master",
        description: "Awarded weekly to the #1 player on the Game Zone leaderboard."
    },
    {
        badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span>,
        title: "Admin",
        description: "For the moderators and administrators of MindMate."
    },
    {
        badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>,
        title: "Challenger",
        description: "Awarded for successfully completing a tough challenge in the Challenger Zone."
    },
     {
        badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span>,
        title: "Co-Developer",
        description: "A special rank for contributors helping build MindMate."
    },
     {
        badge: <span className="dev-badge"><Code className="h-3 w-3"/> DEV</span>,
        title: "Developer",
        description: "The architect and lead developer of the MindMate platform."
    }
]


function UserBadgeDisplay() {
    const { currentUserData, isSuperAdmin, isAdmin } = useAdmin();

    const ownedBadges = [
        (isSuperAdmin) && 'dev',
        (currentUserData?.isCoDev) && 'co-dev',
        (isAdmin) && 'admin',
        (currentUserData?.isVip) && 'vip',
        (currentUserData?.isGM) && 'gm',
        (currentUserData?.isChallenger) && 'challenger',
    ].filter(Boolean) as BadgeType[];

    if (ownedBadges.length === 0) return null;

    const badgeToShowKey = currentUserData?.showcasedBadge && ownedBadges.includes(currentUserData.showcasedBadge) 
        ? currentUserData.showcasedBadge 
        : ownedBadges[0];
    
    const badge = badgeDetails[badgeToShowKey];
    if (!badge) return null;
    
    const BadgeIcon = badge.icon;

    return (
        <Link href="/dashboard/profile" className="group block">
            <Card className={cn("relative overflow-hidden border-0 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1", badge.gradient)}>
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50"></div>
                 <CardContent className="relative p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                    <div className="p-3 sm:p-4 rounded-full bg-black/20 border-2 border-white/20">
                        <BadgeIcon className="h-8 w-8 sm:h-10 sm:w-10 text-white"/>
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Your Rank</p>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-white">{badge.name}</CardTitle>
                    </div>
                    <div className="transition-transform group-hover:translate-x-1">
                        {badge.badge}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}

function WhatsNewDialog({ isOpen, onOpenChange, onNavigate }: { isOpen: boolean, onOpenChange: (open: boolean) => void, onNavigate: () => void }) {
    const latestVersionInfo = versionHistory[0];

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <motion.div
                            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="p-4 bg-primary/10 rounded-full"
                        >
                            <Megaphone className="h-10 w-10 text-primary" />
                        </motion.div>
                    </div>
                    <DialogTitle className="text-center text-2xl font-bold">Welcome to Version {LATEST_VERSION}!</DialogTitle>
                    <DialogDescription className="text-center">
                        The "{latestVersionInfo.title}" is here. Check out what's new.
                    </DialogDescription>
                </DialogHeader>
                <div className="my-6">
                    <ul className="space-y-2 text-sm">
                        {latestVersionInfo.changes.slice(0, 3).map((change, index) => (
                            <li key={index} className="flex items-start gap-2">
                                <SparklesIcon className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                <span>{change}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <DialogFooter>
                     <Button onClick={onNavigate} className="w-full">
                        See All Updates <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function DashboardPage() {
    const { user } = useUser();
    const { currentUserData, featureLocks, isAdmin, isSuperAdmin, featureShowcases } = useAdmin();
    const [lastSeenVersion, setLastSeenVersion] = useLocalStorage('lastSeenVersion', '0.0');
    
    const [isWhatsNewOpen, setIsWhatsNewOpen] = useState(false);
    
    const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
    const [featureToUnlock, setFeatureToUnlock] = useState<LockableFeature | null>(null);
    

    useEffect(() => {
        if (currentUserData && lastSeenVersion !== LATEST_VERSION) {
            // Delay showing the "What's New" popup a bit to not overwhelm the user
            const timer = setTimeout(() => {
                setIsWhatsNewOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [currentUserData, lastSeenVersion]);

    const handleNavigateToWhatsNew = () => {
        setLastSeenVersion(LATEST_VERSION);
        setIsWhatsNewOpen(false);
        // This should be a router navigation in a real app
        window.location.href = '/dashboard/whats-new';
    };

    const credits = currentUserData?.credits ?? 0;
    const streak = currentUserData?.streak ?? 0;
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    return (
    <div className="space-y-8">
        <SignedOut>
            <WelcomeDialog />
        </SignedOut>
        
        <SignedIn>
            <WhatsNewDialog isOpen={isWhatsNewOpen} onOpenChange={setIsWhatsNewOpen} onNavigate={handleNavigateToWhatsNew} />
        </SignedIn>

        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back, {currentUserData?.displayName || 'Student'}!</h1>
            <p className="text-muted-foreground">Here's a snapshot of your study world.</p>
        </div>

        <div className="flex flex-col space-y-8">
            <SignedIn>
                <UserBadgeDisplay />
            </SignedIn>

            <ShowcaseView showcases={featureShowcases} />
            
            <SignedIn>
                <GlobalGiftCard />
            </SignedIn>

            <div className="grid grid-cols-2 gap-4">
                <Card className="group relative text-white overflow-hidden rounded-xl p-px hover:shadow-lg hover:shadow-yellow-500/20 transition-shadow duration-300 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-800 via-slate-900 to-slate-900 z-0 opacity-80"></div>
                    <div className="absolute inset-0 bg-grid-slate-800/50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                        <Medal className="h-10 w-10 mx-auto mb-2 text-yellow-400 animate-gold-shine"/>
                        <h3 className="text-base font-semibold">Your Credits</h3>
                        <p className="text-4xl font-bold text-yellow-400 [text-shadow:0_0_8px_currentColor]">{hasMasterCard ? '∞' : credits}</p>
                    </CardContent>
                </Card>
                <Card className="group relative text-white overflow-hidden rounded-xl p-px hover:shadow-lg hover:shadow-orange-500/20 transition-shadow duration-300 flex flex-col justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-slate-900 to-slate-900 z-0 opacity-80"></div>
                    <div className="absolute inset-0 bg-grid-slate-800/50 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <CardContent className="p-4 text-center relative z-10">
                        <Flame className="h-10 w-10 mx-auto mb-2 text-orange-400 animate-flicker"/>
                        <h3 className="text-base font-semibold">Day Streak</h3>
                        <p className="text-4xl font-bold text-orange-400 [text-shadow:0_0_8px_currentColor]">{streak}</p>
                    </CardContent>
                </Card>
            </div>
            
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>MindMate Focus</CardTitle>
                    <Link href="/dashboard/focus" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-center">
                    {[{
                        title: 'Pomodoro',
                        icon: Timer,
                        href: '/dashboard/pomodoro',
                        color: 'text-green-400',
                    },
                    {
                        title: 'Focus Mode',
                        icon: Zap,
                        href: '/dashboard/tracker',
                        color: 'text-yellow-400',
                    },
                    {
                        title: 'Tracker & Insights',
                        icon: Clock,
                        href: '/dashboard/tracker-insights',
                        color: 'text-blue-400',
                    },
                    {
                        title: 'Challenger',
                        icon: Swords,
                        href: '/dashboard/challenger',
                        color: 'text-red-400',
                    }].map(tool => (
                        <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                             <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.color)} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/leaderboard">
                    <Card className="hover:bg-muted transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Trophy className="h-8 w-8 text-amber-400" />
                            <div>
                                <h3 className="font-bold text-lg">Leaderboard</h3>
                                <p className="text-sm text-muted-foreground">See who's on top.</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/dashboard/tools">
                     <Card className="hover:bg-muted transition-colors">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Wrench className="h-8 w-8 text-lime-400" />
                            <div>
                                <h3 className="font-bold text-lg">Tools</h3>
                                <p className="text-sm text-muted-foreground">Student utilities.</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Quick Access</CardTitle>
                     <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" className="text-primary">View All</Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-auto">
                            <SheetHeader className="text-left">
                                <SheetTitle>All Features</SheetTitle>
                            </SheetHeader>
                            <div className="grid grid-cols-4 gap-4 py-4">
                                {[
                                    { title: 'Social Hub', href: '/dashboard/social', icon: Users, glow: 'text-yellow-400' },
                                    { title: 'Quiz Zone', href: '/dashboard/quiz', icon: BrainCircuit, glow: 'text-purple-400' },
                                    { title: 'Marco AI', href: '/dashboard/ai-assistant', icon: Bot, glow: 'text-sky-400' },
                                    { title: 'MM Nexus', href: '/dashboard/schedule', icon: Calendar, glow: 'text-blue-400' },
                                    { title: 'Resources', href: '/dashboard/resources', icon: BookOpen, glow: 'text-orange-400' },
                                    { title: 'Game Zone', href: '/dashboard/game-zone', icon: Gamepad2, glow: 'text-rose-400' },
                                    { title: 'World Chat', href: '/dashboard/world', icon: Globe, glow: 'text-blue-400' },
                                    { title: 'Reward Zone', href: '/dashboard/reward', icon: Gift, glow: 'text-pink-400' },
                                    { title: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy, glow: 'text-amber-400' },
                                    { title: 'Invite & Earn', href: '/dashboard/refer', icon: UserPlus, glow: 'text-green-400' },
                                    { title: 'Tools', href: '/dashboard/tools', icon: Wrench, glow: 'text-lime-400' },
                                    { title: 'Profile', href: '/dashboard/profile', icon: User, glow: 'text-teal-400' },
                                ].map(tool => (
                                    <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                                         <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                            <tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.glow)} />
                                        </div>
                                        <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors text-center">{tool.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-center">
                    {[
                        { title: 'Social Hub', href: '/dashboard/social', icon: Users, glow: 'text-yellow-400' },
                        { title: 'Quiz Zone', href: '/dashboard/quiz', icon: BrainCircuit, glow: 'text-purple-400' },
                        { title: 'Marco AI', href: '/dashboard/ai-assistant', icon: Bot, glow: 'text-sky-400' },
                        { title: 'MM Nexus', href: '/dashboard/schedule', icon: Calendar, glow: 'text-blue-400' },
                    ].map(tool => (
                        <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                             <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.glow)} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            
            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/reward">
                    <Card className="relative overflow-hidden group">
                        <CardContent className="p-4">
                            <h3 className="font-bold text-lg">Rewards</h3>
                            <p className="text-sm text-muted-foreground">Offers & Cashbacks</p>
                            <Badge className="mt-2 bg-primary/20 text-primary">5 New</Badge>
                            <Gift className="absolute -bottom-2 -right-2 h-20 w-20 text-primary/10 transition-transform duration-300 group-hover:scale-110" />
                        </CardContent>
                    </Card>
                </Link>
                 <Link href="/dashboard/refer">
                    <Card className="relative overflow-hidden group">
                        <CardContent className="p-4">
                             <h3 className="font-bold text-lg">Refer & Earn</h3>
                            <p className="text-sm text-muted-foreground">Get ₹100</p>
                            <Megaphone className="absolute -bottom-2 -right-2 h-20 w-20 text-primary/10 transition-transform duration-300 group-hover:scale-110" />
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {isSurpriseRevealed ? (
            <DailySurpriseCard />
            ) : (
            <Card 
                className="relative overflow-hidden cursor-pointer group bg-gradient-to-tr from-green-400/20 via-teal-500/20 to-emerald-600/20 border-green-500/20 hover:border-green-500/40 transition-all duration-300"
                onClick={() => setIsSurpriseRevealed(true)}
            >
                <div className="absolute -inset-2 bg-grid-slate-800 animate-pulse" style={{ animationDuration: '4s' }}></div>
                <CardContent className="relative p-6 text-center min-h-[170px] flex flex-col justify-center">
                    <div className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-green-500/20 rounded-full blur-3xl"></div>
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Gift className="h-10 w-10 text-green-400 [filter:drop-shadow(0_0_8px_currentColor)]"/>
                        </motion.div>
                    <h3 className="text-2xl font-bold mt-2">Click To See Today's Surprise</h3>
                    <p className="text-sm text-muted-foreground">A new surprise awaits you every day!</p>
                    </div>
                </CardContent>
            </Card>
            )}

            <CommunityPoll />

             <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">App Badges</h2>
                <Carousel 
                    className="w-full"
                    plugins={[ Autoplay({ delay: 3000, stopOnInteraction: true }) ]}
                    opts={{ loop: true, align: 'start' }}
                >
                    <CarouselContent className="-ml-4">
                        {appBadges.map((badge, index) => (
                            <CarouselItem key={index} className="pl-4 basis-full md:basis-1/2 lg:basis-1/3">
                                <div className="p-1">
                                    <Card className="h-full">
                                        <CardContent className="p-6 text-center flex flex-col items-center justify-center gap-4">
                                            <div className="inline-block">{badge.badge}</div>
                                            <div>
                                                <h3 className="font-bold">{badge.title}</h3>
                                                <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
            </div>
        </div>

        {featureToUnlock && (
            <FeatureUnlockDialog
                feature={featureToUnlock}
                isOpen={!!featureToUnlock}
                onOpenChange={(isOpen) => !isOpen && setFeatureToUnlock(null)}
            />
        )}
      </div>
  );
}
