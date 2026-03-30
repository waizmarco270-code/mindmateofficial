
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { 
    collection, doc, onSnapshot, query, orderBy, limit, Timestamp, collectionGroup 
} from 'firebase/firestore';
import { useToast } from './use-toast';

// Modular Logic Imports
import { useUserActions } from './admin/use-user-actions';
import { useContentActions } from './admin/use-content-actions';
import { useStoreActions } from './admin/use-store-actions';
import { useSystemActions } from './admin/use-system-actions';
import { useCodeActions } from './admin/use-code-actions';
import { runAegisPulse, type AegisPulseOutput } from '@/ai/flows/aegis-sentinel-flow';

export const SUPER_ADMIN_UID = "user_32WgV1OikpqTXO9pFApoPRLLarF";
export type BadgeType = 'admin' | 'vip' | 'gm' | 'challenger' | 'dev' | 'co-dev' | 'early-bird' | 'night-owl' | 'knowledge-knight' | 'streaker' | 'isolater' | 'iso-warrior' | 'warrior' | 'iso-master' | 'sovereign';

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
  isCoDev?: boolean;
  isEarlyBird?: boolean;
  isNightOwl?: boolean;
  isKnowledgeKnight?: boolean;
  isStreaker?: boolean;
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
  elementQuestScores?: { s?: number; p?: number; d?: number; f?: number; };
  elementQuestMilestonesClaimed?: number[];
  dimensionShiftClaims?: Record<string, number[]>;
  flappyMindClaims?: Record<string, number[]>;
  astroAscentClaims?: Record<string, number[]>;
  mathematicsLegendClaims?: Record<string, number[]>;
  transactions?: { id: string; packName: string; credits: number; price?: number; date: string; type?: string }[];
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
export interface CreditPack { id: string; name: string; credits: number; price: number; badge?: string; createdAt: Date; }
export interface StoreItem { id: string; name: string; description: string; cost: number; price?: number; paymentType: 'credits' | 'money'; type: string; quantity: number; createdAt: Date; stock: number; isFeatured: boolean; badge?: string; }
export interface VideoCategory { id: string; name: string; description: string; createdAt: Date; }
export interface VideoLecture { id: string; title: string; description: string; youtubeUrl: string; thumbnailUrl: string; categoryId: string; createdAt: Date; }

export type AppThemeId = 'light' | 'dark' | 'synthwave-sunset' | 'solar-flare' | 'emerald-dream';
export type MaintenanceTheme = 'shiny' | 'forest' | 'sunflower';
export interface AppSettings { marcoAiLaunchStatus: 'countdown' | 'live'; isMaintenanceMode?: boolean; maintenanceMessage?: string; maintenanceEndTime?: string; maintenanceTheme?: MaintenanceTheme; whatsNewMessage?: string; lastMaintenanceId?: string; }

interface AppDataContextType {
    isAdmin: boolean; isCoDev: boolean; isSuperAdmin: boolean; loading: boolean;
    users: User[]; currentUserData: User | null; transactions: User['transactions'];
    announcements: Announcement[]; resources: Resource[]; resourceSections: ResourceSection[];
    dailySurprises: DailySurprise[]; supportTickets: SupportTicket[]; allPolls: Poll[];
    appSettings: AppSettings | null; globalGifts: GlobalGift[]; activeGlobalGift: GlobalGift | null;
    featureShowcases: FeatureShowcase[]; creditPacks: CreditPack[]; storeItems: StoreItem[];
    videoCategories: VideoCategory[]; videoLectures: VideoLecture[];
    activePoll: Poll | null; redeemCodes: RedeemCode[];
    
