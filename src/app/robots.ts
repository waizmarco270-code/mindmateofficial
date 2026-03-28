import { MetadataRoute } from 'next';

/**
 * @fileOverview Robots.txt configuration for MindMate.emitygate.com
 * Optimized for top-tier Google SEO ranking and authority.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/about',
        '/contact',
        '/dashboard/guide',
      ],
      disallow: [
        '/dashboard/admin/',
        '/dashboard/super-admin/',
        '/dashboard/dev/',
        '/dashboard/spanel/',
        '/api/',
        '/_next/',
        '/sign-in',
        '/sign-up',
      ],
    },
    sitemap: 'https://mindmate.emitygate.com/sitemap.xml',
  };
}