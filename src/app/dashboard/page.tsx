
'use client';

import { useState } from 'react';
import { ArrowRight, Bell, CreditCard, Users, BrainCircuit, Medal, BookOpen, Calendar, Zap, Gift, Trophy, Clock, LineChart, RefreshCw, Gamepad2, Swords, Puzzle as PuzzleIcon, ListTodo } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser, SignedIn, SignedOut } from '@clerk/nextjs';
import { useAnnouncements, useUsers } from '@/hooks/use-admin';
import { CommunityPoll } from '@/components/dashboard/community-poll';
import { cn } from '@/lib/utils';
import { WelcomeDialog } from '@/components/dashboard/welcome-dialog';
import { DailySurpriseCard } from '@/components/dashboard/daily-surprise';
import { TypingAnimation } from '@/components/dashboard/typing-animation';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const studyTools = [
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
        title: 'Schedule',
        description: 'Plan your study calendar.',
        icon: Calendar,
        href: '/dashboard/schedule',
        color: 'from-sky-500 to-blue-500',
        textColor: 'text-sky-100',
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

const otherFeatures = [
   {
    title: 'Resources',
    description: 'Premium study materials.',
    icon: BookOpen,
    href: '/dashboard/resources',
    color: 'from-rose-500 to-red-500',
    textColor: 'text-rose-100',
  },
  {
    title: 'Quiz Zone',
    description: 'Test your knowledge & earn.',
    icon: BrainCircuit,
    href: '/dashboard/quiz',
    color: 'from-purple-500 to-indigo-500',
    textColor: 'text-purple-100',
  },
];

const leaderboardOptions = [
    { name: 'All-Time', href: '/dashboard/leaderboard?tab=all-time', icon: Users },
    { name: 'Weekly', href: '/dashboard/leaderboard?tab=weekly', icon: Calendar },
    { name: 'Entertainment', href: '/dashboard/leaderboard?tab=entertainment', icon: Gamepad2 }
]

export default function DashboardPage() {
    const { user } = useUser();
    const { announcements } = useAnnouncements();
    const { currentUserData } = useUsers();
    const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
    const [isShowingPoll, setIsShowingPoll] = useState(false);
    const [isStudyZoneOpen, setIsStudyZoneOpen] = useState(false);
    
    const credits = currentUserData?.credits ?? 0;

    const latestAnnouncement = announcements.length > 0 ? announcements[0] : {
        title: 'Welcome to MindMate!',
        description: 'New features and updates are coming soon. Stay tuned!'
    };

    const handleFlip = () => {
        setIsShowingPoll(!isShowingPoll);
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
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome Back, {currentUserData?.displayName || 'Student'}!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your study world.</p>
      </div>

      <SignedIn>
        {isSurpriseRevealed ? (
          <DailySurpriseCard />
        ) : (
          <Card 
            className="relative overflow-hidden cursor-pointer group bg-gradient-to-tr from-yellow-400/20 via-pink-500/20 to-purple-600/20 border-primary/20 hover:border-primary/40 transition-all duration-300"
            onClick={() => setIsSurpriseRevealed(true)}
          >
            <div className="absolute -inset-2 bg-grid-slate-800 animate-pulse duration-1000"></div>
            <CardContent className="relative p-6 text-center min-h-[170px] flex flex-col justify-center">
                <div className="animate-pulse absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 bg-primary/20 rounded-full blur-3xl"></div>
                <div className="relative flex flex-col items-center">
                  <Gift className="h-10 w-10 text-primary animate-bounce"/>
                  <h3 className="text-2xl font-bold mt-2">Click To See Today's Surprise</h3>
                  <p className="text-sm text-muted-foreground">A new surprise awaits you every day!</p>
                </div>
            </CardContent>
          </Card>
        )}
      </SignedIn>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">

             <div className="relative h-[250px] mb-8 overflow-hidden" style={{ perspective: '1000px' }}>
                 <div 
                    className="relative w-full h-full cursor-pointer transition-transform duration-700" 
                    style={{ transformStyle: 'preserve-3d', transform: isShowingPoll ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                    onClick={handleFlip}
                >
                    <motion.div
                        key="announcement"
                        className="absolute w-full h-full"
                        style={{ backfaceVisibility: 'hidden' }}
                    >
                        <Card className="rainbow-border-card h-full">
                            <CardHeader className="flex flex-row items-start gap-4 p-4 md:p-6">
                                <div className="p-3 rounded-full bg-primary/10">
                                    <Bell className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl text-primary">Latest Announcement</CardTitle>
                                    <CardDescription>Don't miss out on important updates.</CardDescription>
                                </div>
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 text-primary/70 hover:text-primary"><RefreshCw className="h-4 w-4" /></Button>
                            </CardHeader>
                            <CardContent className="p-4 md:px-6">
                                <h3 className="text-xl md:text-2xl font-bold">{latestAnnouncement.title}</h3>
                                <div className="text-muted-foreground mt-2 min-h-[40px]">
                                   <TypingAnimation text={latestAnnouncement.description} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                     <motion.div
                        key="poll"
                        className="absolute w-full h-full"
                         style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                    >
                        <CommunityPoll />
                    </motion.div>
                 </div>
             </div>

            <Dialog>
                <DialogTrigger asChild>
                    <Card className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 hover:-translate-y-1 transition-transform duration-300 ease-in-out">
                         <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] group-hover:opacity-100 transition-opacity duration-300"></div>
                        <CardContent className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                             <div className="p-4 rounded-full bg-amber-500/10 border-2 border-amber-500/30">
                                <Trophy className="h-10 w-10 text-amber-400"/>
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                                <CardTitle className="text-2xl font-bold text-white">Top Achievers</CardTitle>
                                <CardDescription className="text-slate-400 mt-1">See who's dominating the leaderboards and claim your spot at the top!</CardDescription>
                            </div>
                            <Button variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                                View Leaderboards <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardContent>
                    </Card>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Trophy/> Select Leaderboard</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col space-y-3 py-4">
                        {leaderboardOptions.map(option => (
                            <Link key={option.name} href={option.href}>
                                <Button variant="outline" className="w-full justify-start h-14 text-base">
                                    <option.icon className="mr-4 h-5 w-5 text-primary" /> {option.name}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
            
            <AnimatePresence>
                {!isStudyZoneOpen && (
                    <motion.div
                        key="study-zone-gateway"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, height: 0, transition: { duration: 0.3 } }}
                        onClick={() => setIsStudyZoneOpen(true)}
                    >
                         <Card className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-cyan-900 via-blue-900 to-cyan-900 border-cyan-700 hover:-translate-y-1 transition-transform duration-300 ease-in-out">
                             <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_70%)] group-hover:opacity-100 transition-opacity duration-300"></div>
                            <CardContent className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                                 <div className="p-4 rounded-full bg-cyan-500/10 border-2 border-cyan-500/30">
                                    <BrainCircuit className="h-10 w-10 text-cyan-400"/>
                                </div>
                                <div className="flex-1 text-center sm:text-left">
                                    <CardTitle className="text-2xl font-bold text-white">Let's Enter Study Zone</CardTitle>
                                    <CardDescription className="text-slate-400 mt-1">All your tools for focused and productive learning sessions.</CardDescription>
                                </div>
                                <Button variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                                    Begin <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {isStudyZoneOpen && (
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight">Your Study Tools</h2>
                     <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {studyTools.map((tool, i) => (
                            <motion.div key={tool.title} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                                <Link href={tool.href} prefetch={true}>
                                <Card className={cn("overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full flex flex-col bg-gradient-to-br", tool.color)}>
                                     <CardHeader className="flex-row items-center gap-4 p-4">
                                        <div className={cn("p-3 rounded-full bg-white/10", tool.textColor)}>
                                            <tool.icon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <CardTitle className={cn("text-xl font-bold tracking-tight", tool.textColor)}>{tool.title}</CardTitle>
                                        </div>
                                     </CardHeader>
                                     <CardContent className="p-4 pt-0">
                                         <CardDescription className={cn("text-sm", tool.textColor, "opacity-80")}>{tool.description}</CardDescription>
                                     </CardContent>
                                    <CardFooter className="mt-auto bg-black/10 p-3">
                                         <p className={cn("text-sm font-semibold flex items-center w-full justify-end", tool.textColor, "opacity-90")}>
                                             Go to {tool.title} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                         </p>
                                    </CardFooter>
                                </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}


            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Explore More</h2>
                 <div className="grid gap-4 sm:grid-cols-2">
                    {otherFeatures.map((feature, i) => {
                        const cardContent = (
                            <Card className={cn("overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full flex flex-col bg-gradient-to-br", feature.color)}>
                                 <CardHeader className="flex-row items-center gap-4 p-4">
                                    <div className={cn("p-3 rounded-full bg-white/10", feature.textColor)}>
                                        <feature.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle className={cn("text-xl font-bold tracking-tight", feature.textColor)}>{feature.title}</CardTitle>
                                        <CardDescription className={cn("mt-1 text-sm", feature.textColor, "opacity-80")}>{feature.description}</CardDescription>
                                    </div>
                                 </CardHeader>
                                <CardFooter className="mt-auto bg-black/10 p-3">
                                     <p className={cn("text-sm font-semibold flex items-center w-full justify-end", feature.textColor, "opacity-90")}>
                                         Explore Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                     </p>
                                </CardFooter>
                            </Card>
                        );

                        return (
                            <motion.div key={feature.title} custom={i + (isStudyZoneOpen ? studyTools.length : 0)} variants={cardVariants} initial="hidden" animate="visible">
                                <Link href={feature.href} prefetch={true} className="h-full block">
                                   {cardContent}
                                </Link>
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-6">
          <SignedIn>
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center justify-between text-amber-600">
                        <span>Your Credits</span>
                        <Medal className="h-4 w-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-5xl font-bold text-amber-500">{credits}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                    +1 for daily tasks, +5 for perfecting quizzes!
                    </p>
                </CardContent>
            </Card>
          </SignedIn>
        </div>

      </div>

    </div>
  );
}
