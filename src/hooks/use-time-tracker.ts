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
  writeBatch
} from 'firebase/firestore';
import { format } from 'date-fns';
import { useUsers } from './use-admin';

export interface Subject {
  id: string;
  name: string;
  color: string;
  timeTracked: number; // in seconds
}

export interface TimeSession {
    id: string; // doc id
    subjectId: string;
    subjectName: string;
    startTime: string; // ISO string
    endTime: string; // ISO string
}

interface TimeTrackerState {
  subjects: Subject[];
  activeSubjectId: string | null;
  currentSessionStart: string | null; // ISO string
}

export function useTimeTracker() {
  const { user } = useUser();
  const { updateStudyTime } = useUsers();
  const todayString = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const [state, setState] = useState<TimeTrackerState>({
    subjects: [],
    activeSubjectId: null,
    currentSessionStart: null
  });
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const subjectsDocRef = useMemo(() => {
    if (!user) return null;
    return doc(db, 'users', user.id, 'timeTracker', 'subjects');
  }, [user]);

  const todaySessionsColRef = useMemo(() => {
    if (!user) return null;
    return collection(db, 'users', user.id, 'dailyTrackerSessions', todayString, 'sessions');
  }, [user, todayString]);
  
  const allSessionsColRef = useMemo(() => {
    if (!user) return null;
    return collection(db, 'users', user.id, 'timeTrackerSessions');
  },[user])

  // Subscribe to subjects
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
        // Initialize with default subjects
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
  
  // Subscribe to all time sessions for the insights page
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'users', user.id, 'timeTrackerSessions'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedSessions = snapshot.docs.map(doc => ({...doc.data(), id: doc.id } as TimeSession));
        setSessions(fetchedSessions);
    });
    return () => unsubscribe();
  }, [user]);
  
   // Subscribe to today's sessions to calculate totalTimeToday
  useEffect(() => {
    if (!todaySessionsColRef) return;
    const unsubscribe = onSnapshot(todaySessionsColRef, (snapshot) => {
      const todaySessions = snapshot.docs.map(doc => doc.data() as TimeSession);
      const totalSeconds = todaySessions.reduce((acc, session) => {
        const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;
        return acc + duration;
      }, 0);
      
      const newSubjects = state.subjects.map(s => {
          const subjectTime = todaySessions
            .filter(ts => ts.subjectId === s.id)
            .reduce((acc, ts) => acc + ((new Date(ts.endTime).getTime() - new Date(ts.startTime).getTime()) / 1000), 0);
          return {...s, timeTracked: subjectTime};
      });
      
      setState(prev => ({...prev, subjects: newSubjects}));
    });
    return () => unsubscribe();
  }, [todaySessionsColRef, state.subjects]);
  

  const [activeSubjectTime, setActiveSubjectTime] = useState(0);

  // Live timer for active subject
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (state.activeSubjectId && state.currentSessionStart) {
      const startTime = new Date(state.currentSessionStart).getTime();
      const initialTrackedTime = state.subjects.find(s => s.id === state.activeSubjectId)?.timeTracked || 0;
      
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = (now - startTime) / 1000;
        setActiveSubjectTime(initialTrackedTime + elapsed);
      }, 1000);
    } else {
      const activeSub = state.subjects.find(s => s.id === state.activeSubjectId);
      setActiveSubjectTime(activeSub?.timeTracked || 0);
    }
    return () => clearInterval(interval);
  }, [state.activeSubjectId, state.currentSessionStart, state.subjects]);
  

  const finishSession = useCallback(async (subjectId: string, startTime: string) => {
    if (!user || !todaySessionsColRef || !allSessionsColRef) return;

    const subject = state.subjects.find(s => s.id === subjectId);
    if (!subject) return;

    const endTime = new Date();
    const duration = (endTime.getTime() - new Date(startTime).getTime()) / 1000;

    if (duration < 1) return; // Ignore very short sessions
    
    const batch = writeBatch(db);

    const newSession: Omit<TimeSession, 'id'> = {
        subjectId: subject.id,
        subjectName: subject.name,
        startTime: startTime,
        endTime: endTime.toISOString()
    };
    
    // Add to all sessions collection
    const allSessionsDocRef = doc(allSessionsColRef);
    batch.set(allSessionsDocRef, newSession);

    // Update total study time on user profile
    const userDocRef = doc(db, 'users', user.id);
    batch.update(userDocRef, { totalStudyTime: increment(duration) });

    await batch.commit();

  }, [user, todaySessionsColRef, allSessionsColRef, state.subjects, updateStudyTime]);

  const handlePlayPause = useCallback((subjectId: string) => {
    const nowISO = new Date().toISOString();
    
    setState(prevState => {
      // Pausing the current subject
      if (prevState.activeSubjectId === subjectId) {
        if(prevState.currentSessionStart) {
            finishSession(subjectId, prevState.currentSessionStart);
        }
        return { ...prevState, activeSubjectId: null, currentSessionStart: null };
      } else {
        // Pausing previous and starting new
        if (prevState.activeSubjectId && prevState.currentSessionStart) {
          finishSession(prevState.activeSubjectId, prevState.currentSessionStart);
        }
        // Starting a new subject
        return { ...prevState, activeSubjectId: subjectId, currentSessionStart: nowISO };
      }
    });
  }, [finishSession]);
  
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
    loading,
    activeSubjectId: state.activeSubjectId,
    activeSubjectTime,
    totalTimeToday,
    handlePlayPause,
    addSubject,
    updateSubject,
    deleteSubject
  };
}
