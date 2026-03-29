
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, increment, setDoc, Timestamp, getDoc, serverTimestamp, writeBatch, collection, addDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { useUsers, User, BadgeType } from './use-admin';
import { useToast } from './use-toast';
import { format, addDays, isPast, differenceInSeconds } from 'date-fns';

export type IsolationDuration = '7d' | '14d' | '21d' | '30d' | '3m' | '6m' | '1y';

export interface IsolationConfig {
    id: IsolationDuration;
    label: string;
    days: number;
    targetHours: number;
    creditCost: number;
    moneyCost: number;
    exitCreditCost: number;
    exitMoneyCost: number;
    rewardCredits: number;
    rewardWallet: number;
    badge: BadgeType;
    badgeName: string;
}

export const ISOLATION_CONFIGS: Record<IsolationDuration, IsolationConfig> = {
    '7d': { id: '7d', label: '7 Days', days: 7, targetHours: 70, creditCost: 500, moneyCost: 99, exitCreditCost: 3999, exitMoneyCost: 99, rewardCredits: 1000, rewardWallet: 50, badge: 'isolater', badgeName: 'ISOLATER' },
    '14d': { id: '14d', label: '14 Days', days: 14, targetHours: 140, creditCost: 1000, moneyCost: 199, exitCreditCost: 5999, exitMoneyCost: 199, rewardCredits: 2500, rewardWallet: 100, badge: 'iso-warrior', badgeName: 'ISO-WARRIOR' },
    '21d': { id: '21d', label: '21 Days', days: 21, targetHours: 210, creditCost: 1500, moneyCost: 299, exitCreditCost: 7999, exitMoneyCost: 299, rewardCredits: 4000, rewardWallet: 150, badge: 'warrior', badgeName: 'WARRIOR' },
    '30d': { id: '30d', label: '30 Days', days: 30, targetHours: 300, creditCost: 2000, moneyCost: 499, exitCreditCost: 9999, exitMoneyCost: 399, rewardCredits: 6000, rewardWallet: 250, badge: 'warrior', badgeName: 'WARRIOR' },
    '3m': { id: '3m', label: '3 Months', days: 90, targetHours: 900, creditCost: 5000, moneyCost: 1299, exitCreditCost: 11999, exitMoneyCost: 499, rewardCredits: 15000, rewardWallet: 750, badge: 'iso-master', badgeName: 'ISO-MASTER' },
    '6m': { id: '6m', label: '6 Months', days: 180, targetHours: 1800, creditCost: 8000, moneyCost: 2499, exitCreditCost: 13999, exitMoneyCost: 599, rewardCredits: 30000, rewardWallet: 1500, badge: 'iso-master', badgeName: 'ISO-MASTER' },
    '1y': { id: '1y', label: '1 Year', days: 365, targetHours: 3650, creditCost: 15000, moneyCost: 4999, exitCreditCost: 14999, exitMoneyCost: 699, rewardCredits: 100000, rewardWallet: 5000, badge: 'sovereign', badgeName: 'Sovereign' },
};

export interface IsolationTask {
    id: string;
    text: string;
    completed: boolean;
    createdAt: string; // ISO
}

export interface ActiveIsolation {
    durationId: IsolationDuration;
    startTime: string; // ISO
    endTime: string; // ISO
    totalTargetSeconds: number;
    accumulatedSeconds: number;
    dailyLogs?: Record<string, number>; // { 'YYYY-MM-DD': seconds }
    dailyTasks?: Record<string, IsolationTask[]>; // { 'YYYY-MM-DD': tasks }
    status: 'active' | 'completed' | 'failed';
    lastHeartbeat: string; // ISO
    currentVideoId?: string | null;
}

interface IsolationContextType {
    activeSession: ActiveIsolation | null;
    loading: boolean;
    startIsolation: (duration: IsolationDuration, method: 'credits' | 'money', transactionId?: string) => Promise<void>;
    updateProgress: (seconds: number) => Promise<void>;
    setSessionVideoId: (videoId: string | null) => Promise<void>;
    addIsolationTask: (dateKey: string, text: string) => Promise<void>;
    toggleIsolationTask: (dateKey: string, taskId: string) => Promise<void>;
    failIsolation: () => Promise<void>;
    emergeVictory: () => Promise<void>;
    payForEarlyExit: (method: 'credits' | 'wallet' | 'razorpay', transactionId?: string) => Promise<void>;
}

const IsolationContext = createContext<IsolationContextType | undefined>(undefined);

