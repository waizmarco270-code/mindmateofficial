
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { format, getWeek, getYear } from 'date-fns';

export interface Goal {
    id: string; // YYYY-WW for weekly
    text: string;
    updatedAt: Date;
}

interface GoalsContextType {
    weeklyGoal: Goal | null;
    updateWeeklyGoal: (text: string) => Promise<void>;
    loading: boolean;
}

const GoalsContext = createContext<GoalsContextType | undefined>(undefined);

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const [weeklyGoal, setWeeklyGoal] = useState<Goal | null>(null);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const weekId = `${getYear(now)}-${getWeek(now, { weekStartsOn: 1 })}`;
    
    // Subscribe to weekly goal
    useEffect(() => {
        if (!user) {
             setLoading(false);
            return;
        }
        setLoading(true);
        const docRef = doc(db, 'users', user.id, 'weeklyGoals', weekId);
        const unsubscribe = onSnapshot(docRef, (doc) => {
            if (doc.exists()) {
                 const data = doc.data();
                setWeeklyGoal({ id: doc.id, ...data, updatedAt: data.updatedAt.toDate() } as Goal);
            } else {
                setWeeklyGoal(null);
            }
             setLoading(false);
        });
        return () => unsubscribe();
    }, [user, weekId]);

    const updateWeeklyGoal = useCallback(async (text: string) => {
        if (!user) return;
        const docRef = doc(db, 'users', user.id, 'weeklyGoals', weekId);
        await setDoc(docRef, {
            id: weekId,
            text,
            updatedAt: new Date(),
        });
    }, [user, weekId]);

    const value: GoalsContextType = {
        weeklyGoal,
        updateWeeklyGoal,
        loading,
    };

    return (
        <GoalsContext.Provider value={value}>
            {children}
        </GoalsContext.Provider>
    );
};

export const useGoals = () => {
    const context = useContext(GoalsContext);
    if (context === undefined) {
        throw new Error('useGoals must be used within a GoalsProvider');
    }
    return context;
};

    