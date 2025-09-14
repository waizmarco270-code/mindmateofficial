
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, getDoc, query, setDoc, where, getDocs, writeBatch, serverTimestamp, addDoc, Timestamp, increment } from 'firebase/firestore';
import { useUsers } from './use-admin';
import { useToast } from './use-toast';

export interface ReferralRequest {
    id: string; // doc ID
    referrerId: string; // User who owns the code
    referrerName: string;
    newUserId: string; // User who used the code
    newUserName: string;
    codeUsed: string;
    status: 'pending' | 'completed' | 'declined';
    createdAt: Timestamp;
}

export const useReferrals = () => {
    const { user: authUser } = useUser();
    const { users, currentUserData } = useUsers();
    const { toast } = useToast();
    const [referrals, setReferrals] = useState<ReferralRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch all referrals for the admin panel
    useEffect(() => {
        const referralsRef = collection(db, 'referrals');
        const q = query(referralsRef, where('status', '==', 'pending'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReferrals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ReferralRequest));
            setReferrals(fetchedReferrals);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching referrals:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const submitReferralCode = useCallback(async (code: string) => {
        if (!authUser || !currentUserData) throw new Error("You must be logged in.");
        if (currentUserData.referralUsed) throw new Error("You have already used a referral code.");

        // Find the user who owns this referral code
        const q = query(collection(db, 'users'));
        const usersSnapshot = await getDocs(q);
        const referrer = usersSnapshot.docs.find(doc => {
            const userData = doc.data();
            const namePart = (userData.displayName || 'user').replace(/\s+/g, '').substring(0, 7);
            const idPart = userData.uid.substring(userData.uid.length - 3);
            const userCode = `${namePart}-${idPart}`.toUpperCase();
            return userCode === code.toUpperCase();
        });

        if (!referrer) {
            throw new Error("Invalid referral code.");
        }
        
        if (referrer.id === authUser.id) {
            throw new Error("You cannot use your own referral code.");
        }

        // Create a new referral request document
        await addDoc(collection(db, 'referrals'), {
            referrerId: referrer.id,
            referrerName: referrer.data().displayName,
            newUserId: authUser.id,
            newUserName: currentUserData.displayName,
            codeUsed: code.toUpperCase(),
            status: 'pending',
            createdAt: serverTimestamp(),
        });
        
        // Mark that the current user has used a code
        const userDocRef = doc(db, 'users', authUser.id);
        await updateDoc(userDocRef, {
            referralUsed: true,
            referredBy: referrer.id
        });

    }, [authUser, currentUserData]);

    const approveReferral = useCallback(async (referral: ReferralRequest) => {
        const referralRef = doc(db, 'referrals', referral.id);
        const referrerRef = doc(db, 'users', referral.referrerId);

        const batch = writeBatch(db);
        
        // Grant credits to the referrer
        batch.update(referrerRef, { credits: increment(50) });
        // Mark referral as completed
        batch.update(referralRef, { status: 'completed' });

        await batch.commit();
        toast({ title: 'Referral Approved!', description: `${referral.referrerName} has been granted 50 credits.` });
    }, [toast]);
    
    const declineReferral = useCallback(async (referralId: string) => {
        const referralRef = doc(db, 'referrals', referralId);
        await updateDoc(referralRef, { status: 'declined' });
        toast({ title: 'Referral Declined' });
    }, [toast]);

    return {
        pendingReferrals: referrals,
        loading,
        submitReferralCode,
        approveReferral,
        declineReferral
    };
}
