
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Send, MessageSquare, ShieldAlert, Sparkles, CreditCard, LifeBuoy } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

const templates = [
    {
        id: 'payment',
        label: 'Payment Issue',
        icon: CreditCard,
        text: "Hi MindMate Team, I recently tried to purchase a credit pack but the transaction failed/didn't reflect in my account. \n\nTransaction ID: \nAmount: \nDate:"
    },
    {
        id: 'bug',
        label: 'Report a Bug',
        icon: ShieldAlert,
        text: "Found a bug! I noticed that [describe what happened] when I tried to [describe your action]. \n\nDevice/Browser: \nSteps to reproduce:"
    },
    {
        id: 'feature',
        label: 'Feature Request',
        icon: Sparkles,
        text: "I have a great idea for MindMate! It would be amazing if we could have [describe your feature idea] to help us study better."
    },
    {
        id: 'account',
        label: 'Account Help',
        icon: LifeBuoy,
        text: "I'm having trouble with my account settings/access. Specifically, I'm unable to [describe the issue]."
    }
];

export default function ContactUs() {
  const { user } = useUser();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: user?.fullName || '',
    email: user?.primaryEmailAddress?.emailAddress || '',
    category: 'general',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (text: string) => {
    setFormData(prev => ({ ...prev, message: text }));
    toast({ title: "Template Applied", description: "You can now edit the message details." });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
        title: "Message Sent Successfully!",
        description: "Our team will get back to you at " + formData.email + " within 24-48 hours.",
    });
    setFormData(prev => ({ ...prev, message: '' }));
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-primary/30">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 blue-nebula-bg opacity-30" />
      </div>

      <div className="container relative z-10 mx-auto py-12 px-4 max-w-5xl">
        <Button asChild variant="ghost" className="mb-8 text-slate-300 hover:text-white hover:bg-white/10">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/> Back to Home</Link>
        </Button>

        <div className="text-center space-y-4 mb-12">
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-slate-500 bg-clip-text text-transparent"
          >
            Get in Touch
          </motion.h1>
          <p className="text-slate-400 max-w-xl mx-auto">
            Need help with your journey? Our support team is always ready to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Info Cards */}
          <div className="space-y-6">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-primary/20 rounded-xl text-primary"><Mail /></div>
                <div>
                  <h3 className="font-bold">Official Support</h3>
                  <p className="text-sm text-slate-400 break-all">mindmate.contact@gmail.com</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400"><Phone /></div>
                <div>
                  <h3 className="font-bold">Call Center</h3>
                  <p className="text-sm text-slate-400">+91 (Support Hours Only)</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-white/5 backdrop-blur-md border-white/10 text-white">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><MapPin /></div>
                <div>
                  <h3 className="font-bold">Headquarters</h3>
                  <p className="text-sm text-slate-400">Tech Park, Bengaluru, KA, India</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <Card className="lg:col-span-2 bg-white/5 backdrop-blur-md border-white/10 text-white overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="text-primary"/> Send us a message</CardTitle>
              <CardDescription className="text-slate-400">Choose a template to speed up your request.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Templates */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {templates.map(tmp => (
                  <Button 
                    key={tmp.id} 
                    variant="outline" 
                    size="sm" 
                    className="h-auto flex-col py-3 gap-2 border-white/10 bg-white/5 hover:bg-white/10"
                    onClick={() => applyTemplate(tmp.text)}
                  >
                    <tmp.icon className="h-4 w-4 text-primary"/>
                    <span className="text-[10px] uppercase font-bold">{tmp.label}</span>
                  </Button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      className="bg-white/5 border-white/10" 
                      value={formData.name} 
                      onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      className="bg-white/5 border-white/10" 
                      value={formData.email} 
                      onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={v => setFormData(p => ({...p, category: v}))}>
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="payment">Payment/Credits</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    className="bg-white/5 border-white/10 min-h-[150px]" 
                    placeholder="Tell us how we can help..."
                    value={formData.message}
                    onChange={e => setFormData(p => ({...p, message: e.target.value}))}
                    required 
                  />
                </div>
                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="mr-2 animate-spin"/> Processing...</> : <><Send className="mr-2"/> Send Inquiry</>}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
