
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  query,
  updateDoc,
  increment,
  writeBatch,
  addDoc,
  getDocs,
  collectionGroup,
  where
} from 'firebase/firestore';
import { format } from 'date-fns';
import { useUsers } from './use-admin';
import { useVisibilityChange } from './use-visibility-change';
import type { Roadmap } from './use-roadmaps';


export interface Subject {
  id: string;
  name: string;
  color: string;
  timeTracked: number; // in seconds
}

export interface TimeSession {
    id: string; // doc id
    userId: string;
    subjectName: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
    roadmapId?: string; // Link to a roadmap
}

export interface PomodoroSession {
  id: string;
  userId: string;
  type: 'focus' | 'shortBreak' | 'longBreak';
  duration: number; // in seconds
  completedAt: string; // ISO string
}

export type PomodoroSessionData = Omit<PomodoroSession, 'id' | 'userId' | 'completedAt'>;


interface TimeTrackerState {
  subjects: Subject[];
  activeSubjectId: string | null;
  currentSessionStart: string | null; // ISO string
}

const THIRTY_MINUTES = 30 * 60 * 1000; // in milliseconds

export function useTimeTracker() {
  const { user } = useUser();
  const { currentUserData, updateStudyTime } = useUsers();
  const todayString = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [state, setState] = useState<TimeTrackerState>({
    subjects: [],
    activeSubjectId: null,
    currentSessionStart: null,
  });
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectsDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, 'users', user.id, 'timeTracker', 'subjects');
  }, [user]);

  // Subscribe to subjects for the current user
  useEffect(() => {
    if (!subjectsDocRef) {
      setLoading(false);
      return;
    }
    const unsubscribe = onSnapshot(subjectsDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setState(prev => ({ ...prev, subjects: data.subjects || [] }));
      } else {
         const defaultSubjects: Subject[] = [
            { id: '1', name: 'English', color: '#3b82f6', timeTracked: 0 },
            { id: '2', name: 'Mathematics', color: '#ef4444', timeTracked: 0 },
            { id: '3', name: 'Physics', color: '#22c55e', timeTracked: 0 },
        ];
        setDoc(subjectsDocRef, { subjects: defaultSubjects });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [subjectsDocRef]);
  
  // Subscribe to time sessions for ALL users (for leaderboard)
  useEffect(() => {
    if (!user) {
        setSessions([]);
        setPomodoroSessions([]);
        return;
    }

    const allSessionsQuery = query(collectionGroup(db, 'timeTrackerSessions'));
    const allPomodoroQuery = query(collectionGroup(db, 'pomodoroSessions'));

    const unsubAllSessions = onSnapshot(allSessionsQuery, (snapshot) => {
      const allUserSessions = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          userId: doc.ref.parent.parent?.id || 'unknown'
        } as TimeSession));
      setSessions(allUserSessions);
    });

    const unsubAllPomodoros = onSnapshot(allPomodoroQuery, (snapshot) => {
        const allPomSessions = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            userId: doc.ref.parent.parent?.id || 'unknown'
        } as PomodoroSession));
        setPomodoroSessions(allPomSessions);
    });
    
    return () => {
        unsubAllSessions();
        unsubAllPomodoros();
    };
  }, [user]);

  // Calculate today's time for the current user's subjects
  useEffect(() => {
    if (!user) return;
    
    const todaySessions = sessions.filter(s => 
        s.userId === user.id && 
        s.startTime.startsWith(todayString)
    );
      
    setState(prev => {
      const newSubjects = prev.subjects.map(s => {
        const subjectTime = todaySessions
          .filter(ts => ts.subjectName === s.name)
          .reduce((acc, ts) => acc + ((new Date(ts.endTime).getTime() - new Date(ts.startTime).getTime()) / 1000), 0);
        return {...s, timeTracked: subjectTime};
      });
      return {...prev, subjects: newSubjects};
    });

  }, [sessions, todayString, user]);
  

  const [activeSubjectTime, setActiveSubjectTime] = useState(0);

  // Live timer for active subject
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.activeSubjectId && state.currentSessionStart) {
      const startTime = new Date(state.currentSessionStart).getTime();
      const initialTrackedTime = state.subjects.find(s => s.id === state.activeSubjectId)?.timeTracked || 0;
      
      const updateTimer = () => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setActiveSubjectTime(initialTrackedTime + elapsed);
      };

      updateTimer(); // Initial update
      interval = setInterval(updateTimer, 1000);

    } else {
      const activeSub = state.subjects.find(s => s.id === state.activeSubjectId);
      setActiveSubjectTime(activeSub?.timeTracked || 0);
    }
    return () => clearInterval(interval);
  }, [state.activeSubjectId, state.currentSessionStart, state.subjects]);
  
  const addPomodoroSession = useCallback(async (sessionData: PomodoroSessionData) => {
    if (!user) return;
    const sessionRef = collection(db, 'users', user.id, 'pomodoroSessions');
    const completedAt = new Date().toISOString();
    
    const newSession: Omit<PomodoroSession, 'id'> = {
        userId: user.id,
        completedAt,
        ...sessionData
    };
    await addDoc(sessionRef, newSession);
    
    const newTotalStudyTime = (currentUserData?.totalStudyTime || 0) + sessionData.duration;
    await updateStudyTime(user.id, newTotalStudyTime);

  }, [user, currentUserData, updateStudyTime]);

  const finishSession = useCallback(async (subjectId: string, startTime: string, roadmapId?: string, endTimeOverride?: Date): Promise<number> => {
    if (!user) return 0;
    const allSessionsColRef = collection(db, 'users', user.id, 'timeTrackerSessions');

    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return 0;

    const endTime = endTimeOverride || new Date();
    const duration = (endTime.getTime() - new Date(startTime).getTime()) / 1000;

    if (duration < 1) return subject.timeTracked;

    const newSession: Omit<TimeSession, 'id'> = {
        userId: user.id,
        subjectName: subject.name,
        startTime: startTime,
        endTime: endTime.toISOString(),
        ...(roadmapId && { roadmapId: roadmapId })
    };
    
    await addDoc(allSessionsColRef, newSession);
    
    const newTotalStudyTime = (currentUserData?.totalStudyTime || 0) + duration;
    await updateStudyTime(user.id, newTotalStudyTime);
    
    return subject.timeTracked + duration;

  }, [user, state.subjects, currentUserData, updateStudyTime]);

  const handlePlayPause = useCallback(async (subjectId: string, roadmapId?: string) => {
    const nowISO = new Date().toISOString();
    
    setState(prevState => {
        // Pausing the current subject
        if (prevState.activeSubjectId === subjectId) {
            if(prevState.currentSessionStart) {
                finishSession(subjectId, prevState.currentSessionStart, roadmapId).then(newTotalTime => {});
            }
            return { ...prevState, activeSubjectId: null, currentSessionStart: null };
        } else {
          // Pausing previous and starting new
          if (prevState.activeSubjectId && prevState.currentSessionStart) {
            finishSession(prevState.activeSubjectId, prevState.currentSessionStart, roadmapId).then(newTotalTime => {});
          }
          // Starting a new subject
          return { ...prevState, activeSubjectId: subjectId, currentSessionStart: nowISO };
        }
    });
  }, [finishSession]);

  useVisibilityChange(() => {
    if (document.visibilityState === 'hidden' && state.activeSubjectId && state.currentSessionStart) {
      const hiddenTimestamp = Date.now();
      
      const handleVisibilityReturn = async () => {
        if (document.visibilityState === 'visible') {
            if(Date.now() - hiddenTimestamp > THIRTY_MINUTES) {
                await handlePlayPause(state.activeSubjectId!);
            }
            window.removeEventListener('visibilitychange', handleVisibilityReturn);
        }
      }
      window.addEventListener('visibilitychange', handleVisibilityReturn);
    }
  });

  const addSubject = useCallback(async ({ name, color }: { name: string; color: string }) => {
    if (!subjectsDocRef) return;
    const newSubject: Subject = {
        id: Date.now().toString(),
        name,
        color,
        timeTracked: 0
    };
    await setDoc(subjectsDocRef, { subjects: [...state.subjects, newSubject] }, { merge: true });
  }, [subjectsDocRef, state.subjects]);
  
  const updateSubject = useCallback(async (id: string, data: { name: string; color: string }) => {
     if (!subjectsDocRef) return;
     const newSubjects = state.subjects.map(s => s.id === id ? { ...s, ...data } : s);
     await setDoc(subjectsDocRef, { subjects: newSubjects }, { merge: true });
  }, [subjectsDocRef, state.subjects]);
  
  const deleteSubject = useCallback(async (id: string) => {
      if (!subjectsDocRef) return;

      if(state.activeSubjectId === id && state.currentSessionStart) {
          await finishSession(id, state.currentSessionStart);
      }

      const newSubjects = state.subjects.filter(s => s.id !== id);
      setState(prev => ({...prev, activeSubjectId: null, currentSessionStart: null, subjects: newSubjects}));
      await setDoc(subjectsDocRef, { subjects: newSubjects }, { merge: true });

  }, [subjectsDocRef, state.subjects, state.activeSubjectId, state.currentSessionStart, finishSession]);

  const totalTimeToday = useMemo(() => {
    return state.subjects.reduce((acc, s) => acc + s.timeTracked, 0);
  }, [state.subjects]);
  

  return {
    subjects: state.subjects,
    sessions,
    pomodoroSessions,
    loading,
    activeSubjectId: state.activeSubjectId,
    activeSubjectTime,
    totalTimeToday,
    handlePlayPause,
    addSubject,
    updateSubject,
    deleteSubject,
    addPomodoroSession
  };
}
