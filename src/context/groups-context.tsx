

'use client';

import { createContext } from 'react';
import type { User } from '@/hooks/use-admin';

export interface GroupMessage {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: Date;
}

export interface Group {
    id: string;
    name: string;
    motto?: string;
    logoUrl?: string | null;
    banner?: string;
    createdBy: string;
    createdAt: Date;
    members: string[];
    memberDetails?: User[];
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Date;
    };
}

export interface GroupsContextType {
    groups: Group[];
    loading: boolean;
    createGroup: (name: string, memberIds: string[], motto?: string, logoUrl?: string | null, banner?: string) => Promise<void>;
    updateGroup: (groupId: string, data: Partial<Group>, isRenaming?: boolean, renameCost?: number) => Promise<void>;
    removeMember: (groupId: string, memberId: string) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
}

export const GroupsContext = createContext<GroupsContextType | undefined>(undefined);
