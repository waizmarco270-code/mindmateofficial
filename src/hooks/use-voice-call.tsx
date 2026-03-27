
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, addDoc, serverTimestamp, getDoc, query, where, Timestamp } from 'firebase/firestore';
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
    callDuration: number;
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
    startTime?: number;
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
    const [callDuration, setCallDuration] = useState(0);
    
    const pc = useRef<RTCPeerConnection | null>(null);
    const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && !remoteAudioRef.current) {
            const audio = document.createElement('audio');
            audio.autoplay = true;
            remoteAudioRef.current = audio;
        }
    }, []);

    useEffect(() => {
        if (remoteStream && remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Timer logic for active calls
    useEffect(() => {
        if (activeCall?.status === 'active') {
            const start = activeCall.startTime || Date.now();
            timerIntervalRef.current = setInterval(() => {
                setCallDuration(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setCallDuration(0);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [activeCall?.status, activeCall?.startTime]);

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

    const cleanup = useCallback(() => {
        localStream?.getTracks().forEach(t => t.stop());
        setLocalStream(null);
        setRemoteStream(null);
        setActiveCall(null);
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
    }, [localStream]);

    const setupPC = useCallback(async () => {
        pc.current = new RTCPeerConnection(servers);
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            setLocalStream(stream);
            
            stream.getTracks().forEach((track) => {
                pc.current?.addTrack(track, stream);
            });

            pc.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            return stream;
        } catch (e) {
            toast({ variant: 'destructive', title: "Microphone Required", description: "Enable mic permissions to start calls." });
            throw e;
        }
    }, [toast]);

    const startCall = async (targetUser: User) => {
        if (!user) return;
        
        const stream = await setupPC();
        const callDoc = doc(collection(db, 'calls'));
        
        const offerDescription = await pc.current!.createOffer();
        await pc.current!.setLocalDescription(offerDescription);

        const callData: Omit<CallSession, 'id'> = {
            callerId: user.id,
            receiverId: targetUser.uid,
            callerName: user.fullName || 'Legend',
            receiverName: targetUser.displayName,
            callerPhoto: user.imageUrl,
            receiverPhoto: targetUser.photoURL,
            status: 'ringing',
            offer: { sdp: offerDescription.sdp, type: offerDescription.type },
            createdAt: serverTimestamp(),
        };

        await setDoc(callDoc, callData);
        setActiveCall({ id: callDoc.id, ...callData } as CallSession);

        const candidatesRef = collection(callDoc, 'candidates');
        pc.current!.onicecandidate = (event) => {
            event.candidate && addDoc(candidatesRef, { ...event.candidate.toJSON(), type: 'caller' });
        };

        onSnapshot(callDoc, (snapshot) => {
            const data = snapshot.data() as CallSession;
            if (data?.answer && !pc.current!.currentRemoteDescription) {
                pc.current!.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
            if (data?.status === 'rejected' || data?.status === 'ended') cleanup();
            if (data?.status === 'active' && activeCall?.status === 'ringing') {
                setActiveCall(prev => prev ? { ...prev, status: 'active', startTime: data.startTime || Date.now() } : null);
            }
        });

        onSnapshot(query(candidatesRef, where('type', '==', 'receiver')), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
                }
            });
        });
    };

    const acceptCall = async () => {
        if (!activeCall) return;
        await setupPC();
        
        const callDoc = doc(db, 'calls', activeCall.id);
        const candidatesRef = collection(callDoc, 'candidates');

        pc.current!.onicecandidate = (event) => {
            event.candidate && addDoc(candidatesRef, { ...event.candidate.toJSON(), type: 'receiver' });
        };

        const callData = (await getDoc(callDoc)).data() as CallSession;
        await pc.current!.setRemoteDescription(new RTCSessionDescription(callData.offer));

        const answerDescription = await pc.current!.createAnswer();
        await pc.current!.setLocalDescription(answerDescription);

        const startTime = Date.now();
        await updateDoc(callDoc, { 
            answer: { type: answerDescription.type, sdp: answerDescription.sdp }, 
            status: 'active',
            startTime
        });

        setActiveCall(prev => prev ? { ...prev, status: 'active', startTime } : null);

        onSnapshot(query(candidatesRef, where('type', '==', 'caller')), (snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    pc.current!.addIceCandidate(new RTCIceCandidate(change.doc.data()));
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

    return (
        <VoiceCallContext.Provider value={{ activeCall, startCall, acceptCall, rejectCall, endCall, localStream, remoteStream, callDuration }}>
            {children}
        </VoiceCallContext.Provider>
    );
};

export const useVoiceCall = () => {
    const context = useContext(VoiceCallContext);
    if (!context) throw new Error('useVoiceCall must be used within a VoiceCallProvider');
    return context;
};
