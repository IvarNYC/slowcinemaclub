import { MetadataRoute } from 'next';
import { getCollection } from '@/lib/mongodb';

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const collection = await getCollection('scc', 'movies');
  const movies = await collection.find({}, {
    projection: {
      title: 1,
      updatedAt: 1,
      year: 1
    }
  }).toArray();

  // Create review page entries
  const reviewPages = movies.map((movie) => ({
    url: `https://slowcinemaclub.com/reviews/${createSlug(movie.title)}`,
    lastModified: movie.updatedAt ? new Date(movie.updatedAt).toISOString() : new Date().toISOString(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add static pages
  const staticPages = [
    {
      url: 'https://slowcinemaclub.com',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: 'https://slowcinemaclub.com/reviews',
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: 'https://slowcinemaclub.com/lists',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
    {
      url: 'https://slowcinemaclub.com/articles',
      lastModified: new Date().toISOString(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

  return [...staticPages, ...reviewPages];
}