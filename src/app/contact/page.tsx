
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <Button asChild variant="ghost" className="mb-8">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
      </Button>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Contact Us</CardTitle>
          <CardDescription>We're here to help you with your learning journey.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-3 py-10">
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary"><Mail /></div>
            <h3 className="font-bold">Email</h3>
            <p className="text-sm text-muted-foreground">support@mindmate.app</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary"><Phone /></div>
            <h3 className="font-bold">Phone</h3>
            <p className="text-sm text-muted-foreground">+91 12345 67890</p>
          </div>
          <div className="flex flex-col items-center text-center space-y-2">
            <div className="p-3 bg-primary/10 rounded-full text-primary"><MapPin /></div>
            <h3 className="font-bold">Address</h3>
            <p className="text-sm text-muted-foreground">MindMate HQ, Tech Park, Bangalore, India</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
