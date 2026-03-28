
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { LandingPage } from '@/components/landing/landing-page';

/**
 * @fileOverview Sovereign Root Ingress
 * Implements Smart Protocol: Logged-in users are automatically 
 * fast-forwarded to the dashboard to ensure a seamless "Mission Ready" experience.
 */

export const dynamic = 'force-dynamic';

export default function RootPage() {
  const { userId } = auth();

  // Smart Protocol: If user is authenticated, bypass the landing page entirely.
  // This happens at the server level to prevent any UI flicker.
  if (userId) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
