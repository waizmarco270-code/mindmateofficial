'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, doc, onSnapshot, updateDoc, getDoc, query, setDoc, where, getDocs, increment, writeBatch, orderBy, addDoc, serverTimestamp, deleteDoc, arrayUnion, arrayRemove, limit, Timestamp } from 'firebase/firestore';


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
  perfectedQuizzes?: string[]; // Array of quiz IDs the user got a perfect score on
  quizAttempts?: Record<string, number>; // { quizId: attemptCount }
  isAdmin?: boolean;
  focusSessionsCompleted?: number;
  dailyTasksCompleted?: number;
  totalStudyTime?: number; // in seconds
  lastSpinDate?: string;
  freeSpins?: number;
  spinHistory?: { reward: number | string, date: Timestamp }[];
}

export interface Announcement {
    id: string;
    title: string;
    description: string;
    createdAt: string;
}

export interface ResourceSection {
    id: string;
    name: string;
    description: string;
    unlockCost: number;
    createdAt: Timestamp;
}

export interface Resource {
    id: string;
    title: string;
    description: string;
    url: string;
    sectionId: string; // 'general' or an ID from ResourceSection
    createdAt: string;
}

export interface Poll {
    id: string;
    question: string;
    options: string[];
    results: Record<string, number>;
    isActive: boolean;
    createdAt: string;
}

export interface DailySurprise {
    id: string;
    type: 'quote' | 'fact' | 'meme' | 'quiz';
    text?: string; // For quote/fact
    author?: string; // For quote
    imageUrl?: string; // For meme
    quizQuestion?: string;
    quizOptions?: string[];
    quizCorrectAnswer?: string;
    createdAt: string;
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
    giftCreditsToUser: (uid: string, amount: number) => Promise<void>;
    resetUserCredits: (uid: string) => Promise<void>;
    addFreeSpinsToUser: (uid: string, amount: number) => Promise<void>;
    unlockResourceSection: (uid: string, sectionId: string, cost: number) => Promise<void>;
    addPerfectedQuiz: (uid: string, quizId: string) => Promise<void>;
    incrementQuizAttempt: (uid: string, quizId: string) => Promise<void>;
    incrementFocusSessions: (uid: string) => Promise<void>;
    incrementDailyTasksCompleted: (uid: string) => Promise<void>;
    updateStudyTime: (uid: string, totalSeconds: number) => Promise<void>;
    makeUserAdmin: (uid: string) => Promise<void>;
    removeUserAdmin: (uid: string) => Promise<void>;
    clearGlobalChat: () => Promise<void>;
    
    announcements: Announcement[];
    addAnnouncement: (announcement: Omit<Announcement, 'id' | 'createdAt'>) => Promise<void>;
    updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
    deleteAnnouncement: (id: string) => Promise<void>;
    
    // Unified Resource Management
    resources: Resource[];
    addResource: (resource: Omit<Resource, 'id' | 'createdAt'>) => Promise<void>;
    updateResource: (id: string, data: Partial<Omit<Resource, 'id' | 'createdAt'>>) => Promise<void>;
    deleteResource: (id: string) => Promise<void>;

    // Dynamic Resource Section Management
    resourceSections: ResourceSection[];
    addResourceSection: (section: Omit<ResourceSection, 'id' | 'createdAt'>) => Promise<void>;
    updateResourceSection: (id: string, data: Partial<Omit<ResourceSection, 'id' | 'createdAt'>>) => Promise<void>;
    deleteResourceSection: (id: string) => Promise<void>;
    
    dailySurprises: DailySurprise[];
    addDailySurprise: (surprise: Omit<DailySurprise, 'id' | 'createdAt'>) => Promise<void>;
    deleteDailySurprise: (id: string) => Promise<void>;

    loading: boolean;
    
