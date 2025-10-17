
'use client';

import { useAdmin, useUsers, SUPER_ADMIN_UID, BadgeType } from '@/hooks/use-admin';
import { useUser, useClerk } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Code, Fingerprint, ShieldCheck, UserCircle, KeyRound, Server } from 'lucide-react';

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="flex justify-between items-center border-b py-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-mono font-semibold text-right">{value || 'Not Set'}</p>
    </div>
);

export default function DevExplorerPage() {
    const { user: clerkUser, isLoaded, isSignedIn } = useUser();
    const { session } = useClerk();
    const { isAdmin, isSuperAdmin, currentUserData, appSettings, loading } = useAdmin();

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dev Explorer</h1>
                <p className="text-muted-foreground">Live application state for debugging purposes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><UserCircle/> Clerk Auth State</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Is Loaded" value={isLoaded ? 'true' : 'false'} />
                        <InfoRow label="Is Signed In" value={isSignedIn ? 'true' : 'false'} />
                        <InfoRow label="Clerk User ID" value={clerkUser?.id} />
                        <InfoRow label="Session ID" value={session?.id} />
                        <InfoRow label="Full Name" value={clerkUser?.fullName} />
                        <InfoRow label="Primary Email" value={clerkUser?.primaryEmailAddress?.emailAddress} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Fingerprint/> MindMate User Profile</CardTitle>
                         <CardDescription>Data from your Firestore document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Is Loading" value={loading ? 'true' : 'false'} />
                        <InfoRow label="Firestore UID" value={currentUserData?.uid} />
                        <InfoRow label="Display Name" value={currentUserData?.displayName} />
                        <InfoRow label="Credits" value={String(currentUserData?.credits)} />
                        <InfoRow label="Streak" value={String(currentUserData?.streak)} />
                        <InfoRow label="Is Blocked" value={currentUserData?.isBlocked ? 'true' : 'false'} />
                    </CardContent>
                </Card>
                
                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><ShieldCheck/> Roles & Permissions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <InfoRow label="Is Admin" value={isAdmin ? 'true' : 'false'} />
                        <InfoRow label="Is Super Admin" value={isSuperAdmin ? 'true' : 'false'} />
                        <InfoRow label="Is VIP" value={currentUserData?.isVip ? 'true' : 'false'} />
                         <InfoRow label="Is Co-Dev" value={currentUserData?.isCoDev ? 'true' : 'false'} />
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Server/> App Settings</CardTitle>
                         <CardDescription>Global configuration values.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <InfoRow label="Marco AI Status" value={appSettings?.marcoAiLaunchStatus || 'loading...'} />
                    </CardContent>
                </Card>

            </div>
        </div>
    );
}
