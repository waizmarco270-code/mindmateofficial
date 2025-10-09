
'use client';

import { useEffect } from 'react';
import { useImmersive } from '@/hooks/use-immersive';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnimeHubPage() {
    const { setIsImmersive } = useImmersive();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);
    
    return (
        <div className="h-full w-full flex flex-col bg-black">
            <div className="p-2 bg-black/50 flex-shrink-0">
                <Button asChild variant="ghost">
                    <Link href="/dashboard/premium/elite-lounge">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Elite Lounge
                    </Link>
                </Button>
            </div>
            <iframe 
                src="https://www.rareanimeindia.net"
                className="w-full h-full border-0 flex-1"
                title="Anime Hub"
                allow="fullscreen"
                sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-same-origin allow-scripts"
            />
        </div>
    );
}
