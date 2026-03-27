
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, addDoc, serverTimestamp, getDoc, query, where, arrayUnion } from 'firebase/firestore';
import { useToast } from './use-toast';
import { User } from './use-admin';

interface VoiceCallContextType {
    activeCall: CallSession | null;
    startCall: (targetUser: User) => Promise<void>;
    acceptCall: () => Promise<void>;
    rejectCall: () => Promise<void>;
    endCall: () => Promise<void>;
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
}

interface CallSession {
    id: string;
    callerId: string;
    receiverId: string;
    callerName: string;
    receiverName: string;
    callerPhoto?: string;
    receiverPhoto?: string;
    status: 'ringing' | 'active' | 'ended' | 'rejected';
    offer?: any;
    answer?: any;
    createdAt: any;
}

const VoiceCallContext = createContext<VoiceCallContextType | undefined>(undefined);

const servers = {
    iceServers: [
        { urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
    ],
    iceCandidatePoolSize: 10,
};

export const VoiceCallProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUser();
    const { toast } = useToast();
    const [activeCall, setActiveCall] = useState<CallSession | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    
    const pc = useRef<RTCPeerConnection | null>(null);
    const callUnsub = useRef<(() => void) | null>(null);

    // Listen for incoming calls
    useEffect(() => {
        if (!user) return;

        const callsRef = collection(db, 'calls');
        const q = query(callsRef, where('receiverId', '==', user.id), where('status', '==', 'ringing'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const callData = { id: change.doc.id, ...change.doc.data() } as CallSession;
                    setActiveCall(callData);
                }
            });
        });

        return () => unsubscribe();
    }, [user]);

    const setupPC = useCallback(async () => {
        pc.current = new RTCPeerConnection(servers);
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        setLocalStream(stream);
        
        stream.getTracks().forEach((track) => {
            pc.current?.addTrack(track, stream);
        });

        pc.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        return stream;
    }, []);

    const startCall = async (targetUser: User) => {
        if (!user) return;
        
        const stream = await setupPC();
        const callDoc = doc(collection(db, 'calls'));
        
        const offerDescription = await pc.current!.createOffer();
        await pc.current!.setLocalDescription(offerDescription);

        const offer = {
            sdp: offerDescription.sdp,
            type: offerDescription.type,
        };

        const callData: Omit<CallSession, 'id'> = {
            callerId: user.id,
            receiverId: targetUser.uid,
            callerName: user.fullName || 'User',
            receiverName: targetUser.displayName,
            callerPhoto: user.imageUrl,
            receiverPhoto: targetUser.photoURL,
            status: 'ringing',
            offer,
            createdAt: serverTimestamp(),
        };

        await setDoc(callDoc, callData);
        setActiveCall({ id: callDoc.id, ...callData } as CallSession);

        // Listen for answer and candidates
        const candidatesRef = collection(callDoc, 'candidates');
        pc.current!.onicecandidate = (event) => {
            event.candidate && addDoc(candidatesRef, { ...event.candidate.toJSON(), type: 'caller' });
        };

        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data() as CallSession;
            if (data?.answer && !pc.current!.currentRemoteDescription) {
                const answerDescription = new RTCSessionDescription(data.answer);
                pc.current!.setRemoteDescription(answerDescription);
            }
            if (data?.status === 'rejected' || data?.status === 'ended') {
                cleanup();
            }
        });

        onSnapshot(query(candidatesRef, where('type', '==', 'receiver')), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current!.addIceCandidate(candidate);
                }
            });
        });
    };

    const acceptCall = async () => {
        if (!activeCall || !pc.current) {
            await setupPC();
        }
        
        const callDoc = doc(db, 'calls', activeCall!.id);
        const candidatesRef = collection(callDoc, 'candidates');

        pc.current!.onicecandidate = (event) => {
            event.candidate && addDoc(candidatesRef, { ...event.candidate.toJSON(), type: 'receiver' });
        };

        const callData = (await getDoc(callDoc)).data() as CallSession;
        const offerDescription = new RTCSessionDescription(callData.offer);
        await pc.current!.setRemoteDescription(offerDescription);

        const answerDescription = await pc.current!.createAnswer();
        await pc.current!.setLocalDescription(answerDescription);

        const answer = {
            type: answerDescription.type,
            sdp: answerDescription.sdp,
        };

        await updateDoc(callDoc, { answer, status: 'active' });

        onSnapshot(query(candidatesRef, where('type', '==', 'caller')), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const candidate = new RTCIceCandidate(change.doc.data());
                    pc.current!.addIceCandidate(candidate);
                }
            });
        });
        
        onSnapshot(callDoc, (snap) => {
            if (snap.data()?.status === 'ended') cleanup();
        });
    };

    const rejectCall = async () => {
        if (!activeCall) return;
        await updateDoc(doc(db, 'calls', activeCall.id), { status: 'rejected' });
        cleanup();
    };

    const endCall = async () => {
        if (!activeCall) return;
        await updateDoc(doc(db, 'calls', activeCall.id), { status: 'ended' });
        cleanup();
    };

    const cleanup = () => {
        localStream?.getTracks().forEach(t => t.stop());
        setLocalStream(null);
        setRemoteStream(null);
        setActiveCall(null);
        pc.current?.close();
        pc.current = null;
    };

    return (
        <VoiceCallContext.Provider value={{ activeCall, startCall, acceptCall, rejectCall, endCall, localStream, remoteStream }}>
            {children}
        </VoiceCallContext.Provider>
    );
};

export const useVoiceCall = () => {
    const context = useContext(VoiceCallContext);
    if (!context) throw new Error('useVoiceCall must be used within a VoiceCallProvider');
    return context;
};
