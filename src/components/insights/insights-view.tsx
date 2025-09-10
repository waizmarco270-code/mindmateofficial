
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, parseISO, getDay, differenceInSeconds } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

interface StudySession {
  subject: string;
  startTime: string;
  endTime: string;
  duration: number; // in seconds
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const formatTimeShort = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

export function InsightsView() {
    const [sessions] = useLocalStorage<StudySession[]>('studySessions', []);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const dailyStats = useMemo(() => {
        const stats: { [key: string]: { total: number, count: number, max: number, start?: Date, end?: Date, subjects: {[key:string]: number} } } = {};
        
        sessions.forEach(session => {
            const dateStr = format(parseISO(session.startTime), 'yyyy-MM-dd');
            if (!stats[dateStr]) {
                stats[dateStr] = { total: 0, count: 0, max: 0, subjects: {} };
            }
            stats[dateStr].total += session.duration;
            stats[dateStr].count += 1;
            if (session.duration > stats[dateStr].max) {
                stats[dateStr].max = session.duration;
            }

            const sessionStart = parseISO(session.startTime);
            const sessionEnd = parseISO(session.endTime);
            if (!stats[dateStr].start || sessionStart < stats[dateStr].start!) {
                stats[dateStr].start = sessionStart;
            }
            if (!stats[dateStr].end || sessionEnd > stats[dateStr].end!) {
                stats[dateStr].end = sessionEnd;
            }

            stats[dateStr].subjects[session.subject] = (stats[dateStr].subjects[session.subject] || 0) + session.duration;
        });

        return stats;
    }, [sessions]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }
    
    const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDayStats = dailyStats[selectedDayStr];
    
    const subjectBreakdown = selectedDayStats ? Object.entries(selectedDayStats.subjects).sort(([, a], [, b]) => b - a) : [];

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4">
                     <div className="flex items-center justify-between mb-4 px-2">
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-bold text-center">{format(currentMonth, 'MMMM yyyy')}</h2>
                        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                            <ChevronRight className="h-5 w-5" />
                        </Button>
                    </div>
                    
                     <div className="grid grid-cols-7 text-center font-semibold text-sm text-muted-foreground">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                            <div key={day} className="py-2">{day}</div>
                        ))}
                    </div>

                     <div className="grid grid-cols-7">
                        {days.map((day, index) => {
                            const dayStr = format(day, 'yyyy-MM-dd');
                            const stat = dailyStats[dayStr];
                            const isSelected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, new Date());
                            const hours = stat ? stat.total / 3600 : 0;
                            
                             const intensityColor = 
                                 hours >= 4 ? 'bg-green-500/80 text-white' :
                                 hours >= 2 ? 'bg-green-400/70' :
                                 hours > 0 ? 'bg-green-300/60' :
                                 '';

                            return (
                                <div
                                    key={index}
                                    onClick={() => setSelectedDate(day)}
                                    className={cn(
                                        'h-20 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all duration-200',
                                        !isSameMonth(day, currentMonth) && 'text-muted-foreground/50',
                                        isSelected && 'bg-primary/20 ring-2 ring-primary',
                                    )}
                                >
                                   <div className={cn(
                                        "h-8 w-8 flex items-center justify-center rounded-full text-sm",
                                        isToday && !isSelected && 'bg-primary text-primary-foreground font-bold'
                                    )}>
                                       {format(day, 'd')}
                                   </div>
                                   {stat && (
                                       <div className={cn(
                                           "text-xs font-bold rounded-full px-1.5 py-0.5 mt-1",
                                           intensityColor
                                        )}>
                                           {formatTimeShort(stat.total)}
                                       </div>
                                   )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Details for {format(selectedDate, 'EEEE, MMMM do')}</CardTitle>
                </CardHeader>
                <CardContent>
                    {selectedDayStats ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 text-center gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Study</p>
                                    <p className="text-3xl font-bold tracking-tighter">{formatTime(selectedDayStats.total)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max Focus</p>
                                    <p className="text-3xl font-bold tracking-tighter">{formatTime(selectedDayStats.max)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Started</p>
                                    <p className="text-3xl font-bold tracking-tighter">{selectedDayStats.start ? format(selectedDayStats.start, 'p') : 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Finished</p>
                                    <p className="text-3xl font-bold tracking-tighter">{selectedDayStats.end ? format(selectedDayStats.end, 'p') : 'N/A'}</p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <h4 className="font-semibold mb-2">Subject Breakdown</h4>
                                <ul className="space-y-2">
                                    {subjectBreakdown.map(([subject, time]) => (
                                        <li key={subject} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted">
                                            <span className="font-medium">{subject}</span>
                                            <span className="font-mono text-muted-foreground">{formatTime(time)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <p>No study sessions recorded for this day.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

