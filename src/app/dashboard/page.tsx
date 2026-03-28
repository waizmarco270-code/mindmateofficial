
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Bot, CreditCard, Users, BrainCircuit, Medal, BookOpen, Calendar, Zap, Gift, Trophy, Clock, LineChart, RefreshCw, Gamepad2, Swords, ListTodo, Wrench, Lock, Crown, Sparkles as SparklesIcon, Rocket, Flame, Code, ShieldCheck, Timer, Globe, UserPlus, User, Megaphone, Map as MapIcon, Settings, Bird, Moon, Loader2, CheckCircle, Info, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, SignedOut, SignedIn } from '@clerk/nextjs';
import { useAnnouncements, useUsers, useAdmin, FeatureShowcase, BadgeType } from '@/hooks/use-admin';
import { CommunityPoll } from '@/components/dashboard/community-poll';
import { cn } from '@/lib/utils';
import { WelcomeDialog } from '@/components/dashboard/welcome-dialog';
import { DailySurpriseCard } from '@/components/dashboard/daily-surprise';
import { TypingAnimation } from '@/components/dashboard/typing-animation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
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
import { usePinnedPage } from '@/hooks/use-pinned-page';
import { useRouter, usePathname } from 'next/navigation';

const LATEST_VERSION = versionHistory[0].version;

const streakMilestones = [
    { day: 3, reward: 50, label: 'Disciplined' },
    { day: 7, reward: 150, label: 'Consistent' },
    { day: 14, reward: 500, label: 'Warrior' },
    { day: 30, reward: 1000, label: 'Legendary Streaker', isSpecial: true, hasBadge: true }
];

