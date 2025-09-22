'use client';

import { Calculator } from '@/components/calculator/calculator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function CalculatorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scientific Calculator</h1>
        <p className="text-muted-foreground">A modern calculator for your daily needs.</p>
      </div>
      <div className="flex justify-center">
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Calculator</CardTitle>
            </CardHeader>
            <CardContent>
                <Calculator />
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
