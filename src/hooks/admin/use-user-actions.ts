
import { doc, getDoc, updateDoc, increment, arrayUnion, arrayRemove, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { format, addDays } from 'date-fns';
import { type User, type BadgeType } from '../use-admin';

export const useUserActions = (db: any, toast: any) => {
    const todayString = () => format(new Date(), 'yyyy-MM-dd');

    const addCreditsToUser = async (uid: string, amount: number) => {
        if (!uid) return;
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data() as User;
        if (userData?.masterCardExpires && new Date(userData.masterCardExpires) > new Date() && amount < 0) return;
        await updateDoc(userRef, { credits: increment(Number(amount)) });
    };

    const toggleUserBlock = async (uid: string, isBlocked: boolean, type?: 'permanent' | 'temporary', days?: number, reason?: string) => {
        const updates: any = { isBlocked };
        if (isBlocked) {
            updates.banType = type || 'permanent';
            updates.banReason = reason || 'Violation of community guidelines.';
            if (type === 'temporary' && days) updates.banExpires = addDays(new Date(), days).toISOString();
        } else {
            updates.banType = null; updates.banExpires = null; updates.banReason = null;
        }
        await updateDoc(doc(db, 'users', uid), updates);
    };

    const toggleLeaderboardPrivacy = async (uid: string, isPrivate: boolean) => {
        await updateDoc(doc(db, 'users', uid), { isLeaderboardPrivate: isPrivate });
    };

    const applyFocusPenalty = async (uid: string, amt: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return 'penalized';
        const data = snap.data() as User;
        if ((data.inventory?.penaltyShields || 0) > 0) {
            await updateDoc(snap.ref, { 'inventory.penaltyShields': increment(-1) });
            return 'shielded';
        } else {
            await addCreditsToUser(uid, -Number(amt));
            return 'penalized';
        }
    };

    const grantMasterCard = async (uid: string, days: number) => {
        await updateDoc(doc(db, 'users', uid), { masterCardExpires: addDays(new Date(), days).toISOString() });
    };

    const revokeMasterCard = async (uid: string) => {
        await updateDoc(doc(db, 'users', uid), { masterCardExpires: null });
    };

    const setShowcaseBadge = async (uid: string, badge: BadgeType | null) => {
        await updateDoc(doc(db, 'users', uid), { showcasedBadge: badge });
    };

    const setEquippedFrame = async (uid: string, frameId: string) => {
        await updateDoc(doc(db, 'users', uid), { equippedFrame: frameId });
    };

    const makeUserAdmin = (uid: string) => updateDoc(doc(db, 'users', uid), { isAdmin: true });
    const removeUserAdmin = (uid: string) => updateDoc(doc(db, 'users', uid), { isAdmin: false });
    const makeUserVip = (uid: string) => updateDoc(doc(db, 'users', uid), { isVip: true });
    const removeUserVip = (uid: string) => updateDoc(doc(db, 'users', uid), { isVip: false });
    const makeUserGM = (uid: string) => updateDoc(doc(db, 'users', uid), { isGM: true });
    const removeUserGM = (uid: string) => updateDoc(doc(db, 'users', uid), { isGM: false });
    const makeUserCoDev = (uid: string) => updateDoc(doc(db, 'users', uid), { isCoDev: true });
    const removeUserCoDev = (uid: string) => updateDoc(doc(db, 'users', uid), { isCoDev: false });
    const makeUserChallenger = (uid: string) => updateDoc(doc(db, 'users', uid), { isChallenger: true });

    const generateAiAccessToken = async (userId: string) => {
        const userRef = doc(db, 'users', userId);
        const token = `MM-AI-${Math.random().toString(36).substring(2, 15).toUpperCase()}`;
        const batch = writeBatch(db);
        batch.update(userRef, { hasAiAccess: true });
        batch.set(doc(db, 'ai_access_tokens', token), { userId, createdAt: serverTimestamp() });
        await batch.commit();
        return token;
    };

    const unlockResourceSection = async (userId: string, sectionId: string, cost: number) => {
        const userRef = doc(db, 'users', userId);
        const userData = (await getDoc(userRef)).data() as User;
        const hasMaster = userData.masterCardExpires && new Date(userData.masterCardExpires) > new Date();
        const numCost = Number(cost);
        if (!hasMaster) {
            await updateDoc(userRef, { 
                credits: increment(-numCost),
                unlockedResourceSections: arrayUnion(sectionId)
            });
        } else {
            await updateDoc(userRef, { unlockedResourceSections: arrayUnion(sectionId) });
        }
    };

    const unlockFeatureForUser = async (userId: string, featureId: string, cost: number) => {
        const userRef = doc(db, 'users', userId);
        const userData = (await getDoc(userRef)).data() as User;
        const hasMaster = userData.masterCardExpires && new Date(userData.masterCardExpires) > new Date();
        const numCost = Number(cost);
        if (!hasMaster) {
            await updateDoc(userRef, { 
                credits: increment(-numCost),
                unlockedFeatures: arrayUnion(featureId)
            });
        } else {
            await updateDoc(userRef, { unlockedFeatures: arrayUnion(featureId) });
        }
    };

    const unlockThemeForUser = async (userId: string, themeId: string, cost: number) => {
        const userRef = doc(db, 'users', userId);
        const userData = (await getDoc(userRef)).data() as User;
        const hasMaster = userData.masterCardExpires && new Date(userData.masterCardExpires) > new Date();
        const numCost = Number(cost);
        if (!hasMaster) {
            await updateDoc(userRef, { 
                credits: increment(-numCost),
                unlockedThemes: arrayUnion(themeId)
            });
        } else {
            await updateDoc(userRef, { unlockedThemes: arrayUnion(themeId) });
        }
    };

    const addPerfectedQuiz = (uid: string, qid: string) => updateDoc(doc(db, 'users', uid), { perfectedQuizzes: arrayUnion(qid) });
    const incrementQuizAttempt = (uid: string, qid: string) => updateDoc(doc(db, 'users', uid), { [`quizAttempts.${qid}`]: increment(1) });
    const incrementFocusSessions = (uid: string, dur: number) => updateDoc(doc(db, 'users', uid), { focusSessionsCompleted: increment(1), totalStudyTime: increment(Number(dur)) });
    
    const updateStudyTime = (uid: string, dur: number) => updateDoc(doc(db, 'users', uid), { totalStudyTime: Number(dur) });

    const claimDailyTaskReward = (uid: string, amount: number) => updateDoc(doc(db, 'users', uid), { 
        credits: increment(Number(amount)), 
        dailyTasksCompleted: increment(1), 
        lastDailyTasksClaim: todayString() 
    });

    const claimEliteDailyReward = (uid: string) => updateDoc(doc(db, 'users', uid), { 
        credits: increment(20), 
        freeRewards: increment(5), 
        freeGuesses: increment(5), 
        lastEliteClaim: todayString() 
    });

    const updateGameHighScore = async (uid: string, game: string, score: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists() && score > (snap.data().gameHighScores?.[game as any] || 0)) {
            await updateDoc(snap.ref, { [`gameHighScores.${game}`]: Number(score) });
        }
    };

    const updateElementQuestScore = async (uid: string, blk: 's' | 'p' | 'd' | 'f', score: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        if (snap.exists() && score > (snap.data().elementQuestScores?.[blk] || 0)) {
            await updateDoc(snap.ref, { [`elementQuestScores.${blk}`]: Number(score) });
        }
    };

    const claimElementQuestMilestone = (uid: string, m: number) => updateDoc(doc(db, 'users', uid), { 
        credits: increment(m === 100 ? 50 : m === 200 ? 100 : m === 300 ? 150 : 200), 
        elementQuestMilestonesClaimed: arrayUnion(m) 
    });

    const claimUnitDimensionsMilestone = async (uid: string, milestoneKey: string, reward: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        if (!snap.exists()) return;
        const data = snap.data() as User;
        if (data.unitDimensionsMilestonesClaimed?.includes(milestoneKey)) throw new Error("Milestone already claimed.");
        
        await updateDoc(snap.ref, { 
            credits: increment(Number(reward)),
            unitDimensionsMilestonesClaimed: arrayUnion(milestoneKey)
        });
    };

    const claimDimensionShiftMilestone = async (uid: string, m: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        const wk = todayString();
        if (snap.data()?.dimensionShiftClaims?.[wk]?.includes(m)) return false;
        const rew = m === 50 ? 2 : m === 100 ? 5 : m === 150 ? 10 : m === 200 ? 15 : m === 250 ? 20 : 200;
        await updateDoc(snap.ref, { credits: increment(rew), [`dimensionShiftClaims.${wk}`]: arrayUnion(m) }); 
        return true;
    };

    const claimFlappyMindMilestone = async (uid: string, m: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        const wk = todayString();
        if (snap.data()?.flappyMindClaims?.[wk]?.includes(m)) return false;
        const rew = m === 20 ? 15 : m === 100 ? 100 : 3;
        await updateDoc(snap.ref, { credits: increment(rew), [`flappyMindClaims.${wk}`]: arrayUnion(m) }); 
        return true;
    };

    const claimAstroAscentMilestone = async (uid: string, m: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        const wk = todayString();
        if (snap.data()?.astroAscentClaims?.[wk]?.includes(m)) return false;
        const rew = m === 25 ? 5 : m === 50 ? 10 : m === 75 ? 25 : 50;
        await updateDoc(snap.ref, { credits: increment(rew), [`astroAscentClaims.${wk}`]: arrayUnion(m) }); 
        return true;
    };

    const claimMathematicsLegendMilestone = async (uid: string, m: number) => {
        const snap = await getDoc(doc(db, 'users', uid));
        const wk = todayString();
        if (snap.data()?.mathematicsLegendClaims?.[wk]?.includes(m)) return false;
        await updateDoc(snap.ref, { credits: increment(200), [`mathematicsLegendClaims.${wk}`]: arrayUnion(m) }); 
        return true;
    };

    const markTableAsMastered = async (uid: string, table: number, reward: number) => {
        await updateDoc(doc(db, 'users', uid), {
            masteredTables: arrayUnion(table),
            credits: increment(Number(reward))
        });
    };

    const claimAllTablesBounty = async (uid: string) => {
        await updateDoc(doc(db, 'users', uid), {
            hasClaimedAllTablesBounty: true,
            credits: increment(500)
        });
    };

    return {
        addCreditsToUser, toggleUserBlock, toggleLeaderboardPrivacy, applyFocusPenalty, grantMasterCard, revokeMasterCard,
        setShowcaseBadge, setEquippedFrame, makeUserAdmin, removeUserAdmin, makeUserVip, removeUserVip,
        makeUserGM, removeUserGM, makeUserCoDev, removeUserCoDev, makeUserChallenger, addPerfectedQuiz,
        incrementQuizAttempt, incrementQuizAttempt, incrementFocusSessions, updateStudyTime, claimDailyTaskReward, claimEliteDailyReward,
        updateGameHighScore, updateElementQuestScore, claimElementQuestMilestone, claimUnitDimensionsMilestone,
        claimDimensionShiftMilestone, claimFlappyMindMilestone, claimAstroAscentMilestone,
        claimMathematicsLegendMilestone, generateAiAccessToken, unlockResourceSection,
        unlockFeatureForUser, unlockThemeForUser, markTableAsMastered, claimAllTablesBounty
    };
};
