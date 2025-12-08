
'use client';

import { createContext } from 'react';
import type { Group } from '@/hooks/use-groups';

export interface GroupsContextType {
    groups: Group[];
    loading: boolean;
    createGroup: (name: string, memberIds: string[]) => Promise<void>;
}

export const GroupsContext = createContext<GroupsContextType | undefined>(undefined);
