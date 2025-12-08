

'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { clanLevelConfig } from '@/app/lib/clan-levels';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { groupBanners } from '@/app/lib/group-assets';
import { Users, Award, Shield, Gem, Upload } from 'lucide-react';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface ClanLevelRoadmapDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    groupLogo?: string | null;
    currentLevel?: number;
}

export function ClanLevelRoadmapDialog({ isOpen, onOpenChange, groupLogo, currentLevel }: ClanLevelRoadmapDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl h-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Clan Level Roadmap</DialogTitle>
                    <DialogDescription>
                        As your clan gains XP, it will level up, unlocking new perks and prestigious rewards.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                     <Carousel
                        opts={{
                            align: "start",
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {clanLevelConfig.map((level, index) => {
                                const banner = groupBanners.find(b => b.id === level.bannerUnlock);
                                const isCurrentLevel = level.level === currentLevel;
                                return (
                                    <CarouselItem key={level.level} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Card className={cn(
                                                "h-full flex flex-col border-2 bg-slate-900/50 transition-all duration-300",
                                                isCurrentLevel ? "border-primary shadow-lg shadow-primary/20" : "border-slate-800"
                                            )}>
                                                <CardHeader className="items-center text-center">
                                                    <div className={cn("relative p-1 rounded-full", level.avatarBorderClass)}>
                                                        <Avatar className="h-20 w-20">
                                                            <AvatarImage src={groupLogo || undefined} />
                                                            <AvatarFallback className="text-3xl font-bold bg-muted/30">{level.level}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <CardTitle className="pt-2">{level.name}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="flex-1 space-y-4">
                                                    <p className="text-center text-sm text-muted-foreground min-h-[40px]">{level.description}</p>
                                                    <div className="space-y-2">
                                                         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                            <Users className="h-5 w-5 text-primary"/>
                                                            <span className="font-semibold text-sm">Member Limit: {level.memberLimit}</span>
                                                         </div>
                                                         <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                            <Award className="h-5 w-5 text-amber-400"/>
                                                            <span className="font-semibold text-sm">XP Required: {level.xpRequired.toLocaleString()}</span>
                                                         </div>
                                                          {level.badge && (
                                                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                                <Gem className="h-5 w-5 text-fuchsia-400"/>
                                                                <span className="font-semibold text-sm">Badge: <span className={level.badge.class}>{level.badge.name}</span></span>
                                                            </div>
                                                        )}
                                                        {banner && (
                                                             <div className="flex flex-col gap-2 p-2 bg-muted/50 rounded-md">
                                                                <div className="flex items-center gap-2">
                                                                    <Shield className="h-5 w-5 text-purple-400"/>
                                                                    <span className="font-semibold text-sm">Banner: {banner.id}</span>
                                                                </div>
                                                                <div className={cn("relative w-full h-20 rounded-md overflow-hidden", banner.class)}>
                                                                    <div className="absolute inset-0 bg-grid-slate-800/50"></div>
                                                                </div>
                                                            </div>
                                                        )}
                                                         {level.bannerUnlock === 'custom' && (
                                                            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                                                                <Upload className="h-5 w-5 text-rose-400"/>
                                                                <span className="font-semibold text-sm">Custom Banner Upload</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                )
                             })}
                        </CarouselContent>
                        <CarouselPrevious className="hidden sm:flex" />
                        <CarouselNext className="hidden sm:flex"/>
                    </Carousel>
                </div>
            </DialogContent>
        </Dialog>
    );
}