function StreakMilestonesDialog({ isOpen, onOpenChange, currentStreak }: { isOpen: boolean, onOpenChange: (o: boolean) => void, currentStreak: number }) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-2xl">
                        <Flame className="text-orange-500" /> Streak Rewards
                    </DialogTitle>
                    <DialogDescription>Your commitment is rewarded. Complete the 30-day cycle to reset and earn again!</DialogDescription>
                </DialogHeader>
                <div className="py-6 space-y-4">
                    {streakMilestones.map((ms, i) => {
                        const isReached = currentStreak >= ms.day;
                        const isNext = !isReached && (i === 0 || currentStreak >= streakMilestones[i-1].day);
                        
                        return (
                            <div key={ms.day} className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                                isReached ? "bg-green-500/10 border-green-500/30 shadow-lg shadow-green-500/5" : 
                                isNext ? "bg-primary/5 border-primary/30 animate-pulse" : "bg-muted/30 border-transparent opacity-50"
                            )}>
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center font-black",
                                        isReached ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isReached ? <CheckCircle className="h-6 w-6"/> : ms.day}
                                    </div>
                                    <div>
                                        <p className="font-black uppercase text-xs tracking-widest">{ms.label}</p>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold text-lg">{ms.day} Day Streak</p>
                                            {ms.hasBadge && (
                                                <div className="scale-75 origin-left">
                                                    <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={cn("text-lg font-black", ms.isSpecial ? "text-orange-500 italic" : "text-primary")}>
                                        +{ms.reward}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase opacity-60">Credits</p>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-700 dark:text-orange-300 italic text-center">
                    "After 30 days, your streak cycle resets, allowing you to reclaim all rewards from Day 1!"
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button className="w-full">Understood</Button></DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

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

    if (!showcases || showcases.length === 0) return null;

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
        <div className="relative">
            <Carousel setApi={setApi} className="w-full" plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} opts={{ loop: showcases.length > 1 }}>
                <CarouselContent>
                    {showcases.map((showcase) => {
                        const isLive = showcase.status === 'live';
                        return (
                            <CarouselItem key={showcase.id}>
                                <motion.div whileHover={{ scale: 1.01 }} transition={{ type: 'spring', stiffness: 300 }}>
                                    <Card className={cn("relative group overflow-hidden border-0 min-h-[200px]", getTemplateClasses(showcase.template))}>
                                        <div className="relative z-10 p-4 h-full flex flex-col justify-center">
                                            <CardContent className="relative z-10 p-4 sm:p-6 flex flex-col md:flex-row items-center text-center md:text-left gap-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 shadow-2xl">
                                                <div className="flex-1">
                                                    <h2 className={cn("text-xs font-black uppercase tracking-widest px-2 py-1 rounded bg-black/40 w-fit mx-auto md:mx-0", isLive ? "text-green-400" : "text-red-400")}>
                                                        {isLive ? "New Feature" : "Coming Soon"}
                                                    </h2>
                                                    <CardTitle className="text-2xl lg:text-4xl font-black mt-2 text-white drop-shadow-lg">{showcase.title}</CardTitle>
                                                    <CardDescription className="text-slate-200 mt-2 max-w-lg mx-auto md:mx-0 font-medium leading-relaxed">{showcase.description}</CardDescription>
                                                    {isLive && showcase.link && (
                                                        <Button asChild className="mt-6 h-12 px-8 font-bold shadow-xl"><Link href={showcase.link}>Launch Experience <ArrowRight className="ml-2 h-4 w-4"/></Link></Button>
                                                    )}
                                                </div>
                                                {!isLive && showcase.launchDate && (
                                                    <div className="flex flex-col items-center bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/20 w-full sm:w-auto mt-4 md:mt-0 shadow-inner">
                                                        <p className="text-[10px] font-black text-cyan-300 tracking-[0.2em] uppercase">Deployment Targeted</p>
                                                        <p className="text-4xl font-black text-white mt-1">{format(parseISO(showcase.launchDate), 'do MMM')}</p>
                                                    </div>
                                                )}
                                            </CardContent>
                                        </div>
                                    </Card>
                                </motion.div>
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>
             {count > 1 && (
                <div className="py-4 flex justify-center gap-3">
                    {Array.from({ length: count }).map((_, i) => (
                        <div key={i} className={cn("h-1.5 rounded-full transition-all duration-500", i + 1 === current ? "w-8 bg-primary shadow-[0_0_8px_rgba(139,92,246,0.5)]" : "w-2 bg-muted")} />
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
    'early-bird': { name: 'Early Bird', badge: <span className="early-bird-badge"><Bird className="h-3 w-3"/> EARLY BIRD</span>, icon: Bird, gradient: 'from-orange-400 to-yellow-500' },
    'night-owl': { name: 'Night Owl', badge: <span className="night-owl-badge"><Moon className="h-3 w-3"/> NIGHT OWL</span>, icon: Moon, gradient: 'from-indigo-600 to-purple-900' },
    'knowledge-knight': { name: 'Knowledge Knight', badge: <span className="knowledge-knight-badge"><ShieldCheck className="h-3 w-3"/> KNIGHT</span>, icon: ShieldCheck, gradient: 'from-slate-600 to-gray-800' },
    streaker: { name: 'Streaker', badge: <span className="streaker-badge"><Flame className="h-3 w-3"/> STREAKER</span>, icon: Flame, gradient: 'from-orange-600 to-red-600' }
};

function UserBadgeDisplay() {
    const { currentUserData, isSuperAdmin, isAdmin } = useAdmin();
    const ownedBadges = [
        (isSuperAdmin) && 'dev',
        (currentUserData?.isCoDev) && 'co-dev',
        (isAdmin) && 'admin',
        (currentUserData?.isVip) && 'vip',
        (currentUserData?.isGM) && 'gm',
        (currentUserData?.isChallenger) && 'challenger',
        (currentUserData?.isStreaker) && 'streaker',
        (currentUserData?.isEarlyBird) && 'early-bird',
        (currentUserData?.isNightOwl) && 'night-owl',
        (currentUserData?.isKnowledgeKnight) && 'knowledge-knight',
    ].filter(Boolean) as BadgeType[];
    if (ownedBadges.length === 0) return null;
    const badgeToShowKey = currentUserData?.showcasedBadge && ownedBadges.includes(currentUserData.showcasedBadge) ? currentUserData.showcasedBadge : ownedBadges[0];
    const badge = badgeDetails[badgeToShowKey];
    if (!badge) return null;
    return (
        <div className="space-y-4">
            <Link href="/dashboard/profile" className="group block">
                <Card className={cn("relative overflow-hidden border-0 transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1", badge.gradient)}>
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/50"></div>
                    <CardContent className="relative p-4 sm:p-6 flex items-center gap-4 sm:gap-6">
                        <div className="p-3 sm:p-4 rounded-full bg-black/20 border-2 border-white/20"><badge.icon className="h-8 w-8 sm:h-10 sm:w-10 text-white"/></div>
                        <div className="flex-1 text-left">
                            <p className="text-xs font-bold text-white/80 uppercase tracking-wider">Your Rank</p>
                            <CardTitle className="text-xl sm:text-2xl font-bold text-white">{badge.name}</CardTitle>
                        </div>
                        <div className="transition-transform group-hover:translate-x-1">{badge.badge}</div>
                    </CardContent>
                </Card>
            </Link>
            <Button asChild variant="outline" className="w-full h-12 border-primary/20 bg-primary/5 hover:bg-primary/10 group rounded-2xl">
                <Link href="/dashboard/badges">
                    <Info className="mr-2 h-4 w-4 text-primary" />
                    <span className="font-bold">Know about Badges in MindMate</span>
                    <ChevronRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </Link>
            </Button>
        </div>
    )
}

export default function DashboardPage() {
    const router = useRouter();
    const pathname = usePathname();
    const { pinnedPage } = usePinnedPage();
    const { currentUserData, isAdmin, isSuperAdmin, featureShowcases } = useAdmin();
    const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
    const [isStreakDialogOpen, setIsStreakDialogOpen] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(true);

    useEffect(() => {
        if (pinnedPage && (pathname === '/dashboard' || pathname === '/dashboard/learning')) {
            const redirectPath = pathname === '/dashboard/learning' ? '/dashboard/guide' : pinnedPage;
            router.replace(redirectPath);
        } else {
            setIsRedirecting(false);
        }
    }, [pinnedPage, pathname, router]);

    if (isRedirecting) return <div className="flex h-full w-full items-center justify-center"><Loader2 className="h-10 w-10 animate-spin" /></div>;

    const credits = currentUserData?.credits ?? 0;
    const streak = currentUserData?.streak ?? 0;
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    return (
    <div className="space-y-8">
        <SignedOut><WelcomeDialog /></SignedOut>
        <StreakMilestonesDialog isOpen={isStreakDialogOpen} onOpenChange={setIsStreakDialogOpen} currentStreak={streak} />
        <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back, {currentUserData?.displayName || 'Student'}!</h1>
            <p className="text-muted-foreground">Here's a snapshot of your study world.</p>
        </div>
        <div className="flex flex-col space-y-8">
            <SignedIn><UserBadgeDisplay /></SignedIn>
            <ShowcaseView showcases={featureShowcases} />
            <SignedIn><GlobalGiftCard /></SignedIn>
            <div className="grid grid-cols-2 gap-4">
                <Card className="group relative text-white overflow-hidden rounded-xl bg-gradient-to-br from-yellow-800 via-slate-900 to-slate-900 shadow-lg shadow-yellow-500/20 flex flex-col justify-center">
                    <CardContent className="p-4 text-center relative z-10">
                        <Medal className="h-10 w-10 mx-auto mb-2 text-yellow-400 animate-gold-shine"/>
                        <h3 className="text-base font-semibold">Your Credits</h3>
                        <p className="text-4xl font-bold text-yellow-400">{hasMasterCard ? '∞' : credits}</p>
                    </CardContent>
                </Card>
                <Card onClick={() => setIsStreakDialogOpen(true)} className="cursor-pointer group relative text-white overflow-hidden rounded-xl bg-gradient-to-br from-orange-800 via-slate-900 to-slate-900 shadow-lg shadow-orange-500/20 flex flex-col justify-center hover:scale-[1.02] transition-transform">
                    <CardContent className="p-4 text-center relative z-10">
                        <Flame className="h-10 w-10 mx-auto mb-2 text-orange-400 animate-flicker"/>
                        <h3 className="text-base font-semibold">Day Streak</h3>
                        <p className="text-4xl font-bold text-orange-400">{streak}</p>
                    </CardContent>
                </Card>
            </div>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>MindMate Focus</CardTitle>
                    <Link href="/dashboard/focus" className="text-sm font-semibold text-primary hover:underline">View All</Link>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-center">
                    {[{ title: 'Pomodoro', icon: Timer, href: '/dashboard/pomodoro', color: 'text-green-400' }, { title: 'Focus Mode', icon: Zap, href: '/dashboard/tracker', color: 'text-yellow-400' }, { title: 'Tracker & Insights', icon: Clock, href: '/dashboard/tracker-insights', color: 'text-blue-400' }, { title: 'Challenger', icon: Swords, href: '/dashboard/challenger', color: 'text-red-400' }].map(tool => (
                        <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                             <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors"><tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.color)} /></div>
                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/leaderboard"><Card className="hover:bg-muted transition-colors"><CardContent className="p-4 flex items-center gap-4"><Trophy className="h-8 w-8 text-amber-400" /><div><h3 className="font-bold text-lg">Leaderboard</h3><p className="text-sm text-muted-foreground">See who's leading.</p></div></CardContent></Card></Link>
                <Link href="/dashboard/tools"><Card className="hover:bg-muted transition-colors"><CardContent className="p-4 flex items-center gap-4"><Wrench className="h-8 w-8 text-lime-400" /><div><h3 className="font-bold text-lg">Tools</h3><p className="text-sm text-muted-foreground">Utilities.</p></div></CardContent></Card></Link>
            </div>
            <Card>
                 <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Quick Access</CardTitle>
                     <Sheet>
                        <SheetTrigger asChild><Button variant="ghost" className="text-primary">View All</Button></SheetTrigger>
                        <SheetContent side="bottom" className="h-auto">
                            <SheetHeader className="text-left"><SheetTitle>All Features</SheetTitle></SheetHeader>
                            <div className="grid grid-cols-4 gap-4 py-4">
                                {[{ title: 'Groups', href: '/dashboard/groups', icon: Users, glow: 'text-green-400' }, { title: 'Alliance Hub', href: '/dashboard/social', icon: Users, glow: 'text-yellow-400' }, { title: 'Quiz Zone', href: '/dashboard/quiz', icon: BrainCircuit, glow: 'text-purple-400' }, { title: 'Marco AI', href: '/dashboard/ai-assistant', icon: Bot, glow: 'text-sky-400' }, { title: 'MM Nexus', href: '/dashboard/schedule', icon: Calendar, glow: 'text-blue-400' }, { title: 'Roadmap', href: '/dashboard/roadmap', icon: MapIcon, glow: 'text-orange-400' }, { title: 'Resources', href: '/dashboard/resources', icon: BookOpen, glow: 'text-orange-400' }, { title: 'Game Zone', href: '/dashboard/game-zone', icon: Gamepad2, glow: 'text-rose-400' }, { title: 'Global Forum', href: '/dashboard/world', icon: Globe, glow: 'text-blue-400' }, { title: 'Reward Zone', href: '/dashboard/reward', icon: Gift, glow: 'text-pink-400' }, { title: 'Leaderboard', href: '/dashboard/leaderboard', icon: Trophy, glow: 'text-amber-400' }, { title: 'Invite & Earn', href: '/dashboard/refer', icon: UserPlus, glow: 'text-green-400' }, { title: 'Tools', href: '/dashboard/tools', icon: Wrench, glow: 'text-lime-400' }, { title: 'Profile', href: '/dashboard/profile', icon: User, glow: 'text-teal-400' }, { title: 'Settings', href: '/dashboard/settings', icon: Settings, glow: 'text-slate-400' }].map(tool => (
                                    <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                                         <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors"><tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.glow)} /></div>
                                        <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors text-center">{tool.title}</p>
                                    </Link>
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </CardHeader>
                <CardContent className="grid grid-cols-4 gap-4 text-center">
                    {[{ title: 'Groups', href: '/dashboard/groups', icon: Users, glow: 'text-green-400' }, { title: 'Alliance Hub', href: '/dashboard/social', icon: Users, glow: 'text-yellow-400' }, { title: 'Quiz Zone', href: '/dashboard/quiz', icon: BrainCircuit, glow: 'text-purple-400' }, { title: 'Marco AI', href: '/dashboard/ai-assistant', icon: Bot, glow: 'text-sky-400' }].map(tool => (
                        <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                             <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors"><tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.glow)} /></div>
                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors text-center">{tool.title}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/reward"><Card className="relative overflow-hidden group"><CardContent className="p-4"><h3 className="font-bold text-lg">Rewards</h3><p className="text-sm text-muted-foreground">Offers</p><Badge className="mt-2 bg-primary/20 text-primary">Active</Badge><Gift className="absolute -bottom-2 -right-2 h-20 w-20 text-primary/10 transition-transform duration-300 group-hover:scale-110" /></CardContent></Card></Link>
                 <Link href="/dashboard/refer"><Card className="relative overflow-hidden group"><CardContent className="p-4"><h3 className="font-bold text-lg">Refer & Earn</h3><p className="text-sm text-muted-foreground">Get ₹100</p><Megaphone className="absolute -bottom-2 -right-2 h-20 w-20 text-primary/10 transition-transform duration-300 group-hover:scale-110" /></CardContent></Card></Link>
            </div>
            {isSurpriseRevealed ? <DailySurpriseCard /> : (
            <Card className="relative overflow-hidden cursor-pointer group bg-gradient-to-tr from-green-400/20 via-teal-500/20 to-emerald-600/20 border-green-500/20 hover:border-green-500/40 transition-all duration-300" onClick={() => setIsSurpriseRevealed(true)}>
                <CardContent className="relative p-6 text-center min-h-[170px] flex flex-col justify-center"><div className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-green-500/20 rounded-full blur-3xl"></div><div className="relative flex flex-col items-center"><motion.div animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}><GiftIcon className="h-10 w-10 text-green-400"/></motion.div><h3 className="text-2xl font-bold mt-2">Click To See Today's Surprise</h3><p className="text-sm text-muted-foreground">A new surprise awaits you every day!</p></div></CardContent>
            </Card>
            )}
            <CommunityPoll />
        </div>
      </div>
  );
}
