
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">Last updated: October 2025</p>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-bold">1. Information We Collect</h2>
            <p>We collect information you provide directly to us when you create an account, such as your name, email address, and profile picture. We use Clerk for secure authentication.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">2. How We Use Your Information</h2>
            <p>We use the information to provide, maintain, and improve our services, including the AI tutoring features, focus tracking, and reward systems.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data. Your payment information is handled securely through Razorpay and never stored on our servers.</p>
          </section>
          <section>
            <h2 className="text-xl font-bold">4. Third-Party Services</h2>
            <p>We use third-party services like Firebase for database management and Razorpay for payment processing. These services have their own privacy policies.</p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
