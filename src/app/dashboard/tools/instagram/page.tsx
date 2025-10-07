
'use client';
import { useImmersive } from '@/hooks/use-immersive';
import { useEffect } from 'react';

export default function InstagramPage() {
    const { setIsImmersive } = useImmersive();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    return (
        <div className="h-full w-full bg-black">
            <iframe
                src="https://www.instagram.com"
                className="h-full w-full border-0"
                title="Instagram"
                sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            ></iframe>
        </div>
    );
}
