
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Terms & Conditions</CardTitle>
          <p className="text-sm text-muted-foreground">Effective Date: October 2, 2025</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold">1. Acceptance of Terms</h2>
            <p>By accessing and using MindMate, you agree to comply with and be bound by these Terms and Conditions.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">2. Service Description</h2>
            <p>MindMate is an educational platform providing study tools, AI-powered assistance, and curated resources for students.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">3. User Conduct</h2>
            <p>Users must use the platform for educational purposes only. Any abuse of features, including the reward system or AI assistant, will result in account suspension.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">4. Credits & Payments</h2>
            <p>Credits purchased on MindMate are non-transferable and intended for unlocking digital content within the app.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
