

'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, orderBy, addDoc, updateDoc, getDoc, serverTimestamp, increment, arrayUnion } from 'firebase/firestore';

// --- TYPE DEFINITIONS ---

export interface RoadmapTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface RoadmapCategory {
  id: string;
  title: string;
  color: string;
  tasks: RoadmapTask[];
}

export interface RoadmapMilestone {
  day: number;
  categories: RoadmapCategory[];
}

export interface Roadmap {
  id: string;
  userId: string;
  name: string;
  examDate: string; // ISO string
  duration: number; // in days
  startDate: string; // ISO string
  milestones: RoadmapMilestone[];
  dailyStudyTime: Record<string, number>; // { 'YYYY-MM-DD': seconds }
  weeklyReflections: Record<string, { rating: number; note: string; }>; // { 'week-start-date': { ... } }
  // Discipline Trackers
  hasNoFapTracker?: boolean;
  noFapStartDate?: string; // ISO string
  relapseHistory?: string[]; // Array of ISO strings
  hasWorkoutTracker?: boolean;
  workoutLog?: Record<string, boolean>; // { 'YYYY-MM-DD': true }
}

interface RoadmapsContextType {
  roadmaps: Roadmap[];
  loading: boolean;
  selectedRoadmap: Roadmap | null;
  setSelectedRoadmapId: (id: string | null) => void;
  addRoadmap: (roadmapData: Omit<Roadmap, 'id' | 'userId'>) => Promise<string | undefined>;
  updateRoadmap: (id: string, data: Partial<Roadmap>) => Promise<void>;
  deleteRoadmap: (id: string) => Promise<void>;
  logStudyTime: (roadmapId: string, date: string, seconds: number) => Promise<void>;
  addWeeklyReflection: (roadmapId: string, weekStartDate: string, reflection: { rating: number; note: string; }) => Promise<void>;
  toggleTaskCompletion: (roadmapId: string, day: number, categoryId: string, taskId: string) => Promise<void>;
  handleRelapse: (roadmapId: string) => Promise<void>;
  toggleWorkoutDay: (roadmapId: string, date: string) => Promise<void>;
}

// --- CONTEXT ---

const RoadmapsContext = createContext<RoadmapsContextType | undefined>(undefined);

// --- PROVIDER ---

export const RoadmapsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setRoadmaps([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const roadmapsColRef = collection(db, 'users', user.id, 'roadmaps');
    const q = query(roadmapsColRef, orderBy('startDate', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedRoadmaps = snapshot.docs.map(doc => doc.data() as Roadmap);
      setRoadmaps(fetchedRoadmaps);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching roadmaps:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addRoadmap = useCallback(async (roadmapData: Omit<Roadmap, 'id' | 'userId'>) => {
    if (!user) return;
    const roadmapsColRef = collection(db, 'users', user.id, 'roadmaps');
    const newDocRef = doc(roadmapsColRef);
    const newRoadmap: Roadmap = {
      ...roadmapData,
      id: newDocRef.id,
      userId: user.id,
    };
    await setDoc(newDocRef, newRoadmap);
    return newDocRef.id;
  }, [user]);

  const updateRoadmap = useCallback(async (id: string, data: Partial<Roadmap>) => {
    if (!user) return;
    const roadmapDocRef = doc(db, 'users', user.id, 'roadmaps', id);
    await updateDoc(roadmapDocRef, data);
  }, [user]);

  const deleteRoadmap = useCallback(async (id: string) => {
    if (!user) return;
    const roadmapDocRef = doc(db, 'users', user.id, 'roadmaps', id);
    await deleteDoc(roadmapDocRef);
  }, [user]);

  const logStudyTime = useCallback(async (roadmapId: string, date: string, seconds: number) => {
     if (!user) return;
     const roadmapDocRef = doc(db, 'users', user.id, 'roadmaps', roadmapId);
     const roadmapSnap = await getDoc(roadmapDocRef);
     if(!roadmapSnap.exists()) return;

     const currentData = roadmapSnap.data() as Roadmap;
     const currentDailyTime = currentData.dailyStudyTime || {};
     const newTime = (currentDailyTime[date] || 0) + seconds;
     
     await updateDoc(roadmapDocRef, {
        [`dailyStudyTime.${date}`]: newTime
     });
  }, [user]);

  const addWeeklyReflection = useCallback(async (roadmapId: string, weekStartDate: string, reflection: { rating: number; note: string; }) => {
    if(!user) return;
    const roadmapDocRef = doc(db, 'users', user.id, 'roadmaps', roadmapId);
    await updateDoc(roadmapDocRef, {
        [`weeklyReflections.${weekStartDate}`]: reflection
    });
  }, [user]);

  const toggleTaskCompletion = useCallback(async (roadmapId: string, day: number, categoryId: string, taskId: string) => {
    if (!user) return;
    
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return;

    const newMilestones = roadmap.milestones.map(milestone => {
        if (milestone.day === day) {
            return {
                ...milestone,
                categories: milestone.categories.map(category => {
                    if (category.id === categoryId) {
                        return {
                            ...category,
                            tasks: category.tasks.map(task => {
                                if (task.id === taskId) {
                                    return { ...task, completed: !task.completed };
                                }
                                return task;
                            })
                        };
                    }
                    return category;
                })
            };
        }
        return milestone;
    });

    await updateRoadmap(roadmapId, { milestones: newMilestones });
  }, [user, roadmaps, updateRoadmap]);

  const handleRelapse = useCallback(async (roadmapId: string) => {
    if (!user) return;
    const roadmapDocRef = doc(db, 'users', user.id, 'roadmaps', roadmapId);
    await updateDoc(roadmapDocRef, {
      noFapStartDate: new Date().toISOString(),
      relapseHistory: arrayUnion(new Date().toISOString())
    });
  }, [user]);

  const toggleWorkoutDay = useCallback(async (roadmapId: string, date: string) => {
    if (!user) return;
    const roadmap = roadmaps.find(r => r.id === roadmapId);
    if (!roadmap) return;

    const newWorkoutLog = { ...(roadmap.workoutLog || {}) };
    if (newWorkoutLog[date]) {
      delete newWorkoutLog[date];
    } else {
      newWorkoutLog[date] = true;
    }

    await updateRoadmap(roadmapId, { workoutLog: newWorkoutLog });
  }, [user, roadmaps, updateRoadmap]);

  
  const selectedRoadmap = roadmaps.find(r => r.id === selectedRoadmapId) || null;

  const value = {
    roadmaps,
    loading,
    selectedRoadmap,
    setSelectedRoadmapId,
    addRoadmap,
    updateRoadmap,
    deleteRoadmap,
    logStudyTime,
    addWeeklyReflection,
    toggleTaskCompletion,
    handleRelapse,
    toggleWorkoutDay,
  };

  return <RoadmapsContext.Provider value={value}>{children}</RoadmapsContext.Provider>;
};


// --- HOOK ---

export const useRoadmaps = () => {
  const context = useContext(RoadmapsContext);
  if (context === undefined) {
    throw new Error('useRoadmaps must be used within a RoadmapsProvider');
  }
  return context;
};
