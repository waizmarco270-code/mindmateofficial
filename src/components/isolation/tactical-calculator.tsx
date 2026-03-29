
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, X, Delete, Equal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export function TacticalCalculator() {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [prevValue, setPrevValue] = useState<number | null>(null);
    const [operator, setOperator] = useState<string | null>(null);
    const [waitingForOperand, setWaitingForOperand] = useState(false);

    const inputDigit = (digit: string) => {
        if (waitingForOperand) {
            setDisplay(digit);
            setWaitingForOperand(false);
        } else {
            setDisplay(display === '0' ? digit : display + digit);
        }
    };

    const inputDot = () => {
        if (!display.includes('.')) {
            setDisplay(display + '.');
        }
    };

    const clearDisplay = () => {
        setDisplay('0');
        setPrevValue(null);
        setOperator(null);
        setWaitingForOperand(false);
    };

    const performOperation = (nextOperator: string) => {
        const inputValue = parseFloat(display);

        if (prevValue === null) {
            setPrevValue(inputValue);
        } else if (operator) {
            const currentValue = prevValue || 0;
            let newValue = currentValue;

            switch (operator) {
                case '+': newValue = currentValue + inputValue; break;
                case '-': newValue = currentValue - inputValue; break;
                case '*': newValue = currentValue * inputValue; break;
                case '/': newValue = currentValue / inputValue; break;
            }

            setPrevValue(newValue);
            setDisplay(String(newValue));
        }

        setWaitingForOperand(true);
        setOperator(nextOperator);
    };

    return (
        <div className="fixed bottom-24 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="mb-4"
                    >
                        <Card className="w-64 bg-black/90 backdrop-blur-2xl border-primary/30 shadow-2xl overflow-hidden rounded-3xl">
                            <div className="p-4 bg-primary/10 border-b border-primary/20 flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Tactical Logic</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => setIsOpen(false)}>
                                    <X className="h-3 w-3" />
                                </Button>
                            </div>
                            <CardContent className="p-4 space-y-4">
                                <div className="bg-black/40 rounded-xl p-3 border border-white/5 text-right overflow-hidden">
                                    <p className="text-[10px] font-mono opacity-40 h-4">{prevValue} {operator}</p>
                                    <p className="text-2xl font-black font-mono tracking-tighter truncate">{display}</p>
                                </div>
                                <div className="grid grid-cols-4 gap-2">
                                    <CalcButton label="C" onClick={clearDisplay} className="text-red-500" />
                                    <CalcButton label="/" onClick={() => performOperation('/')} className="text-primary" />
                                    <CalcButton label="*" onClick={() => performOperation('*')} className="text-primary" />
                                    <CalcButton label="DEL" onClick={() => setDisplay(display.length > 1 ? display.slice(0, -1) : '0')} className="text-muted-foreground" />
                                    
                                    {[7, 8, 9].map(n => <CalcButton key={n} label={String(n)} onClick={() => inputDigit(String(n))} />)}
                                    <CalcButton label="-" onClick={() => performOperation('-')} className="text-primary" />
                                    
                                    {[4, 5, 6].map(n => <CalcButton key={n} label={String(n)} onClick={() => inputDigit(String(n))} />)}
                                    <CalcButton label="+" onClick={() => performOperation('+')} className="text-primary" />
                                    
                                    {[1, 2, 3].map(n => <CalcButton key={n} label={String(n)} onClick={() => inputDigit(String(n))} />)}
                                    <CalcButton label="=" onClick={() => performOperation('=')} className="row-span-2 bg-primary text-white hover:bg-primary/80" icon={Equal} />
                                    
                                    <CalcButton label="0" onClick={() => inputDigit('0')} className="col-span-2" />
                                    <CalcButton label="." onClick={inputDot} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-2xl transition-all duration-500",
                    isOpen ? "bg-primary rotate-90" : "bg-black/80 border border-primary/20 text-primary hover:bg-primary hover:text-white"
                )}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X /> : <Calculator className="h-6 w-6" />}
            </Button>
        </div>
    );
}

function CalcButton({ label, onClick, className, icon: Icon }: any) {
    return (
        <Button
            variant="ghost"
            className={cn("h-10 w-full font-black text-xs rounded-lg hover:bg-white/5", className)}
            onClick={onClick}
        >
            {Icon ? <Icon className="h-4 w-4" /> : label}
        </Button>
    );
}
