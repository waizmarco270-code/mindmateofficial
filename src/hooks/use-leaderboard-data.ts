
'use client';

import { useMemo } from 'react';
import { useUsers, User, SUPER_ADMIN_UID } from '@/hooks/use-admin';
import { useTimeTracker } from '@/hooks/use-time-tracker';
import { startOfWeek, endOfWeek, parseISO, isWithinInterval, subWeeks } from 'date-fns';

export type UserWithStats = User & { 
    totalScore: number; 
    weeklyTime: number; 
    prevWeeklyTime: number;
    entertainmentTotalScore: number;
    emojiQuizHighScore: number;
    memoryGameHighScore: number;
    dimensionShiftHighScore: number;
    subjectSprintHighScore: number;
    flappyMindHighScore: number;
    astroAscentHighScore: number;
    mathematicsLegendHighScore: number;
    elementQuestTotalScore: number;
    prevWeekEntertainmentTotalScore: number;
    weeklySubjectBreakdown: { [subjectName: string]: number };
    weeklyPomodoroBreakdown: {
      focus: number;
      shortBreak: number;
      longBreak: number;
      total: number;
    };
    // Score Breakdown Components
    breakdown: {
        creditsPoints: number;
        studyPoints: number;
        streakPoints: number;
        isolationPoints: number;
        disciplinePoints: number;
        isolationLabel: string;
    }
};

