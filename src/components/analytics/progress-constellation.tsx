'use client';
import { useMemo } from 'react';
import { User } from '@/hooks/use-admin';
import { Quiz } from '@/hooks/use-quizzes';
import { Award, Brain, Clock, Flame, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProgressConstellationProps {
  user: User;
  quizzes: Quiz[];
}

interface StatBranch {
  id: 'studyTime' | 'focusSessions' | 'quizzes' | 'streak' | 'credits';
  label: string;
  value: number;
  Icon: React.ElementType;
  max: number;
  unit: string;
  position: { top?: string; bottom?: string; left?: string; right?: string; transform: string; };
  color: string;
}

const normalize = (value: number, max: number) => {
  return Math.max(0, Math.min(value / max, 1));
};

export function ProgressConstellation({ user, quizzes }: ProgressConstellationProps) {
  const stats = useMemo(() => {
    const perfectedQuizzes = user.perfectedQuizzes?.length || 0;
    return {
      studyTime: user.totalStudyTime || 0,
      focusSessions: user.focusSessionsCompleted || 0,
      quizzes: perfectedQuizzes,
      streak: user.longestStreak || 0,
      credits: user.credits || 0,
    };
  }, [user]);

  const branches: StatBranch[] = [
    { id: 'studyTime', label: 'Total Study Time', value: stats.studyTime, Icon: Clock, max: 360000, unit: 'h', position: { top: '0', left: '50%', transform: 'translateX(-50%)' }, color: 'bg-sky-500' },
    { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, max: 100, unit: '', position: { top: '50%', right: '0', transform: 'translateY(-50%)' }, color: 'bg-yellow-500' },
    { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, max: 50, unit: '', position: { top: '50%', left: '0', transform: 'translateY(-50%)' }, color: 'bg-purple-500' },
    { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, max: 100, unit: ' days', position: { bottom: '0', left: '25%', transform: 'translateX(-50%)' }, color: 'bg-orange-500' },
    { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, max: 5000, unit: '', position: { bottom: '0', right: '25%', transform: 'translateX(50%)' }, color: 'bg-green-500' },
  ];
  
  const formatValue = (value: number, unit: string) => {
      if(unit === 'h') return `${(value / 3600).toFixed(1)}h`;
      return `${value.toLocaleString()}${unit}`;
  }

  return (
    <TooltipProvider>
        <div className="relative h-96 w-full flex items-center justify-center">
            {/* Central Node */}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="z-10 h-24 w-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-col shadow-lg shadow-primary/20">
                         <Brain className="h-10 w-10 text-primary" />
                         <span className="text-xs font-bold text-primary mt-1">CORE</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Your Core Progress</p>
                </TooltipContent>
            </Tooltip>

            {/* Branches */}
            {branches.map(branch => {
                 const progress = normalize(branch.value, branch.max);
                 const length = 40 + progress * 60; // Branch length from 40% to 100% of radius
                 const thickness = 2 + progress * 2; // Branch thickness
                 
                 return (
                     <div
                        key={branch.id}
                        className="absolute"
                        style={{ ...branch.position }}
                     >
                        <Tooltip>
                            <TooltipTrigger asChild>
                                 <div className="relative flex items-center justify-center">
                                    {/* Branch Line */}
                                    <div
                                        className={cn("absolute h-[2px] w-24 bg-gradient-to-l from-primary/50 to-transparent transition-all duration-1000 ease-out", branch.color)}
                                        style={{ 
                                            width: `${length}px`,
                                            height: `${thickness}px`,
                                            transform: `rotate(${branch.position.top === '50%' ? 0 : 90}deg)`
                                        }}
                                    />
                                     {/* End Node (Leaf) */}
                                    <div
                                        className={cn("relative h-10 w-10 flex items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-all duration-1000 ease-out", branch.color)}
                                        style={{ 
                                            boxShadow: `0 0 ${progress * 20}px`,
                                            transform: `translate(${length}px)`
                                        }}
                                    >
                                        <branch.Icon
                                            className="text-white transition-all duration-500"
                                            style={{ 
                                                width: 16 + progress * 8,
                                                height: 16 + progress * 8,
                                                opacity: 0.7 + progress * 0.3,
                                            }}
                                        />
                                    </div>
                                </div>
                            </TooltipTrigger>
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
  );
}