'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, query, orderBy, 
    setDoc, updateDoc, increment, arrayUnion, 
    serverTimestamp, deleteDoc, Timestamp, getDoc 
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { useToast } from './use-toast';
import { SUPER_ADMIN_UID } from './use-admin';

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
    passcode: string; 
    status: 'upcoming' | 'live' | 'ended';
    createdAt: any;
    feedback?: Record<string, { rating: number; comment: string }>;
}

export interface MentorRequest {
    id: string;
    userId: string;
    userName: string;
    userPhoto?: string;
    message: string;
    type: 'standard' | 'guaranteed';
    status: 'pending' | 'confirmed' | 'rejected';
    adminReply?: string;
    createdAt: Timestamp;
    paymentId?: string;
}

export function useMentor() {
    const { user } = useUser();
    const { toast } = useToast();
    const [sessions, setSessions] = useState<MentorSession[]>([]);
    const [requests, setRequests] = useState<MentorRequest[]>([]);
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

    useEffect(() => {
        const q = query(collection(db, 'mentorRequests'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MentorRequest));
            setRequests(fetched);
        });
        return () => unsubscribe();
    }, []);

    const createSession = async (data: Omit<MentorSession, 'id' | 'participants' | 'status' | 'createdAt' | 'roomId' | 'passcode'>) => {
        const id = `session-${Date.now()}`;
        const passcode = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newSession = {
            ...data,
            id,
            participants: [],
            status: 'upcoming',
            roomId: `mentor-${id}`,
            passcode,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, 'mentorSessions', id), newSession);
        toast({ title: "Mission Scheduled", description: `Session live with passcode: ${passcode}` });
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

    const submitMeetingRequest = async (message: string, type: 'standard' | 'guaranteed', paymentId?: string) => {
        if (!user) return;
        
        const requestId = `req-${Date.now()}`;
        const newRequest = {
            id: requestId,
            userId: user.id,
            userName: user.fullName || 'Legend',
            userPhoto: user.imageUrl,
            message,
            type,
            status: 'pending',
            createdAt: serverTimestamp(),
            paymentId: paymentId || null
        };

        await setDoc(doc(db, 'mentorRequests', requestId), newRequest);

        // Notify Admins
        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: type === 'guaranteed' ? "💎 GUARANTEED MISSION REQUEST" : "📨 New Briefing Request",
                message: `${user.fullName} requested: "${message.substring(0, 30)}..."`,
                userId: SUPER_ADMIN_UID, // Direct to Master
                linkUrl: '/dashboard/mentor/admin'
            })
        });

        toast({ 
            title: type === 'guaranteed' ? "SOVEREIGN PETITION FILED" : "PETITION FILED", 
            description: type === 'guaranteed' ? "Fulfillment is guaranteed. Waiting for schedule." : " petitiion is under review by the High Council." 
        });
    };

    const respondToRequest = async (requestId: string, status: 'confirmed' | 'rejected', reply: string) => {
        const reqRef = doc(db, 'mentorRequests', requestId);
        const reqSnap = await getDoc(reqRef);
        if (!reqSnap.exists()) return;
        const reqData = reqSnap.data() as MentorRequest;

        await updateDoc(reqRef, { status, adminReply: reply });

        // Notify User
        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: status === 'confirmed' ? "✅ REQUEST AUTHORIZED" : "❌ REQUEST DECLINED",
                message: reply || `Your meeting request has been ${status}.`,
                userId: reqData.userId,
                linkUrl: '/dashboard/mentor'
            })
        });

        toast({ title: "Response Dispatched" });
    };

    const deleteRequest = async (requestId: string) => {
        await deleteDoc(doc(db, 'mentorRequests', requestId));
        toast({ title: "Request Purged" });
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

    return { 
        sessions, requests, loading, 
        createSession, bookSlot, updateSessionStatus, 
        deleteSession, submitFeedback, submitMeetingRequest,
        respondToRequest, deleteRequest
    };
}