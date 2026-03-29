
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * @fileOverview Sovereign Security Middleware
 * Implements Clerk v5 clerkMiddleware protocol for optimized route protection.
 */

// Define which routes are accessible without authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/refund",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/cron/send-scheduled-notifications",
  "/api/webhooks/razorpay"
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
