
'use client';
import { useMemo, useState } from 'react';
import { User } from '@/hooks/use-admin';
import { Quiz } from '@/hooks/use-quizzes';
import { Award, Brain, Clock, Flame, Zap, CheckCircle, BarChart3, List, Star, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

interface StatBranch {
  id: 'studyTime' | 'focusSessions' | 'quizzes' | 'streak' | 'credits';
  label: string;
  value: number;
  Icon: React.ElementType;
  max: number;
  unit: string;
  position: { top?: string; bottom?: string; left?: string; right?: string; };
  color: string;
}

interface ProgressConstellationProps {
  user: User;
  quizzes: Quiz[];
}

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
};

export function ProgressConstellation({ user, quizzes }: ProgressConstellationProps) {
    const [selectedStat, setSelectedStat] = useState<StatBranch | null>(null);
    const { sessions } = useTimeTracker();

    const stats = useMemo(() => {
        const perfectedQuizzesCount = user.perfectedQuizzes?.length || 0;
        return {
        studyTime: user.totalStudyTime || 0,
        focusSessions: user.focusSessionsCompleted || 0,
        quizzes: perfectedQuizzesCount,
        streak: user.longestStreak || 0,
        credits: user.credits || 0,
        };
    }, [user]);

    const studyTimeBySubject = useMemo(() => {
        const subjectTimes: Record<string, number> = {};
        sessions.filter(s => s.userId === user.uid).forEach(session => {
            const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;
            subjectTimes[session.subjectName] = (subjectTimes[session.subjectName] || 0) + duration;
        });
        return Object.entries(subjectTimes).sort(([, a], [, b]) => b - a);
    }, [sessions, user.uid]);
    
     const formatValue = (value: number, unit: string) => {
        if (unit === 'h') return `${(value / 3600).toFixed(1)}h`;
        return `${value.toLocaleString()}${unit}`;
    }

    const branches: StatBranch[] = [
        { id: 'studyTime', label: 'Total Study Time', value: stats.studyTime, Icon: Clock, max: 360000, unit: 'h', position: { top: '0', left: '50%' }, color: 'text-sky-400' },
        { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, max: 100, unit: '', position: { top: '25%', right: '0' }, color: 'text-yellow-400' },
        { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, max: 50, unit: '', position: { top: '25%', left: '0' }, color: 'text-purple-400' },
        { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, max: 100, unit: ' days', position: { bottom: '5%', left: '15%' }, color: 'text-orange-400' },
        { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, max: 5000, unit: '', position: { bottom: '5%', right: '15%' }, color: 'text-green-400' },
    ];
    
    const renderDialogContent = () => {
        if (!selectedStat) return null;

        switch (selectedStat.id) {
            case 'quizzes':
                const perfectedQuizzes = quizzes.filter(q => user.perfectedQuizzes?.includes(q.id));
                return (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-4">
                        {perfectedQuizzes.length > 0 ? (
                            perfectedQuizzes.map(q => (
                                <div key={q.id} className="flex items-center gap-2 p-2 rounded-md bg-muted">
                                    <CheckCircle className="h-4 w-4 text-green-500"/>
                                    <span className="font-medium text-sm">{q.title}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">No quizzes perfected yet.</p>
                        )}
                    </div>
                );
            case 'studyTime':
                 return (
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-4">
                         {studyTimeBySubject.length > 0 ? (
                            studyTimeBySubject.map(([name, time]) => (
                                <div key={name} className="flex items-center justify-between p-2 rounded-md bg-muted">
                                    <span className="font-medium text-sm">{name}</span>
                                    <span className="font-mono text-xs">{formatTime(time)}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">No study time tracked yet.</p>
                        )}
                    </div>
                );
            default:
                return (
                    <div className="text-center py-8">
                        <h2 className="text-4xl font-bold">{formatValue(selectedStat.value, selectedStat.unit)}</h2>
                        <p className="text-muted-foreground">{selectedStat.label}</p>
                    </div>
                );
        }
    }


  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setSelectedStat(null)}>
        <div className="relative h-96 w-full max-w-lg mx-auto flex items-center justify-center p-4">
             {/* Background Glow */}
            <div className="absolute inset-0 bg-primary/5 blur-[50px] rounded-full"></div>
            
            {/* Central Node */}
            <motion.div 
                className="relative z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
            >
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-yellow-400/20 to-amber-500/20 flex items-center justify-center p-1 border-2 border-yellow-400/30">
                    <Avatar className="h-full w-full">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName} />
                        <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                </div>
                 <Sun className="absolute -top-4 -left-4 h-10 w-10 text-yellow-400 animate-pulse" style={{filter: 'drop-shadow(0 0 5px currentColor)'}} />
            </motion.div>

            {/* Stat Nodes (Stars) */}
            <AnimatePresence>
            {branches.map((branch, index) => {
                 const angle = (index / branches.length) * 2 * Math.PI + (Math.PI / 5);
                 const radius = 150; // pixels
                 const x = radius * Math.cos(angle);
                 const y = radius * Math.sin(angle);
                
                return (
                     <motion.div
                        key={branch.id}
                        className="absolute z-20 flex flex-col items-center gap-1"
                        initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                        animate={{ x, y, scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1, type: 'spring', stiffness: 100 }}
                    >
                         {/* Connecting Line */}
                        <svg className="absolute overflow-visible" style={{transform: `rotate(${angle * (180/Math.PI) + 180}deg)`}}>
                            <motion.line 
                                x1="0" y1="0" x2={radius - 20} y2="0" 
                                stroke="hsl(var(--primary) / 0.2)" 
                                strokeWidth="1"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                            />
                        </svg>

                         <DialogTrigger asChild>
                            <motion.button 
                                onClick={() => setSelectedStat(branch)}
                                className="group"
                                whileHover={{ scale: 1.2, zIndex: 50 }}
                            >
                                <Star className="h-8 w-8 text-yellow-400/70 fill-yellow-400/30 group-hover:fill-yellow-400/60 transition-colors duration-300" style={{filter: 'drop-shadow(0 0 8px hsl(var(--primary)/20%))'}} />
                            </motion.button>
                         </DialogTrigger>
                        <span className="text-xs font-bold text-slate-400 pointer-events-none">{branch.label}</span>
                     </motion.div>
                )
            })}
            </AnimatePresence>

        </div>

         <DialogContent>
            {selectedStat && (
                <>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <selectedStat.Icon className={cn("h-6 w-6", selectedStat.color)} />
                            {selectedStat.label}
                        </DialogTitle>
                    </DialogHeader>
                    {renderDialogContent()}
                </>
            )}
        </DialogContent>
    </Dialog>
  );
}

