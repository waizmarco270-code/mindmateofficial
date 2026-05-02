'use client';

import { createContext } from 'react';
import type { User } from '@/hooks/use-admin';

export type GroupRole = 'leader' | 'co-leader' | 'elder' | 'member';

export interface GroupMember {
    uid: string;
    role: GroupRole;
    xpContribution: number; // Total XP this member gave to the clan
    studyContribution: number; // Total seconds this member studied in the clan
}

export interface GroupMessage {
    id: string;
    senderId: string;
    text?: string;
    imageUrl?: string;
    timestamp: Date;
    isPinned?: boolean;
}

export interface Group {
    id: string;
    name: string;
    motto?: string;
    logoUrl?: string | null;
    banner?: string;
    bannerUrl?: string | null; // For custom banners
    createdBy: string;
    createdAt: Date;
    members: GroupMember[];
    memberUids: string[];
    memberDetails?: (User & { role: GroupRole; studyContribution: number })[];
    level: number;
    xp: number;
    todayStudySeconds: number; // Total seconds the whole clan studied today
    lastResetDate?: string; // YYYY-MM-DD to reset todayStudySeconds
    tempMaxLevelExpires?: string; // ISO string for temporary level 5
    lastMessage?: {
        text: string;
        senderId: string;
        timestamp: Date;
    };
    joinMode: 'auto' | 'approval';
    isPublic: boolean;
}

export interface GroupJoinRequest {
    id: string; // doc id
    groupId: string;
    groupName: string;
    clanAdminId: string;
    senderId: string;
    sender: Pick<User, 'uid' | 'displayName' | 'photoURL'>;
    status: 'pending';
    createdAt: Date;
}

export interface GroupsContextType {
    groups: Group[];
    allPublicGroups: Group[];
    joinRequests: GroupJoinRequest[];
    sentJoinRequests: GroupJoinRequest[];
    loading: boolean;
    createGroup: (name: string, memberIds: string[], motto?: string, logoUrl?: string | null, banner?: string) => Promise<string | undefined>;
    updateGroup: (groupId: string, data: Partial<Group>, isRenaming?: boolean, renameCost?: number) => Promise<void>;
    updateMemberRole: (groupId: string, memberId: string, role: GroupRole) => Promise<void>;
    removeMember: (groupId: string, memberId: string) => Promise<void>;
    leaveGroup: (groupId: string) => Promise<void>;
    deleteGroup: (groupId: string) => Promise<void>;
    sendJoinRequest: (group: Group) => Promise<void>;
    approveJoinRequest: (request: GroupJoinRequest) => Promise<void>;
    declineJoinRequest: (requestId: string) => Promise<void>;
    addMemberToAutoJoinClan: (group: Group) => Promise<void>;
    logXp: (groupId: string, amount: number) => Promise<void>;
    applyXpBooster: (groupId: string) => Promise<boolean>;
    applyLevelMaxer: (groupId: string) => Promise<boolean>;
    pinMessage: (groupId: string, messageId: string, status: boolean) => Promise<void>;
}

export const GroupsContext = createContext<GroupsContextType | undefined>(undefined);
