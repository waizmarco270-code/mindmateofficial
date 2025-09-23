
'use client';
import ChallengerPage from '@/components/challenger/challenger-page';
import { useChallenges } from '@/hooks/use-challenges';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CustomChallengePage() {
    const { activeChallenge, loading } = useChallenges();
    const router = useRouter();

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin" />
            </div>
        );
    }
    
    // If there's no active challenge, redirect.
    if (!activeChallenge) {
        router.replace('/dashboard/challenger');
        return null;
    }

    return <ChallengerPage config={activeChallenge} />;
}
