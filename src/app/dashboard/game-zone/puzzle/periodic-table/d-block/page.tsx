
'use client';
import { useEffect } from 'react';
import { PeriodicTableGame } from "@/components/entertainment/periodic-table-game";
import { useImmersive } from '@/hooks/use-immersive';

export default function DBlockChallengePage() {
    const { setIsImmersive } = useImmersive();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    return <PeriodicTableGame blockToPlay="d" mode="challenge" />;
}
