'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, query, orderBy, limit, Timestamp, collectionGroup, writeBatch, getDocs, setDoc, getDoc, increment, serverTimestamp, runTransaction, arrayUnion, updateDoc
} from 'firebase/firestore';
import { useToast } from './use-toast';
import { format, startOfWeek, isSameWeek, subWeeks, addYears } from 'date-fns';

// Modular Logic Imports
import { useUserActions } from './admin/use-user-actions';
import { useContentActions } from './admin/use-content-actions';
import { useStoreActions } from './admin/use-store-actions';
import { useSystemActions } from './admin/use-system-actions';
import { useCodeActions } from './admin/use-code-actions';

export const SUPER_ADMIN_UID = "user_32WgV1OikpqTXO9pFApoPRLLarF";
export type BadgeType = 'admin' | 'vip' | 'gm' | 'challenger' | 'champion' | 'dev' | 'co-dev' | 'early-bird' | 'night-owl' | 'knowledge-knight' | 'streaker' | 'isolater' | 'iso-warrior' | 'warrior' | 'iso-master' | 'sovereign' | 'premium';

export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'topup' | 'withdrawal' | 'penalty' | 'purchase' | 'refund' | 'code_redemption';
    status: 'completed' | 'pending' | 'failed';
    date: string;
}

export interface User {
  id: string;
  uid: string;
  mindMateId?: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isBlocked: boolean;
  isPlusMember?: boolean;
  plusJoinedAt?: string;
  equippedFrame?: string;
  unlockedFrames?: string[];
  banType?: 'permanent' | 'temporary';
  banExpires?: string;
  banReason?: string;
  isLeaderboardPrivate?: boolean;
  credits: number;
  walletBalance: number;
  walletTransactions?: WalletTransaction[];
  masterCardExpires?: string;
  votedPolls?: Record<string, string>;
  unlockedResourceSections?: string[];
  unlockedFeatures?: string[];
  unlockedThemes?: AppThemeId[];
  hasAiAccess?: boolean;
  hasFreeIsolation?: boolean;
  perfectedQuizzes?: string[];
  quizAttempts?: Record<string, number>;
  isAdmin?: boolean;
  isVip?: boolean;
  isGM?: boolean;
  isChallenger?: boolean;
  isChampion?: boolean;
  isCoDev?: boolean;
  isEarlyBird?: boolean;
  isNightOwl?: boolean;
  isKnowledgeKnight?: boolean;
  isStreaker?: boolean;
  isIsolater?: boolean;
  isIsoWarrior?: boolean;
  isWarrior?: boolean;
  isIsoMaster?: boolean;
  isSovereign?: boolean;
  showcasedBadge?: BadgeType;
  friends?: string[];
  focusSessionsCompleted?: number;
  dailyTasksCompleted?: number;
  totalStudyTime?: number;
  lastDailyTasksClaim?: string;
  lastEliteClaim?: string;
  freeRewards?: number;
  freeGuesses?: number;
  rewardHistory?: { reward: number | string, date: Timestamp, source: string }[];
  streak?: number;
  longestStreak?: number;
  lastStreakCheck?: string;
  onboardingCompleted?: boolean;
  onboardingData?: any;
  inventory?: {
    penaltyShields?: number;
    streakFreezes?: number;
    alphaGlowExpires?: string;
    clanXpBoosters?: number;
    clanLevelMaxers?: number;
  };
  gameHighScores?: {
    memoryGame?: number;
    emojiQuiz?: number;
    dimensionShift?: number;
    subjectSprint?: number;
    flappyMind?: number;
    astroAscent?: number;
    mathematicsLegend?: number;
    chronos?: number;
    formulaForge?: number;
    unitDimensionsEasy?: number;
    unitDimensionsHard?: number;
  };
  elementQuestScores?: { s?: number; p?: number; d?: number; f?: number; };
  elementQuestMilestonesClaimed?: number[];
  unitDimensionsMilestonesClaimed?: string[];
  dimensionShiftClaims?: Record<string, number[]>;
  flappyMindClaims?: Record<string, number[]>;
  astroAscentClaims?: Record<string, number[]>;
  mathematicsLegendClaims?: Record<string, number[]>;
  masteredTables?: number[];
  hasClaimedAllTablesBounty?: boolean;
  transactions?: { id: string; packName: string; credits: number; price?: number; date: string; type?: string }[];
}

