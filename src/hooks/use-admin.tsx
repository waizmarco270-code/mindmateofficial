
'use client';
import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, getDoc, query, setDoc, where, getDocs, increment, writeBatch, orderBy, addDoc, serverTimestamp, deleteDoc, arrayUnion, arrayRemove, limit, Timestamp, collectionGroup } from 'firebase/firestore';
import { isToday, isYesterday, format, startOfWeek, endOfWeek, parseISO } from 'date-fns';
import { LucideIcon } from 'lucide-react';
import { lockableFeatures, type LockableFeature } from '@/lib/features';


// ============================================================================
//  TYPES & INITIAL DATA
// ============================================================================

export const SUPER_ADMIN_UID = "user_32WgV1OikpqTXO9pFApoPRLLarF";

export interface User {
  id: string; // Document ID from Firestore (should be same as Clerk UID)
  uid: string; // Clerk User ID
  displayName: string;
  email: string;
  photoURL?: string;
  isBlocked: boolean;
  credits: number;
  votedPolls?: Record<string, string>; // { pollId: 'chosen_option' }
  unlockedResourceSections?: string[]; // Array of unlocked section IDs
  unlockedFeatures?: string[]; // Array of feature IDs
  hasAiAccess?: boolean; // For Marco AI
  perfectedQuizzes?: string[]; // Array of quiz IDs the user got a perfect score on
  quizAttempts?: Record<string, number>; // { quizId: attemptCount }
  isAdmin?: boolean;
  isVip?: boolean; // For the special recognition badge
  isGM?: boolean; // For the Game Master badge
  friends?: string[]; // Array of friend UIDs
  focusSessionsCompleted?: number;
  dailyTasksCompleted?: number; // Total count over all time
  lastDailyTasksClaim?: string; // YYYY-MM-DD, for per-day reward claim
  lastEliteClaim?: string; // YYYY-MM-DD, for elite daily reward
  totalStudyTime?: number; // in seconds
  lastRewardDate?: string; // For scratch card
  lastGiftBoxDate?: string; // For gift box game
  lastRpsDate?: string; // For RPS Game
  freeRewards?: number; // Extra scratch cards
  freeGuesses?: number; // Extra gift box guesses
  rewardHistory?: { reward: number | string, date: Timestamp, source: string }[];
  streak?: number;
  longestStreak?: number;
  lastStreakCheck?: string; // YYYY-MM-DD
  referralCode?: string; // e.g. JOHNDOE-123
  referralUsed?: boolean; // True if they have used someone else's code
  referredBy?: string; // UID of the user who referred them
  gameHighScores?: {
    memoryGame?: number;
    emojiQuiz?: number;
    dimensionShift?: number;
    subjectSprint?: number;
    flappyMind?: number;
  };
  claimedGlobalGifts?: string[];
  dimensionShiftClaims?: Record<string, number[]>; // { 'YYYY-MM-DD': [50, 100] }
  flappyMindClaims?: Record<string, number[]>;
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
    sectionId: string; // ID from ResourceSection
    createdAt: Date;
}

export interface Poll {
    id: string;
    question: string;
    options: string[];
    results: Record<string, number>;
    isActive: boolean;
    createdAt: Date;
}

export interface DailySurprise {
    id: string;
    type: 'quote' | 'fact' | 'meme' | 'quiz' | 'new-feature';
    text?: string; // For quote/fact
    author?: string; // For quote
    imageUrl?: string; // For meme
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectAnswer?: string;
    createdAt: Date;
    // For new-feature type
    featureTitle?: string;
    featureDescription?: string;
    featureIcon?: string; // Lucide icon name
    featureRoute?: string; // e.g., /dashboard/entertainment
}

export interface AppTheme {
    primary: string; // "H S L" e.g. "262 80% 56%"
    background: string;
    accent: string;
    radius: number; // 0 to 1
}

export interface AppSettings {
    marcoAiLaunchStatus: 'countdown' | 'live';
}

