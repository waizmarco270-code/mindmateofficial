

'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailySurprises } from '@/hooks/use-admin';
import { Lightbulb, MessageSquare, Image as ImageIcon, HelpCircle, Check, X, Award, Zap, Gamepad2, Gift as GiftIcon, ArrowRight, BrainCircuit, Trophy, BookOpen, Clock, LineChart } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

// Map string names to Lucide components
const iconMap: { [key: string]: React.ElementType } = {
    Award,
    Zap,
    Gamepad2,
    Gift: GiftIcon,
    BrainCircuit,
    Trophy,
    BookOpen,
    Clock,
    LineChart,
};


export function DailySurpriseCard() {
    const { dailySurprises, loading } = useDailySurprises();
    const { toast } = useToast();

    // State for the micro-quiz
    const [selectedOption, setSelectedOption] = useState<Record<string, string | null>>({});
    const [answered, setAnswered] = useState<Record<string, boolean>>({});

    const latestSurprises = useMemo(() => {
        if (loading || dailySurprises.length === 0) {
            return [];
        }
        // Take the 5 most recent surprises
        return dailySurprises.slice(-5).reverse();
    }, [dailySurprises, loading]);

    const handleQuizAnswer = (surpriseId: string, option: string, correctAnswer: string | undefined) => {
        if(answered[surpriseId] || !correctAnswer) return;
        
        setSelectedOption(prev => ({...prev, [surpriseId]: option}));
        setAnswered(prev => ({...prev, [surpriseId]: true}));
        
        if (option === correctAnswer) {
            toast({ title: "Correct!", description: "Great job!", className: 'bg-green-500/10 border-green-500/50' });
        } else {
            toast({ variant: 'destructive', title: "Not quite!", description: `The correct answer was: ${correctAnswer}` });
        }
    };


    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (latestSurprises.length === 0) {
        return null; // Don't render anything if there are no surprises
    }
    
    const renderSurpriseContent = (surprise: typeof latestSurprises[0]) => {
        switch (surprise.type) {
            case 'fact':
                return <p className="text-muted-foreground text-lg">&ldquo;{surprise.text}&rdquo;</p>;
            case 'quote':
                return (
                    <blockquote className="text-lg">
                        &ldquo;{surprise.text}&rdquo;
                        <footer className="text-sm text-muted-foreground mt-2">&mdash; {surprise.author || 'Unknown'}</footer>
                    </blockquote>
                );
            case 'meme':
                return (
                     <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                        {surprise.imageUrl && <Image src={surprise.imageUrl} alt="Daily Meme" layout="fill" objectFit="contain" />}
                    </div>
                );
            case 'quiz':
                 return (
                    <div className="space-y-4">
                        <p className="font-semibold text-lg">{surprise.quizQuestion}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {surprise.quizOptions?.map((option, index) => {
                                const isSelected = selectedOption[surprise.id] === option;
                                const isCorrect = surprise.quizCorrectAnswer === option;
                                
                                return (
                                    <Button 
                                        key={index}
                                        variant="outline"
                                        onClick={() => handleQuizAnswer(surprise.id, option, surprise.quizCorrectAnswer)}
                                        disabled={answered[surprise.id]}
                                        className={cn("justify-start h-auto py-2",
                                            answered[surprise.id] && isCorrect && "bg-green-500/20 border-green-500/50 hover:bg-green-500/20",
                                            answered[surprise.id] && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50 hover:bg-destructive/20",
                                        )}
                                    >
                                        {option}
                                        {answered[surprise.id] && isSelected && !isCorrect && <X className="ml-auto h-4 w-4 text-destructive"/>}
                                        {answered[surprise.id] && isCorrect && <Check className="ml-auto h-4 w-4 text-green-600"/>}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                 );
            case 'new-feature':
                const FeatureIcon = surprise.featureIcon ? iconMap[surprise.featureIcon] || GiftIcon : GiftIcon;
                return (
                    <Link href={surprise.featureRoute || '/dashboard'} className="block h-full group">
                        <div className="relative h-full rounded-lg p-6 flex flex-col justify-between overflow-hidden bg-gradient-to-br from-primary/10 via-transparent to-transparent group-hover:from-primary/20 transition-all">
                            <div>
                                <div className="p-3 rounded-full bg-primary/20 text-primary w-fit mb-4">
                                    <FeatureIcon className="h-8 w-8"/>
                                </div>
                                <p className="text-sm font-bold text-primary uppercase tracking-wider">New Feature</p>
                                <h3 className="text-2xl sm:text-3xl font-bold mt-1 text-foreground">{surprise.featureTitle}</h3>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between mt-4 gap-4">
                                <p className="text-muted-foreground max-w-xs">{surprise.featureDescription}</p>
                                <ArrowRight className="h-8 w-8 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 self-end"/>
                            </div>
                        </div>
                    </Link>
                );
            default:
                return null;
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'fact': return <Lightbulb className="h-6 w-6 text-yellow-500" />;
            case 'quote': return <MessageSquare className="h-6 w-6 text-blue-500" />;
            case 'meme': return <ImageIcon className="h-6 w-6 text-green-500" />;
            case 'quiz': return <HelpCircle className="h-6 w-6 text-purple-500" />;
            case 'new-feature': return <GiftIcon className="h-6 w-6 text-pink-500"/>;
            default: return null;
        }
    }
    

    return (
        <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
                {latestSurprises.map((surprise) => (
                    <CarouselItem key={surprise.id}>
                         <Card className="min-h-[220px] overflow-hidden">
                            {surprise.type !== 'new-feature' ? (
                                <>
                                    <CardHeader className="flex flex-row items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {getIcon(surprise.type)}
                                            <CardTitle>Today's Surprises</CardTitle>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center h-full">
                                        {renderSurpriseContent(surprise)}
                                    </CardContent>
                                </>
                            ) : (
                                // For new-feature, render content directly inside CardContent to fill space
                                <CardContent className="p-0 h-full">
                                    {renderSurpriseContent(surprise)}
                                </CardContent>
                            )}
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}
