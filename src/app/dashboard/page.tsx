
'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Bell, CreditCard, Users, BrainCircuit, Medal, BookOpen, Calendar, Zap, Gift, Trophy, Clock, LineChart, RefreshCw, Gamepad2, Swords, Puzzle as PuzzleIcon, ListTodo, Wrench, Lock, Crown, Bot, Vote, Sparkles as SparklesIcon, Rocket, Flame, Code, ShieldCheck, Timer } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useAnnouncements, useUsers, useAdmin, FeatureShowcase } from '@/hooks/use-admin';
import { CommunityPoll } from '@/components/dashboard/community-poll';
import { cn } from '@/lib/utils';
import { WelcomeDialog } from '@/components/dashboard/welcome-dialog';
import { DailySurpriseCard } from '@/components/dashboard/daily-surprise';
import { TypingAnimation } from '@/components/dashboard/typing-animation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GlobalGiftCard } from '@/components/dashboard/global-gift';
import { lockableFeatures, type LockableFeature } from '@/lib/features';
import { FeatureUnlockDialog } from '@/components/dashboard/feature-unlock-dialog';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import Autoplay from "embla-carousel-autoplay"
import { format, parseISO } from 'date-fns';
import { DailyTreasuryDialog } from '@/components/dashboard/DailyTreasuryDialog';
import { useRewards } from '@/hooks/use-rewards';


const studyTools = [
    {
        title: 'MindMate Nexus',
        description: 'Your new Study Command Center.',
        icon: Calendar,
        href: '/dashboard/schedule',
        color: 'from-sky-500 to-blue-500',
        textColor: 'text-sky-100',
    },
    {
        title: 'Time Tracker',
        description: 'Log and manage your study sessions.',
        icon: Clock,
        href: '/dashboard/time-tracker',
        color: 'from-cyan-500 to-blue-500',
        textColor: 'text-cyan-100',
    },
    {
        title: 'Study Insights',
        description: 'Visualize your progress and patterns.',
        icon: LineChart,
        href: '/dashboard/insights',
        color: 'from-pink-500 to-rose-500',
        textColor: 'text-pink-100',
    },
    {
        title: 'Focus Mode',
        description: 'Deep work sessions, rewarded.',
        icon: Zap,
        href: '/dashboard/tracker',
        color: 'from-green-500 to-teal-500',
        textColor: 'text-green-100',
    },
    {
        title: 'To-Dos',
        description: 'Manage your daily tasks.',
        icon: ListTodo,
        href: '/dashboard/todos',
        color: 'from-amber-500 to-orange-500',
        textColor: 'text-amber-100',
    },
];

const exploreFeatures = [
   {
    id: 'resources',
    title: 'Resources',
    description: 'Premium study materials.',
    icon: BookOpen,
    href: '/dashboard/resources',
    color: 'from-rose-500 to-red-500',
    textColor: 'text-rose-100',
  },
  {
    id: 'quiz-zone',
    title: 'Quiz Zone',
    description: 'Test your knowledge & earn.',
    icon: BrainCircuit,
    href: '/dashboard/quiz',
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-100',
  },
   {
    id: 'game-zone',
    title: 'Game Zone',
    description: 'Play games, relax, and earn!',
    icon: Gamepad2,
    href: '/dashboard/game-zone',
    color: 'from-blue-500 to-sky-500',
    textColor: 'text-blue-100',
  },
   {
    id: 'reward-zone',
    title: 'Reward Zone',
    description: 'Claim daily rewards & prizes.',
    icon: Gift,
    href: '/dashboard/reward',
    color: 'from-pink-500 to-rose-500',
    textColor: 'text-pink-100',
  },
];

const leaderboardOptions = [
    { name: 'All-Time', href: '/dashboard/leaderboard?tab=all-time', icon: Users },
    { name: 'Weekly', href: '/dashboard/leaderboard?tab=weekly', icon: Calendar },
    { name: 'Game Zone', href: '/dashboard/leaderboard?tab=game-zone', icon: Gamepad2 }
]

const focusTools = [
    {
        title: 'Pomodoro',
        description: 'Classic timer for focused sprints.',
        icon: Timer,
        href: '/dashboard/pomodoro',
        color: 'from-green-800 via-slate-900 to-slate-900',
        shadow: 'shadow-green-500/20',
        iconColor: 'text-green-400',
    },
    {
        title: 'Focus Mode',
        description: 'Lock in for long, rewarded sessions.',
        icon: Zap,
        href: '/dashboard/tracker',
        color: 'from-yellow-800 via-slate-900 to-slate-900',
        shadow: 'shadow-yellow-500/20',
        iconColor: 'text-yellow-400',
    },
    {
        title: 'Tracker & Insights',
        description: 'Log time and see your progress.',
        icon: Clock,
        href: '/dashboard/tracker-insights',
        color: 'from-blue-800 via-slate-900 to-slate-900',
        shadow: 'shadow-blue-500/20',
        iconColor: 'text-blue-400',
    },
    {
        title: 'Challenger',
        description: 'Forge discipline, win big.',
        icon: Swords,
        href: '/dashboard/challenger',
        color: 'from-red-800 via-slate-900 to-slate-900',
        shadow: 'shadow-red-500/20',
        iconColor: 'text-red-400',
    }
];

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
                        <CarouselPrevious className="left-2 hidden sm:flex" />
                        <CarouselNext className="right-2 hidden sm:flex" />
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

