
'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback, useMemo, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { useLocalStorage } from './use-local-storage';
import { useAdmin } from './use-admin';
import { useFriends } from './use-friends';

export interface ChatMetadata {
  id: string;
  friendId: string;
  lastMessage: {
    text: string;
    timestamp: Date;
    senderId: string;
  } | null;
}

interface GlobalChat {
    lastMessage: {
        text: string;
        timestamp: Date;
        senderId: string;
    } | null;
}

interface LastReadTimestamps {
    [chatId: string]: number; 
    global_chat?: number;
    announcements_inbox?: number;
    friend_requests_inbox?: number;
}

interface UnreadMessagesContextType {
  unreadChats: Set<string>;
  chatsMetadata: ChatMetadata[];
  hasUnread: boolean;
  hasInboxUnread: boolean; 
  hasUnreadFrom: (friendId: string) => boolean;
  markAsRead: (friendId: string) => void;
  hasGlobalUnread: boolean;
  markGlobalAsRead: () => void;
  hasUnreadAnnouncements: boolean;
  markAnnouncementsAsRead: () => void;
  hasUnreadFriendRequests: boolean;
  markFriendRequestsAsRead: () => void;
}

const UnreadMessagesContext = createContext<UnreadMessagesContextType | undefined>(undefined);

const getChatId = (uid1: string, uid2: string) => {
  return [uid1, uid2].sort().join('_');
};

