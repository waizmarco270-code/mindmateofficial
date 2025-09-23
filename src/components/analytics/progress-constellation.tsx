
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
  angle: number;
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
    { id: 'studyTime', label: 'Total Study Time', value: stats.studyTime, Icon: Clock, max: 360000, unit: 'h', angle: -90 },
    { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, max: 100, unit: '', angle: -30 },
    { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, max: 50, unit: '', angle: 30 },
    { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, max: 100, unit: ' days', angle: 90 },
    { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, max: 5000, unit: '', angle: 150 },
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
                    <div className="z-10 h-20 w-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center flex-col shadow-lg shadow-primary/20">
                         <Brain className="h-8 w-8 text-primary" />
                         <span className="text-xs font-bold text-primary">CORE</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Your Core Progress</p>
                </TooltipContent>
            </Tooltip>

            {/* Branches */}
            {branches.map(branch => {
                 const progress = normalize(branch.value, branch.max);
                 const length = 20 + progress * 80; // Branch length from 20% to 100% of radius
                 const thickness = 2 + progress * 4; // Branch thickness
                 const nodeSize = 16 + progress * 24; // Node size
                 
                 return (
                     <div
                        key={branch.id}
                        className="absolute top-1/2 left-1/2"
                        style={{ transform: `rotate(${branch.angle}deg)` }}
                     >
                        {/* Branch Line */}
                        <div
                            className="absolute bottom-1/2 left-0 h-px bg-gradient-to-r from-primary/50 to-primary/0 transition-all duration-1000 ease-out"
                            style={{ 
                                width: `${length}%`,
                                height: `${thickness}px`,
                                transform: 'translateY(50%)',
                            }}
                        />

                        {/* End Node (Star) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className="absolute bottom-1/2 left-0 flex items-center justify-center rounded-full border-2 border-primary/50 bg-background transition-all duration-1000 ease-out"
                                    style={{
                                        width: nodeSize,
                                        height: nodeSize,
                                        left: `${length}%`,
                                        transform: 'translate(-50%, 50%)',
                                        boxShadow: `0 0 ${progress * 15}px hsl(var(--primary) / ${progress * 0.8})`,
                                    }}
                                >
                                    <branch.Icon
                                        className="text-primary transition-all duration-500"
                                        style={{ 
                                            width: nodeSize * 0.5,
                                            height: nodeSize * 0.5,
                                            opacity: 0.5 + progress * 0.5,
                                        }}
                                    />
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
