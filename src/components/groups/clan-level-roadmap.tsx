

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clanLevelConfig } from '@/app/lib/clan-levels';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { groupBanners } from '@/app/lib/group-assets';
import { Users, Award, Shield, Gem, Upload } from 'lucide-react';
import Image from 'next/image';

interface ClanLevelRoadmapDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export function ClanLevelRoadmapDialog({ isOpen, onOpenChange }: ClanLevelRoadmapDialogProps) {

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Clan Level Roadmap</DialogTitle>
                    <DialogDescription>
                        As your clan gains XP, it will level up, unlocking new perks and prestigious rewards.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="flex-1 -mx-6">
                    <div className="px-6 py-4">
                        <div className="relative pl-8 space-y-12 border-l-2 border-dashed">
                             {clanLevelConfig.map((level, index) => {
                                const banner = groupBanners.find(b => b.id === level.bannerUnlock);
                                return (
                                    <div key={level.level} className="relative">
                                         <div className={cn("absolute -left-[43px] top-0 p-1 rounded-full bg-background", level.avatarBorderClass)}>
                                            <Avatar className="h-16 w-16">
                                                <AvatarFallback className="text-2xl font-bold">{level.level}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                         <div className="ml-4 space-y-4">
                                            <div>
                                                <p className="font-bold text-xl">{level.name}</p>
                                                <p className="text-sm text-muted-foreground">{level.description}</p>
                                            </div>
                                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                 <div className="p-3 rounded-lg bg-muted border flex items-center gap-3">
                                                    <Users className="h-6 w-6 text-primary"/>
                                                    <div>
                                                        <p className="font-bold">Member Limit</p>
                                                        <p className="text-sm text-muted-foreground">{level.memberLimit} Members</p>
                                                    </div>
                                                </div>
                                                 <div className="p-3 rounded-lg bg-muted border flex items-center gap-3">
                                                    <Award className="h-6 w-6 text-amber-500"/>
                                                    <div>
                                                        <p className="font-bold">XP to Reach</p>
                                                        <p className="text-sm text-muted-foreground">{level.xpRequired.toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                {level.badge && (
                                                    <div className="p-3 rounded-lg bg-muted border flex flex-col items-start gap-2">
                                                        <div className="flex items-center gap-3">
                                                            <Gem className="h-6 w-6 text-fuchsia-500"/>
                                                            <div>
                                                                <p className="font-bold">Unlocked Badge</p>
                                                            </div>
                                                        </div>
                                                        <div className="self-center pt-1">
                                                            <div className={level.badge.class}>{level.badge.name}</div>
                                                        </div>
                                                    </div>
                                                )}
                                                {banner && (
                                                     <div className="p-3 rounded-lg bg-muted border flex flex-col items-start gap-2">
                                                        <div className="flex items-center gap-3 self-start">
                                                            <Shield className="h-6 w-6 text-purple-500"/>
                                                            <div>
                                                                <p className="font-bold">Unlocked Banner</p>
                                                                <p className="text-sm text-muted-foreground capitalize">{banner.id.replace('banner-','')}</p>
                                                            </div>
                                                        </div>
                                                         <div className={cn("relative w-full h-24 rounded-lg overflow-hidden mt-2", banner.class)}>
                                                            <div className="absolute inset-0 bg-grid-slate-800/50"></div>
                                                         </div>
                                                    </div>
                                                )}
                                                {level.bannerUnlock === 'custom' && (
                                                     <div className="p-3 rounded-lg bg-muted border flex items-center gap-3">
                                                        <Upload className="h-6 w-6 text-rose-500"/>
                                                        <div>
                                                            <p className="font-bold">Custom Banner Slot</p>
                                                            <p className="text-sm text-muted-foreground">Upload your own clan banner.</p>
                                                        </div>
                                                    </div>
                                                )}
                                             </div>
                                         </div>
                                    </div>
                                )
                             })}
                        </div>
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
