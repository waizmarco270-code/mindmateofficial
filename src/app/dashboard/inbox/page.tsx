
'use client';

import { useEffect } from 'react';
import { InboxContent } from '@/components/inbox/inbox-content';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ArrowLeft, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useUnreadMessages } from '@/hooks/use-unread';

export default function InboxPage() {
    const { hasUnreadAnnouncements, hasUnreadFriendRequests, markAnnouncementsAsRead, markFriendRequestsAsRead } = useUnreadMessages();

    useEffect(() => {
        // Only trigger mark as read if there is actually unread content
        // This prevents the "Maximum update depth exceeded" infinite loop
        if (hasUnreadAnnouncements) {
            markAnnouncementsAsRead();
        }
        if (hasUnreadFriendRequests) {
            markFriendRequestsAsRead();
        }
    }, [hasUnreadAnnouncements, hasUnreadFriendRequests, markAnnouncementsAsRead, markFriendRequestsAsRead]);

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon" className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary/5">
                        <Link href="/dashboard"><ArrowLeft/></Link>
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <BellRing className="h-10 w-10 text-primary" />
                            Sovereign Inbox
                        </h1>
                        <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em] ml-1">Universal Intelligence Relay</p>
                    </div>
                </div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-primary/20 overflow-hidden shadow-2xl bg-card/50 backdrop-blur-xl rounded-[2.5rem]">
                    <div className="min-h-[700px] flex flex-col">
                        <InboxContent />
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
