
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Play, Pause, RotateCcw, Music, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import { CheckCircle } from 'lucide-react';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroTheme {
  id: string;
  src: string;
  'data-ai-hint': string;
}

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
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);

  const [tempSettings, setTempSettings] = useState(settings);
  
  const { pomodoroThemes } = placeholderData;
  const [selectedTheme, setSelectedTheme] = useLocalStorage<PomodoroTheme | null>('pomodoroSelectedTheme', pomodoroThemes.nature[0]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playNotificationSound = useCallback(() => {
    if (!audioContextRef.current) return;
    const audioContext = audioContextRef.current;
    
    fetch(soundMap[settings.sound])
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start(0);
      })
      .catch(error => console.error("Error playing sound:", error));
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
    if (!audioContextRef.current && typeof window !== 'undefined') {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser");
        }
    }
    // Resume audio context if it's suspended
    if(audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
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
      <AnimatePresence>
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
                    alt="Pomodoro background theme"
                    layout="fill"
                    objectFit="cover"
                    className="animate-[zoom-pan_30s_ease-in-out_infinite]"
                    data-ai-hint={selectedTheme['data-ai-hint']}
                />
                <div className="absolute inset-0 bg-black/50" />
            </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
          exit={{ opacity: 0, y: 20, transition: { duration: 0.3, ease: 'easeIn' } }}
          className="absolute top-16 md:top-24 text-center z-10"
        >
            <p className="text-xl font-medium tracking-wider uppercase text-white/80 [text-shadow:0_1px_4px_rgba(0,0,0,0.5)]">{modeText[mode]}</p>
        </motion.div>
      </AnimatePresence>
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center justify-center p-4"
      >
        <div className="relative h-64 w-64 md:h-80 md:w-80 rounded-full flex items-center justify-center">
            {/* Background circle */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-full shadow-2xl"/>
            {/* Progress circle */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50"/>
                <motion.circle
                    className="text-green-400 [filter:drop-shadow(0_0_4px_currentColor)]"
                    strokeWidth="3"
                    strokeDasharray="301.59"
                    strokeDashoffset={301.59 * (1 - progress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="48"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                    initial={{ strokeDashoffset: 301.59 }}
                    animate={{ strokeDashoffset: 301.59 * (1 - progress / 100) }}
                    transition={{ duration: 1, ease: "linear" }}
                />
            </svg>
             <div className="relative flex flex-col items-center text-center">
                <p className="font-mono text-6xl md:text-7xl font-bold tabular-nums tracking-tighter [text-shadow:0_2px_8px_rgba(0,0,0,0.7)]">
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
            <Sheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-16 w-16 text-white/70 hover:text-white">
                        <Palette className="h-8 w-8" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[80dvh]">
                    <SheetHeader>
                        <SheetTitle>Themes</SheetTitle>
                    </SheetHeader>
                    <div className="py-4 space-y-6 overflow-y-auto">
                        <div>
                            <h3 className="mb-4 font-semibold">Nature</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {pomodoroThemes.nature.map((theme) => (
                                    <button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-[9/16] w-full rounded-lg overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                        <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="30vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                                        {selectedTheme?.id === theme.id && <div className="absolute top-2 right-2 p-1.5 bg-primary rounded-full text-primary-foreground"><CheckCircle className="h-4 w-4"/></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                         <div>
                            <h3 className="mb-4 font-semibold">Lofi</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {pomodoroThemes.lofi.map((theme) => (
                                    <button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-[9/16] w-full rounded-lg overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                        <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="30vw" className="object-cover group-hover:scale-105 transition-transform duration-300"/>
                                        {selectedTheme?.id === theme.id && <div className="absolute top-2 right-2 p-1.5 bg-primary rounded-full text-primary-foreground"><CheckCircle className="h-4 w-4"/></div>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
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