const badgeShowcaseItems = [
    {
        name: 'Challenger',
        description: 'Awarded to users who successfully complete an official study challenge.',
        badge: <span className="challenger-badge"><Swords className="h-3 w-3"/> Challenger</span>
    },
    {
        name: 'Elite Member',
        description: 'Awarded by admins to the most dedicated and active users.',
        badge: <span className="elite-badge"><Crown className="h-3 w-3" /> ELITE</span>
    },
    {
        name: 'Game Master',
        description: 'Awarded weekly to the #1 player on the Game Zone leaderboard.',
        badge: <span className="gm-badge">GM</span>
    },
    {
        name: 'Admin',
        description: 'For the moderators and administrators of MindMate.',
        badge: <span className="admin-badge"><ShieldCheck className="h-3 w-3" /> ADMIN</span>
    },
    {
        name: 'Co-Developer',
        description: 'For the co-developers of the MindMate platform.',
        badge: <span className="co-dev-badge"><Code className="h-3 w-3"/> Co-Dev</span>
    },
    {
        name: 'Developer',
        description: 'The creators and developers of the MindMate platform.',
        badge: <span className="dev-badge"><Code className="h-3 w-3" /> DEV</span>
    }
];

function BadgeShowcase() {
    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight">App Badges</h2>
            <Carousel 
                className="w-full"
                plugins={[
                    Autoplay({
                      delay: 3000,
                      stopOnInteraction: true,
                    }),
                ]}
                opts={{ loop: true }}
            >
                <CarouselContent className="-ml-4">
                    {badgeShowcaseItems.map((item, index) => (
                        <CarouselItem key={index} className="pl-4 md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <Card className="h-full">
                                    <CardContent className="flex flex-col items-center justify-center p-6 text-center gap-4">
                                        {item.badge}
                                        <p className="font-bold mt-2">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">{item.description}</p>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                 <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </div>
    );
}

export default function DashboardPage() {
    const { user } = useUser();
    const { currentUserData, featureLocks, isAdmin, isSuperAdmin, featureShowcases } = useAdmin();
    const { dailyLoginState, loading: rewardsLoading } = useRewards();
    const [isTreasuryOpen, setIsTreasuryOpen] = useState(false);
    
    const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
    const [isStudyZoneOpen, setIsStudyZoneOpen] = useState(false);
    const [isExploreZoneOpen, setIsExploreZoneOpen] = useState(false);
    const [featureToUnlock, setFeatureToUnlock] = useState<LockableFeature | null>(null);
    const [isTypingAnimationDone, setIsTypingAnimationDone] = useState(false);
    
    useEffect(() => {
        if (!rewardsLoading && dailyLoginState.canClaim) {
            setIsTreasuryOpen(true);
        } else if (!rewardsLoading && !dailyLoginState.canClaim) {
            setIsTreasuryOpen(false);
        }
    }, [rewardsLoading, dailyLoginState.canClaim]);

    const credits = currentUserData?.credits ?? 0;
    const streak = currentUserData?.streak ?? 0;
    const isVip = !!currentUserData?.isVip;
    const isGM = !!currentUserData?.isGM;
    const isSpecialUser = isVip || isGM || isAdmin || isSuperAdmin;
    const hasMasterCard = currentUserData?.masterCardExpires && new Date(currentUserData.masterCardExpires) > new Date();

    const handleFeatureClick = (e: React.MouseEvent, featureId: LockableFeature['id'], isLocked: boolean) => {
        if (isLocked) {
            e.preventDefault();
            const feature = lockableFeatures.find(f => f.id === featureId);
            if (feature) {
                setFeatureToUnlock(feature);
            }
        }
    }
    
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: i * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };


  return (
    <div className="space-y-8">
      <SignedOut>
        <WelcomeDialog />
      </SignedOut>
      
       <SignedIn>
        <DailyTreasuryDialog isOpen={isTreasuryOpen} onOpenChange={setIsTreasuryOpen} />
      </SignedIn>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back, {currentUserData?.displayName || 'Student'}!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your study world.</p>
      </div>

       <div className="flex flex-col space-y-8">
        <SignedIn>
            <ShowcaseView showcases={featureShowcases} />
            <GlobalGiftCard />

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
                    {focusTools.map(tool => (
                        <Link href={tool.href} key={tool.title} className="flex flex-col items-center gap-2 group">
                             <div className="p-4 rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                                <tool.icon className={cn("h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors", tool.iconColor)} />
                            </div>
                            <p className="text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">{tool.title}</p>
                        </Link>
                    ))}
                </CardContent>
            </Card>

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
            <BadgeShowcase />
        </SignedIn>

        {featureToUnlock && (
            <FeatureUnlockDialog
                feature={featureToUnlock}
                isOpen={!!featureToUnlock}
                onOpenChange={(isOpen) => !isOpen && setFeatureToUnlock(null)}
            />
        )}
      </div>
    </div>
  );
}
