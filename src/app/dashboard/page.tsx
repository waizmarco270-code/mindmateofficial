
'use client';

import { useState } from 'react';
import { ArrowRight, Bell, Bot, CreditCard, ListTodo, Users, Vote, BrainCircuit, Medal, BookOpen, Calendar, Zap, MessageSquare, Gift, Trophy, Globe, Clock, LineChart } from 'lucide-react';
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

const features = [
  {
    title: 'Leaderboard',
    description: 'See who is at the top.',
    icon: Trophy,
    href: '/dashboard/leaderboard',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    textColor: 'text-purple-100',
  },
   {
    title: 'Resources',
    description: 'Premium study materials.',
    icon: BookOpen,
    href: '/dashboard/resources',
    color: 'bg-gradient-to-br from-rose-500 to-pink-600',
    textColor: 'text-rose-100',
  },
  {
    title: 'Focus Mode',
    description: 'Deep work sessions, rewarded.',
    icon: Zap,
    href: '/dashboard/tracker',
    color: 'bg-gradient-to-br from-green-500 to-teal-600',
    textColor: 'text-green-100',
  },
   {
    title: 'Schedule',
    description: 'Plan your study calendar.',
    icon: Calendar,
    href: '/dashboard/schedule',
    color: 'bg-gradient-to-br from-sky-500 to-blue-600',
    textColor: 'text-sky-100',
  },
];

const studyTools = [
    {
        title: 'Time Tracker',
        description: 'Log and manage the time you spend on each subject.',
        icon: Clock,
        href: '/dashboard/time-tracker',
        color: 'bg-gradient-to-br from-cyan-500 to-blue-600',
        textColor: 'text-cyan-100',
    },
    {
        title: 'Study Insights',
        description: 'Visualize your study patterns and progress over time.',
        icon: LineChart,
        href: '/dashboard/insights',
        color: 'bg-gradient-to-br from-pink-500 to-rose-600',
        textColor: 'text-pink-100',
    }
]

export default function DashboardPage() {
    const { user } = useUser();
    const { announcements } = useAnnouncements();
    const { currentUserData } = useUsers();
    const [isSurpriseRevealed, setIsSurpriseRevealed] = useState(false);
    const [isTypingAnimationDone, setIsTypingAnimationDone] = useState(false);
    
    const credits = currentUserData?.credits ?? 0;

    const latestAnnouncement = announcements.length > 0 ? announcements[0] : {
        title: 'Welcome to MindMate!',
        description: 'New features and updates are coming soon. Stay tuned!'
    };

  return (
    <div className="space-y-6">
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
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-orange-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <Card className="relative" onClick={() => setIsTypingAnimationDone(true)} >
                    <CardHeader className="flex flex-row items-start gap-4 p-4 md:p-6">
                        <div className="p-3 rounded-full bg-primary/20 animate-pulse">
                            <Bell className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl text-primary [text-shadow:0_0_8px_hsl(var(--primary)/50%)]">Latest Announcement</CardTitle>
                            <CardDescription className="text-primary/80">Don't miss out on important updates.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6 pt-0">
                        <h3 className="text-xl md:text-2xl font-bold">{latestAnnouncement.title}</h3>
                        <div className="text-muted-foreground mt-2 min-h-[40px]">
                           {isTypingAnimationDone ? (
                             <p>{latestAnnouncement.description}</p>
                           ) : (
                             <TypingAnimation text={latestAnnouncement.description} />
                           )}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Your Study Tools</h2>
                 <div className="grid gap-4 sm:grid-cols-2">
                    {studyTools.map((tool) => (
                        <Link href={tool.href} key={tool.title} prefetch={true}>
                        <Card className={cn("overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full flex flex-col", tool.color)}>
                             <CardHeader className="flex-row items-center gap-4 p-4">
                                <div className={cn("p-3 rounded-full bg-white/10", tool.textColor)}>
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className={cn("text-xl font-bold tracking-tight", tool.textColor)}>{tool.title}</CardTitle>
                                    <CardDescription className={cn("mt-1 text-sm", tool.textColor, "opacity-80")}>{tool.description}</CardDescription>
                                </div>
                             </CardHeader>
                            <CardFooter className="mt-auto bg-black/10 p-3">
                                 <p className={cn("text-sm font-semibold flex items-center w-full justify-end", tool.textColor, "opacity-90")}>
                                     Go to {tool.title} <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                 </p>
                            </CardFooter>
                        </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Explore Your Toolkit</h2>
                 <div className="grid gap-4 sm:grid-cols-2">
                    {features.map((feature) => (
                        <Link href={feature.href} key={feature.title} prefetch={true}>
                        <Card className={cn("overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full flex flex-col", feature.color)}>
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
                        </Link>
                    ))}
                </div>
            </div>
            
            <CommunityPoll />
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

    