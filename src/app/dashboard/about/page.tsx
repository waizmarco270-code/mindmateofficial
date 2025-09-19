'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Info, Lightbulb, Heart, Code } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

// This is now a component, not a default export page
export default function AboutContent() {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="text-yellow-500" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">
            At MindMate, our mission is to make learning more engaging, efficient, and rewarding. We believe that with the right tools and a supportive community, every student can unlock their full potential. We're dedicated to building a platform that not only helps you study smarter but also makes the journey of education a more enjoyable and motivating experience.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="text-rose-500" />
            Meet the Developers
          </CardTitle>
          <CardDescription>The minds behind the code.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src="https://picsum.photos/seed/waiz/200" alt="WaizMarco" data-ai-hint="male developer portrait" />
              <AvatarFallback>WM</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">WaizMarco</h3>
            <p className="text-sm font-medium text-primary">Lead Developer & Architect</p>
            <p className="text-muted-foreground mt-2">The original creator of MindMate, responsible for the core architecture, backend systems, and overall project vision.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-primary">
              <AvatarImage src="https://picsum.photos/seed/msm/200" alt="Msm" data-ai-hint="male developer portrait" />
              <AvatarFallback>Msm</AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">Msm</h3>
            <p className="text-sm font-medium text-primary">Frontend & UI/UX Specialist</p>
            <p className="text-muted-foreground mt-2">Focused on creating the user-friendly interfaces, seamless experiences, and the visual design that brings MindMate to life.</p>
          </div>
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="text-green-500" />
            Our Technology
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            MindMate is built with a modern tech stack to provide a fast, reliable, and scalable experience. We leverage the power of Next.js and React for the frontend, Firebase for our backend database and authentication, and ShadCN UI for our component library.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
