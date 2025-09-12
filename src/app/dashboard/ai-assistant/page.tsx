
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, ShieldAlert } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div className="flex h-full items-center justify-center">
      <Card className="w-full max-w-lg text-center border-amber-500/50 bg-amber-500/5">
        <CardHeader className="items-center">
          <div className="p-4 rounded-full bg-primary/10 mb-2 border-2 border-dashed border-primary/20">
            <Bot className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
            Marco AI is Under Maintenance
          </CardTitle>
          <CardDescription>We're making things even better!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Marco is currently being upgraded with some awesome new features and might be unavailable for 2-3 days.
          </p>
          <p className="font-semibold">
            We promise it will be worth the wait! Thank you for your patience.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
