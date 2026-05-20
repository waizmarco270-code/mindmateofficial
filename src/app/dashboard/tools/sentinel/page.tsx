
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { downloadSovereignOS } from '@/lib/sentinel-generator';

export default function LegacySentinelRedirect() {
    const router = useRouter();

    useEffect(() => {
        downloadSovereignOS();
        router.replace('/dashboard/tools');
    }, [router]);

    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4 text-primary">
                <Loader2 className="h-16 w-16 animate-spin" />
                <p className="font-black uppercase tracking-[0.3em] text-xs text-white opacity-40">Direct Hardware Ingress Started...</p>
            </div>
        </div>
    );
}