export interface GlobalGift {
    id: string;
    message: string;
    rewards: {
        credits: number;
        scratch: number;
        flip: number;
    };
    target: 'all' | string; // 'all' or a specific UID
    createdAt: Date;
    isActive: boolean;
    claimedBy?: string[]; // Array of UIDs who have claimed it
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

// ============================================================================
//  CONTEXT DEFINITIONS
// ============================================================================

interface AppDataContextType {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    users: User[];
    currentUserData: User | null;
    toggleUserBlock: (uid: string, isBlocked: boolean) => Promise<void>;
    addCreditsToUser: (uid: string, amount: number) => Promise<void>;
    giftCreditsToAllUsers: (amount: number) => Promise<void>;
    resetUserCredits: (uid: string) => Promise<void>;
    addFreeSpinsToUser: (uid: string, amount: number) => Promise<void>;
    addSpinsToAllUsers: (amount: number) => Promise<void>;
    addFreeGuessesToUser: (uid: string, amount: number) => Promise<void>;
    addGuessesToAllUsers: (amount: number) => Promise<void>;
    unlockResourceSection: (uid: string, sectionId: string, cost: number) => Promise<void>;
    unlockFeatureForUser: (uid: string, featureId: LockableFeature['id'], cost: number) => Promise<void>;
    generateAiAccessToken: (uid: string) => Promise<string | null>;
    addPerfectedQuiz: (uid: string, quizId: string) => Promise<void>;
    incrementQuizAttempt: (uid: string, quizId: string) => Promise<void>;
    incrementFocusSessions: (uid: string) => Promise<void>;
    claimDailyTaskReward: (uid: string, amount: number) => Promise<void>;
    claimEliteDailyReward: (uid: string) => Promise<void>;
    updateStudyTime: (uid: string, totalSeconds: number) => Promise<void>;
    updateGameHighScore: (uid: string, game: 'memoryGame' | 'emojiQuiz' | 'dimensionShift' | 'subjectSprint' | 'flappyMind', score: number) => Promise<void>;
    claimDimensionShiftMilestone: (uid: string, milestone: number) => Promise<boolean>;
    claimFlappyMindMilestone: (uid: string, milestone: number) => Promise<boolean>;
    makeUserAdmin: (uid: string) => Promise<void>;
    removeUserAdmin: (uid: string) => Promise<void>;
    makeUserVip: (uid: string) => Promise<void>;
    removeUserVip: (uid: string) => Promise<void>;
    makeUserGM: (uid: string) => Promise<void>;
    removeUserGM: (uid: string) => Promise<void>;
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
    updatePoll: (id: string, data: Partial<Poll>) => Promise<void>;
    submitPollVote: (pollId: string, option: string) => Promise<void>;

    appTheme: AppTheme | null;
    updateAppTheme: (theme: AppTheme) => Promise<void>;
    
    appSettings: AppSettings | null;
    updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;


    globalGifts: GlobalGift[];
    activeGlobalGift: GlobalGift | null;
    sendGlobalGift: (gift: Omit<GlobalGift, 'id' | 'createdAt' | 'isActive' | 'claimedBy'>) => Promise<void>;
    deactivateGift: (giftId: string) => Promise<void>;
    claimGlobalGift: (giftId: string, userId: string) => Promise<void>;

    featureLocks: Record<LockableFeature['id'], FeatureLock> | null;
    lockFeature: (featureId: LockableFeature['id'], cost: number) => Promise<void>;
    unlockFeature: (featureId: LockableFeature['id']) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

// ============================================================================
//  MAIN DATA PROVIDER COMPONENT
// ============================================================================

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
    const { user: authUser, isLoaded: isClerkLoaded } = useUser();

