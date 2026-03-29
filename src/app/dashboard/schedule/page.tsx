
'use client';

import { NexusView } from '@/components/schedule/nexus-view';
import { TodoList } from '@/components/todos/todo-list';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, ListTodo, Map, ArrowLeft, Brain, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

type NexusViewType = 'grid' | 'nexus' | 'todos' | 'roadmap' | 'blurting';

const featureCards = [
    {
        id: 'nexus',
        title: 'Nexus Calendar',
        description: 'Master schedule for all upcoming missions.',
        icon: Calendar,
        gradient: 'from-sky-500/20 via-blue-600/10 to-transparent',
        border: 'border-sky-500/30',
        glow: 'shadow-sky-500/20',
        iconColor: 'text-sky-400'
    },
    {
        id: 'todos',
        title: 'Daily Tasks',
        description: 'Tactical execution of your daily goals.',
        icon: ListTodo,
        gradient: 'from-amber-500/20 via-orange-600/10 to-transparent',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/20',
        iconColor: 'text-amber-400'
    },
    {
        id: 'roadmap',
        title: 'Study Roadmap',
        description: 'Long-term strategic path to mastery.',
        icon: Map,
        gradient: 'from-purple-500/20 via-indigo-600/10 to-transparent',
        border: 'border-purple-500/30',
        glow: 'shadow-purple-500/20',
        iconColor: 'text-purple-400'
    },
    {
        id: 'blurting',
        title: 'Blurting Sprint',
        description: 'High-intensity active recall protocol.',
        icon: Brain,
        gradient: 'from-emerald-500/20 via-green-600/10 to-transparent',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
        iconColor: 'text-emerald-400'
    },
]

export default function SchedulePage() {
    const [view, setView] = useState<NexusViewType>('grid');
    const router = useRouter();

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 10 },
        visible: (i: number) => ({
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                delay: i * 0.05,
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1]
            }
        })
    };
    
    const handleCardClick = (id: NexusViewType) => {
        if (id === 'roadmap') {
            router.push('/dashboard/roadmap');
        } else if (id === 'blurting') {
            router.push('/dashboard/study/blurting-sprint');
        } else {
            setView(id);
        }
    };

    if (view !== 'grid') {
        let content;
        let title;
        let description;
        if (view === 'nexus') {
            content = <NexusView />;
            title = "Nexus Calendar";
            description = "Your master schedule for all events.";
        } else if (view === 'todos') {
            content = <TodoList />;
            title = "Daily To-Do List";
            description = "Manage your day-to-day tasks.";
        }

        return (
             <div className="space-y-4">
                <Button variant="outline" onClick={() => setView('grid')} className="rounded-full px-6">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Nexus
                </Button>
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic">{title}</h1>
                    <p className="text-muted-foreground font-medium">{description}</p>
                </div>
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                    {content}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <div className="relative">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl opacity-50" />
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter flex items-center gap-3 italic uppercase text-shadow-glow">
                    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 shadow-xl shadow-primary/5">
                        <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    MindMate Nexus
                </h1>
                <p className="text-lg text-muted-foreground mt-3 font-medium max-w-2xl">Study Command Center. Initialize mission protocols and master your schedule.</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 relative z-10">
                {featureCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                         <button onClick={() => handleCardClick(card.id as NexusViewType)} className="w-full h-full text-left group">
                            <Card className={cn(
                                "relative h-full w-full overflow-hidden rounded-[2.5rem] border-2 transition-all duration-500 bg-card/50 backdrop-blur-xl min-h-[220px]",
                                card.border,
                                card.glow
                            )}>
                                 {/* Dynamic Background Effect */}
                                 <div className={cn("absolute inset-0 bg-gradient-to-br opacity-40 group-hover:opacity-60 transition-opacity", card.gradient)} />
                                 <div className="absolute inset-0 bg-grid-slate-800/50 [mask-image:linear-gradient(to_bottom,white_10%,transparent_90%)]" />
                                 
                                 <CardContent className="relative z-10 flex h-full flex-col justify-between p-8">
                                     <div className="space-y-4">
                                        <div className={cn("p-3 rounded-2xl bg-black/20 backdrop-blur-md w-fit border border-white/5 shadow-xl transition-transform duration-500 group-hover:scale-110", card.iconColor)}>
                                            <card.icon className="h-8 w-8" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic leading-tight">{card.title}</h3>
                                            <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed opacity-80">{card.description}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Sparkles className={cn("h-4 w-4 animate-pulse", card.iconColor)} />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Protocol</span>
                                        </div>
                                        <div className={cn("text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full bg-white/5 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors duration-300", card.iconColor)}>
                                            Initialize
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                         </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
