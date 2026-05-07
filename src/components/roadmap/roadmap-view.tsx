'use client';
import { Roadmap, useRoadmaps } from '@/hooks/use-roadmaps';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, Edit, CheckCircle, CalendarDays, 
    Milestone as MilestoneIcon, Clock, Star, MessageSquare, 
    Target, Play, Trash2, AlertTriangle, X, Flame, 
    Dumbbell, ChevronLeft, ChevronRight, LayoutGrid, List,
    Pin, Sparkles, Check, PlusCircle
} from 'lucide-react';
import { 
    addDays, format, isPast, isToday, 
    endOfWeek, startOfWeek, differenceInSeconds, 
    startOfToday, subMonths, addMonths, startOfMonth, 
    endOfMonth, eachDayOfInterval, isSameMonth, isSameDay,
    parseISO, differenceInDays
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Checkbox } from '../ui/checkbox';
import { useState, useMemo, useEffect } from 'react';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { TimeTracker } from '../tracker/time-tracker';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { Separator } from '../ui/separator';

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

export function RoadmapView({ roadmap, onBack, onPlan }: { roadmap: Roadmap; onBack: () => void; onPlan: () => void; }) {
    const { toggleTaskCompletion, logStudyTime, addMonthlyTarget, removeMonthlyTarget } = useRoadmaps();
    const { activeSubjectId, currentSessionStart } = useTimeTracker();
    const [view, setView] = useState<'timeline' | 'monthly'>('timeline');
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [newTarget, setNewTarget] = useState('');
    const { toast } = useToast();

    // Timeline logic
    const startDate = useMemo(() => new Date(roadmap.startDate), [roadmap.startDate]);
    const examDate = useMemo(() => new Date(roadmap.examDate), [roadmap.examDate]);
    const monthKey = format(currentMonth, 'yyyy-MM');
    const monthTargets = roadmap.monthlyTargets?.[monthKey] || [];

    const handleAddTarget = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTarget.trim()) return;
        await addMonthlyTarget(roadmap.id, monthKey, newTarget.trim());
        setNewTarget('');
        toast({ title: "Target Fixed", description: "Monthly directive synchronized." });
    };

    const calendarDays = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 1 });
        const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 1 });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const { totalTasks, completedTasks, progress } = useMemo(() => {
        const allTasks = roadmap.milestones.flatMap(m => m.categories.flatMap(c => c.tasks));
        const completed = allTasks.filter(t => t.completed).length;
        return {
            totalTasks: allTasks.length,
            completedTasks: completed,
            progress: allTasks.length > 0 ? (completed / allTasks.length) * 100 : 0
        };
    }, [roadmap.milestones]);

    return (
        <div className="space-y-8 pb-40">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-6">
                    <Button variant="outline" size="icon" onClick={onBack} className="rounded-full h-12 w-12 border-primary/20">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">{roadmap.name}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{roadmap.duration} Day Strategic Path</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-muted/30 p-1 rounded-2xl border">
                    <Button 
                        variant={view === 'timeline' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setView('timeline')}
                        className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6"
                    >
                        <List className="mr-2 h-4 w-4" /> Timeline
                    </Button>
                    <Button 
                        variant={view === 'monthly' ? 'secondary' : 'ghost'} 
                        size="sm" 
                        onClick={() => setView('monthly')}
                        className="rounded-xl font-black uppercase text-[10px] tracking-widest px-6"
                    >
                        <CalendarDays className="mr-2 h-4 w-4" /> Monthly
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Statistics Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="bg-primary/5 border-primary/20 rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.4em] text-primary flex items-center gap-2">
                                <Target className="h-4 w-4"/> Overall Synchronization
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-5xl font-black text-white italic tracking-tighter">{progress.toFixed(0)}%</p>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{completedTasks} / {totalTasks}</p>
                                    <p className="text-[10px] font-black text-primary uppercase">Objectives Secured</p>
                                </div>
                            </div>
                            <Progress value={progress} className="h-2 bg-black/20" indicatorClassName="animated-rainbow-progress" />
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-900/60 border-white/5 rounded-[2.5rem] p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Target Month</h4>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight/></Button>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black uppercase italic text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
                        
                        <Separator className="bg-white/5" />

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Pin className="h-3.5 w-3.5"/> Monthly Directives
                            </Label>
                            <form onSubmit={handleAddTarget} className="flex gap-2">
                                <Input 
                                    value={newTarget} 
                                    onChange={e => setNewTarget(e.target.value)} 
                                    placeholder="Set macro goal..." 
                                    className="bg-black/40 border-white/10 h-10 rounded-xl text-xs"
                                />
                                <Button type="submit" size="icon" className="h-10 w-10 rounded-xl shrink-0"><PlusCircle className="h-4 w-4"/></Button>
                            </form>
                            <div className="space-y-2">
                                {monthTargets.map((t, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                                        <p className="text-xs font-medium text-slate-300 italic">"{t}"</p>
                                        <button onClick={() => removeMonthlyTarget(roadmap.id, monthKey, t)} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                                            <Trash2 className="h-3.5 w-3.5"/>
                                        </button>
                                    </div>
                                ))}
                                {monthTargets.length === 0 && <p className="text-center text-[10px] text-muted-foreground uppercase font-bold py-4 opacity-40">No directives set</p>}
                            </div>
                        </div>
                    </Card>

                    <Button onClick={onPlan} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                        <Edit className="mr-2 h-4 w-4"/> Re-Calibrate Tasks
                    </Button>
                </div>

                {/* Main View Area */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait">
                        {view === 'timeline' ? (
                            <motion.div 
                                key="timeline"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <ScrollArea className="h-[70vh] pr-4 sm:pr-8">
                                    <div className="space-y-8">
                                        {Array.from({ length: roadmap.duration }).map((_, i) => {
                                            const dayNumber = i + 1;
                                            const dayMilestone = roadmap.milestones.find(m => m.day === dayNumber);
                                            const dayDate = addDays(startDate, i);
                                            const isDayPast = isPast(dayDate) && !isToday(dayDate);
                                            const isDayToday = isToday(dayDate);

                                            return (
                                                <div key={dayNumber} className="flex gap-6 group">
                                                    <div className="flex flex-col items-center">
                                                        <div className={cn(
                                                            "h-12 w-12 rounded-full border-2 flex items-center justify-center font-black text-sm transition-all",
                                                            isDayToday ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 ring-4 ring-primary/10" :
                                                            isDayPast ? "bg-muted text-muted-foreground border-transparent opacity-60" : "bg-card border-white/10"
                                                        )}>
                                                            {dayNumber}
                                                        </div>
                                                        <div className="w-px flex-1 bg-white/5 my-2" />
                                                    </div>
                                                    <div className="flex-1 pb-10">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className={cn("font-bold text-sm uppercase tracking-widest", isDayToday ? "text-primary" : "text-muted-foreground")}>
                                                                {format(dayDate, 'EEEE, MMM do')}
                                                            </h4>
                                                        </div>
                                                        <div className="grid gap-4">
                                                            {dayMilestone?.categories.map(cat => (
                                                                <div key={cat.id} className="p-5 rounded-3xl bg-white/[0.03] border border-white/5 space-y-4" style={{ borderLeft: `4px solid ${cat.color}` }}>
                                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{cat.title}</p>
                                                                    <div className="space-y-3">
                                                                        {cat.tasks.map(task => (
                                                                            <div key={task.id} className="flex items-center gap-3">
                                                                                <Checkbox 
                                                                                    checked={task.completed} 
                                                                                    onCheckedChange={() => toggleTaskCompletion(roadmap.id, dayNumber, cat.id, task.id)}
                                                                                    className="border-white/20 data-[state=checked]:bg-primary"
                                                                                />
                                                                                <span className={cn("text-sm font-medium", task.completed ? "text-slate-500 line-through" : "text-slate-200")}>
                                                                                    {task.text}
                                                                                </span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {!dayMilestone && (
                                                                <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest opacity-30">No tactical objectives</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </ScrollArea>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="monthly"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="bg-black/20 border-white/5 rounded-[3rem] overflow-hidden">
                                    <div className="grid grid-cols-7 border-b border-white/5 bg-white/5">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                            <div key={d} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">{d}</div>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-7">
                                        {calendarDays.map((day, i) => {
                                            const dayKey = format(day, 'yyyy-MM-dd');
                                            const dayOfRoadmap = differenceInDays(day, startDate) + 1;
                                            const milestone = dayOfRoadmap > 0 && dayOfRoadmap <= roadmap.duration ? roadmap.milestones.find(m => m.day === dayOfRoadmap) : null;
                                            const hasTasks = milestone && milestone.categories.length > 0;

                                            return (
                                                <div key={i} className={cn(
                                                    "aspect-square p-2 border-r border-b border-white/5 relative group transition-colors",
                                                    !isSameMonth(day, currentMonth) && "opacity-20",
                                                    isToday(day) && "bg-primary/5"
                                                )}>
                                                    <span className={cn(
                                                        "text-xs font-black italic",
                                                        isToday(day) ? "text-primary" : "text-muted-foreground/60"
                                                    )}>{format(day, 'd')}</span>
                                                    
                                                    {dayOfRoadmap > 0 && dayOfRoadmap <= roadmap.duration && (
                                                        <div className="absolute top-2 right-2 text-[8px] font-black text-primary/40">D-{dayOfRoadmap}</div>
                                                    )}

                                                    {hasTasks && (
                                                        <div className="mt-1 flex flex-col gap-0.5">
                                                            {milestone.categories.slice(0, 2).map(cat => (
                                                                <div key={cat.id} className="h-1 w-full rounded-full opacity-60" style={{ backgroundColor: cat.color }} />
                                                            ))}
                                                            {milestone.categories.length > 2 && <div className="h-1 w-2 rounded-full bg-white/20" />}
                                                        </div>
                                                    )}
                                                    
                                                    {/* Peek Overlay */}
                                                    <AnimatePresence>
                                                        {hasTasks && (
                                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-background/95 z-20 p-2 flex flex-col justify-center text-center transition-opacity pointer-events-none">
                                                                <p className="text-[8px] font-black uppercase text-primary">Day {dayOfRoadmap}</p>
                                                                <p className="text-[10px] font-bold truncate text-white">{milestone.categories[0].title}</p>
                                                                <p className="text-[8px] font-medium text-muted-foreground">+{milestone.categories.length - 1} more</p>
                                                            </div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </Card>
                                
                                <div className="mt-8 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 flex items-start gap-4">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary"><Info className="h-5 w-5"/></div>
                                    <div className="space-y-1">
                                        <h5 className="font-black uppercase text-xs tracking-widest text-primary">Temporal Awareness</h5>
                                        <p className="text-xs font-medium text-slate-400 italic">"The Monthly view aligns your relative day-based tasks with actual calendar time. Use the Peak view to spot heavy load days and prepare your cognitive reserves."</p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
