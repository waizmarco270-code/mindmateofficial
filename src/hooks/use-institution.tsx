'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, query, where, 
    setDoc, updateDoc, increment, arrayUnion, 
    serverTimestamp, deleteDoc, getDocs, getDoc, 
    writeBatch, Timestamp, orderBy, arrayRemove
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { useToast } from './use-toast';
import { User, useAdmin } from './use-admin';

export interface Institution {
    id: string;
    name: string;
    description: string;
    logoUrl?: string | null;
    joinCode: string;
    createdBy: string;
    proctors: string[]; // UIDs
    monitors: string[]; // UIDs
    students: string[]; // UIDs
    createdAt: any;
    isPremium: boolean;
}

export interface AcademyDirective {
    id: string;
    text: string;
    deadline?: Timestamp;
    type: 'global' | 'subject' | 'urgent';
    status: 'active' | 'completed' | 'archived';
    createdAt: Timestamp;
}

interface InstitutionContextType {
    academy: Institution | null;
    students: User[];
    directives: AcademyDirective[];
    loading: boolean;
    createAcademy: (name: string, description: string) => Promise<void>;
    joinAcademy: (code: string) => Promise<void>;
    leaveAcademy: () => Promise<void>;
    deployDirective: (text: string, type: AcademyDirective['type'], deadline?: Date) => Promise<void>;
    setStudentRole: (studentId: string, role: 'monitor' | 'student') => Promise<void>;
    rewardStudent: (studentId: string, amount: number, message: string) => Promise<void>;
    deleteAcademy: () => Promise<void>;
}

const InstitutionContext = createContext<InstitutionContextType | undefined>(undefined);

