

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { clanLevelConfig } from '@/app/lib/clan-levels';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Users, Award, Gem, Upload, X } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '../ui/carousel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';


interface ClanLevelRoadmapDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    groupLogo?: string | null;
    currentLevel?: number;
}

export function ClanLevelRoadmapDialog({ isOpen, onOpenChange, groupLogo, currentLevel }: ClanLevelRoadmapDialogProps) {
    const [api, setApi] = useState<CarouselApi>()
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        if (!api) {
            return
        }

        const updateProgress = () => {
            setScrollProgress(api.scrollProgress() * 100);
        }

        api.on("select", updateProgress)
        api.on("reInit", updateProgress)
        api.on("scroll", updateProgress)

        // Set initial progress
        updateProgress();

        return () => {
            api.off("select", updateProgress)
            api.off("reInit", updateProgress)
            api.off("scroll", updateProgress)
        }
    }, [api])


    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-transparent border-0 shadow-none p-0 max-w-full w-full h-full flex items-center justify-center">
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-50 h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 text-white" onClick={() => onOpenChange(false)}>
                    <X/>
                 </Button>
                 <div className="py-4 w-full space-y-4">
                     <Carousel
                        setApi={setApi}
                        opts={{
                            align: "center",
                            loop: false,
                        }}
                        className="w-full"
                    >
                        <CarouselContent className="-ml-4">
                            {clanLevelConfig.map((level) => {
                                const isCurrentLevel = level.level === currentLevel;
                                return (
                                    <CarouselItem key={level.level} className="pl-4 md:basis-1/2 lg:basis-1/3">
                                        <div className="p-1">
                                            <Card className={cn(
                                                "h-full flex flex-col bg-background/30 backdrop-blur-sm transition-all duration-300 border-2 shadow-lg",
                                                isCurrentLevel ? "border-primary shadow-primary/20" : level.borderColorClass,
                                                level.shadowClass
                                            )}>
                                                <CardHeader className="items-center text-center">
                                                    <div className={cn("relative p-1 rounded-full border-2", isCurrentLevel ? 'border-primary' : level.avatarBorderClass)}>
                                                        <Avatar className="h-20 w-20">
                                                            <AvatarImage src={groupLogo || undefined} />
                                                            <AvatarFallback className="text-3xl font-bold bg-muted/30">{level.level}</AvatarFallback>
                                                        </Avatar>
                                                    </div>
                                                    <CardTitle className="pt-2">Level {level.level}</CardTitle>
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
                                                                <span className="font-semibold text-sm flex items-center gap-2">Badge: <span className={level.badge.class}>{level.badge.name}</span></span>
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
                    <div className="px-10 mt-4">
                        <div className="h-1.5 w-full bg-muted rounded-full">
                            <div className="h-1.5 rounded-full animated-rainbow-progress" style={{ width: `${scrollProgress}%` }}></div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
