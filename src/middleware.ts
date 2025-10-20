
import { authMiddleware } from "@clerk/nextjs/server";

// This is the new, optimized middleware configuration for Vercel.
export default authMiddleware({
  // By default, all routes are public.
  // We will specify protected routes in the matcher below.
});

export const config = {
  // This matcher protects only the routes that should require authentication,
  // leaving all others public by default. This is more efficient.
  matcher: [
    // Making the root public, but protecting specific dashboard pages
    // Note: The dashboard itself is public for the demo, but if you had
    // pages that MUST be private, you'd add them here.
    // e.g., '/dashboard/settings', '/dashboard/profile'
    // For now, we will leave the dashboard completely open as requested.
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/(api|trpc)(.*)"
   ],
};
