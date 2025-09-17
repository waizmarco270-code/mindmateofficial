
'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Play, Pause, RotateCcw, Palette, CheckCircle, Volume2, VolumeX, Music, AlertTriangle, Info, SwatchBook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useTimeTracker, PomodoroSessionData } from '@/hooks/use-time-tracker';
import { useUser } from '@clerk/nextjs';
import { useUsers } from '@/hooks/use-admin';
import { useToast } from '@/hooks/use-toast';
import { useBeforeunload } from 'react-beforeunload';
import { useVisibilityChange } from '@/hooks/use-visibility-change';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';


type TimerMode = 'focus' | 'shortBreak' | 'longBreak';
type WatchFace = 'default' | 'minimal' | 'digital' | 'elegant';

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
  sound: 'beep' | 'chime' | 'bell';
}

const musicTracks = [
    { id: 'none', name: 'No Music', src: '' },
    { id: 'irreplaceable', name: 'The Irreplaceable', src: '/audio/irreplaceable.mp3' },
    { id: 'hans-zimmer', name: 'Hans Zimmer Mix', src: '/audio/hans-zimmer.mp3' },
    { id: 'interstellar', name: 'Interstellar', src: '/audio/interstellar.mp3' },
    { id: 'max-focus', name: 'Max Focus', src: '/audio/max-focus.mp3' },
    { id: 'soothing', name: 'Soothing Piano', src: '/audio/soothing.mp3' },
];

const defaultSettings: PomodoroSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  sessions: 4,
  sound: 'beep',
};

const POMODORO_PENALTY = 10;
export const POMODORO_PENALTY_SESSION_KEY = 'pomodoroPenaltyApplied';
export const POMODORO_SESSION_ACTIVE_KEY = 'pomodoroSessionActive';

