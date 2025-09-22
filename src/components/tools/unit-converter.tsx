
'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Ruler, Scale, Thermometer, Clock, ArrowRightLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

type UnitCategory = 'length' | 'mass' | 'temperature' | 'time';

interface Unit {
    id: string;
    label: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

const UNITS: Record<UnitCategory, Unit[]> = {
    length: [
        { id: 'km', label: 'Kilometer', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'm', label: 'Meter', toBase: v => v, fromBase: v => v },
        { id: 'cm', label: 'Centimeter', toBase: v => v / 100, fromBase: v => v * 100 },
        { id: 'mm', label: 'Millimeter', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'mi', label: 'Mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
        { id: 'yd', label: 'Yard', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
        { id: 'ft', label: 'Foot', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
        { id: 'in', label: 'Inch', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    ],
    mass: [
        { id: 't', label: 'Tonne', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'kg', label: 'Kilogram', toBase: v => v, fromBase: v => v },
        { id: 'g', label: 'Gram', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'mg', label: 'Milligram', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
        { id: 'lb', label: 'Pound', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
        { id: 'oz', label: 'Ounce', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
    ],
    temperature: [
        { id: 'c', label: 'Celsius', toBase: v => v, fromBase: v => v },
        { id: 'f', label: 'Fahrenheit', toBase: v => (v - 32) * 5 / 9, fromBase: v => (v * 9 / 5) + 32 },
        { id: 'k', label: 'Kelvin', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
    time: [
        { id: 'd', label: 'Day', toBase: v => v * 86400, fromBase: v => v / 86400 },
        { id: 'h', label: 'Hour', toBase: v => v * 3600, fromBase: v => v / 3600 },
        { id: 'min', label: 'Minute', toBase: v => v * 60, fromBase: v => v / 60 },
        { id: 's', label: 'Second', toBase: v => v, fromBase: v => v },
    ],
};

const CATEGORY_ICONS: Record<UnitCategory, React.ElementType> = {
    length: Ruler,
    mass: Scale,
    temperature: Thermometer,
    time: Clock,
};

function ConverterInterface({ category }: { category: UnitCategory }) {
    const units = UNITS[category];
    const [fromUnit, setFromUnit] = useState(units[0].id);
    const [toUnit, setToUnit] = useState(units[1].id);
    const [fromValue, setFromValue] = useState('1');

    const convertedValue = useMemo(() => {
        const from = units.find(u => u.id === fromUnit);
        const to = units.find(u => u.id === toUnit);
        const value = parseFloat(fromValue);

        if (!from || !to || isNaN(value)) {
            return '';
        }

        const baseValue = from.toBase(value);
        const finalValue = to.fromBase(baseValue);
        
        // Use more precision for smaller numbers
        if (finalValue > 0 && finalValue < 0.01) {
            return finalValue.toPrecision(4);
        }
        return finalValue.toFixed(2).replace(/\.00$/, ''); // Remove trailing .00

    }, [fromValue, fromUnit, toUnit, units]);
    
    const handleSwap = () => {
        const currentFrom = fromUnit;
        setFromUnit(toUnit);
        setToUnit(currentFrom);
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                <div className="md:col-span-2 space-y-2">
                    <Select value={fromUnit} onValueChange={setFromUnit}>
                        <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                        <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input 
                        type="number" 
                        value={fromValue}
                        onChange={e => setFromValue(e.target.value)}
                        className="h-16 text-4xl font-bold tracking-tighter"
                    />
                </div>

                <div className="flex justify-center">
                     <Button variant="ghost" size="icon" onClick={handleSwap} className="h-12 w-12 hover:bg-primary/10 group">
                        <ArrowRightLeft className="h-6 w-6 text-primary group-hover:rotate-180 transition-transform duration-300"/>
                    </Button>
                </div>
                
                <div className="md:col-span-2 space-y-2">
                    <Select value={toUnit} onValueChange={setToUnit}>
                        <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                        <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}</SelectContent>
                    </Select>
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={convertedValue}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -10, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="h-16 text-4xl font-bold tracking-tighter bg-muted rounded-md flex items-center px-4"
                        >
                            {convertedValue}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export function UnitConverter() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight">Unit Converter</CardTitle>
        <CardDescription>A modern, responsive utility to convert between various common units.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="length" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
            {(Object.keys(UNITS) as UnitCategory[]).map(category => {
                const Icon = CATEGORY_ICONS[category];
                return (
                    <TabsTrigger key={category} value={category} className="py-3 text-base gap-2 capitalize">
                        <Icon className="h-5 w-5"/> {category}
                    </TabsTrigger>
                );
            })}
          </TabsList>
            {(Object.keys(UNITS) as UnitCategory[]).map(category => (
                <TabsContent key={category} value={category} className="pt-8">
                     <ConverterInterface category={category} />
                </TabsContent>
            ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}

