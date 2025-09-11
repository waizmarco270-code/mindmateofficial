
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Square, BrainCircuit, AlertTriangle, ShieldAlert, Sparkles, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, type Message, type QuizQuestion } from './chat-message';
import { answerStudyQuestion } from '@/ai/flows/answer-study-questions';
import { explainSimply } from '@/ai/flows/explain-simply';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@clerk/nextjs';
import { AiAvatar } from './ai-avatar';
import { useUsers } from '@/hooks/use-admin';
import { SignInButton } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

const CHAT_COST = 1;

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();
  const { currentUserData, addCreditsToUser } = useUsers();
  const router = useRouter();

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSubmit(new Event('submit'), transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({
          variant: 'destructive',
          title: 'Voice Recognition Error',
          description: event.error,
        });
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

    }
  }, [toast]);
  
  const handleMicClick = () => {
     if (!user) {
      return;
    }
    if (!recognitionRef.current) {
      toast({
          variant: 'destructive',
          title: 'Unsupported Browser',
          description: 'Your browser does not support voice recognition.',
        });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
       try {
        recognitionRef.current.start();
      } catch (error: any) {
        if (error.name !== 'InvalidStateError') {
             toast({
              variant: 'destructive',
              title: 'Could not start voice recognition',
              description: error.message
            });
        }
      }
    }
  };
  
  const callAiAndHandleResponse = async (
      aiFunction: (input: any) => Promise<any>, 
      input: any, 
      creditCost: number, 
    ) => {
        if (!user) return;

        if ((currentUserData?.credits ?? 0) < creditCost) {
            toast({
                variant: 'destructive',
                title: 'Insufficient Credits',
                description: `You need ${creditCost} credit for this action.`
            });
            return;
        }

        setIsThinking(true);
        try {
            if (creditCost > 0) {
              addCreditsToUser(user.id, -creditCost);
              toast({ title: "Credit Used", description: `You have been charged ${creditCost} credit.`});
            }

            const response = await aiFunction(input);
            
            // Handle navigation command
            if (response.navigation) {
                const navMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: response.navigation.confirmationMessage,
                };
                setMessages((prev) => [...prev, navMessage]);
                // Navigate after a short delay
                setTimeout(() => {
                    router.push(response.navigation.route);
                }, 1000);
                return;
            }
            
            // Handle quiz generation
            if (response.quiz) {
                const quizMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: "Here's a quick quiz for you!",
                    quiz: response.quiz,
                };
                setMessages((prev) => [...prev, quizMessage]);
                return;
            }

            // Handle standard text explanation
            if(response.explanation || response.simpleExplanation) {
              const aiMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'assistant',
                  content: response.explanation || response.simpleExplanation,
              };
              setMessages((prev) => [...prev, aiMessage]);
            }


        } catch (error) {
            console.error(error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Sorry, I couldn't process your request. The AI model may be temporarily unavailable.",
                isError: true,
            };
            setMessages((prev) => [...prev, errorMessage]);
            // Refund credits if there was an error
            if (creditCost > 0) {
              addCreditsToUser(user.id, creditCost);
              toast({
                  variant: 'destructive',
                  title: 'AI Error - Credits Refunded',
                  description: `We failed to get a response from the AI. Your credit has been returned.`
              });
            }
        } finally {
            setIsThinking(false);
        }
  }


  const handleSubmit = async (e: React.FormEvent | Event, voiceInput?: string) => {
    e.preventDefault();
    if (!user) {
      return;
    }
    const currentInput = voiceInput || input;
    if (!currentInput.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    
    const studyMaterial = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    
    await callAiAndHandleResponse(
      answerStudyQuestion,
      {
        question: currentInput,
        studyMaterial: studyMaterial || 'General knowledge',
      },
      CHAT_COST
    );
  };
  
  const handleExplainSimply = async (messageToSimplify: Message) => {
      if (!user) return;
      const originalQuestion = messages.slice().reverse().find(m => m.role === 'user')?.content || "the previous topic";

      const userMessage: Message = { id: Date.now().toString(), role: 'user', content: "Can you explain that more simply?", isHidden: true };
      setMessages((prev) => [...prev, userMessage]);

       await callAiAndHandleResponse(
        explainSimply,
        {
          textToSimplify: messageToSimplify.content,
          originalQuestion: originalQuestion,
        },
        CHAT_COST
      );
  }
  
  const handleGenerateQuiz = async (topic: string) => {
    if (!user) return;
     const userMessage: Message = { id: Date.now().toString(), role: 'user', content: `Test me on ${topic}`, isHidden: true };
     setMessages((prev) => [...prev, userMessage]);
     await callAiAndHandleResponse(
        answerStudyQuestion,
        {
            question: `Generate a quiz on ${topic}`,
            studyMaterial: topic,
            generateQuiz: true
        },
        CHAT_COST
     );
  }

  
  if (!user) {
      return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 rounded-xl bg-muted/40 border-2 border-dashed">
                <div className="p-5 rounded-full bg-primary/10 mb-4">
                    <ShieldAlert className="h-12 w-12 text-primary" />
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Access Marco AI</h1>
                <p className="text-muted-foreground mt-2 max-w-lg">Please sign in or create an account to start a conversation with your personal AI tutor.</p>
                <SignInButton>
                  <Button size="lg" className="mt-6 text-lg py-7">
                      Sign In to Continue
                  </Button>
                </SignInButton>
            </div>
        );
  }
  
  return (
    <div className="flex h-full flex-col bg-background rounded-xl">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="p-4 sm:p-6 md:p-8 space-y-8">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full pt-16 text-center">
                <AiAvatar isThinking={false} className="h-20 w-20 mb-4" />
                <h1 className="text-3xl font-bold">Welcome back, {currentUserData?.displayName}!</h1>
                <p className="text-muted-foreground max-w-md mt-2">
                    How can I help you learn today?
                </p>
                <div className="grid grid-cols-2 gap-3 mt-8 text-left text-sm">
                    <button className="p-4 border rounded-lg hover:bg-muted transition-colors" onClick={() => setInput('Explain photosynthesis')}>
                        <h4 className="font-semibold">Explain photosynthesis</h4>
                        <p className="text-muted-foreground text-xs">in a way a 10th grader can understand.</p>
                    </button>
                     <button className="p-4 border rounded-lg hover:bg-muted transition-colors" onClick={() => setInput('Open the leaderboard')}>
                        <h4 className="font-semibold">Open the Leaderboard</h4>
                        <p className="text-muted-foreground text-xs">to see the top students.</p>
                    </button>
                </div>
            </div>
          )}
          {messages.filter(m => !m.isHidden).map((message) => (
            <ChatMessage 
                key={message.id} 
                message={message}
                isThinking={false}
                onSimplify={handleExplainSimply}
                onGenerateQuiz={handleGenerateQuiz}
             />
          ))}
          {isThinking && <ChatMessage message={{ id: 'thinking', role: 'assistant', content: '' }} isThinking={true} />}
        </div>
      </ScrollArea>
      <div className="border-t p-4 bg-background/50 sticky bottom-0">
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-2 text-amber-700 dark:text-amber-300 mb-4">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <p className="text-xs font-semibold">
                Cost: {CHAT_COST} Credit per message.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask Marco AI anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            className="flex-1 bg-muted border-0 focus-visible:ring-primary focus-visible:ring-2 h-12 text-base"
          />
          <Button type="button" size="icon" variant={isListening ? 'destructive' : 'outline'} onClick={handleMicClick} disabled={isThinking} className="h-12 w-12 shrink-0">
            {isListening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button type="submit" size="icon" disabled={isThinking || !input.trim()} className="h-12 w-12 shrink-0">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