export const InstitutionProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { currentUserData, users, addCreditsToUser } = useAdmin();
    const { toast } = useToast();
    const [academy, setAcademy] = useState<Institution | null>(null);
    const [directives, setDirectives] = useState<AcademyDirective[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter students belonging to this academy
    const studentsList = useMemo(() => {
        if (!academy) return [];
        return users.filter(u => 
            academy.students.includes(u.uid) || 
            academy.monitors.includes(u.uid) || 
            academy.proctors.includes(u.uid)
        );
    }, [academy, users]);

    useEffect(() => {
        if (!currentUserData?.institutionId) {
            setAcademy(null);
            setLoading(false);
            return;
        }

        const unsubAcademy = onSnapshot(doc(db, 'institutions', currentUserData.institutionId), (snap) => {
            if (snap.exists()) {
                setAcademy({ id: snap.id, ...snap.data() } as Institution);
            } else {
                setAcademy(null);
            }
            setLoading(false);
        });

        const unsubDirectives = onSnapshot(
            query(collection(db, 'institutions', currentUserData.institutionId, 'directives'), orderBy('createdAt', 'desc')),
            (snap) => {
                setDirectives(snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademyDirective)));
            }
        );

        return () => {
            unsubAcademy();
            unsubDirectives();
        };
    }, [currentUserData?.institutionId]);

    const createAcademy = useCallback(async (name: string, description: string) => {
        if (!user) return;
        const id = `academy-${Date.now()}`;
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        const newAcademy: Institution = {
            id,
            name,
            description,
            joinCode: code,
            createdBy: user.id,
            proctors: [user.id],
            monitors: [],
            students: [user.id],
            createdAt: serverTimestamp(),
            isPremium: true
        };

        const batch = writeBatch(db);
        batch.set(doc(db, 'institutions', id), newAcademy);
        batch.update(doc(db, 'users', user.id), { 
            institutionId: id, 
            institutionRole: 'proctor' 
        });

        await batch.commit();
        toast({ title: "Academy Established", description: `Join Code: ${code}` });
    }, [user, toast]);

    const joinAcademy = useCallback(async (code: string) => {
        if (!user) return;
        
        const q = query(collection(db, 'institutions'), where('joinCode', '==', code.trim().toUpperCase()));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            throw new Error("Invalid Academy Signal. Code not found.");
        }

        const academyDoc = snap.docs[0];
        const academyData = academyDoc.data() as Institution;

        const batch = writeBatch(db);
        batch.update(academyDoc.ref, { students: arrayUnion(user.id) });
        batch.update(doc(db, 'users', user.id), { 
            institutionId: academyDoc.id, 
            institutionRole: 'student' 
        });

        await batch.commit();
        toast({ title: "Academy Ingress Successful", description: `Joined ${academyData.name}.` });
    }, [user, toast]);

    const leaveAcademy = useCallback(async () => {
        if (!user || !academy) return;
        
        const batch = writeBatch(db);
        const academyRef = doc(db, 'institutions', academy.id);
        const userRef = doc(db, 'users', user.id);

        batch.update(academyRef, { 
            students: arrayRemove(user.id),
            monitors: arrayRemove(user.id),
            proctors: arrayRemove(user.id)
        });
        batch.update(userRef, { institutionId: null, institutionRole: null });

        await batch.commit();
        toast({ title: "Academy Disconnected" });
    }, [user, academy, toast]);

    const deployDirective = useCallback(async (text: string, type: AcademyDirective['type'], deadline?: Date) => {
        if (!academy || !user) return;
        
        const directiveRef = doc(collection(db, 'institutions', academy.id, 'directives'));
        await setDoc(directiveRef, {
            text,
            type,
            deadline: deadline ? Timestamp.fromDate(deadline) : null,
            status: 'active',
            createdAt: serverTimestamp()
        });

        // Notify Students
        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "🎯 NEW ACADEMY DIRECTIVE",
                message: text,
                linkUrl: '/dashboard/institution'
            })
        });

        toast({ title: "Directive Dispatched" });
    }, [academy, user, toast]);

    const setStudentRole = useCallback(async (studentId: string, role: 'monitor' | 'student') => {
        if (!academy) return;
        const academyRef = doc(db, 'institutions', academy.id);
        const studentRef = doc(db, 'users', studentId);

        const batch = writeBatch(db);
        if (role === 'monitor') {
            batch.update(academyRef, { monitors: arrayUnion(studentId) });
            batch.update(studentRef, { institutionRole: 'monitor', showcasedBadge: 'centurion' });
        } else {
            batch.update(academyRef, { monitors: arrayRemove(studentId) });
            batch.update(studentRef, { institutionRole: 'student', showcasedBadge: null });
        }

        await batch.commit();
        toast({ title: "Hierarchy Updated" });
    }, [academy, toast]);

    const rewardStudent = useCallback(async (studentId: string, amount: number, message: string) => {
        await addCreditsToUser(studentId, amount);
        
        await fetch('/api/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: "🎁 ACADEMY BOUNTY",
                message: `The Proctor rewarded you with ${amount} credits: "${message}"`,
                userId: studentId,
                linkUrl: '/dashboard'
            })
        });

        toast({ title: "Bounty Dispatched" });
    }, [addCreditsToUser, toast]);

    const deleteAcademy = useCallback(async () => {
        if (!academy || !user || academy.createdBy !== user.id) return;
        await deleteDoc(doc(db, 'institutions', academy.id));
        toast({ title: "Academy Dissolved" });
    }, [academy, user, toast]);

    const value = useMemo(() => ({
        academy, students: studentsList, directives, loading,
        createAcademy, joinAcademy, leaveAcademy,
        deployDirective, setStudentRole, rewardStudent, deleteAcademy
    }), [academy, studentsList, directives, loading, createAcademy, joinAcademy, leaveAcademy, deployDirective, setStudentRole, rewardStudent, deleteAcademy]);

    return (
        <InstitutionContext.Provider value={value}>
            {children}
        </InstitutionContext.Provider>
    );
};

export const useInstitution = () => {
    const context = useContext(InstitutionContext);
    if (!context) throw new Error('useInstitution must be used within an InstitutionProvider');
    return context;
};
