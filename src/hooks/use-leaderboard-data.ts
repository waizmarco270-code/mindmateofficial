
'use client';

import { useMemo } from 'react';
import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO, isWithinInterval, subWeeks } from 'date-fns';

export type UserWithStats = User & { 
    totalScore: number; 
    weeklyTime: number; 
    monthlyTime: number;
    prevWeeklyTime: number;
    weeklyScore: number;
    monthlyScore: number;
    breakdown: {
        isolationLabel: string;
        badgeCount: number;
    }
};

function getBadgeCount(user: User) {
    const isSuperAdmin = user.uid === SUPER_ADMIN_UID;
    let count = 0;
    if (isSuperAdmin) count++;
    if (user.isPlusMember) count++;
    if (user.isCoDev) count++;
    if (user.isAdmin) count++;
    if (user.isVip) count++;
    if (user.isGM) count++;
    if (user.isChallenger) count++;
    if (user.isChampion) count++;
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
    const { sessions: allSessions, loading: timeLoading } = useTimeTracker();

    const stats = useMemo(() => {
        const now = new Date();
        const thisWeek = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        const lastWeek = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
        const thisMonth = { start: startOfMonth(now), end: endOfMonth(now) };
        
        const userStats: { [uid: string]: { weeklyTime: number, monthlyTime: number, prevWeeklyTime: number, weeklyCredits: number, monthlyCredits: number } } = {};
        
        const ensureUser = (uid: string) => {
            if (!userStats[uid]) userStats[uid] = { weeklyTime: 0, monthlyTime: 0, prevWeeklyTime: 0, weeklyCredits: 0, monthlyCredits: 0 };
        };

        // 1. Calculate Study Times
        allSessions.forEach(s => {
            ensureUser(s.userId);
            const date = parseISO(s.startTime);
            const dur = (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 1000;

            if (isWithinInterval(date, thisWeek)) userStats[s.userId].weeklyTime += dur;
            if (isWithinInterval(date, lastWeek)) userStats[s.userId].prevWeeklyTime += dur;
            if (isWithinInterval(date, thisMonth)) userStats[s.userId].monthlyTime += dur;
        });

        // 2. Calculate Credits Earned in period
        users.forEach(user => {
            ensureUser(user.uid);
            const history = user.rewardHistory || [];
            history.forEach(reward => {
                const date = reward.date.toDate();
                const amount = typeof reward.reward === 'number' ? reward.reward : 0;
                if (isWithinInterval(date, thisWeek)) userStats[user.uid].weeklyCredits += amount;
                if (isWithinInterval(date, thisMonth)) userStats[user.uid].monthlyCredits += amount;
            });
            // Also check transactions
            const txs = user.transactions || [];
            txs.forEach(tx => {
                const date = parseISO(tx.date);
                if (isWithinInterval(date, thisWeek)) userStats[user.uid].weeklyCredits += (tx.credits || 0);
                if (isWithinInterval(date, thisMonth)) userStats[user.uid].monthlyCredits += (tx.credits || 0);
            });
        });

        return userStats;
    }, [allSessions, users]);

    const processedUsers = useMemo(() => {
        return users
            .filter(u => !u.isBlocked)
            .map(user => {
                const uStats = stats[user.uid] || { weeklyTime: 0, monthlyTime: 0, prevWeeklyTime: 0, weeklyCredits: 0, monthlyCredits: 0 };
                
                // All-Time Score Formula: (Credits/2) + (StudyMinutes) + (Streak*10) + (BadgeCount*100) + (IsolationPoints)
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

                // Weekly/Monthly Score Formula: (Study Minutes) + (Credits Earned)
                const weeklyScore = Math.round((uStats.weeklyTime / 60) + uStats.weeklyCredits);
                const monthlyScore = Math.round((uStats.monthlyTime / 60) + uStats.monthlyCredits);

                return { 
                    ...user, 
                    totalScore: Math.round(totalScore), 
                    weeklyTime: uStats.weeklyTime,
                    monthlyTime: uStats.monthlyTime,
                    prevWeeklyTime: uStats.prevWeeklyTime,
                    weeklyScore,
                    monthlyScore,
                    entertainmentTotalScore: totalScore, // Using totalScore as entertainment basis
                    breakdown: {
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
