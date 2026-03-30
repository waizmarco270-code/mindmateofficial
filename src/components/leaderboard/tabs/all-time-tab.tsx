
'use client';

import { UserWithStats } from '@/hooks/use-leaderboard-data';
import { LeaderboardPodium } from '../shared/podium';
import { LeaderboardRankList } from '../shared/rank-list';
import { motion } from 'framer-motion';

interface AllTimeTabProps {
    users: UserWithStats[];
    currentUserId?: string;
    onUserClick: (user: UserWithStats) => void;
}

export function AllTimeTab({ users, currentUserId, onUserClick }: AllTimeTabProps) {
    const topThree = users.slice(0, 3);
    const rest = users.slice(3, 50);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
        >
            <LeaderboardPodium 
                users={topThree} 
                scoreLabel="Total Score" 
                scoreKey="totalScore" 
                onUserClick={onUserClick}
            />
            
            <div className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-[0.3em] text-muted-foreground px-1">Main Registry</h3>
                <LeaderboardRankList 
                    users={rest} 
                    currentUserId={currentUserId}
                    scoreLabel="Total Score"
                    scoreKey="totalScore"
                    onUserClick={onUserClick}
                />
            </div>
        </motion.div>
    );
}
