
'use client';

import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Award, Swords, Star, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const intelReports = [
  { id: 1, user: 'WaizMarco', action: 'initialized a 1-Year Sovereign mission.', icon: Star, color: 'text-yellow-400' },
  { id: 2, user: 'Rohan', action: 'secured a 3-hour focus session.', icon: Zap, color: 'text-primary' },
  { id: 3, user: 'Alex', action: 'completed 7-day Isolation protocol.', icon: ShieldCheck, color: 'text-emerald-400' },
  { id: 4, user: 'Soni', action: 'earned the Night Owl badge.', icon: Award, color: 'text-indigo-400' },
  { id: 5, user: 'Vikram', action: 'ascended to Level 5 Clan Leader.', icon: Swords, color: 'text-rose-400' },
  { id: 6, user: 'Priya', action: 'maintained a 30-day study streak.', icon: Flame, color: 'text-orange-500' },
  { id: 7, user: 'Mainframe', action: 'dispatched a Global Credit Rain.', icon: Zap, color: 'text-cyan-400' },
  { id: 8, user: 'Kabir', action: 'perfected the JEE Mastery quiz.', icon: Award, color: 'text-primary' },
];

export function IntelFeed() {
  return (
    <div className="w-full bg-black/40 border-y border-white/5 backdrop-blur-xl py-4 overflow-hidden relative group">
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10" />
      
      <div className="flex items-center gap-4 animate-marquee whitespace-nowrap">
        {[...intelReports, ...intelReports].map((report, i) => (
          <div key={`${report.id}-${i}`} className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/5 hover:border-primary/30 transition-colors">
            <report.icon className={cn("h-4 w-4", report.color)} />
            <p className="text-[10px] font-bold uppercase tracking-widest">
              <span className="text-white font-black">{report.user}</span>
              <span className="text-muted-foreground ml-2">{report.action}</span>
            </p>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite; /* Increased Speed */
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
