
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, LayoutGrid, List, ChevronLeft, ChevronRight, PlusCircle, Edit, Circle, GripVertical } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek as endOfWeekDateFns, eachDayOfInterval, isSameMonth, isToday, isSameDay, addWeeks, subWeeks, eachWeekOfInterval, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Separator } from '../ui/separator';
import { Calendar } from '../ui/calendar';
import { useLocalStorage } from '@/hooks/use-local-storage';

type CalendarView = 'month' | 'week' | 'agenda';

interface NexusEvent {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD format
    color: 'red' | 'blue' | 'green' | 'yellow' | 'purple';
}

const colorMap = {
    red: 'bg-red-500/80 border-red-500/80',
    blue: 'bg-blue-500/80 border-blue-500/80',
    green: 'bg-green-500/80 border-green-500/80',
    yellow: 'bg-yellow-500/80 border-yellow-500/80',
    purple: 'bg-purple-500/80 border-purple-500/80',
};

const colorDotMap = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
}

export function NexusView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [view, setView] = useState<CalendarView>('month');
    const [events, setEvents] = useLocalStorage<NexusEvent[]>('nexus-events', []);
    
    // Add Event Dialog State
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState<Date | undefined>(new Date());
    const [eventColor, setEventColor] = useState<NexusEvent['color']>('blue');

    const handlePrev = () => {
        if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    };
    const handleNext = () => {
        if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
        if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    };

    const monthStart = startOfMonth(currentDate);
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ 
        start: startOfWeek(monthStart, { weekStartsOn: 1 }), 
        end: endOfWeekDateFns(endOfMonth(currentDate), { weekStartsOn: 1 }) 
    });
    
    const weekDaysForView = eachDayOfInterval({
        start: weekStart,
        end: endOfWeekDateFns(weekStart, { weekStartsOn: 1 })
    });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    const eventsByDate = useMemo(() => {
        return events.reduce((acc, event) => {
            const date = event.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(event);
            return acc;
        }, {} as Record<string, NexusEvent[]>);
    }, [events]);

    const handleAddEvent = () => {
        if (!eventTitle || !eventDate) return;
        
        const newEvent: NexusEvent = {
            id: Date.now().toString(),
            title: eventTitle,
            description: eventDescription,
            date: format(eventDate, 'yyyy-MM-dd'),
            color: eventColor,
        };
        
        setEvents([...events, newEvent]);

        // Reset form
        setIsAddDialogOpen(false);
        setEventTitle('');
        setEventDescription('');
        setEventDate(new Date());
        setEventColor('blue');
    };
    
    const selectedDateEvents = useMemo(() => {
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        return eventsByDate[dateKey] || [];
    }, [selectedDate, eventsByDate]);

    // Moved useMemo to top level of the component
    const upcomingEvents = useMemo(() => {
        return Object.entries(eventsByDate)
            .map(([date, events]) => ({ date: addDays(new Date(date), 1), events })) // Fix for timezone issue
            .filter(item => item.date >= startOfWeek(new Date(), { weekStartsOn: 1 }))
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, [eventsByDate]);


    const renderMonthView = () => (
         <div className="flex flex-col flex-1">
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-muted-foreground border-b">
                {weekDays.map(day => (
                    <div key={day} className="py-2 border-r last:border-r-0">{day}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 grid-rows-6 flex-1">
                {days.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dayKey] || [];
                    const isSelected = isSameDay(day, selectedDate);

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => setSelectedDate(day)}
                            className={cn(
                                "border-r border-b p-2 flex flex-col transition-colors cursor-pointer hover:bg-accent last:border-r-0",
                                !isSameMonth(day, monthStart) && "bg-muted/30 text-muted-foreground/50",
                                isSelected && "bg-primary/10 ring-2 ring-primary z-10"
                            )}
                        >
                            <div className={cn(
                                "h-7 w-7 flex items-center justify-center rounded-full text-sm",
                                isToday(day) && !isSelected && "bg-primary text-primary-foreground font-bold"
                            )}>
                                {format(day, 'd')}
                            </div>
                            <div className="flex-1 mt-1 space-y-1 overflow-hidden">
                                {dayEvents.slice(0, 3).map(event => (
                                    <div key={event.id} className={cn("text-xs text-white p-1 rounded-sm truncate", colorMap[event.color])}>
                                        {event.title}
                                    </div>
                                ))}
                                {dayEvents.length > 3 && (
                                    <div className="text-xs text-muted-foreground font-semibold">
                                        + {dayEvents.length - 3} more
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
    
    const renderWeekView = () => (
         <div className="flex flex-col flex-1">
            <div className="grid grid-cols-7 text-center text-sm font-semibold text-muted-foreground border-b">
                {weekDays.map((day, i) => (
                    <div key={day} className="py-2 border-r last:border-r-0">
                        <span>{day}</span>
                        <span className={cn("ml-2 font-bold", isToday(weekDaysForView[i]) && "text-primary")}>
                            {format(weekDaysForView[i], 'd')}
                        </span>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 flex-1">
                {weekDaysForView.map(day => {
                    const dayKey = format(day, 'yyyy-MM-dd');
                    const dayEvents = eventsByDate[dayKey] || [];
                    const isSelected = isSameDay(day, selectedDate);
                     return (
                        <div key={day.toString()} onClick={() => setSelectedDate(day)} className={cn("border-r p-2 space-y-1 overflow-y-auto cursor-pointer", isSelected && "bg-primary/10")}>
                             {dayEvents.map(event => (
                                <div key={event.id} className={cn("text-xs text-white p-2 rounded-md", colorMap[event.color])}>
                                    {event.title}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>
        </div>
    );
    
    const renderAgendaView = () => {
        return (
            <div className="p-4 space-y-6">
                {upcomingEvents.length > 0 ? upcomingEvents.map(({date, events}) => (
                    <div key={date.toISOString()} className="flex items-start gap-4">
                        <div className="w-16 text-center shrink-0">
                            <p className="font-bold text-lg">{format(date, 'd')}</p>
                            <p className="text-sm text-muted-foreground">{format(date, 'MMM')}</p>
                            <p className="text-xs text-muted-foreground">{format(date, 'EEE')}</p>
                        </div>
                        <div className="flex-1 space-y-3">
                            {events.map(event => (
                                <div key={event.id} className="p-3 rounded-lg border bg-background relative">
                                    <div className={cn("absolute left-2 top-2 bottom-2 w-1 rounded-full", colorDotMap[event.color])}></div>
                                    <div className="pl-4">
                                        <h4 className="font-bold">{event.title}</h4>
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{event.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <div className="text-center text-muted-foreground py-10">
                        <p>No upcoming events.</p>
                    </div>
                )}
            </div>
        )
    };


    return (
       <div className="h-[calc(100vh-12rem)] min-h-[700px] grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="h-full flex flex-col lg:col-span-8">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b p-4 gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                            <Button variant="outline" size="icon" onClick={handlePrev}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={handleNext}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <h2 className="text-xl font-bold">
                            {view === 'month' && format(currentDate, 'MMMM yyyy')}
                            {view === 'week' && `${format(weekStart, 'd MMM')} - ${format(endOfWeekDateFns(weekStart, { weekStartsOn: 1 }), 'd MMM, yyyy')}`}
                            {view === 'agenda' && 'Agenda'}
                        </h2>
                    </div>
                     <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
                           <Button variant={view === 'month' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('month')}><LayoutGrid className="h-4 w-4"/></Button>
                           <Button variant={view === 'week' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('week')}><CalendarIcon className="h-4 w-4"/></Button>
                           <Button variant={view === 'agenda' ? 'secondary' : 'ghost'} size="icon" onClick={() => setView('agenda')}><List className="h-4 w-4"/></Button>
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button><PlusCircle className="mr-2 h-4 w-4"/> Add Event</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Event</DialogTitle>
                                    <DialogDescription>Fill in the details for your new task or event.</DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="event-title">Title</Label>
                                        <Input id="event-title" value={eventTitle} onChange={e => setEventTitle(e.target.value)} placeholder="e.g., Physics Revision"/>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="event-desc">Description</Label>
                                        <Textarea id="event-desc" value={eventDescription} onChange={e => setEventDescription(e.target.value)} placeholder="Add more details..."/>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Date</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !eventDate && "text-muted-foreground")}>
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={eventDate} onSelect={setEventDate} initialFocus /></PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Category</Label>
                                            <Select value={eventColor} onValueChange={(v: NexusEvent['color']) => setEventColor(v)}>
                                                <SelectTrigger><SelectValue/></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="blue"><Circle className="mr-2 h-3 w-3 fill-blue-500 text-blue-500"/> Goal</SelectItem>
                                                    <SelectItem value="red"><Circle className="mr-2 h-3 w-3 fill-red-500 text-red-500"/> Deadline</SelectItem>
                                                    <SelectItem value="green"><Circle className="mr-2 h-3 w-3 fill-green-500 text-green-500"/> Revision</SelectItem>
                                                    <SelectItem value="yellow"><Circle className="mr-2 h-3 w-3 fill-yellow-500 text-yellow-500"/> Test</SelectItem>
                                                    <SelectItem value="purple"><Circle className="mr-2 h-3 w-3 fill-purple-500 text-purple-500"/> Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                    <Button onClick={handleAddEvent}>Create Event</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
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
                            {view === 'week' && renderWeekView()}
                            {view === 'agenda' && renderAgendaView()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </Card>

            <div className="lg:col-span-4 h-full">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Schedule for</CardTitle>
                        <CardDescription>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                         {selectedDateEvents.length > 0 ? (
                            <div className="space-y-4">
                                {selectedDateEvents.map(event => (
                                    <div key={event.id} className="p-4 rounded-lg border bg-background relative">
                                        <div className={cn("absolute left-2 top-2 bottom-2 w-1 rounded-full", colorDotMap[event.color])}></div>
                                        <div className="pl-4">
                                            <h4 className="font-bold">{event.title}</h4>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{event.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         ) : (
                            <div className="h-48 flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                <p>No events scheduled for this day.</p>
                            </div>
                         )}
                    </CardContent>
                </Card>
            </div>
       </div>
    );
}
