
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function RefundPolicy() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Refund & Cancellation Policy</CardTitle>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold">1. Digital Products</h2>
            <p>MindMate primarily sells digital credits and access to premium study materials. Once a purchase is confirmed and credits are added to your account, they are considered consumed.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">2. Refund Eligibility</h2>
            <p>Refunds may be initiated in cases of technical failures where the purchased item was not delivered to the account. Users must report such issues within 48 hours of transaction.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">3. Process</h2>
            <p>To request a refund, please contact us at support@mindmate.app with your transaction ID. Approved refunds will be processed within 5-7 business days to the original payment source.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">4. Cancellations</h2>
            <p>Since we do not offer recurring subscriptions at this time, there is no cancellation required for individual credit pack purchases.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
