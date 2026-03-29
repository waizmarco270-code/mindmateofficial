import { collection, doc, addDoc, updateDoc, deleteDoc, serverTimestamp, arrayUnion, runTransaction, increment, getDocs, writeBatch } from 'firebase/firestore';
import { type GlobalGift, type User } from '../use-admin';
import { addDays } from 'date-fns';

export const useSystemActions = (db: any, toast: any) => {
    const updateAppSettings = (s: any) => updateDoc(doc(db, 'appConfig', 'settings'), s);

    const sendGlobalGift = async (gift: any) => {
        const sanitizedRewards: any = {};
        if (gift.rewards) {
            Object.entries(gift.rewards).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== 0 && value !== 'none' && value !== '') {
                    sanitizedRewards[key] = value;
                }
            });
        }

        const sanitizedGift = { 
            message: gift.message || "A gift for you.",
            target: gift.target || 'all',
            rewards: sanitizedRewards,
            ...(gift.maxClaims && gift.maxClaims > 0 ? { maxClaims: gift.maxClaims } : {})
        };
        
        await addDoc(collection(db, 'globalGifts'), {
            ...sanitizedGift,
            createdAt: serverTimestamp(),
            isActive: true,
            claimedBy: []
        });

        const r = sanitizedRewards;
        const rewardsList = [];
        if (r.credits) rewardsList.push(`${r.credits} Credits`);
        if (r.wallet) rewardsList.push(`₹${r.wallet} Vault`);
        if (r.badge) rewardsList.push(`${r.badge.toUpperCase()} Rank`);
        if (r.alphaGlowWeeks) rewardsList.push(`Alpha Radiance`);
        if (r.shields) rewardsList.push(`${r.shields} Aegis`);
        
        const notificationData: any = {
            title: "🎁 Legendary Gift Pulse!",
            message: `Master sent you: ${rewardsList.join(', ') || 'Mission Assets'}! Claim now.`,
            linkUrl: '/dashboard'
        };

        if (sanitizedGift.target !== 'all') {
            const targets = Array.isArray(sanitizedGift.target) ? sanitizedGift.target : [sanitizedGift.target];
            for (const t of targets) {
                await fetch('/api/send-notification', { 
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...notificationData, userId: t }) 
                });
            }
        } else {
            await fetch('/api/send-notification', { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(notificationData) 
            });
        }
    };

    const claimGlobalGift = async (giftId: string, userId: string) => {
        await runTransaction(db, async (transaction) => {
            const giftRef = doc(db, 'globalGifts', giftId);
            const userRef = doc(db, 'users', userId);
            const giftSnap = await transaction.get(giftRef);
            const userSnap = await transaction.get(userRef);
            
            if (!giftSnap.exists()) throw new Error("Gift purged.");
            const gift = giftSnap.data() as GlobalGift;
            const userData = userSnap.data() as User;
            
            if (!gift.isActive || gift.claimedBy?.includes(userId)) throw new Error("Unavailable.");
            if (gift.maxClaims && gift.claimedBy && gift.claimedBy.length >= gift.maxClaims) {
                transaction.update(giftRef, { isActive: false });
                throw new Error("Out of stock.");
            }

            const updates: any = {};
            const r = gift.rewards;
            if (r.credits) updates.credits = increment(r.credits);
            if (r.scratch) updates.freeRewards = increment(r.scratch);
            if (r.flip) updates.freeGuesses = increment(r.flip);
            if (r.wallet) {
                updates.walletBalance = increment(r.wallet);
                updates.walletTransactions = arrayUnion({ id: `gift-${Date.now()}`, amount: r.wallet, type: 'topup', status: 'completed', date: new Date().toISOString() });
            }
            if (r.shields) updates['inventory.penaltyShields'] = increment(r.shields);
            if (r.freezes) updates['inventory.streakFreezes'] = increment(r.freezes);
            if (r.boosters) updates['inventory.clanXpBoosters'] = increment(r.boosters);
            if (r.maxers) updates['inventory.clanLevelMaxers'] = increment(r.maxers);
            if (r.alphaGlowWeeks) {
                const current = userData.inventory?.alphaGlowExpires ? new Date(userData.inventory.alphaGlowExpires) : new Date();
                const next = addDays(current > new Date() ? current : new Date(), 7 * r.alphaGlowWeeks);
                updates['inventory.alphaGlowExpires'] = next.toISOString();
            }
            if (r.badge) {
                const badgeKey = `is${r.badge.split('-').map((s:string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')}`;
                updates[badgeKey] = true;
            }

            transaction.update(giftRef, { claimedBy: arrayUnion(userId) });
            transaction.update(userRef, updates);
        });
    };

    const deactivateGift = (id: string) => updateDoc(doc(db, 'globalGifts', id), { isActive: false });
    const deleteGlobalGift = (id: string) => deleteDoc(doc(db, 'globalGifts', id));

    const addFeatureShowcase = (s: any) => addDoc(collection(db, 'featureShowcases'), { ...s, createdAt: serverTimestamp() });
    const updateFeatureShowcase = (id: string, d: any) => updateDoc(doc(db, 'featureShowcases', id), d);
    const deleteFeatureShowcase = (id: string) => deleteDoc(doc(db, 'featureShowcases', id));

    const submitSupportTicket = (msg: string, userId: string, userName: string) => 
        addDoc(collection(db, 'supportTickets'), { userId, userName, message: msg, status: 'new', createdAt: serverTimestamp() });

    const clearGlobalChat = async () => {
        const snap = await getDocs(collection(db, 'world_chat'));
        const batch = writeBatch(db);
        snap.docs.forEach(d => { if (d.id !== 'config') batch.delete(d.ref); });
        await batch.commit();
    };

    const clearQuizLeaderboard = async () => {
        const snap = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);
        snap.forEach(d => batch.update(d.ref, { perfectedQuizzes: [], quizAttempts: {} }));
        await batch.commit();
    };

    const resetWeeklyStudyTime = async () => {
        const snap = await getDocs(collectionGroup(db, 'timeTrackerSessions'));
        const batch = writeBatch(db);
        snap.forEach(d => batch.delete(d.ref));
        await batch.commit();
    };

    const resetGameZoneLeaderboard = async () => {
        const snap = await getDocs(collection(db, 'users'));
        const batch = writeBatch(db);
        snap.forEach(d => batch.update(d.ref, { gameHighScores: { memoryGame: 0, emojiQuiz: 0, dimensionShift: 0, subjectSprint: 0, flappyMind: 0, astroAscent: 0, mathematicsLegend: 0 } }));
        await batch.commit();
    };

    const topUpWallet = async (uid: string, amt: number, txId: string) => {
        await updateDoc(doc(db, 'users', uid), { 
            walletBalance: increment(amt), 
            lastWalletDeposit: new Date().toISOString(), 
            walletTransactions: arrayUnion({ id: txId, amount: amt, type: 'topup', status: 'completed', date: new Date().toISOString() }) 
        });
    };

    return {
        updateAppSettings, sendGlobalGift, claimGlobalGift, deactivateGift, deleteGlobalGift,
        addFeatureShowcase, updateFeatureShowcase, deleteFeatureShowcase,
        submitSupportTicket, clearGlobalChat, clearQuizLeaderboard, resetWeeklyStudyTime,
        resetGameZoneLeaderboard, topUpWallet
    };
};
