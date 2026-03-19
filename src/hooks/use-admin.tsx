
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db, storage } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, getDoc, query, setDoc, where, getDocs, increment, writeBatch, orderBy, addDoc, serverTimestamp, deleteDoc, arrayUnion, arrayRemove, limit, Timestamp, runTransaction } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { isToday, isYesterday, format, startOfWeek, endOfWeek, parseISO, addDays as dateFnsAddDays } from 'date-fns';
import { lockableFeatures, type LockableFeature } from '@/lib/features';

export const SUPER_ADMIN_UID = "user_32WgV1OikpqTXO9pFApoPRLLarF";
export type BadgeType = 'admin' | 'vip' | 'gm' | 'challenger' | 'dev' | 'co-dev' | 'early-bird' | 'night-owl' | 'knowledge-knight';

export interface User {
  id: string;
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isBlocked: boolean;
  isLeaderboardPrivate?: boolean;
  credits: number;
  masterCardExpires?: string;
  votedPolls?: Record<string, string>;
  unlockedResourceSections?: string[];
  unlockedFeatures?: string[];
  unlockedThemes?: AppThemeId[];
  hasAiAccess?: boolean;
  perfectedQuizzes?: string[];
  quizAttempts?: Record<string, number>;
  isAdmin?: boolean;
  isVip?: boolean;
  isGM?: boolean;
  isChallenger?: boolean;
  isCoDev?: boolean;
  isEarlyBird?: boolean;
  isNightOwl?: boolean;
  isKnowledgeKnight?: boolean;
  showcasedBadge?: BadgeType;
  friends?: string[];
  focusSessionsCompleted?: number;
  dailyTasksCompleted?: number;
  lastDailyTasksClaim?: string;
  lastEliteClaim?: string;
  totalStudyTime?: number;
  lastRewardDate?: string;
  lastGiftBoxDate?: string;
  lastRpsDate?: string;
  freeRewards?: number;
  freeGuesses?: number;
  rewardHistory?: { reward: number | string, date: Timestamp, source: string }[];
  streak?: number;
  longestStreak?: number;
  lastStreakCheck?: string;
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
  };
  elementQuestScores?: {
    s?: number;
    p?: number;
    d?: number;
    f?: number;
  };
  elementQuestMilestonesClaimed?: number[];
  dimensionShiftClaims?: Record<string, number[]>;
  flappyMindClaims?: Record<string, number[]>;
  astroAscentClaims?: Record<string, number[]>;
  mathematicsLegendClaims?: Record<string, number[]>;
  transactions?: { id: string; packName: string; credits: number; price?: number; date: string; type?: string }[];
}

export interface Announcement {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
}

export interface ResourceSection {
    id: string;
    name: string;
    description: string;
    unlockCost: number;
    parentCategory: 'class-10' | 'class-12' | 'jee' | 'neet' | 'class-6-9' | 'general';
    createdAt: Date;
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    sectionId: string;
    createdAt: Date;
}

export interface Poll {
    id: string;
    question: string;
    options: string[];
    results: Record<string, number>;
    isActive: boolean;
    createdAt: Date;
    commentsEnabled?: boolean;
    comments?: { userId: string; userName: string; comment: string; createdAt: Timestamp }[];
}

export interface DailySurprise {
    id: string;
    type: 'quote' | 'fact' | 'meme' | 'quiz' | 'new-feature';
    text?: string;
    author?: string;
    imageUrl?: string;
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectAnswer?: string;
    createdAt: Date;
    featureTitle?: string;
    featureDescription?: string;
    featureIcon?: string;
    featureRoute?: string;
}

export type AppThemeId = 'light' | 'dark' | 'synthwave-sunset' | 'solar-flare' | 'emerald-dream';
export type MaintenanceTheme = 'shiny' | 'forest' | 'sunflower';

export interface AppSettings {
    marcoAiLaunchStatus: 'countdown' | 'live';
    upiQrCode?: string;
    isMaintenanceMode?: boolean;
    maintenanceMessage?: string;
    maintenanceStartTime?: string;
    maintenanceEndTime?: string;
    maintenanceTheme?: MaintenanceTheme;
    whatsNewMessage?: string;
    lastMaintenanceId?: string;
}

export interface GlobalGift {
    id: string;
    message: string;
    rewards: {
        credits: number;
        scratch: number;
        flip: number;
    };
    target: 'all' | string;
    createdAt: Date;
    isActive: boolean;
    claimedBy?: string[];
}

export interface SupportTicket {
    id: string;
    userId: string;
    userName: string;
    message: string;
    status: 'new' | 'resolved';
    createdAt: Timestamp;
}

export interface FeatureLock {
    id: LockableFeature['id'];
    isLocked: boolean;
    cost: number;
}

export type ShowcaseTemplate = 
  | 'cosmic-blue' | 'fiery-red' | 'golden-legend' | 'professional-dark' 
  | 'emerald-dream' | 'amethyst-haze' | 'solar-flare' | 'midnight-abyss'
  | 'rainbow-aurora' | 'diamond-pearl' | 'cyber-grid' | 'oceanic-flow'
  | 'synthwave-sunset' | 'jungle-ruins' | 'black-hole' | 'anime-speed-lines'
  | 'blueprint-grid' | 'lava-flow' | 'mystic-forest' | 'digital-glitch'
  | 'steampunk-gears' | 'lofi-rain';

