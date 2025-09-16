
'use client';
import ChallengerPage from '@/components/challenger/challenger-page';
import type { ChallengeConfig } from '@/hooks/use-challenges';

const config: ChallengeConfig = {
    id: '14-Day Exclusive',
    title: '14-Day Exclusive',
    duration: 14,
    entryFee: 100,
    reward: 500,
    description: "Two weeks of intense focus to solidify your study habits and knowledge base.",
    dailyGoals: [], // To be defined
    rules: ["This challenge is not yet active. Rules will be available soon."],
    eliteBadgeDays: 14
};

export default function FourteenDayExclusivePage() {
    return <ChallengerPage config={config} isLocked={true} />;
}
