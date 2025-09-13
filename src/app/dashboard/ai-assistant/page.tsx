
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, ShieldAlert } from 'lucide-react';
import { ChatInterface } from '@/components/ai/chat-interface';

export default function AiAssistantPage() {
  return (
    <div className="h-full">
        <ChatInterface />
    </div>
  );
}