export interface FeatureShowcase {
    id: string;
    title: string;
    description: string;
    launchDate?: string;
    template: ShowcaseTemplate;
    status: 'upcoming' | 'live';
    link?: string;
    createdAt: Date;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  badge?: 'popular' | 'new' | 'recommended' | 'exclusive' | 'limited' | 'hot' | 'best-seller' | 'jackpot';
  createdAt: Date;
}

export interface StoreItem {
    id: string;
    name: string;
    description: string;
    cost: number; // For credits
    price?: number; // For real money
    paymentType: 'credits' | 'money';
    type: 'scratch-card' | 'card-flip' | 'penalty-shield' | 'streak-freeze' | 'alpha-glow' | 'early-bird' | 'night-owl' | 'knowledge-knight' | 'clan-xp-booster' | 'clan-level-max';
    quantity: number;
    createdAt: Date;
    stock: number;
    isFeatured: boolean;
    badge?: 'popular' | 'new' | 'recommended' | 'exclusive' | 'limited' | 'hot' | 'best-seller' | 'jackpot';
}

export interface VideoCategory {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export interface VideoLecture {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  thumbnailUrl: string;
  categoryId: string;
  createdAt: Date;
}

interface AppDataContextType {
    isAdmin: boolean;
    isCoDev: boolean;
    isSuperAdmin: boolean;
    users: User[];
    currentUserData: User | null;
    transactions: User['transactions'];
    toggleUserBlock: (uid: string, isBlocked: boolean) => Promise<void>;
    toggleLeaderboardPrivacy: (uid: string, isPrivate: boolean) => Promise<void>;
    addCreditsToUser: (uid: string, amount: number) => Promise<void>;
    applyFocusPenalty: (uid: string, amount: number) => Promise<'shielded' | 'penalized'>;
    giftCreditsToAllUsers: (amount: number) => Promise<void>;
    resetUserCredits: (uid: string) => Promise<void>;
    addFreeSpinsToUser: (uid: string, amount: number) => Promise<void>;
    addSpinsToAllUsers: (amount: number) => Promise<void>;
    addFreeGuessesToUser: (uid: string, amount: number) => Promise<void>;
    addGuessesToAllUsers: (amount: number) => Promise<void>;
    unlockResourceSection: (uid: string, sectionId: string, cost: number) => Promise<void>;
    unlockFeatureForUser: (uid: string, featureId: LockableFeature['id'], cost: number) => Promise<void>;
    unlockThemeForUser: (uid: string, themeId: AppThemeId, cost: number) => Promise<void>;
    generateAiAccessToken: (uid: string) => Promise<string | null>;
    generateDevAiAccessToken: (uid: string) => Promise<string | null>;
    grantMasterCard: (uid: string, durationDays: number) => Promise<void>;
    revokeMasterCard: (uid: string) => Promise<void>;
    addPerfectedQuiz: (uid: string, quizId: string) => Promise<void>;
    incrementQuizAttempt: (uid: string, quizId: string) => Promise<void>;
    incrementFocusSessions: (uid: string, duration: number) => Promise<void>;
    claimDailyTaskReward: (uid: string, amount: number) => Promise<void>;
    claimEliteDailyReward: (uid: string) => Promise<void>;
    updateStudyTime: (uid: string, totalSeconds: number) => Promise<void>;
    updateGameHighScore: (uid: string, game: string, score: number) => Promise<void>;
    updateElementQuestScore: (uid: string, block: 's' | 'p' | 'd' | 'f', score: number) => Promise<void>;
    claimElementQuestMilestone: (uid: string, milestone: 100 | 200 | 300 | 400) => Promise<void>;
    claimDimensionShiftMilestone: (uid: string, milestone: number) => Promise<boolean>;
    claimFlappyMindMilestone: (uid: string, milestone: number) => Promise<boolean>;
    claimAstroAscentMilestone: (uid: string, milestone: number) => Promise<boolean>;
    claimMathematicsLegendMilestone: (uid: string, milestone: number) => Promise<boolean>;
    makeUserAdmin: (uid: string) => Promise<void>;
    removeUserAdmin: (uid: string) => Promise<void>;
    makeUserVip: (uid: string) => Promise<void>;
    removeUserVip: (uid: string) => Promise<void>;
    makeUserGM: (uid: string) => Promise<void>;
    removeUserGM: (uid: string) => Promise<void>;
    makeUserChallenger: (uid: string) => Promise<void>;
    removeUserChallenger: (uid: string) => Promise<void>;
    makeUserCoDev: (uid: string) => Promise<void>;
    removeUserCoDev: (uid: string) => Promise<void>;
    setShowcaseBadge: (uid: string, badge: BadgeType | null) => Promise<void>;
    clearGlobalChat: () => Promise<void>;
    clearQuizLeaderboard: () => Promise<void>;
    resetWeeklyStudyTime: () => Promise<void>;
    resetGameZoneLeaderboard: () => Promise<void>;
    submitSupportTicket: (message: string) => Promise<void>;
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
    updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;
    resources: Resource[];
    addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<void>;
    updateResource: (id: string, data: Partial<Omit<Resource, 'id' | 'createdAt'>>) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;
    resourceSections: ResourceSection[];
    addResourceSection: (section: Omit<ResourceSection, 'id'|'createdAt'>) => Promise<void>;
    updateResourceSection: (id: string, data: Partial<Omit<ResourceSection, 'id'|'createdAt'>>) => Promise<void>;
    deleteResourceSection: (id: string) => Promise<void>;
    dailySurprises: DailySurprise[];
    addDailySurprise: (surprise: Omit<DailySurprise, 'id' | 'createdAt'>) => Promise<void>;
    deleteDailySurprise: (id: string) => Promise<void>;
    supportTickets: SupportTicket[];
    updateTicketStatus: (id: string, status: 'new' | 'resolved') => Promise<void>;
    deleteTicket: (id: string) => Promise<void>;
    loading: boolean;
    activePoll: Poll | null;
    allPolls: Poll[];
    addPoll: (pollData: Omit<Poll, 'id' | 'createdAt' | 'isActive' | 'results'>) => Promise<void>;
    updatePoll: (id: string, data: Partial<Poll>) => Promise<void>;
    deletePoll: (id: string) => Promise<void>;
    setActivePoll: (id: string) => Promise<void>;
    submitPollVote: (pollId: string, option: string) => Promise<void>;
    submitPollComment: (pollId: string, comment: string) => Promise<void>;
    appSettings: AppSettings | null;
    updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
    globalGifts: GlobalGift[];
    activeGlobalGift: GlobalGift | null;
    sendGlobalGift: (gift: Omit<GlobalGift, 'id' | 'createdAt' | 'isActive' | 'claimedBy'>) => Promise<void>;
    deactivateGift: (giftId: string) => Promise<void>;
    deleteGlobalGift: (giftId: string) => Promise<void>;
    claimGlobalGift: (giftId: string, userId: string) => Promise<void>;
    featureLocks: Record<LockableFeature['id'], FeatureLock> | null;
    lockFeature: (featureId: LockableFeature['id'], cost: number) => Promise<void>;
    unlockFeature: (featureId: LockableFeature['id']) => Promise<void>;
    featureShowcases: FeatureShowcase[];
    addFeatureShowcase: (showcase: Omit<FeatureShowcase, 'id' | 'createdAt'>) => Promise<void>;
    updateFeatureShowcase: (id: string, data: Partial<Omit<FeatureShowcase, 'id' | 'createdAt'>>) => Promise<void>;
    deleteFeatureShowcase: (id: string) => Promise<void>;
    creditPacks: CreditPack[];
    createCreditPack: (pack: Omit<CreditPack, 'id' | 'createdAt'>) => Promise<void>;
    updateCreditPack: (id: string, data: Partial<Omit<CreditPack, 'id' | 'createdAt'>>) => Promise<void>;
    deleteCreditPack: (id: string) => Promise<void>;
    storeItems: StoreItem[];
    createStoreItem: (item: Omit<StoreItem, 'id' | 'createdAt'>) => Promise<void>;
    updateStoreItem: (id: string, data: Partial<Omit<StoreItem, 'id' | 'createdAt'>>) => Promise<void>;
    deleteStoreItem: (id: string) => Promise<void>;
    redeemStoreItem: (item: StoreItem) => Promise<void>;
    processStoreItemPayment: (item: StoreItem, transactionId: string) => Promise<void>;
    videoCategories: VideoCategory[];
    addVideoCategory: (category: Omit<VideoCategory, 'id' | 'createdAt'>) => Promise<void>;
    deleteVideoCategory: (categoryId: string) => Promise<void>;
    videoLectures: VideoLecture[];
    addVideoLecture: (lecture: Omit<VideoLecture, 'id' | 'createdAt'>) => Promise<void>;
    deleteVideoLecture: (lectureId: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser, isLoaded: isClerkLoaded } = useUser();
    const [isAdmin, setIsAdmin] = useState(false);
    const [isCoDev, setIsCoDev] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
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
    const [featureLocks, setFeatureLocks] = useState<Record<LockableFeature['id'], FeatureLock> | null>(null);
    const [featureShowcases, setFeatureShowcases] = useState<FeatureShowcase[]>([]);
    const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
    const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
    const [loading, setLoading] = useState(true);

