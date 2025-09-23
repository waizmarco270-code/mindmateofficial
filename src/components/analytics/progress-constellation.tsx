
'use client';
import { useMemo, useState } from 'react';
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
}

const normalize = (value: number, max: number) => {
  return Math.max(0, Math.min(value / max, 1));
};

export function ProgressConstellation({ user, quizzes }: ProgressConstellationProps) {
  const [detailModalContent, setDetailModalContent] = useState<{ title: string; data: any[] } | null>(null);

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
    { id: 'studyTime', label: 'Study Time', value: stats.studyTime, Icon: Clock, position: { x: 50, y: 10 }, max: 360000 },
    { id: 'focusSessions', label: 'Focus Sessions', value: stats.focusSessions, Icon: Zap, position: { x: 85, y: 40 }, max: 100 },
    { id: 'quizzes', label: 'Quizzes Perfected', value: stats.quizzes, Icon: Brain, position: { x: 75, y: 85 }, max: 50 },
    { id: 'streak', label: 'Longest Streak', value: stats.streak, Icon: Flame, position: { x: 25, y: 85 }, max: 100 },
    { id: 'credits', label: 'Credits Earned', value: stats.credits, Icon: Award, position: { x: 15, y: 40 }, max: 5000 },
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
        <div className="relative h-full w-full max-w-lg aspect-square mx-auto">
            {stars.map((star, i) => {
            const progress = normalize(star.value, star.max);
            const size = 12 + progress * 24;
            const glow = progress * 1.2;
            const iconSize = 6 + progress * 12;
            
            return (
                <DialogTrigger key={star.id} asChild>
                    <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            style={{
                                left: `${star.position.x}%`,
                                top: `${star.position.y}%`,
                                transform: 'translate(-50%, -50%)',
                            }}
                            className="absolute z-10 cursor-pointer"
                            onClick={() => handleStarClick(star)}
                        >
                            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                                <div
                                    className="absolute rounded-full bg-white"
                                    style={{
                                        width: size, height: size,
                                        boxShadow: `0 0 ${glow * 8}px #fff, 0 0 ${glow * 16}px #a78bfa, 0 0 ${glow * 24}px #8b5cf6`,
                                        opacity: 0.9
                                    }}
                                />
                                <star.Icon className="relative text-purple-900" style={{width: iconSize, height: iconSize}}/>
                            </div>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <div className="flex items-center gap-2">
                            <star.Icon className="h-4 w-4"/>
                            <span className="font-bold">{star.label}:</span>
                            <span>{star.id === 'studyTime' ? `${(star.value/3600).toFixed(1)}h` : star.value.toLocaleString()}</span>
                        </div>
                    </TooltipContent>
                    </Tooltip>
                </DialogTrigger>
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
