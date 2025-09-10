
'use client';

import { ArrowRight, Bell, Bot, CreditCard, ListTodo, Users, Vote, BrainCircuit, Medal, BookOpen, Calendar, Zap, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUser } from '@clerk/nextjs';
import { useAnnouncements, useUsers } from '@/hooks/use-admin';
import { CommunityPoll } from '@/components/dashboard/community-poll';
import { cn } from '@/lib/utils';

const features = [
  {
    title: 'Quiz Zone',
    description: 'Challenge yourself, earn credits.',
    icon: BrainCircuit,
    href: '/dashboard/quiz',
    color: 'bg-gradient-to-br from-purple-500 to-indigo-600',
    textColor: 'text-purple-100',
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
    title: 'Resources',
    description: 'Premium study materials.',
    icon: BookOpen,
    href: '/dashboard/resources',
    color: 'bg-gradient-to-br from-rose-500 to-pink-600',
    textColor: 'text-rose-100',
  },
   {
    title: 'Schedule',
    description: 'Plan your study calendar.',
    icon: Calendar,
    href: '/dashboard/schedule',
    color: 'bg-gradient-to-br from-sky-500 to-blue-600',
    textColor: 'text-sky-100',
  },
  {
    title: 'Social Hub',
    description: 'Connect with other students.',
    icon: Users,
    href: '/dashboard/social',
    color: 'bg-gradient-to-br from-amber-500 to-orange-600',
    textColor: 'text-amber-100',
  },
   {
    title: 'Chat with Marco AI',
    description: 'Your personal AI tutor.',
    icon: Bot,
    href: '/dashboard/ai-assistant',
    color: 'bg-gradient-to-br from-slate-600 to-gray-800',
    textColor: 'text-slate-100',
  },
];

export default function DashboardPage() {
    const { user } = useUser();
    const { announcements } = useAnnouncements();
    const { currentUserData } = useUsers();

    const credits = currentUserData?.credits ?? 0;

    const latestAnnouncement = announcements.length > 0 ? announcements[0] : {
        title: 'Welcome to MindMate!',
        description: 'New features and updates are coming soon. Stay tuned!'
    };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome Back, {user?.firstName || 'Student'}!</h1>
        <p className="text-muted-foreground">Here's a snapshot of your study world.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 shadow-lg">
                <CardHeader className="flex flex-row items-start gap-4">
                    <div className="bg-primary/80 text-primary-foreground p-3 rounded-full">
                        <Bell className="h-6 w-6" />
                    </div>
                    <div>
                        <CardTitle className="text-primary text-xl">Latest Announcement</CardTitle>
                        <CardDescription className="text-primary/80">Don't miss out on important updates.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <h3 className="text-2xl font-bold">{latestAnnouncement.title}</h3>
                    <p className="text-muted-foreground mt-2">
                    {latestAnnouncement.description}
                    </p>
                </CardContent>
            </Card>

            <CommunityPoll />
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">Explore Your Toolkit</h2>
                 <div className="grid gap-6 sm:grid-cols-2">
                    {features.map((feature) => (
                        <Link href={feature.href} key={feature.title} prefetch={true}>
                        <Card className={cn("overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ease-in-out h-full flex flex-col", feature.color)}>
                             <CardHeader className="flex-row items-center gap-4">
                                <div className={cn("p-4 rounded-full bg-white/10", feature.textColor)}>
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <div>
                                    <CardTitle className={cn("text-2xl font-extrabold tracking-tight", feature.textColor)}>{feature.title}</CardTitle>
                                    <CardDescription className={cn("mt-1", feature.textColor, "opacity-80")}>{feature.description}</CardDescription>
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
        </div>

        {/* Side Column */}
        <div className="lg:col-span-1 space-y-8">
            <Card className="border-amber-500/20 bg-amber-500/5">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base font-medium flex items-center justify-between text-amber-600">
                        <span>Your Credits</span>
                        <Medal className="h-4 w-4" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-6xl font-bold text-amber-500">{credits}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                    +1 for daily tasks, +5 for perfecting quizzes!
                    </p>
                </CardContent>
            </Card>
        </div>

      </div>

    </div>
  );
}

    