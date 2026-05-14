
'use client';

import { useState, useEffect, useCallback, createContext, useContext, ReactNode, useMemo } from 'react';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, setDoc, 
    query, orderBy, serverTimestamp, 
    Timestamp, getDoc, updateDoc 
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { useToast } from './use-toast';

export interface DailyManifest {
    id: string;
    dateKey: string; // YYYY-MM-DD
    summary: string;
    videoUrl?: string;
    mood: 'productive' | 'neutral' | 'exhausted' | 'failed';
    createdAt: any;
    updatedAt: any;
}

interface LedgerContextType {
    manifests: DailyManifest[];
    loading: boolean;
    saveManifest: (dateKey: string, data: Partial<DailyManifest>) => Promise<void>;
    getManifestByDate: (dateKey: string) => DailyManifest | null;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const LedgerProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useUser();
    const { toast } = useToast();
    const [manifests, setManifests] = useState<DailyManifest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users', user.id, 'ledger'),
            orderBy('dateKey', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate() || new Date(),
                updatedAt: d.data().updatedAt?.toDate() || new Date(),
            } as DailyManifest));
            setManifests(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Ledger Sync Error:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    const saveManifest = useCallback(async (dateKey: string, data: Partial<DailyManifest>) => {
        if (!user) return;

        const manifestRef = doc(db, 'users', user.id, 'ledger', dateKey);
        const snap = await getDoc(manifestRef);

        const payload = {
            ...data,
            dateKey,
            updatedAt: serverTimestamp(),
            ...( !snap.exists() && { createdAt: serverTimestamp() } )
        };

        try {
            await setDoc(manifestRef, payload, { merge: true });
            toast({ title: "MANIFEST SEALED", description: `Record for ${dateKey} has been secured in the registry.` });
        } catch (e: any) {
            toast({ variant: 'destructive', title: "SEALING FAILED", description: e.message });
        }
    }, [user, toast]);

    const getManifestByDate = useCallback((dateKey: string) => {
        return manifests.find(m => m.dateKey === dateKey) || null;
    }, [manifests]);

    const value = useMemo(() => ({
        manifests, loading, saveManifest, getManifestByDate
    }), [manifests, loading, saveManifest, getManifestByDate]);

    return (
        <LedgerContext.Provider value={value}>
            {children}
        </LedgerContext.Provider>
    );
};

export const useLedger = () => {
    const context = useContext(LedgerContext);
    if (!context) throw new Error('useLedger must be used within a LedgerProvider');
    return context;
};
