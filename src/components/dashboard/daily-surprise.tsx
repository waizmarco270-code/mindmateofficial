
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailySurprises } from '@/hooks/use-admin';
import { Lightbulb, MessageSquare, Image as ImageIcon, HelpCircle, Check, X, Award, Zap, Gamepad2, Gift as GiftIcon, ArrowRight } from 'lucide-react';
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
    BrainCircuit: HelpCircle,
    Trophy: Award,
    BookOpen: ImageIcon,
    Clock: HelpCircle,
    LineChart: HelpCircle,
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
                     <Link href={surprise.featureRoute || '/dashboard'} className="block -m-6">
                        <div className="group rounded-lg p-6 bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/20 transition-all cursor-pointer h-full flex items-center">
                            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left w-full">
                                <div className="p-4 rounded-full bg-primary/20 text-primary">
                                    <FeatureIcon className="h-10 w-10"/>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-primary uppercase tracking-wider">New Feature</p>
                                    <h3 className="text-2xl font-bold mt-1">{surprise.featureTitle}</h3>
                                    <p className="text-muted-foreground mt-2">{surprise.featureDescription}</p>
                                </div>
                                <ArrowRight className="h-8 w-8 text-muted-foreground group-hover:translate-x-1 transition-transform hidden sm:block"/>
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
                        <Card className="min-h-[220px]">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getIcon(surprise.type)}
                                    <CardTitle>Today's Surprises</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center h-full">
                                {renderSurpriseContent(surprise)}
                            </CardContent>
                        </Card>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    );
}
