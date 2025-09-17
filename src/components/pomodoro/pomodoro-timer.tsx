
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Play, Pause, RotateCcw, Palette, CheckCircle, Volume2, VolumeX, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

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
  sound: 'digital' | 'chime' | 'bell';
}

const defaultSettings: PomodoroSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessions: 4,
  sound: 'digital',
};

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', defaultSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useLocalStorage('pomodoroMuted', false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  
  const [tempSettings, setTempSettings] = useState(settings);
  
  const { pomodoroThemes } = placeholderData;
  const [selectedTheme, setSelectedTheme] = useLocalStorage<PomodoroTheme | null>('pomodoroSelectedTheme', pomodoroThemes.nature[0]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const playSound = useCallback((type: 'tick' | 'notification', soundOverride?: PomodoroSettings['sound']) => {
    if (isMuted || typeof window === 'undefined') return;
    if (!audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) { console.error("Web Audio API is not supported"); return; }
    }
    if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);
    
    const soundToPlay = soundOverride || settings.sound;

    if (type === 'tick') {
        // Tick sound is disabled as it's often too much. Kept for potential future use.
    } else { // notification
        oscillator.type = 'sine';
        const now = audioContextRef.current.currentTime;
        if (soundToPlay === 'digital') {
            oscillator.frequency.setValueAtTime(659.25, now); // E5
            oscillator.frequency.linearRampToValueAtTime(440, now + 0.1); // A4
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        } else if (soundToPlay === 'chime') {
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            gainNode.gain.setValueAtTime(0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        } else { // bell
            oscillator.frequency.setValueAtTime(783.99, now); // G5
            gainNode.gain.setValueAtTime(0.35, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1);
        }
        oscillator.start(now);
        oscillator.stop(now + 1);
    }
  }, [isMuted, settings.sound]);


  const resetTimer = useCallback((isManualReset = false) => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    
    if (isManualReset) {
      setTimeLeft(settings[mode] * 60);
      return;
    }

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
      playSound('notification');
      resetTimer();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft, resetTimer, playSound]);
  
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[mode] * 60);
    }
  }, [settings, mode, isActive]);

  const handleToggle = () => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) { console.error("Web Audio API is not supported"); }
    }
    if(audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    setIsActive(prev => !prev);
  };
  
  const handleReset = () => {
    resetTimer(true);
  }

  const handleSaveSettings = () => {
    setSettings(tempSettings);
    if (!isActive) {
        setMode('focus'); // Reset to focus mode on settings change
        setTimeLeft(tempSettings.focus * 60);
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
    <div className="absolute inset-0 z-0 flex flex-col h-full w-full text-white overflow-hidden bg-gray-900">
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
                        priority
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </motion.div>
            )}
        </AnimatePresence>
        <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
                <motion.div
                key={mode}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: 20, transition: { duration: 0.3, ease: 'easeIn' } }}
                className="text-center z-10 pt-16 sm:pt-0"
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
                <div className="relative h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 rounded-full flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-md rounded-full shadow-2xl"/>
                    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100">
                        <circle className="text-white/10" strokeWidth="3" stroke="currentColor" fill="transparent" r="48" cx="50" cy="50"/>
                        <motion.circle
                            className="text-green-400 [filter:drop-shadow(0_0_4px_currentColor)]"
                            strokeWidth="3"
                            strokeDasharray="301.59"
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
            
            <div className="z-10 flex items-center gap-2 sm:gap-4 pb-16 sm:pb-0">
                <Button variant="ghost" size="icon" className="h-16 w-16 text-white/70 hover:text-white" onClick={handleReset}>
                    <RotateCcw className="h-8 w-8" />
                </Button>

                <Button 
                    className="h-20 w-40 sm:w-48 rounded-full text-2xl font-bold shadow-lg bg-white/90 text-gray-900 hover:bg-white"
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
                        <SheetHeader><SheetTitle>Themes</SheetTitle></SheetHeader>
                        <div className="py-4 space-y-6 overflow-y-auto">
                            <div>
                                <h3 className="mb-4 font-semibold">Nature</h3>
                                <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                    {pomodoroThemes.nature.map((theme) => (
                                        <button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-square w-full rounded-full overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                            <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="15vw" className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                            {selectedTheme?.id === theme.id && <div className="absolute inset-0 bg-primary/50 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white"/></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                             <div>
                                <h3 className="mb-4 font-semibold">Lofi</h3>
                                 <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                                    {pomodoroThemes.lofi.map((theme) => (
                                        <button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-square w-full rounded-full overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                            <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="15vw" className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                            {selectedTheme?.id === theme.id && <div className="absolute inset-0 bg-primary/50 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white"/></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                 <Button variant="ghost" size="icon" className="h-16 w-16 text-white/70 hover:text-white" onClick={() => setIsMuted(m => !m)}>
                    {isMuted ? <VolumeX className="h-8 w-8" /> : <Volume2 className="h-8 w-8" />}
                </Button>
            </div>
        </div>
       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Timer Settings</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
              <div className="space-y-3">
                  <Label>Quick Presets</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[15, 25, 45, 60].map(min => (
                        <Button key={min} variant="outline" onClick={() => setTempSettings(s => ({...s, focus: min}))}>
                            {min} min Focus
                        </Button>
                    ))}
                  </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="focus">Work Duration (minutes)</Label>
                    <Input id="focus" type="number" value={tempSettings.focus} onChange={(e) => setTempSettings(s => ({...s, focus: parseInt(e.target.value) || 0}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="shortBreak">Break Duration (minutes)</Label>
                    <Input id="shortBreak" type="number" value={tempSettings.shortBreak} onChange={(e) => setTempSettings(s => ({...s, shortBreak: parseInt(e.target.value) || 0}))}/>
                </div>
              </div>
              <div className="space-y-3">
                <Label>Alarm Sound</Label>
                <div className="grid grid-cols-3 gap-2">
                    {(['digital', 'chime', 'bell'] as const).map(sound => (
                        <Button 
                            key={sound}
                            variant={tempSettings.sound === sound ? 'default' : 'outline'}
                            onClick={() => {
                                setTempSettings(s => ({...s, sound}));
                                playSound('notification', sound);
                            }}
                            className="capitalize"
                        >
                            {sound}
                        </Button>
                    ))}
                </div>
              </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSettings}>Apply Settings</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

    