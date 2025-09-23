
'use client';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
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

interface StarData {
  id: string;
  label: string;
  value: number;
  Icon: React.ElementType;
  position: { x: number; y: number };
  max: number;
}

const normalize = (value: number, max: number) => {
  return Math.max(0, Math.min(value / max, 1));
};

export function ProgressConstellation({ user, quizzes }: ProgressConstellationProps) {
  const stats = useMemo(() => {
    const perfectedQuizzes = user.perfectedQuizzes?.length || 0;
    
    return {
      studyTime: user.totalStudyTime || 0,       // in seconds
      focusSessions: user.focusSessionsCompleted || 0,
      quizzes: perfectedQuizzes,
      streak: user.longestStreak || 0,
      credits: user.credits || 0,
    };
  }, [user]);

  const stars: StarData[] = [
    { id: 'studyTime', label: 'Study Time', value: stats.studyTime, Icon: Clock, position: { x: 50, y: 10 }, max: 360000 /* 100 hours */ },
    { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, position: { x: 85, y: 40 }, max: 100 },
    { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, position: { x: 75, y: 85 }, max: 50 },
    { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, position: { x: 25, y: 85 }, max: 100 },
    { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, position: { x: 15, y: 40 }, max: 5000 },
  ];

  const connections = [
    { from: 'studyTime', to: 'focusSessions' },
    { from: 'focusSessions', to: 'quizzes' },
    { from: 'quizzes', to: 'streak' },
    { from: 'streak', to: 'credits' },
    { from: 'credits', to: 'studyTime' },
  ];

  return (
    <TooltipProvider>
      <div className="relative h-full w-full max-w-lg aspect-square mx-auto">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {connections.map(({ from, to }) => {
            const fromStar = stars.find(s => s.id === from)!;
            const toStar = stars.find(s => s.id === to)!;
            const fromProgress = normalize(fromStar.value, fromStar.max);
            const toProgress = normalize(toStar.value, toStar.max);
            const lineProgress = Math.min(fromProgress, toProgress);

            if (lineProgress === 0) return null;
            
            return (
              <motion.line
                key={`${from}-${to}`}
                x1={fromStar.position.x}
                y1={fromStar.position.y}
                x2={toStar.position.x}
                y2={toStar.position.y}
                stroke="rgba(107, 114, 128, 0.5)"
                strokeWidth="0.3"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: lineProgress }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {stars.map((star, i) => {
          const progress = normalize(star.value, star.max);
          const size = 4 + progress * 8; // Size from 4 to 12
          const glow = progress * 0.8;
          
          return (
             <Tooltip key={star.id}>
              <TooltipTrigger asChild>
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 * i, type: 'spring' }}
                    className="absolute z-10"
                    style={{
                        left: `${star.position.x}%`,
                        top: `${star.position.y}%`,
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                        <motion.div
                            className="absolute rounded-full bg-white"
                             style={{
                                width: size, height: size,
                                boxShadow: `0 0 ${glow * 8}px #fff, 0 0 ${glow * 16}px #fff, 0 0 ${glow * 24}px #60a5fa`,
                            }}
                            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                        />
                    </div>
                </motion.div>
             </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                    <star.Icon className="h-4 w-4"/>
                    <span className="font-bold">{star.label}:</span>
                    <span>{star.value.toLocaleString()}</span>
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
