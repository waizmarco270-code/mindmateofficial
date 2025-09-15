'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutGrid, List, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

type CalendarView = 'month' | 'week' | 'agenda';

export function NexusView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    return (
        <Card className="h-[75vh] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between border-b">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Button variant="outline" size="icon">
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon">
                             <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <h2 className="text-xl font-bold">
                        {format(currentDate, 'MMMM yyyy')}
                    </h2>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-muted p-1">
                     <Button
                        variant={view === 'month' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('month')}
                        className="transition-all"
                    >
                        <LayoutGrid className="h-4 w-4 mr-2"/>
                        Month
                    </Button>
                     <Button
                        variant={view === 'week' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('week')}
                        className="transition-all"
                    >
                        <Calendar className="h-4 w-4 mr-2"/>
                        Week
                    </Button>
                     <Button
                        variant={view === 'agenda' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setView('agenda')}
                        className="transition-all"
                    >
                        <List className="h-4 w-4 mr-2"/>
                        Agenda
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="text-center text-muted-foreground"
                    >
                        <p className="font-bold text-lg">Coming Soon!</p>
                        <p>The <span className="capitalize font-semibold text-primary">{view}</span> view will be built here.</p>
                    </motion.div>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
