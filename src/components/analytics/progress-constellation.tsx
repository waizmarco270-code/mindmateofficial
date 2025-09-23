

'use client';
import { useMemo, useRef, useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

interface ProgressConstellationProps {
  user: User;
  quizzes: Quiz[];
}

interface StarData {
  id: 'studyTime' | 'focusSessions' | 'quizzes' | 'streak' | 'credits';
  label: string;
  value: number;
  Icon: React.ElementType;
  position: { x: number; y: number };
  max: number;
  depth: number;
}

const normalize = (value: number, max: number) => {
  return Math.max(0, Math.min(value / max, 1));
};

export function ProgressConstellation({ user, quizzes }: ProgressConstellationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [detailModalContent, setDetailModalContent] = useState<{ title: string; data: any[] } | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const { left, top, width, height } = containerRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - left - width / 2);
      mouseY.set(e.clientY - top - height / 2);
  };
  
  const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
  }

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

  const stars: StarData[] = [
    { id: 'studyTime', label: 'Study Time', value: stats.studyTime, Icon: Clock, position: { x: 50, y: 10 }, max: 360000, depth: 0.5 },
    { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, position: { x: 85, y: 40 }, max: 100, depth: 0.8 },
    { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, position: { x: 75, y: 85 }, max: 50, depth: 1.2 },
    { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, position: { x: 25, y: 85 }, max: 100, depth: 1 },
    { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, position: { x: 15, y: 40 }, max: 5000, depth: 0.6 },
  ];

  const connections = [
    { from: 'studyTime', to: 'focusSessions' },
    { from: 'focusSessions', to: 'quizzes' },
    { from: 'quizzes', to: 'streak' },
    { from: 'streak', to: 'credits' },
    { from: 'credits', to: 'studyTime' },
  ];
  
   const handleStarClick = (star: StarData) => {
    if (star.id === 'quizzes') {
        setDetailModalContent({ title: 'Perfected Quizzes', data: quizzes.map(q => ({ title: q.title })) });
    } else {
        setDetailModalContent({ title: star.label, data: [] });
    }
  };

  return (
    <Dialog onOpenChange={(isOpen) => !isOpen && setDetailModalContent(null)}>
        <TooltipProvider>
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative h-full w-full max-w-lg aspect-square mx-auto cursor-grab"
        >
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
            const size = 12 + progress * 24;
            const glow = progress * 1.2;
            const iconSize = 6 + progress * 12;

            const transformX = useTransform(mouseX, [-200, 200], [-8 * star.depth, 8 * star.depth]);
            const transformY = useTransform(mouseY, [-200, 200], [-8 * star.depth, 8 * star.depth]);
            
            return (
                <Tooltip key={star.id}>
                <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                        <motion.div
                            style={{
                                left: `${star.position.x}%`,
                                top: `${star.position.y}%`,
                                x: transformX,
                                y: transformY,
                                translateX: '-50%',
                                translateY: '-50%'
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 * i, type: 'spring' }}
                            className="absolute z-10 cursor-pointer"
                            onClick={() => handleStarClick(star)}
                        >
                            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                                <motion.div
                                    className="absolute rounded-full bg-white"
                                    style={{
                                        width: size, height: size,
                                        boxShadow: `0 0 ${glow * 8}px #fff, 0 0 ${glow * 16}px #a78bfa, 0 0 ${glow * 24}px #8b5cf6`,
                                    }}
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                                    transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, repeatType: "mirror" }}
                                />
                                <star.Icon className="relative text-purple-900" style={{width: iconSize, height: iconSize}}/>
                            </div>
                        </motion.div>
                    </DialogTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex items-center gap-2">
                        <star.Icon className="h-4 w-4"/>
                        <span className="font-bold">{star.label}:</span>
                        <span>{star.id === 'studyTime' ? `${(star.value/3600).toFixed(1)}h` : star.value.toLocaleString()}</span>
                    </div>
                </TooltipContent>
                </Tooltip>
            );
            })}
        </div>
        </TooltipProvider>

         <DialogContent>
            <DialogHeader>
                <DialogTitle>{detailModalContent?.title}</DialogTitle>
                <DialogDescription>A detailed breakdown of this achievement.</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-1">
                {detailModalContent?.data.length === 0 ? (
                    <p className="text-muted-foreground text-center py-10">No data to display yet.</p>
                ) : (
                    <ul className="space-y-2">
                        {detailModalContent?.data.map((item, index) => (
                            <li key={index} className="p-3 rounded-md border bg-muted">{item.title}</li>
                        ))}
                    </ul>
                )}
            </div>
        </DialogContent>
    </Dialog>
  );
}
