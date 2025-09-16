
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek as endOfWeekDateFns, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight, Zap, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { useTimeTracker, type TimeSession } from '@/hooks/use-time-tracker';
import { useUsers } from '@/hooks/use-admin';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { Skeleton } from '../ui/skeleton';

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

interface DailyStats {
  totalStudyTime: number;
  studySessionCount: number;
  maxFocus: number;
  firstSessionStart?: Date;
  lastSessionEnd?: Date;
  subjects: { [key: string]: number };
  focusSessionsCompleted: number;
  tasksCompleted: number;
}


interface InsightsViewProps {
    selectedDate?: Date;
}

export function InsightsView({ selectedDate: initialSelectedDate }: InsightsViewProps) {
    const { sessions, loading: timeTrackerLoading } = useTimeTracker();
    const { currentUserData, loading: userLoading } = useUsers();

    const [currentMonth, setCurrentMonth] = useState(initialSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = useState(initialSelectedDate || new Date());
    const [dailyStats, setDailyStats] = useState<Record<string, DailyStats>>({});
    const [statsLoading, setStatsLoading] = useState(true);

    const loading = timeTrackerLoading || userLoading || statsLoading;
    
    // Sync external selected date change
    useEffect(() => {
        if(initialSelectedDate) {
            setSelectedDate(initialSelectedDate);
            setCurrentMonth(initialSelectedDate);
        }
    }, [initialSelectedDate]);
    
    useEffect(() => {
        const fetchDailyData = async () => {
            if (!currentUserData) {
                setStatsLoading(false);
                return;
            }
            setStatsLoading(true);

            const userFocusSessionsRef = collection(db, 'users', currentUserData.uid, 'focusSessions');
            const userTasksRef = collection(db, 'users', currentUserData.uid, 'dailyTasks');

            const [focusSnapshot, tasksSnapshot] = await Promise.all([
                getDocs(userFocusSessionsRef),
                getDocs(userTasksRef)
            ]);

            const focusSessionsByDate: Record<string, number> = {};
            focusSnapshot.forEach(doc => {
                const session = doc.data();
                const dateStr = format((session.completedAt as Timestamp).toDate(), 'yyyy-MM-dd');
                focusSessionsByDate[dateStr] = (focusSessionsByDate[dateStr] || 0) + 1;
            });
            
            const tasksByDate: Record<string, number> = {};
            tasksSnapshot.forEach(doc => {
                const task = doc.data();
                if(task.completed) {
                   const dateStr = format(parseISO(task.createdAt), 'yyyy-MM-dd');
                   tasksByDate[dateStr] = (tasksByDate[dateStr] || 0) + 1;
                }
            });
            
            const newDailyStats: Record<string, DailyStats> = {};

            sessions.forEach(session => {
                const dateStr = format(parseISO(session.startTime), 'yyyy-MM-dd');
                if (!newDailyStats[dateStr]) {
                    newDailyStats[dateStr] = { totalStudyTime: 0, studySessionCount: 0, maxFocus: 0, subjects: {}, focusSessionsCompleted: 0, tasksCompleted: 0 };
                }
                const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;
                newDailyStats[dateStr].totalStudyTime += duration;
                newDailyStats[dateStr].studySessionCount += 1;
                if (duration > newDailyStats[dateStr].maxFocus) {
                    newDailyStats[dateStr].maxFocus = duration;
                }

                const sessionStart = parseISO(session.startTime);
                const sessionEnd = parseISO(session.endTime);
                if (!newDailyStats[dateStr].firstSessionStart || sessionStart < newDailyStats[dateStr].firstSessionStart!) {
                    newDailyStats[dateStr].firstSessionStart = sessionStart;
                }
                if (!newDailyStats[dateStr].lastSessionEnd || sessionEnd > newDailyStats[dateStr].lastSessionEnd!) {
                    newDailyStats[dateStr].lastSessionEnd = sessionEnd;
                }
                newDailyStats[dateStr].subjects[session.subjectName] = (newDailyStats[dateStr].subjects[session.subjectName] || 0) + duration;
            });
            
            // Merge all stats
            const allDates = new Set([...Object.keys(newDailyStats), ...Object.keys(focusSessionsByDate), ...Object.keys(tasksByDate)]);
            
            allDates.forEach(dateStr => {
                 if (!newDailyStats[dateStr]) {
                    newDailyStats[dateStr] = { totalStudyTime: 0, studySessionCount: 0, maxFocus: 0, subjects: {}, focusSessionsCompleted: 0, tasksCompleted: 0 };
                }
                newDailyStats[dateStr].focusSessionsCompleted = focusSessionsByDate[dateStr] || 0;
                newDailyStats[dateStr].tasksCompleted = tasksByDate[dateStr] || 0;
            });
            
            setDailyStats(newDailyStats);
            setStatsLoading(false);
        };
        
        fetchDailyData();

    }, [sessions, currentUserData]);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeekDateFns(monthEnd, { weekStartsOn: 1 });

    const days = [];
    let day = startDate;
    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }
    
    const selectedDayStr = format(selectedDate, 'yyyy-MM-dd');
    const selectedDayStats = dailyStats[selectedDayStr];
    
    const subjectBreakdown = selectedDayStats ? Object.entries(selectedDayStats.subjects).sort(([, a], [, b]) => b - a) : [];
    
    const renderCalendar = () => (
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
                        if (loading) {
                            return <Skeleton key={index} className="h-20" />
                        }
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const stat = dailyStats[dayStr];
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const hours = stat ? stat.totalStudyTime / 3600 : 0;
                        
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
                                {stat && stat.totalStudyTime > 0 && (
                                    <div className={cn(
                                        "text-xs font-bold rounded-full px-1.5 py-0.5 mt-1",
                                        intensityColor
                                    )}>
                                        {formatTimeShort(stat.totalStudyTime)}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            {!initialSelectedDate && renderCalendar()}

            <Card>
                {!initialSelectedDate && (
                    <CardHeader>
                        <CardTitle>Details for {format(selectedDate, 'EEEE, MMMM do')}</CardTitle>
                    </CardHeader>
                )}
                <CardContent>
                    {loading ? <Skeleton className="h-64" /> : selectedDayStats ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 text-center gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Study</p>
                                    <p className="text-3xl font-bold tracking-tighter">{formatTime(selectedDayStats.totalStudyTime)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max Focus</p>
                                    <p className="text-3xl font-bold tracking-tighter">{formatTime(selectedDayStats.maxFocus)}</p>
                                </div>
                                 <div className="flex flex-col items-center justify-center">
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><Zap className="h-4 w-4"/> Focus Sessions</p>
                                    <p className="text-3xl font-bold tracking-tighter">{selectedDayStats.focusSessionsCompleted}</p>
                                </div>
                                 <div className="flex flex-col items-center justify-center">
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5"><ListTodo className="h-4 w-4"/> Tasks Done</p>
                                    <p className="text-3xl font-bold tracking-tighter">{selectedDayStats.tasksCompleted}</p>
                                </div>
                            </div>

                            {selectedDayStats.totalStudyTime > 0 && (
                                <>
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
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-10">
                            <p>No activity recorded for this day.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
