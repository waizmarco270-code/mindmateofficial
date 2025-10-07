
'use client';
import { useImmersive } from '@/hooks/use-immersive';
import { useEffect } from 'react';

export default function YouTubePage() {
    const { setIsImmersive } = useImmersive();

    useEffect(() => {
        setIsImmersive(true);
        return () => setIsImmersive(false);
    }, [setIsImmersive]);

    return (
        <div className="h-full w-full bg-black">
            <iframe
                src="https://www.youtube.com"
                className="h-full w-full border-0"
                title="YouTube"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
            ></iframe>
        </div>
    );
}
