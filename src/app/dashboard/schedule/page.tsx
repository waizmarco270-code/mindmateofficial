

'use client';

import { NexusView } from '@/components/schedule/nexus-view';
import { TodoList } from '@/components/todos/todo-list';
import { useState } from 'react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ListTodo, Map, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type NexusView = 'grid' | 'nexus' | 'todos';

const featureCards = [
    {
        id: 'nexus',
        title: 'Nexus Calendar',
        description: 'Your master schedule for all events.',
        icon: Calendar,
        color: 'from-sky-500 to-blue-500 shadow-blue-500/30'
    },
    {
        id: 'todos',
        title: 'Daily To-Do List',
        description: 'Manage your day-to-day tasks.',
        icon: ListTodo,
        color: 'from-amber-500 to-orange-500 shadow-orange-500/30'
    },
]

export default function SchedulePage() {
    const [view, setView] = useState<NexusView>('grid');

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
                <Button variant="outline" onClick={() => setView('grid')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Nexus
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    <p className="text-muted-foreground">{description}</p>
                </div>
                {content}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Calendar className="h-8 w-8 text-primary" />
                    MindMate Nexus
                </h1>
                <p className="text-muted-foreground">Your Study Command Center. Select a tool to get started.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featureCards.map((card, i) => (
                    <motion.div
                        key={card.id}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        custom={i}
                    >
                         <button onClick={() => setView(card.id as NexusView)} className="w-full h-full text-left">
                            <Card className={cn("group relative h-full w-full overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2", card.color)}>
                                 <div className="relative z-10 flex h-full flex-col justify-between rounded-xl p-6 bg-card">
                                     <div className="flex items-start justify-between">
                                        <div className="space-y-2">
                                            <h3 className="text-2xl font-bold text-card-foreground">{card.title}</h3>
                                            <p className="text-sm text-muted-foreground">{card.description}</p>
                                        </div>
                                         <card.icon className="h-10 w-10 text-muted-foreground transition-transform duration-300 group-hover:scale-110" />
                                    </div>
                                </div>
                            </Card>
                         </button>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
