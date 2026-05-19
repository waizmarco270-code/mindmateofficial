'use client';

import { useMemo } from 'react';
import { useUsers, User, SUPER_ADMIN_UID, BadgeType } from '@/hooks/use-admin';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, subWeeks } from 'date-fns';

export type UserWithStats = User & { 
    totalScore: number; 
    weeklyTime: number; 
    monthlyTime: number;
    prevWeeklyTime: number;
    entertainmentTotalScore: number;
    breakdown: {
        creditsPoints: number;
        studyPoints: number;
        streakPoints: number;
        isolationPoints: number;
        badgePoints: number;
        isolationLabel: string;
        badgeCount: number;
    }
};

function getBadgeCount(user: User) {
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
    let count = 0;
    if (isSuperAdmin) count++;
    if (user.isCoDev) count++;
    if (user.isAdmin) count++;
    if (user.isVip) count++;
    if (user.isGM) count++;
    if (user.isChallenger) count++;
    if (user.isEarlyBird) count++;
    if (user.isNightOwl) count++;
    if (user.isKnowledgeKnight) count++;
    if (user.isStreaker) count++;
    if (user.isIsolater) count++;
    if (user.isIsoWarrior) count++;
    if (user.isWarrior) count++;
    if (user.isIsoMaster) count++;
    if (user.isSovereign) count++;
    return count;
}

export function useLeaderboardData() {
    const { users, loading: usersLoading } = useUsers();
    const { sessions: allSessions, pomodoroSessions, loading: timeLoading } = useTimeTracker();

    const stats = useMemo(() => {
        const now = new Date();
        const thisWeek = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        const lastWeek = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
        const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
        
        const userStats: { [uid: string]: { weekly: number, monthly: number, prevWeekly: number } } = {};
        
        const ensureUser = (uid: string) => {
            if (!userStats[uid]) userStats[uid] = { weekly: 0, monthly: 0, prevWeekly: 0 };
        };

        allSessions.forEach(s => {
            ensureUser(s.userId);
            const date = parseISO(s.startTime);
            const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;

            if (isWithinInterval(date, thisWeek)) userStats[s.userId].weekly += dur;
            if (isWithinInterval(date, lastWeek)) userStats[s.userId].prevWeekly += dur;
            if (isWithinInterval(date, thisMonth)) userStats[s.userId].monthly += dur;
        });
        
        pomodoroSessions.forEach(s => {
            ensureUser(s.userId);
            const date = parseISO(s.completedAt);
            if (isWithinInterval(date, thisWeek)) userStats[s.userId].weekly += s.duration;
            if (isWithinInterval(date, lastWeek)) userStats[s.userId].prevWeekly += s.duration;
            if (isWithinInterval(date, thisMonth)) userStats[s.userId].monthly += s.duration;
        });

        return userStats;
    }, [allSessions, pomodoroSessions]);

    const processedUsers = useMemo(() => {
        return users
            .filter(u => !u.isBlocked)
            .map(user => {
                const credits = user.credits || 0;
                const studySeconds = user.totalStudyTime || 0;
                const streak = user.streak || 0;
                const badgeCount = getBadgeCount(user);
                
                const creditsPoints = Math.round(credits / 2);
                const studyPoints = Math.round(studySeconds / 60); 
                const streakPoints = streak * 10; 
                const badgePoints = badgeCount * 100;
                
                let isolationPoints = 0;
                let isolationLabel = 'Standard Scholar';
                if (user.isSovereign) { isolationPoints = 1000000; isolationLabel = 'Sovereign'; }
                else if (user.isIsoMaster) { isolationPoints = 300000; isolationLabel = 'ISO-Master'; }
                else if (user.isWarrior) { isolationPoints = 30000; isolationLabel = 'Warrior'; }
                else if (user.isIsoWarrior) { isolationPoints = 15000; isolationLabel = 'ISO-Warrior'; }
                else if (user.isIsolater) { isolationPoints = 5000; isolationLabel = 'Isolater'; }

                const totalScore = creditsPoints + studyPoints + streakPoints + isolationPoints + badgePoints;
                const uStats = stats[user.uid] || { weekly: 0, monthly: 0, prevWeekly: 0 };

                return { 
                    ...user, 
                    totalScore: Math.round(totalScore), 
                    weeklyTime: uStats.weekly,
                    monthlyTime: uStats.monthly,
                    prevWeeklyTime: uStats.prevWeekly,
                    entertainmentTotalScore: 0, // Simplified for this redesign
                    breakdown: {
                        creditsPoints,
                        studyPoints,
                        streakPoints,
                        isolationPoints,
                        badgePoints,
                        isolationLabel,
                        badgeCount
                    }
                } as UserWithStats;
            });
    }, [users, stats]);

    return {
        processedUsers,
        loading: usersLoading || timeLoading
    };
}
