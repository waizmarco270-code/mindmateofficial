
'use client';
import ChallengerPage from '@/components/challenger/challenger-page';
import type { ChallengeConfig } from '@/hooks/use-challenges';

const config: ChallengeConfig = {
    id: 'Month Bustor',
    title: 'Month Bustor',
    duration: 30,
    entryFee: 300,
    reward: 1000,
    description: "The ultimate 30-day challenge. Emerge as a true academic weapon.",
    dailyGoals: [], // To be defined
    rules: ["This challenge is not yet active. Rules will be available soon."],
    eliteBadgeDays: 30
};

export default function MonthBustorPage() {
    return <ChallengerPage config={config} isLocked={true} />;
}