export function PomodoroTimer() {
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>('pomodoroSettings', defaultSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isActive, setIsActive] = useState(false);
  const [isMuted, setIsMuted] = useLocalStorage('pomodoroMuted', false);
  const [sessionsCompleted, setSessionsCompleted] = useLocalStorage('pomodoroSessionsCompleted', 0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isThemeSheetOpen, setIsThemeSheetOpen] = useState(false);
  const [isMusicSheetOpen, setIsMusicSheetOpen] = useState(false);
  const [isFaceSheetOpen, setIsFaceSheetOpen] = useState(false);
  const { user } = useUser();
  const { addPomodoroSession } = useTimeTracker();
  const { addCreditsToUser, currentUserData } = useUsers();
  const { toast } = useToast();
  
  const [tempSettings, setTempSettings] = useState(settings);
  
  const { pomodoroThemes } = placeholderData;
  const [selectedTheme, setSelectedTheme] = useLocalStorage<PomodoroTheme | null>('pomodoroSelectedTheme', pomodoroThemes.nature[0]);
  const [selectedMusic, setSelectedMusic] = useLocalStorage<typeof musicTracks[0]>('pomodoroSelectedMusic', musicTracks[0]);
  const [selectedWatchFace, setSelectedWatchFace] = useLocalStorage<WatchFace>('pomodoroWatchFace', 'default');

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const penaltyAppliedRef = useRef(false);

  const applyPenalty = useCallback(() => {
    if (!user || penaltyAppliedRef.current || !isActive) return;

    penaltyAppliedRef.current = true;
    addCreditsToUser(user.id, -POMODORO_PENALTY);
    const penaltyMessage = `You have been penalized ${POMODORO_PENALTY} credits for leaving an active Pomodoro session.`;

    if (typeof window !== 'undefined') {
      sessionStorage.setItem(POMODORO_PENALTY_SESSION_KEY, penaltyMessage);
      sessionStorage.removeItem(POMODORO_SESSION_ACTIVE_KEY);
    }
    
    toast({
      variant: 'destructive',
      title: 'Session Interrupted',
      description: penaltyMessage,
    });
    
    // Immediately stop the timer locally
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
    if(musicAudioRef.current) musicAudioRef.current.pause();

  }, [user, addCreditsToUser, toast, isActive, settings, mode]);

  useBeforeunload(event => {
    if (isActive) applyPenalty();
  });

  useVisibilityChange(() => {
    if (isActive && document.visibilityState === 'hidden') {
      applyPenalty();
    }
  });


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

    if (type === 'notification') {
        oscillator.type = 'sine';
        const now = audioContextRef.current.currentTime;
        if (soundToPlay === 'beep') {
            oscillator.frequency.setValueAtTime(659.25, now);
            oscillator.frequency.linearRampToValueAtTime(440, now + 0.1);
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        } else if (soundToPlay === 'chime') {
            oscillator.frequency.setValueAtTime(523.25, now);
            gainNode.gain.setValueAtTime(0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
        } else { // bell
            oscillator.frequency.setValueAtTime(783.99, now);
            gainNode.gain.setValueAtTime(0.35, now);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1);
        }
        oscillator.start(now);
        oscillator.stop(now + 1);
    }
  }, [isMuted, settings.sound]);

  const resetTimer = useCallback((isManualReset = false) => {
    setIsActive(false);
     if (typeof window !== 'undefined') {
        sessionStorage.removeItem(POMODORO_SESSION_ACTIVE_KEY);
    }
    if (musicAudioRef.current) musicAudioRef.current.pause();
    
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
  }, [mode, sessionsCompleted, setSessionsCompleted, settings]);


  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isActive) {
      timerId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            playSound('notification');
            const sessionData: PomodoroSessionData = {
              type: mode,
              duration: settings[mode] * 60,
            };
            addPomodoroSession(sessionData);
            resetTimer();
            return settings.focus * 60;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerId) {
        clearInterval(timerId);
      }
    };
  }, [isActive, addPomodoroSession, mode, playSound, resetTimer, settings]);
  
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[mode] * 60);
    }
  }, [settings, mode, isActive]);

  const handleToggle = () => {
    if (isActive) { // User is trying to stop it
      applyPenalty();
      return;
    }
    // Starting a new session
    if (currentUserData && currentUserData.credits < POMODORO_PENALTY) {
        toast({
            variant: 'destructive',
            title: 'Insufficient Credits for Penalty',
            description: `You need at least ${POMODORO_PENALTY} credits to start a session in case of a penalty.`
        });
        return;
    }

    if (typeof window !== 'undefined' && !audioContextRef.current) {
        try {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) { console.error("Web Audio API is not supported"); }
    }
    if(audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
    }
    
    setIsActive(true);
    penaltyAppliedRef.current = false;
    if (typeof window !== 'undefined') {
        sessionStorage.setItem(POMODORO_SESSION_ACTIVE_KEY, 'true');
    }
  };
  
   // Music playback control
    useEffect(() => {
        const audioEl = musicAudioRef.current;
        if (!audioEl) return;

        if (isActive && selectedMusic.src) {
            audioEl.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioEl.pause();
        }
    }, [isActive, selectedMusic]);

    useEffect(() => {
        const audioEl = musicAudioRef.current;
        if(audioEl) audioEl.muted = isMuted;
    }, [isMuted]);
  
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

  const timerFaceClasses: Record<WatchFace, string> = {
    default: 'font-mono text-6xl md:text-7xl font-bold tabular-nums tracking-tighter',
    minimal: 'font-sans text-5xl md:text-6xl font-light tracking-widest',
    digital: 'font-code text-5xl md:text-6xl font-black',
    elegant: 'font-serif text-6xl md:text-7xl font-normal'
  };


  return (
    <div className="absolute inset-0 z-0 flex flex-col h-full w-full text-white overflow-hidden bg-gray-900">
        {selectedMusic.src && <audio ref={musicAudioRef} src={selectedMusic.src} loop muted={isMuted} />}
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
        
        <div className="absolute top-4 right-4 z-20">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-amber-400 hover:text-amber-300 relative">
                        <AlertTriangle className="h-6 w-6 animate-pulse"/>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-50"></span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                   <div className="space-y-4">
                       <h4 className="font-bold text-base flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Penalty Rules</h4>
                       <p className="text-sm text-muted-foreground">To encourage deep focus, a penalty system is in place.</p>
                       <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                           <li><span className="font-bold text-destructive">No Pausing:</span> This timer cannot be paused. Clicking STOP will incur a penalty.</li>
                           <li><span className="font-bold text-destructive">Navigation Penalty:</span> Navigating away from this page, switching tabs, or closing the browser during an active session will result in a <span className="font-bold">-10 credit penalty</span>.</li>
                       </ul>
                   </div>
                </PopoverContent>
            </Popover>
        </div>


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
                     <div className="mt-2 text-sm font-semibold bg-black/20 rounded-full px-3 py-1 inline-block">
                        Sessions Completed: {sessionsCompleted}
                    </div>
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
                        <p className={cn(timerFaceClasses[selectedWatchFace], "[text-shadow:0_2px_8px_rgba(0,0,0,0.7)]")}>
                            {formatTime(timeLeft)}
                        </p>
                        <Button variant="ghost" className="mt-4 text-white/70 hover:text-white" onClick={() => { setTempSettings(settings); setIsEditDialogOpen(true); }}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Button>
                    </div>
                </div>
            </motion.div>
            
             <div className="z-10 flex items-center justify-center w-full px-4 fixed bottom-8 sm:relative sm:bottom-auto">
                <div className="flex items-center gap-2 sm:gap-4 p-2 bg-black/30 backdrop-blur-lg rounded-full shadow-2xl">
                    <Button variant="ghost" size="icon" className="h-12 w-12 text-white/70 hover:text-white" onClick={handleReset}>
                        <RotateCcw className="h-6 w-6" />
                    </Button>

                    <Button 
                        className={cn(
                            "h-16 w-32 sm:w-40 rounded-full text-2xl font-bold shadow-lg text-gray-900",
                            isActive ? "bg-red-400/90 hover:bg-red-400" : "bg-white/90 hover:bg-white"
                        )}
                        onClick={handleToggle}
                    >
                        {isActive ? "STOP" : "START"}
                    </Button>
                    
                    <div className="flex items-center gap-0">
                         <Sheet open={isMusicSheetOpen} onOpenChange={setIsMusicSheetOpen}>
                            <SheetTrigger asChild>
                               <Button variant="ghost" size="icon" className="h-12 w-12 text-white/70 hover:text-white"><Music className="h-6 w-6" /></Button>
                            </SheetTrigger>
                            <SheetContent><SheetHeader><SheetTitle>Ambient Music</SheetTitle></SheetHeader>
                                <RadioGroup value={selectedMusic.id} onValueChange={(val) => setSelectedMusic(musicTracks.find(t => t.id === val) || musicTracks[0])} className="py-4">
                                    {musicTracks.map(track => (
                                        <div key={track.id} className="flex items-center space-x-2">
                                            <RadioGroupItem value={track.id} id={track.id} />
                                            <Label htmlFor={track.id} className="text-base">{track.name}</Label>
                                        </div>
                                    ))}
                                </RadioGroup>
                            </SheetContent>
                        </Sheet>
                        <Sheet open={isThemeSheetOpen} onOpenChange={setIsThemeSheetOpen}>
                            <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-12 w-12 text-white/70 hover:text-white"><Palette className="h-6 w-6" /></Button></SheetTrigger>
                            <SheetContent side="bottom" className="max-h-[80dvh]"><SheetHeader><SheetTitle>Themes</SheetTitle></SheetHeader>
                                <div className="py-4 space-y-6 overflow-y-auto">
                                    <div><h3 className="mb-4 font-semibold">Nature</h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {pomodoroThemes.nature.map((theme) => (<button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-square w-full rounded-full overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                                <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="15vw" className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                                {selectedTheme?.id === theme.id && <div className="absolute inset-0 bg-primary/50 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white"/></div>}
                                            </button>))}
                                        </div>
                                    </div>
                                    <div><h3 className="mb-4 font-semibold">Lofi</h3>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                            {pomodoroThemes.lofi.map((theme) => (<button key={theme.id} onClick={() => { setSelectedTheme(theme); setIsThemeSheetOpen(false); }} className="relative aspect-square w-full rounded-full overflow-hidden group border-2 border-transparent data-[state=selected]:border-primary transition-all">
                                                <Image src={theme.src} alt={theme['data-ai-hint']} fill sizes="15vw" className="object-cover group-hover:scale-110 transition-transform duration-300"/>
                                                {selectedTheme?.id === theme.id && <div className="absolute inset-0 bg-primary/50 flex items-center justify-center"><CheckCircle className="h-6 w-6 text-white"/></div>}
                                            </button>))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                         <Sheet open={isFaceSheetOpen} onOpenChange={setIsFaceSheetOpen}>
                            <SheetTrigger asChild><Button variant="ghost" size="icon" className="h-12 w-12 text-white/70 hover:text-white"><SwatchBook className="h-6 w-6" /></Button></SheetTrigger>
                            <SheetContent side="right"><SheetHeader><SheetTitle>Watch Faces</SheetTitle></SheetHeader>
                                <RadioGroup value={selectedWatchFace} onValueChange={(v: WatchFace) => setSelectedWatchFace(v)} className="py-4 space-y-2">
                                     <Label htmlFor="face-default" className={cn("flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer", selectedWatchFace === 'default' && 'border-primary bg-primary/10')}>
                                        <RadioGroupItem value="default" id="face-default"/>
                                        <span className="font-mono text-2xl font-bold">12:34</span>
                                    </Label>
                                    <Label htmlFor="face-minimal" className={cn("flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer", selectedWatchFace === 'minimal' && 'border-primary bg-primary/10')}>
                                        <RadioGroupItem value="minimal" id="face-minimal"/>
                                        <span className="font-sans text-2xl font-light tracking-widest">12:34</span>
                                    </Label>
                                    <Label htmlFor="face-digital" className={cn("flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer", selectedWatchFace === 'digital' && 'border-primary bg-primary/10')}>
                                        <RadioGroupItem value="digital" id="face-digital"/>
                                        <span className="font-code text-2xl font-black">12:34</span>
                                    </Label>
                                    <Label htmlFor="face-elegant" className={cn("flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer", selectedWatchFace === 'elegant' && 'border-primary bg-primary/10')}>
                                        <RadioGroupItem value="elegant" id="face-elegant"/>
                                        <span className="font-serif text-2xl">12:34</span>
                                    </Label>
                                </RadioGroup>
                            </SheetContent>
                        </Sheet>
                         <Button variant="ghost" size="icon" className="h-12 w-12 text-white/70 hover:text-white" onClick={() => setIsMuted(m => !m)}>
                            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
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
                <div className="flex items-center gap-2">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                        {(['beep', 'chime', 'bell'] as const).map(sound => (
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
