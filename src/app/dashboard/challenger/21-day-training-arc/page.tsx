
'use client';
import ChallengerPage from '@/components/challenger/challenger-page';
import type { ChallengeConfig } from '@/hooks/use-challenges';

const config: ChallengeConfig = {
    id: '21-Day Training Arc',
    title: '21-Day Training Arc',
    duration: 21,
    entryFee: 200,
    reward: 750,
    description: "Three weeks to forge an unbreakable study routine and master your subjects.",
    dailyGoals: [], // To be defined
    rules: ["This challenge is not yet active. Rules will be available soon."],
    eliteBadgeDays: 21
};

export default function TwentyOneDayTrainingArcPage() {
    return <ChallengerPage config={config} isLocked={true} />;
}
