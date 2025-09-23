
'use client';
import { useMemo, useState } from 'react';
import { User } from '@/hooks/use-admin';
import { Quiz } from '@/hooks/use-quizzes';
import { Award, Brain, Clock, Flame, Zap, CheckCircle, BarChart3, List } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTimeTracker } from '@/hooks/use-time-tracker';

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

const normalize = (value: number, max: number) => {
  return Math.max(0, Math.min(value / max, 1));
};

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

    const branches: StatBranch[] = [
        { id: 'studyTime', label: 'Total Study Time', value: stats.studyTime, Icon: Clock, max: 360000, unit: 'h', position: { top: '0', left: '50%' }, color: 'text-sky-400' },
        { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, max: 100, unit: '', position: { top: '30%', right: '5%' }, color: 'text-yellow-400' },
        { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, max: 50, unit: '', position: { top: '30%', left: '5%' }, color: 'text-purple-400' },
        { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, max: 100, unit: ' days', position: { bottom: '10%', left: '20%' }, color: 'text-orange-400' },
        { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, max: 5000, unit: '', position: { bottom: '10%', right: '20%' }, color: 'text-green-400' },
    ];
  
    const formatValue = (value: number, unit: string) => {
        if (unit === 'h') return `${(value / 3600).toFixed(1)}h`;
        return `${value.toLocaleString()}${unit}`;
    }
    
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
        <TooltipProvider>
            <div className="relative h-96 w-full flex items-center justify-center">
                {/* Central Node */}
                <div className="z-10 h-24 w-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-col shadow-lg shadow-primary/20">
                    <Brain className="h-10 w-10 text-primary" />
                    <span className="text-xs font-bold text-primary mt-1">CORE</span>
                </div>

                {/* Branches */}
                {branches.map(branch => {
                    const progress = normalize(branch.value, branch.max);
                    const size = 3 + progress * 4; // size in rem (48px to 112px)
                    
                    return (
                        <div key={branch.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={branch.position}>
                             <Tooltip>
                                <DialogTrigger asChild>
                                    <TooltipTrigger asChild>
                                        <button className="relative flex items-center justify-center group">
                                            {/* Branch Line */}
                                            <div
                                                className="absolute h-px w-24 bg-gradient-to-l from-primary/50 to-transparent"
                                                style={{ transform: `rotate(${branch.id === 'studyTime' ? 90 : branch.id === 'focusSessions' ? 180 : branch.id === 'quizzes' ? 0 : branch.id === 'streak' ? 45 : -45}deg) scaleX(${progress})`, transformOrigin: 'right center' }}
                                            />
                                            {/* End Node (Leaf) */}
                                            <div
                                                className={cn("relative flex items-center justify-center rounded-full border-2 border-primary/30 bg-slate-900 transition-all duration-500 ease-out z-10 group-hover:scale-110", branch.color)}
                                                style={{ 
                                                    width: `${size}rem`,
                                                    height: `${size}rem`,
                                                    boxShadow: `0 0 ${progress * 15}px`,
                                                }}
                                                onClick={() => setSelectedStat(branch)}
                                            >
                                                <branch.Icon className="h-1/2 w-1/2" style={{ opacity: 0.6 + progress * 0.4 }} />
                                            </div>
                                        </button>
                                    </TooltipTrigger>
                                </DialogTrigger>
                                <TooltipContent>
                                    <div className="flex items-center gap-2">
                                        <branch.Icon className="h-4 w-4"/>
                                        <span className="font-bold">{branch.label}:</span>
                                        <span>{formatValue(branch.value, branch.unit)}</span>
                                    </div>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    )
                })}
            </div>
        </TooltipProvider>

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