export interface GameHistoryEntry {
    id: string;
    weekStartDate: string;
    topPerformers: {
        uid: string;
        displayName: string;
        photoURL?: string;
        score: number;
        scores: {
            astroAscent: number;
            flappyMind: number;
            dimensionShift: number;
            subjectSprint: number;
            emojiQuiz: number;
            mathematicsLegend: number;
            elementQuestTotal: number;
            memoryGame: number;
        };
    }[];
}

export interface RedeemCode {
    id: string;
    value: number;
    status: 'active' | 'redeemed' | 'inactive';
    createdAt: Date;
    redeemedBy?: string;
    redeemedAt?: Date;
}

export interface Announcement { id: string; title: string; description: string; createdAt: Date; }
export interface Resource { id: string; title: string; description: string; url: string; sectionId: string; createdAt: Date; }
export interface ResourceSection { id: string; name: string; description: string; unlockCost: number; parentCategory: string; createdAt: Date; }
export interface DailySurprise { id: string; type: string; text?: string; author?: string; imageUrl?: string; quizQuestion?: string; quizOptions?: string[]; quizCorrectAnswer?: string; featureTitle?: string; featureIcon?: string; featureRoute?: string; createdAt: Date; }
export interface Poll { id: string; question: string; options: string[]; results: Record<string, number>; isActive: boolean; createdAt: Date; commentsEnabled?: boolean; comments?: any[]; }
export interface GlobalGift { id: string; message: string; rewards: any; target: any; maxClaims?: number; createdAt: Date; isActive: boolean; claimedBy?: string[]; }
export interface SupportTicket { id: string; userId: string; userName: string; message: string; status: 'new' | 'resolved'; createdAt: Timestamp; }
export interface FeatureShowcase { id: string; title: string; description: string; launchDate?: string; template: any; status: 'upcoming' | 'live'; link?: string; createdAt: Date; }
export interface CreditPacks { id: string; name: string; credits: number; price: number; badge?: string; createdAt: Date; }
export interface StoreItem { id: string; name: string; description: string; cost: number; price?: number; paymentType: 'credits' | 'money'; type: string; quantity: number; createdAt: Date; stock: number; isFeatured: boolean; badge?: string; }
export interface VideoCategory { id: string; name: string; description: string; createdAt: Date; }
export interface VideoLecture { id: string; title: string; description: string; youtubeUrl: string; thumbnailUrl: string; categoryId: string; createdAt: Date; }

export type AppThemeId = 'light' | 'dark' | 'synthwave-sunset' | 'solar-flare' | 'emerald-dream';
export type MaintenanceTheme = 'shiny' | 'forest' | 'sunflower';
export interface AppSettings { 
    marcoAiLaunchStatus: 'countdown' | 'live'; 
    isMaintenanceMode?: boolean; 
    maintenanceMessage?: string; 
    maintenanceEndTime?: string; 
    maintenanceTheme?: MaintenanceTheme; 
    whatsNewMessage?: string; 
    lastMaintenanceId?: string; 
    lastGameReset?: string;
    plusMemberCount?: number;
    startingCredits?: number;
}

interface AppDataContextType {
    isAdmin: boolean; isCoDev: boolean; isSuperAdmin: boolean; loading: boolean;
    users: User[]; currentUserData: User | null; transactions: User['transactions'];
    announcements: Announcement[]; resources: Resource[]; resourcesSections: ResourceSection[];
    dailySurprises: DailySurprise[]; supportTickets: SupportTicket[]; allPolls: Poll[];
    appSettings: AppSettings | null; globalGifts: GlobalGift[]; activeGlobalGift: GlobalGift | null;
    featureShowcases: FeatureShowcase[]; creditPacks: any[]; storeItems: StoreItem[];
    videoCategories: VideoCategory[]; videoLectures: VideoLecture[];
    activePoll: Poll | null; redeemCodes: RedeemCode[];
    gameHistory: GameHistoryEntry[];
    subscribedUserIds: Set<string>;
    