    // Actions
    toggleUserBlock: any; toggleLeaderboardPrivacy: any; addCreditsToUser: any; applyFocusPenalty: any;
    grantMasterCard: any; revokeMasterCard: any; setShowcaseBadge: any; makeUserAdmin: any; removeUserAdmin: any;
    makeUserVip: any; removeUserVip: any; makeUserGM: any; removeUserGM: any; makeUserCoDev: any; removeUserCoDev: any;
    addPerfectedQuiz: any; incrementQuizAttempt: any; incrementFocusSessions: any; claimDailyTaskReward: any;
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
    triggerAegisPulse: () => Promise<AegisPulseOutput>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

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
    const [creditPacks, setCreditPacks] = useState<CreditPack[]>([]);
    const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
    const [videoCategories, setVideoCategories] = useState<VideoCategory[]>([]);
    const [videoLectures, setVideoLectures] = useState<VideoLecture[]>([]);
    const [redeemCodes, setRedeemCodes] = useState<RedeemCode[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = currentUserData?.isAdmin ?? false;
    const isSuperAdmin = authUser?.id === SUPER_ADMIN_UID;
    const isCoDev = currentUserData?.isCoDev ?? false;

    const userActions = useMemo(() => useUserActions(db, toast), [toast]);
    const contentActions = useMemo(() => useContentActions(db, toast), [toast]);
    const storeActions = useMemo(() => useStoreActions(db, toast), [toast]);
    const systemActions = useMemo(() => useSystemActions(db, toast), [toast]);
    const codeActions = useMemo(() => useCodeActions(db, toast), [toast]);

    useEffect(() => {
        const process = (snap: any) => snap.docs.map((d: any) => ({ id: d.id, ...d.data(), createdAt: d.data().createdAt?.toDate() || new Date() }));
        const unsubs = [
            onSnapshot(collection(db, 'users'), (s) => setUsers(s.docs.map(d => ({ id: d.id, ...d.data() } as User)))),
            onSnapshot(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')), (s) => setAnnouncements(process(s))),
            onSnapshot(collection(db, 'resources'), (s) => setResources(process(s))),
            onSnapshot(collection(db, 'resourceSections'), (s) => setResourceSections(process(s))),
            onSnapshot(query(collection(db, 'dailySurprises'), orderBy('createdAt', 'asc')), (s) => setDailySurprises(process(s))),
            onSnapshot(collection(db, 'supportTickets'), (s) => setSupportTickets(s.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket)))),
            onSnapshot(collection(db, 'polls'), (s) => setAllPolls(process(s))),
            onSnapshot(doc(db, 'appConfig', 'settings'), (d) => setAppSettings(d.exists() ? d.data() as AppSettings : null)),
            onSnapshot(query(collection(db, 'globalGifts'), orderBy('createdAt', 'desc')), (s) => setGlobalGifts(process(s))),
            onSnapshot(collection(db, 'featureShowcases'), (s) => setFeatureShowcases(process(s))),
            onSnapshot(collection(db, 'creditPacks'), (s) => setCreditPacks(process(s))),
            onSnapshot(collection(db, 'storeItems'), (s) => setStoreItems(process(s))),
            onSnapshot(collection(db, 'videoCategories'), (s) => setVideoCategories(process(s))),
            onSnapshot(collection(db, 'videoLectures'), (s) => setVideoLectures(process(s))),
            onSnapshot(query(collection(db, 'redeemCodes'), orderBy('createdAt', 'desc')), (s) => setRedeemCodes(process(s))),
        ];
        return () => unsubs.forEach(u => u());
    }, []);

    useEffect(() => {
        if (!isClerkLoaded) return;
        if (!authUser) { setCurrentUserData(null); setLoading(false); return; }
        return onSnapshot(doc(db, 'users', authUser.id), (snap) => {
            if (snap.exists()) setCurrentUserData({ id: snap.id, ...snap.data() } as User);
            setLoading(false);
        });
    }, [authUser, isClerkLoaded]);

    const value = useMemo(() => ({
        isAdmin, isCoDev, isSuperAdmin, loading, users, currentUserData, transactions: currentUserData?.transactions || [],
        announcements, resources, resourceSections, dailySurprises, supportTickets, allPolls, appSettings, globalGifts, 
        activeGlobalGift: globalGifts.find(g => g.isActive) || null, featureShowcases, creditPacks, storeItems,
        videoCategories, videoLectures, redeemCodes, activePoll: allPolls.find(p => p.isActive) || null,
        
        ...userActions,
        ...contentActions,
        ...storeActions,
        ...systemActions,
        ...codeActions,
        
        triggerAegisPulse: async () => {
            if (users.length === 0) throw new Error("No citizens detected.");
            return runAegisPulse({
                topUsers: users.slice(0, 5).map(u => ({ uid: u.uid, displayName: u.displayName, credits: u.credits, studyTime: u.totalStudyTime || 0, streak: u.streak || 0 })),
                recentAnnouncements: announcements.slice(0, 3).map(a => a.title),
                totalUsers: users.length,
                isChatQuiet: true
            });
        },
        generateAiAccessToken: () => userActions.generateAiAccessToken(authUser?.id!),
        unlockResourceSection: (sid: string, c: number) => userActions.unlockResourceSection(authUser?.id!, sid, c),
        unlockFeatureForUser: (fid: any, c: number) => userActions.unlockFeatureForUser(authUser?.id!, fid, c),
        unlockThemeForUser: (tid: any, c: number) => userActions.unlockThemeForUser(authUser?.id!, tid, c),
        submitPollVote: (pid: string, opt: string) => contentActions.submitPollVote(pid, opt, authUser!.id),
        submitPollComment: (pid: string, c: string) => contentActions.submitPollComment(pid, c, authUser!.id, currentUserData!.displayName),
        redeemStoreItem: (i: any, q: number) => storeActions.redeemStoreItem(i, q, authUser!.id),
        processStoreItemPayment: (i: any, q: number, tx: string, m: any) => storeActions.processStoreItemPayment(i, q, authUser!.id, m),
        submitSupportTicket: (m: string) => systemActions.submitSupportTicket(m, authUser!.id, currentUserData!.displayName),
        topUpWallet: (a: number, tx: string) => systemActions.topUpWallet(authUser!.id, a, tx),
        claimGlobalGift: (gid: string) => systemActions.claimGlobalGift(gid, authUser!.id),
        redeemCode: (c: string) => codeActions.redeemCode(authUser!.id, c),
    }), [
        isAdmin, isCoDev, isSuperAdmin, loading, users, currentUserData, 
        announcements, resources, resourceSections, dailySurprises, supportTickets, 
        allPolls, appSettings, globalGifts, featureShowcases, creditPacks, 
        storeItems, videoCategories, videoLectures, redeemCodes,
        userActions, contentActions, storeActions, systemActions, codeActions, authUser?.id
    ]);

    return <AppDataContext.Provider value={value as any}>{children}</AppDataContext.Provider>;
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