export const IsolationProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { currentUserData, addCreditsToUser } = useUsers();
    const { toast } = useToast();
    const [activeSession, setActiveSession] = useState<ActiveIsolation | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');
        const unsubscribe = onSnapshot(sessionRef, (snap) => {
            if (snap.exists()) {
                const data = snap.data() as ActiveIsolation;
                const lastBeat = new Date(data.lastHeartbeat);
                const now = new Date();
                if (data.status === 'active' && differenceInSeconds(now, lastBeat) > 86400) {
                    updateDoc(sessionRef, { status: 'failed' });
                }
                setActiveSession(data);
            } else {
                setActiveSession(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const startIsolation = async (durationId: IsolationDuration, method: 'credits' | 'money', transactionId?: string) => {
        if (!user || !currentUserData) return;
        
        const config = ISOLATION_CONFIGS[durationId];
        const now = new Date();
        const end = addDays(now, config.days);

        const newSession: ActiveIsolation = {
            durationId,
            startTime: now.toISOString(),
            endTime: end.toISOString(),
            totalTargetSeconds: config.targetHours * 3600,
            accumulatedSeconds: 0,
            dailyLogs: { [format(now, 'yyyy-MM-dd')]: 0 },
            dailyTasks: { [format(now, 'yyyy-MM-dd')]: [] },
            status: 'active',
            lastHeartbeat: now.toISOString(),
            currentVideoId: null
        };

        if (method === 'credits') {
            const hasMaster = currentUserData.masterCardExpires && new Date(currentUserData.masterCardExpires) > now;
            if (!hasMaster && currentUserData.credits < config.creditCost) {
                throw new Error("Insufficient credits for isolation ingress.");
            }
            if (!hasMaster) await addCreditsToUser(user.id, -config.creditCost);
        }

        await setDoc(doc(db, 'users', user.id, 'isolation', 'current'), newSession);
        
        toast({ 
            title: "ISOLATION PROTOCOL INITIATED", 
            description: `You are now locked in for ${config.label}. Farewell, Legend.`,
            className: "bg-black text-white border-primary"
        });
    };

    const updateProgress = async (seconds: number) => {
        if (!user || !activeSession || activeSession.status !== 'active') return;
        
        const todayKey = format(new Date(), 'yyyy-MM-dd');
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');
        
        await updateDoc(sessionRef, {
            accumulatedSeconds: increment(seconds),
            [`dailyLogs.${todayKey}`]: increment(seconds),
            lastHeartbeat: new Date().toISOString()
        });
    };

    const addIsolationTask = async (dateKey: string, text: string) => {
        if (!user || !activeSession) return;
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');
        const newTask: IsolationTask = {
            id: `task-${Date.now()}`,
            text,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        await updateDoc(sessionRef, {
            [`dailyTasks.${dateKey}`]: arrayUnion(newTask)
        });
    };

    const toggleIsolationTask = async (dateKey: string, taskId: string) => {
        if (!user || !activeSession) return;
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');
        const currentTasks = activeSession.dailyTasks?.[dateKey] || [];
        
        const updatedTasks = currentTasks.map(t => {
            if (t.id === taskId) {
                return { ...t, completed: !t.completed };
            }
            return t;
        });

        await updateDoc(sessionRef, {
            [`dailyTasks.${dateKey}`]: updatedTasks
        });
    };

    const setSessionVideoId = async (videoId: string | null) => {
        if (!user || !activeSession) return;
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');
        await updateDoc(sessionRef, { currentVideoId: videoId });
    };

    const failIsolation = async () => {
        if (!user || !activeSession) return;
        await updateDoc(doc(db, 'users', user.id, 'isolation', 'current'), { status: 'failed' });
        toast({ variant: 'destructive', title: "ISOLATION BREACHED", description: "You have failed the protocol. Ingress fee is forfeit." });
    };

    const emergeVictory = async () => {
        if (!user || !activeSession || activeSession.status !== 'active') return;
        const config = ISOLATION_CONFIGS[activeSession.durationId];
        
        const batch = writeBatch(db);
        const userRef = doc(db, 'users', user.id);
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');

        batch.update(userRef, {
            credits: increment(config.rewardCredits),
            walletBalance: increment(config.rewardWallet),
            showcasedBadge: config.badge,
            [`is${config.badge.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`]: true
        });
        
        batch.update(sessionRef, { status: 'completed' });
        
        await batch.commit();
        toast({ title: "ASCENSION COMPLETE!", description: "You have emerged from isolation as a true legend.", className: "bg-green-500 text-white" });
    };

    const payForEarlyExit = async (method: 'credits' | 'wallet' | 'razorpay', transactionId?: string) => {
        if (!user || !activeSession || !currentUserData) return;
        const config = ISOLATION_CONFIGS[activeSession.durationId];

        const userRef = doc(db, 'users', user.id);
        const sessionRef = doc(db, 'users', user.id, 'isolation', 'current');

        if (method === 'credits') {
            if (currentUserData.credits < config.exitCreditCost) throw new Error("Insufficient credits.");
            await updateDoc(userRef, { credits: increment(-config.exitCreditCost) });
        } else if (method === 'wallet') {
            if (currentUserData.walletBalance < config.exitMoneyCost) throw new Error("Insufficient wallet balance.");
            await updateDoc(userRef, { walletBalance: increment(-config.exitMoneyCost) });
        }

        await deleteDoc(sessionRef);
        toast({ title: "ISOLATION TERMINATED", description: "You have paid for an early extraction. Protocol ended." });
    };

    return (
        <IsolationContext.Provider value={{ activeSession, loading, startIsolation, updateProgress, setSessionVideoId, addIsolationTask, toggleIsolationTask, failIsolation, emergeVictory, payForEarlyExit }}>
            {children}
        </IsolationContext.Provider>
    );
};

export const useIsolation = () => {
    const context = useContext(IsolationContext);
    if (!context) throw new Error('useIsolation must be used within an IsolationProvider');
    return context;
};
