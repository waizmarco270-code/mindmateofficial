
'use client';
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

export function Stopwatch() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { pomodoroThemes } = placeholderData;
  const [selectedTheme] = useLocalStorage('pomodoroSelectedTheme', pomodoroThemes.nature[0]);

  useEffect(() => {
    if (isActive) {
      const startTime = Date.now() - (timeElapsed * 1000);
      timerRef.current = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 100); // Update every 100ms for smoother display
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeElapsed]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };
  
  const handleReset = () => {
    setIsActive(false);
    setTimeElapsed(0);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="relative inset-0 z-0 h-full w-full flex flex-col text-white overflow-hidden bg-gray-900">
      {selectedTheme && (
        <motion.div
          key={selectedTheme.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={selectedTheme.src}
            alt="Stopwatch background theme"
            layout="fill"
            objectFit="cover"
            className="animate-[zoom-pan_30s_ease-in-out_infinite]"
            data-ai-hint={selectedTheme['data-ai-hint']}
            priority
          />
          <div className="absolute inset-0 bg-black/50" />
        </motion.div>
      )}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col items-center justify-center p-4"
        >
          <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-full shadow-2xl"/>
            <div className="relative flex flex-col items-center text-center">
              <p className="font-mono text-6xl md:text-7xl font-bold tabular-nums tracking-tighter [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
                {formatTime(timeElapsed)}
              </p>
            </div>
          </div>
        </motion.div>
        
        <div className="z-10 flex items-center gap-4 mt-8">
          <Button variant="ghost" size="icon" className="h-16 w-16 text-white/70 hover:text-white" onClick={handleReset}>
            <RotateCcw className="h-8 w-8" />
          </Button>
          <Button 
            className="h-20 w-48 rounded-full text-2xl font-bold shadow-lg bg-white/90 text-gray-900 hover:bg-white"
            onClick={handleToggle}
          >
            {isActive ? <Pause className="h-8 w-8"/> : <Play className="h-8 w-8"/>}
          </Button>
          <div className="h-16 w-16"></div>
        </div>
      </div>
    </div>
  );
}
