
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, query, orderBy, 
    setDoc, updateDoc, increment, arrayUnion, 
    serverTimestamp, deleteDoc, Timestamp 
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { useToast } from './use-toast';

export interface MentorSession {
    id: string;
    title: string;
    description: string;
    mentorId: string;
    mentorName: string;
    startTime: Timestamp;
    duration: number; // in minutes
    maxUsers: number;
    participants: string[];
    roomId: string;
    status: 'upcoming' | 'live' | 'ended';
    createdAt: any;
    feedback?: Record<string, { rating: number; comment: string }>;
}

export function useMentor() {
    const { user } = useUser();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'mentorSessions'), orderBy('startTime', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MentorSession));
            setSessions(fetched);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const createSession = async (data: Omit<MentorSession, 'id' | 'participants' | 'status' | 'createdAt' | 'roomId'>) => {
        const id = `session-${Date.now()}`;
        const newSession = {
            ...data,
            id,
            participants: [],
            status: 'upcoming',
            roomId: `mentor-${id}`,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'mentorSessions', id), newSession);
        toast({ title: "Mission Scheduled", description: "The mentorship session is now live in the hub." });
    };

    const bookSlot = async (sessionId: string) => {
        if (!user) return;
        const sessionRef = doc(db, 'mentorSessions', sessionId);
        
        try {
            await updateDoc(sessionRef, {
                participants: arrayUnion(user.id)
            });
            toast({ title: "Slot Secured", description: "You are officially authorized for this briefing." });
        } catch (e) {
            toast({ variant: 'destructive', title: "Booking Failed", description: "The session might be full or corrupted." });
        }
    };

    const updateSessionStatus = async (sessionId: string, status: MentorSession['status']) => {
        await updateDoc(doc(db, 'mentorSessions', sessionId), { status });
    };

    const deleteSession = async (sessionId: string) => {
        await deleteDoc(doc(db, 'mentorSessions', sessionId));
        toast({ title: "Session Purged" });
    };

    const submitFeedback = async (sessionId: string, rating: number, comment: string) => {
        if (!user) return;
        await updateDoc(doc(db, 'mentorSessions', sessionId), {
            [`feedback.${user.id}`]: { rating, comment, timestamp: new Date().toISOString() }
        });
        toast({ title: "Feedback Recorded", description: "Thank you for contributing to the collective intelligence." });
    };

    return { sessions, loading, createSession, bookSlot, updateSessionStatus, deleteSession, submitFeedback };
}
