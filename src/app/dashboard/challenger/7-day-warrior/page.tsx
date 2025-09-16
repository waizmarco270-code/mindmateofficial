
'use client';
import ChallengerPage from '@/components/challenger/challenger-page';
import type { ChallengeConfig } from '@/hooks/use-challenges';

const config: ChallengeConfig = {
    id: '7-Day Warrior',
    title: '7-Day Warrior',
    duration: 7, // days
    entryFee: 50,
    reward: 300,
    description: "A week-long sprint to build discipline and kickstart your comeback.",
    dailyGoals: [
        { id: 'studyTime', description: 'Study for 5+ hours', target: 5 * 3600 }, // 5 hours in seconds
        { id: 'focusSession', description: 'Complete a 2 or 3-hour Focus Session', target: 1 },
        { id: 'tasks', description: 'Complete all daily tasks', target: 1 },
        { id: 'checkIn', description: 'Check-in before midnight', target: 1 },
    ],
    rules: [
        "You must complete all daily goals before midnight each day.",
        "Failure to complete any goal for a day means the challenge is failed.",
        "The entry fee is refunded along with the reward upon successful completion.",
        "This challenge can only be attempted once per month.",
        "Any attempt to cheat the system will result in a credit penalty and a ban from challenges."
    ],
    eliteBadgeDays: 7
};

export default function SevenDayWarriorPage() {
    return <ChallengerPage config={config} />;
}