    const activeGlobalGift = useMemo(() => globalGifts.find(g => g.isActive) || null, [globalGifts]);
    const activePoll = useMemo(() => allPolls.find(p => p.isActive) || null, [allPolls]);

    const transactions = useMemo(() => {
        if (!currentUserData?.transactions) return [];
        return [...currentUserData.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentUserData]);

    useEffect(() => {
        if (isClerkLoaded && authUser && currentUserData) {
            setIsAdmin(currentUserData.isAdmin ?? false);
            setIsSuperAdmin(currentUserData.uid === SUPER_ADMIN_UID);
            setIsCoDev(currentUserData.isCoDev ?? false);
        } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
            setIsCoDev(false);
        }
    }, [isClerkLoaded, authUser, currentUserData]);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!isClerkLoaded) return;
        if (!authUser) { setCurrentUserData(null); setLoading(false); return; }

        const userDocRef = doc(db, 'users', authUser.id);
        const unsubscribe = onSnapshot(userDocRef, async (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                const updates: Partial<User> = {};
                let hasUpdates = false;

                if (data.lastStreakCheck !== todayStr) {
                    const lastCheckDate = data.lastStreakCheck ? new Date(data.lastStreakCheck) : null;
                    const currentStreak = data.streak || 0;
                    if (lastCheckDate && isYesterday(lastCheckDate)) {
                        const newStreak = currentStreak + 1;
                        updates.streak = newStreak;
                        if (newStreak > (data.longestStreak || 0)) updates.longestStreak = newStreak;
                        if (newStreak % 30 === 0) updates.credits = increment(100);
                        else if (newStreak % 5 === 0) updates.credits = increment(50);
                    } else if (lastCheckDate && !isToday(lastCheckDate)) { 
                        if ((data.inventory?.streakFreezes || 0) > 0) {
                            updates['inventory.streakFreezes'] = increment(-1);
                        } else {
                            updates.streak = 1; 
                        }
                    }
                    updates.lastStreakCheck = todayStr;
                    hasUpdates = true;
                }

                if (hasUpdates) await updateDoc(userDocRef, updates);
                setCurrentUserData({ id: snap.id, ...data, ...updates } as User);
            } else {
                const newUser: User = {
                    id: authUser.id, uid: authUser.id, displayName: authUser.fullName || authUser.username || 'New User',
                    email: authUser.primaryEmailAddress?.emailAddress || '', photoURL: authUser.imageUrl, isBlocked: false,
                    isLeaderboardPrivate: false,
                    credits: 200, isAdmin: false, isVip: false, isGM: false, isChallenger: false, isCoDev: false,
                    friends: [], unlockedResourceSections: [], unlockedFeatures: [], unlockedThemes: [], hasAiAccess: false,
                    focusSessionsCompleted: 0, dailyTasksCompleted: 0, totalStudyTime: 0, freeRewards: 0, freeGuesses: 0,
                    streak: 1, longestStreak: 1, lastStreakCheck: format(new Date(), 'yyyy-MM-dd'),
                    inventory: { penaltyShields: 0, streakFreezes: 0, clanXpBoosters: 0, clanLevelMaxers: 0 },
                    gameHighScores: { memoryGame: 0, emojiQuiz: 0, dimensionShift: 0, subjectSprint: 0, flappyMind: 0, astroAscent: 0, mathematicsLegend: 0 },
                    elementQuestScores: { s: 0, p: 0, d: 0, f: 0 }, elementQuestMilestonesClaimed: [],
                };
                await setDoc(userDocRef, newUser);
                setCurrentUserData(newUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [authUser, isClerkLoaded]);

    useEffect(() => {
        const processWithDate = <T extends { id: string; createdAt: Date }>(snapshot: any) => 
            snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date()
                } as T;
            });

        const unsubAnnouncements = onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (s) => setAnnouncements(processWithDate<Announcement>(s)));
        const unsubResources = onSnapshot(query(collection(db, 'resources'), orderBy('createdAt', 'desc')), (s) => setResources(processWithDate<Resource>(s)));
        const unsubSections = onSnapshot(query(collection(db, 'resourceSections'), orderBy('createdAt', 'desc')), (s) => setResourceSections(processWithDate<ResourceSection>(s)));
        const unsubDailySurprises = onSnapshot(query(collection(db, 'dailySurprises'), orderBy('createdAt', 'asc')), (s) => setDailySurprises(processWithDate<DailySurprise>(s)));
        const unsubTickets = onSnapshot(query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc')), (s) => setSupportTickets(s.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket))));
        const unsubPolls = onSnapshot(query(collection(db, 'polls'), orderBy('createdAt', 'desc')), (s) => setAllPolls(processWithDate<Poll>(s)));
        const unsubAppSettings = onSnapshot(doc(db, 'appConfig', 'settings'), (d) => setAppSettings(d.exists() ? d.data() as AppSettings : null));
        const unsubGifts = onSnapshot(query(collection(db, 'globalGifts'), orderBy('createdAt', 'desc')), (s) => setGlobalGifts(processWithDate<GlobalGift>(s)));
        const unsubLocks = onSnapshot(doc(db, 'appConfig', 'featureLocks'), (d) => setFeatureLocks(d.exists() ? d.data() as any : null));
        const unsubShowcases = onSnapshot(query(collection(db, 'featureShowcases'), orderBy('createdAt', 'desc')), (s) => setFeatureShowcases(processWithDate<FeatureShowcase>(s)));
        const unsubCreditPacks = onSnapshot(query(collection(db, 'creditPacks'), orderBy('price', 'asc')), (s) => setCreditPacks(processWithDate<CreditPack>(s)));
        const unsubStoreItems = onSnapshot(query(collection(db, 'storeItems'), orderBy('createdAt', 'desc')), (s) => setStoreItems(processWithDate<StoreItem>(s)));
        const unsubVideoCats = onSnapshot(query(collection(db, 'videoCategories'), orderBy('createdAt', 'asc')), (s) => setVideoCategories(processWithDate<VideoCategory>(s)));
        const unsubVideoLecs = onSnapshot(query(collection(db, 'videoLectures'), orderBy('createdAt', 'asc')), (s) => setVideoLectures(processWithDate<VideoLecture>(s)));

        return () => {
            unsubAnnouncements(); unsubResources(); unsubPolls(); unsubDailySurprises(); unsubSections();
            unsubAppSettings(); unsubGifts(); unsubTickets(); unsubLocks(); unsubShowcases();
            unsubCreditPacks(); unsubStoreItems(); unsubVideoCats(); unsubVideoLecs();
        };
    }, []);

    const addCreditsToUser = useCallback(async (uid: string, amount: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.data();
        if (userData?.masterCardExpires && new Date(userData.masterCardExpires) > new Date() && amount < 0) return;
        await updateDoc(userDocRef, { credits: increment(amount) });
    }, []);

    const applyFocusPenalty = useCallback(async (uid: string, amount: number): Promise<'shielded' | 'penalized'> => {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return 'penalized';
        const data = userSnap.data() as User;
        
        if (data.inventory?.penaltyShields && data.inventory.penaltyShields > 0) {
            await updateDoc(userRef, { 'inventory.penaltyShields': increment(-1) });
            return 'shielded';
        } else {
            await addCreditsToUser(uid, -amount);
            return 'penalized';
        }
    }, [addCreditsToUser]);

    const redeemStoreItem = useCallback(async (item: StoreItem) => {
        if (!authUser || !currentUserData) throw new Error("You must be logged in.");
        if (item.paymentType !== 'credits') throw new Error("This item must be paid for with money.");

        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', authUser.id);
            const itemRef = doc(db, 'storeItems', item.id);
            const userSnap = await transaction.get(userRef);
            const itemSnap = await transaction.get(itemRef);
            
            if (!userSnap.exists() || !itemSnap.exists()) throw new Error("Data error.");
            
            const userData = userSnap.data() as User;
            const currentItem = itemSnap.data() as StoreItem;
            const hasMasterCard = userData.masterCardExpires && new Date(userData.masterCardExpires) > new Date();
            
            if (!hasMasterCard && userData.credits < item.cost) throw new Error("Insufficient credits.");
            if (currentItem.stock <= 0) throw new Error("Sold out.");
            
            transaction.update(itemRef, { stock: increment(-1) });
            
            const updates: any = {};
            if (!hasMasterCard) updates.credits = increment(-item.cost);
            
            if (item.type === 'scratch-card') updates.freeRewards = increment(item.quantity);
            else if (item.type === 'card-flip') updates.freeGuesses = increment(item.quantity);
            else if (item.type === 'penalty-shield') updates['inventory.penaltyShields'] = increment(item.quantity);
            else if (item.type === 'streak-freeze') updates['inventory.streakFreezes'] = increment(item.quantity);
            else if (item.type === 'clan-xp-booster') updates['inventory.clanXpBoosters'] = increment(item.quantity);
            else if (item.type === 'clan-level-max') updates['inventory.clanLevelMaxers'] = increment(item.quantity);
            else if (item.type === 'alpha-glow') {
                const currentAlpha = userData.inventory?.alphaGlowExpires ? new Date(userData.inventory.alphaGlowExpires) : new Date();
                const newExpiry = dateFnsAddDays(currentAlpha > new Date() ? currentAlpha : new Date(), 7 * item.quantity);
                updates['inventory.alphaGlowExpires'] = newExpiry.toISOString();
            } else if (item.type === 'early-bird') {
                updates.isEarlyBird = true;
            } else if (item.type === 'night-owl') {
                updates.isNightOwl = true;
            } else if (item.type === 'knowledge-knight') {
                updates.isKnowledgeKnight = true;
            }
            
            transaction.update(userRef, updates);
        });
    }, [authUser, currentUserData]);

    const processStoreItemPayment = useCallback(async (item: StoreItem, transactionId: string) => {
        if (!authUser || !currentUserData) return;
        
        await runTransaction(db, async (transaction) => {
            const userRef = doc(db, 'users', authUser.id);
            const itemRef = doc(db, 'storeItems', item.id);
            const userSnap = await transaction.get(userRef);
            const itemSnap = await transaction.get(itemRef);
            
            if (!userSnap.exists() || !itemSnap.exists()) throw new Error("Data error.");
            
            const userData = userSnap.data() as User;
            const currentItem = itemSnap.data() as StoreItem;
            
            if (currentItem.stock <= 0) throw new Error("Sold out.");
            
            transaction.update(itemRef, { stock: increment(-1) });
            
            const updates: any = {
                transactions: arrayUnion({
                    id: transactionId,
                    packName: item.name,
                    credits: 0, 
                    price: item.price,
                    date: new Date().toISOString(),
                    type: 'razorpay_item'
                })
            };
            
            if (item.type === 'scratch-card') updates.freeRewards = increment(item.quantity);
            else if (item.type === 'card-flip') updates.freeGuesses = increment(item.quantity);
            else if (item.type === 'penalty-shield') updates['inventory.penaltyShields'] = increment(item.quantity);
            else if (item.type === 'streak-freeze') updates['inventory.streakFreezes'] = increment(item.quantity);
            else if (item.type === 'clan-xp-booster') updates['inventory.clanXpBoosters'] = increment(item.quantity);
            else if (item.type === 'clan-level-max') updates['inventory.clanLevelMaxers'] = increment(item.quantity);
            else if (item.type === 'alpha-glow') {
                const currentAlpha = userData.inventory?.alphaGlowExpires ? new Date(userData.inventory.alphaGlowExpires) : new Date();
                const newExpiry = dateFnsAddDays(currentAlpha > new Date() ? currentAlpha : new Date(), 7 * item.quantity);
                updates['inventory.alphaGlowExpires'] = newExpiry.toISOString();
            } else if (item.type === 'early-bird') {
                updates.isEarlyBird = true;
            } else if (item.type === 'night-owl') {
                updates.isNightOwl = true;
            } else if (item.type === 'knowledge-knight') {
                updates.isKnowledgeKnight = true;
            }
            
            transaction.update(userRef, updates);
        });
    }, [authUser, currentUserData]);

    const value: AppDataContextType = {
        isAdmin, isCoDev, isSuperAdmin, users, currentUserData, transactions, loading, announcements, resources, resourceSections, dailySurprises, supportTickets, allPolls, activePoll, appSettings, globalGifts, activeGlobalGift, featureLocks, featureShowcases, creditPacks, storeItems, videoCategories, videoLectures,
        toggleUserBlock: (uid, isBlocked) => updateDoc(doc(db, 'users', uid), { isBlocked: !isBlocked }),
        toggleLeaderboardPrivacy: (uid, isPrivate) => updateDoc(doc(db, 'users', uid), { isLeaderboardPrivate: isPrivate }),
        addCreditsToUser,
        applyFocusPenalty,
        giftCreditsToAllUsers: async (amt) => {
            const usersSnapshot = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
            const batch = writeBatch(db);
            usersSnapshot.forEach(d => batch.update(d.ref, { credits: increment(amt) }));
            await batch.commit();
        },
        resetUserCredits: (uid) => updateDoc(doc(db, 'users', uid), { credits: 100 }),
        addFreeSpinsToUser: (uid, amt) => updateDoc(doc(db, 'users', uid), { freeRewards: increment(amt) }),
        addSpinsToAllUsers: async (amt) => {
            const snap = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { freeRewards: increment(amt) }));
            await batch.commit();
        },
        addFreeGuessesToUser: (uid, amt) => updateDoc(doc(db, 'users', uid), { freeGuesses: increment(amt) }),
        addGuessesToAllUsers: async (amt) => {
            const snap = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { freeGuesses: increment(amt) }));
            await batch.commit();
        },
        unlockResourceSection: async (uid, sid, cost) => {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const hasMaster = userSnap.data()?.masterCardExpires && new Date(userSnap.data()?.masterCardExpires) > new Date();
            await updateDoc(userRef, { unlockedResourceSections: arrayUnion(sid), credits: hasMaster ? increment(0) : increment(-cost) });
        },
        unlockFeatureForUser: async (uid, fid, cost) => {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const hasMaster = userSnap.data()?.masterCardExpires && new Date(userSnap.data()?.masterCardExpires) > new Date();
            await updateDoc(userRef, { unlockedFeatures: arrayUnion(fid), credits: hasMaster ? increment(0) : increment(-cost) });
        },
        unlockThemeForUser: async (uid, tid, cost) => {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const hasMaster = userSnap.data()?.masterCardExpires && new Date(userSnap.data()?.masterCardExpires) > new Date();
            await updateDoc(userRef, { unlockedThemes: arrayUnion(tid), credits: hasMaster ? increment(0) : increment(-cost) });
        },
        generateAiAccessToken: async (uid) => {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() as User;
            const hasMaster = userData.masterCardExpires && new Date(userData.masterCardExpires) > new Date();
            if (!hasMaster && userData.credits < 1000) throw new Error("Credits needed.");
            const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
            const batch = writeBatch(db);
            batch.update(userRef, { hasAiAccess: true, credits: hasMaster ? increment(0) : increment(-1000) });
            batch.set(doc(collection(db, 'ai_access_tokens')), { userId: uid, token, createdAt: serverTimestamp(), isUsed: false });
            await batch.commit();
            return token;
        },
        generateDevAiAccessToken: async (uid) => {
            const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');
            await updateDoc(doc(db, 'users', uid), { hasAiAccess: true });
            await addDoc(collection(db, 'ai_access_tokens'), { userId: uid, token, createdAt: serverTimestamp(), isUsed: false });
            return token;
        },
        grantMasterCard: (uid, days) => updateDoc(doc(db, 'users', uid), { masterCardExpires: dateFnsAddDays(new Date(), days).toISOString() }),
        revokeMasterCard: (uid) => updateDoc(doc(db, 'users', uid), { masterCardExpires: null }),
        addPerfectedQuiz: (uid, qid) => updateDoc(doc(db, 'users', uid), { perfectedQuizzes: arrayUnion(qid) }),
        incrementQuizAttempt: (uid, qid) => updateDoc(doc(db, 'users', uid), { [`quizAttempts.${qid}`]: increment(1) }),
        incrementFocusSessions: (uid, dur) => updateDoc(doc(db, 'users', uid), { focusSessionsCompleted: increment(1), totalStudyTime: increment(dur) }),
        claimDailyTaskReward: (uid, amt) => updateDoc(doc(db, 'users', uid), { credits: increment(amt), dailyTasksCompleted: increment(1), lastDailyTasksClaim: format(new Date(), 'yyyy-MM-dd') }),
        claimEliteDailyReward: (uid) => updateDoc(doc(db, 'users', uid), { credits: increment(20), freeRewards: increment(5), freeGuesses: increment(5), lastEliteClaim: format(new Date(), 'yyyy-MM-dd') }),
        updateStudyTime: (uid, secs) => updateDoc(doc(db, 'users', uid), { totalStudyTime: secs }),
        updateGameHighScore: async (uid, game, score) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists() && score > (snap.data().gameHighScores?.[game] || 0)) await updateDoc(doc(db, 'users', uid), { [`gameHighScores.${game}`]: score });
        },
        updateElementQuestScore: async (uid, blk, score) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (snap.exists() && score > (snap.data().elementQuestScores?.[blk] || 0)) await updateDoc(doc(db, 'users', uid), { [`elementQuestScores.${blk}`]: score });
        },
        claimElementQuestMilestone: (uid, m) => updateDoc(doc(db, 'users', uid), { credits: increment(m === 100 ? 50 : m === 200 ? 100 : m === 300 ? 150 : 200), elementQuestMilestonesClaimed: arrayUnion(m) }),
        claimDimensionShiftMilestone: async (uid, m) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (!snap.exists()) return false;
            const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const claims = snap.data().dimensionShiftClaims?.[weekKey] || [];
            if (claims.includes(m)) return false;
            const reward = m === 50 ? 2 : m === 100 ? 5 : m === 150 ? 10 : m === 200 ? 15 : m === 250 ? 20 : 200;
            await updateDoc(snap.ref, { credits: increment(reward), [`dimensionShiftClaims.${weekKey}`]: arrayUnion(m) });
            return true;
        },
        claimFlappyMindMilestone: async (uid, m) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (!snap.exists()) return false;
            const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const claims = snap.data().flappyMindClaims?.[weekKey] || [];
            if (claims.includes(m)) return false;
            const reward = m === 20 ? 15 : m === 100 ? 100 : 3;
            await updateDoc(snap.ref, { credits: increment(reward), [`flappyMindClaims.${weekKey}`]: arrayUnion(m) });
            return true;
        },
        claimAstroAscentMilestone: async (uid, m) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (!snap.exists()) return false;
            const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const claims = snap.data().astroAscentClaims?.[weekKey] || [];
            if (claims.includes(m)) return false;
            const reward = m === 25 ? 5 : m === 50 ? 10 : m === 75 ? 25 : 50;
            await updateDoc(snap.ref, { credits: increment(reward), [`astroAscentClaims.${weekKey}`]: arrayUnion(m) });
            return true;
        },
        claimMathematicsLegendMilestone: async (uid, m) => {
            const snap = await getDoc(doc(db, 'users', uid));
            if (!snap.exists()) return false;
            const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
            const claims = snap.data().mathematicsLegendClaims?.[weekKey] || [];
            if (claims.includes(m)) return false;
            await updateDoc(snap.ref, { credits: increment(200), [`mathematicsLegendClaims.${weekKey}`]: arrayUnion(m) });
            return true;
        },
        makeUserAdmin: (uid) => updateDoc(doc(db, 'users', uid), { isAdmin: true }),
        removeUserAdmin: (uid) => updateDoc(doc(db, 'users', uid), { isAdmin: false }),
        makeUserVip: (uid) => updateDoc(doc(db, 'users', uid), { isVip: true }),
        removeUserVip: (uid) => updateDoc(doc(db, 'users', uid), { isVip: false }),
        makeUserGM: (uid) => updateDoc(doc(db, 'users', uid), { isGM: true }),
        removeUserGM: (uid) => updateDoc(doc(db, 'users', uid), { isGM: false }),
        makeUserChallenger: (uid) => updateDoc(doc(db, 'users', uid), { isChallenger: true }),
        removeUserChallenger: (uid) => updateDoc(doc(db, 'users', uid), { isChallenger: false }),
        makeUserCoDev: (uid) => updateDoc(doc(db, 'users', uid), { isCoDev: true }),
        removeUserCoDev: (uid) => updateDoc(doc(db, 'users', uid), { isCoDev: false }),
        setShowcaseBadge: (uid, badge) => updateDoc(doc(db, 'users', uid), { showcasedBadge: badge }),
        clearGlobalChat: async () => {
            const snap = await getDocs(collection(db, 'global_chat'));
            const batch = writeBatch(db);
            snap.docs.forEach(d => batch.delete(d.ref));
            await batch.commit();
        },
        clearQuizLeaderboard: async () => {
            const snap = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { perfectedQuizzes: [], quizAttempts: {} }));
            await batch.commit();
        },
        resetWeeklyStudyTime: async () => {
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
            const snap = await getDocs(query(collectionGroup(db, 'timeTrackerSessions'), where('startTime', '>=', weekStart)));
            const batch = writeBatch(db);
            snap.forEach(d => batch.delete(d.ref));
            await batch.commit();
        },
        resetGameZoneLeaderboard: async () => {
            const snap = await getDocs(collection(db, 'users'));
            const batch = writeBatch(db);
            snap.forEach(d => batch.update(d.ref, { gameHighScores: { memoryGame: 0, emojiQuiz: 0, dimensionShift: 0, subjectSprint: 0, flappyMind: 0, astroAscent: 0, mathematicsLegend: 0 } }));
            await batch.commit();
        },
        submitSupportTicket: (msg) => addDoc(collection(db, 'supportTickets'), { userId: authUser?.id, userName: currentUserData?.displayName, message: msg, status: 'new', createdAt: serverTimestamp() }),
        addAnnouncement: (a) => addDoc(collection(db, 'announcements'), { ...a, createdAt: serverTimestamp() }),
        updateAnnouncement: (id, d) => updateDoc(doc(db, 'announcements', id), d),
        deleteAnnouncement: (id) => deleteDoc(doc(db, 'announcements', id)),
        addResourceSection: (s) => addDoc(collection(db, 'resourceSections'), { ...s, createdAt: serverTimestamp() }),
        updateResourceSection: (id, d) => updateDoc(doc(db, 'resourceSections', id), d),
        deleteResourceSection: async (id) => {
            const resSnap = await getDocs(query(collection(db, "resources"), where("sectionId", "==", id)));
            const batch = writeBatch(db);
            resSnap.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, 'resourceSections', id));
            await batch.commit();
        },
        addResource: (r) => addDoc(collection(db, 'resources'), { ...r, createdAt: serverTimestamp() }),
        updateResource: (id, d) => updateDoc(doc(db, 'resources', id), d),
        deleteResource: (id) => deleteDoc(doc(db, 'resources', id)),
        addDailySurprise: (s) => addDoc(collection(db, 'dailySurprises'), { ...s, createdAt: serverTimestamp() }),
        deleteDailySurprise: (id) => deleteDoc(doc(db, 'dailySurprises', id)),
        updateTicketStatus: (id, s) => updateDoc(doc(db, 'supportTickets', id), { status: s }),
        deleteTicket: (id) => deleteDoc(doc(db, 'supportTickets', id)),
        addPoll: (p) => addDoc(collection(db, 'polls'), { ...p, isActive: false, results: p.options.reduce((acc, o) => ({ ...acc, [o]: 0 }), {}), createdAt: serverTimestamp() }),
        updatePoll: (id, d) => updateDoc(doc(db, 'polls', id), d),
        deletePoll: (id) => deleteDoc(doc(db, 'polls', id)),
        setActivePoll: async (id) => {
            const activeSnap = await getDocs(query(collection(db, 'polls'), where('isActive', '==', true)));
            const batch = writeBatch(db);
            activeSnap.forEach(d => batch.update(d.ref, { isActive: false }));
            batch.update(doc(db, 'polls', id), { isActive: true });
            await batch.commit();
        },
        submitPollVote: async (id, opt) => {
            if (!authUser) return;
            const batch = writeBatch(db);
            batch.update(doc(db, 'polls', id), { [`results.${opt}`]: increment(1) });
            batch.update(doc(db, 'users', authUser.id), { [`votedPolls.${id}`]: opt });
            await batch.commit();
        },
        submitPollComment: (id, c) => updateDoc(doc(db, 'polls', id), { comments: arrayUnion({ userId: authUser?.id, userName: currentUserData?.displayName, comment: c, createdAt: Timestamp.now() }) }),
        updateAppSettings: (s) => updateDoc(doc(db, 'appConfig', 'settings'), s),
        sendGlobalGift: (g) => addDoc(collection(db, 'globalGifts'), { ...g, createdAt: serverTimestamp(), isActive: true, claimedBy: [] }),
        deactivateGift: (id) => updateDoc(doc(db, 'globalGifts', id), { isActive: false }),
        deleteGlobalGift: (id) => deleteDoc(doc(db, 'globalGifts', id)),
        claimGlobalGift: async (id, uid) => {
            const giftRef = doc(db, 'globalGifts', id);
            const giftSnap = await getDoc(giftRef);
            if (!giftSnap.exists() || giftSnap.data().claimedBy?.includes(uid)) return;
            const gift = giftSnap.data();
            const batch = writeBatch(db);
            batch.update(giftRef, { claimedBy: arrayUnion(uid) });
            if (gift.rewards.credits) batch.update(doc(db, 'users', uid), { credits: increment(gift.rewards.credits) });
            if (gift.rewards.scratch) batch.update(doc(db, 'users', uid), { freeRewards: increment(gift.rewards.scratch) });
            if (gift.rewards.flip) batch.update(doc(db, 'users', uid), { freeGuesses: increment(gift.rewards.flip) });
            await batch.commit();
        },
        lockFeature: (fid, cost) => setDoc(doc(db, 'appConfig', 'featureLocks'), { [fid]: { id: fid, isLocked: true, cost } }, { merge: true }),
        unlockFeature: (fid) => setDoc(doc(db, 'appConfig', 'featureLocks'), { [fid]: { id: fid, isLocked: false, cost: 0 } }, { merge: true }),
        addFeatureShowcase: (s) => addDoc(collection(db, 'featureShowcases'), { ...s, createdAt: serverTimestamp() }),
        updateFeatureShowcase: (id, d) => updateDoc(doc(db, 'featureShowcases', id), d),
        deleteFeatureShowcase: (id) => deleteDoc(doc(db, 'featureShowcases', id)),
        createCreditPack: (p) => addDoc(collection(db, 'creditPacks'), { ...p, createdAt: serverTimestamp() }),
        updateCreditPack: (id, d) => updateDoc(doc(db, 'creditPacks', id), d),
        deleteCreditPack: (id) => deleteDoc(doc(db, 'creditPacks', id)),
        createStoreItem: (i) => addDoc(collection(db, 'storeItems'), { ...i, createdAt: serverTimestamp() }),
        updateStoreItem: (id, d) => updateDoc(doc(db, 'storeItems', id), d),
        deleteStoreItem: (id) => deleteDoc(doc(db, 'storeItems', id)),
        redeemStoreItem,
        processStoreItemPayment,
        addVideoCategory: (c) => addDoc(collection(db, 'videoCategories'), { ...c, createdAt: serverTimestamp() }),
        deleteVideoCategory: async (id) => {
            const batch = writeBatch(db);
            const lecsSnap = await getDocs(query(collection(db, 'videoLectures'), where('categoryId', '==', id)));
            lecsSnap.forEach(d => batch.delete(d.ref));
            batch.delete(doc(db, 'videoCategories', id));
            await batch.commit();
        },
        addVideoLecture: (l) => addDoc(collection(db, 'videoLectures'), { ...l, createdAt: serverTimestamp() }),
        deleteVideoLecture: (id) => deleteDoc(doc(db, 'videoLectures', id)),
    };

    return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
};

export const useAdmin = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAdmin must be used within an AppDataProvider');
    return context;
};

export const useUsers = () => useAdmin();
export const useAnnouncements = () => {
    const { announcements, loading } = useAdmin();
    return { announcements, loading };
};
export const useResources = () => {
    const { resources, resourceSections, loading } = useAdmin();
    return { allResources: resources, allSections: resourceSections, loading };
};
export const usePolls = () => useAdmin();
export const useDailySurprises = () => {
    const { dailySurprises, loading } = useAdmin();
    return { dailySurprises, loading };
};
