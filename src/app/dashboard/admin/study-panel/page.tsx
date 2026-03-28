
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function StudyPanelRedirect() {
    const router = useRouter();
    useEffect(() => {
        router.replace('/dashboard/spanel');
    }, [router]);

    return (
        <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
    );
}
