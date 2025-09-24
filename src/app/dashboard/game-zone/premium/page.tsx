
'use client';
import Link from "next/link";
import { ArrowLeft, Crown, Atom, Book, Brain, Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Dummy icons to prevent errors since they are used in the dialog content
// Moved to the top to fix initialization error
const BookIcon = (props: any) => <Book {...props} />;
const BrainIcon = (props: any) => <Brain {...props} />;
const SparklesIcon = (props: any) => <Sparkles {...props} />;

const elementQuestModes = [
    {
        id: 'learn',
        title: 'Learn Mode',
        description: 'Explore the table with no pressure.',
        icon: BookIcon,
        href: '/dashboard/game-zone/puzzle/periodic-table/learn',
        color: 'from-blue-500 to-sky-500',
    },
    {
        id: 'challenge',
        title: 'Challenge Mode',
        description: 'Race against the clock.',
        icon: SparklesIcon,
        href: '/dashboard/game-zone/puzzle/periodic-table/challenge',
         color: 'from-red-500 to-rose-500',
    },
     {
        id: 'practice',
        title: 'Practice Mode',
        description: 'Test your knowledge with hints.',
        icon: BrainIcon,
        href: '#',
        color: 'from-amber-500 to-yellow-500',
        disabled: true
    },
];

const premiumGames = [
    {
        title: "Element Quest",
        description: "Master the periodic table by placing elements in their correct spots.",
        icon: Atom,
        href: "/dashboard/game-zone/puzzle/periodic-table/challenge",
        color: "from-cyan-500 to-blue-500",
        dialogContent: (
            <div className="grid gap-4 py-4">
                {elementQuestModes.map(mode => (
                    <Link key={mode.id} href={mode.href} className={cn(mode.disabled && "pointer-events-none")}>
                         <Card className={cn(
                             "group relative overflow-hidden transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1",
                             mode.disabled && "opacity-50"
                         )}>
                            <div className={cn("absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-300 bg-gradient-to-tr", mode.color)}></div>
                            <CardHeader className="relative flex flex-row items-center justify-between p-4">
                                <div className="flex items-center gap-4">
                                    <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", mode.color)}>
                                        <mode.icon className="h-6 w-6"/>
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg">{mode.title}</p>
                                        <p className="text-sm text-muted-foreground">{mode.description}</p>
                                    </div>
                                </div>
                                 <div className="text-muted-foreground group-hover:text-primary transition-colors">
                                    {mode.disabled ? <p className="text-xs font-bold">SOON</p> : <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
                                </div>
                            </CardHeader>
                         </Card>
                    </Link>
                ))}
            </div>
        )
    }
];

export default function PremiumGamesHubPage() {
    return (
        <div className="space-y-8">
            <div>
                <Link href="/dashboard/game-zone" className="text-sm text-muted-foreground hover:text-primary mb-2 inline-block">&larr; Back to Game Zone</Link>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Crown className="h-8 w-8 text-yellow-400 [text-shadow:0_0_8px_currentColor]" />
                    Premium Games
                </h1>
                <p className="text-muted-foreground">Exclusive challenges with legendary rewards.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {premiumGames.map((game, index) => (
                    <Dialog key={game.title}>
                        <DialogTrigger asChild>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="cursor-pointer"
                            >
                                <Card className="h-full flex flex-col justify-between items-center text-center p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                    <div>
                                        <div className={`mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-gradient-to-br ${game.color} mb-4`}>
                                            <game.icon className="h-10 w-10 text-white" />
                                        </div>
                                        <CardTitle>{game.title}</CardTitle>
                                        <CardDescription className="mt-2">{game.description}</CardDescription>
                                    </div>
                                    <Button variant="outline" className="mt-6 w-full">Select Mode</Button>
                                </Card>
                            </motion.div>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-2xl">
                                    <game.icon className="text-primary"/> Select a Game Mode
                                </DialogTitle>
                                <DialogDescription>
                                    Choose how you want to play {game.title}.
                                </DialogDescription>
                            </DialogHeader>
                            {game.dialogContent}
                        </DialogContent>
                    </Dialog>
                ))}
            </div>
        </div>
    )
}
