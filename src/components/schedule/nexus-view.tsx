

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutGrid, List, ChevronLeft, ChevronRight, Target, Edit } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek as endOfWeekDateFns, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '../ui/separator';
import { useDroppable } from '@dnd-kit/core';

type CalendarView = 'month' | 'week' | 'agenda';

function DroppableDay({ day, isSelected, isTodayFlag, isCurrentMonth, onClick, children }: { day: Date, isSelected: boolean, isTodayFlag: boolean, isCurrentMonth: boolean, onClick: () => void, children: React.ReactNode }) {
    const { isOver, setNodeRef } = useDroppable({
        id: day.toISOString().split('T')[0], // Use YYYY-MM-DD as ID
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                "border-r border-b p-2 flex flex-col transition-colors cursor-pointer hover:bg-accent",
                !isCurrentMonth && "bg-muted/30 text-muted-foreground/50",
                isSelected && "bg-primary/10 ring-2 ring-primary z-10",
                isOver && "bg-primary/20 ring-2 ring-primary z-20"
            )}
        >
            <div className={cn(
                "h-7 w-7 flex items-center justify-center rounded-full text-sm",
                 isTodayFlag && !isSelected && "bg-primary text-primary-foreground font-bold"
            )}>
                {format(day, 'd')}
            </div>
            {children}
        </div>
    );
}


export function NexusView() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');

    const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeekDateFns(monthEnd, { weekStartsOn: 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const renderMonthView = () => (
         <div className="flex flex-col flex-1">
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-muted-foreground border-b">
                {weekDays.map(day => (
                    <div key={day} className="py-2">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-1">
                {days.map(day => (
                    <DroppableDay
                        key={day.toString()}
                        day={day}
                        isSelected={isSameDay(day, selectedDate)}
                        isTodayFlag={isToday(day)}
                        isCurrentMonth={isSameMonth(day, monthStart)}
                        onClick={() => setSelectedDate(day)}
                    >
                       {/* Event placeholders will go here */}
                    </DroppableDay>
                ))}
            </div>
        </div>
    );

    return (
       <div className="h-[calc(100vh-12rem)] min-h-[700px]">
            <Card className="h-full flex flex-col">
                <div className="flex flex-row items-center justify-between border-b p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <h2 className="text-xl font-bold">
                            {format(currentMonth, 'MMMM yyyy')}
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
                </div>
                    <div className="flex-1 flex items-stretch justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="w-full flex flex-col"
                        >
                            {view === 'month' && renderMonthView()}
                            {(view === 'week' || view === 'agenda') && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground p-4">
                                    <p className="font-bold text-lg">Coming Soon!</p>
                                    <p>The <span className="capitalize font-semibold text-primary">{view}</span> view will be built here.</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Card>
       </div>
    );
}
