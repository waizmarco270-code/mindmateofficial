
'use client';

import { PersonalVault } from "@/components/resources/personal-vault";
import { useAdmin } from "@/hooks/use-admin";
import { lockableFeatures } from "@/lib/features";
import { LoginWall } from "@/components/ui/login-wall";
import { SignedIn } from "@clerk/nextjs";

const FEATURE_ID = 'personal-vault';

export default function PersonalVaultPage() {
    const { currentUserData, featureLocks } = useAdmin();

    const isLocked = featureLocks?.[FEATURE_ID]?.isLocked && !currentUserData?.unlockedFeatures?.includes(FEATURE_ID);

    if (isLocked) {
        const feature = lockableFeatures.find(f => f.id === FEATURE_ID);
        return (
            <LoginWall
                title={`Unlock ${feature?.name || 'Personal Vault'}`}
                description={feature?.description || 'Unlock this feature to continue.'}
            />
        )
    }

    return (
        <SignedIn>
            <PersonalVault />
        </SignedIn>
    );
}
