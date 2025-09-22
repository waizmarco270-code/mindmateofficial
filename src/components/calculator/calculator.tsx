
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Divide, Minus, Plus, Equal, Percent, ChevronsUp, SquareRoot } from 'lucide-react';

export function Calculator() {
  const [displayValue, setDisplayValue] = useState('0');
  const [expression, setExpression] = useState('');

  const handleInput = (value: string) => {
    if (displayValue === '0' && value !== '.') {
      setDisplayValue(value);
      setExpression(value);
    } else {
      setDisplayValue(prev => prev + value);
      setExpression(prev => prev + value);
    }
  };

  const handleOperator = (operator: string) => {
    // Avoid adding operator if last char is already an operator
    const lastChar = expression.slice(-1);
    if (['+', '-', '*', '/'].includes(lastChar)) {
        return;
    }
    setDisplayValue(displayValue + operator);
    setExpression(expression + operator);
  };
  
  const clearInput = () => {
    setDisplayValue('0');
    setExpression('');
  };
  
  const deleteLast = () => {
    if (displayValue.length > 1) {
        setDisplayValue(displayValue.slice(0, -1));
        setExpression(expression.slice(0, -1));
    } else {
        setDisplayValue('0');
        setExpression('');
    }
  };
  
  const calculateResult = () => {
      try {
        // A safe way to evaluate expressions without using eval()
        const result = new Function('return ' + expression.replace('^', '**'))();
        const finalResult = parseFloat(result.toFixed(10)); // Limit precision
        setDisplayValue(String(finalResult));
        setExpression(String(finalResult));
      } catch (error) {
        setDisplayValue('Error');
        setExpression('');
      }
  };

  const handleScientificFunction = (func: string) => {
    try {
        let currentVal = parseFloat(expression);
        if (isNaN(currentVal)) return;

        let result;
        switch(func) {
            case 'sin': result = Math.sin(currentVal * Math.PI / 180); break; // Assuming degrees
            case 'cos': result = Math.cos(currentVal * Math.PI / 180); break;
            case 'tan': result = Math.tan(currentVal * Math.PI / 180); break;
            case 'log': result = Math.log10(currentVal); break;
            case 'ln': result = Math.log(currentVal); break;
            case 'sqrt': result = Math.sqrt(currentVal); break;
            case 'sq': result = Math.pow(currentVal, 2); break;
            case 'pi': setDisplayValue(String(Math.PI)); setExpression(String(Math.PI)); return;
            case 'e': setDisplayValue(String(Math.E)); setExpression(String(Math.E)); return;
            case '!': 
                if (currentVal < 0 || !Number.isInteger(currentVal)) {
                    setDisplayValue('Error'); setExpression(''); return;
                }
                let fact = 1;
                for (let i = 2; i <= currentVal; i++) fact *= i;
                result = fact;
                break;
            default: return;
        }

        if (result !== undefined) {
             const finalResult = parseFloat(result.toFixed(10));
             setDisplayValue(String(finalResult));
             setExpression(String(finalResult));
        }

    } catch (error) {
        setDisplayValue('Error');
        setExpression('');
    }
  }


  const renderButton = (label: React.ReactNode, onClick: () => void, className = '', textClass = '') => (
    <Button
      variant="outline"
      className={`h-14 text-xl font-semibold rounded-lg transition-all duration-200 ease-in-out transform active:scale-95 ${className}`}
      onClick={onClick}
    >
      <span className={textClass}>{label}</span>
    </Button>
  );

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-4 text-right h-24 flex flex-col items-end justify-end">
        <p className="text-4xl font-mono break-all line-clamp-1">{displayValue}</p>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {/* Scientific Functions */}
        {renderButton('sin', () => handleScientificFunction('sin'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('cos', () => handleScientificFunction('cos'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('tan', () => handleScientificFunction('tan'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('log', () => handleScientificFunction('log'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('ln', () => handleScientificFunction('ln'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        
        {renderButton(<span>x<sup>y</sup></span>, () => handleOperator('^'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('(', () => handleInput('('), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(')', () => handleInput(')'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<span>x<sup>2</sup></span>, () => handleScientificFunction('sq'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<SquareRoot size={20} />, () => handleScientificFunction('sqrt'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}

        {renderButton('AC', clearInput, 'bg-destructive/20 hover:bg-destructive/40', 'text-destructive')}
        {renderButton('DEL', deleteLast, 'bg-destructive/20 hover:bg-destructive/40', 'text-destructive')}
        {renderButton('π', () => handleScientificFunction('pi'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton('e', () => handleScientificFunction('e'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<Divide size={24} />, () => handleOperator('/'), 'bg-primary/20 hover:bg-primary/40', 'text-primary')}
        
        {renderButton('7', () => handleInput('7'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('8', () => handleInput('8'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('9', () => handleInput('9'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('x!', () => handleScientificFunction('!'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<X size={24} />, () => handleOperator('*'), 'bg-primary/20 hover:bg-primary/40', 'text-primary')}
        
        {renderButton('4', () => handleInput('4'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('5', () => handleInput('5'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('6', () => handleInput('6'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('%', () => handleOperator('%'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<Minus size={24} />, () => handleOperator('-'), 'bg-primary/20 hover:bg-primary/40', 'text-primary')}
        
        {renderButton('1', () => handleInput('1'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('2', () => handleInput('2'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('3', () => handleInput('3'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('+/-', () => handleInput('-'), 'bg-primary/10 hover:bg-primary/20', 'text-primary')}
        {renderButton(<Plus size={24} />, () => handleOperator('+'), 'bg-primary/20 hover:bg-primary/40', 'text-primary')}
        
        {renderButton('0', () => handleInput('0'), 'col-span-2 bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton('.', () => handleInput('.'), 'bg-muted hover:bg-muted/80', 'text-foreground')}
        {renderButton(<Equal size={24} />, calculateResult, 'col-span-2 bg-primary hover:bg-primary/90', 'text-primary-foreground')}
      </div>
    </div>
  );
}

