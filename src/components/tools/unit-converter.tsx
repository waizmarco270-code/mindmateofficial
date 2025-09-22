
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Ruler, Scale, Thermometer, Clock, ArrowRightLeft, Square, Cuboid, Gauge, Database, Copy, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UnitCategory = 'length' | 'mass' | 'temperature' | 'time' | 'area' | 'volume' | 'speed' | 'data';

interface Unit {
    id: string;
    label: string;
    toBase: (value: number) => number;
    fromBase: (value: number) => number;
}

const UNITS: Record<UnitCategory, Unit[]> = {
    length: [
        { id: 'm', label: 'Meter', toBase: v => v, fromBase: v => v },
        { id: 'km', label: 'Kilometer', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'cm', label: 'Centimeter', toBase: v => v / 100, fromBase: v => v * 100 },
        { id: 'mm', label: 'Millimeter', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'mi', label: 'Mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
        { id: 'yd', label: 'Yard', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
        { id: 'ft', label: 'Foot', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
        { id: 'in', label: 'Inch', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    ],
    mass: [
        { id: 'kg', label: 'Kilogram', toBase: v => v, fromBase: v => v },
        { id: 't', label: 'Tonne', toBase: v => v * 1000, fromBase: v => v / 1000 },
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
        { id: 's', label: 'Second', toBase: v => v, fromBase: v => v },
        { id: 'd', label: 'Day', toBase: v => v * 86400, fromBase: v => v / 86400 },
        { id: 'h', label: 'Hour', toBase: v => v * 3600, fromBase: v => v / 3600 },
        { id: 'min', label: 'Minute', toBase: v => v * 60, fromBase: v => v / 60 },
    ],
    area: [
        { id: 'sqm', label: 'Square Meter', toBase: v => v, fromBase: v => v },
        { id: 'sqkm', label: 'Square Kilometer', toBase: v => v * 1e6, fromBase: v => v / 1e6 },
        { id: 'sqft', label: 'Square Foot', toBase: v => v / 10.764, fromBase: v => v * 10.764 },
        { id: 'acre', label: 'Acre', toBase: v => v * 4046.86, fromBase: v => v / 4046.86 },
        { id: 'ha', label: 'Hectare', toBase: v => v * 10000, fromBase: v => v / 10000 },
    ],
    volume: [
        { id: 'l', label: 'Liter', toBase: v => v, fromBase: v => v },
        { id: 'ml', label: 'Milliliter', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { id: 'm3', label: 'Cubic Meter', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { id: 'gal', label: 'Gallon (US)', toBase: v => v * 3.78541, fromBase: v => v / 3.78541 },
    ],
    speed: [
        { id: 'mps', label: 'Meter/second', toBase: v => v, fromBase: v => v },
        { id: 'kmh', label: 'Kilometer/hour', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
        { id: 'mph', label: 'Miles/hour', toBase: v => v / 2.237, fromBase: v => v * 2.237 },
    ],
    data: [
        { id: 'b', label: 'Byte', toBase: v => v, fromBase: v => v },
        { id: 'kb', label: 'Kilobyte', toBase: v => v * 1024, fromBase: v => v / 1024 },
        { id: 'mb', label: 'Megabyte', toBase: v => v * 1024**2, fromBase: v => v / 1024**2 },
        { id: 'gb', label: 'Gigabyte', toBase: v => v * 1024**3, fromBase: v => v / 1024**3 },
        { id: 'tb', label: 'Terabyte', toBase: v => v * 1024**4, fromBase: v => v / 1024**4 },
    ]
};

const CATEGORY_ICONS: Record<UnitCategory, React.ElementType> = {
    length: Ruler,
    mass: Scale,
    temperature: Thermometer,
    time: Clock,
    area: Square,
    volume: Cuboid,
    speed: Gauge,
    data: Database,
};

function ConverterInterface({ category }: { category: UnitCategory }) {
    const { toast } = useToast();
    const units = UNITS[category];
    const [fromUnit, setFromUnit] = useState(units[0].id);
    const [toUnit, setToUnit] = useState(units[1].id);
    const [fromValue, setFromValue] = useState('1');
    const [toValue, setToValue] = useState('');
    const [isSwapped, setIsSwapped] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    const handleSwap = () => {
        setIsSwapped(s => !s);
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    }
    
    const handleCopy = () => {
        navigator.clipboard.writeText(toValue);
        setIsCopied(true);
        toast({ title: "Copied to clipboard!" });
        setTimeout(() => setIsCopied(false), 2000);
    }
    
    // Perform conversion whenever inputs change
    useEffect(() => {
        const from = units.find(u => u.id === fromUnit);
        const to = units.find(u => u.id === toUnit);
        const value = parseFloat(fromValue);
        
        if (from && to && !isNaN(value)) {
            const baseValue = from.toBase(value);
            const finalValue = to.fromBase(baseValue);
            
            // Format result to avoid excessive decimals but keep precision for small numbers
            const resultString = (finalValue > 0 && finalValue < 0.001) 
                ? finalValue.toPrecision(4) 
                : finalValue.toFixed(4).replace(/\.0000$/, '').replace(/(\.\d*?[1-9])0+$/, '$1');

            setToValue(resultString);
        } else {
            setToValue('');
        }
    }, [fromValue, fromUnit, toUnit, units]);

    const InputCard = ({
        isFrom,
        unit,
        setUnit,
        value,
        setValue
    }: {
        isFrom: boolean;
        unit: string;
        setUnit: (u: string) => void;
        value: string;
        setValue?: (v: string) => void;
    }) => (
        <Card className="bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">{isFrom ? 'From' : 'To'}</span>
                {isFrom ? null : (
                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}>
                        {isCopied ? <Check className="h-4 w-4 text-green-500"/> : <Copy className="h-4 w-4"/>}
                    </Button>
                )}
            </div>
             <div className="grid grid-cols-2 gap-2">
                <Input 
                    type="number" 
                    value={value}
                    onChange={isFrom ? (e) => setValue?.(e.target.value) : undefined}
                    readOnly={!isFrom}
                    className="h-14 text-2xl font-bold tracking-tighter border-0 bg-transparent read-only:focus-visible:ring-0 read-only:focus-visible:ring-offset-0"
                    placeholder="0"
                />
                 <Select value={unit} onValueChange={setUnit}>
                    <SelectTrigger className="h-14 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.label}</SelectItem>)}</SelectContent>
                </Select>
            </div>
        </Card>
    );

    const fromProps = { isFrom: true, unit: fromUnit, setUnit: setFromUnit, value: fromValue, setValue: setFromValue };
    const toProps = { isFrom: false, unit: toUnit, setUnit: setToUnit, value: toValue };

    const firstCard = isSwapped ? toProps : fromProps;
    const secondCard = isSwapped ? fromProps : toProps;


    return (
       <div className="relative flex flex-col md:flex-row items-center justify-center gap-6">
            <motion.div layout className="w-full md:w-2/5">
                <InputCard {...firstCard} />
            </motion.div>

            <motion.div layout className="absolute md:relative z-10">
                <Button variant="outline" size="icon" className="rounded-full h-12 w-12 bg-background shadow-md hover:bg-primary hover:text-primary-foreground transition-transform hover:rotate-180" onClick={handleSwap}>
                    <ArrowRightLeft className="h-5 w-5"/>
                </Button>
            </motion.div>
            
            <motion.div layout className="w-full md:w-2/5">
                <InputCard {...secondCard} />
            </motion.div>
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
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 h-auto">
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