    // Actions
    toggleUserBlock: any; toggleLeaderboardPrivacy: any; addCreditsToUser: any; applyFocusPenalty: any;
    grantMasterCard: any; revokeMasterCard: any; setShowcaseBadge: any; setEquippedFrame: any; makeUserAdmin: any; removeUserAdmin: any;
    makeUserVip: any; removeUserVip: any; makeUserGM: any; removeUserGM: any; makeUserCoDev: any; removeUserCoDev: any;
    addPerfectedQuiz: any; incrementQuizAttempt: any; incrementQuizAttempt: any; incrementFocusSessions: any; claimDailyTaskReward: any;
    claimEliteDailyReward: any; updateGameHighScore: any; updateElementQuestScore: any; claimElementQuestMilestone: any;
    claimDimensionShiftMilestone: any; claimFlappyMindMilestone: any; claimAstroAscentMilestone: any;
    claimMathematicsLegendMilestone: any; addAnnouncement: any; updateAnnouncement: any; deleteAnnouncement: any;
    addResourceSection: any; updateResourceSection: any; deleteResourceSection: any; addResource: any;
    updateResource: any; deleteResource: any; addDailySurprise: any; deleteDailySurprise: any;
    addPoll: any; deletePoll: any; setActivePoll: any; submitPollVote: any; submitPollComment: any;
    addVideoCategory: any; deleteVideoCategory: any; addVideoLecture: any; deleteVideoLecture: any;
    createCreditPack: any; updateCreditPack: any; deleteCreditPack: any; createStoreItem: any;
    updateStoreItem: any; deleteStoreItem: any; redeemStoreItem: any; processStoreItemPayment: any;
    updateAppSettings: any; sendGlobalGift: any; claimGlobalGift: any; deactivateGift: any;
    deleteGlobalGift: any; addFeatureShowcase: any; updateFeatureShowcase: any; deleteFeatureShowcase: any;
    submitSupportTicket: any; clearGlobalChat: any; clearQuizLeaderboard: any; resetWeeklyStudyTime: any;
    resetGameZoneLeaderboard: any; topUpWallet: any;
    generateAiAccessToken: any; unlockResourceSection: any; unlockFeatureForUser: any; unlockThemeForUser: any;
    generateRedeemCode: (v: number) => Promise<string>; deactivateRedeemCode: (id: string) => Promise<void>; deleteRedeemCode: (id: string) => Promise<void>; redeemCode: (u: string, c: string) => Promise<number>;
    performGameReset: () => Promise<void>;
    resetAllChallenges: () => Promise<void>;
    resetAllIsolationSessions: () => Promise<void>;
    resetAllUserCredits: (v: number) => Promise<void>;
    injectArtifactToAll: (type: any) => Promise<void>;
    broadcastGlobalMessage: (msg: string) => Promise<void>;
    topUpAllWallets: (amt: number) => Promise<void>;
    claimPlusMembership: (paymentId: string) => Promise<void>;
    completeOnboarding: (data: any) => Promise<void>;
    markTableAsMastered: (uid: string, table: number, reward: number) => Promise<void>;
    claimAllTablesBounty: (uid: string) => Promise<void>;
    claimGMBounty: (uid: string) => Promise<void>;
    claimUnitDimensionsMilestone: (userId: string, milestoneKey: string, reward: number) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

const safeToDate = (val: any) => {
    // Protocol Fix: Return a stable epoch date if timestamp is pending or null
    // This prevents re-render loops in Inbox components that compare timestamps.
    if (!val) return new Date(0); 
    if (typeof val.toDate === 'function') return val.toDate();
    return new Date(val);
};

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser, isLoaded: isClerkLoaded } = useUser();
    const { toast } = useToast();
    
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [resourceSections, setResourceSections] = useState<ResourceSection[]>([]);
    const [dailySurprises, setDailySurprises] = useState<DailySurprise[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [allPolls, setAllPolls] = useState<Poll[]>([]);
    const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
    const [globalGifts, setGlobalGifts] = useState<GlobalGift[]>([]);
    const [featureShowcases, setFeatureShowcases] = useState<FeatureShowcase[]>([]);
    const [creditPacks, setCreditPacks] = useState<any[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
    const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
    const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
    const [gameHistory, setGameHistory] = useState<GameHistoryEntry[]>([]);
    const [subscribedUserIds, setSubscribedUserIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const isAdmin = currentUserData?.isAdmin ?? false;
    const isSuperAdmin = authUser?.id === SUPER_ADMIN_UID;
    const isCoDev = currentUserData?.isCoDev ?? false;

    // Actions initialization - Stable via useMemo
    const userActions = useMemo(() => useUserActions(db, toast), [toast]);
    const contentActions = useMemo(() => useContentActions(db, toast), [toast]);
    const storeActions = useMemo(() => useStoreActions(db, toast), [toast]);
    const systemActions = useMemo(() => useSystemActions(db, toast), [toast]);
    const codeActions = useMemo(() => useCodeActions(db, toast), [toast]);

    useEffect(() => {
        const process = (snap: any) => snap.docs.map((d: any) => ({ 
            id: d.id, 
            ...d.data(), 
            createdAt: safeToDate(d.data().createdAt) 
        }));
        
        const unsubs = [
            onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as User))), (e) => console.error("Users Sync Error:", e)),
            onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (s) => setAnnouncements(process(s)), (e) => console.error("Announcements Error:", e)),
            onSnapshot(collection(db, 'resources'), (s) => setResources(process(s)), (e) => console.error("Resources Error:", e)),
            onSnapshot(collection(db, 'resourceSections'), (s) => setResourceSections(process(s)), (e) => console.error("Sections Error:", e)),
            onSnapshot(query(collection(db, 'dailySurprises'), orderBy('createdAt', 'asc')), (s) => setDailySurprises(process(s)), (e) => console.error("Surprises Error:", e)),
            onSnapshot(collection(db, 'supportTickets'), (s) => setSupportTickets(s.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket))), (e) => console.error("Tickets Error:", e)),
            onSnapshot(collection(db, 'polls'), (s) => setAllPolls(process(s)), (e) => console.error("Polls Error:", e)),
            onSnapshot(doc(db, 'appConfig', 'settings'), (d) => setAppSettings(d.exists() ? d.data() as AppSettings : null), (e) => console.error("Settings Error:", e)),
            onSnapshot(query(collection(db, 'globalGifts'), orderBy('createdAt', 'desc')), (s) => setGlobalGifts(process(s)), (e) => console.error("Gifts Error:", e)),
            onSnapshot(collection(db, 'featureShowcases'), (s) => setFeatureShowcases(process(s)), (e) => console.error("Showcases Error:", e)),
            onSnapshot(collection(db, 'creditPacks'), (s) => setCreditPacks(process(s)), (e) => console.error("Packs Error:", e)),
            onSnapshot(collection(db, 'storeItems'), (s) => setStoreItems(process(s)), (e) => console.error("Items Error:", e)),
            onSnapshot(collection(db, 'videoCategories'), (s) => setVideoCategories(process(s)), (e) => console.error("VideoCat Error:", e)),
            onSnapshot(collection(db, 'videoLectures'), (s) => setVideoLectures(process(s)), (e) => console.error("Videos Error:", e)),
            onSnapshot(query(collection(db, 'redeemCodes'), orderBy('createdAt', 'desc')), (s) => setRedeemCodes(process(s)), (e) => console.error("Codes Error:", e)),
            onSnapshot(query(collection(db, 'gameZoneHistory'), orderBy('weekStartDate', 'desc'), limit(5)), (s) => setGameHistory(s.docs.map(d => ({ id: d.id, ...d.data() } as GameHistoryEntry))), (e) => console.error("History Error:", e)),
            onSnapshot(collection(db, 'fcmTokens'), (s) => setSubscribedUserIds(new Set(s.docs.map(d => d.id))), (e) => console.warn("Tokens List Restricted")),
        ];
        return () => unsubs.forEach(u => u());
    }, []);

    useEffect(() => {
        if (!isClerkLoaded) return;
        if (!authUser) { setCurrentUserData(null); setLoading(false); return; }
        
        return onSnapshot(doc(db, 'users', authUser.id), async (snap) => {
            if (snap.exists()) {
                setCurrentUserData({ id: snap.id, ...snap.data() } as User);
            } else {
                const initialCredits = appSettings?.startingCredits || 500;
                const newUser: Partial<User> = {
                    uid: authUser.id,
                    displayName: authUser.fullName || 'Legend',
                    email: authUser.primaryEmailAddress?.emailAddress || '',
                    photoURL: authUser.imageUrl,
                    credits: initialCredits,
                    walletBalance: 0,
                    isBlocked: false,
                    streak: 0,
                    focusSessionsCompleted: 0,
                    dailyTasksCompleted: 0,
                    totalStudyTime: 0,
                    onboardingCompleted: false,
                    inventory: {
                        penaltyShields: 0,
                        streakFreezes: 0,
                        clanXpBoosters: 0,
                        clanLevelMaxers: 0
                    }
                };
                await setDoc(doc(db, 'users', authUser.id), newUser);
                setCurrentUserData({ id: authUser.id, ...newUser } as User);
            }
            setLoading(false);
        }, (error) => {
            console.error("Critical: User Identity Sync Failure", error);
            setLoading(false);
        });
    }, [authUser, isClerkLoaded, appSettings?.startingCredits]);

    const completeOnboarding = useCallback(async (data: any) => {
        if (!authUser) return;
        await updateDoc(doc(db, 'users', authUser.id), {
            onboardingCompleted: true,
            onboardingData: data
        });
    }, [authUser]);

    const performGameReset = useCallback(async () => {
        if (!isSuperAdmin) return;
        try {
            const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
            const sortedUsers = [...users].map(u => ({ ...u, score: (u.gameHighScores?.emojiQuiz || 0) * 1.2 + (u.gameHighScores?.memoryGame || 0) + (u.gameHighScores?.dimensionShift || 0) * 1.5 + (u.gameHighScores?.subjectSprint || 0) * 1.1 + (u.gameHighScores?.flappyMind || 0) + (u.gameHighScores?.astroAscent || 0) * 1.3 + (u.gameHighScores?.mathematicsLegend || 0) * 1.4 + (u.gameHighScores?.chronos || 0) * 1.6 + (u.gameHighScores?.formulaForge || 0) * 1.8 + (u.gameHighScores?.unitDimensionsEasy || 0) + (u.gameHighScores?.unitDimensionsHard || 0) * 2 + (((u.elementQuestScores?.s || 0) + (u.elementQuestScores?.p || 0) + (u.elementQuestScores?.d || 0) + (u.elementQuestScores?.f || 0)) * 0.5) }))
                .sort((a, b) => b.score - a.score);
            const topFive = sortedUsers.slice(0, 5).map(u => ({ 
                uid: u.uid, 
                displayName: u.displayName, 
                photoURL: u.photoURL, 
                score: Math.round(u.score), 
                scores: { 
                    astroAscent: u.gameHighScores?.astroAscent || 0,
                    flappyMind: u.gameHighScores?.flappyMind || 0,
                    dimensionShift: u.gameHighScores?.dimensionShift || 0,
                    subjectSprint: u.gameHighScores?.subjectSprint || 0,
                    emojiQuiz: u.gameHighScores?.emojiQuiz || 0,
                    mathematicsLegend: u.gameHighScores?.mathematicsLegend || 0,
                    elementQuestTotal: (u.elementQuestScores?.s || 0) + (u.elementQuestScores?.p || 0) + (u.elementQuestScores?.d || 0) + (u.elementQuestScores?.f || 0),
                    memoryGame: u.gameHighScores?.memoryGame || 0
                } 
            }));
            const batch = writeBatch(db);
            batch.set(doc(collection(db, 'gameZoneHistory')), { weekStartDate: currentWeekStart, topPerformers: topFive, createdAt: serverTimestamp() });
            users.forEach(u => batch.update(doc(db, 'users', u.uid), { gameHighScores: { memoryGame: 0, emojiQuiz: 0, dimensionShift: 0, subjectSprint: 0, flappyMind: 0, astroAscent: 0, mathematicsLegend: 0, chronos: 0, formulaForge: 0, unitDimensionsEasy: 0, unitDimensionsHard: 0 }, elementQuestScores: { s: 0, p: 0, d: 0, f: 0 }, dimensionShiftClaims: {}, flappyMindClaims: {}, astroAscentClaims: {}, mathematicsLegendClaims: {} }));
            batch.update(doc(db, 'appConfig', 'settings'), { lastGameReset: currentWeekStart });
            await batch.commit();
            toast({ title: "Leaderboard Reset Complete" });
        } catch (e: any) { toast({ variant: 'destructive', title: "Reset Failed", description: e.message }); }
    }, [isSuperAdmin, users, toast]);

    const resetAllChallenges = useCallback(async () => {
        if (!isSuperAdmin) return;
        try {
            const batch = writeBatch(db);
            const allChallengesSnap = await getDocs(collectionGroup(db, 'challenges'));
            allChallengesSnap.forEach(d => { if (d.id === 'active') batch.delete(d.ref); });
            await batch.commit();
            toast({ title: "Global Reset Executed" });
        } catch (e: any) { toast({ variant: 'destructive', title: "Purge Failed", description: e.message }); }
    }, [isSuperAdmin, toast]);

    const claimPlusMembership = useCallback(async (paymentId: string) => {
        if (!authUser || !currentUserData) return;
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', authUser.id);
            const settingsRef = doc(db, 'appConfig', 'settings');
            const alphaExpiry = addYears(new Date(), 99).toISOString();
            transaction.update(userRef, {
                isPlusMember: true,
                plusJoinedAt: new Date().toISOString(),
                credits: increment(5000),
                showcasedBadge: 'premium',
                equippedFrame: 'premium',
                unlockedFrames: arrayUnion('default', 'premium'),
                'inventory.penaltyShields': increment(5),
                'inventory.streakFreezes': increment(5),
                'inventory.alphaGlowExpires': alphaExpiry,
                transactions: arrayUnion({ id: paymentId, packName: 'MindMate Plus', credits: 5000, date: new Date().toISOString(), type: 'membership_activation' })
            });
            transaction.update(settingsRef, { plusMemberCount: increment(1) });
        });
        toast({ title: "Welcome to MindMate Plus!" });
    }, [authUser, currentUserData, toast]);

    const claimGMBounty = useCallback(async (userId: string) => {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
            isGM: true,
            showcasedBadge: 'gm',
            credits: increment(500),
            rewardHistory: arrayUnion({ reward: 500, date: new Date(), source: 'Game Master Ascension' })
        });
        toast({ title: "GRANDMASTER ASCENDED", description: "+500 Credits injected into your treasury.", className: "bg-amber-500 text-black font-black" });
    }, [toast]);

    const contextValue = useMemo(() => ({
        isAdmin, isCoDev, isSuperAdmin, loading, users, currentUserData, transactions: currentUserData?.transactions || [],
        announcements, resources, resourcesSections: resourceSections, dailySurprises, supportTickets, allPolls, appSettings, globalGifts, 
        activeGlobalGift: globalGifts.find(g => g.isActive) || null, featureShowcases, creditPacks, storeItems,
        videoCategories, videoLectures, redeemCodes, activePoll: allPolls.find(p => p.isActive) || null,
        gameHistory, subscribedUserIds,
        ...userActions, ...contentActions, ...storeActions, ...systemActions, ...codeActions,
        submitPollVote: (pid: string, opt: string) => contentActions.submitPollVote(pid, opt, authUser!.id),
        submitPollComment: (pid: string, c: string) => contentActions.submitPollComment(pid, c, authUser!.id, currentUserData!.displayName),
        submitSupportTicket: (m: string) => systemActions.submitSupportTicket(m, authUser!.id, currentUserData!.displayName),
        topUpWallet: (a: number, tx: string) => systemActions.topUpWallet(authUser!.id, a, tx),
        claimGlobalGift: (gid: string) => systemActions.claimGlobalGift(gid, authUser!.id),
        redeemCode: (c: string) => codeActions.redeemCode(authUser!.id, c),
        resetAllUserCredits: (v: number) => systemActions.resetAllUserCredits(v),
        performGameReset, resetAllChallenges, claimPlusMembership, completeOnboarding,
        markTableAsMastered: (uid: string, t: number, r: number) => userActions.markTableAsMastered(uid, t, r),
        claimAllTablesBounty: (uid: string) => userActions.claimAllTablesBounty(uid),
        claimGMBounty,
        claimUnitDimensionsMilestone: (userId: string, milestoneKey: string, reward: number) => userActions.claimUnitDimensionsMilestone(userId, milestoneKey, reward)
    }), [
        isAdmin, isCoDev, isSuperAdmin, loading, users, currentUserData, announcements, resources, 
        resourceSections, dailySurprises, supportTickets, allPolls, appSettings, globalGifts, 
        featureShowcases, creditPacks, storeItems, videoCategories, videoLectures, redeemCodes, 
        gameHistory, subscribedUserIds, userActions, contentActions, storeActions, systemActions, 
        codeActions, authUser, performGameReset, resetAllChallenges, claimPlusMembership, 
        completeOnboarding, claimGMBounty
    ]);

    return <AppDataContext.Provider value={contextValue as any}>{children}</AppDataContext.Provider>;
};

export const useAdmin = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAdmin failed.');
    return context;
};
export const useUsers = () => useAdmin();
export const useAnnouncements = () => { const { announcements, loading } = useAdmin(); return { announcements, loading }; };
export const useResources = () => { const { resources, resourceSections, loading } = useAdmin(); return { allResources: resources, allSections: resourceSections, loading }; };
export const usePolls = () => useAdmin();
export const useDailySurprises = () => { const { dailySurprises, loading } = useAdmin(); return { dailySurprises, loading }; };