    activePoll: Poll | null;
    updatePoll: (id: string, data: Partial<Poll>) => Promise<void>;
    submitPollVote: (pollId: string, option: string) => Promise<void>;
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
    const [activePoll, setActivePoll] = useState<Poll | null>(null);
    const [loading, setLoading] = useState(true);

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
        const unsubscribe = onSnapshot(userDocRef, (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                const updates: Partial<User> = {};
                let hasUpdates = false;

                const clerkFullName = [authUser.firstName, authUser.lastName].filter(Boolean).join(' ');
                const clerkDisplayName = clerkFullName || authUser.username;

                if (clerkDisplayName && data.displayName !== clerkDisplayName) {
                    updates.displayName = clerkDisplayName;
                    hasUpdates = true;
                }
                
                if (data.photoURL !== authUser.imageUrl) {
                    updates.photoURL = authUser.imageUrl;
                    hasUpdates = true;
                }

                if (hasUpdates) {
                    updateDoc(userDocRef, updates);
                }
                
                setCurrentUserData({ id: doc.id, ...data, ...updates } as User);

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
                    unlockedResourceSections: [],
                    focusSessionsCompleted: 0,
                    dailyTasksCompleted: 0,
                    totalStudyTime: 0,
                    freeSpins: 0,
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
    
    // EFFECT: Listen for global data (announcements, resources, polls, sections)
    useEffect(() => {
        const processSnapshot = <T extends { id: string; createdAt?: any }>(snapshot: any): T[] => {
            return snapshot.docs.map((doc: any) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
                } as T;
            });
        };

        const announcementsQuery = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
        const resourcesQuery = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
        const resourceSectionsQuery = query(collection(db, 'resourceSections'), orderBy('createdAt', 'desc'));
        const dailySurprisesQuery = query(collection(db, 'dailySurprises'), orderBy('createdAt', 'desc'));
        const pollsQuery = query(collection(db, 'polls'), where('isActive', '==', true), limit(1));

        const unsubAnnouncements = onSnapshot(announcementsQuery, (snapshot) => setAnnouncements(processSnapshot<Announcement>(snapshot)));
        const unsubResources = onSnapshot(resourcesQuery, (snapshot) => setResources(processSnapshot<Resource>(snapshot)));
        const unsubSections = onSnapshot(resourceSectionsQuery, (snapshot) => setResourceSections(processSnapshot<ResourceSection>(snapshot)));
        const unsubDailySurprises = onSnapshot(dailySurprisesQuery, (snapshot) => setDailySurprises(processSnapshot<DailySurprise>(snapshot)));

        const unsubPolls = onSnapshot(pollsQuery, (snapshot) => {
            if (!snapshot.empty) {
                const pollDoc = snapshot.docs[0];
                setActivePoll({ id: pollDoc.id, ...pollDoc.data() } as Poll);
            } else {
                setActivePoll(null);
            }
        });

        return () => {
            unsubAnnouncements();
            unsubResources();
            unsubPolls();
            unsubDailySurprises();
            unsubSections();
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

    const toggleUserBlock = async (uid: string, isBlocked: boolean) => {
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { isBlocked: !isBlocked });
    };

    const addCreditsToUser = async (uid: string, amount: number) => {
        if (!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { credits: increment(amount) });
    };

    const giftCreditsToUser = async (uid: string, amount: number) => {
        if (!uid || !Number.isFinite(amount) || amount <= 0) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { credits: increment(amount) });
    };
    
    const addFreeSpinsToUser = async (uid: string, amount: number) => {
        if (!uid || !Number.isFinite(amount) || amount <= 0) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { freeSpins: increment(amount) });
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

    const incrementDailyTasksCompleted = async (uid: string) => {
        if(!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { dailyTasksCompleted: increment(1) });
    }
    
    const updateStudyTime = async (uid: string, totalSeconds: number) => {
        if(!uid) return;
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, { totalStudyTime: totalSeconds });
    }

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
        // Also delete all resources within this section
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

    const updatePoll = async (id: string, data: Partial<Poll>) => {
        const pollDocRef = doc(db, 'polls', id);
        // When updating the poll, we also need to reset the votes
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
    
    const clearGlobalChat = async () => {
        const chatRef = collection(db, 'global_chat');
        const chatSnapshot = await getDocs(chatRef);
        
        const batch = writeBatch(db);
        chatSnapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
    };

    // CONTEXT VALUE
    const value: AppDataContextType = {
        isAdmin,
        isSuperAdmin,
        users,
        currentUserData,
        toggleUserBlock,
        addCreditsToUser,
        giftCreditsToUser,
        resetUserCredits,
        addFreeSpinsToUser,
        unlockResourceSection,
        addPerfectedQuiz,
        incrementQuizAttempt,
        incrementFocusSessions,
        incrementDailyTasksCompleted,
        updateStudyTime,
        makeUserAdmin,
        removeUserAdmin,
        clearGlobalChat,
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
        loading,
        activePoll,
        updatePoll,
        submitPollVote,
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
    const generalResources = context.resources.filter(r => r.sectionId === 'general');
    const dynamicSections = context.resourceSections;
    const dynamicResources = context.resources.filter(r => r.sectionId !== 'general');
    return { 
        ...context,
        generalResources,
        dynamicSections,
        dynamicResources,
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

      