
'use client';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ArrowLeft, ArrowRight, ArrowLeftRight, BrainCircuit, Wand2, Loader2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { SignedOut } from '@clerk/nextjs';
import { LoginWall } from '../ui/login-wall';
import { generateFlashcards } from '@/ai/flows/flashcard-generator';
import { Label } from '../ui/label';

interface Flashcard {
    id: string;
    front: string;
    back: string;
}

interface Deck {
    id: string;
    name: string;
    description: string;
    cards: Flashcard[];
}

export function FlashcardMaker() {
    const [decks, setDecks] = useLocalStorage<Deck[]>('flashcardDecks', []);
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
    const { toast } = useToast();
    
    // State for creating/editing a deck
    const [isDeckModalOpen, setIsDeckModalOpen] = useState(false);
    const [deckToEdit, setDeckToEdit] = useState<Deck | null>(null);
    const [deckName, setDeckName] = useState('');
    const [deckDescription, setDeckDescription] = useState('');

    const activeDeck = decks.find(d => d.id === activeDeckId);

    const handleSaveDeck = () => {
        if (!deckName.trim()) {
            toast({ variant: "destructive", title: "Deck name cannot be empty." });
            return;
        }

        if (deckToEdit) {
            // Editing existing deck
            setDecks(decks.map(d => d.id === deckToEdit.id ? { ...d, name: deckName, description: deckDescription } : d));
            toast({ title: "Deck Updated!" });
        } else {
            // Creating new deck
            const newDeck: Deck = {
                id: Date.now().toString(),
                name: deckName,
                description: deckDescription,
                cards: [],
            };
            setDecks([...decks, newDeck]);
            toast({ title: "Deck Created!" });
        }
        closeDeckModal();
    };

    const openDeckModal = (deck: Deck | null = null) => {
        setDeckToEdit(deck);
        setDeckName(deck ? deck.name : '');
        setDeckDescription(deck ? deck.description : '');
        setIsDeckModalOpen(true);
    };
    
    const closeDeckModal = () => {
        setIsDeckModalOpen(false);
        setDeckToEdit(null);
        setDeckName('');
        setDeckDescription('');
    };
    
    const deleteDeck = (id: string) => {
        setDecks(decks.filter(d => d.id !== id));
        if (activeDeckId === id) {
            setActiveDeckId(null);
        }
        toast({ title: "Deck Deleted" });
    }

    if (activeDeckId) {
        return <DeckView deck={activeDeck!} setDecks={setDecks} goBack={() => setActiveDeckId(null)} />;
    }

    return (
        <div className="relative">
             <SignedOut>
                <LoginWall title="Unlock Flashcards" description="Sign up to create and study your own flashcard decks." />
            </SignedOut>
            <div className="flex justify-end mb-4">
                <Button onClick={() => openDeckModal()}>
                    <Plus className="mr-2" /> Create New Deck
                </Button>
            </div>
            
            {decks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {decks.map(deck => (
                        <Card key={deck.id} className="flex flex-col">
                            <CardHeader>
                                <CardTitle>{deck.name}</CardTitle>
                                <CardDescription>{deck.description || "No description."}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <p className="text-sm text-muted-foreground">{deck.cards.length} card(s)</p>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                 <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openDeckModal(deck)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteDeck(deck.id)}><Trash2 className="h-4 w-4"/></Button>
                                 </div>
                                <Button onClick={() => setActiveDeckId(deck.id)}>Study</Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            ) : (
                 <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">No decks created yet. Create one to get started!</p>
                </div>
            )}
            
            <Dialog open={isDeckModalOpen} onOpenChange={setIsDeckModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{deckToEdit ? 'Edit Deck' : 'Create New Deck'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input placeholder="Deck Name (e.g., 'History Chapter 5')" value={deckName} onChange={e => setDeckName(e.target.value)} />
                        <Textarea placeholder="Description (optional)" value={deckDescription} onChange={e => setDeckDescription(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeDeckModal}>Cancel</Button>
                        <Button onClick={handleSaveDeck}>{deckToEdit ? 'Save Changes' : 'Create Deck'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function AiGenerator({ onGenerate }: { onGenerate: (cards: Flashcard[]) => void }) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [text, setText] = useState('');
    const [count, setCount] = useState(5);
    const [isOpen, setIsOpen] = useState(false);

    const handleGenerate = async () => {
        if (!text.trim() || count <= 0) return;
        
        setIsGenerating(true);
        try {
            const generated = await generateFlashcards({ topic: text, count });
            onGenerate(generated.cards.map(c => ({...c, id: Date.now().toString() + Math.random()})));
            setIsOpen(false);
            setText('');
        } catch (error) {
            console.error("AI Generation failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                 <Button variant="outline"><Wand2 className="mr-2"/> Generate with AI</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Generate Flashcards with AI</DialogTitle>
                    <DialogDescription>Paste your notes or a topic, and let AI create the cards for you.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <Textarea 
                        placeholder="Paste your notes or text here..."
                        value={text}
                        onChange={e => setText(e.target.value)}
                        rows={10}
                    />
                    <div className="space-y-2">
                        <Label htmlFor="card-count">Number of flashcards to generate</Label>
                        <Input 
                            id="card-count"
                            type="number"
                            value={count}
                            onChange={e => setCount(Number(e.target.value))}
                            min="1"
                            max="20"
                        />
                    </div>
                </div>
                 <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={isGenerating || !text.trim()}>
                        {isGenerating ? <><Loader2 className="mr-2 animate-spin"/> Generating...</> : 'Generate'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function DeckView({ deck, setDecks, goBack }: { deck: Deck; setDecks: (decks: Deck[]) => void; goBack: () => void }) {
    const [isStudyMode, setIsStudyMode] = useState(false);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const [cardToEdit, setCardToEdit] = useState<Flashcard | null>(null);
    const [cardFront, setCardFront] = useState('');
    const [cardBack, setCardBack] = useState('');
    const { toast } = useToast();

    const handleSaveCard = () => {
        if (!cardFront.trim() || !cardBack.trim()) {
            toast({ variant: "destructive", title: "Both front and back are required." });
            return;
        }

        const updatedCards = cardToEdit
            ? deck.cards.map(c => c.id === cardToEdit.id ? { ...c, front: cardFront, back: cardBack } : c)
            : [...deck.cards, { id: Date.now().toString(), front: cardFront, back: cardBack }];
        
        setDecks(prevDecks => prevDecks.map(d => d.id === deck.id ? { ...d, cards: updatedCards } : d));
        toast({ title: cardToEdit ? "Card Updated!" : "Card Added!" });
        closeCardModal();
    };

    const handleAiGenerate = (newCards: Flashcard[]) => {
        const updatedCards = [...deck.cards, ...newCards];
        setDecks(prevDecks => prevDecks.map(d => d.id === deck.id ? { ...d, cards: updatedCards } : d));
        toast({ title: `${newCards.length} cards generated by AI!` });
    };

    const openCardModal = (card: Flashcard | null = null) => {
        setCardToEdit(card);
        setCardFront(card ? card.front : '');
        setCardBack(card ? card.back : '');
        setIsCardModalOpen(true);
    };

    const closeCardModal = () => {
        setIsCardModalOpen(false);
        setCardToEdit(null);
        setCardFront('');
        setCardBack('');
    };
    
    const deleteCard = (id: string) => {
        const updatedCards = deck.cards.filter(c => c.id !== id);
        setDecks(prevDecks => prevDecks.map(d => d.id === deck.id ? { ...d, cards: updatedCards } : d));
        toast({ title: "Card Deleted" });
    }

    if (isStudyMode) {
        return <StudyView deck={deck} goBack={() => setIsStudyMode(false)} />;
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <Button variant="outline" size="sm" onClick={goBack}><ArrowLeft className="mr-2"/> Back to Decks</Button>
                     <Button onClick={() => setIsStudyMode(true)} disabled={deck.cards.length === 0}><BrainCircuit className="mr-2"/> Study</Button>
                </div>
                <CardTitle className="pt-4">{deck.name}</CardTitle>
                <CardDescription>{deck.description || "No description."}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end gap-2 mb-4">
                    <AiGenerator onGenerate={handleAiGenerate} />
                    <Button onClick={() => openCardModal()}><Plus className="mr-2"/> Add Card</Button>
                </div>
                 {deck.cards.length > 0 ? (
                    <div className="space-y-3">
                        {deck.cards.map(card => (
                            <Card key={card.id} className="p-4 flex items-center">
                                <div className="flex-1 space-y-1">
                                    <p className="font-semibold">{card.front}</p>
                                    <p className="text-sm text-muted-foreground">{card.back}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" onClick={() => openCardModal(card)}><Edit className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCard(card.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                 ) : (
                     <div className="text-center py-16 border-2 border-dashed rounded-lg">
                        <p className="text-muted-foreground">This deck is empty. Add a card manually or generate with AI!</p>
                    </div>
                 )}
            </CardContent>

             <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{cardToEdit ? 'Edit Card' : 'Add New Card'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea placeholder="Front of card (Question or Term)" value={cardFront} onChange={e => setCardFront(e.target.value)} />
                        <Textarea placeholder="Back of card (Answer or Definition)" value={cardBack} onChange={e => setCardBack(e.target.value)} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeCardModal}>Cancel</Button>
                        <Button onClick={handleSaveCard}>{cardToEdit ? 'Save Changes' : 'Add Card'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}

function StudyView({ deck, goBack }: { deck: Deck; goBack: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev + 1) % deck.cards.length);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setCurrentIndex((prev) => (prev - 1 + deck.cards.length) % deck.cards.length);
    };

    const currentCard = deck.cards[currentIndex];

    return (
        <Card className="flex flex-col items-center">
            <CardHeader className="w-full">
                <div className="flex items-center justify-between">
                     <Button variant="outline" size="sm" onClick={goBack}><ArrowLeft className="mr-2"/> Back to Deck</Button>
                     <p className="text-sm text-muted-foreground font-semibold">Card {currentIndex + 1} of {deck.cards.length}</p>
                </div>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center w-full">
                <div className="relative w-full max-w-lg h-64 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <AnimatePresence>
                        <motion.div
                            key={isFlipped ? 'back' : 'front'}
                            initial={{ rotateY: isFlipped ? -180 : 0 }}
                            animate={{ rotateY: 0 }}
                            exit={{ rotateY: 180 }}
                            transition={{ duration: 0.4 }}
                            className={cn(
                                "absolute w-full h-full rounded-lg flex items-center justify-center p-6 text-center text-xl font-semibold shadow-lg border",
                                "bg-card text-card-foreground"
                            )}
                            style={{ backfaceVisibility: 'hidden' }}
                        >
                            {isFlipped ? currentCard.back : currentCard.front}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </CardContent>
            <CardFooter className="w-full flex justify-between items-center">
                <Button variant="outline" onClick={handlePrev}><ArrowLeft className="mr-2"/> Previous</Button>
                <Button variant="outline" onClick={() => setIsFlipped(!isFlipped)}><ArrowLeftRight className="mr-2"/> Flip Card</Button>
                <Button variant="outline" onClick={handleNext}>Next <ArrowRight className="ml-2"/></Button>
            </CardFooter>
        </Card>
    );
}
