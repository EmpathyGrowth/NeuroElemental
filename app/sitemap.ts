import { blogPosts } from '@/lib/blog-data';
import { getAllElementSlugs } from '@/lib/elements-data';
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://neuroelemental.com';

  const staticRoutes = [
    '',
    '/about',
    '/assessment',
    '/blog',
    '/certification',
    '/elements',
    '/ethics',
    '/framework',
    '/results',
    '/science',
  ].map((route: string) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  const elementRoutes = getAllElementSlugs().map((slug: string) => ({
    url: `${baseUrl}/elements/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  const blogRoutes = blogPosts.map((post: { slug: string; date: string }) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...elementRoutes, ...blogRoutes];
}






