
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Play, Pause, RotateCcw, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  sessions: number;
  sound: 'digital' | 'chime' | 'sweet';
}

const defaultSettings: PomodoroSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessions: 4,
  sound: 'digital',
};

const soundMap = {
    digital: '/sounds/digital.mp3',
    chime: '/sounds/chime.mp3',
    sweet: '/sounds/sweet.mp3',
};

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', defaultSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [tempSettings, setTempSettings] = useState(settings);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        audioRef.current = new Audio();
    }
  }, []);

  const playNotificationSound = useCallback(() => {
    if (audioRef.current) {
        audioRef.current.src = soundMap[settings.sound];
        audioRef.current.play().catch(error => console.error("Audio playback failed:", error));
    }
  }, [settings.sound]);

  const resetTimer = useCallback(() => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    let nextMode: TimerMode = 'focus';
    let nextTime = settings.focus * 60;
    
    if (mode === 'focus') {
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      if (newSessionsCompleted % settings.sessions === 0) {
        nextMode = 'longBreak';
        nextTime = settings.longBreak * 60;
      } else {
        nextMode = 'shortBreak';
        nextTime = settings.shortBreak * 60;
      }
    }
    
    setMode(nextMode);
    setTimeLeft(nextTime);
  }, [mode, sessionsCompleted, settings]);


  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      playNotificationSound();
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, resetTimer, playNotificationSound]);
  
  useEffect(() => {
    // Reset timer when settings change and it's not active
    if (!isActive) {
      setTimeLeft(settings[mode] * 60);
    }
  }, [settings, mode, isActive]);

  const handleToggle = () => {
    setIsActive(!isActive);
  };
  
  const handleReset = () => {
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  }

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    if (!isActive) {
        setTimeLeft(tempSettings[mode] * 60);
    }
    setIsEditDialogOpen(false);
  }

  const totalDuration = settings[mode] * 60;
  const progress = (timeLeft / totalDuration) * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const modeText = {
      focus: "Time to Focus",
      shortBreak: "Take a Short Break",
      longBreak: "Take a Long Break"
  }

  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center text-white overflow-hidden bg-gray-900">
      <div className="absolute inset-0 z-0 blue-nebula-bg" />
      <AnimatePresence>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute top-16 md:top-24 text-center z-10"
        >
            <p className="text-xl font-medium tracking-wider uppercase text-white/80">{modeText[mode]}</p>
        </motion.div>
      </AnimatePresence>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center justify-center p-4"
      >
        <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full flex items-center justify-center">
            {/* Background circle */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-md rounded-full shadow-2xl"/>
            {/* Progress circle */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50"/>
                <motion.circle
                    className="text-green-400"
                    strokeWidth="3"
                    strokeDasharray="295.3"
                    strokeDashoffset={295.3 * (1 - progress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    initial={{ strokeDashoffset: 295.3 }}
                    animate={{ strokeDashoffset: 295.3 * (1 - progress / 100) }}
                    transition={{ duration: 1 }}
                />
            </svg>
             <div className="relative flex flex-col items-center text-center">
                <p className="font-mono text-6xl md:text-7xl font-bold tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                </p>
                 <Button variant="ghost" className="mt-4 text-white/70 hover:text-white" onClick={() => { setTempSettings(settings); setIsEditDialogOpen(true); }}>
                    <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
            </div>
        </div>
      </motion.div>
      
      <div className="absolute bottom-16 md:bottom-24 z-10 flex items-center gap-4">
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
      
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pomodoro Settings</DialogTitle>
            <DialogDescription>Customize your focus and break intervals.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="focus" className="text-right">Focus</Label>
              <Input id="focus" type="number" value={tempSettings.focus} onChange={(e) => setTempSettings(s => ({...s, focus: parseInt(e.target.value)}))} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shortBreak" className="text-right">Short Break</Label>
              <Input id="shortBreak" type="number" value={tempSettings.shortBreak} onChange={(e) => setTempSettings(s => ({...s, shortBreak: parseInt(e.target.value)}))} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="longBreak" className="text-right">Long Break</Label>
              <Input id="longBreak" type="number" value={tempSettings.longBreak} onChange={(e) => setTempSettings(s => ({...s, longBreak: parseInt(e.target.value)}))} className="col-span-3"/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sessions" className="text-right">Sessions</Label>
              <Input id="sessions" type="number" value={tempSettings.sessions} onChange={(e) => setTempSettings(s => ({...s, sessions: parseInt(e.target.value)}))} className="col-span-3"/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sound" className="text-right">Sound</Label>
                <Select value={tempSettings.sound} onValueChange={(v: any) => setTempSettings(s => ({...s, sound: v}))}>
                    <SelectTrigger id="sound" className="col-span-3">
                        <SelectValue placeholder="Select a sound" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="digital"><Music className="mr-2 h-4 w-4" /> Digital</SelectItem>
                        <SelectItem value="chime"><Music className="mr-2 h-4 w-4" /> Chime</SelectItem>
                        <SelectItem value="sweet"><Music className="mr-2 h-4 w-4" /> Short & Sweet</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveSettings}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
