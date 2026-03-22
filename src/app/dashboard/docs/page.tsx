'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Book, Zap, Gem, Users, ShieldCheck, Rocket, Brain, Award, Clock, FileText, Heart, Crown, Swords } from 'lucide-react';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const sections = [
    {
        id: 'getting-started',
        title: 'Getting Started',
        icon: Rocket,
        content: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Welcome to MindMate</h3>
                    <p className="text-muted-foreground">MindMate is an integrated study ecosystem designed to transform your academic journey into an engaging, rewarded experience. This guide will help you master every corner of the platform.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-muted/30">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">First Steps</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                            <li className="list-disc ml-4">Complete your Profile to showcase your Rank.</li>
                            <li className="list-disc ml-4">Start your first <strong>Focus Session</strong> to earn bonus credits.</li>
                            <li className="list-disc ml-4">Join a <strong>Study Clan</strong> to compete with peers.</li>
                        </CardContent>
                    </Card>
                    <Card className="bg-muted/30">
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">Quick Tips</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 text-sm space-y-2">
                            <li className="list-disc ml-4">Use <strong>Dark Mode</strong> for long study nights.</li>
                            <li className="list-disc ml-4">Don't break your <strong>Study Streak</strong> to get massive credit multipliers.</li>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    },
    {
        id: 'economy',
        title: 'Credit Economy',
        icon: Gem,
        content: (
            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                    <Award className="h-8 w-8 text-amber-500 shrink-0" />
                    <div>
                        <h4 className="font-bold text-amber-700 dark:text-amber-300">Credits are the Power of MindMate</h4>
                        <p className="text-sm text-amber-800/80 dark:text-amber-200/80">Everything legendary requires credits. From unlocking premium notes to entering the Quiz Zone.</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h4 className="font-bold text-lg">How to Earn</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                            <span className="text-sm font-medium">Daily Tasks</span>
                            <Badge className="bg-green-500">+1 / Task</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                            <span className="text-sm font-medium">Perfect Quiz</span>
                            <Badge className="bg-green-500">+5 Credits</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                            <span className="text-sm font-medium">Study Streak (5d)</span>
                            <Badge className="bg-green-500">+50 Credits</Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                            <span className="text-sm font-medium">Study Streak (30d)</span>
                            <Badge className="bg-green-500">+100 Credits</Badge>
                        </div>
                    </div>
                </div>
                <Separator />
                <div className="space-y-2">
                    <h4 className="font-bold text-lg">Nexus Emporium</h4>
                    <p className="text-sm text-muted-foreground">Visit the store to buy credit packs or redeem legendary artifacts like <strong>Penalty Shields</strong> or <strong>Streak Freezes</strong>.</p>
                </div>
            </div>
        )
    },
    {
        id: 'productivity',
        title: 'Productivity Tools',
        icon: Zap,
        content: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Deep Focus Engine</h3>
                    <p className="text-muted-foreground">We use cognitive science to help you stay in the flow state.</p>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card">
                        <Clock className="h-6 w-6 text-primary shrink-0" />
                        <div>
                            <h5 className="font-bold">MindMate Focus</h5>
                            <p className="text-sm text-muted-foreground">High-reward sessions. You must keep the tab active. If you navigate away during an active 1-5 hour session, you incur a 20 credit penalty (unless you have a shield).</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card">
                        <Brain className="h-6 w-6 text-purple-500 shrink-0" />
                        <div>
                            <h5 className="font-bold">Pomodoro Timer</h5>
                            <p className="text-sm text-muted-foreground">Classic study-break cycles. 25 minutes of work, 5 minutes of rest. Ideal for medium-term tasks.</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-xl border bg-card">
                        <FileText className="h-6 w-6 text-orange-500 shrink-0" />
                        <div>
                            <h5 className="font-bold">Nexus Calendar</h5>
                            <p className="text-sm text-muted-foreground">Track deadines, exams, and personal study targets. Sync your daily routine with your long-term goals.</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'community',
        title: 'Community Protocol',
        icon: Users,
        content: (
            <div className="space-y-6">
                <div>
                    <h3 className="text-2xl font-bold mb-2">Alliance & Forums</h3>
                    <p className="text-muted-foreground">Studying is a multiplayer game in MindMate.</p>
                </div>
                <div className="space-y-4">
                    <div className="p-4 rounded-xl border-l-4 border-l-sky-500 bg-muted/20">
                        <h5 className="font-bold text-sky-600 dark:text-sky-400">Alliance Hub</h5>
                        <p className="text-sm text-muted-foreground">Form private alliances with other students. Share notes privately and maintain direct communication.</p>
                    </div>
                    <div className="p-4 rounded-xl border-l-4 border-l-blue-500 bg-muted/20">
                        <h5 className="font-bold text-blue-600 dark:text-blue-400">Global Forum</h5>
                        <p className="text-sm text-muted-foreground">A massive public discussion board. Share wisdom, ask doubts, and watch out for <strong>Credit Rain</strong> from the Sentinel.</p>
                    </div>
                    <div className="p-4 rounded-xl border-l-4 border-l-green-500 bg-muted/20">
                        <h5 className="font-bold text-green-600 dark:text-green-400">Study Clans</h5>
                        <p className="text-sm text-muted-foreground">Create or join a Clan. Level up your clan by studying together. Max level clans get custom banners and legendary statuses.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'safety',
        title: 'Safety & Security',
        icon: ShieldCheck,
        content: (
            <div className="space-y-6">
                <div className="p-6 text-center border-2 border-dashed rounded-2xl">
                    <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold">Safe Study Environment</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">We maintain a strict code of conduct to ensure MindMate remains a productive haven for serious students.</p>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-destructive/20 bg-destructive/5">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Strict Bans</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                Harassment, spamming, or sharing illegal content in the Global Forum results in an <strong>Permanent UID Ban</strong>.
                            </CardContent>
                        </Card>
                        <Card className="border-blue-500/20 bg-blue-500/5">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm">Data Privacy</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0 text-xs text-muted-foreground">
                                Your study logs and private messages are encrypted. We never share your data with third-party advertisers.
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        )
    }
];

export default function DocumentationPage() {
    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <div className="text-center space-y-4">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-b from-foreground to-muted-foreground bg-clip-text text-transparent">
                        MINDMATE DOCS
                    </h1>
                    <p className="text-muted-foreground text-lg">The comprehensive atlas for your academic ascent.</p>
                </motion.div>
            </div>

            <Card className="border-primary/20 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <Tabs defaultValue="getting-started" className="flex flex-col md:flex-row h-full md:min-h-[600px]">
                    <TabsList className="md:w-64 h-full flex flex-col items-stretch bg-muted/30 p-4 gap-2 rounded-none border-r">
                        <div className="px-2 py-2 mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Navigation</div>
                        {sections.map(section => (
                            <TabsTrigger 
                                key={section.id} 
                                value={section.id}
                                className="w-full justify-start gap-3 px-4 py-3 h-auto data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-sm transition-all"
                            >
                                <section.icon className="h-4 w-4 shrink-0" />
                                {section.title}
                            </TabsTrigger>
                        ))}
                        <div className="mt-auto p-4 rounded-xl bg-primary/10 border border-primary/20">
                            <p className="text-[10px] font-black uppercase text-primary mb-1">System Version</p>
                            <p className="text-xs font-bold font-mono">v1.5 Enterprise</p>
                        </div>
                    </TabsList>
                    
                    <div className="flex-1">
                        <ScrollArea className="h-full">
                            <div className="p-8 md:p-12">
                                {sections.map(section => (
                                    <TabsContent key={section.id} value={section.id} className="m-0 focus-visible:ring-0 outline-none">
                                        <motion.div 
                                            initial={{ opacity: 0, x: 20 }} 
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex items-center gap-4 mb-8">
                                                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                                    <section.icon className="h-8 w-8" />
                                                </div>
                                                <h2 className="text-4xl font-black tracking-tight">{section.title}</h2>
                                            </div>
                                            {section.content}
                                        </motion.div>
                                    </TabsContent>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </Tabs>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-primary">
                            <Crown className="h-4 w-4"/> Elite Benefits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Unlock the <strong>Elite Member</strong> badge to gain access to the daily treasury (+20 credits, free spins).
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-primary">
                            <Swords className="h-4 w-4"/> Clan Wars
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Clan XP is earned by every member who studies using the <strong>Time Tracker</strong>. Collaboration is key.
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2 text-primary">
                            <ShieldCheck className="h-4 w-4"/> Verified Skills
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                        Perfected quizzes showcase your true mastery. Perfect more than 10 to earn the <strong>Scholar</strong> status.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
