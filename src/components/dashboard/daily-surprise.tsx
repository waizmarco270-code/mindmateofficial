
'use client';

import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDailySurprises } from '@/hooks/use-admin';
import { Lightbulb, MessageSquare, Image as ImageIcon, HelpCircle, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import Image from 'next/image';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
};

export function DailySurpriseCard() {
    const { dailySurprises, loading } = useDailySurprises();
    const { toast } = useToast();

    // State for the micro-quiz
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [answered, setAnswered] = useState(false);

    // This ensures the content only changes once per day, not on every render
    const todaysSurprise = useMemo(() => {
        if (loading || dailySurprises.length === 0) {
            return null;
        }
        const dayIndex = getDayOfYear(new Date());
        const surpriseIndex = dayIndex % dailySurprises.length;
        return dailySurprises[surpriseIndex];
    }, [dailySurprises, loading]);

    // Reset quiz state when the surprise changes (i.e., new day)
    useEffect(() => {
        setSelectedOption(null);
        setAnswered(false);
    }, [todaysSurprise]);
    
    const handleQuizAnswer = (option: string) => {
        if(answered || !todaysSurprise || todaysSurprise.type !== 'quiz') return;
        
        setSelectedOption(option);
        setAnswered(true);
        
        if (option === todaysSurprise.quizCorrectAnswer) {
            toast({ title: "Correct!", description: "Great job!", className: 'bg-green-500/10 border-green-500/50' });
        } else {
            toast({ variant: 'destructive', title: "Not quite!", description: `The correct answer was: ${todaysSurprise.quizCorrectAnswer}` });
        }
    };


    if (loading) {
        return <Skeleton className="h-48 w-full" />;
    }

    if (!todaysSurprise) {
        return null; // Don't render anything if there are no surprises
    }

    const renderContent = () => {
        switch (todaysSurprise.type) {
            case 'fact':
                return <p className="text-muted-foreground text-lg">&ldquo;{todaysSurprise.text}&rdquo;</p>;
            case 'quote':
                return (
                    <blockquote className="text-lg">
                        &ldquo;{todaysSurprise.text}&rdquo;
                        <footer className="text-sm text-muted-foreground mt-2">&mdash; {todaysSurprise.author || 'Unknown'}</footer>
                    </blockquote>
                );
            case 'meme':
                return (
                     <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg">
                        {todaysSurprise.imageUrl && <Image src={todaysSurprise.imageUrl} alt="Daily Meme" layout="fill" objectFit="contain" />}
                    </div>
                );
            case 'quiz':
                 return (
                    <div className="space-y-4">
                        <p className="font-semibold text-lg">{todaysSurprise.quizQuestion}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {todaysSurprise.quizOptions?.map((option, index) => {
                                const isSelected = selectedOption === option;
                                const isCorrect = todaysSurprise.quizCorrectAnswer === option;
                                
                                return (
                                    <Button 
                                        key={index}
                                        variant="outline"
                                        onClick={() => handleQuizAnswer(option)}
                                        disabled={answered}
                                        className={cn("justify-start h-auto py-2",
                                            answered && isCorrect && "bg-green-500/20 border-green-500/50 hover:bg-green-500/20",
                                            answered && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50 hover:bg-destructive/20",
                                        )}
                                    >
                                        {option}
                                        {answered && isSelected && !isCorrect && <X className="ml-auto h-4 w-4 text-destructive"/>}
                                        {answered && isCorrect && <Check className="ml-auto h-4 w-4 text-green-600"/>}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                 )
            default:
                return null;
        }
    };

    const getIcon = () => {
        switch (todaysSurprise.type) {
            case 'fact': return <Lightbulb className="h-6 w-6 text-yellow-500" />;
            case 'quote': return <MessageSquare className="h-6 w-6 text-blue-500" />;
            case 'meme': return <ImageIcon className="h-6 w-6 text-green-500" />;
            case 'quiz': return <HelpCircle className="h-6 w-6 text-purple-500" />;
            default: return null;
        }
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                    {getIcon()}
                    <CardTitle>Your Daily Surprise</CardTitle>
                </div>
                 <p className="text-sm text-muted-foreground font-medium">{format(new Date(), 'EEEE, MMMM do')}</p>
            </CardHeader>
            <CardContent>
                {renderContent()}
            </CardContent>
        </Card>
    );
}