export const UnreadMessagesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useUser();
  const { announcements, loading: adminLoading } = useAdmin();
  const { friendRequests, loading: friendsLoading } = useFriends();
  const [chats, setChats] = useState<ChatMetadata[]>([]);
  const [globalChat, setGlobalChat] = useState<GlobalChat>({ lastMessage: null });
  const [lastReadTimestamps, setLastReadTimestamps] = useLocalStorage<LastReadTimestamps>('lastReadTimestamps', {});
  
  // Use a Ref to break the recursive dependency loop
  const timestampsRef = useRef(lastReadTimestamps);
  useEffect(() => {
    timestampsRef.current = lastReadTimestamps;
  }, [lastReadTimestamps]);

  useEffect(() => {
    if (!user) {
      setChats([]);
      return;
    }
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('users', 'array-contains', user.id));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const userChats: ChatMetadata[] = [];
       snapshot.forEach(doc => {
           const data = doc.data();
           const friendId = data.users.find((u: string) => u !== user.id);
           if (data.lastMessage && data.lastMessage.timestamp) {
             userChats.push({
                 id: doc.id,
                 friendId,
                 lastMessage: {
                     ...data.lastMessage,
                     timestamp: (data.lastMessage.timestamp as Timestamp)?.toDate()
                 }
             });
           }
       });
       userChats.sort((a, b) => (b.lastMessage?.timestamp.getTime() || 0) - (a.lastMessage?.timestamp.getTime() || 0));
       setChats(userChats);
    });

    return () => unsubscribe();
  }, [user]);
  
  useEffect(() => {
      const globalChatRef = collection(db, 'global_chat');
      const q = query(globalChatRef, orderBy('timestamp', 'desc'), limit(1));

      const unsubscribe = onSnapshot(q, (snapshot) => {
          if(!snapshot.empty) {
              const lastMessageDoc = snapshot.docs[0];
              const data = lastMessageDoc.data();
               if (data && data.timestamp) {
                    setGlobalChat({
                        lastMessage: {
                            ...data,
                            timestamp: (data.timestamp as Timestamp).toDate(),
                        } as any,
                    });
               }
          }
      });
      return () => unsubscribe();
  }, []);

  const unreadChats = useMemo(() => {
      const unread = new Set<string>();
      if (!user) return unread;

      chats.forEach(chat => {
          if(chat.lastMessage && chat.lastMessage.senderId !== user.id) {
              const lastReadTime = lastReadTimestamps[chat.id] || 0;
              if(chat.lastMessage.timestamp.getTime() > lastReadTime) {
                  unread.add(chat.id);
              }
          }
      });
      return unread;
  }, [chats, user, lastReadTimestamps]);

  const hasGlobalUnread = useMemo(() => {
    if (!user || !globalChat.lastMessage) return false;
    if (globalChat.lastMessage.senderId === user.id) return false;
    const lastReadTime = lastReadTimestamps['global_chat'] || 0;
    return globalChat.lastMessage.timestamp.getTime() > lastReadTime;
  }, [globalChat, user, lastReadTimestamps]);

  const hasUnreadAnnouncements = useMemo(() => {
      if (adminLoading || announcements.length === 0) return false;
      const latestAnnouncementTime = announcements[0].createdAt.getTime();
      const lastInboxCheckTime = lastReadTimestamps['announcements_inbox'] || 0;
      return latestAnnouncementTime > lastInboxCheckTime;
  }, [announcements, adminLoading, lastReadTimestamps]);
  
  const hasUnreadFriendRequests = useMemo(() => {
      if (friendsLoading || friendRequests.length === 0) return false;
      const latestRequestTime = new Date(friendRequests[0].createdAt).getTime();
      const lastCheckTime = lastReadTimestamps['friend_requests_inbox'] || 0;
      return latestRequestTime > lastCheckTime;
  }, [friendRequests, friendsLoading, lastReadTimestamps]);

  const hasInboxUnread = useMemo(() => {
      return hasUnreadAnnouncements || hasUnreadFriendRequests;
  }, [hasUnreadAnnouncements, hasUnreadFriendRequests]);

  const markAsRead = useCallback((friendId: string) => {
    if (!user) return;
    const chatId = getChatId(user.id, friendId);
    setLastReadTimestamps(prev => {
        if (prev[chatId] >= Date.now()) return prev;
        return { ...prev, [chatId]: Date.now() };
    });
  }, [user, setLastReadTimestamps]);
  
  const markGlobalAsRead = useCallback(() => {
      setLastReadTimestamps(prev => {
          if (prev.global_chat >= Date.now()) return prev;
          return { ...prev, global_chat: Date.now() };
      });
  }, [setLastReadTimestamps]);

  const markAnnouncementsAsRead = useCallback(() => {
    if (announcements.length > 0) {
        const latestTime = announcements[0].createdAt.getTime();
        if (latestTime > (timestampsRef.current['announcements_inbox'] || 0)) {
            setLastReadTimestamps(prev => ({
                ...prev,
                announcements_inbox: latestTime
            }));
        }
    }
  }, [announcements, setLastReadTimestamps]);
  
  const markFriendRequestsAsRead = useCallback(() => {
    if (friendRequests.length > 0) {
        const latestTime = new Date(friendRequests[0].createdAt).getTime();
        if (latestTime > (timestampsRef.current['friend_requests_inbox'] || 0)) {
            setLastReadTimestamps(prev => ({
                ...prev,
                friend_requests_inbox: latestTime
            }));
        }
    }
  }, [friendRequests, setLastReadTimestamps]);

  const hasUnreadFrom = useCallback((friendId: string) => {
       if (!user) return false;
       const chatId = getChatId(user.id, friendId);
       return unreadChats.has(chatId);
  }, [user, unreadChats]);

  const contextValue = useMemo(() => ({
    unreadChats,
    chatsMetadata: chats,
    hasUnread: unreadChats.size > 0 || hasGlobalUnread || hasInboxUnread,
    hasInboxUnread,
    hasUnreadFrom,
    markAsRead,
    hasGlobalUnread,
    markGlobalAsRead,
    hasUnreadAnnouncements,
    markAnnouncementsAsRead,
    hasUnreadFriendRequests,
    markFriendRequestsAsRead,
  }), [
    unreadChats, chats, hasGlobalUnread, hasInboxUnread, hasUnreadFrom, 
    markAsRead, markGlobalAsRead, hasUnreadAnnouncements, 
    markAnnouncementsAsRead, hasUnreadFriendRequests, markFriendRequestsAsRead
  ]);

  return (
    <UnreadMessagesContext.Provider value={contextValue}>
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useUnreadMessages = () => {
  const context = useContext(UnreadMessagesContext);
  if (context === undefined) {
    throw new Error('useUnreadMessages must be used within an UnreadMessagesProvider');
  }
  return context;
};