    // STATE MANAGEMENT
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserData, setCurrentUserData] = useState<User | null>(null);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [resourceSections, setResourceSections] = useState<ResourceSection[]>([]);
    const [dailySurprises, setDailySurprises] = useState<DailySurprise[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [appTheme, setAppTheme] = useState<AppTheme | null>(null);
    const [appSettings, setAppSettings] = useState<AppSettings | null>({ marcoAiLaunchStatus: 'countdown' });
    const [globalGifts, setGlobalGifts] = useState<GlobalGift[]>([]);
    const [featureLocks, setFeatureLocks] = useState<Record<LockableFeature['id'], FeatureLock> | null>(null);
    const [loading, setLoading] = useState(true);
    
    const activeGlobalGift = useMemo(() => globalGifts.find(g => g.isActive) || null, [globalGifts]);

    // EFFECT: Determine if the logged-in user is an admin or super admin
    useEffect(() => {
        if (isClerkLoaded && authUser && currentUserData) {
            setIsAdmin(currentUserData.isAdmin ?? false);
            setIsSuperAdmin(currentUserData.uid === SUPER_ADMIN_UID);
        } else {
            setIsAdmin(false);
            setIsSuperAdmin(false);
        }
    }, [isClerkLoaded, authUser, currentUserData]);

    // EFFECT: Listen for real-time updates to the ALL users collection (for Admin Panel)
    useEffect(() => {
        const usersCol = collection(db, 'users');
        const q = query(usersCol);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
            setUsers(usersList);
        });
        return () => unsubscribe();
    }, []);

    // EFFECT: Listen for real-time updates for the CURRENTLY LOGGED-IN user's data (for credits, etc.)
    useEffect(() => {
        if (!isClerkLoaded) {
            setLoading(true);
            return;
        }

        if (!authUser) {
            setCurrentUserData(null);
            setLoading(false);
            return;
        }

        const userDocRef = doc(db, 'users', authUser.id);
        const unsubscribe = onSnapshot(userDocRef, async (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                let userData = { id: doc.id, ...data } as User;
                
                // --- Sync Clerk data ---
                const updates: Partial<User> = {};
                let hasProfileUpdates = false;

                const clerkFullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ');
                const clerkDisplayName = clerkFullName || authUser.username;

                if (clerkDisplayName && data.displayName !== clerkDisplayName) {
                    updates.displayName = clerkDisplayName;
                    hasProfileUpdates = true;
                }
                
                if (data.photoURL !== authUser.imageUrl) {
                    updates.photoURL = authUser.imageUrl;
                    hasProfileUpdates = true;
                }
                
                // --- Daily Streak Logic ---
                const todayStr = format(new Date(), 'yyyy-MM-dd');
                if (data.lastStreakCheck !== todayStr) {
                    const lastCheckDate = data.lastStreakCheck ? new Date(data.lastStreakCheck) : null;
                    const currentStreak = data.streak || 0;
                    
                    if (lastCheckDate && isYesterday(lastCheckDate)) {
                        // Continued streak
                        const newStreak = currentStreak + 1;
                        updates.streak = newStreak;
                        if (newStreak > (data.longestStreak || 0)) {
                            updates.longestStreak = newStreak;
                        }
                        // Award credits based on new streak
                        if (newStreak > 0 && newStreak % 30 === 0) {
                            updates.credits = increment(100); // 30-day bonus
                        } else if (newStreak > 0 && newStreak % 5 === 0) {
                            updates.credits = increment(50); // 5-day bonus
                        }
                    } else {
                        // Streak is broken or first login ever
                        updates.streak = 1;
                    }
                    updates.lastStreakCheck = todayStr;
                    hasProfileUpdates = true;
                }
                
                if (hasProfileUpdates) {
                    await updateDoc(userDocRef, updates);
                    userData = { ...userData, ...updates };
                }
                
                setCurrentUserData(userData);

            } else {
                const clerkFullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ');
                const newUser: User = {
                    id: authUser.id,
                    uid: authUser.id,
                    displayName: clerkFullName || authUser.username || 'New User',
                    email: authUser.primaryEmailAddress?.emailAddress || '',
                    photoURL: authUser.imageUrl,
                    isBlocked: false,
                    credits: 100,
                    isAdmin: false,
                    isVip: false,
                    isGM: false,
                    friends: [],
                    unlockedResourceSections: [],
                    unlockedFeatures: [],
                    hasAiAccess: false,
                    focusSessionsCompleted: 0,
                    dailyTasksCompleted: 0,
                    totalStudyTime: 0,
                    freeRewards: 0,
                    freeGuesses: 0,
                    streak: 1,
                    longestStreak: 1,
                    lastStreakCheck: format(new Date(), 'yyyy-MM-dd'),
                    referralUsed: false,
                    gameHighScores: {
                        memoryGame: 0,
                        emojiQuiz: 0,
                        dimensionShift: 0,
                        subjectSprint: 0,
                        flappyMind: 0,
                    },
                };
                setDoc(userDocRef, newUser).then(() => {
                  setCurrentUserData(newUser);
                });
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching user data:", error);
            setLoading(false);
        });
        return () => unsubscribe();
        
    }, [authUser, isClerkLoaded]);
    
    // EFFECT: Listen for global data (announcements, resources, polls, etc.)
    useEffect(() => {
        const processSnapshot = <T extends { id: string; createdAt?: any }>(snapshot: any): T[] => {
            return snapshot.docs.map((doc: any) => {
                const data = doc.data();
                const createdAt = data.createdAt;
                const date = (createdAt?.toDate) ? createdAt.toDate() : (createdAt ? new Date(createdAt) : new Date());
                return { id: doc.id, ...data, createdAt: date } as T;
            });
        };
        const processTicketSnapshot = (snapshot: any): SupportTicket[] => {
             return snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt, // Keep as Timestamp
                } as SupportTicket;
            });
        };


        const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const resourcesQuery = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
        const resourceSectionsQuery = query(collection(db, 'resourceSections'), orderBy('createdAt', 'desc'));
        const dailySurprisesQuery = query(collection(db, 'dailySurprises'), orderBy('createdAt', 'asc'));
        const pollsQuery = query(collection(db, 'polls'), where('isActive', '==', true), limit(1));
        const appConfigRef = doc(db, 'appConfig', 'settings');
        const giftsQuery = query(collection(db, 'globalGifts'), orderBy('createdAt', 'desc'));
        const ticketsQuery = query(collection(db, 'supportTickets'), orderBy('createdAt', 'desc'));
        const featureLocksRef = doc(db, 'appConfig', 'featureLocks');

        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => setAnnouncements(processSnapshot<Announcement>(snapshot)));
        const unsubResources = onSnapshot(resourcesQuery, (snapshot) => setResources(processSnapshot<Resource>(snapshot)));
        const unsubSections = onSnapshot(resourceSectionsQuery, (snapshot) => setResourceSections(processSnapshot<ResourceSection>(snapshot)));
        const unsubDailySurprises = onSnapshot(dailySurprisesQuery, (snapshot) => setDailySurprises(processSnapshot<DailySurprise>(snapshot)));
        const unsubTickets = onSnapshot(ticketsQuery, (snapshot) => setSupportTickets(processTicketSnapshot(snapshot)));
        const unsubPolls = onSnapshot(pollsQuery, (snapshot) => {
            if (!snapshot.empty) {
                const pollDoc = snapshot.docs[0];
                const data = pollDoc.data();
                const createdAt = data.createdAt;
                const date = (createdAt?.toDate) ? createdAt.toDate() : (createdAt ? new Date(createdAt) : new Date());
                setActivePoll({ id: pollDoc.id, ...data, createdAt: date } as Poll);
            } else {
                setActivePoll(null);
            }
        });
        const unsubAppSettings = onSnapshot(appConfigRef, (doc) => {
            if (doc.exists()) {
                setAppSettings(doc.data() as AppSettings);
            }
        });
        const unsubGifts = onSnapshot(giftsQuery, (snapshot) => setGlobalGifts(processSnapshot<GlobalGift>(snapshot)));
        const unsubLocks = onSnapshot(featureLocksRef, (doc) => {
            if (doc.exists()) {
                setFeatureLocks(doc.data() as Record<LockableFeature['id'], FeatureLock>);
            }
        });


        return () => {
            unsubAnnouncements();
            unsubResources();
            unsubPolls();
            unsubDailySurprises();
            unsubSections();
            unsubAppSettings();
            unsubGifts();
            unsubTickets();
            unsubLocks();
        };
    }, []);


    // FUNCTIONS: Actions that modify data
    const makeUserAdmin = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isAdmin: true });
    };

    const removeUserAdmin = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isAdmin: false });
    };
    
    const makeUserVip = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isVip: true });
    };

    const removeUserVip = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isVip: false });
    };

    const makeUserGM = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isGM: true });
    };

    const removeUserGM = async (uid: string) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isGM: false });
    };

    const toggleUserBlock = async (uid: string, isBlocked: boolean) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isBlocked: !isBlocked });
    };

    const addCreditsToUser = async (uid: string, amount: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { credits: increment(amount) });
    };
    
    const giftCreditsToAllUsers = async (amount: number) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
        const batch = writeBatch(db);
        usersSnapshot.forEach(userDoc => {
            batch.update(userDoc.ref, { credits: increment(amount) });
        });
        await batch.commit();
    };

    const addFreeSpinsToUser = async (uid: string, amount: number) => {
        if (!uid || !Number.isFinite(amount) || amount <= 0) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { freeRewards: increment(amount) });
    };
    
    const addSpinsToAllUsers = async (amount: number) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
        const batch = writeBatch(db);
        usersSnapshot.forEach(userDoc => {
            batch.update(userDoc.ref, { freeRewards: increment(amount) });
        });
        await batch.commit();
    };

    const addFreeGuessesToUser = async (uid: string, amount: number) => {
        if (!uid || !Number.isFinite(amount) || amount <= 0) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { freeGuesses: increment(amount) });
    };

    const addGuessesToAllUsers = async (amount: number) => {
        if (!Number.isFinite(amount) || amount <= 0) return;
        const usersSnapshot = await getDocs(query(collection(db, 'users'), where('isBlocked', '==', false)));
        const batch = writeBatch(db);
        usersSnapshot.forEach(userDoc => {
            batch.update(userDoc.ref, { freeGuesses: increment(amount) });
        });
        await batch.commit();
    };

    const resetUserCredits = async (uid: string) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { credits: 100 });
    };
    
    const unlockResourceSection = async (uid: string, sectionId: string, cost: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { 
            unlockedResourceSections: arrayUnion(sectionId),
            credits: increment(-cost) 
        });
    };

    const unlockFeatureForUser = async (uid: string, featureId: LockableFeature['id'], cost: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            unlockedFeatures: arrayUnion(featureId),
            credits: increment(-cost)
        });
    };

    const generateAiAccessToken = useCallback(async (uid: string) => {
        if (!uid) return null;
        
        const userRef = doc(db, 'users', uid);
        const tokensRef = collection(db, 'ai_access_tokens');
        
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) return null;

        const isDev = process.env.NODE_ENV === 'development';
        const cost = isDev ? 0 : 1000;
        
        if (userSnap.data().credits < cost) {
            throw new Error("Insufficient credits.");
        }

        // Generate a random token
        const token = [...Array(32)].map(() => Math.random().toString(36)[2]).join('');

        const batch = writeBatch(db);

        // Deduct credits (if not in dev mode) and mark AI access for user
        batch.update(userRef, {
            credits: increment(-cost),
            hasAiAccess: true
        });

        // Store the new token
        batch.set(doc(tokensRef), {
            userId: uid,
            token: token,
            createdAt: serverTimestamp(),
            isUsed: false
        });

        await batch.commit();
        return token;
    }, []);


    const addPerfectedQuiz = async (uid: string, quizId: string) => {
        if(!uid || !quizId) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            perfectedQuizzes: arrayUnion(quizId)
        });
    }

    const incrementQuizAttempt = async (uid: string, quizId: string) => {
        if (!uid || !quizId) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            [`quizAttempts.${quizId}`]: increment(1)
        });
    };
    
    const incrementFocusSessions = async (uid: string) => {
        if(!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { focusSessionsCompleted: increment(1) });
    }

    const claimDailyTaskReward = async (uid: string, amount: number) => {
        if(!uid || amount <= 0) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { 
            credits: increment(amount),
            dailyTasksCompleted: increment(1),
            lastDailyTasksClaim: format(new Date(), 'yyyy-MM-dd')
        });
    }
    
    const claimEliteDailyReward = useCallback(async (uid: string) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            credits: increment(20),
            freeRewards: increment(5),
            freeGuesses: increment(5),
            lastEliteClaim: format(new Date(), 'yyyy-MM-dd')
        });
    }, []);
    
    const updateStudyTime = async (uid: string, totalSeconds: number) => {
        if(!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { totalStudyTime: totalSeconds });
    }

    const updateGameHighScore = async (uid: string, game: 'memoryGame' | 'emojiQuiz' | 'dimensionShift' | 'subjectSprint' | 'flappyMind', score: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        // Only update if the new score is higher
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
            const currentHighScore = userSnap.data().gameHighScores?.[game] || 0;
            if (score > currentHighScore) {
                await updateDoc(userDocRef, {
                    [`gameHighScores.${game}`]: score
                });
            }
        }
    };
    
    const claimDimensionShiftMilestone = async (uid: string, milestone: number): Promise<boolean> => {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as User;
        const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const weekClaims = userData.dimensionShiftClaims?.[weekKey] || [];

        if (weekClaims.includes(milestone)) {
            return false; // Already claimed this week
        }
        
        const MILESTONE_REWARDS: Record<number, number> = { 50: 30, 100: 50, 150: 100, 200: 200 };
        const reward = MILESTONE_REWARDS[milestone];

        if (!reward) return false;

        const newClaims = [...weekClaims, milestone];

        await updateDoc(userDocRef, {
            credits: increment(reward),
            [`dimensionShiftClaims.${weekKey}`]: newClaims
        });

        return true;
    };
    
    const claimFlappyMindMilestone = async (uid: string, milestone: number): Promise<boolean> => {
        const userDocRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userDocRef);

        if (!userSnap.exists()) return false;

        const userData = userSnap.data() as User;
        const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const weekClaims = userData.flappyMindClaims?.[weekKey] || [];
        
        const MILESTONE_REWARDS: Record<number, number> = { 5: 2, 10: 5, 15: 10, 20: 50, 30: 100 };
        const validMilestone = Object.keys(MILESTONE_REWARDS).map(Number).find(m => milestone >= m && !weekClaims.includes(m));

        if (!validMilestone) {
             // Also update high score if it's a new personal best, even if no reward is given
            const currentHighScore = userData.gameHighScores?.flappyMind || 0;
            if (milestone > currentHighScore) {
                 await updateDoc(userDocRef, { [`gameHighScores.flappyMind`]: milestone });
            }
            return false;
        }

        const reward = MILESTONE_REWARDS[validMilestone];
        const newClaims = [...weekClaims, validMilestone];

        await updateDoc(userDocRef, {
            credits: increment(reward),
            [`flappyMindClaims.${weekKey}`]: newClaims,
             [`gameHighScores.flappyMind`]: Math.max(userData.gameHighScores?.flappyMind || 0, milestone),
        });

        return true;
    };

    // Announcement functions
    const addAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, 'announcements'), { ...announcement, createdAt: serverTimestamp() });
    }
    const updateAnnouncement = async (id: string, data: Partial<Announcement>) => await updateDoc(doc(db, 'announcements', id), data);
    const deleteAnnouncement = async (id: string) => await deleteDoc(doc(db, 'announcements', id));

    // Resource Section functions
    const addResourceSection = async (section: Omit<ResourceSection, 'id'|'createdAt'>) => {
        await addDoc(collection(db, 'resourceSections'), { ...section, createdAt: serverTimestamp() });
    };
    const updateResourceSection = async (id: string, data: Partial<Omit<ResourceSection, 'id'|'createdAt'>>) => {
        await updateDoc(doc(db, 'resourceSections', id), data);
    };
    const deleteResourceSection = async (id: string) => {
        const q = query(collection(db, "resources"), where("sectionId", "==", id));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
            batch.delete(doc.ref);
        });
        batch.delete(doc(db, 'resourceSections', id));
        await batch.commit();
    };


    // Unified Resource functions
    const addResource = async (resource: Omit<Resource, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, 'resources'), { ...resource, createdAt: serverTimestamp() });
    }
    const updateResource = async (id: string, data: Partial<Omit<Resource, 'id' | 'createdAt'>>) => {
        await updateDoc(doc(db, 'resources', id), data);
    }
    const deleteResource = async (id: string) => {
        await deleteDoc(doc(db, 'resources', id));
    }
    
    const addDailySurprise = async (surprise: Omit<DailySurprise, 'id' | 'createdAt'>) => {
        await addDoc(collection(db, 'dailySurprises'), { ...surprise, createdAt: serverTimestamp() });
    }
    const deleteDailySurprise = async (id: string) => await deleteDoc(doc(db, 'dailySurprises', id));

    const updateTicketStatus = async (id: string, status: 'new' | 'resolved') => {
        await updateDoc(doc(db, 'supportTickets', id), { status });
    };
    const deleteTicket = async (id: string) => {
        await deleteDoc(doc(db, 'supportTickets', id));
    };

    const updatePoll = async (id: string, data: Partial<Poll>) => {
        const pollDocRef = doc(db, 'polls', id);
        const newResults = data.options?.reduce((acc, option) => {
            acc[option] = 0;
            return acc;
        }, {} as Record<string, number>);

        const batch = writeBatch(db);
        batch.update(pollDocRef, { ...data, results: newResults });
        
        await batch.commit();
    };

    const submitPollVote = async (pollId: string, option: string) => {
        if (!authUser) return;

        const pollRef = doc(db, 'polls', pollId);
        const userRef = doc(db, 'users', authUser.id);

        const batch = writeBatch(db);
        batch.update(pollRef, { [`results.${option}`]: increment(1) });
        batch.update(userRef, { [`votedPolls.${pollId}`]: option });
        await batch.commit();
    };
    
    const submitSupportTicket = useCallback(async (message: string) => {
        if (!authUser || !currentUserData) throw new Error("User not found");
        
        await addDoc(collection(db, 'supportTickets'), {
            userId: authUser.id,
            userName: currentUserData.displayName,
            message: message,
            status: 'new',
            createdAt: serverTimestamp(),
        });
    }, [authUser, currentUserData]);

    const clearGlobalChat = async () => {
        const chatRef = collection(db, 'global_chat');
        const chatSnapshot = await getDocs(chatRef);
        
        const batch = writeBatch(db);
        chatSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    };

    const clearQuizLeaderboard = async () => {
        const usersSnapshot = await getDocs(query(collection(db, 'users')));
        const batch = writeBatch(db);
        usersSnapshot.forEach(userDoc => {
            batch.update(userDoc.ref, { 
                perfectedQuizzes: [],
                quizAttempts: {} 
            });
        });
        await batch.commit();
    }

    const resetWeeklyStudyTime = useCallback(async () => {
        const allUsersSnapshot = await getDocs(collection(db, 'users'));
        const today = new Date();
        const weekStart = startOfWeek(today, { weekStartsOn: 1 }).toISOString();
        const weekEnd = endOfWeek(today, { weekStartsOn: 1 }).toISOString();

        for (const userDoc of allUsersSnapshot.docs) {
            const timeSessionsColRef = collection(db, 'users', userDoc.id, 'timeTrackerSessions');
            const q = query(timeSessionsColRef, where('startTime', '>=', weekStart), where('startTime', '<=', weekEnd));
            
            const sessionsSnapshot = await getDocs(q);
            if (!sessionsSnapshot.empty) {
                const batch = writeBatch(db);
                sessionsSnapshot.forEach(sessionDoc => {
                    batch.delete(sessionDoc.ref);
                });
                await batch.commit();
            }
        }
    }, []);
    
    const resetGameZoneLeaderboard = useCallback(async () => {
        const usersSnapshot = await getDocs(query(collection(db, 'users')));
        const batch = writeBatch(db);
        const resetScores = {
            memoryGame: 0,
            emojiQuiz: 0,
            dimensionShift: 0,
            subjectSprint: 0,
            flappyMind: 0,
        };
        usersSnapshot.forEach(userDoc => {
            batch.update(userDoc.ref, { 
                gameHighScores: resetScores
            });
        });
        await batch.commit();
    }, []);

    const updateAppTheme = async (theme: AppTheme) => {
        const themeDocRef = doc(db, 'appConfig', 'theme');
        await setDoc(themeDocRef, theme);
    }
    
    const updateAppSettings = async (settings: Partial<AppSettings>) => {
        const settingsDocRef = doc(db, 'appConfig', 'settings');
        await setDoc(settingsDocRef, settings, { merge: true });
    };
    
    const sendGlobalGift = async (gift: Omit<GlobalGift, 'id' | 'createdAt' | 'isActive' | 'claimedBy'>) => {
        const newGiftRef = doc(collection(db, 'globalGifts'));
        await setDoc(newGiftRef, {
            ...gift,
            id: newGiftRef.id,
            createdAt: serverTimestamp(),
            isActive: true,
            claimedBy: []
        });
    };

     const deactivateGift = async (giftId: string) => {
        const giftRef = doc(db, 'globalGifts', giftId);
        await updateDoc(giftRef, { isActive: false });
    };

    const claimGlobalGift = async (giftId: string, userId: string) => {
        const giftRef = doc(db, 'globalGifts', giftId);
        const userRef = doc(db, 'users', userId);
        const giftDoc = await getDoc(giftRef);

        if (!giftDoc.exists()) throw new Error("Gift not found.");
        const gift = giftDoc.data() as GlobalGift;

        if (gift.claimedBy?.includes(userId)) return;

        const batch = writeBatch(db);
        
        batch.update(giftRef, { claimedBy: arrayUnion(userId) });
        
        const { credits, scratch, flip } = gift.rewards;
        if (credits > 0) batch.update(userRef, { credits: increment(credits) });
        if (scratch > 0) batch.update(userRef, { freeRewards: increment(scratch) });
        if (flip > 0) batch.update(userRef, { freeGuesses: increment(flip) });
        
        await batch.commit();
    };


    const lockFeature = useCallback(async (featureId: LockableFeature['id'], cost: number) => {
        const featureLocksRef = doc(db, 'appConfig', 'featureLocks');
        await setDoc(featureLocksRef, {
            [featureId]: {
                id: featureId,
                isLocked: true,
                cost: cost,
            }
        }, { merge: true });
    }, []);

    const unlockFeature = useCallback(async (featureId: LockableFeature['id']) => {
        const featureLocksRef = doc(db, 'appConfig', 'featureLocks');
        await setDoc(featureLocksRef, {
            [featureId]: {
                id: featureId,
                isLocked: false,
                cost: 0,
            }
        }, { merge: true });
    }, []);

    // CONTEXT VALUE
    const value: AppDataContextType = {
        isAdmin,
        isSuperAdmin,
        users,
        currentUserData,
        toggleUserBlock,
        addCreditsToUser,
        giftCreditsToAllUsers,
        resetUserCredits,
        addFreeSpinsToUser,
        addSpinsToAllUsers,
        addFreeGuessesToUser,
        addGuessesToAllUsers,
        unlockResourceSection,
        unlockFeatureForUser,
        generateAiAccessToken,
        addPerfectedQuiz,
        incrementQuizAttempt,
        incrementFocusSessions,
        claimDailyTaskReward,
        claimEliteDailyReward,
        updateStudyTime,
        updateGameHighScore,
        claimDimensionShiftMilestone,
        claimFlappyMindMilestone,
        makeUserAdmin,
        removeUserAdmin,
        makeUserVip,
        removeUserVip,
        makeUserGM,
        removeUserGM,
        clearGlobalChat,
        clearQuizLeaderboard,
        resetWeeklyStudyTime,
        resetGameZoneLeaderboard,
        submitSupportTicket,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        resources,
        addResource,
        updateResource,
        deleteResource,
        resourceSections,
        addResourceSection,
        updateResourceSection,
        deleteResourceSection,
        dailySurprises,
        addDailySurprise,
        deleteDailySurprise,
        supportTickets,
        updateTicketStatus,
        deleteTicket,
        loading,
        activePoll,
        updatePoll,
        submitPollVote,
        appTheme: null, // This is deprecated
        updateAppTheme: async () => {}, // Deprecated
        appSettings,
        updateAppSettings,
        globalGifts,
        activeGlobalGift,
        sendGlobalGift,
        deactivateGift,
        claimGlobalGift,
        featureLocks,
        lockFeature,
        unlockFeature,
    };

    return (
        <AppDataContext.Provider value={value}>
            {children}
        </AppDataContext.Provider>
    );
};

// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=
//  CONVENIENCE HOOKS
// =_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=_=

export const useAdmin = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAdmin must be used within an AppDataProvider');
    return context;
};

export const useUsers = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useUsers must be used within an AppDataProvider');
    return context;
};

export const useAnnouncements = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useAnnouncements must be used within an AppDataProvider');
    return context;
};

export const useResources = () => {
    const context = useContext(AppDataContext);
    if (!context) throw new Error('useResources must be used within an AppDataProvider');
    return { 
        ...context,
        allResources: context.resources,
        allSections: context.resourceSections
    };
};

export const usePolls = () => {
    const context = useContext(AppDataContext);
    if(!context) throw new Error('usePolls must be used within an AppDataProvider');
    return context;
}

export const useDailySurprises = () => {
    const context = useContext(AppDataContext);
    if(!context) throw new Error('useDailySurprises must be used within an AppDataProvider');
    return {
        dailySurprises: context.dailySurprises,
        addDailySurprise: context.addDailySurprise,
        deleteDailySurprise: context.deleteDailySurprise,
        loading: context.loading
    };
}