export function useLeaderboardData() {
    const { users, loading: usersLoading } = useUsers();
    const { sessions: allSessions, pomodoroSessions, loading: timeLoading } = useTimeTracker();

    const weeklyStats = useMemo(() => {
        const now = new Date();
        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 });
        const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        
        const stats: { [uid: string]: any } = {};
        
        const initializeUserStats = (userId: string) => {
            if (!stats[userId]) {
                stats[userId] = { 
                    thisWeek: { totalTime: 0, subjects: {}, pomodoro: { focus: 0, shortBreak: 0, longBreak: 0, total: 0 } }, 
                    lastWeek: { totalTime: 0 } 
                };
            }
        };

        allSessions.forEach(session => {
            const userId = session.userId;
            initializeUserStats(userId);
            const sessionDate = parseISO(session.startTime);
            const duration = (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000;

            if (isWithinInterval(sessionDate, { start: thisWeekStart, end: thisWeekEnd })) {
                stats[userId].thisWeek.totalTime += duration;
                stats[userId].thisWeek.subjects[session.subjectName] = (stats[userId].thisWeek.subjects[session.subjectName] || 0) + duration;
            } else if (isWithinInterval(sessionDate, { start: lastWeekStart, end: lastWeekEnd })) {
                 stats[userId].lastWeek.totalTime += duration;
            }
        });
        
        pomodoroSessions.forEach(session => {
            const userId = session.userId;
            initializeUserStats(userId);
            const sessionDate = parseISO(session.completedAt);
            const duration = session.duration;
            
            if (isWithinInterval(sessionDate, { start: thisWeekStart, end: thisWeekEnd })) {
                stats[userId].thisWeek.totalTime += duration; 
                stats[userId].thisWeek.pomodoro.total += duration;
                if(session.type === 'focus') stats[userId].thisWeek.pomodoro.focus += duration;
                if(session.type === 'shortBreak') stats[userId].thisWeek.pomodoro.shortBreak += duration;
                if(session.type === 'longBreak') stats[userId].thisWeek.pomodoro.longBreak += duration;
            } else if (isWithinInterval(sessionDate, { start: lastWeekStart, end: lastWeekEnd })) {
                 stats[userId].lastWeek.totalTime += duration;
            }
        });

        return stats;
    }, [allSessions, pomodoroSessions]);

    const processedUsers = useMemo(() => {
        return users
            .filter(u => !u.isBlocked)
            .map(user => {
                const credits = user.credits || 0;
                const studyTimeSeconds = user.totalStudyTime || 0;
                const streak = user.streak || 0;
                
                // SOVEREIGN SCORING LOGIC v2.5 (MASTER DIRECTIVE)
                const creditsPoints = Math.round(credits / 2);
                const studyPoints = Math.round(studyTimeSeconds / 60); // 1 point per minute
                const streakPoints = streak * 10; // 10 points per day
                const disciplinePoints = 0; 
                
                let isolationPoints = 0;
                let isolationLabel = 'None';

                // MASTER ISOLATION TIERS
                if (user.isSovereign) {
                    isolationPoints = 1000000; 
                    isolationLabel = '1-Year Sovereign';
                } else if (user.isIsoMaster) {
                    isolationPoints = 300000; 
                    isolationLabel = '6-Month ISO-Master';
                } else if (user.isWarrior) {
                    isolationPoints = 30000; 
                    isolationLabel = '30-Day Warrior';
                } else if (user.isIsoWarrior) {
                    isolationPoints = 15000; 
                    isolationLabel = '14-Day ISO-Warrior';
                } else if (user.isIsolater) {
                    isolationPoints = 5000; 
                    isolationLabel = '7-Day Isolater';
                }

                const totalScore = creditsPoints + studyPoints + streakPoints + isolationPoints + disciplinePoints;
                                   
                const userWeeklyStats = weeklyStats[user.uid] || { 
                    thisWeek: { totalTime: 0, subjects: {}, pomodoro: { focus: 0, shortBreak: 0, longBreak: 0, total: 0 } }, 
                    lastWeek: { totalTime: 0 } 
                };
                
                const emojiQuizHighScore = user.gameHighScores?.emojiQuiz || 0;
                const memoryGameHighScore = user.gameHighScores?.memoryGame || 0;
                const dimensionShiftHighScore = user.gameHighScores?.dimensionShift || 0;
                const subjectSprintHighScore = user.gameHighScores?.subjectSprint || 0;
                const flappyMindHighScore = user.gameHighScores?.flappyMind || 0;
                const astroAscentHighScore = user.gameHighScores?.astroAscent || 0;
                const mathematicsLegendHighScore = user.gameHighScores?.mathematicsLegend || 0;
                const { s = 0, p = 0, d = 0, f = 0 } = user.elementQuestScores || {};
                const elementQuestTotalScore = s + p + d + f;
                
                const entertainmentTotalScore = 
                    (emojiQuizHighScore * 1.2) + 
                    memoryGameHighScore + 
                    (dimensionShiftHighScore * 1.5) + 
                    (subjectSprintHighScore * 1.1) + 
                    flappyMindHighScore + 
                    (astroAscentHighScore * 1.3) + 
                    (mathematicsLegendHighScore * 1.4) + 
                    (elementQuestTotalScore * 0.5);

                const prevWeekEntertainmentTotalScore = (user.gameHighScores?.emojiQuiz || 0) + (user.gameHighScores?.memoryGame || 0) + (user.gameHighScores?.dimensionShift || 0) + (user.gameHighScores?.subjectSprint || 0) + (user.gameHighScores?.flappyMind || 0) + (user.gameHighScores?.astroAscent || 0) + (user.gameHighScores?.mathematicsLegend || 0) + elementQuestTotalScore;

                return { 
                    ...user, 
                    totalScore: Math.round(totalScore), 
                    weeklyTime: userWeeklyStats.thisWeek.totalTime,
                    prevWeeklyTime: userWeeklyStats.lastWeek.totalTime,
                    weeklySubjectBreakdown: userWeeklyStats.thisWeek.subjects,
                    weeklyPomodoroBreakdown: userWeeklyStats.thisWeek.pomodoro,
                    entertainmentTotalScore: Math.round(entertainmentTotalScore),
                    emojiQuizHighScore,
                    memoryGameHighScore,
                    dimensionShiftHighScore,
                    subjectSprintHighScore,
                    flappyMindHighScore,
                    astroAscentHighScore,
                    mathematicsLegendHighScore,
                    elementQuestTotalScore,
                    prevWeekEntertainmentTotalScore: Math.round(prevWeekEntertainmentTotalScore),
                    breakdown: {
                        creditsPoints,
                        studyPoints,
                        streakPoints,
                        isolationPoints,
                        disciplinePoints,
                        isolationLabel
                    }
                };
            });
    }, [users, weeklyStats]);

    return {
        processedUsers,
        loading: usersLoading || timeLoading
    };
}
