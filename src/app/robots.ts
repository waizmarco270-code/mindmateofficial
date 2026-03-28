
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/admin/', '/dashboard/super-admin/', '/dashboard/dev/', '/api/'],
    },
    sitemap: 'https://mindmate.emitygate.com/sitemap.xml',
  };
}
