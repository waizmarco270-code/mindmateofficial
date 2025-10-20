
import { authMiddleware } from "@clerk/nextjs/server";

export default authMiddleware({
  // Making the dashboard and all its sub-routes public.
  // This allows guest users to see the app in a "read-only" mode.
  publicRoutes: ["/", "/sign-in", "/sign-up", "/dashboard(.*)"],
  // Routes that can always be accessed, and have
  // no authentication information
  ignoredRoutes: ['/api/trpc(.*)', '/logo.jpg', '/favicon.ico', '/manifest.json'],
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
