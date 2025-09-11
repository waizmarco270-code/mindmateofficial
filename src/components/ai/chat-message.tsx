
import { cn } from '@/lib/utils';
import { User as ClerkUserIcon, Sparkles, BrainCircuit, Check, X } from 'lucide-react';
import { AiAvatar } from './ai-avatar';
import { useUser } from '@clerk/nextjs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useState } from 'react';


export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  isHidden?: boolean;
  quiz?: QuizQuestion[];
}

interface ChatMessageProps {
  message: Message;
  isThinking?: boolean;
  onSimplify?: (message: Message) => void;
  onGenerateQuiz?: (topic: string) => void;
}

export function ChatMessage({ message, isThinking, onSimplify, onGenerateQuiz }: ChatMessageProps) {
  const { user } = useUser();
  const isUser = message.role === 'user';
  const lastUserQuestion = message.role === 'assistant' ? "the topic" : message.content;

  return (
    <div className={cn('flex items-start gap-4', isUser && 'justify-end')}>
      {!isUser && <AiAvatar isThinking={isThinking} />}
      <div
        className={cn(
          'max-w-2xl rounded-lg text-base shadow-sm group',
          !message.quiz && 'p-4', // Only add padding if it's not a quiz
          isUser
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-muted',
            message.isError && 'bg-destructive text-destructive-foreground'
        )}
      >
        {isThinking ? (
          <div className="flex items-center space-x-1.5 p-4">
             <span className="text-sm">Thinking</span>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.3s]"></div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current [animation-delay:-0.15s]"></div>
            <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"></div>
          </div>
        ) : message.quiz ? (
          <div className="space-y-4 bg-muted p-4 rounded-lg">
            <h3 className="font-bold text-lg">{message.content}</h3>
            {message.quiz.map((q, i) => <QuizCard key={i} question={q} />)}
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        )}
         {!isUser && !isThinking && !message.isError && !message.quiz && onSimplify && onGenerateQuiz && (
            <div className="mt-2 -mb-2 -mr-2 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity flex-wrap gap-2">
                <Button variant="ghost" size="sm" onClick={() => onSimplify(message)}>
                    <Sparkles className="mr-2 h-4 w-4"/>
                    Explain simply
                </Button>
                 <Button variant="ghost" size="sm" onClick={() => onGenerateQuiz(lastUserQuestion)}>
                    <BrainCircuit className="mr-2 h-4 w-4"/>
                    Quick Quiz
                </Button>
            </div>
        )}
      </div>
      {isUser && user && (
        <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={user.imageUrl ?? undefined} alt={user.fullName ?? 'User'} />
            <AvatarFallback>{user.fullName?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}


function QuizCard({ question }: { question: QuizQuestion }) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    const handleAnswer = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
        setIsAnswered(true);
    };
    
    return (
        <Card className="bg-background">
            <CardContent className="p-4 space-y-3">
                <p className="font-semibold">{question.question}</p>
                <div className="space-y-2">
                    {question.options.map((option, index) => {
                        const isSelected = selectedOption === option;
                        const isCorrect = question.correctAnswer === option;
                        
                        return (
                            <Button
                                key={index}
                                variant="outline"
                                className={cn("w-full justify-start",
                                    isAnswered && isCorrect && "bg-green-500/20 border-green-500/50 hover:bg-green-500/20",
                                    isAnswered && isSelected && !isCorrect && "bg-destructive/20 border-destructive/50 hover:bg-destructive/20"
                                )}
                                onClick={() => handleAnswer(option)}
                                disabled={isAnswered}
                            >
                                {option}
                                {isAnswered && isCorrect && <Check className="ml-auto h-4 w-4 text-green-600"/>}
                                {isAnswered && isSelected && !isCorrect && <X className="ml-auto h-4 w-4 text-destructive"/>}
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

